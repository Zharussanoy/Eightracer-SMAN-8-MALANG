import { parseAlumniDetail, type AlumniDetail } from "./b4-alumni";

export interface EducationEvent {
  type: "masuk_sekolah" | "lulus_sekolah" | "masuk_pt"; label: string; date: string | null; year: number | null;
}
export interface AlumniTimelineDetail extends AlumniDetail { educationEvents: EducationEvent[] }
const stages: { type: EducationEvent["type"]; label: string }[] = [
  { type: "masuk_sekolah", label: "Masuk SMA" },
  { type: "lulus_sekolah", label: "Lulus SMA" },
  { type: "masuk_pt", label: "Masuk Perguruan Tinggi" },
];
export function parseAlumniTimeline(payload: unknown): AlumniTimelineDetail {
  const detail = parseAlumniDetail(payload);
  const data = (payload as { data: Record<string, unknown> }).data;
  const source = data.education_events ?? [];
  if (!Array.isArray(source)) throw new Error("Peristiwa timeline tidak valid.");
  const known = new Map<string, EducationEvent>();
  for (const item of source) {
    if (!item || typeof item !== "object") throw new Error("Peristiwa timeline tidak valid.");
    const event = item as Record<string, unknown>;
    if (!stages.some((stage) => stage.type === event.type) || known.has(String(event.type))
      || typeof event.label !== "string" || !event.label.trim()
      || typeof event.year !== "number" || !Number.isInteger(event.year) || event.year < 1900
      || (event.date !== null && (typeof event.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(event.date)))) throw new Error("Peristiwa timeline tidak valid.");
    known.set(String(event.type), { type: event.type as EducationEvent["type"], label: event.label, year: event.year, date: event.date as string | null });
  }
  return { ...detail, educationEvents: stages.map((stage) => known.get(stage.type) ?? { ...stage, date: null, year: null }) };
}
export function eventDate(event: EducationEvent): string {
  if (!event.date) return event.year === null ? "-" : String(event.year);
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric" })
    .format(new Date(event.date + "T00:00:00+07:00"));
}
export function acceptedAwards(row: AlumniDetail["progress"][number]): string {
  return row.scholarships.filter((award) => award.status === "diterima").map((award) => award.name ?? "-").join(", ") || "-";
}
export const timelineMoney = (value: number | null) => value === null ? "-" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
