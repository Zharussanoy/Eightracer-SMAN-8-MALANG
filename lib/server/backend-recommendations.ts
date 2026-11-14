import "server-only";
import { NextRequest } from "next/server";
import { AuthError, authResponse, clearSession, SESSION_COOKIE } from "./backend-auth";

// Khusus baca; tidak ada path generate/review maupun metode tulis.
export async function readBackendRecommendations(request: NextRequest, path: string, query = new URLSearchParams()) {
  if (path !== "/siswa" && path !== "/rekomendasi-beasiswa/saya" && !/^\/siswa\/[1-9]\d*\/rekomendasi-beasiswa\/preview$/.test(path)) throw new AuthError(422, "Tujuan rekomendasi tidak valid.");
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
  }); } catch { throw new AuthError(503, "Layanan rekomendasi belum dapat dihubungi. Periksa koneksi BE."); }
  if (!response.ok) throw new AuthError(response.status >= 500 ? 503 : response.status,
    response.status === 401 ? "Sesi berakhir. Silakan masuk lagi."
      : response.status === 403 ? "Akun ini belum memiliki izin membaca rekomendasi pada halaman ini."
      : response.status === 404 ? "Data siswa tidak ditemukan atau tidak diizinkan."
      : response.status === 422 ? "Pilihan siswa atau jenjang belum diterima BE."
      : response.status === 429 ? "Terlalu banyak permintaan. Tunggu sebelum mencoba lagi."
      : "Layanan pratinjau belum tersedia.");
  try { return await response.json() as unknown; } catch { throw new AuthError(502, "Respons BE belum sesuai format pratinjau."); }
}
export function recommendationFailure(error: unknown, request: NextRequest) {
  const status = error instanceof AuthError ? error.status : 502;
  const response = authResponse({ message: error instanceof AuthError ? error.message : "Struktur pratinjau perlu dicocokkan dengan tim BE.", ...(status === 401 ? { session_expired: true } : {}) }, status);
  return status === 401 ? clearSession(response, request) : response;
}
