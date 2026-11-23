import type { ScholarshipInput, ScholarshipCriterion } from "./b4-scholarships";

export interface CatalogCsvRow { line: number; input?: ScholarshipInput; errors: string[] }

export const CATALOG_CSV_COLUMNS = [
  "nama_beasiswa", "jenjang", "durasi", "satuan_durasi", "periode_apply", "penyelenggara", "deskripsi", "tanggal_buka", "tanggal_tutup", "link_pendaftaran",
  "nama_kriteria", "tipe_kriteria", "operator", "nilai_kriteria", "bobot", "kriteria_json"
] as const;

export const CRITERIA_FIELDS: Record<string, string> = {
  "nilai tka": "nilai_tka",
  "nilai_tka": "nilai_tka",
  "rata-rata rapor": "rata_rapor",
  "rata_rata_rapor": "rata_rapor",
  "rata_rapor": "rata_rapor",
  "rapor": "rata_rapor",
  "rapor kelas 12": "rata_rapor_kelas_12",
  "rata_rapor_kelas_12": "rata_rapor_kelas_12",
  "penghasilan orang tua": "penghasilan_orang_tua",
  "penghasilan_orang_tua": "penghasilan_orang_tua",
  "kehadiran (%)": "persentase_kehadiran",
  "kehadiran": "persentase_kehadiran",
  "persentase_kehadiran": "persentase_kehadiran",
  "persentase kehadiran": "persentase_kehadiran",
  "jumlah prestasi": "jumlah_prestasi",
  "jumlah_prestasi": "jumlah_prestasi",
  "prestasi": "jumlah_prestasi",
  "skor prestasi": "skor_prestasi",
  "skor_prestasi": "skor_prestasi",
  "bantuan sosial sesuai": "bantuan_sosial_sesuai",
  "bantuan_sosial_sesuai": "bantuan_sosial_sesuai",
  "jumlah organisasi": "jumlah_organisasi",
  "jumlah_organisasi": "jumlah_organisasi",
  "organisasi": "jumlah_organisasi",
  "poin karakter": "poin_karakter",
  "poin_karakter": "poin_karakter",
  "ipk": "ipk",
  "semester kuliah": "semester_kuliah",
  "semester_kuliah": "semester_kuliah",
  "status eligible": "status_eligible",
  "status_eligible": "status_eligible",
};

export function normalizeCriteriaType(val: string): string | undefined {
  const key = val.trim().toLowerCase();
  return Object.hasOwn(CRITERIA_FIELDS, key) ? CRITERIA_FIELDS[key] : undefined;
}

export function normalizeKey(k: string): string | null {
  const lower = k.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/\s+/g, "_");
  const match = lower.match(/^(.*?)_?(\d+)$/);
  const base = match ? match[1] : lower;
  const num = match ? `_${match[2]}` : "";

  switch (base) {
    case "nama_beasiswa":
    case "nama":
      return `nama_beasiswa${num}`;
    case "jenjang":
      return `jenjang${num}`;
    case "durasi":
      return `durasi${num}`;
    case "satuan_durasi":
      return `satuan_durasi${num}`;
    case "periode_apply":
    case "periode_pendaftaran":
    case "periode":
      return `periode_apply${num}`;
    case "penyelenggara":
      return `penyelenggara${num}`;
    case "deskripsi":
      return `deskripsi${num}`;
    case "tanggal_buka":
      return `tanggal_buka${num}`;
    case "tanggal_tutup":
      return `tanggal_tutup${num}`;
    case "link_pendaftaran":
    case "link":
      return `link_pendaftaran${num}`;
    case "nama_kriteria":
    case "nama_syarat":
      return `nama_kriteria${num}`;
    case "tipe_kriteria":
    case "jenis_kriteria":
      return `tipe_kriteria${num}`;
    case "operator":
      return `operator${num}`;
    case "nilai_kriteria":
    case "nilai_syarat":
      return `nilai_kriteria${num}`;
    case "bobot":
      return `bobot${num}`;
    case "kriteria_json":
      return "kriteria_json";
    default:
      return null;
  }
}

