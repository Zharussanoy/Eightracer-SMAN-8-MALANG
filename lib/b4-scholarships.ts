export type ScholarshipLevel = "SMA" | "Kuliah" | "Keduanya";

export const REGISTRATION_STATUS_LABELS = {
  tidak_tersedia: "Tidak tersedia",
  ditutup: "Ditutup",
  belum_dibuka: "Belum dibuka",
  dibuka: "Dibuka",
  belum_ditentukan: "Jadwal belum ditentukan",
} as const;
export type RegistrationStatus = keyof typeof REGISTRATION_STATUS_LABELS;

export interface ScholarshipCriterion {
  nama_kriteria: string;
  tipe_kriteria: string;
  operator: string;
  nilai_kriteria: string;
  bobot?: number;
}

export interface ScholarshipInput {
  nama_beasiswa: string;
  jenjang: ScholarshipLevel;
  durasi?: number | null;
  satuan_durasi?: string | null;
  periode_apply?: string | null;
  is_active: boolean;
  penyelenggara?: string | null;
  deskripsi?: string | null;
  link_pendaftaran?: string | null;
  tanggal_buka?: string | null;
  tanggal_tutup?: string | null;
  program_eligibilitas_id?: number | null;
  kriteria: ScholarshipCriterion[];
}

export interface ScholarshipRow {
  id: number;
  name: string;
  level: ScholarshipLevel;
  active: boolean;
  programStatus?: "aktif" | "diarsipkan";
  registrationStatus?: RegistrationStatus;
  opens: string | null;
  closes: string | null;
  duration?: number | null;
  durationUnit?: string | null;
  applyPeriod?: string | null;
  input?: ScholarshipInput;
}

export interface ScholarshipPage {
  data: ScholarshipRow[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export function scholarshipQuery(search: string, level: string, page: number) {
  const query = new URLSearchParams({ page: String(page) });
  if (search.trim()) query.set("search", search.trim());
  if (level) query.set("jenjang", level);
  return query.toString();
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Respons katalog belum sesuai kontrak.");
  return value as Record<string, unknown>;
}

function integer(value: unknown, minimum: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) throw new Error("Paginasi katalog belum sesuai kontrak.");
  return value;
}

function date(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error("Tanggal katalog belum sesuai kontrak.");
  }
  return value.slice(0, 10);
}

// Menerima paginator Laravel biasa atau Resource dengan meta. URL pagination BE
// tidak diteruskan: browser hanya mengakses route FE yang tetap.
export function parseScholarshipPage(payload: unknown): ScholarshipPage {
  const root = object(payload);
  const pagination = root.meta === undefined ? root : object(root.meta);
  if (!Array.isArray(root.data)) throw new Error("Daftar katalog belum sesuai kontrak.");
  const result: ScholarshipPage = {
    data: root.data.map(parseScholarshipRow),
    currentPage: integer(pagination.current_page, 1), lastPage: integer(pagination.last_page, 1),
    perPage: integer(pagination.per_page, 1), total: integer(pagination.total, 0),
  };
  if (result.data.length > result.perPage || result.data.length > result.total) throw new Error("Jumlah katalog belum sesuai kontrak.");
  return result;
}

