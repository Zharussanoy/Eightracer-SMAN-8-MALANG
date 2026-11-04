import { ApiError } from "./eightracer-api";
import { scholarshipQuery, type ScholarshipPage, type ScholarshipLevel, type ScholarshipInput, type ScholarshipRow } from "./b4-scholarships";

export async function getScholarship(id: number, signal?: AbortSignal): Promise<ScholarshipRow> {
  let response: Response;
  try { response = await fetch(`/api/b4/beasiswa/${id}`, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal }); }
  catch (error) { if (signal?.aborted) throw error; throw new ApiError(0, "Detail beasiswa belum dapat dihubungi."); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, payload?.message ?? "Detail beasiswa belum dapat dimuat.", {}, false, payload?.session_expired === true);
  return payload as ScholarshipRow;
}

export async function getScholarships(options: { search: string; level: ScholarshipLevel | ""; page: number; signal?: AbortSignal }): Promise<ScholarshipPage> {
  let response: Response;
  try {
    response = await fetch(`/api/b4/beasiswa?${scholarshipQuery(options.search, options.level, options.page)}`, {
      credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal: options.signal,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError(0, "Aplikasi belum dapat dihubungi. Periksa koneksi dan coba lagi.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, payload?.message ?? "Katalog belum dapat dimuat.", {}, false, payload?.session_expired === true);
  return payload as ScholarshipPage;
}

export async function saveScholarship(input: ScholarshipInput, id?: number) {
  return mutateScholarship(id ? `/${id}` : "", id ? "PUT" : "POST", input);
}
export async function archiveScholarship(id: number) { return mutateScholarship(`/${id}`, "DELETE", {}); }

async function mutateScholarship(path: string, method: string, body: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/b4/beasiswa${path}`, { method,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      credentials: "same-origin", cache: "no-store", body: JSON.stringify(body) });
  } catch { throw new ApiError(0, "Respons penyimpanan belum diterima. Periksa katalog sebelum mencoba lagi agar tidak membuat data ganda."); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, payload?.message ?? "Perubahan belum dapat disimpan.", payload?.errors ?? {}, false, payload?.session_expired === true);
  return payload as { message: string };
}
