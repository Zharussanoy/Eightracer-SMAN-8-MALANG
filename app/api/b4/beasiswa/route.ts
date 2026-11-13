import { NextRequest } from "next/server";
import { parseScholarshipPage, parseScholarshipRow } from "@/lib/b4-scholarships";
import { AuthError, authResponse, checkMutation, SESSION_COOKIE } from "@/lib/server/backend-auth";
import { backendScholarships, scholarshipFailure, scholarshipInput } from "@/lib/server/backend-scholarships";

// Tujuan backend tetap; tidak menerima URL bebas dari browser.
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
    const payload = await backendScholarships(`?${query.toString()}`, token);
    let page;
    try { page = parseScholarshipPage(payload); }
    catch { throw new AuthError(502, "Katalog belum dapat dimuat. Silakan coba lagi."); }
    return authResponse(page);
  } catch (error) { return scholarshipFailure(error, request); }
}

export async function POST(request: NextRequest) {
  try {
    checkMutation(request);
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) throw new AuthError(401, "Silakan masuk dengan akun sekolah.");
    const body = await request.text();
    if (body.length > 100_000) throw new AuthError(413, "Data beasiswa terlalu besar.");
    let payload: unknown;
    try { payload = JSON.parse(body); } catch { throw new AuthError(400, "JSON tidak valid."); }
    const result = await backendScholarships("", token, "POST", scholarshipInput(payload));
    let created;
    try { created = parseScholarshipRow((result as { data?: unknown })?.data); }
    catch { throw new AuthError(502, "Hasil penyimpanan belum dapat dipastikan. Periksa katalog sebelum mencoba lagi agar tidak membuat data ganda."); }
    return authResponse({ message: "Beasiswa berhasil disimpan.", id: created.id }, 201);
  } catch (error) { return scholarshipFailure(error, request); }
}
