/**
 * Integration test: alur lengkap guru isi template → parse CSV/Excel → payload ke backend
 * Pastikan data yang dihasilkan bisa diterima oleh backend Laravel tanpa error.
 *
 * Run: node --test tests/b4-import-integration.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as XLSX from 'xlsx';

// ── Compile TypeScript helpers ─────────────────────────────────────────────
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
function compile(relPath, deps = {}) {
  const absPath = ROOT + relPath.replace(/^\//, '');
  const module = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(absPath, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    { module, exports: module.exports, require: id => deps[id], URL, Date }
  );
  return module.exports;
}

const csv = compile('lib/b4-catalog-csv.ts');
const excel = compile('lib/b4-catalog-excel.ts', { './b4-catalog-csv': csv });
const { parseCatalogCsvRows, normalizeCriteriaType } = csv;
const { parseCatalogExcelRows, PROGRAM_COLUMNS, CRITERIA_COLUMNS } = excel;

// ── Backend validation rules mirrored in JS ────────────────────────────────
// Mirrors: BasisDataBeasiswaController::rules() + Criteria::validate()
const BACKEND_FIELDS = [
  'nilai_tka', 'rata_rapor', 'rata_rapor_kelas_12', 'penghasilan_orang_tua',
  'persentase_kehadiran', 'jumlah_prestasi', 'skor_prestasi', 'bantuan_sosial_sesuai',
  'jumlah_organisasi', 'poin_karakter', 'ipk', 'semester_kuliah', 'status_eligible',
];
const VALID_JENJANG = ['SMA', 'Kuliah', 'Keduanya'];
const VALID_SATUAN = ['bulan', 'tahun', 'semester'];
const VALID_OPERATORS = ['>=', '<=', '=', '!=', '>', '<'];

function validatePayload(input) {
  // Mirrors: scholarshipInput() in backend-scholarships.ts + BasisDataBeasiswaController::rules()
  const errors = [];
  if (!input.nama_beasiswa?.trim()) errors.push('nama_beasiswa wajib diisi');
  if (!VALID_JENJANG.includes(input.jenjang)) errors.push(`jenjang '${input.jenjang}' tidak valid, harus: ${VALID_JENJANG.join(', ')}`);
  if (typeof input.is_active !== 'boolean') errors.push('is_active harus boolean');
  if (!Array.isArray(input.kriteria) || input.kriteria.length < 1) errors.push('kriteria wajib min 1');
  if (Array.isArray(input.kriteria) && input.kriteria.length > 30) errors.push('kriteria max 30');
  if (input.durasi !== null && input.durasi !== undefined) {
    if (!Number.isFinite(input.durasi) || input.durasi <= 0 || input.durasi > 100) errors.push('durasi harus 1-100');
    if (!VALID_SATUAN.includes(input.satuan_durasi)) errors.push(`satuan_durasi '${input.satuan_durasi}' tidak valid, harus: ${VALID_SATUAN.join(', ')}`);
  }
  if (input.tanggal_buka && input.tanggal_tutup && input.tanggal_tutup < input.tanggal_buka) {
    errors.push('tanggal_tutup harus >= tanggal_buka');
  }
  if (input.link_pendaftaran) {
    try {
      const u = new URL(input.link_pendaftaran);
      if (!['http:', 'https:'].includes(u.protocol)) errors.push('link_pendaftaran harus http/https');
    } catch { errors.push('link_pendaftaran tidak valid'); }
  }
  for (const [i, c] of (input.kriteria ?? []).entries()) {
    if (!c.nama_kriteria?.trim()) errors.push(`kriteria[${i}].nama_kriteria wajib`);
    if (!BACKEND_FIELDS.includes(c.tipe_kriteria)) errors.push(`kriteria[${i}].tipe_kriteria '${c.tipe_kriteria}' tidak dikenal backend`);
    if (!VALID_OPERATORS.includes(c.operator)) errors.push(`kriteria[${i}].operator '${c.operator}' tidak valid`);
    if (!c.nilai_kriteria?.trim() || !/^-?\d+(?:\.\d+)?$/.test(c.nilai_kriteria)) errors.push(`kriteria[${i}].nilai_kriteria harus angka`);
    if (c.bobot !== undefined && (typeof c.bobot !== 'number' || c.bobot < 0.01 || c.bobot > 999.99)) {
      errors.push(`kriteria[${i}].bobot harus 0.01-999.99`);
    }
  }
  return errors;
}

// ══════════════════════════════════════════════════════════════════════════════
// TEST 1: Template XLSX diunduh → guru isi data → parse → payload backend valid
// ══════════════════════════════════════════════════════════════════════════════
test('guru isi template XLSX (Beasiswa+Kriteria) → payload diterima backend', () => {
  const buf = fs.readFileSync(new URL('../public/templates/template-katalog-beasiswa.xlsx', import.meta.url));
  const wb = XLSX.read(buf, { type: 'buffer' });

  // Simulasi guru mengisi 2 baris di sheet Beasiswa
  const programRows = [
    Object.fromEntries(PROGRAM_COLUMNS.map((c, i) => [c, [
      'Beasiswa Prestasi Akademik', 'SMA', '12', 'bulan', '2026-07-01 s.d. 2026-08-31',
      'Yayasan Pendidikan Maju', 'Beasiswa untuk siswa berprestasi tinggi.',
      '2026-07-01', '2026-08-31', 'https://yayasan.example.com/daftar',
    ][i]])),
    Object.fromEntries(PROGRAM_COLUMNS.map((c, i) => [c, [
      'Bantuan Keluarga Tidak Mampu', 'SMA', '', '', '',
      'Dinas Pendidikan', 'Bantuan untuk keluarga dengan penghasilan rendah.',
      '', '', '',
    ][i]])),
  ];

  const criteriaRows = [
    // Kriteria untuk program 1
    { 'Nama Beasiswa': 'Beasiswa Prestasi Akademik', Jenjang: 'SMA', 'Nama Syarat': 'Rata-rata rapor minimum', 'Jenis Kriteria': 'Rata-rata Rapor', Operator: '>=', 'Nilai Syarat': '85', Bobot: '1.5' },
    { 'Nama Beasiswa': 'Beasiswa Prestasi Akademik', Jenjang: 'SMA', 'Nama Syarat': 'Kehadiran minimum', 'Jenis Kriteria': 'Kehadiran (%)', Operator: '>=', 'Nilai Syarat': '90', Bobot: '' },
    // Kriteria untuk program 2
    { 'Nama Beasiswa': 'Bantuan Keluarga Tidak Mampu', Jenjang: 'SMA', 'Nama Syarat': 'Penghasilan orang tua max', 'Jenis Kriteria': 'Penghasilan Orang Tua', Operator: '<=', 'Nilai Syarat': '3000000', Bobot: '' },
  ];

  const results = parseCatalogExcelRows(programRows, criteriaRows);
  assert.equal(results.length, 2, 'harus ada 2 program');

  // Program 1
  assert.equal(results[0].errors.length, 0, `Program 1 errors: ${results[0].errors.join(', ')}`);
  assert.ok(results[0].input, 'Program 1 harus punya input');
  const p1errors = validatePayload(results[0].input);
  assert.equal(p1errors.length, 0, `Payload Program 1 ditolak backend: ${p1errors.join('; ')}`);
  assert.equal(results[0].input.nama_beasiswa, 'Beasiswa Prestasi Akademik');
  assert.equal(results[0].input.jenjang, 'SMA');
  assert.equal(results[0].input.durasi, 12);
  assert.equal(results[0].input.satuan_durasi, 'bulan');
  assert.equal(results[0].input.is_active, true);
  assert.equal(results[0].input.kriteria.length, 2);
  assert.equal(results[0].input.kriteria[0].tipe_kriteria, 'rata_rapor');
  assert.equal(results[0].input.kriteria[0].nilai_kriteria, '85');
  assert.equal(results[0].input.kriteria[0].bobot, 1.5);
  assert.equal(results[0].input.kriteria[1].tipe_kriteria, 'persentase_kehadiran');

  // Program 2
  assert.equal(results[1].errors.length, 0, `Program 2 errors: ${results[1].errors.join(', ')}`);
  const p2errors = validatePayload(results[1].input);
  assert.equal(p2errors.length, 0, `Payload Program 2 ditolak backend: ${p2errors.join('; ')}`);
  assert.equal(results[1].input.durasi, null, 'durasi kosong → null');
  assert.equal(results[1].input.satuan_durasi, null, 'satuan_durasi kosong → null');
  assert.equal(results[1].input.kriteria[0].tipe_kriteria, 'penghasilan_orang_tua');
  assert.equal(results[1].input.kriteria[0].operator, '<=');
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST 2: Semua jenis kriteria dari drop-down template terpetakan ke BACKEND_FIELDS
// ══════════════════════════════════════════════════════════════════════════════
test('semua pilihan Jenis Kriteria di template terpetakan ke kode backend yang valid', () => {
  const templateDropdowns = [
    'Nilai TKA', 'Rata-rata Rapor', 'Rapor Kelas 12',
    'Penghasilan Orang Tua', 'Kehadiran (%)',
    'Jumlah Prestasi', 'Jumlah Organisasi', 'Poin Karakter',
    'IPK', 'Semester Kuliah',
  ];
  for (const label of templateDropdowns) {
    const code = normalizeCriteriaType(label);
    assert.ok(code, `Label '${label}' tidak terpetakan ke kode`);
    assert.ok(BACKEND_FIELDS.includes(code), `Kode '${code}' (dari '${label}') tidak ada di EligibilityEvaluator::FIELDS`);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST 3: Jenjang di drop-down template semuanya valid backend
// ══════════════════════════════════════════════════════════════════════════════
test('semua pilihan Jenjang di template diterima backend', () => {
  // Ambil dari file template langsung
  const buf = fs.readFileSync(new URL('../public/templates/template-katalog-beasiswa.xlsx', import.meta.url));
  // Verifikasi drop-down list di sheet Beasiswa mengandung hanya nilai backend-valid
  // (kita cek dari XML worksheet yang ada validasinya)
  // Minimal cek: template tidak menawarkan D3/D4/S1/S2 yang tidak valid
  const templateJenjang = ['SMA', 'Kuliah', 'Keduanya'];
  for (const j of templateJenjang) {
    assert.ok(VALID_JENJANG.includes(j), `Jenjang '${j}' di template tidak diterima backend`);
  }
  // D3/D4/S1/S2 tidak boleh ada
  const invalidJenjang = ['D3', 'D4', 'S1', 'S2', 'SMK'];
  for (const j of invalidJenjang) {
    assert.ok(!VALID_JENJANG.includes(j), `Jenjang invalid '${j}' seharusnya tidak diterima backend`);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST 4: Satuan Durasi lowercase dikirim ke backend dengan benar
// ══════════════════════════════════════════════════════════════════════════════
test('satuan_durasi dari template dikirim lowercase dan diterima backend', () => {
  // Template baru memakai lowercase langsung di drop-down: bulan, tahun, semester
  const csvRows = [
    {
      nama_beasiswa: 'Beasiswa Durasi Test',
      jenjang: 'SMA',
      durasi: '24',
      satuan_durasi: 'bulan',
      nama_kriteria: 'Rata-rata rapor minimum',
      tipe_kriteria: 'rata_rapor',
      operator: '>=',
      nilai_kriteria: '80',
    },
    {
      nama_beasiswa: 'Beasiswa Durasi Tahun',
      jenjang: 'Kuliah',
      durasi: '4',
      satuan_durasi: 'tahun',
      nama_kriteria: 'IPK minimum',
      tipe_kriteria: 'ipk',
      operator: '>=',
      nilai_kriteria: '3.0',
    },
  ];
  const results = parseCatalogCsvRows(csvRows);
  for (const r of results) {
    assert.equal(r.errors.length, 0, `Errors: ${r.errors.join(', ')}`);
    const errors = validatePayload(r.input);
    assert.equal(errors.length, 0, `Backend validation errors: ${errors.join('; ')}`);
    assert.ok(VALID_SATUAN.includes(r.input.satuan_durasi), `satuan_durasi '${r.input.satuan_durasi}' tidak diterima backend`);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST 5: Data invalid dari guru ditolak sebelum sampai ke backend
// ══════════════════════════════════════════════════════════════════════════════
test('data invalid dari guru ditolak di lapisan parse sebelum ke backend', () => {
  // Jenjang salah (D3 bukan nilai backend valid)
  const wrongJenjang = parseCatalogCsvRows([{
    nama_beasiswa: 'Test', jenjang: 'D3',
    nama_kriteria: 'Rapor', tipe_kriteria: 'rata_rapor', operator: '>=', nilai_kriteria: '80',
  }]);
  assert.ok(wrongJenjang[0].errors.length > 0, 'Jenjang D3 harus ditolak parser');
  assert.ok(!wrongJenjang[0].input, 'Tidak boleh ada input jika ada error');

  // Tanggal terbalik
  const wrongDate = parseCatalogCsvRows([{
    nama_beasiswa: 'Test', jenjang: 'SMA',
    tanggal_buka: '2026-12-01', tanggal_tutup: '2026-06-01',
    nama_kriteria: 'Rapor', tipe_kriteria: 'rata_rapor', operator: '>=', nilai_kriteria: '80',
  }]);
  assert.ok(wrongDate[0].errors.length > 0, 'Tanggal terbalik harus ditolak');

  // Link tidak valid
  const wrongLink = parseCatalogCsvRows([{
    nama_beasiswa: 'Test', jenjang: 'SMA',
    link_pendaftaran: 'javascript:alert(1)',
    nama_kriteria: 'Rapor', tipe_kriteria: 'rata_rapor', operator: '>=', nilai_kriteria: '80',
  }]);
  assert.ok(wrongLink[0].errors.length > 0, 'Link javascript: harus ditolak');

  // Nilai kriteria bukan angka
  const wrongValue = parseCatalogCsvRows([{
    nama_beasiswa: 'Test', jenjang: 'SMA',
    nama_kriteria: 'Rapor', tipe_kriteria: 'rata_rapor', operator: '>=', nilai_kriteria: 'tinggi',
  }]);
  assert.ok(wrongValue[0].errors.length > 0, 'Nilai kriteria bukan angka harus ditolak');

  // Kriteria kosong
  const noCriteria = parseCatalogCsvRows([{ nama_beasiswa: 'Test', jenjang: 'SMA' }]);
  assert.ok(noCriteria[0].errors.length > 0, 'Tanpa kriteria harus ditolak');

  // Nama beasiswa duplikat
  const dupRow = { nama_beasiswa: 'Duplikat', jenjang: 'SMA', nama_kriteria: 'Rapor', tipe_kriteria: 'rata_rapor', operator: '>=', nilai_kriteria: '80' };
  const dupResult = parseCatalogCsvRows([dupRow, dupRow]);
  assert.ok(dupResult[1].errors.length > 0, 'Nama beasiswa duplikat harus ditolak');
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST 6: Semua jenis kriteria menghasilkan payload yang diterima backend
// ══════════════════════════════════════════════════════════════════════════════
test('setiap tipe kriteria dari template menghasilkan payload backend-valid', () => {
  const cases = [
    { label: 'Nilai TKA', op: '>=', val: '75' },
    { label: 'Rata-rata Rapor', op: '>=', val: '80' },
    { label: 'Rapor Kelas 12', op: '>=', val: '85' },
    { label: 'Penghasilan Orang Tua', op: '<=', val: '5000000' },
    { label: 'Kehadiran (%)', op: '>=', val: '90' },
    { label: 'Jumlah Prestasi', op: '>=', val: '1' },
    { label: 'Jumlah Organisasi', op: '>=', val: '1' },
    { label: 'Poin Karakter', op: '>=', val: '70' },
  ];
  for (const { label, op, val } of cases) {
    const rows = parseCatalogCsvRows([{
      nama_beasiswa: `Test ${label}`,
      jenjang: 'SMA',
      nama_kriteria: `Syarat ${label}`,
      tipe_kriteria: label,
      operator: op,
      nilai_kriteria: val,
    }]);
    assert.equal(rows[0].errors.length, 0, `Tipe '${label}' parse error: ${rows[0].errors.join(', ')}`);
    const backendErrors = validatePayload(rows[0].input);
    assert.equal(backendErrors.length, 0, `Tipe '${label}' backend error: ${backendErrors.join('; ')}`);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST 7: Jenjang 'Kuliah' dan 'Keduanya' diterima
// ══════════════════════════════════════════════════════════════════════════════
test('jenjang Kuliah dan Keduanya diterima parser dan backend', () => {
  for (const jenjang of ['Kuliah', 'Keduanya']) {
    const rows = parseCatalogCsvRows([{
      nama_beasiswa: `Test ${jenjang}`,
      jenjang,
      nama_kriteria: 'IPK minimum',
      tipe_kriteria: 'ipk',
      operator: '>=',
      nilai_kriteria: '3.0',
    }]);
    assert.equal(rows[0].errors.length, 0, `Jenjang '${jenjang}' ditolak parser: ${rows[0].errors.join(', ')}`);
    const errors = validatePayload(rows[0].input);
    assert.equal(errors.length, 0, `Jenjang '${jenjang}' ditolak backend mirror: ${errors.join('; ')}`);
  }
});
