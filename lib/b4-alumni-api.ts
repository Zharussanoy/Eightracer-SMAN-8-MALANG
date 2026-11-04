import { ApiError } from "./eightracer-api";
import { alumniQuery, type AlumniPage, type AlumniDetail } from "./b4-alumni";

async function request<T>(path: string, options: { signal?: AbortSignal; method?: string; body?: BodyInit } = {}): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  if (typeof options.body === "string") headers.set("Content-Type", "application/json");
  let response: Response;
  try { response = await fetch(`/api/b4/alumni${path}`, { cache: "no-store", credentials: "same-origin", headers, ...options }); }
  catch (error) { if (options.signal?.aborted) throw error; throw new ApiError(0, "Aplikasi belum dapat dihubungi."); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, payload?.message ?? "Data alumni belum dapat diproses.", payload?.errors ?? {}, false, payload?.session_expired === true);
  return payload as T;
}
export function getAlumniPage(search: string, university: string, program: string, admission: string, page: number, signal?: AbortSignal) {
  return request<AlumniPage>(`?${alumniQuery(search, university, program, admission, page)}`, { signal });
}
export function getAlumniDetail(id: string, signal?: AbortSignal) { return request<{ data: AlumniDetail }>(`/${encodeURIComponent(id)}`, { signal }); }
export function saveAlumniProgress(id: string, progressId: number | null, payload: unknown) {
  return request(`/${id}/college-progress${progressId ? "/"+progressId : ""}`, { method: progressId ? "PUT" : "POST", body: JSON.stringify(payload) });
}
export function archiveAlumniProgress(id: string, progressId: number) { return request(`/${id}/college-progress/${progressId}`, { method: "DELETE", body: "{}" }); }
export interface ImportPreview {
  id: string; status: string; commit_digest: string;
  summary: { total: number; valid: number; invalid: number; errors: { sheet: string; row: number; errors: Record<string, string[]> }[] };
  sample: { sheet: string; row: number; operation?: "tambah" | "koreksi"; data: Record<string, unknown> }[];
  receipt?: { processed: number; code?: string } | null;
}
export function previewAlumniProgress(id: string, file: File, numberFormat: string, signal?: AbortSignal) {
  const body = new FormData(); body.set("file", file); body.set("number_format", numberFormat);
  return request<{ data: ImportPreview }>(`/${id}/progress-imports`, { method: "POST", body, signal });
}
export function commitAlumniProgress(id: string, batch: ImportPreview) {
  return request<{ data: ImportPreview }>(`/${id}/progress-imports/${batch.id}/commit`, { method: "POST", body: JSON.stringify({ commit_digest: batch.commit_digest }) });
}
export async function downloadProgressTemplate(id: string) {
  const response = await fetch(`/api/b4/alumni/${id}/progress-template`, { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) throw new Error("Template belum dapat diunduh.");
  const url = URL.createObjectURL(await response.blob()), anchor = document.createElement("a");
  anchor.href = url; anchor.download = `template-progres-alumni-${id}.csv`; anchor.click(); URL.revokeObjectURL(url);
}
