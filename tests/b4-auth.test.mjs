// Hanya akun sintetis pada server BE tiruan lokal; tidak menghubungi BE sekolah.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer, request as httpRequest } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../lib/auth.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const auth = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const catalogCompiled = ts.transpileModule(await readFile(new URL("../lib/b4-scholarships.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const catalog = await import(`data:text/javascript;base64,${Buffer.from(catalogCompiled).toString("base64")}`);

test("katalog memetakan paginator dan menjaga filter tanpa mengarang tanggal atau durasi", () => {
  const payload = { data: [{ id: 1, nama_beasiswa: "Program Sintetis", jenjang: "Keduanya", is_active: true, private_note: "tidak diteruskan" }], current_page: 1, last_page: 1, per_page: 20, total: 1 };
  const page = catalog.parseScholarshipPage(payload);
  assert.equal(page.perPage, 20);
  assert.equal(page.data[0].opens, null);
  assert.equal(catalog.scholarshipPeriod(page.data[0]), "Belum tercatat");
  assert.equal("private_note" in page.data[0], false);
  assert.equal("duration" in page.data[0], false);
  const query = new URLSearchParams(catalog.scholarshipQuery(" prestasi & seni ", "Keduanya", 2));
  assert.equal(query.get("search"), "prestasi & seni");
  assert.equal(query.get("jenjang"), "Keduanya");
  assert.equal(query.get("page"), "2");
  assert.throws(() => catalog.parseScholarshipPage({ ...payload, per_page: "20" }));
  assert.throws(() => catalog.parseScholarshipPage({ ...payload, data: [{ ...payload.data[0], is_active: "false" }] }));
});

test("identifier NISN mempertahankan nol awal dan hanya menerima satu identifier", () => {
  assert.deepEqual(auth.loginIdentifier("0012345678"), { nisn: "0012345678" });
  assert.deepEqual(auth.loginIdentifier(" admin@example.test "), { email: "admin@example.test" });
  for (const invalid of ["1234", "00123456789", "admin", "a@", ""]) assert.equal(auth.loginIdentifier(invalid), null);
});

test("akses guru biasa, guru BK, dan akun belum terverifikasi dibedakan", () => {
  const user = { id: 1, full_name: "Akun Sintetis", email: "uji@example.test", role: "guru", email_verified: true };
  assert.equal(auth.loginDestination(auth.toUserProfile(user)), "/profile");
  assert.equal(auth.loginDestination(auth.toUserProfile({ ...user, school_staff: true, school_role: "bk" })), "/admin/alumni-perguruan-tinggi");
  assert.equal(auth.loginDestination(auth.toUserProfile({ ...user, school_staff: true, email_verified: false })), "/profile");
  assert.equal(auth.loginDestination(auth.toUserProfile({ ...user, role: "siswa" })), "/siswa/jejak-alumni");
  assert.equal(auth.isApiUser({ ...user, school_staff: "true" }), false);
  assert.equal(auth.isApiUser({ ...user, role: "superadmin" }), false);
});

let nextProcess, baseUrl, origin, backend, fixtureUrl, releaseBrowser;
const browserFinished = new Promise((done) => { releaseBrowser = done; });
let backendRequests = 0, lastLogin, lastCatalog;
const sessions = new Map();
let counter = 0;

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

