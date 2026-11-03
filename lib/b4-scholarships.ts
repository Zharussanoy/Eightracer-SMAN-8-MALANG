export type ScholarshipLevel = "SMA" | "Kuliah" | "Keduanya";

export interface ScholarshipRow {
  id: number;
  name: string;
  level: ScholarshipLevel;
  active: boolean;
  opens: string | null;
  closes: string | null;
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
    data: root.data.map((value) => {
      const row = object(value);
      if (typeof row.nama_beasiswa !== "string" || !row.nama_beasiswa.trim()
        || !["SMA", "Kuliah", "Keduanya"].includes(String(row.jenjang))
        || typeof row.is_active !== "boolean") throw new Error("Data katalog belum sesuai kontrak.");
      return { id: integer(row.id, 1), name: row.nama_beasiswa, level: row.jenjang as ScholarshipLevel,
        active: row.is_active, opens: date(row.tanggal_buka), closes: date(row.tanggal_tutup) };
    }),
    currentPage: integer(pagination.current_page, 1), lastPage: integer(pagination.last_page, 1),
    perPage: integer(pagination.per_page, 1), total: integer(pagination.total, 0),
  };
  if (result.data.length > result.perPage || result.data.length > result.total) throw new Error("Jumlah katalog belum sesuai kontrak.");
  return result;
}

export function scholarshipPeriod(row: ScholarshipRow) {
  const format = (value: string) => new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
  if (!row.opens && !row.closes) return "Belum tercatat";
  if (!row.opens) return `Sampai ${format(row.closes!)}`;
  if (!row.closes) return `Mulai ${format(row.opens)}`;
  return `${format(row.opens)} – ${format(row.closes)}`;
}