export function isAllowedColumn(rawKey: string): boolean {
  const k = rawKey.replace(/^\uFEFF/, "").trim().toLowerCase();
  if ((CATALOG_CSV_COLUMNS as readonly string[]).includes(k as typeof CATALOG_CSV_COLUMNS[number])) return true;
  const normalized = normalizeKey(k);
  if (!normalized) return false;
  return /^(nama_beasiswa|jenjang|durasi|satuan_durasi|periode_apply|penyelenggara|deskripsi|tanggal_buka|tanggal_tutup|link_pendaftaran|kriteria_json|(nama_kriteria|tipe_kriteria|operator|nilai_kriteria|bobot)(_\d+)?)$/.test(normalized);
}

export function catalogCsvTemplate() {
  const headers = [
    "nama_beasiswa", "jenjang", "durasi", "satuan_durasi", "periode_apply", "penyelenggara", "deskripsi", "tanggal_buka", "tanggal_tutup", "link_pendaftaran",
    "nama_kriteria", "tipe_kriteria", "operator", "nilai_kriteria", "bobot"
  ];
  const values = [
    "CONTOH UJI - ganti sebelum disimpan", "SMA", "1", "tahun", "Juli - Agustus", "Penyelenggara Uji", "Program uji katalog", "", "", "",
    "Nilai TKA minimum", "nilai_tka", ">=", "85", ""
  ];
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return `\uFEFF${headers.join(",")}\r\n${values.map(quote).join(",")}\r\n`;
}

function dateValid(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value; }

