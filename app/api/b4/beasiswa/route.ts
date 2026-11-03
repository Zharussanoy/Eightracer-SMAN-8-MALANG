import { NextRequest } from "next/server";
import { parseScholarshipPage } from "@/lib/b4-scholarships";
import { AuthError, authFailure, authResponse, clearSession, SESSION_COOKIE } from "@/lib/server/backend-auth";

// Tahap ini hanya GET. Tidak menyediakan proxy URL bebas atau operasi tulis.
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return authResponse({ message: "Silakan masuk dengan akun sekolah." }, 401);
  try {
    const query = request.nextUrl.searchParams;
    if ([...query.keys()].some((key) => !["search", "jenjang", "page"].includes(key) || query.getAll(key).length !== 1)
      || (query.get("search") ?? "").length > 100
      || (query.has("jenjang") && !["SMA", "Kuliah", "Keduanya"].includes(query.get("jenjang")!))
      || (query.has("page") && (!/^[1-9]\d*$/.test(query.get("page")!) || !Number.isSafeInteger(Number(query.get("page")))))) {
      throw new AuthError(422, "Filter katalog tidak valid. Nama maksimal 100 karakter; gunakan jenjang dan halaman yang tersedia.");
    }
    const configured = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!configured) throw new AuthError(503, "Alamat API backend belum dikonfigurasi.");
    let base: URL;
    try { base = new URL(configured); } catch { throw new AuthError(503, "Alamat API backend tidak valid."); }
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
      throw new AuthError(503, "Alamat API backend tidak valid.");
    }
    let response: Response;
    try {
      response = await fetch(`${base.href.replace(/\/+$/, "")}/beasiswa?${query.toString()}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000),
      });
    } catch { throw new AuthError(503, "Katalog belum dapat dihubungi. Periksa Tailscale dan server BE."); }
    if (!response.ok) {
      const message = response.status === 401 ? "Sesi telah berakhir. Silakan masuk lagi."
        : response.status === 403 ? "Akun ini belum memiliki izin mengakses katalog admin."
        : response.status === 422 ? "Filter katalog belum dapat diproses oleh backend."
        : response.status === 429 ? "Terlalu banyak permintaan. Tunggu sebelum mencoba lagi."
        : "Katalog belum tersedia. Silakan coba lagi nanti.";
      if (response.status === 401) return clearSession(authResponse({ message, session_expired: true }, 401), request);
      throw new AuthError(response.status >= 500 ? 503 : response.status, message);
    }
    let page;
    try { page = parseScholarshipPage(await response.json()); }
    catch { throw new AuthError(502, "Respons katalog belum sesuai kontrak. Perlu dicocokkan dengan tim BE."); }
    return authResponse(page);
  } catch (error) { return authFailure(error); }
}
