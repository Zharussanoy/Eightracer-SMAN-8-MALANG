import "server-only";
import { NextRequest } from "next/server";
import { AuthError, authResponse, clearSession, SESSION_COOKIE } from "./backend-auth";

export async function readBackendAnalytics(request: NextRequest, path: "/analitik-beasiswa" | "/dashboard/ukt-ipk" | "/analitik-beasiswa/sekolah", query = new URLSearchParams()) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) throw new AuthError(401, "Silakan masuk dengan akun sekolah.");
  let base: URL;
  try { base = new URL(process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""); }
  catch { throw new AuthError(503, "Alamat BE belum dikonfigurasi."); }
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new AuthError(503, "Alamat BE tidak valid.");
  let response: Response;
  try { response = await fetch(`${base.href.replace(/\/+$/, "")}${path}?${query}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20_000),
  }); } catch { throw new AuthError(503, "Analitik belum dapat dihubungi. Periksa Tailscale dan layanan BE."); }
  if (!response.ok) throw new AuthError(response.status >= 500 ? 503 : response.status,
    response.status === 401 ? "Sesi telah berakhir. Silakan masuk lagi."
      : response.status === 403 ? "Akun ini belum memiliki izin membaca analitik sekolah."
      : response.status === 422 ? "Filter analitik belum diterima BE. Periksa isian."
      : response.status === 429 ? "Terlalu banyak permintaan. Tunggu sebelum mencoba lagi."
      : "Layanan analitik belum tersedia.");
  try { return await response.json() as unknown; } catch { throw new AuthError(502, "Respons analitik BE tidak valid."); }
}
export function analyticsFailure(error: unknown, request: NextRequest) {
  const status = error instanceof AuthError ? error.status : 502;
  const response = authResponse({ message: error instanceof AuthError ? error.message : "Struktur analitik perlu dicocokkan dengan tim BE.", ...(status === 401 ? { session_expired: true } : {}) }, status);
  return status === 401 ? clearSession(response, request) : response;
}
