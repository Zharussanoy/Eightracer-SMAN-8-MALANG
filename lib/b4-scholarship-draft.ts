import type { ScholarshipLevel } from "./b4-scholarships";

export interface ScholarshipCriterionDraft { key: string; name: string; value: string; weight: string }
// Draf lokal, bukan payload POST/PUT. Enum tipe/operator dan aturan bobot
// perlu dikonfirmasi BE sebelum serialisasi payload diaktifkan.
export interface ScholarshipDraft {
  name: string; provider: string; description: string; level: ScholarshipLevel;
  registrationUrl: string; opens: string; closes: string; active: boolean;
  criteria: ScholarshipCriterionDraft[];
}
export function newScholarshipDraft(): ScholarshipDraft {
  return { name: "", provider: "", description: "", level: "Keduanya", registrationUrl: "", opens: "", closes: "", active: true,
    criteria: [{ key: "criterion-1", name: "", value: "", weight: "" }] };
}
export function scholarshipDraftErrors(draft: ScholarshipDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = "Isi nama beasiswa.";
  if (!draft.provider.trim()) errors.provider = "Isi nama penyelenggara.";
  if (!draft.description.trim()) errors.description = "Isi deskripsi beasiswa.";
  if (!["SMA", "Kuliah", "Keduanya"].includes(draft.level)) errors.level = "Pilih jenjang yang tersedia.";
  if (draft.registrationUrl.trim()) {
    try { const url = new URL(draft.registrationUrl.trim()); if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error(); }
    catch { errors.registrationUrl = "Gunakan alamat lengkap dengan https:// atau http:// tanpa kredensial."; }
  }
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (draft.opens && !validDate(draft.opens)) errors.opens = "Tanggal buka tidak valid.";
  if (draft.closes && !validDate(draft.closes)) errors.closes = "Tanggal tutup tidak valid.";
  if (draft.opens && draft.closes && draft.closes < draft.opens) errors.closes = "Tanggal tutup harus sama dengan atau setelah tanggal buka.";
  if (!draft.criteria.length) errors.criteria = "Tambahkan minimal satu kriteria pada draf.";
  draft.criteria.forEach((criterion, index) => {
    if (!criterion.name.trim()) errors[`criteria.${index}.name`] = "Isi nama kriteria atau hapus baris yang tidak digunakan.";
    if (criterion.weight.trim() && (!Number.isFinite(Number(criterion.weight)) || Number(criterion.weight) < 0)) errors[`criteria.${index}.weight`] = "Isi bobot draf berupa angka nol atau positif. Batas resmi masih menunggu BE.";
  });
  return errors;
}
export function isScholarshipDraft(value: unknown): value is ScholarshipDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return ["name", "provider", "description", "registrationUrl", "opens", "closes"].every((field) => typeof draft[field] === "string")
    && ["SMA", "Kuliah", "Keduanya"].includes(String(draft.level)) && typeof draft.active === "boolean"
    && Array.isArray(draft.criteria) && draft.criteria.length > 0 && draft.criteria.length <= 100
    && draft.criteria.every((value) => value && typeof value === "object" && ["key", "name", "value", "weight"].every((field) => typeof value[field] === "string"))
    && new Set(draft.criteria.map((value) => value.key)).size === draft.criteria.length;
}
