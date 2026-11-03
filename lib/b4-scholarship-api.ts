import { ApiError } from "./eightracer-api";
import { scholarshipQuery, type ScholarshipPage, type ScholarshipLevel } from "./b4-scholarships";

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