before(async () => {
  backend = createServer(async (req, res) => {
    if (req.url === "/__test/finish" && req.method === "POST") {
      res.end("Pemeriksaan browser selesai.");
      releaseBrowser();
      return;
    }
    if (req.url === "/__test/revoke" && req.method === "POST") {
      sessions.clear();
      res.end("Sesi sintetis dicabut.");
      return;
    }
    backendRequests++;
    const send = (status, data) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(data)); };
    const token = req.headers.authorization?.replace(/^Bearer /, "");
    if (req.url === "/api/login" && req.method === "POST") {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      lastLogin = JSON.parse(raw);
      const name = lastLogin.email?.split("@")[0] ?? "siswa";
      if (lastLogin.password === "salah") return send(401, { message: "Akun atau kata sandi tidak cocok." });
      if (name === "rate-limit") return send(429, { message: "Tunggu sebelum mencoba lagi." });
      if (name === "unavailable") return send(503, { message: "Detail internal tidak boleh diteruskan." });
      if (name === "validation") return send(422, { message: "Input tidak valid.", errors: { email: ["Email tidak valid."], internal: ["Privat"] } });
      const user = {
        id: ++counter, full_name: "Akun Uji Sintetis", email: lastLogin.email ?? "siswa@example.test",
        role: name === "admin" ? "administrator" : name.startsWith("guru") ? "guru" : "siswa",
        email_verified: name !== "unverified", school_staff: name === "guru-bk" || name === "admin",
        school_role: name === "guru-bk" ? "bk" : null,
      };
      const issuedToken = `synthetic-session-${counter}`;
      sessions.set(issuedToken, { user, mode: name });
      return send(200, { user: name === "spoof" ? { ...user, role: "administrator" } : user, token: issuedToken,
        expires_at: new Date(Date.now() + (name === "expired" ? -60_000 : 3_600_000)).toISOString() });
    }
    const session = sessions.get(token);
    if (!session) return send(401, { message: "Sesi tidak berlaku." });
    if (req.url === "/api/me") {
      if (session.mode === "invalid-me") return send(200, { role: "administrator" });
      return send(200, { ...session.user, token: "not-for-the-browser", private_note: "tidak diteruskan" });
    }
    if (req.url === "/api/logout") {
      if (session.mode === "logout-fails") return send(503, { message: "Tidak tersedia." });
      sessions.delete(token);
      return send(200, { message: "Logout berhasil." });
    }
    if (req.url === "/api/beasiswa" || req.url.startsWith("/api/beasiswa?")) {
      assert.equal(req.method, "GET");
      if (!session.user.email_verified || !(session.user.role === "administrator" || session.user.school_staff)) return send(403, { message: "Tidak diizinkan." });
      lastCatalog = new URL(req.url, "http://fixture.invalid").searchParams;
      if (lastCatalog.get("search") === "server-fails") return send(503, { message: "detail internal privat" });
      if (lastCatalog.get("search") === "rate-limit") return send(429, { message: "detail internal privat" });
      if (lastCatalog.get("search") === "malformed") return send(200, { data: [], debug: "detail internal privat" });
      if (lastCatalog.get("search") === "empty") return send(200, { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 });
      const page = Number(lastCatalog.get("page") ?? 1);
      const rows = Array.from({ length: page === 1 ? 20 : 1 }, (_, index) => ({
        id: (page - 1) * 20 + index + 1, nama_beasiswa: `Program Sintetis ${(page - 1) * 20 + index + 1}`,
        jenjang: lastCatalog.get("jenjang") || "Kuliah", is_active: true, tanggal_buka: "2026-07-01", tanggal_tutup: "2026-08-31",
        private_note: "tidak diteruskan",
      }));
      return send(200, { data: rows, current_page: page, last_page: 2, per_page: 20, total: 21, next_page_url: "http://fixture.invalid/private" });
    }
    send(404, { message: "Tidak ditemukan." });
  });
  const backendPort = await listen(backend);
  fixtureUrl = `http://127.0.0.1:${backendPort}`;
  const reservation = createServer();
  const port = await listen(reservation);
  await new Promise((done) => reservation.close(done));
  origin = `http://127.0.0.1:${port}`;
  baseUrl = `${origin}/api/auth`;
  nextProcess = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: process.cwd(), env: { ...process.env, API_BASE_URL: `http://127.0.0.1:${backendPort}/api`, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "ignore", "ignore"], windowsHide: true,
  });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (nextProcess.exitCode !== null) throw new Error("Server Next.js pengujian berhenti sebelum siap.");
    try { const response = await fetch(`${baseUrl}/me`); if (response.status === 401) return; } catch { /* Tunggu server uji lokal siap. */ }
    await new Promise((done) => setTimeout(done, 100));
  }
  throw new Error("Server Next.js pengujian belum siap.");
});

