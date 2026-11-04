export interface RecommendationStudent { id: number; name: string; cohort: string | null }
export interface RecommendationStudentPage { data: RecommendationStudent[]; currentPage: number; lastPage: number; perPage: number; total: number }
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Struktur daftar siswa belum sesuai kontrak.");
  return value as Record<string, unknown>;
}
function integer(value: unknown, minimum: number) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) throw new Error("Paginasi siswa belum sesuai kontrak.");
  return value;
}
export function parseRecommendationStudents(payload: unknown): RecommendationStudentPage {
  const outer = record(payload);
  const root = Array.isArray(outer.data) ? outer : record(outer.data);
  const meta = root.meta === undefined ? root : record(root.meta);
  if (!Array.isArray(root.data)) throw new Error("Daftar siswa belum sesuai kontrak.");
  const data = root.data.map((value) => {
    const row = record(value);
    if (typeof row.nama_lengkap !== "string" || !row.nama_lengkap.trim()) throw new Error("Nama siswa belum sesuai kontrak.");
    return { id: integer(row.id, 1), name: row.nama_lengkap, cohort: /^\d{4}$/.test(String(row.tahun_lulus)) ? String(row.tahun_lulus) : null };
  });
  const total = integer(meta.total, 0), perPage = integer(meta.per_page, 1);
  if (data.length > total || data.length > perPage) throw new Error("Jumlah siswa belum sesuai kontrak.");
  return { data, currentPage: integer(meta.current_page, 1), lastPage: integer(meta.last_page, 1), perPage, total };
}
