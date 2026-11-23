import { NextRequest } from "next/server";
import { parseScholarshipRow, type ScholarshipRow } from "@/lib/b4-scholarships";
import { AuthError, authResponse, checkMutation, SESSION_COOKIE } from "@/lib/server/backend-auth";
import { backendScholarships, scholarshipFailure, scholarshipsBulkInput } from "@/lib/server/backend-scholarships";

export async function POST(request: NextRequest) {
  try {
    checkMutation(request);
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) throw new AuthError(401, "Silakan masuk dengan akun sekolah.");
    const body = await request.text();
    if (body.length > 400_000) throw new AuthError(413, "Data impor beasiswa terlalu besar.");
    let payload: unknown;
    try { payload = JSON.parse(body); } catch { throw new AuthError(400, "JSON tidak valid."); }
    const result = await backendScholarships("/bulk", token, "POST", scholarshipsBulkInput(payload));
    const rows = (result as { data?: unknown })?.data;
    if (!Array.isArray(rows)) throw new AuthError(502, "Hasil impor belum dapat dipastikan. Periksa katalog sebelum mencoba lagi agar tidak membuat data ganda.");
    let saved: ScholarshipRow[];
    try { saved = rows.map((row) => parseScholarshipRow(row)); }
    catch { throw new AuthError(502, "Hasil impor belum dapat dipastikan. Periksa katalog sebelum mencoba lagi agar tidak membuat data ganda."); }
    return authResponse({ message: `${saved.length} beasiswa berhasil disimpan.`, data: saved }, 201);
  } catch (error) { return scholarshipFailure(error, request); }
}
