import { ApiError } from "./eightracer-api";
import { alumniQuery, type AlumniPage, type AlumniDetail } from "./b4-alumni";

async function read<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/b4/alumni${path}`, { cache: "no-store", credentials: "same-origin", headers: { Accept: "application/json" }, signal }); }
  catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(0, "Aplikasi belum dapat dihubungi.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, payload?.message ?? "Data alumni belum dapat dibaca.", {}, false, payload?.session_expired === true);
  return payload as T;
}
export function getAlumniPage(search: string, university: string, program: string, admission: string, page: number, signal?: AbortSignal) {
  return read<AlumniPage>(`?${alumniQuery(search, university, program, admission, page)}`, signal);
}
export function getAlumniDetail(id: string, signal?: AbortSignal) {
  return read<{ data: AlumniDetail }>(`/${encodeURIComponent(id)}`, signal);
}
