type Row = Record<string, unknown>;
export interface AnalyticStats { known: number | null; unknown: number | null; minimum: number | null; maximum: number | null; mean: number | null }
export interface AnalyticsData {
  asOf: string | null;
  notes?: string[];
  total: number | null;
  recipients: number | null;
  kipk: number | null;
  distribution: { id: number | null; label: string; count: number | null }[];
  cohorts: { label: string; count: number | null }[];
  periods: { label: string; count: number | null; kipk: number | null; scholarships: { label: string; count: number | null; processing: number | null; accepted: number | null; rejected: number | null }[] }[];
  measuredAlumni: number | null;
  ukt: AnalyticStats;
  ipk: AnalyticStats;
  ranges: { university: string; program: string; count: number | null; stats: AnalyticStats }[];
  ipkTrend: { label: string; stats: AnalyticStats }[];
}
function row(value: unknown): Row {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Struktur analitik BE belum sesuai kontrak.");
  return value as Row;
}
function text(value: unknown): string | null { return typeof value === "string" && value.trim() ? value : null; }
export function analyticNumber(value: unknown): number | null {
  if (typeof value !== "number" && !(typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value))) return null;
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : null;
}
function count(value: unknown): number | null {
  const result = analyticNumber(value);
  return result !== null && Number.isSafeInteger(result) ? result : null;
}
function rows(value: unknown): Row[] {
  if (!Array.isArray(value)) throw new Error("Daftar agregat analitik belum sesuai kontrak.");
  return value.map(row);
}
function label(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  const result = text(value);
  if (!result) throw new Error("Label agregat analitik belum sesuai kontrak.");
  return result;
}
function stats(value: unknown): AnalyticStats {
  const source = row(value);
  return { known: count(source.jumlah_diketahui), unknown: count(source.jumlah_belum_tercatat), minimum: analyticNumber(source.minimum), maximum: analyticNumber(source.maksimum), mean: analyticNumber(source.rata_rata) };
}
export function parseAnalytics(analyticsPayload: unknown, dashboardPayload: unknown): AnalyticsData {
  const analytics = row(row(analyticsPayload).data), dashboard = row(row(dashboardPayload).data);
  const result: AnalyticsData = {
    asOf: text(analytics.as_of), total: count(analytics.jumlah_alumni_tercatat),
    recipients: count(analytics.jumlah_penerima_beasiswa), kipk: count(analytics.jumlah_penerima_kipk),
    distribution: rows(analytics.distribusi_beasiswa).map((item) => ({ id: count(item.beasiswa_id), label: label(item.nama_beasiswa), count: count(item.jumlah_alumni) })),
    cohorts: rows(analytics.per_angkatan).map((item) => ({ label: label(item.angkatan ?? item.tahun_lulus), count: count(item.jumlah_penerima_kipk ?? item.penerima_kipk) })),
    periods: rows(analytics.tren_periode).map((item) => ({ label: label(item.periode), count: count(item.jumlah_alumni), kipk: count(item.penerima_kipk),
      scholarships: rows(item.beasiswa ?? []).map((program) => {
        const status = row(program.status);
        return { label: label(program.nama_beasiswa), count: count(program.jumlah_alumni), processing: count(status.proses), accepted: count(status.diterima), rejected: count(status.ditolak) };
      }) })),
    measuredAlumni: count(dashboard.jumlah_alumni), ukt: stats(dashboard.ukt), ipk: stats(dashboard.ipk),
    ranges: rows(dashboard.per_kampus_prodi).map((item) => ({ university: label(item.nama_pt ?? item.nama_perguruan_tinggi), program: label(item.program_studi), count: count(item.jumlah_alumni), stats: stats(item.ukt) })),
    ipkTrend: rows(dashboard.tren_ipk).map((item) => ({ label: label(item.periode ?? item.semester), stats: stats(item.ipk) })),
  };
  // Tidak menjumlah distribusi menjadi penerima unik, dan tidak mengubah null menjadi 0.
  return result;
}
