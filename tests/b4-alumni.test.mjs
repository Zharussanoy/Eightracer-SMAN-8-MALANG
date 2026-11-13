// Fixtures only exercise the parser; production data comes from the authenticated API.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const evidenceCode = ts.transpileModule(await readFile(new URL("../lib/b4-scholarship-evidence.ts", import.meta.url), "utf8"), {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const evidenceUrl = `data:text/javascript;base64,${Buffer.from(evidenceCode).toString("base64")}`;
const code = ts.transpileModule(await readFile(new URL("../lib/b4-alumni.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replace('"./b4-scholarship-evidence"',JSON.stringify(evidenceUrl));
const api = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const record = { id: 17, siswa_id: 9, nama_lengkap: "Alumni Fixture", tahun_lulus: 2024,
  perguruan_tinggi: { id: 4, nama_pt: "Kampus Fixture", jenis_pt: "Swasta" },
  program_studi: "Ilmu Komputer", jalur_masuk: "SNBT", status_penerimaan: "diterima",
  status_terakhir: null, siswa: { nisn: "PRIVATE_NISN", email: "PRIVATE_EMAIL" }, kontak_wa_terbaru: "PRIVATE_PHONE",
};
const page = { data: [record], current_page: 1, last_page: 1, per_page: 8, total: 1,
  filters: { universities: [{ id: 4, nama_pt: "Kampus Fixture" }], study_programs: ["Ilmu Komputer"], admission_paths: ["SNBT"] } };

test("baris alumni memetakan kampus/prodi sebenarnya tanpa meneruskan biodata privat", () => {
  const result = api.parseAlumniPage(page);
  assert.equal(result.data[0].id, 17);
  assert.equal(result.data[0].universityKind, "Swasta");
  assert.equal(result.data[0].latestStatus, null);
  assert.equal(result.filters.universities[0].value, "4");
  assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
});

test("dua penerimaan milik satu alumni tetap mempunyai ID detail berbeda", () => {
  const result = api.parseAlumniPage({ ...page, total: 2, data: [record, { ...record, id: 18, program_studi: "Fisika" }] });
  assert.equal(result.data.length, 2);
  assert.equal(result.data[0].studentId, result.data[1].studentId);
  assert.notEqual(result.data[0].id, result.data[1].id);
});

test("detail tanpa progres tidak mengarang semester, KIP, biaya, tahun masuk atau nilai", () => {
  const detail = api.parseAlumniDetail({ data: { ...record, has_nisn: false,
    kelas_terakhir: null, strata_pendidikan: "S1", sub_jalur_mandiri: null, pilihan_ke: null,
    tahun_masuk_pt: null, nilai_rapor_pendaftaran: null, skor_utbk: null, progress: [] } });
  assert.equal(detail.admissionYear, null);
  assert.equal(detail.reportScore, null);
  assert.equal(detail.utbkScore, null);
  assert.equal(detail.classroom, null);
  assert.deepEqual(detail.progress, []);
  assert.equal(JSON.stringify(detail).includes("PRIVATE"), false);
});

test("angka nol dan status tidak menerima pada progres tetap dibedakan dari belum diketahui", () => {
  const result = api.parseAlumniDetail({ data: { ...record, has_nisn: false, progress: [{
    id: 11, semester: 1, periode: "Ganjil 2026/2027", status_pendidikan: "aktif", ipk_terkini: "3.50",
    penerima_kipk: false, nominal_ukt: "0.00", nominal_ipi: null, beasiswa: [],
  }] } });
  assert.equal(result.progress[0].gpa, 3.5);
  assert.equal(result.progress[0].ukt, 0);
  assert.equal(result.progress[0].ipi, null);
  assert.equal(result.progress[0].kipk, false);
});

test("pencarian unicode dan filter dipertahankan; respons rusak ditolak tanpa fallback contoh", () => {
  const query = new URLSearchParams(api.alumniQuery("  Nama & Budi  ", "4", "Sastra & Bahasa", "SNBT", 2));
  assert.equal(query.get("search"), "Nama & Budi");
  assert.equal(query.get("program_studi"), "Sastra & Bahasa");
  assert.equal(query.get("perguruan_tinggi_id"), "4");
  assert.throws(() => api.parseAlumniPage({ ...page, total: "1" }));
  assert.throws(() => api.parseAlumniPage({ ...page, filters: undefined }));
  assert.throws(() => api.parseAlumniPage({ ...page, data: [{ ...record, perguruan_tinggi: null }] }));
});


test("catatan beasiswa sekolah berada pada alumni yang dipilih dan tidak menjadi progres semester", () => {
 const result=api.parseAlumniDetail({data:{...record,has_nisn:false,progress:[],scholarship_summary:{penerima_kipk:true,needs_review:false,beasiswa:[{nama_beasiswa:"KIP-K",status:"catatan_sekolah",source:"school_spreadsheet"}]}}});
 assert.equal(result.scholarshipEvidence.kipk,true);
 assert.equal(result.scholarshipEvidence.programs[0].name,"KIP-K");
 assert.equal(result.scholarshipEvidence.programs[0].status,"catatan_sekolah");
 assert.deepEqual(result.progress,[]);
});