export function parseScholarshipRow(value: unknown): ScholarshipRow {
  const row = object(value);
  if (typeof row.nama_beasiswa !== "string" || !row.nama_beasiswa.trim()
    || !["SMA", "Kuliah", "Keduanya"].includes(String(row.jenjang)) || typeof row.is_active !== "boolean") {
    throw new Error("Data katalog belum sesuai kontrak.");
  }
  if (row.status_pendaftaran != null && (typeof row.status_pendaftaran !== 'string' || !Object.hasOwn(REGISTRATION_STATUS_LABELS, row.status_pendaftaran))) throw new Error('Status pendaftaran belum sesuai kontrak.');
  if (row.periode_apply != null && (typeof row.periode_apply !== 'string' || row.periode_apply.length > 255)) throw new Error('Periode katalog belum sesuai kontrak.');
  const nullableText = (value: unknown) => typeof value === "string" ? value : null;
  const durationValue = typeof row.durasi === "number" ? row.durasi
    : typeof row.durasi === "string" && /^\d+(?:\.\d+)?$/.test(row.durasi) ? Number(row.durasi) : null;
  const duration = durationValue !== null && Number.isFinite(durationValue) && durationValue > 0 ? durationValue : null;
  const result: ScholarshipRow = { id: integer(row.id, 1), name: row.nama_beasiswa,
    level: row.jenjang as ScholarshipLevel, active: row.is_active,
    programStatus: row.status_program === "aktif" || row.status_program === "diarsipkan"
      ? row.status_program : row.is_active ? "aktif" : "diarsipkan",
    registrationStatus: typeof row.status_pendaftaran === "string" && Object.hasOwn(REGISTRATION_STATUS_LABELS, row.status_pendaftaran)
      ? row.status_pendaftaran as RegistrationStatus : "belum_ditentukan",
    opens: date(row.tanggal_buka), closes: date(row.tanggal_tutup),
    duration, durationUnit: nullableText(row.satuan_durasi), applyPeriod: nullableText(row.periode_apply) };
  if (Array.isArray(row.kriteria)) {
    const criteria = row.kriteria.map((value) => {
      const criterion = object(value);
      if (!["nama_kriteria", "tipe_kriteria", "operator", "nilai_kriteria"].every((field) => typeof criterion[field] === "string")) {
        throw new Error("Kriteria katalog belum sesuai kontrak.");
      }
      const weight = typeof criterion.bobot === "number" ? criterion.bobot
        : typeof criterion.bobot === "string" && /^\d+(?:\.\d+)?$/.test(criterion.bobot) ? Number(criterion.bobot) : undefined;
      return { nama_kriteria: criterion.nama_kriteria as string, tipe_kriteria: criterion.tipe_kriteria as string,
        operator: criterion.operator as string, nilai_kriteria: criterion.nilai_kriteria as string,
        ...(weight !== undefined && Number.isFinite(weight) ? { bobot: weight } : {}) };
    });
    result.input = { nama_beasiswa: result.name, jenjang: result.level, is_active: result.active, kriteria: criteria,
      ...("durasi" in row ? { durasi: duration } : {}),
      ...("satuan_durasi" in row ? { satuan_durasi: result.durationUnit } : {}),
      ...("periode_apply" in row ? { periode_apply: result.applyPeriod } : {}),
      ...("penyelenggara" in row ? { penyelenggara: nullableText(row.penyelenggara) } : {}),
      ...("deskripsi" in row ? { deskripsi: nullableText(row.deskripsi) } : {}),
      ...("link_pendaftaran" in row ? { link_pendaftaran: nullableText(row.link_pendaftaran) } : {}),
      ...("tanggal_buka" in row ? { tanggal_buka: result.opens } : {}),
      ...("tanggal_tutup" in row ? { tanggal_tutup: result.closes } : {}),
      ...("program_eligibilitas_id" in row ? { program_eligibilitas_id: typeof row.program_eligibilitas_id === "number" ? row.program_eligibilitas_id : null } : {}) };
  }
  return result;
}

export function scholarshipDuration(row: ScholarshipRow) {
  if (row.duration == null) return "Belum tercatat";
  const unit = row.durationUnit === "semester" ? "Semester" : row.durationUnit === "tahun" ? "Tahun" : row.durationUnit ?? "";
  return `${row.duration} ${unit}`.trim();
}

export function scholarshipRegistrationLabel(row: ScholarshipRow) {
  return REGISTRATION_STATUS_LABELS[row.registrationStatus ?? "belum_ditentukan"];
}

export function scholarshipPeriod(row: ScholarshipRow) {
  const format = (value: string) => new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
  if (!row.opens && !row.closes) return row.applyPeriod ? `${row.applyPeriod} (tanggal belum ditentukan)` : "Belum tercatat";
  if (!row.opens) return `Sampai ${format(row.closes!)}`;
  if (!row.closes) return `Mulai ${format(row.opens)}`;
  return `${format(row.opens)} – ${format(row.closes)}`;
}

// Compatibility for the existing status tests and earlier clients.
export const registrationStatusLabels = REGISTRATION_STATUS_LABELS;
