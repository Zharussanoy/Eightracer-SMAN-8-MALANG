export interface ScholarshipEvidence {
  kipk: boolean | null; needsReview: boolean;
  programs: { name: string; status: string; source: string }[];
}
export function parseScholarshipEvidence(value: unknown): ScholarshipEvidence {
  if (value == null) return { kipk: null, needsReview: false, programs: [] };
  if (typeof value !== "object" || Array.isArray(value)) throw new Error("Catatan beasiswa alumni tidak valid.");
  const row = value as Record<string, unknown>;
  if ((row.penerima_kipk !== null && typeof row.penerima_kipk !== "boolean") || !Array.isArray(row.beasiswa)) throw new Error("Catatan beasiswa alumni tidak valid.");
  return { kipk: row.penerima_kipk as boolean | null, needsReview: row.needs_review === true,
    programs: row.beasiswa.map((value) => {
      if (!value || typeof value !== "object") throw new Error("Catatan beasiswa alumni tidak valid.");
      const item = value as Record<string, unknown>;
      if (typeof item.nama_beasiswa !== "string" || typeof item.status !== "string" || typeof item.source !== "string") throw new Error("Catatan beasiswa alumni tidak valid.");
      return { name: item.nama_beasiswa, status: item.status, source: item.source };
    }) };
}
export function scholarshipEvidenceLabel(value: ScholarshipEvidence): string {
  return value.programs.filter((p) => p.status === "diterima" || p.status === "catatan_sekolah")
    .map((p) => p.name + (p.status === "catatan_sekolah" ? " (catatan sekolah)" : "")).join(", ") || "-";
}
export function kipStatusLabel(value: boolean | null | undefined): string {
  return value === true ? "Penerima" : value === false ? "Bukan penerima" : "Belum diketahui";
}
export function kipEvidenceLabel(value: ScholarshipEvidence): string {
  return value.needsReview ? "Perlu verifikasi" : kipStatusLabel(value.kipk);
}
