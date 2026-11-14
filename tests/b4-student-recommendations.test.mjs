import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const compiled = ts.transpileModule(await readFile(new URL("../lib/b4-student-recommendations.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { parseStudentRecommendations: parse } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const payload = () => ({ current_page: 1, last_page: 1, per_page: 20, total: 1, data: [{ id: 7, status_review: "disetujui", siswa_id: 41,
  beasiswa: { nama_beasiswa: "Program sintetis", jenjang: "Kuliah", tipe_pendanaan: "Penuh", periode_apply: "September", private_key: "rahasia" },
  skor_kecocokan: 0, alasan: "<script>contoh teks</script>", persiapan: ["Dokumen A"], checklist: [{ kriteria: "Nilai", status: "terpenuhi", syarat: 0, nilai_siswa: 90 }], pemeringkatan_ml: { model_hash: "privat" }, token: "rahasia" }] });
test("snapshot siswa diproyeksikan dengan whitelist dan nol dipertahankan", () => {
  const result = parse(payload());
  assert.equal(result.data[0].score, 0);
  assert.equal(result.data[0].checklist[0].required, "0");
  assert.equal(result.data[0].provider, null);
  assert.equal(result.data[0].reason, "<script>contoh teks</script>");
  for (const key of ["siswa_id", "token", "private_key", "model_hash", "nilai_siswa", "rahasia"]) assert.equal(JSON.stringify(result).includes(key), false);
});
test("paginator resource dan nested didukung tanpa memakai data contoh", () => {
  const source = payload();
  assert.deepEqual(parse({ data: source }), parse(source));
  const { data, ...meta } = source;
  assert.deepEqual(parse({ data, meta }), parse(source));
  source.data = []; source.total = 0;
  assert.deepEqual(parse(source).data, []);
});
test("nilai null tidak menjadi nol, persiapan teks menjadi satu butir", () => {
  const source = payload(); source.data[0].skor_kecocokan = null; source.data[0].persiapan = "Persiapkan berkas"; source.data[0].checklist = null;
  const item = parse(source).data[0];
  assert.equal(item.score, null); assert.deepEqual(item.preparation, ["Persiapkan berkas"]); assert.deepEqual(item.checklist, []);
});
test("draft, snapshot hilang dan struktur yang belum dikenal gagal jelas", () => {
  for (const mutation of [
    row => { row.status_review = "draft"; }, row => { row.beasiswa = null; },
    row => { row.checklist = [{ nama_lain: "belum dikonfirmasi" }]; },
    row => { row.persiapan = { private: "tidak boleh ditebak" }; },
    row => { row.skor_kecocokan = 101; }, row => { row.skor_kecocokan = ""; },
  ]) { const source = payload(); mutation(source.data[0]); assert.throws(() => parse(source)); }
});
test("pagination rusak dan ID duplikat ditolak", () => {
  const source = payload(); source.last_page = 2; assert.throws(() => parse(source));
  source.last_page = 1; source.total = 2; source.data.push(source.data[0]); assert.throws(() => parse(source));
});
test("struktur kelompok asli terpublikasi tanpa beasiswa mempertahankan status, bukan skor nol", () => {
  const source = { current_page: 1, last_page: 1, per_page: 20, total: 1, data: [{ id: 19, target_jenjang: "SMA", status: "terpublikasi", tanggal_rekomendasi: "2026-11-14", beasiswa: [], private_note: "privat" }] };
  const result = parse(source);
  assert.deepEqual(result.data, []);
  assert.deepEqual(result.groups, [{ id: 19, level: "SMA", status: "terpublikasi", scholarshipCount: 0 }]);
  assert.equal(result.total, 1);
  assert.equal(JSON.stringify(result).includes("privat"), false);
  source.data[0].status = "Terpublikasi"; assert.equal(parse(source).groups[0].status, "terpublikasi");
  source.data[0].status = "draft"; assert.throws(() => parse(source));
  source.data[0].status = "terpublikasi"; source.data[0].beasiswa = [{ unknown_field: true }]; assert.throws(() => parse(source));
});
