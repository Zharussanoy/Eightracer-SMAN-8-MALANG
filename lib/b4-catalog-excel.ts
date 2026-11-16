import { parseCatalogCsvRows, type CatalogCsvRow } from "./b4-catalog-csv";

export const PROGRAM_COLUMNS = ["Nama Beasiswa", "Jenjang", "Durasi", "Satuan Durasi", "Periode Pendaftaran", "Penyelenggara", "Deskripsi", "Tanggal Buka", "Tanggal Tutup", "Link Pendaftaran"] as const;
export const CRITERIA_COLUMNS = ["Nama Beasiswa", "Jenjang", "Nama Syarat", "Jenis Kriteria", "Operator", "Nilai Syarat", "Bobot"] as const;
export const UNIFIED_CATALOG_COLUMNS = [
  "Nama Beasiswa", "Jenjang", "Durasi", "Satuan Durasi", "Periode Pendaftaran",
  "Penyelenggara", "Deskripsi", "Tanggal Buka", "Tanggal Tutup", "Link Pendaftaran",
  "Nama Syarat", "Jenis Kriteria", "Operator", "Nilai Syarat", "Bobot"
] as const;
export const CRITERIA_FIELDS: Record<string, string> = {
  "Nilai TKA": "nilai_tka", "Rata-rata Rapor": "rata_rapor", "Rapor Kelas 12": "rata_rapor_kelas_12",
  "Penghasilan Orang Tua": "penghasilan_orang_tua", "Kehadiran (%)": "persentase_kehadiran",
  "Jumlah Prestasi": "jumlah_prestasi", "Jumlah Organisasi": "jumlah_organisasi", "Poin Karakter": "poin_karakter",
  IPK: "ipk", "Semester Kuliah": "semester_kuliah",
};
type Row = Record<string, unknown>;
const text = (v: unknown) => v === null || v === undefined ? "" : String(v).trim();
const key = (r: Row) => `${text(r["Nama Beasiswa"]).toLocaleLowerCase("id")}:${text(r.Jenjang)}`;
const populated = (r: Row) => Object.entries(r).some(([k, v]) => k !== "__rowNum__" && text(v));
const line = (r: Row, index: number) => typeof r.__rowNum__ === "number" ? r.__rowNum__ + 1 : index + 2;
function checkColumns(rows: Row[], columns: readonly string[], sheet: string) {
  for (const r of rows) if (Object.keys(r).some((k) => k !== "__rowNum__" && !columns.includes(k))) throw new Error(`Kolom tab ${sheet} tidak sesuai template. Jangan mengubah judul kolom.`);
}
export function parseCatalogExcelRows(programRows: Row[], criteriaRows: Row[]): CatalogCsvRow[] {
  const programs = programRows.filter(populated), criteria = criteriaRows.filter(populated);
  if (!programs.length || programs.length > 20) throw new Error("Isi 1–20 beasiswa pada tab Beasiswa.");
  if (criteria.length > 600) throw new Error("Maksimal 600 baris kriteria per file.");
  checkColumns(programs, PROGRAM_COLUMNS, "Beasiswa"); checkColumns(criteria, CRITERIA_COLUMNS, "Kriteria");
  const programKeys = new Set(programs.map(key));
  const criteriaByProgram = new Map<string, Row[]>();
  for (const row of criteria) {
    if (!programKeys.has(key(row))) throw new Error(`Kriteria baris ${line(row, criteria.indexOf(row))}: Nama Beasiswa dan Jenjang harus cocok dengan tab Beasiswa.`);
    criteriaByProgram.set(key(row), [...(criteriaByProgram.get(key(row)) ?? []), row]);
  }
  const extraErrors: string[][] = [];
  const mapped = programs.map((r) => {
    const errors: string[] = [];
    const rules = (criteriaByProgram.get(key(r)) ?? []).map((c, i) => {
      const label = text(c["Jenis Kriteria"]);
      const field = Object.hasOwn(CRITERIA_FIELDS, label) ? CRITERIA_FIELDS[label] : undefined;
      const op = text(c.Operator), value = text(c["Nilai Syarat"]), weight = text(c.Bobot);
      const prefix = `Kriteria baris ${line(c, i)}`;
      if (!field) errors.push(`${prefix}: pilih Jenis Kriteria dari daftar.`);
      if (![">=", "<=", "=", "!=", ">", "<"].includes(op)) errors.push(`${prefix}: operator tidak valid.`);
      if (!/^-?\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value))) errors.push(`${prefix}: Nilai Syarat harus angka, gunakan titik untuk desimal.`);
      if (weight && (!/^\d+(?:\.\d+)?$/.test(weight) || Number(weight) < 0.01 || Number(weight) > 999.99)) errors.push(`${prefix}: Bobot harus 0.01–999.99 atau kosong.`);
      return { nama_kriteria: text(c["Nama Syarat"]), tipe_kriteria: field ?? "", operator: op, nilai_kriteria: value, ...(weight ? { bobot: Number(weight) } : {}) };
    });
    if (rules.length > 30) errors.push("Maksimal 30 kriteria per beasiswa.");
    extraErrors.push(errors);
    return { nama_beasiswa: text(r["Nama Beasiswa"]), jenjang: text(r.Jenjang), durasi: text(r.Durasi), satuan_durasi: text(r["Satuan Durasi"]), periode_apply: text(r["Periode Pendaftaran"]), penyelenggara: text(r.Penyelenggara), deskripsi: text(r.Deskripsi), tanggal_buka: text(r["Tanggal Buka"]), tanggal_tutup: text(r["Tanggal Tutup"]), link_pendaftaran: text(r["Link Pendaftaran"]), kriteria_json: JSON.stringify(rules) };
  });
  return parseCatalogCsvRows(mapped).map((result, i) => {
    const errors = [...result.errors.map((error) => error.startsWith("kriteria_json") ? "Isi minimal satu syarat lengkap pada tab Kriteria." : error), ...extraErrors[i]];
    return { line: line(programs[i], i), errors, ...(!errors.length && result.input ? { input: result.input } : {}) };
  });
}
