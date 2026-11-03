import { NextRequest } from "next/server";
import { parseSchoolScholarshipPage, parseSchoolScholarshipSummary, schoolSourceKinds } from "@/lib/b4-school-scholarships";
import { AuthError, authFailure, authResponse, clearSession, SESSION_COOKIE } from "@/lib/server/backend-auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return authResponse({ message: "Silakan masuk dengan akun sekolah." }, 401);
  try {
    const query = request.nextUrl.searchParams;
    if ([...query.keys()].some((key) => !["search", "tahun_lulus", "jenis_keterangan", "page"].includes(key) || query.getAll(key).length !== 1)
      || (query.get("search") ?? "").length > 100
      || (query.has("tahun_lulus") && !["2024", "2025", "2026"].includes(query.get("tahun_lulus")!))
      || (query.has("jenis_keterangan") && !Object.prototype.hasOwnProperty.call(schoolSourceKinds, query.get("jenis_keterangan")!))
      || (query.has("page") && (!/^[1-9]\d*$/.test(query.get("page")!) || !Number.isSafeInteger(Number(query.get("page")))))) {
      throw new AuthError(422, "Pencarian atau filter data sekolah tidak valid.");
    }
    const configured = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!configured) throw new AuthError(503, "Data sekolah belum dapat dihubungi.");
    let base: URL;
    try { base = new URL(configured); } catch { throw new AuthError(503, "Alamat layanan sekolah tidak valid."); }
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
      throw new AuthError(503, "Alamat layanan sekolah tidak valid.");
    }
    const url = base.href.replace(/\/+$/, "");
    let response: Response;
    let payload: unknown;
    try {
      const upstream = new URLSearchParams(query);
      upstream.set("include_summary", "1");
      response = await fetch(`${url}/riwayat-beasiswa-sumber?${upstream}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(30_000),
      });
      payload = response.ok ? await response.json() : null;
    } catch { throw new AuthError(503, "Data sekolah belum dapat dimuat. Coba lagi beberapa saat."); }
    if (response.status === 401) {
      return clearSession(authResponse({ message: "Sesi telah berakhir. Silakan masuk lagi.", session_expired: true }, 401), request);
    }
    if (!response.ok) throw new AuthError(response.status >= 500 ? 503 : response.status,
      response.status === 403 ? "Data sekolah hanya dapat dibaca oleh administrator atau Guru BK yang berwenang."
        : response.status === 422 ? "Pencarian atau filter data sekolah tidak valid."
        : response.status === 429 ? "Terlalu banyak permintaan. Tunggu sebelum mencoba lagi."
        : "Data sekolah belum tersedia. Coba lagi beberapa saat.");
    try {
      const page = payload as Record<string, unknown>;
      return authResponse({ ...parseSchoolScholarshipPage(page), summary: parseSchoolScholarshipSummary({ data: page.school_summary }) });
    } catch { throw new AuthError(502, "Respons data sekolah belum dapat dibaca. Hubungi pengelola."); }
  } catch (error) { return authFailure(error); }
}
