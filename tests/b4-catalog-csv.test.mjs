import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import * as XLSX from "xlsx";

const compiled = ts.transpileModule(await readFile(new URL("../lib/b4-catalog-csv.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const api = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
function templateRows() { const book = XLSX.read(api.catalogCsvTemplate(), { type: "string", raw: true, cellFormula: false }); return XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { defval: "", raw: true }); }

test("template CSV UTF-8 terbaca dengan JSON kriteria berisi koma dan tanda kutip", () => {
  assert.equal(api.catalogCsvTemplate().charCodeAt(0), 0xfeff);
  const rows = api.parseCatalogCsvRows(templateRows());
  assert.deepEqual(rows[0].errors, []);
  assert.equal(rows[0].input.kriteria[0].nilai_kriteria, "85");
  assert.equal(rows[0].input.durasi, 1);
  assert.equal(rows[0].input.is_active, true);
  assert.equal(rows[0].input.tanggal_buka, null);
});

test("CSV siswa/alumni, ID dan field tambahan tidak menjadi payload katalog", () => {
  for (const key of ["siswa_id", "alumni_id", "id", "nisn", "role", "is_active"]) {
    const row = { ...templateRows()[0], [key]: "123" };
    const result = api.parseCatalogCsvRows([row])[0];
    assert.ok(result.errors.length);
    assert.equal(result.input, undefined);
  }
});

test("CSV menolak kriteria cacat, tanggal terbalik dan tautan berbahaya", () => {
  const source = templateRows()[0];
  for (const patch of [{ kriteria_json: "bukan JSON" }, { kriteria_json: "[]" }, { tanggal_buka: "2026-11-10", tanggal_tutup: "2026-11-01" }, { tanggal_buka: "2026-02-30" }, { link_pendaftaran: "javascript:alert(1)" }, { durasi: "1.5" }, { jenjang: "Admin" }]) assert.ok(api.parseCatalogCsvRows([{ ...source, ...patch }])[0].errors.length);
});

test("CSV kosong, terlalu banyak dan nama/jenjang duplikat ditolak", () => {
  assert.throws(() => api.parseCatalogCsvRows([]));
  assert.throws(() => api.parseCatalogCsvRows(Array.from({ length: 21 }, () => templateRows()[0])));
  const duplicates = api.parseCatalogCsvRows([templateRows()[0], templateRows()[0]]);
  assert.ok(duplicates[1].errors.some((error) => error.includes("berulang")));
});

test("CSV flat kolom beasiswa dan kriteria yang digabung terbaca tanpa JSON", () => {
  const row = {
    nama_beasiswa: "Beasiswa Indonesia Emas",
    jenjang: "Kuliah",
    durasi: "4",
    satuan_durasi: "tahun",
    periode_apply: "Agustus - September",
    penyelenggara: "Kemendikbudristek",
    deskripsi: "Beasiswa penuh untuk sarjana",
    tanggal_buka: "2026-08-01",
    tanggal_tutup: "2026-08-31",
    link_pendaftaran: "https://beasiswa.kemdikbud.go.id",
    nama_kriteria: "Rata-rata Rapor Minimum",
    tipe_kriteria: "Rata-rata Rapor",
    operator: ">=",
    nilai_kriteria: "85",
    bobot: "10",
    nama_kriteria_2: "Penghasilan Orang Tua Maksimal",
    tipe_kriteria_2: "Penghasilan Orang Tua",
    operator_2: "<=",
    nilai_kriteria_2: "5000000",
    bobot_2: "15",
  };
  const results = api.parseCatalogCsvRows([row]);
  assert.equal(results[0].errors.length, 0);
  assert.equal(results[0].input.nama_beasiswa, "Beasiswa Indonesia Emas");
  assert.equal(results[0].input.jenjang, "Kuliah");
  assert.equal(results[0].input.kriteria.length, 2);
  assert.equal(results[0].input.kriteria[0].tipe_kriteria, "rata_rapor");
  assert.equal(results[0].input.kriteria[0].nilai_kriteria, "85");
  assert.equal(results[0].input.kriteria[0].bobot, 10);
  assert.equal(results[0].input.kriteria[1].tipe_kriteria, "penghasilan_orang_tua");
  assert.equal(results[0].input.kriteria[1].nilai_kriteria, "5000000");
  assert.equal(results[0].input.kriteria[1].bobot, 15);
});

test("CSV dengan judul kolom Bahasa Indonesia terpetakan secara otomatis", () => {
  const row = {
    "Nama Beasiswa": "Beasiswa Prestasi SMA",
    "Jenjang": "SMA",
    "Durasi": "1",
    "Satuan Durasi": "tahun",
    "Periode Pendaftaran": "Januari",
    "Nama Syarat": "Nilai TKA",
    "Jenis Kriteria": "Nilai TKA",
    "Operator": ">=",
    "Nilai Syarat": "80",
    "Bobot": "5",
  };
  const results = api.parseCatalogCsvRows([row]);
  assert.equal(results[0].errors.length, 0);
  assert.equal(results[0].input.nama_beasiswa, "Beasiswa Prestasi SMA");
  assert.equal(results[0].input.jenjang, "SMA");
  assert.equal(results[0].input.kriteria[0].tipe_kriteria, "nilai_tka");
  assert.equal(results[0].input.kriteria[0].nilai_kriteria, "80");
});
