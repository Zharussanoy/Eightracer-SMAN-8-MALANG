/**
 * Build template-katalog-beasiswa.xlsx with purple header tables.
 * Uses raw OOXML ZIP construction so we can set exact fill colors.
 * Run: node scripts/build-xlsx-template.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// ── Column definitions ─────────────────────────────────────────────────────
const BEASISWA_COLS = [
  'Nama Beasiswa', 'Jenjang', 'Durasi', 'Satuan Durasi',
  'Periode Pendaftaran', 'Penyelenggara', 'Deskripsi',
  'Tanggal Buka', 'Tanggal Tutup', 'Link Pendaftaran',
];
const KRITERIA_COLS = [
  'Nama Beasiswa', 'Jenjang', 'Nama Syarat',
  'Jenis Kriteria', 'Operator', 'Nilai Syarat', 'Bobot',
];

// Drop-down lists — nilai harus cocok dengan yang diterima backend
const JENJANG_VALUES = ['SMA', 'Kuliah', 'Keduanya'];
const SATUAN_DURASI_VALUES = ['bulan', 'tahun', 'semester'];
const JENIS_KRITERIA_VALUES = [
  'Nilai TKA', 'Rata-rata Rapor', 'Rapor Kelas 12',
  'Penghasilan Orang Tua', 'Kehadiran (%)',
  'Jumlah Prestasi', 'Jumlah Organisasi', 'Poin Karakter',
  'IPK', 'Semester Kuliah',
];
const OPERATOR_VALUES = ['>=', '<=', '=', '!=', '>', '<'];

const DATA_ROWS = 20; // blank data rows in each sheet

// ── Helper: column letter ──────────────────────────────────────────────────
function colLetter(n) { // 0-based
  let s = '';
  for (let x = n; ; x = Math.floor(x / 26) - 1) {
    s = String.fromCharCode(65 + (x % 26)) + s;
    if (x < 26) break;
  }
  return s;
}

// ── Helper: XML escape ─────────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Build shared strings ───────────────────────────────────────────────────
const strings = [];
const strIdx = new Map();
function si(s) {
  if (!strIdx.has(s)) { strIdx.set(s, strings.length); strings.push(s); }
  return strIdx.get(s);
}

// Pre-register all strings we'll need
[...BEASISWA_COLS, ...KRITERIA_COLS].forEach(si);

// Panduan content
const PANDUAN_ROWS = [
  ['Template Informasi Beasiswa', ''],
  ['', ''],
  ['1. Isi Beasiswa', 'Satu baris untuk satu program. Isi maksimal 20 beasiswa per unggahan.'],
  ['Kolom wajib', 'Nama Beasiswa dan Jenjang wajib diisi. Data yang belum diketahui boleh dikosongkan.'],
  ['Pilihan isian', 'Pilih Jenjang (SMA / Kuliah / Keduanya) dan Satuan Durasi (bulan / tahun / semester) dari daftar pilihan pada sel.'],
  ['Tanggal', 'Gunakan tanggal lengkap, contoh 2026-07-01. Jangan mengisi perkiraan jika belum pasti.'],
  ['', ''],
  ['2. Isi Kriteria', 'Satu baris untuk satu syarat. Ulangi Nama Beasiswa dan Jenjang persis seperti pada tab Beasiswa.'],
  ['Syarat wajib', 'Isi minimal satu syarat resmi per program; maksimal 30 syarat per program. Jangan mengarang syarat.'],
  ['Contoh syarat', 'Nama Syarat: Rata-rata rapor minimum; Jenis Kriteria: Rata-rata Rapor; Operator: >=; Nilai Syarat: 85.'],
  ['Bobot', 'Opsional, angka 0,01\u2013999,99. Kosongkan untuk memakai bobot standar.'],
  ['Data angka', 'Penghasilan dalam rupiah tanpa Rp/pemisah ribuan. IPK menggunakan titik desimal, contoh 3.5.'],
  ['', ''],
  ['3. Unggah dan periksa', 'Simpan sebagai .xlsx, unggah di Impor Beasiswa, periksa pratinjau, lalu konfirmasi penyimpanan.'],
  ['Baris kosong', 'Abaikan baris yang tidak dipakai. Contoh di panduan ini tidak ikut diimpor.'],
  ['', ''],
  ['Catatan Tambahan', ''],
  ['Durasi', 'Isi hanya jika diketahui. Jika Durasi diisi, Satuan Durasi juga wajib dipilih.'],
  ['Jenis kriteria khusus', 'Syarat eligibilitas dengan konfigurasi khusus dapat ditambahkan lewat formulir edit beasiswa.'],
];
PANDUAN_ROWS.forEach(([a, b]) => { si(a); si(b); });

// ── styles.xml ─────────────────────────────────────────────────────────────
// styleId 0 = default, 1 = header (purple bg, white bold text), 2 = bold title
function buildStyles() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/><color rgb="FFFFFFFF"/></font>
    <font><b/><sz val="12"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF6B21A8"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF3E8FF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCCCCCC"/></left>
      <right style="thin"><color rgb="FFCCCCCC"/></right>
      <top style="thin"><color rgb="FFCCCCCC"/></top>
      <bottom style="thin"><color rgb="FFCCCCCC"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="5">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="left" vertical="center" wrapText="0"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
  </cellXfs>
</styleSheet>`;
}

// ── sharedStrings.xml ──────────────────────────────────────────────────────
function buildSharedStrings() {
  const items = strings.map(s => `<si><t xml:space="preserve">${esc(s)}</t></si>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">${items}</sst>`;
}

// ── worksheet XML helpers ──────────────────────────────────────────────────
// s=0 normal, s=1 header purple, s=2 bold title, s=3 panduan key, s=4 data row
function cellRef(col, row) { return `${colLetter(col)}${row}`; }

function strCell(col, row, str, s = 0) {
  const idx = si(str);
  return `<c r="${cellRef(col, row)}" t="s"${s ? ` s="${s}"` : ''}><v>${idx}</v></c>`;
}

function emptyCell(col, row, s) {
  return s ? `<c r="${cellRef(col, row)}" s="${s}"/>` : '';
}

// Build a worksheet with purple header row + blank data rows + named table
function buildDataSheet(cols, tableId, tableName, dropdowns = {}) {
  const lastCol = colLetter(cols.length - 1);
  const lastRow = DATA_ROWS + 1;

  // Header row
  const headerCells = cols.map((c, i) => strCell(i, 1, c, 1)).join('');

  // Data rows (blank, with style s=4 for borders)
  let dataRows = '';
  for (let r = 2; r <= lastRow; r++) {
    const cells = cols.map((_, i) => emptyCell(i, r, 4)).join('');
    dataRows += `<row r="${r}" spans="1:${cols.length}">${cells}</row>`;
  }

  // Data validations for dropdowns
  let dvXml = '';
  if (Object.keys(dropdowns).length) {
    const dvs = Object.entries(dropdowns).map(([colIdx, values]) => {
      const col = colLetter(Number(colIdx));
      const formula = `"${values.join(',')}"`;
      return `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="${col}2:${col}${lastRow}"><formula1>${esc(formula)}</formula1></dataValidation>`;
    }).join('');
    dvXml = `<dataValidations count="${Object.keys(dropdowns).length}">${dvs}</dataValidations>`;
  }

  // Column widths
  const colDefs = cols.map((c, i) => {
    const w = Math.max(c.length * 1.3, 12);
    return `<col min="${i + 1}" max="${i + 1}" width="${w.toFixed(1)}" customWidth="1"/>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetView tabSelected="0" workbookViewId="0"><selection activeCell="A2" sqref="A2"/></sheetView>
  <cols>${colDefs}</cols>
  <sheetData>
    <row r="1" spans="1:${cols.length}" ht="20" customHeight="1">${headerCells}</row>
    ${dataRows}
  </sheetData>
  ${dvXml}
  <tableParts count="1"><tablePart r:id="rId1"/></tableParts>
</worksheet>`;
}

// Build Panduan worksheet
function buildPanduanSheet() {
  let rows = '';
  PANDUAN_ROWS.forEach(([a, b], i) => {
    const r = i + 1;
    const isTitle = r === 1;
    const isSection = a.startsWith('1.') || a.startsWith('2.') || a.startsWith('3.') || a === 'Catatan Tambahan';
    const sA = isTitle ? 2 : (isSection ? 3 : (a ? 0 : 0));
    const sB = isTitle ? 2 : 0;
    const ca = a ? strCell(0, r, a, sA) : emptyCell(0, r, 0);
    const cb = b ? strCell(1, r, b, sB) : '';
    rows += `<row r="${r}">${ca}${cb}</row>`;
  });
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetView tabSelected="0" workbookViewId="0"/>
  <cols>
    <col min="1" max="1" width="28" customWidth="1"/>
    <col min="2" max="2" width="70" customWidth="1"/>
  </cols>
  <sheetData>${rows}</sheetData>
</worksheet>`;
}

// ── table XML ──────────────────────────────────────────────────────────────
function buildTable(id, name, cols, lastRow) {
  const lastCol = colLetter(cols.length - 1);
  const ref = `A1:${lastCol}${lastRow}`;
  const colDefs = cols.map((c, i) =>
    `<tableColumn id="${i + 1}" name="${esc(c)}" totalsRowLabel="${esc(c)}"/>`
  ).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  id="${id}" name="${name}" displayName="${name}" ref="${ref}" totalsRowShown="0">
  <autoFilter ref="${ref}"/>
  <tableColumns count="${cols.length}">${colDefs}</tableColumns>
  <tableStyleInfo name="TableStyleMedium2" showFirstColumn="0" showLastColumn="0"
    showRowStripes="1" showColumnStripes="0"/>
</table>`;
}

// ── workbook.xml ───────────────────────────────────────────────────────────
function buildWorkbook() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Beasiswa" sheetId="1" r:id="rId1"/>
    <sheet name="Kriteria" sheetId="2" r:id="rId2"/>
    <sheet name="Panduan" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>`;
}

// ── ZIP builder (no native zip dependency) ─────────────────────────────────
// We use a simple local CRC32 + DEFLATE implementation via Node's zlib
function crc32(buf) {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = -1;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function uint16LE(n) { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; }
function uint32LE(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0); return b; }

async function buildZip(files) {
  // files: [{name: string, data: Buffer|string}]
  const entries = [];
  let offset = 0;
  const parts = [];

  for (const { name, data } of files) {
    const content = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const compressed = zlib.deflateRawSync(content, { level: 6 });
    const crc = crc32(content);
    const nameBytes = Buffer.from(name, 'utf8');
    const dosDate = 0x5720; // 2026-xx-xx approximate
    const dosTime = 0x0000;

    const local = Buffer.concat([
      Buffer.from([0x50, 0x4B, 0x03, 0x04]), // local file header sig
      uint16LE(20),          // version needed
      uint16LE(0),           // flags
      uint16LE(8),           // deflate
      uint16LE(dosTime),
      uint16LE(dosDate),
      uint32LE(crc),
      uint32LE(compressed.length),
      uint32LE(content.length),
      uint16LE(nameBytes.length),
      uint16LE(0),           // extra len
      nameBytes,
      compressed,
    ]);
    parts.push(local);
    entries.push({ name, crc, compressedSize: compressed.length, uncompressedSize: content.length, offset, nameBytes, dosDate, dosTime });
    offset += local.length;
  }

  // Central directory
  const cdParts = [];
  for (const e of entries) {
    cdParts.push(Buffer.concat([
      Buffer.from([0x50, 0x4B, 0x01, 0x02]),
      uint16LE(20), uint16LE(20),
      uint16LE(0), uint16LE(8),
      uint16LE(e.dosTime), uint16LE(e.dosDate),
      uint32LE(e.crc),
      uint32LE(e.compressedSize),
      uint32LE(e.uncompressedSize),
      uint16LE(e.nameBytes.length),
      uint16LE(0), uint16LE(0), uint16LE(0), uint16LE(0),
      uint32LE(0),
      uint32LE(e.offset),
      e.nameBytes,
    ]));
  }
  const cd = Buffer.concat(cdParts);
  const cdOffset = offset;
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x05, 0x06]),
    uint16LE(0), uint16LE(0),
    uint16LE(entries.length), uint16LE(entries.length),
    uint32LE(cd.length),
    uint32LE(cdOffset),
    uint16LE(0),
  ]);
  return Buffer.concat([...parts, cd, eocd]);
}

// ── Relationships XML ──────────────────────────────────────────────────────
const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/tables/table1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>
  <Override PartName="/xl/tables/table2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

const WB_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

function sheetRels(tableId) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table${tableId}.xml"/>
</Relationships>`;
}

// ── Main ───────────────────────────────────────────────────────────────────
const sheet1 = buildDataSheet(BEASISWA_COLS, 1, 'TabelBeasiswa', {
  1: JENJANG_VALUES,
  3: SATUAN_DURASI_VALUES,
});
const sheet2 = buildDataSheet(KRITERIA_COLS, 2, 'TabelKriteria', {
  1: JENJANG_VALUES,
  3: JENIS_KRITERIA_VALUES,
  4: OPERATOR_VALUES,
});
const sheet3 = buildPanduanSheet();

const table1 = buildTable(1, 'TabelBeasiswa', BEASISWA_COLS, DATA_ROWS + 1);
const table2 = buildTable(2, 'TabelKriteria', KRITERIA_COLS, DATA_ROWS + 1);

// Force shared strings to be fully populated now
buildSharedStrings(); // populates strings array via si() calls

const files = [
  { name: '[Content_Types].xml', data: CONTENT_TYPES },
  { name: '_rels/.rels', data: ROOT_RELS },
  { name: 'xl/workbook.xml', data: buildWorkbook() },
  { name: 'xl/_rels/workbook.xml.rels', data: WB_RELS },
  { name: 'xl/styles.xml', data: buildStyles() },
  { name: 'xl/sharedStrings.xml', data: buildSharedStrings() },
  { name: 'xl/worksheets/sheet1.xml', data: sheet1 },
  { name: 'xl/worksheets/sheet2.xml', data: sheet2 },
  { name: 'xl/worksheets/sheet3.xml', data: sheet3 },
  { name: 'xl/worksheets/_rels/sheet1.xml.rels', data: sheetRels(1) },
  { name: 'xl/worksheets/_rels/sheet2.xml.rels', data: sheetRels(2) },
  { name: 'xl/tables/table1.xml', data: table1 },
  { name: 'xl/tables/table2.xml', data: table2 },
];

const zipBuf = await buildZip(files);
const outPath = path.resolve('public/templates/template-katalog-beasiswa.xlsx');
fs.writeFileSync(outPath, zipBuf);
console.log(`Written ${zipBuf.length} bytes → ${outPath}`);
console.log('Sheets: Beasiswa (' + BEASISWA_COLS.length + ' cols), Kriteria (' + KRITERIA_COLS.length + ' cols), Panduan');
console.log('Purple header fill: #6B21A8  (fillId=2, fontId=1 white bold)');

