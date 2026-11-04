import "server-only";
import { NextRequest } from "next/server";
import { AuthError, authResponse, clearSession, SESSION_COOKIE } from "./backend-auth";

export async function alumniBackend(request: NextRequest, path: string) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) throw new AuthError(401, "Silakan masuk untuk membaca data alumni sekolah.");
  const configured = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) throw new AuthError(503, "Alamat API alumni belum dikonfigurasi.");
  let base: URL;
  try { base = new URL(configured); } catch { throw new AuthError(503, "Alamat API alumni tidak valid."); }
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new AuthError(503, "Alamat API alumni tidak valid.");
  let response: Response;
  try {
    response = await fetch(`${base.href.replace(/\/+$/, "")}/alumni${path}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(30_000),
    });
  } catch { throw new AuthError(503, "Data alumni belum dapat dihubungi. Coba lagi beberapa saat."); }
  if (response.status === 401) return { response: clearSession(authResponse({ message: "Sesi telah berakhir. Silakan masuk lagi.", session_expired: true }, 401), request) };
  if (!response.ok) throw new AuthError(response.status >= 500 ? 503 : response.status,
    response.status === 403 ? "Data alumni ini hanya untuk admin atau Guru BK yang berwenang."
      : response.status === 404 ? "Data alumni tidak ditemukan."
      : response.status === 422 ? "Pencarian/filter alumni tidak valid."
      : response.status === 429 ? "Terlalu banyak permintaan. Tunggu sebelum mencoba lagi."
      : "Data alumni belum dapat dimuat.");
  try { return { payload: await response.json() as unknown }; }
  catch { throw new AuthError(502, "Respons alumni belum dapat dibaca."); }
}
