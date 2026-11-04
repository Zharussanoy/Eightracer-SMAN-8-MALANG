import "server-only";
import { NextRequest } from "next/server";
import { AuthError, authResponse, clearSession, SESSION_COOKIE } from "./backend-auth";

export async function alumniBackend(request: NextRequest, path: string, options: { method?: string; body?: BodyInit; raw?: boolean } = {}) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) throw new AuthError(401, "Silakan masuk untuk mengakses data alumni sekolah.");
  const configured = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) throw new AuthError(503, "Alamat API alumni belum dikonfigurasi.");
  let base: URL;
  try { base = new URL(configured); } catch { throw new AuthError(503, "Alamat API alumni tidak valid."); }
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new AuthError(503, "Alamat API alumni tidak valid.");
  const headers = new Headers({ Accept: "application/json", Authorization: `Bearer ${token}` });
  if (typeof options.body === "string") headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`${base.href.replace(/\/+$/, "")}/alumni${path}`, {
      method: options.method ?? "GET", body: options.body, headers,
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(60_000),
    });
  } catch { throw new AuthError(503, "Data alumni belum dapat dihubungi. Coba lagi beberapa saat."); }
  if (response.status === 401) return { response: clearSession(authResponse({ message: "Sesi telah berakhir. Silakan masuk lagi.", session_expired: true }, 401), request) };
  if (!response.ok) {
    const errors: Record<string, string[]> = {};
    if (response.status === 422) {
      const data = await response.json().catch(() => null);
      if (data?.errors && typeof data.errors === "object") for (const [key, value] of Object.entries(data.errors)) {
        if (/^[a-z_0-9.]+$/i.test(key) && Array.isArray(value)) errors[key] = value.filter((item): item is string => typeof item === "string").slice(0, 10);
      }
    }
    throw new AuthError(response.status >= 500 ? 503 : response.status,
      response.status === 403 ? "Data alumni ini hanya untuk admin atau Guru BK yang berwenang."
        : response.status === 404 ? "Data alumni tidak ditemukan."
        : response.status === 409 ? "Data berubah atau periode sudah tercatat. Muat ulang dan periksa kembali."
        : response.status === 422 ? "Periksa isian atau kolom spreadsheet yang ditandai."
        : response.status === 429 ? "Terlalu banyak permintaan. Tunggu sebelum mencoba lagi."
        : response.status === 503 ? "Pemrosesan file/layanan belum tersedia. Coba lagi beberapa saat."
        : "Data alumni belum dapat diproses.", errors);
  }
  if (options.raw) return { download: response };
  try { return { payload: await response.json() as unknown }; }
  catch { throw new AuthError(502, "Respons alumni belum dapat dibaca."); }
}
