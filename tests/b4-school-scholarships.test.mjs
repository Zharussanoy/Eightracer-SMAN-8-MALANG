import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../lib/b4-school-scholarships.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { parseSchoolScholarshipPage, parseSchoolScholarshipSummary } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const row = {
  id: 1, nilai_sumber: "BEASISWA TELADAN", jenis_keterangan: "referensi_beasiswa", tahun_lulus: 2026,
  source_file_id: "1i3igBq5PbH8TPk60Pz75M2Qfz8MrVYsA", source_sha256: "private-source-hash",
  sumber: { url: "javascript:alert(1)", sheet: "MANDIRI", cell: "I56" },
  siswa: { id: 1, nama_lengkap: "Siswa Uji", nisn: "0000000001", user: { password: "never-forward" } },
  study_tracer: { id: 1, program_studi: "Informatika", jalur_masuk: "Mandiri", perguruan_tinggi: { nama_pt: "Kampus Uji" }, kontak_wa_terbaru: "private" },
};
const page = (value = row) => ({ data: [value], current_page: 1, last_page: 1, per_page: 20, total: 1 });

test("memetakan hubungan alumni/kampus/prodi dan hanya meneruskan field tampilan", () => {
  const result = parseSchoolScholarshipPage(page());
  assert.equal(result.data[0].university, "Kampus Uji");
  assert.equal(result.data[0].major, "Informatika");
  assert.equal(result.data[0].studentName, "Siswa Uji");
  assert.equal(result.data[0].linkedAdmission, true);
  assert.equal(result.data[0].source.url, "https://docs.google.com/spreadsheets/d/1i3igBq5PbH8TPk60Pz75M2Qfz8MrVYsA/edit");
  const text = JSON.stringify(result);
  for (const secret of ["never-forward", "private-source-hash", "kontak_wa", "nisn", "javascript:"]) assert.equal(text.includes(secret), false);
});

test("catatan belum terhubung mempertahankan sumber dan tidak dianggap penerima", () => {
  const [item] = parseSchoolScholarshipPage(page({ ...row, study_tracer: null, siswa: null, nilai_sumber: "-", jenis_keterangan: "tanpa_keterangan", kampus_sumber: "Kampus Asli", prodi_sumber: "Prodi Asli" })).data;
  assert.equal(item.linkedAdmission, false);
  assert.equal(item.studentName, null);
  assert.equal(item.university, "Kampus Asli");
  assert.equal(item.value, "-");
  assert.equal("isAwarded" in item, false);
});

test("respons rusak ditolak dan daftar kosong tetap mempunyai hitungan nol", () => {
  assert.equal(parseSchoolScholarshipPage({ ...page(), data: [], total: 0 }).total, 0);
  assert.throws(() => parseSchoolScholarshipPage({ ...page(), total: "1" }));
  assert.throws(() => parseSchoolScholarshipPage(page({ ...row, jenis_keterangan: "diterima" })));
  assert.throws(() => parseSchoolScholarshipPage(page({ ...row, source_file_id: "../other" })));
  assert.throws(() => parseSchoolScholarshipPage(page({ ...row, sumber: { ...row.sumber, cell: "I0" } })));
  assert.throws(() => parseSchoolScholarshipPage(page({ ...row, tahun_lulus: 2030 })));
});

test("ringkasan tidak mengubah data kosong menjadi nilai contoh dan memeriksa hubungan hitungan", () => {
  assert.deepEqual(parseSchoolScholarshipSummary({ data: { jumlah_catatan: 0, terhubung_siswa: 0, terhubung_penerimaan_pt: 0 } }), { total: 0, linkedStudents: 0, linkedAdmissions: 0 });
  assert.throws(() => parseSchoolScholarshipSummary({ data: { jumlah_catatan: 1, terhubung_siswa: 2, terhubung_penerimaan_pt: 0 } }));
  assert.throws(() => parseSchoolScholarshipSummary({ data: { jumlah_catatan: 2, terhubung_siswa: 0, terhubung_penerimaan_pt: 1 } }));
});