after(async () => {
  if (process.env.B4_AUTH_BROWSER_CHECK === "1") {
    console.log(`Server pemeriksaan browser lokal: ${origin}/login`);
    console.log(`Penutup fixture lokal: ${fixtureUrl}/__test/finish (POST)`);
    await Promise.race([browserFinished, new Promise((done) => { setTimeout(done, 900_000).unref(); })]);
  }
  if (nextProcess && nextProcess.exitCode === null) { nextProcess.kill(); await once(nextProcess, "exit"); }
  if (backend) { backend.closeAllConnections(); await new Promise((done) => backend.close(done)); }
});

function post(path, body = {}, headers = {}) {
  return fetch(`${baseUrl}/${path}`, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
}
async function login(name = "admin") {
  const response = await post("login", { email: `${name}@example.test`, password: "Khusus-fixture!2026" });
  const cookie = response.headers.get("set-cookie");
  return { response, cookie, pair: cookie?.split(";")[0], payload: await response.json() };
}

test("katalog menolak tamu, siswa, filter invalid dan metode tulis", async () => {
  const url = `${origin}/api/b4/beasiswa`;
  const beforeRequests = backendRequests;
  assert.equal((await fetch(url)).status, 401);
  assert.equal(backendRequests, beforeRequests);
  const student = await login("siswa");
  assert.equal((await fetch(url, { headers: { Cookie: student.pair } })).status, 403);
  const admin = await login();
  const beforeValidation = backendRequests;
  for (const query of ["page=0", "page=1.5", "jenjang=Kuliah+%26+SMA", "page=1&page=2", "url=https://other.invalid", `search=${"a".repeat(101)}`]) {
    assert.equal((await fetch(`${url}?${query}`, { headers: { Cookie: admin.pair } })).status, 422);
  }
  assert.equal(backendRequests, beforeValidation);
  assert.equal((await fetch(url, { method: "POST", headers: { Cookie: admin.pair } })).status, 405);
});

test("katalog memakai Bearer server, 20 baris dan filter tetap pada halaman kedua", async () => {
  const admin = await login();
  for (const page of [1, 2]) {
    const response = await fetch(`${origin}/api/b4/beasiswa?${catalog.scholarshipQuery("prestasi & seni", "Keduanya", page)}`, { headers: { Cookie: admin.pair } });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("cache-control"), /no-store/);
    const payload = await response.json();
    assert.equal(payload.data.length, page === 1 ? 20 : 1);
    assert.equal(payload.currentPage, page);
    assert.equal(payload.total, 21);
    assert.equal(payload.data[0].level, "Keduanya");
    assert.equal("private_note" in payload.data[0], false);
    assert.equal("next_page_url" in payload, false);
    assert.equal(lastCatalog.get("search"), "prestasi & seni");
    assert.equal(lastCatalog.get("jenjang"), "Keduanya");
  }
});

test("katalog membedakan hasil kosong, server gagal, rate limit dan respons tidak sesuai", async () => {
  const admin = await login();
  for (const [search, status] of [["empty", 200], ["server-fails", 503], ["rate-limit", 429], ["malformed", 502]]) {
    const response = await fetch(`${origin}/api/b4/beasiswa?search=${search}`, { headers: { Cookie: admin.pair } });
    assert.equal(response.status, status);
    const payload = await response.json();
    if (search === "empty") assert.equal(payload.total, 0);
    assert.equal(JSON.stringify(payload).includes("detail internal privat"), false);
  }
  const response = await fetch(`${origin}/api/b4/beasiswa`, { headers: { Cookie: "eightracer_session=expired-synthetic-token" } });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).session_expired, true);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
});

test("proxy menolak role, identifier ganda, NISN angka, origin asing, dan form non-JSON sebelum BE", async () => {
  const beforeRequests = backendRequests;
  for (const payload of [
    { email: "admin@example.test", nisn: "0012345678", password: "sintetis" },
    { email: "admin@example.test", password: "sintetis", role: "administrator" },
    { nisn: 12345678, password: "sintetis" },
    { email: "admin", password: "sintetis" },
  ]) assert.equal((await post("login", payload)).status, 422);
  assert.equal((await post("login", {}, { Origin: "https://other.example.test" })).status, 403);
  assert.equal((await post("login", {}, { "Content-Type": "text/plain" })).status, 415);
  assert.equal(backendRequests, beforeRequests);
});

