import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

async function moduleFrom(path) {
  const compiled = ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}
const students = await moduleFrom("../lib/b4-students.ts");
const recommendations = await moduleFrom("../lib/b4-recommendations.ts");
const preview = () => ({ data: { target_jenjang: "SMA", pemeringkatan_ml: { status: "fallback", alasan_status: "Data teks belum cukup", model_hash: "privat" }, kandidat: [{ beasiswa_id: 101,
  beasiswa: { nama_beasiswa: "Program Sintetis", jenjang: "Keduanya", durasi: "8", satuan_durasi: "semester", tanggal_buka: "2026-09-01T00:00:00.000000Z", tanggal_tutup: null, periode_apply: "September–Oktober", internal_note: "privat" },
  evaluasi: { skor: 0, lengkap: false, memenuhi: false, checklist: [{ kriteria: "Nilai minimum", operator: ">=", syarat: "85", status: "belum_dinilai", siswa_id: 99 }], pemeringkatan_ml: { status: "fallback", skor_kemiripan: null, peringkat: 1, model_hash: "privat" } } }] } });
test("pilihan siswa memakai paginator BE dan tidak meneruskan NISN, keluarga, email atau catatan", () => {
  const page = { current_page: 1, last_page: 1, per_page: 20, total: 1, data: [{ id: 41, nama_lengkap: "Siswa Sintetis", tahun_lulus: 2026, nisn: "0012345678", registration_email: "private@example.test", keluarga: { penghasilan: 123 }, catatan: "privat" }] };
  for (const payload of [page, { data: page }]) {
    assert.deepEqual(students.parseRecommendationStudents(payload).data[0], { id: 41, name: "Siswa Sintetis", cohort: "2026" });
    const output = JSON.stringify(students.parseRecommendationStudents(payload));
    for (const privateValue of ["0012345678", "private@example.test", "keluarga", "privat"]) assert.equal(output.includes(privateValue), false);
  }
});
test("siswa kosong atau angkatan tidak diketahui tidak menjadi profil contoh", () => {
  const page = { current_page: 1, last_page: 1, per_page: 20, total: 0, data: [] };
  assert.deepEqual(students.parseRecommendationStudents({ data: page }).data, []);
  const result = students.parseRecommendationStudents({ ...page, total: 1, data: [{ id: 41, nama_lengkap: "Siswa Sintetis", tahun_lulus: null }] });
  assert.equal(result.data[0].cohort, null);
  assert.throws(() => students.parseRecommendationStudents({ ...page, total: 1, data: [{ id: 41 }] }));
});
test("preview BE mempertahankan skor nol, data belum lengkap, similarity null dan tanggal tanpa pergeseran", () => {
  const output = recommendations.parseRecommendationPreview(preview());
  const candidate = output.candidates[0];
  assert.equal(candidate.score, 0);
  assert.equal(candidate.duration, 8);
  assert.equal(candidate.opens, "2026-09-01");
  assert.equal(candidate.closes, null);
  assert.equal(candidate.ranking.similarity, null);
  assert.equal(recommendations.recommendationEligibility(candidate), "Belum dapat dinilai lengkap");
  for (const privateValue of ["model_hash", "internal_note", "siswa_id", "privat"]) assert.equal(JSON.stringify(output).includes(privateValue), false);
});
test("kecocokan kriteria dan kemiripan teks berbeda skala serta tidak menjadi probabilitas", () => {
  const source = preview();
  source.data.kandidat[0].evaluasi.skor = 88;
  source.data.kandidat[0].evaluasi.lengkap = true;
  source.data.kandidat[0].evaluasi.memenuhi = true;
  source.data.kandidat[0].evaluasi.pemeringkatan_ml.skor_kemiripan = 0.42;
  const candidate = recommendations.parseRecommendationPreview(source).candidates[0];
  assert.equal(candidate.score, 88);
  assert.equal(candidate.ranking.similarity, 0.42);
  assert.equal(recommendations.recommendationEligibility(candidate), "Memenuhi kriteria saat ini");
  assert.equal(recommendations.recommendationEligibility({ complete: true, meets: false }), "Belum memenuhi kriteria");
  source.data.kandidat[0].evaluasi.skor = 101;
  assert.throws(() => recommendations.parseRecommendationPreview(source));
  source.data.kandidat[0].evaluasi.skor = 88;
  source.data.kandidat[0].evaluasi.pemeringkatan_ml.skor_kemiripan = 42;
  assert.throws(() => recommendations.parseRecommendationPreview(source));
});
test("kandidat kosong tetap kosong dan payload tidak sesuai ditolak", () => {
  const source = preview();
  source.data.kandidat = [];
  assert.deepEqual(recommendations.parseRecommendationPreview(source).candidates, []);
  assert.throws(() => recommendations.parseRecommendationPreview({ data: { target_jenjang: "SMA" } }));
  source.data.target_jenjang = "Admin";
  assert.throws(() => recommendations.parseRecommendationPreview(source));
});
