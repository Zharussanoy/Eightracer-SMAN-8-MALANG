import { parseAlumniDetail, type AlumniDetail } from "./b4-alumni";

export interface EducationEvent {
  type: "masuk_sekolah" | "lulus_sekolah" | "masuk_pt"; label: string; date: string | null; year: number;
}
export interface AlumniTimelineDetail extends AlumniDetail { educationEvents: EducationEvent[] }
export function parseAlumniTimeline(payload: unknown): AlumniTimelineDetail {
  const outer = payload as { data?: Record<string, unknown> };
  const data = outer?.data;
  if (!data || data.timeline_complete !== true || !Array.isArray(data.education_events)) throw new Error("Timeline alumni belum lengkap.");
  const detail = parseAlumniDetail(payload);
  const expected = ["masuk_sekolah", "lulus_sekolah", "masuk_pt"];
  const events = data.education_events.map((item, index): EducationEvent => {
    if (!item || typeof item !== "object") throw new Error("Peristiwa timeline tidak valid.");
    const event = item as Record<string, unknown>;
    if (event.type !== expected[index] || typeof event.label !== "string" || !event.label.trim()
      || typeof event.year !== "number" || !Number.isInteger(event.year) || event.year < 1900
      || (event.date !== null && (typeof event.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(event.date)))) throw new Error("Peristiwa timeline tidak valid.");
    return { type: event.type as EducationEvent["type"], label: event.label, year: event.year, date: event.date as string | null };
  });
  const latest = detail.progress[0];
  if (events.length !== 3 || !latest || latest.gpa === null || latest.ukt === null || latest.kipk === null
    || latest.semester === null || !latest.period || !latest.updatedAt || !latest.status) throw new Error("Progres timeline belum lengkap.");
  return { ...detail, educationEvents: events };
}
export function eventDate(event: EducationEvent): string {
  if (!event.date) return String(event.year);
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric" })
    .format(new Date(event.date + "T00:00:00+07:00"));
}
export function acceptedAwards(row: AlumniDetail["progress"][number]): string {
  return row.scholarships.filter((award) => award.status === "diterima").map((award) => award.name ?? "-").join(", ") || "-";
}
export const timelineMoney = (value: number | null) => value === null ? "-" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
