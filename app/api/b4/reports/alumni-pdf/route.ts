import { NextRequest } from "next/server";
import { schoolAnalyticsQuery } from "@/lib/server/school-analytics-query";
import { AuthError, authResponse, clearSession, SESSION_COOKIE } from "@/lib/server/backend-auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) throw new AuthError(401, "Silakan masuk dengan akun sekolah.");
    const filters = schoolAnalyticsQuery(request.nextUrl.searchParams);
    let base: URL;
    try { base = new URL(process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""); }
    catch { throw new AuthError(503, "Alamat BE belum dikonfigurasi."); }
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new AuthError(503, "Alamat BE tidak valid.");
    let upstream: Response;
    try { upstream = await fetch(`${base.href.replace(/\/+$/, "")}/analitik-beasiswa/sekolah/pdf?${filters}`, { headers: { Accept: "application/pdf, application/json", Authorization: `Bearer ${token}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(45_000) }); }
    catch { throw new AuthError(503, "Laporan belum dapat dihubungi. Periksa Tailscale dan BE."); }
    if (!upstream.ok) throw new AuthError(upstream.status >= 500 ? 503 : upstream.status,
      upstream.status === 401 ? "Sesi berakhir. Silakan masuk lagi." : upstream.status === 403 ? "Akun ini tidak diizinkan mengunduh laporan." : upstream.status === 422 ? "Cakupan laporan belum diterima. Persempit filter dan coba lagi." : upstream.status === 429 ? "Unduhan dibatasi. Tunggu sebelum mencoba lagi." : "Pembuat PDF di BE belum tersedia. Minta rekan BE memeriksa layanan PDF.");
    const bytes = new Uint8Array(await upstream.arrayBuffer());
    if (!upstream.headers.get("content-type")?.toLowerCase().includes("application/pdf") || new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new AuthError(502, "BE belum mengirim file PDF yang valid.");
    return new Response(bytes, { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="eightracer-analitik-sekolah.pdf"', "Cache-Control": "no-store, private", Pragma: "no-cache", Vary: "Cookie", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 503;
    const response = authResponse({ message: error instanceof AuthError ? error.message : "Laporan belum dapat diunduh.", ...(status === 401 ? { session_expired: true } : {}) }, status);
    return status === 401 ? clearSession(response, request) : response;
  }
}
