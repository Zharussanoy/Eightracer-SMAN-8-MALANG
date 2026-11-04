import "server-only";
import { NextRequest } from "next/server";
import { AuthError, authResponse, clearSession, SESSION_COOKIE } from "./backend-auth";

export async function readBackendAlumni(request: NextRequest, path: string) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) throw new AuthError(401, "Silakan masuk dengan akun sekolah.");
  // Path hanya dibentuk route server, bukan URL dari browser.
  if (!/^\/study-tracer\?/.test(path) && !/^\/alumni\/[1-9]\d*\/timeline$/.test(path)) throw new AuthError(422, "Alamat data alumni tidak valid.");
  let base: URL;
  try { base = new URL(process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""); }
  catch { throw new AuthError(503, "Alamat BE belum dikonfigurasi."); }
  if (!["https:", "http:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new AuthError(503, "Alamat BE tidak valid.");
  let response: Response;
  try { response = await fetch(`${base.href.replace(/\/+$/, "")}${path}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000),
  }); } catch { throw new AuthError(503, "Data alumni belum dapat dihubungi. Periksa Tailscale dan layanan BE."); }
  if (!response.ok) throw new AuthError(response.status >= 500 ? 503 : response.status,
    response.status === 401 ? "Sesi telah berakhir. Silakan masuk lagi."
      : response.status === 403 ? "Akun ini tidak memiliki izin membaca data alumni admin."
      : response.status === 404 ? "Data alumni tidak ditemukan atau tidak diizinkan."
      : response.status === 422 ? "Filter alumni belum diterima BE. Periksa isian."
      : response.status === 429 ? "Terlalu banyak permintaan. Tunggu sebelum mencoba lagi."
      : "Layanan alumni belum tersedia.");
  try { return await response.json() as unknown; } catch { throw new AuthError(502, "Respons BE bukan data alumni yang valid."); }
}
export function alumniFailure(error: unknown, request: NextRequest) {
  const status = error instanceof AuthError ? error.status : 502;
  const response = authResponse({ message: error instanceof AuthError ? error.message : "Struktur data alumni perlu dicocokkan dengan tim BE.",
    ...(status === 401 ? { session_expired: true } : {}) }, status);
  return status === 401 ? clearSession(response, request) : response;
}
