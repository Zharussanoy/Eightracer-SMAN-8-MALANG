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
const alumniCompiled = ts.transpileModule(await readFile(new URL("../lib/b4-alumni.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const alumni = await import(`data:text/javascript;base64,${Buffer.from(alumniCompiled).toString("base64")}`);

test("katalog memetakan paginator dan menjaga filter tanpa mengarang tanggal atau durasi", () => {
  const payload = { data: [{ id: 1, nama_beasiswa: "Program Sintetis", jenjang: "Keduanya", is_active: true, private_note: "tidak diteruskan" }], current_page: 1, last_page: 1, per_page: 20, total: 1 };
  const page = catalog.parseScholarshipPage(payload);
  assert.equal(page.perPage, 20);
  assert.equal(page.data[0].opens, null);
  assert.equal(catalog.scholarshipPeriod(page.data[0]), "Belum tercatat");
  assert.equal("private_note" in page.data[0], false);
  assert.equal(page.data[0].duration, null);
  const editable = catalog.parseScholarshipRow({ ...payload.data[0], kriteria: [{ nama_kriteria: "TKA", tipe_kriteria: "nilai_tka", operator: ">=", nilai_kriteria: "80", bobot: "2.50" }] });
  assert.equal(editable.input.kriteria[0].bobot, 2.5);
  assert.equal("program_eligibilitas_id" in editable.input, false);
  assert.equal("deskripsi" in editable.input, false);
  assert.equal(catalog.scholarshipDuration(catalog.parseScholarshipRow({ ...payload.data[0], durasi: "8", satuan_durasi: "semester" })), "8 Semester");
  for (const invalid of ["8 bulan", "", "-1", "1.5"]) assert.equal(catalog.parseScholarshipRow({ ...payload.data[0], durasi: invalid }).duration, null);
  const query = new URLSearchParams(catalog.scholarshipQuery(" prestasi & seni ", "Keduanya", 2));
  assert.equal(query.get("search"), "prestasi & seni");
  assert.equal(query.get("jenjang"), "Keduanya");
  assert.equal(query.get("page"), "2");
  assert.throws(() => catalog.parseScholarshipPage({ ...payload, per_page: "20" }));
  assert.throws(() => catalog.parseScholarshipPage({ ...payload, data: [{ ...payload.data[0], is_active: "false" }] }));
});

test("status pendaftaran mengikuti BE tanpa menghitung tanggal lokal dan tidak masuk payload simpan", () => {
  const source = { id: 1, nama_beasiswa: "Status Sintetis", jenjang: "SMA", is_active: true,
    status_program: "aktif", tanggal_buka: "2026-09-01T00:00:00.000000Z", tanggal_tutup: "2026-10-31T00:00:00.000000Z", kriteria: [] };
  const labels = { tidak_tersedia: "Tidak tersedia", ditutup: "Ditutup", belum_dibuka: "Belum dibuka", dibuka: "Dibuka", belum_ditentukan: "Jadwal belum ditentukan" };
  for (const [status, label] of Object.entries(labels)) {
    const row = catalog.parseScholarshipRow({ ...source, status_pendaftaran: status });
    assert.equal(catalog.scholarshipRegistrationLabel(row), label);
    assert.equal(row.opens, "2026-09-01");
    assert.equal(row.input.tanggal_tutup, "2026-10-31");
    assert.equal("status_program" in row.input, false);
    assert.equal("status_pendaftaran" in row.input, false);
  }
  for (const status of [undefined, null, "status_baru"]) {
    assert.equal(catalog.scholarshipRegistrationLabel(catalog.parseScholarshipRow({ ...source, status_pendaftaran: status })), "Jadwal belum ditentukan");
  }
  const archived = catalog.parseScholarshipRow({ ...source, is_active: false, status_program: "diarsipkan", status_pendaftaran: "tidak_tersedia" });
  assert.equal(archived.programStatus, "diarsipkan");
  assert.equal(catalog.scholarshipRegistrationLabel(archived), "Tidak tersedia");
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
let backendRequests = 0, lastLogin, lastCatalog, lastAnalytics, lastDashboard, lastStudents, lastPreview, lastPdf;
const sessions = new Map();
let counter = 0;
const savedScholarships = new Map();
let scholarshipCounter = 1000, writes = 0;
const writeInput = (name = "CRUD Program Uji") => ({ nama_beasiswa: name, jenjang: "Keduanya", durasi: 8, satuan_durasi: "semester", periode_apply: "Juli - Agustus", is_active: true,
  kriteria: [{ nama_kriteria: "TKA minimum", tipe_kriteria: "nilai_tka", operator: ">=", nilai_kriteria: "80", bobot: 1 }] });

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
    if (req.url === "/api/buku-alumni/pdf" || req.url.startsWith("/api/buku-alumni/pdf?")) {
      assert.equal(req.method, "GET");
      if (!session.user.email_verified || !session.user.school_staff) return send(403, { message: "Tidak diizinkan." });
      lastPdf = new URL(req.url, "http://fixture.invalid").searchParams;
      if (lastPdf.get("program_studi") === "Gagal") return send(503, { message: "detail internal privat" });
      if (lastPdf.get("program_studi") === "Rusak") { res.writeHead(200, { "Content-Type": "text/html" }); return res.end("bukan PDF"); }
      res.writeHead(200, { "Content-Type": "application/pdf" });
      return res.end("%PDF-1.4\n% Berkas sintetis untuk pengujian transport API\n%%EOF");
    }
    if (req.url === "/api/siswa" || req.url.startsWith("/api/siswa?")) {
      assert.equal(req.method, "GET");
      if (!session.user.email_verified || !session.user.school_staff) return send(403, { message: "Tidak diizinkan." });
      lastStudents = new URL(req.url, "http://fixture.invalid").searchParams;
      const empty = lastStudents.get("search") === "empty";
      return send(200, { status: "success", data: { current_page: Number(lastStudents.get("page") ?? 1), last_page: empty ? 1 : 2, per_page: Number(lastStudents.get("per_page") ?? 20), total: empty ? 0 : 21,
        data: empty ? [] : [{ id: 41, nama_lengkap: "Siswa Sintetis", tahun_lulus: 2026, nisn: "privat", registration_email: "privat", keluarga: { penghasilan: 12345 } }] } });
    }
    if (/^\/api\/siswa\/\d+\/rekomendasi-beasiswa\/preview(?:\?|$)/.test(req.url)) {
      assert.equal(req.method, "GET");
      if (!session.user.email_verified || !session.user.school_staff) return send(403, { message: "Tidak diizinkan." });
      const url = new URL(req.url, "http://fixture.invalid");
      lastPreview = { id: Number(url.pathname.split("/")[3]), level: url.searchParams.get("target_jenjang") };
      if (lastPreview.id === 999) return send(404, { message: "Tidak ditemukan." });
      if (lastPreview.id === 997) return send(200, { data: {} });
      return send(200, { data: { target_jenjang: lastPreview.id === 998 ? "SMA" : lastPreview.level,
        pemeringkatan_ml: { status: "fallback", alasan_status: "Data teks sintetis belum cukup", model_hash: "privat" },
        kandidat: lastPreview.level === "Kuliah" ? [] : [{ beasiswa_id: 101, beasiswa: { nama_beasiswa: "Program Sintetis", jenjang: "Keduanya", penyelenggara: "Penyelenggara Sintetis", durasi: "8", satuan_durasi: "semester", periode_apply: "September–Oktober", tanggal_buka: null, tanggal_tutup: null },
          evaluasi: { skor: 0, lengkap: false, memenuhi: false, checklist: [{ kriteria: "Nilai minimum", operator: ">=", syarat: "85", status: "belum_dinilai" }], pemeringkatan_ml: { status: "fallback", skor_kemiripan: null, peringkat: 1, model_hash: "privat" } } }] } });
    }
    if (["/api/analitik-beasiswa", "/api/dashboard/ukt-ipk"].some((path) => req.url === path || req.url.startsWith(`${path}?`))) {
      assert.equal(req.method, "GET");
      if (!session.user.email_verified || !session.user.school_staff) return send(403, { message: "Tidak diizinkan." });
      const url = new URL(req.url, "http://fixture.invalid");
      if ([url.searchParams.get("prodi"), url.searchParams.get("program_studi")].includes("Gagal")) return send(503, { message: "detail internal privat" });
      if (url.pathname.includes("dashboard")) {
        lastDashboard = url.searchParams;
        const stats = { jumlah_diketahui: 0, jumlah_belum_tercatat: 12, minimum: null, maksimum: null, rata_rata: null };
        return send(200, { data: { jumlah_alumni: 12, ukt: stats, ipk: stats, per_kampus_prodi: [], tren_ipk: [], private_note: "privat" } });
      }
      lastAnalytics = url.searchParams;
      if (lastAnalytics.get("prodi") === "Rusak") return send(200, { data: {} });
      return send(200, { data: { as_of: "2026-11-04", jumlah_alumni_tercatat: 12, jumlah_penerima_kipk: 2, distribusi_beasiswa: [], per_angkatan: [], tren_periode: [], private_note: "privat" } });
    }
    if (/^\/api\/beasiswa\/\d+$/.test(req.url) && req.method === "GET") {
      if (!session.user.email_verified || !session.user.school_staff) return send(403, { message: "Tidak diizinkan." });
      const id = Number(req.url.split("/").at(-1));
      if (id === 999) return send(404, { message: "Tidak ditemukan." });
      const record = savedScholarships.get(id) ?? { ...writeInput("Program Detail Sintetis"), id, durasi: "8", tanggal_buka: "2026-09-01T00:00:00.000000Z", tanggal_tutup: "2026-10-31T00:00:00.000000Z" };
      return send(200, { data: id === 998 ? { ...record, kriteria: undefined } : record });
    }
    if (req.url.startsWith("/api/study-tracer?")) {
      assert.equal(req.method, "GET");
      if (!session.user.school_staff) return send(403, { message: "Tidak diizinkan." });
      const query = new URL(req.url, "http://fixture.invalid").searchParams;
      assert.equal(query.get("per_page"), "20");
      if (query.get("search") === "malformed") return send(200, { data: [{ id: 99 }], current_page: 1, last_page: 1, per_page: 20, total: 1 });
      if (query.get("search") === "empty") return send(200, { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 });
      return send(200, { data: [{ id: 31, siswa_id: 71, siswa: { id: 71, nama_lengkap: "Alumni Sintetis", nisn: "privat", no_wa: "privat" }, perguruan_tinggi: { id: 5, nama_pt: "Kampus Sintetis" }, perguruan_tinggi_id: 5, program_studi: "Informatika", jalur_masuk: "SNBT", tahun_masuk_pt: 2024, status_penerimaan: "diterima" }], current_page: Number(query.get("page") ?? 1), last_page: 2, per_page: 20, total: 21 });
    }
    if (/^\/api\/alumni\/\d+\/timeline$/.test(req.url)) {
      assert.equal(req.method, "GET");
      if (!session.user.school_staff) return send(403, { message: "Tidak diizinkan." });
      if (req.url.includes("/31/")) return send(404, { message: "ID penerimaan bukan ID siswa." });
      if (req.url.includes("/999/")) return send(200, { data: { unsupported: true } });
      return send(200, { data: [{ study_tracer_id: 31, events: [{ type: "lulus_sma", date: null, year: 2024, label: "Lulus SMA", granularity: "year" }, { type: "progress", data: { id: 42, semester: 2, periode: "Genap 2024/2025", ipk_terkini: "3.80", nominal_ukt: null, nominal_ipi: "0", penerima_kipk: false, tanggal_update: "2025-06-20", is_current: true, beasiswa: [{ nama_beasiswa: "Beasiswa Sintetis", status_beasiswa: "proses", nominal_beasiswa: 1000000 }] } }] }] });
    }
    if ((req.url === "/api/beasiswa" && req.method === "POST") || /^\/api\/beasiswa\/\d+$/.test(req.url)) {
      if (!session.user.email_verified || !(session.user.role === "administrator" || session.user.school_staff)) return send(403, { message: "Tidak diizinkan." });
      writes++;
      if (req.method === "DELETE") {
        const record = savedScholarships.get(Number(req.url.split("/").at(-1)));
        if (!record) return send(404, { message: "Tidak ditemukan." });
        record.is_active = false;
        return send(200, { message: "Diarsipkan." });
      }
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const input = JSON.parse(raw);
      if (input.nama_beasiswa === "validation") return send(422, { message: "Validasi gagal.", errors: { penyelenggara: ["Penyelenggara wajib diisi."], "kriteria.0.tipe_kriteria": ["Tipe tidak didukung."], internal: ["detail privat"] } });
      if (input.nama_beasiswa === "conflict") return send(409, { message: "Sumber berubah." });
      if (input.nama_beasiswa === "bad-response") return send(201, { message: "Tidak ada proyeksi record." });
      const id = req.method === "POST" ? ++scholarshipCounter : Number(req.url.split("/").at(-1));
      if (req.method === "PUT" && !savedScholarships.has(id)) return send(404, { message: "Tidak ditemukan." });
      const record = { ...input, id, private_note: "tidak diteruskan" };
      savedScholarships.set(id, record);
      return send(req.method === "POST" ? 201 : 200, { data: record });
    }
    if (req.url === "/api/beasiswa" || req.url.startsWith("/api/beasiswa?")) {
      assert.equal(req.method, "GET");
      if (!session.user.email_verified || !(session.user.role === "administrator" || session.user.school_staff)) return send(403, { message: "Tidak diizinkan." });
      lastCatalog = new URL(req.url, "http://fixture.invalid").searchParams;
      if (lastCatalog.get("search") === "server-fails") return send(503, { message: "detail internal privat" });
      if (lastCatalog.get("search") === "rate-limit") return send(429, { message: "detail internal privat" });
      if (lastCatalog.get("search") === "malformed") return send(200, { data: [], debug: "detail internal privat" });
      if (lastCatalog.get("search") === "empty") return send(200, { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 });
      if (lastCatalog.get("search")?.startsWith("CRUD")) {
        const records = [...savedScholarships.values()].filter((item) => item.nama_beasiswa.startsWith(lastCatalog.get("search")));
        return send(200, { data: records, current_page: 1, last_page: 1, per_page: 20, total: records.length });
      }
      const page = Number(lastCatalog.get("page") ?? 1);
      const rows = Array.from({ length: page === 1 ? 20 : 1 }, (_, index) => ({
        id: (page - 1) * 20 + index + 1, nama_beasiswa: `Program Sintetis ${(page - 1) * 20 + index + 1}`,
        jenjang: lastCatalog.get("jenjang") || "Kuliah", is_active: true, status_program: "aktif", status_pendaftaran: "ditutup", tanggal_buka: "2026-07-01", tanggal_tutup: "2026-08-31",
        durasi: 8, satuan_durasi: "semester", periode_apply: "Juli - Agustus", kriteria: [],
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

test("ekspor PDF memakai Bearer server, filter dashboard dan tidak melakukan operasi tulis", async () => {
  const admin = await login(), student = await login("siswa");
  const get = (query = "", pair = admin.pair) => fetch(`${origin}/api/b4/reports/alumni-pdf${query}`, { headers: { Cookie: pair } });
  assert.equal((await fetch(`${origin}/api/b4/reports/alumni-pdf`)).status, 401);
  assert.equal((await get("", student.pair)).status, 403);
  assert.equal((await get("?url=https://example.test")).status, 422);
  const before = writes;
  const response = await get("?angkatan=2024&prodi=Teknik%20%26%20Seni&beasiswa_id=1");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/pdf/);
  assert.match(response.headers.get("content-disposition"), /attachment; filename="eightracer-buku-alumni.pdf"/);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal((await response.text()).slice(0, 5), "%PDF-");
  assert.equal(lastPdf.get("tahun_lulus"), "2024");
  assert.equal(lastPdf.get("program_studi"), "Teknik & Seni");
  assert.equal((await get("?prodi=Gagal")).status, 503);
  assert.equal((await get("?prodi=Rusak")).status, 502);
  assert.equal(writes, before);
});

test("pilihan siswa dan preview memakai GET berizin, menjaga ID dan tidak menulis BE", async () => {
  const admin = await login(), student = await login("siswa");
  const get = (path, pair = admin.pair) => fetch(`${origin}/api/b4/${path}`, { headers: { Cookie: pair } });
  assert.equal((await fetch(`${origin}/api/b4/students`)).status, 401);
  assert.equal((await get("students", student.pair)).status, 403);
  const page = await (await get("students?search=Siswa&angkatan=2026&page=2")).json();
  assert.equal(page.data[0].id, 41);
  assert.equal(page.currentPage, 2);
  assert.equal(JSON.stringify(page).includes("privat"), false);
  assert.equal(lastStudents.get("per_page"), "20");
  assert.equal(lastStudents.get("angkatan"), "2026");
  const before = writes;
  const preview = await get("recommendations/41/preview?target_jenjang=SMA");
  assert.equal(preview.status, 200);
  const body = await preview.json();
  assert.equal(body.candidates[0].score, 0);
  assert.equal(body.candidates[0].complete, false);
  assert.equal(body.candidates[0].ranking.similarity, null);
  assert.equal(lastPreview.id, 41);
  assert.equal(lastPreview.level, "SMA");
  assert.equal(JSON.stringify(body).includes("model_hash"), false);
  assert.deepEqual((await (await get("recommendations/41/preview?target_jenjang=Kuliah")).json()).candidates, []);
  assert.equal((await get("recommendations/41/preview?target_jenjang=SMA", student.pair)).status, 403);
  assert.equal((await fetch(`${origin}/api/b4/recommendations/41/preview?target_jenjang=SMA`, { method: "POST", headers: { Cookie: admin.pair, "Content-Type": "application/json", Origin: origin }, body: "{}" })).status, 405);
  assert.equal(writes, before);
});
test("preview menolak query/ID cacat, jenjang salah, siswa hilang dan bentuk respons cacat", async () => {
  const admin = await login();
  const get = (path) => fetch(`${origin}/api/b4/${path}`, { headers: { Cookie: admin.pair } });
  for (const path of ["students?page=0", "students?angkatan=abc", "students?role=admin", "recommendations/0/preview?target_jenjang=SMA", "recommendations/41/preview?target_jenjang=Admin", "recommendations/41/preview?target_jenjang=SMA&target_jenjang=Kuliah", "recommendations/41/preview?target_jenjang=SMA&siswa_id=99"]) assert.equal((await get(path)).status, 422);
  assert.equal((await get("recommendations/999/preview?target_jenjang=SMA")).status, 404);
  assert.equal((await get("recommendations/998/preview?target_jenjang=Kuliah")).status, 502);
  assert.equal((await get("recommendations/997/preview?target_jenjang=SMA")).status, 502);
});

test("analitik memakai GET dengan sesi staff, memetakan filter kedua endpoint dan menjaga data kosong", async () => {
  const admin = await login(), student = await login("siswa");
  const get = (query = "", pair = admin.pair) => fetch(`${origin}/api/b4/analytics${query}`, { headers: { Cookie: pair } });
  assert.equal((await fetch(`${origin}/api/b4/analytics`)).status, 401);
  assert.equal((await get("", student.pair)).status, 403);
  const response = await get("?angkatan=2024&prodi=Teknik%20%26%20Seni&beasiswa_id=1&periode=Semester%201");
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.total, 12);
  assert.equal(payload.recipients, null);
  assert.equal(payload.ukt.minimum, null);
  assert.equal(payload.ukt.unknown, 12);
  assert.deepEqual(payload.cohorts, []);
  assert.equal(JSON.stringify(payload).includes("privat"), false);
  assert.equal(lastAnalytics.get("prodi"), "Teknik & Seni");
  assert.equal(lastAnalytics.get("angkatan"), "2024");
  assert.equal(lastDashboard.get("program_studi"), "Teknik & Seni");
  assert.equal(lastDashboard.get("tahun_lulus"), "2024");
  assert.equal(lastDashboard.get("beasiswa_id"), "1");
  assert.equal(lastDashboard.get("periode"), "Semester 1");
});
test("analitik menolak filter cacat dan respons gagal tanpa mengisi angka contoh", async () => {
  const admin = await login();
  const get = (query) => fetch(`${origin}/api/b4/analytics${query}`, { headers: { Cookie: admin.pair } });
  for (const query of ["?angkatan=24", "?beasiswa_id=0", "?prodi=a&prodi=b", "?url=https://example.test", "?periode="]) assert.equal((await get(query)).status, 422);
  const failure = await get("?prodi=Gagal");
  assert.equal(failure.status, 503);
  assert.equal(JSON.stringify(await failure.json()).includes("detail internal"), false);
  assert.equal((await get("?prodi=Rusak")).status, 502);
});

test("detail katalog memakai ID langsung, mempertahankan tanggal SQL dan tidak menghitung sebagai penulisan", async () => {
  const admin = await login(), student = await login("siswa"), before = writes;
  assert.equal((await fetch(`${origin}/api/b4/beasiswa/1`)).status, 401);
  assert.equal((await fetch(`${origin}/api/b4/beasiswa/1`, { headers: { Cookie: student.pair } })).status, 403);
  for (const [path, status] of [["0", 422], ["999", 404], ["998", 502], ["1?url=https://example.test", 422]]) {
    assert.equal((await fetch(`${origin}/api/b4/beasiswa/${path}`, { headers: { Cookie: admin.pair } })).status, status);
  }
  const response = await fetch(`${origin}/api/b4/beasiswa/1`, { headers: { Cookie: admin.pair } });
  assert.equal(response.status, 200);
  const row = await response.json();
  assert.equal(row.input.durasi, 8);
  assert.equal(row.input.tanggal_buka, "2026-09-01");
  assert.equal(row.input.kriteria.length, 1);
  assert.equal(writes, before);
});

test("daftar alumni admin memisahkan ID penerimaan dan siswa, memfilter data privat dan menolak akses siswa", async () => {
  const admin = await login(), student = await login("siswa");
  assert.equal((await fetch(`${origin}/api/b4/alumni`)).status, 401);
  const get = (query, pair = admin.pair) => fetch(`${origin}/api/b4/alumni${query}`, { headers: { Cookie: pair } });
  assert.equal((await get("", student.pair)).status, 403);
  for (const query of ["?page=0", "?page=1&page=2", "?url=https://example.test", "?angkatan=abc"]) assert.equal((await get(query)).status, 422);
  const response = await get("?page=2&search=sintetis&jalur_masuk=SNBT");
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.data[0].studentId, 71);
  assert.equal(payload.data[0].id, 31);
  assert.equal(payload.currentPage, 2);
  assert.equal(JSON.stringify(payload).includes("privat"), false);
  assert.equal((await (await get("?search=empty")).json()).total, 0);
  assert.equal((await get("?search=malformed")).status, 502);
});

test("timeline berkelompok sesuai struktur BE asli membuka setiap kejadian dan tahun tanpa tanggal buatan", () => {
  const result = alumni.parseAlumniTimeline({ data: [
    { study_tracer_id: 101, events: [{ type: "lulus_sma", date: null, year: 2024, label: "Lulus SMA", granularity: "year" },
      { type: "masuk_pt", date: "2024-08-15", year: 2024, label: "Masuk Perguruan Tinggi", granularity: "date" }] },
    { study_tracer_id: 102, events: [{ type: "lulus_sma", date: null, year: 2024, label: "Lulus SMA", granularity: "year" }] },
  ] });
  assert.equal(result.events.length, 3);
  assert.equal(result.events[0].kind, "Lulus SMA");
  assert.equal(result.events[0].year, "2024");
  assert.equal(result.events[0].date, null);
  assert.equal(result.events[1].date, "2024-08-15");
  assert.equal(new Set(result.events.map((event) => event.id)).size, 3);
  assert.deepEqual(alumni.parseAlumniTimeline({ data: [{ study_tracer_id: 101, events: [] }] }).events, []);
  assert.throws(() => alumni.parseAlumniTimeline({ data: [{ study_tracer_id: 101 }] }));
  assert.throws(() => alumni.parseAlumniTimeline({ data: [{ study_tracer_id: 101, events: null }] }));
});

test("timeline mempertahankan tahun, null, angka desimal dan status proses tanpa menganggap diterima", async () => {
  const admin = await login(), student = await login("siswa");
  const get = (id, pair = admin.pair) => fetch(`${origin}/api/b4/alumni/${id}/timeline`, { headers: { Cookie: pair } });
  assert.equal((await get("71", student.pair)).status, 403);
  assert.equal((await get("0")).status, 422);
  assert.equal((await get("31")).status, 404);
  assert.equal((await get("999")).status, 502);
  const response = await get("71");
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.events[0].year, "2024");
  assert.equal(payload.events[0].date, null);
  assert.equal(payload.events[1].ipk, 3.8);
  assert.equal(payload.events[1].ukt, null);
  assert.equal(payload.events[1].ipi, 0);
  assert.equal(payload.events[1].scholarships[0].status, "proses");
  assert.equal(JSON.stringify(payload).includes("privat"), false);
  assert.equal(JSON.stringify(payload).includes("nominal_beasiswa"), false);
  assert.deepEqual(alumni.parseAlumniTimeline({ data: [] }).events, []);
});

test("katalog menolak tamu, siswa, filter invalid dan penulisan non-JSON", async () => {
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
  assert.equal((await fetch(url, { method: "POST", headers: { Cookie: admin.pair } })).status, 415);
});

function catalogWrite(pair, method, path, body, extra = {}) {
  return fetch(`${origin}/api/b4/beasiswa${path}`, { method, headers: { Cookie: pair, Origin: origin, "Content-Type": "application/json", ...extra }, body: JSON.stringify(body) });
}

test("tambah, baca ulang, edit, arsip, dan aktifkan memakai record server sintetis yang sama", async () => {
  const admin = await login();
  const input = writeInput();
  const before = writes;
  const created = await catalogWrite(admin.pair, "POST", "", input);
  assert.equal(created.status, 201);
  const { id } = await created.json();
  assert.ok(Number.isInteger(id));
  const read = async () => (await (await fetch(`${origin}/api/b4/beasiswa?search=CRUD`, { headers: { Cookie: admin.pair } })).json()).data.find((row) => row.id === id);
  let row = await read();
  assert.equal(row.name, input.nama_beasiswa);
  assert.equal(catalog.scholarshipDuration(row), "8 Semester");
  assert.deepEqual(row.input.kriteria, input.kriteria);
  assert.equal("private_note" in row.input, false);
  assert.equal((await catalogWrite(admin.pair, "PUT", `/${id}`, { ...row.input, nama_beasiswa: "CRUD Program Diperbarui" })).status, 200);
  assert.equal((await read()).name, "CRUD Program Diperbarui");
  assert.equal((await catalogWrite(admin.pair, "DELETE", `/${id}`, {})).status, 200);
  assert.equal((await read()).active, false);
  row = await read();
  assert.equal((await catalogWrite(admin.pair, "PUT", `/${id}`, { ...row.input, is_active: true })).status, 200);
  assert.equal((await read()).active, true);
  assert.equal(writes - before, 4);
});

test("penulisan katalog menjaga sesi, izin, origin, ID dan whitelist payload", async () => {
  const admin = await login();
  const student = await login("siswa");
  const before = writes;
  assert.equal((await catalogWrite("", "POST", "", writeInput())).status, 401);
  assert.equal((await catalogWrite(student.pair, "POST", "", writeInput())).status, 403);
  assert.equal((await catalogWrite(admin.pair, "POST", "", writeInput(), { Origin: "https://other.example.test" })).status, 403);
  assert.equal((await catalogWrite(admin.pair, "POST", "", { ...writeInput(), role: "administrator" })).status, 422);
  assert.equal((await catalogWrite(admin.pair, "PUT", "/0", writeInput())).status, 422);
  assert.equal((await catalogWrite(admin.pair, "POST", "", { ...writeInput(), kriteria: [{ nama_kriteria: "Kosong" }] })).status, 422);
  assert.equal(writes, before);
});

test("validasi field BE diteruskan, konflik ditolak, respons simpan cacat tidak diklaim sukses", async () => {
  const admin = await login();
  const validation = await catalogWrite(admin.pair, "POST", "", writeInput("validation"));
  assert.equal(validation.status, 422);
  assert.deepEqual((await validation.json()).errors, { penyelenggara: ["Penyelenggara wajib diisi."], "kriteria.0.tipe_kriteria": ["Tipe tidak didukung."] });
  assert.equal((await catalogWrite(admin.pair, "PUT", "/1001", writeInput("conflict"))).status, 409);
  const before = writes;
  assert.equal((await catalogWrite(admin.pair, "POST", "", writeInput("bad-response"))).status, 502);
  assert.equal(writes, before + 1);
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
    assert.equal(payload.data[0].programStatus, "aktif");
    assert.equal(payload.data[0].registrationStatus, "ditutup");
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
