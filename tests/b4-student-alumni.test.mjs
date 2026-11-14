import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const evidenceCode = ts.transpileModule(await readFile(new URL("../lib/b4-scholarship-evidence.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const evidenceUrl = `data:text/javascript;base64,${Buffer.from(evidenceCode).toString("base64")}`;
const compiled = ts.transpileModule(await readFile(new URL("../lib/b4-student-alumni.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace('"./b4-scholarship-evidence"', JSON.stringify(evidenceUrl));
const api = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const published = () => ({ id: 31, nama_lengkap: "Alumni Sintetis", tahun_lulus: 2024, masuk_pt: { perguruan_tinggi: { nama_pt: "Kampus Sintetis" }, program_studi: "Psikologi", jalur_masuk: "SNBP", tahun_masuk_pt: 2024, prestasi: [{ id: 1, nama_kompetisi: "Kompetisi Sintetis", tingkat: "Provinsi", tahun: 2023, siswa_id: 71, url_bukti: "rahasia", pivot: { bobot: 50 } }] }, nisn: "rahasia", no_wa: "rahasia" });

test("paginator kosong siswa tetap kosong, tanpa mengambil data staff atau contoh", () => {
  assert.deepEqual(api.parseStudentAlumniPage({ current_page: 1, last_page: 1, per_page: 20, total: 0, data: [] }), { currentPage: 1, lastPage: 1, perPage: 20, total: 0, data: [], preview: false });
  assert.throws(() => api.parseStudentAlumniPage({ data: [], current_page: 1 }));
});
test("proyeksi prestasi dan identitas hanya memakai field publik yang ditentukan", () => {
  const result = api.parseStudentAlumniPage({ data: [published()], current_page: 1, last_page: 1, per_page: 20, total: 1 });
  assert.equal(result.data[0].id, 31);
  assert.equal(result.data[0].university, "Kampus Sintetis");
  assert.equal(result.data[0].achievements[0].name, "Kompetisi Sintetis");
  for (const forbidden of ["rahasia", "siswa_id", "pivot", "bobot", "url_bukti", "nisn", "no_wa"]) assert.equal(JSON.stringify(result).includes(forbidden), false);
  assert.deepEqual(api.parseStudentAlumniDetail({ data: { ...published(), masuk_pt: { prestasi: [] } } }, 31).alumni.achievements, []);
});
test("detail menjaga tahun saja, null, nol, status dan izin nominal per kejadian", () => {
  const source = published();
  source.timeline = [{ type: "lulus_sma", label: "Lulus SMA", year: 2024, date: "2024-01-01", granularity: "year" }, { type: "progress", label: "Semester 1", data: { semester: 1, periode: "Ganjil 2024/2025", ipk_terkini: "0.00", nominal_ukt: 0, nominal_ipi: null, penerima_kipk: false, beasiswa: [] } }, { type: "progress", semester: 2, publish_financials: false, nominal_ukt: 987654, nominal_ipi: 456789 }];
  const result = api.parseStudentAlumniDetail({ data: source }, 31);
  assert.equal(result.events[0].date, null);
  assert.equal(result.events[0].year, "2024");
  assert.equal(result.events[1].ipk, 0);
  assert.equal(result.events[1].ukt, 0);
  assert.equal(result.events[1].kipk, false);
  assert.equal(result.events[2].ukt, null);
  assert.equal(result.events[2].ipi, null);
  assert.equal(result.admissionGrade, null);
  assert.equal(JSON.stringify(result).includes("987654"), false);
  assert.throws(() => api.parseStudentAlumniDetail({ data: source }, 99));
  assert.throws(() => api.parseStudentAlumniDetail({ data: { ...source, timeline: {} } }, 31));
});
