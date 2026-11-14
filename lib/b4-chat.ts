export interface ScholarshipChatInput { message: string; beasiswa_id?: number; target_jenjang?: "SMA" | "Kuliah" }
export interface ScholarshipChatAnswer {
  answer: string; llmUsed: boolean | null; context: string | null;
  sources: { label: string; url: string | null }[];
  eligibility: { score: number | null; complete: boolean | null; meets: boolean | null; checklist: { criterion: string; status: string | null; required: string | null }[] } | null;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Format chat belum sesuai kontrak.");
  return value as Record<string, unknown>;
}
const text = (value: unknown) => typeof value === "string" && value.trim() ? value : null;
export function parseChatInput(value: unknown): ScholarshipChatInput {
  const row = record(value);
  if (Object.keys(row).some(key => !["message", "beasiswa_id", "target_jenjang"].includes(key)) || !text(row.message) || typeof row.message !== "string" || row.message.length > 1000) throw new Error("Tulis pertanyaan 1–1.000 karakter tanpa data akun tambahan.");
  if (row.beasiswa_id !== undefined && (typeof row.beasiswa_id !== "number" || !Number.isSafeInteger(row.beasiswa_id) || row.beasiswa_id <= 0)) throw new Error("Konteks beasiswa tidak valid.");
  if (row.target_jenjang !== undefined && row.target_jenjang !== "SMA" && row.target_jenjang !== "Kuliah") throw new Error("Target jenjang harus SMA atau Kuliah.");
  return { message: row.message.trim(), ...(row.beasiswa_id !== undefined ? { beasiswa_id: row.beasiswa_id as number } : {}), ...(row.target_jenjang !== undefined ? { target_jenjang: row.target_jenjang as "SMA" | "Kuliah" } : {}) };
}
function sourceUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function parseChatAnswer(payload: unknown): ScholarshipChatAnswer {
  const row = record(record(payload).data), answer = text(row.answer);
  if (!answer) throw new Error("Layanan belum mengirim jawaban chat yang sesuai.");
  let eligibility: ScholarshipChatAnswer["eligibility"] = null;
  if (row.eligibility && typeof row.eligibility === "object" && !Array.isArray(row.eligibility)) {
    const source = record(row.eligibility);
    eligibility = {
      score: typeof source.skor === "number" && Number.isFinite(source.skor) && source.skor >= 0 && source.skor <= 100 ? source.skor : null,
      complete: typeof source.lengkap === "boolean" ? source.lengkap : null,
      meets: typeof source.memenuhi === "boolean" ? source.memenuhi : null,
      checklist: Array.isArray(source.checklist) ? source.checklist.flatMap(value => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return [];
        const item = record(value), criterion = text(item.kriteria);
        return criterion ? [{ criterion, status: text(item.status), required: typeof item.syarat === "number" || typeof item.syarat === "boolean" ? String(item.syarat) : text(item.syarat) }] : [];
      }) : [],
    };
  }
  return { answer, llmUsed: typeof row.llm_used === "boolean" ? row.llm_used : null, context: text(row.context), eligibility,
    sources: Array.isArray(row.sources) ? row.sources.flatMap(value => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return [];
      const source = record(value), label = text(source.label);
      return label ? [{ label, url: sourceUrl(source.url) }] : [];
    }) : [] };
}
