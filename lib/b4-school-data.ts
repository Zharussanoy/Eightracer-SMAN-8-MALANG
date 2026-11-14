import type { AnalyticsData, AnalyticStats } from "./b4-analytics";
type Row = Record<string, unknown>;
function row(value: unknown): Row {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Data analitik belum dapat dibaca. Silakan coba lagi.");
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
  if (!Array.isArray(value)) throw new Error("Data analitik belum dapat dibaca. Silakan coba lagi.");
  return value.map(row);
}
function label(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  const result = text(value);
  if (!result) throw new Error("Data analitik belum dapat dibaca. Silakan coba lagi.");
  return result;
}
// Adapter for school-source aggregates; the FE component and its controls stay unchanged.
export function parseSchoolAnalytics(payload: unknown): AnalyticsData {
  const source = row(row(payload).data), summary = row(source.summary), finance = row(source.financial);
  const n = (value: unknown) => { const v = count(value); if (v === null) throw new Error("Jumlah analitik tidak valid."); return v; };
  const metric = (value: unknown): AnalyticStats => {
    const s = row(value);
    return { known: n(s.known), unknown: n(s.unknown), minimum: analyticNumber(s.minimum), maximum: analyticNumber(s.maximum), mean: analyticNumber(s.mean) };
  };
  const grouped = finance.tuition_ranges === undefined ? null : row(finance.tuition_ranges);
  const groupedRanges = (value: unknown) => rows(value).map((v) => ({
    university: text(v.university) ?? "Seluruh perguruan tinggi",
    program: text(v.program) ?? "Seluruh program studi", count: n(v.count), stats: metric(v.stats),
  }));
  return {
    tuitionRanges: grouped ? { university: groupedRanges(grouped.by_university), program: groupedRanges(grouped.by_program) } : undefined,
    asOf: text(source.as_of), total: n(summary.alumni), recipients: n(summary.all_aid), kipk: n(summary.kip),
    notes: Array.isArray(source.notes) ? source.notes.filter((v): v is string => typeof v === "string") : [],
    distribution: rows(source.scholarships).map((v) => ({ id: null, label: label(v.label), count: n(v.count) })),
    cohorts: rows(source.kip_by_cohort).map((v) => ({ label: label(v.label), count: n(v.count) })),
    measuredAlumni: n(finance.measured_alumni), ukt: metric(finance.ukt), ipk: metric(finance.ipk),
    ranges: rows(finance.ranges).map((v) => ({ university: label(v.university), program: label(v.program), count: n(v.count), stats: metric(v.stats) })),
    ipkDistribution: rows(finance.ipk_distribution ?? []).map(v => ({ label: label(v.label), count: n(v.count) })),
    ipkTrend: rows(finance.ipk_trend).map((v) => ({ label: label(v.label), stats: metric(v.stats) })),
    periods: rows(source.periods).map((v) => ({ label: label(v.label), count: n(v.count), kipk: n(v.kipk),
      scholarships: rows(v.scholarships).map((s) => ({ label: label(s.label), count: n(s.count), processing: n(s.processing), accepted: n(s.accepted), rejected: n(s.rejected) })) })),
  };
}

export function schoolScholarshipOptions(payload: unknown): { id: string; name: string }[] {
  return rows(row(row(row(payload).data).filters).scholarships).map((v) => {
    if (typeof v.value !== "string" || !/^([1-9][0-9]*|kip|program:[a-f0-9]{20})$/.test(v.value)) throw new Error("Pilihan analitik tidak valid.");
    return { id: v.value, name: label(v.label) };
  });
}
export async function getSchoolScholarships(options: { search: string; signal?: AbortSignal }) {
  const response = await fetch("/api/b4/analytics/options?" + new URLSearchParams({ search: options.search }), {
    credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal: options.signal,
  });
  if (!response.ok) throw new Error("Pilihan beasiswa belum dapat dimuat.");
  return await response.json() as { data: { id: string; name: string }[] };
}
