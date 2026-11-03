import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../lib/b4-scholarships.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { parseScholarshipPage, scholarshipPeriod, registrationStatusLabels } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const row = { id: 1, nama_beasiswa: "UJI Program", jenjang: "Kuliah", is_active: true };
const page = (data) => ({ data: [data], current_page: 1, last_page: 1, per_page: 20, total: 1 });

test("program aktif tetap menampilkan pendaftaran ditutup sesuai keputusan BE", () => {
  const [result] = parseScholarshipPage(page({ ...row, tanggal_buka: "2026-09-01", tanggal_tutup: "2026-10-31", status_pendaftaran: "ditutup" })).data;
  assert.equal(result.active, true);
  assert.equal(registrationStatusLabels[result.registrationStatus], "Ditutup");
});

test("bulan tanpa tanggal penuh tidak ditafsirkan sebagai jadwal dibuka", () => {
  const [result] = parseScholarshipPage(page({ ...row, periode_apply: "September–Oktober" })).data;
  assert.equal(result.registrationStatus, "belum_ditentukan");
  assert.equal(scholarshipPeriod(result), "September–Oktober (tanggal belum ditentukan)");
});

test("status valid diproyeksikan dan status tidak dikenal ditolak", () => {
  for (const status of Object.keys(registrationStatusLabels)) {
    const [result] = parseScholarshipPage(page({ ...row, status_pendaftaran: status })).data;
    assert.equal(result.registrationStatus, status);
  }
  assert.throws(() => parseScholarshipPage(page({ ...row, status_pendaftaran: "aktif" })));
  assert.throws(() => parseScholarshipPage(page({ ...row, periode_apply: {} })));
});
