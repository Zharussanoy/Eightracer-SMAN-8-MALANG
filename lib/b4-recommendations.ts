export interface RecommendationRanking { status: string | null; reason: string | null; similarity: number | null; rank: number | null }
export interface RecommendationCandidate {
  id: number;
  name: string;
  level: string | null;
  provider: string | null;
  period: string | null;
  opens: string | null;
  closes: string | null;
  duration: number | null;
  durationUnit: string | null;
  context: string | null;
  score: number | null;
  complete: boolean | null;
  meets: boolean | null;
  checklist: { criterion: string; operator: string | null; required: string | null; status: string | null }[];
  ranking: RecommendationRanking;
}
export interface RecommendationPreview { targetLevel: "SMA" | "Kuliah"; ranking: RecommendationRanking; candidates: RecommendationCandidate[] }
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Struktur pratinjau belum sesuai kontrak.");
  return value as Record<string, unknown>;
}
function text(value: unknown) { return typeof value === "string" && value.trim() ? value : null; }
function numeric(value: unknown): number | null {
  if (typeof value !== "number" && !(typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value))) return null;
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : null;
}
function bounded(value: unknown, max: number): number | null {
  const result = numeric(value);
  if (result !== null && result > max) throw new Error("Skor pratinjau di luar rentang kontrak.");
  return result;
}
function integer(value: unknown): number | null {
  const result = numeric(value);
  return result !== null && Number.isSafeInteger(result) && result > 0 ? result : null;
}
function calendar(value: unknown) { return typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) ? value.slice(0, 10) : null; }
function ranking(value: unknown): RecommendationRanking {
  const row = record(value ?? {});
  return { status: text(row.status), reason: text(row.alasan_status), similarity: bounded(row.skor_kemiripan, 1), rank: integer(row.peringkat) };
}
function scalar(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return String(value);
  return null;
}
export function parseRecommendationPreview(payload: unknown): RecommendationPreview {
  const root = record(record(payload).data);
  if (root.target_jenjang !== "SMA" && root.target_jenjang !== "Kuliah") throw new Error("Jenjang pratinjau belum sesuai kontrak.");
  if (!Array.isArray(root.kandidat)) throw new Error("Kandidat pratinjau belum sesuai kontrak.");
  return { targetLevel: root.target_jenjang, ranking: ranking(root.pemeringkatan_ml), candidates: root.kandidat.map((value) => {
    const row = record(value), catalog = record(row.beasiswa), evaluation = record(row.evaluasi);
    const id = integer(row.beasiswa_id), name = text(catalog.nama_beasiswa);
    if (!id || !name || !Array.isArray(evaluation.checklist)) throw new Error("Evaluasi kandidat belum sesuai kontrak.");
    return { id, name, level: text(catalog.jenjang), provider: text(catalog.penyelenggara), period: text(catalog.periode_apply),
      opens: calendar(catalog.tanggal_buka), closes: calendar(catalog.tanggal_tutup), duration: bounded(catalog.durasi, 100), durationUnit: text(catalog.satuan_durasi), context: text(catalog.konteks),
      score: bounded(evaluation.skor, 100), complete: typeof evaluation.lengkap === "boolean" ? evaluation.lengkap : null,
      meets: typeof evaluation.memenuhi === "boolean" ? evaluation.memenuhi : null,
      checklist: evaluation.checklist.map((value) => {
        const criterion = record(value), name = text(criterion.kriteria);
        if (!name) throw new Error("Kriteria pratinjau belum sesuai kontrak.");
        return { criterion: name, operator: text(criterion.operator), required: scalar(criterion.syarat), status: text(criterion.status) };
      }), ranking: ranking(evaluation.pemeringkatan_ml) };
  }) };
}
export function recommendationEligibility(candidate: Pick<RecommendationCandidate, "complete" | "meets">) {
  if (candidate.complete !== true || candidate.meets === null) return "Belum dapat dinilai lengkap";
  return candidate.meets ? "Memenuhi kriteria saat ini" : "Belum memenuhi kriteria";
}

export function recommendationCriterionLabel(field:string){
 const labels:Record<string,string>={nilai_tka:"Nilai TKA",rata_rapor:"Rata-rata rapor semester 1-5",penghasilan_orang_tua:"Penghasilan orang tua",
 persentase_kehadiran:"Kehadiran",jumlah_prestasi:"Jumlah prestasi terverifikasi",skor_prestasi:"Skor prestasi",bantuan_sosial_sesuai:"Bantuan sosial",
 jumlah_organisasi:"Pengalaman organisasi",poin_karakter:"Poin karakter",ipk:"IPK",semester_kuliah:"Semester kuliah",status_eligible:"Status kelayakan program"};
 return labels[field]??field;
}
export function recommendationStatusLabel(value:string|null){
 const labels:Record<string,string>={pending:"Draft menunggu peninjauan",disetujui:"Sudah dipublikasikan",ditolak:"Tidak dipublikasikan",
 applied:"Pemeringkatan digunakan",fallback:"Menggunakan urutan pemeriksaan kriteria",profile_insufficient:"Data minat siswa belum cukup untuk pemeringkatan ML.",
 catalog_insufficient:"Deskripsi katalog belum cukup untuk pemeringkatan ML.",catalog_limit:"Jumlah katalog melebihi batas pemeringkatan.",
 no_eligible_alternatives:"Belum ada dua kandidat yang memenuhi syarat untuk dibandingkan.",no_eligible_overlap:"Belum ada kesamaan data minat dengan deskripsi program.",
 no_discriminative_signal:"Data belum cukup membedakan urutan kandidat.",criteria_incomplete:"Data pemeriksaan kriteria belum lengkap.",
 criteria_not_met:"Kriteria program belum terpenuhi.",disabled:"Pemeringkatan kemiripan teks dinonaktifkan.",ready:"Pemeringkatan siap digunakan"};
 return value?labels[value]??value.replaceAll("_"," "):"Belum tersedia";
}