export function parseCatalogCsvRows(values: Record<string, unknown>[]): CatalogCsvRow[] {
  if (!values.length || values.length > 20) throw new Error("Isi 1–20 baris informasi beasiswa dalam satu file.");
  const names = new Set<string>();
  return values.map((raw, index) => {
    const errors: string[] = [];
    const rawKeys = Object.keys(raw);
    if (rawKeys.some((key) => !isAllowedColumn(key))) {
      errors.push("Ada kolom di luar template katalog. Data siswa/alumni tidak diterima.");
    }
    const row: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      const norm = normalizeKey(key);
      if (norm) {
        row[norm] = value === null || value === undefined ? "" : String(value).trim();
      }
    }

    if (!row.nama_beasiswa) errors.push("Nama beasiswa wajib diisi.");
    if (row.nama_beasiswa && /ganti sebelum disimpan/i.test(row.nama_beasiswa)) errors.push("Ganti baris contoh template dengan data beasiswa sebenarnya.");
    if (!["SMA", "Kuliah", "Keduanya"].includes(row.jenjang)) errors.push("Jenjang harus SMA, Kuliah atau Keduanya.");
    const duration = Number(row.durasi);
    if (row.durasi && (!/^\d+$/.test(row.durasi) || !Number.isSafeInteger(duration) || duration < 1 || duration > 100)) errors.push("Durasi harus bilangan bulat positif.");
    if ((row.durasi || row.satuan_durasi) && !["semester", "tahun", "bulan"].includes(row.satuan_durasi)) errors.push("Satuan durasi harus semester, tahun atau bulan.");

    for (const field of ["tanggal_buka", "tanggal_tutup"]) {
      try { if (row[field] && !dateValid(row[field])) errors.push(`${field} harus tanggal YYYY-MM-DD yang valid.`); }
      catch { errors.push(`${field} tidak valid.`); }
    }
    if (row.tanggal_buka && row.tanggal_tutup && row.tanggal_tutup < row.tanggal_buka) errors.push("Tanggal tutup harus sama atau setelah tanggal buka.");
    if (row.link_pendaftaran) {
      try { const link = new URL(row.link_pendaftaran); if (!["http:", "https:"].includes(link.protocol) || link.username || link.password) throw new Error(); }
      catch { errors.push("Link pendaftaran harus URL HTTP/HTTPS tanpa kredensial."); }
    }

    const criteria: ScholarshipCriterion[] = [];
    if (row.kriteria_json) {
      try {
        const parsed: unknown = JSON.parse(row.kriteria_json);
        if (!Array.isArray(parsed) || !parsed.length || parsed.length > 100) throw new Error();
        for (const value of parsed) {
          if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
          const entry = value as Record<string, unknown>;
          if (Object.keys(entry).some((k) => !["nama_kriteria", "tipe_kriteria", "operator", "nilai_kriteria", "bobot"].includes(k))
            || !["nama_kriteria", "tipe_kriteria", "operator", "nilai_kriteria"].every((k) => typeof entry[k] === "string" && !!String(entry[k]).trim())
            || (entry.bobot !== undefined && (typeof entry.bobot !== "number" || !Number.isFinite(entry.bobot) || entry.bobot < 0))) {
            throw new Error();
          }
          const field = normalizeCriteriaType(String(entry.tipe_kriteria)) ?? (typeof entry.tipe_kriteria === "string" ? entry.tipe_kriteria : undefined);
          if (!field) throw new Error();
          criteria.push({
            nama_kriteria: String(entry.nama_kriteria).trim(),
            tipe_kriteria: field,
            operator: String(entry.operator).trim(),
            nilai_kriteria: String(entry.nilai_kriteria).trim(),
            ...(entry.bobot === undefined ? {} : { bobot: entry.bobot as number })
          });
        }
      } catch {
        errors.push("kriteria_json harus berisi array kriteria lengkap sesuai template.");
      }
    }

    // Flat combined criteria columns
    for (let i = 1; i <= 10; i++) {
      const suffix = i === 1 ? "" : `_${i}`;
      const cName = row[`nama_kriteria${suffix}`] ?? "";
      const cType = row[`tipe_kriteria${suffix}`] ?? "";
      const cOp = row[`operator${suffix}`] ?? "";
      const cVal = row[`nilai_kriteria${suffix}`] ?? "";
      const cWeight = row[`bobot${suffix}`] ?? "";

      if (!cName && !cType && !cOp && !cVal && !cWeight) continue;

      const prefix = i === 1 ? "Kriteria" : `Kriteria ${i}`;
      if (!cName) errors.push(`${prefix}: nama syarat wajib diisi.`);
      const field = normalizeCriteriaType(cType);
      if (!field) errors.push(`${prefix}: jenis kriteria '${cType}' tidak valid.`);
      if (![">=", "<=", "=", "!=", ">", "<"].includes(cOp)) errors.push(`${prefix}: operator tidak valid.`);
      if (!cVal || !/^-?\d+(?:\.\d+)?$/.test(cVal) || !Number.isFinite(Number(cVal))) errors.push(`${prefix}: nilai syarat harus angka, gunakan titik untuk desimal.`);
      let weightNum: number | undefined = undefined;
      if (cWeight) {
        weightNum = Number(cWeight);
        if (!/^\d+(?:\.\d+)?$/.test(cWeight) || !Number.isFinite(weightNum) || weightNum < 0.01 || weightNum > 999.99) {
          errors.push(`${prefix}: bobot harus 0.01–999.99 atau kosong.`);
        }
      }
      if (cName && field && [">=", "<=", "=", "!=", ">", "<"].includes(cOp) && cVal && /^-?\d+(?:\.\d+)?$/.test(cVal)) {
        criteria.push({
          nama_kriteria: cName,
          tipe_kriteria: field,
          operator: cOp,
          nilai_kriteria: cVal,
          ...(weightNum !== undefined ? { bobot: weightNum } : {})
        });
      }
    }

    if (!row.kriteria_json && !criteria.length) {
      errors.push("Isi minimal satu kriteria kelayakan beasiswa.");
    }
    if (criteria.length > 30) {
      errors.push("Maksimal 30 kriteria per beasiswa.");
    }

    const key = `${row.nama_beasiswa?.toLocaleLowerCase("id")}:${row.jenjang}`;
    if (names.has(key)) errors.push("Nama dan jenjang yang sama berulang dalam file.");
    names.add(key);

    const input: ScholarshipInput = {
      nama_beasiswa: row.nama_beasiswa,
      jenjang: row.jenjang as ScholarshipInput["jenjang"],
      durasi: row.durasi ? duration : null,
      satuan_durasi: row.durasi ? row.satuan_durasi : null,
      periode_apply: row.periode_apply || null,
      is_active: true,
      penyelenggara: row.penyelenggara || null,
      deskripsi: row.deskripsi || null,
      tanggal_buka: row.tanggal_buka || null,
      tanggal_tutup: row.tanggal_tutup || null,
      link_pendaftaran: row.link_pendaftaran || null,
      kriteria: criteria
    };

    return { line: index + 2, errors, ...(errors.length ? {} : { input }) };
  });
}
