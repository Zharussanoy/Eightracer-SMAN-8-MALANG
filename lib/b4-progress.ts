import type { AlumniDetail, AlumniProgressRow } from "./b4-alumni";

export interface ProgressForm {
  id: number | null; period: string; semester: string; status: string; date: string;
  gpa: string; kipk: string; ukt: string; ipi: string; awardIds: string[];
}
export function blankProgress(): ProgressForm {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const pick = (type: string) => parts.find((item) => item.type === type)?.value;
  return { id: null, period: "", semester: "", status: "", date: `${pick("year")}-${pick("month")}-${pick("day")}`, gpa: "", kipk: "", ukt: "", ipi: "", awardIds: [] };
}
// A new period starts blank; only known aid is suggested for administrator review.
export function newProgressForAlumni(alumni: AlumniDetail): ProgressForm {
  const form = blankProgress();
  const latestStatus = new Map<number, string>();
  for (const row of alumni.progress) for (const award of row.scholarships) {
    if (!latestStatus.has(award.id)) latestStatus.set(award.id, award.status);
  }
  form.awardIds = [...latestStatus].filter(([, status]) => status === "diterima").map(([id]) => String(id));
  const evidence = alumni.scholarshipEvidence;
  if (!evidence.needsReview && evidence.kipk !== null) form.kipk = evidence.kipk ? "1" : "0";
  return form;
}
export function progressScholarshipOptions(alumni: AlumniDetail): Map<number, string> {
  const options = new Map(alumni.catalogOptions.map((item) => [item.id, item.name]));
  // An award remains part of the alumnus' record even when its catalog program is archived.
  for (const row of alumni.progress) for (const award of row.scholarships) {
    if (award.name && !options.has(award.id)) options.set(award.id, award.name);
  }
  return new Map([...options].sort((a,b) => a[1].localeCompare(b[1], "id-ID") || a[0]-b[0]));
}
export function formFromProgress(row: AlumniProgressRow): ProgressForm {
  return { id: row.id, period: row.period ?? "", semester: row.semester === null ? "" : String(row.semester),
    status: row.status ?? "", date: row.updatedAt ?? "", gpa: row.gpa === null ? "" : String(row.gpa),
    kipk: row.kipk === true ? "1" : row.kipk === false ? "0" : "",
    ukt: row.ukt === null ? "" : String(row.ukt), ipi: row.ipi === null ? "" : String(row.ipi),
    awardIds: row.scholarships.filter((award) => award.status === "diterima").map((award) => String(award.id)) };
}
export function progressPayload(form: ProgressForm, previous: AlumniProgressRow | undefined, mandiri: boolean) {
  if (!form.period.trim() || !/^[1-9]\d*$/.test(form.semester) || Number(form.semester) > 40 || !["aktif", "cuti", "lulus", "nonaktif"].includes(form.status) || !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) throw new Error("Lengkapi periode, semester, status pendidikan, dan tanggal pembaruan.");
  const amount = (value: string, max: number) => {
    if (!value.trim()) return null;
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > max) throw new Error("Periksa IPK serta nominal biaya.");
    return number;
  };
  const chosen = new Set(form.awardIds.map(Number));
  const retained = previous?.scholarships.filter((award) => award.status !== "diterima" && !chosen.has(award.id)) ?? [];
  return { periode: form.period.trim(), semester: Number(form.semester), status_pendidikan: form.status, tanggal_update: form.date,
    ipk_terkini: amount(form.gpa, 4), penerima_kipk: form.kipk === "" ? null : form.kipk === "1",
    nominal_ukt: amount(form.ukt, 9999999999999), nominal_ipi: mandiri ? amount(form.ipi, 9999999999999) : null,
    beasiswa: [
      ...retained.map((award) => ({ beasiswa_id: award.id, status_beasiswa: award.status, nominal_beasiswa: award.amount })),
      ...[...chosen].map((awardId) => ({ beasiswa_id: awardId, status_beasiswa: "diterima", nominal_beasiswa: previous?.scholarships.find((award) => award.id === awardId)?.amount ?? null })),
    ],
  };
}
export const educationStatusLabels: Record<string, string> = { aktif: "Aktif", cuti: "Cuti", lulus: "Lulus", nonaktif: "Nonaktif" };
export function educationStatus(value: string | null) { return value ? educationStatusLabels[value] ?? value : "-"; }
