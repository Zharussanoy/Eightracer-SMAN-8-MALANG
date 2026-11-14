// Adapter for the documented /rekomendasi-beasiswa/saya paginator.
// Confirm populated snapshot/checklist fields against BE before declaring live validation complete.
export interface StudentRecommendation {
  id: number; scholarshipId: number | null; name: string; provider: string | null; level: string | null;
  funding: string | null; period: string | null; score: number | null;
  reason: string | null; preparation: string[];
  checklist: { criterion: string; status: string | null; required: string | null }[];
}
export interface StudentRecommendationPage {
  data: StudentRecommendation[]; groups: { id: number; level: "SMA" | "Kuliah"; status: "terpublikasi"; scholarshipCount: number }[]; currentPage: number; lastPage: number; perPage: number; total: number;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Struktur rekomendasi siswa belum sesuai kontrak.");
  return value as Record<string, unknown>;
}
function integer(value: unknown, min: number) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min) throw new Error("Pagination rekomendasi belum sesuai kontrak.");
  return value;
}
const text = (value: unknown) => typeof value === "string" && value.trim() ? value : null;
export function parseStudentRecommendations(payload: unknown): StudentRecommendationPage {
  const outer = record(payload), root = Array.isArray(outer.data) ? outer : record(outer.data);
  const meta = root.meta === undefined ? root : record(root.meta);
  if (!Array.isArray(root.data)) throw new Error("Daftar rekomendasi belum sesuai kontrak.");
  if (root.data.some(value => value && typeof value === "object" && Array.isArray((value as Record<string, unknown>).beasiswa))) {
    const groups = root.data.map(value => {
      const row = record(value);
      if (!Array.isArray(row.beasiswa) || typeof row.status !== "string" || row.status.trim().toLowerCase() !== "terpublikasi" || (row.target_jenjang !== "SMA" && row.target_jenjang !== "Kuliah")) throw new Error("Status atau struktur kelompok rekomendasi belum sesuai kontrak publikasi.");
      // Actual BE currently returns an empty scholarship array. Do not invent a nested-item contract.
      if (row.beasiswa.length) throw new Error("Rincian beasiswa dalam kelompok perlu dicocokkan dengan struktur BE terbaru.");
      return { id: integer(row.id, 1), level: row.target_jenjang as "SMA" | "Kuliah", status: "terpublikasi" as const, scholarshipCount: 0 };
    });
    const total = integer(meta.total, 0), perPage = integer(meta.per_page, 1), currentPage = integer(meta.current_page, 1), lastPage = integer(meta.last_page, 1);
    if (groups.length > total || groups.length > perPage || new Set(groups.map(item => item.id)).size !== groups.length || lastPage !== Math.max(1, Math.ceil(total / perPage))) throw new Error("Pagination kelompok rekomendasi belum sesuai BE.");
    return { data: [], groups, total, perPage, currentPage, lastPage };
  }
  const data = root.data.map(value => {
    const row = record(value);
    if (row.status_review !== undefined && row.status_review !== "disetujui") throw new Error("Respons rekomendasi memuat hasil yang belum disetujui.");
    const snapshot = record(row.beasiswa);
    const name = text(snapshot.nama_beasiswa);
    if (!name) throw new Error("Snapshot nama beasiswa belum tersedia pada respons BE.");
    let score: number | null = null;
    if (row.skor_kecocokan !== null && row.skor_kecocokan !== undefined) {
      if (typeof row.skor_kecocokan !== "number" && !(typeof row.skor_kecocokan === "string" && /^\d+(?:\.\d+)?$/.test(row.skor_kecocokan))) throw new Error("Skor rekomendasi belum sesuai kontrak.");
      score = Number(row.skor_kecocokan);
      if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error("Skor rekomendasi di luar rentang kontrak.");
    }
    if (row.checklist !== undefined && row.checklist !== null && !Array.isArray(row.checklist)) throw new Error("Checklist rekomendasi belum sesuai kontrak.");
    const checklist = ((row.checklist ?? []) as unknown[]).map(value => {
      const item = record(value), criterion = text(item.kriteria);
      if (!criterion) throw new Error("Nama kriteria rekomendasi belum sesuai kontrak.");
      const required = typeof item.syarat === "number" || typeof item.syarat === "boolean" ? String(item.syarat) : text(item.syarat);
      return { criterion, status: text(item.status), required };
    });
    let preparation: string[] = [];
    if (typeof row.persiapan === "string") preparation = text(row.persiapan) ? [row.persiapan] : [];
    else if (Array.isArray(row.persiapan) && row.persiapan.every(item => typeof item === "string")) preparation = row.persiapan.filter(item => item.trim());
    else if (row.persiapan != null) throw new Error("Persiapan rekomendasi belum sesuai kontrak.");
    const scholarshipId = typeof row.beasiswa_id === "number" && Number.isSafeInteger(row.beasiswa_id) && row.beasiswa_id > 0 ? row.beasiswa_id : null;
    return { id: integer(row.id, 1), scholarshipId, name, provider: text(snapshot.penyelenggara), level: text(snapshot.jenjang), funding: text(snapshot.tipe_pendanaan), period: text(snapshot.periode_apply), score, reason: text(row.alasan), preparation, checklist };
  });
  const total = integer(meta.total, 0), perPage = integer(meta.per_page, 1), currentPage = integer(meta.current_page, 1), lastPage = integer(meta.last_page, 1);
  if (data.length > perPage || data.length > total || new Set(data.map(item => item.id)).size !== data.length || lastPage !== Math.max(1, Math.ceil(total / perPage))) throw new Error("Jumlah rekomendasi belum sesuai pagination BE.");
  return { data, groups: [], total, perPage, currentPage, lastPage };
}
