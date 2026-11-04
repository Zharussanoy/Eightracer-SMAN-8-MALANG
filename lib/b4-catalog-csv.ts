import type { ScholarshipInput, ScholarshipCriterion } from "./b4-scholarships";

export interface CatalogCsvRow { line: number; input?: ScholarshipInput; errors: string[] }
export const CATALOG_CSV_COLUMNS = ["nama_beasiswa", "jenjang", "durasi", "satuan_durasi", "periode_apply", "penyelenggara", "deskripsi", "tanggal_buka", "tanggal_tutup", "link_pendaftaran", "kriteria_json"] as const;
export function catalogCsvTemplate() {
  const values = ["CONTOH UJI - ganti sebelum disimpan", "SMA", "1", "tahun", "Juli - Agustus", "Penyelenggara Uji", "Program uji katalog", "", "", "", JSON.stringify([{ nama_kriteria: "Nilai TKA minimum", tipe_kriteria: "nilai_tka", operator: ">=", nilai_kriteria: "85" }])];
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return `\uFEFF${CATALOG_CSV_COLUMNS.join(",")}\r\n${values.map(quote).join(",")}\r\n`;
}
function dateValid(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value; }
export function parseCatalogCsvRows(values: Record<string, unknown>[]): CatalogCsvRow[] {
  if (!values.length || values.length > 20) throw new Error("Isi 1–20 baris informasi beasiswa dalam satu file CSV.");
  const names = new Set<string>();
  return values.map((raw, index) => {
    const errors: string[] = [];
    const row = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key.replace(/^\uFEFF/, "").trim(), value === null || value === undefined ? "" : String(value).trim()]));
    if (Object.keys(row).some((key) => !(CATALOG_CSV_COLUMNS as readonly string[]).includes(key))) errors.push("Ada kolom di luar template katalog. Data siswa/alumni tidak diterima.");
    if (!row.nama_beasiswa) errors.push("Nama beasiswa wajib diisi.");
    if (!["SMA", "Kuliah", "Keduanya"].includes(row.jenjang)) errors.push("Jenjang harus SMA, Kuliah atau Keduanya.");
    const duration = Number(row.durasi);
    if (!/^\d+$/.test(row.durasi ?? "") || !Number.isSafeInteger(duration) || duration < 1) errors.push("Durasi harus bilangan bulat positif.");
    if (!["semester", "tahun", "bulan"].includes(row.satuan_durasi)) errors.push("Satuan durasi harus semester, tahun atau bulan.");
    if (!row.periode_apply) errors.push("Periode apply wajib diisi.");
    for (const field of ["tanggal_buka", "tanggal_tutup"]) {
      try { if (row[field] && !dateValid(row[field])) errors.push(`${field} harus tanggal YYYY-MM-DD yang valid.`); }
      catch { errors.push(`${field} tidak valid.`); }
    }
    if (row.tanggal_buka && row.tanggal_tutup && row.tanggal_tutup < row.tanggal_buka) errors.push("Tanggal tutup harus sama atau setelah tanggal buka.");
    if (row.link_pendaftaran) {
      try { const link = new URL(row.link_pendaftaran); if (!["http:", "https:"].includes(link.protocol) || link.username || link.password) throw new Error(); }
      catch { errors.push("Link pendaftaran harus URL HTTP/HTTPS tanpa kredensial."); }
    }
    let criteria: ScholarshipCriterion[] = [];
    try {
      const parsed: unknown = JSON.parse(row.kriteria_json ?? "");
      if (!Array.isArray(parsed) || !parsed.length || parsed.length > 100) throw new Error();
      criteria = parsed.map((value) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
        const entry = value as Record<string, unknown>;
        if (Object.keys(entry).some((key) => !["nama_kriteria", "tipe_kriteria", "operator", "nilai_kriteria", "bobot"].includes(key))
          || !["nama_kriteria", "tipe_kriteria", "operator", "nilai_kriteria"].every((key) => typeof entry[key] === "string" && !!entry[key].trim())
          || (entry.bobot !== undefined && (typeof entry.bobot !== "number" || !Number.isFinite(entry.bobot) || entry.bobot < 0))) throw new Error();
        return { nama_kriteria: entry.nama_kriteria as string, tipe_kriteria: entry.tipe_kriteria as string, operator: entry.operator as string, nilai_kriteria: entry.nilai_kriteria as string, ...(entry.bobot === undefined ? {} : { bobot: entry.bobot as number }) };
      });
    } catch { errors.push("kriteria_json harus berisi array kriteria lengkap sesuai template."); }
    const key = `${row.nama_beasiswa?.toLocaleLowerCase("id")}:${row.jenjang}`;
    if (names.has(key)) errors.push("Nama dan jenjang yang sama berulang dalam file.");
    names.add(key);
    const input: ScholarshipInput = { nama_beasiswa: row.nama_beasiswa, jenjang: row.jenjang as ScholarshipInput["jenjang"], durasi: duration, satuan_durasi: row.satuan_durasi, periode_apply: row.periode_apply, is_active: true,
      penyelenggara: row.penyelenggara || null, deskripsi: row.deskripsi || null, tanggal_buka: row.tanggal_buka || null, tanggal_tutup: row.tanggal_tutup || null, link_pendaftaran: row.link_pendaftaran || null, kriteria: criteria };
    return { line: index + 2, errors, ...(errors.length ? {} : { input }) };
  });
}