test("login memakai sumber /me, memberi cookie HttpOnly, dan tidak mengekspos token", async () => {
  const result = await login("spoof");
  assert.equal(result.response.status, 200);
  assert.equal(result.payload.user.role, "siswa");
  assert.ok(/HttpOnly/i.test(result.cookie));
  assert.ok(/SameSite=lax/i.test(result.cookie));
  assert.ok(/Expires=/i.test(result.cookie));
  assert.ok(result.response.headers.get("cache-control").includes("no-store"));
  assert.equal("token" in result.payload, false);
  assert.equal("token" in result.payload.user, false);
  assert.equal("private_note" in result.payload.user, false);
  const restored = await fetch(`${baseUrl}/me`, { headers: { Cookie: result.pair } });
  assert.equal(restored.status, 200);
  assert.equal((await restored.json()).user.role, "siswa");
});

test("login NISN mengirim string dengan nol awal tanpa email atau role", async () => {
  const response = await post("login", { nisn: "0012345678", password: "Khusus-fixture!2026" });
  assert.equal(response.status, 200);
  assert.equal(lastLogin.nisn, "0012345678");
  assert.equal("email" in lastLogin, false);
  assert.equal("role" in lastLogin, false);
});

test("cookie sesi produksi pada host nonlokal wajib Secure", async () => {
  // http.request mempertahankan Host uji; fetch dapat menggantinya dengan host URL.
  const result = await new Promise((done, reject) => {
    const request = httpRequest(`${baseUrl}/login`, { method: "POST", headers: {
      Host: "school.example.test", Origin: "http://school.example.test", "Content-Type": "application/json",
    } }, (response) => { response.resume(); done({ status: response.statusCode, cookie: response.headers["set-cookie"]?.join(";") ?? "" }); });
    request.on("error", reject);
    request.end(JSON.stringify({ email: "admin@example.test", password: "Khusus-fixture!2026" }));
  });
  assert.equal(result.status, 200);
  assert.ok(/; Secure(?:;|$)/i.test(result.cookie));
});

test("401, 422, 429, dan gangguan backend ditampilkan sebagai kegagalan", async () => {
  assert.equal((await post("login", { email: "uji@example.test", password: "salah" })).status, 401);
  const validation = await login("validation");
  assert.equal(validation.response.status, 422);
  assert.deepEqual(validation.payload.errors, { email: ["Email tidak valid."] });
  assert.equal((await login("rate-limit")).response.status, 429);
  const unavailable = await login("unavailable");
  assert.equal(unavailable.response.status, 503);
  assert.ok(!JSON.stringify(unavailable.payload).includes("Detail internal"));
});

test("respons /me cacat dan expiry kedaluwarsa tidak membuat sesi baru", async () => {
  for (const name of ["invalid-me", "expired"]) {
    const result = await login(name);
    assert.equal(result.response.status, 502);
    assert.equal(result.cookie, null);
  }
});

test("guru BK dibaca dari grant backend dan guru biasa tidak mendapat akses staff", async () => {
  const teacher = (await login("guru")).payload.user;
  const bk = (await login("guru-bk")).payload.user;
  assert.equal(auth.toUserProfile(teacher).schoolStaff, false);
  assert.equal(auth.toUserProfile(bk).schoolStaff, true);
});

test("logout mencabut token di BE dan cookie, lalu sesi lama ditolak", async () => {
  const result = await login();
  const logout = await post("logout", {}, { Cookie: result.pair });
  assert.equal(logout.status, 200);
  assert.ok(/Max-Age=0/i.test(logout.headers.get("set-cookie")));
  const stale = await fetch(`${baseUrl}/me`, { headers: { Cookie: result.pair } });
  assert.equal(stale.status, 401);
  assert.equal((await stale.json()).session_expired, true);
  assert.ok(/Max-Age=0/i.test(stale.headers.get("set-cookie")));
});

test("logout saat BE gagal tetap menutup cookie lokal dan melaporkan kegagalan pencabutan", async () => {
  const result = await login("logout-fails");
  const logout = await post("logout", {}, { Cookie: result.pair });
  assert.equal(logout.status, 503);
  assert.equal((await logout.json()).local_session_cleared, true);
  assert.ok(/Max-Age=0/i.test(logout.headers.get("set-cookie")));
});
