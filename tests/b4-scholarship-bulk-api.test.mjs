import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compile = async (path) => ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const dataUrl = (code) => "data:text/javascript;base64," + Buffer.from(code).toString("base64");

const errorModule = dataUrl('export class ApiError extends Error { constructor(status, message, errors = {}) { super(message); this.name = "ApiError"; this.status = status; this.errors = errors; } }');
const catalogModule = dataUrl(await compile("../lib/b4-scholarships.ts"));
const api = await import(dataUrl((await compile("../lib/b4-scholarship-api.ts"))
  .replace('"./eightracer-api"', JSON.stringify(errorModule))
  .replace('"./b4-scholarships"', JSON.stringify(catalogModule))));

function stubFetch(handler) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (path, options) => { calls.push({ path, options }); return handler(path, options); };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

test("impor katalog mengirim semua beasiswa dalam satu request bulk", async () => {
  const stub = stubFetch(() => new Response(JSON.stringify({ message: "2 beasiswa berhasil disimpan.", data: [] }), {
    headers: { "Content-Type": "application/json" },
  }));
  try {
    await api.saveScholarshipsBulk([{ nama_beasiswa: "Beasiswa A" }, { nama_beasiswa: "Beasiswa B" }]);
  } finally { stub.restore(); }

  assert.equal(stub.calls.length, 1);
  assert.equal(stub.calls[0].path, "/api/b4/beasiswa/bulk");
  assert.equal(stub.calls[0].options.method, "POST");
  assert.deepEqual(JSON.parse(stub.calls[0].options.body), { rows: [{ nama_beasiswa: "Beasiswa A" }, { nama_beasiswa: "Beasiswa B" }] });
});

test("kesalahan bulk tetap membawa field baris agar UI dapat menandai baris yang ditolak", async () => {
  const stub = stubFetch(() => new Response(JSON.stringify({
    message: "Periksa isian yang ditandai sesuai ketentuan beasiswa.",
    errors: { "rows.1.nama_beasiswa": ["Beasiswa dengan nama dan jenjang ini sudah ada."] },
  }), { status: 422, headers: { "Content-Type": "application/json" } }));
  try {
    await assert.rejects(
      api.saveScholarshipsBulk([{ nama_beasiswa: "Beasiswa A" }, { nama_beasiswa: "Beasiswa B" }]),
      (error) => error.status === 422 && error.errors["rows.1.nama_beasiswa"][0].includes("sudah ada"),
    );
  } finally { stub.restore(); }
});
