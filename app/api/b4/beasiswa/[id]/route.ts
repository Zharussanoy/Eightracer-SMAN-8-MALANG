import { NextRequest } from "next/server";
import { AuthError, authResponse, checkMutation, SESSION_COOKIE } from "@/lib/server/backend-auth";
import { backendScholarships, scholarshipFailure, scholarshipInput } from "@/lib/server/backend-scholarships";
import { parseScholarshipRow } from "@/lib/b4-scholarships";

type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) throw new AuthError(401, "Silakan masuk dengan akun sekolah.");
    const { id } = await context.params;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)) || request.nextUrl.search) throw new AuthError(422, "ID beasiswa tidak valid.");
    const payload = await backendScholarships(`/${id}`, token);
    let row;
    try {
      row = parseScholarshipRow((payload as { data?: unknown })?.data);
      if (row.id !== Number(id) || !row.input) throw new Error();
    } catch { throw new AuthError(502, "Detail beasiswa belum memuat kriteria lengkap sesuai kontrak. Hubungi tim BE sebelum mengubah data."); }
    return authResponse(row);
  } catch (error) { return scholarshipFailure(error, request); }
}

async function mutate(request: NextRequest, context: Context, method: "PUT" | "DELETE") {
  try {
    checkMutation(request);
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) throw new AuthError(401, "Silakan masuk dengan akun sekolah.");
    const { id } = await context.params;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new AuthError(422, "ID beasiswa tidak valid.");
    let input;
    if (method === "PUT") {
      const body = await request.text();
      if (body.length > 100_000) throw new AuthError(413, "Data beasiswa terlalu besar.");
      let parsed: unknown;
      try { parsed = JSON.parse(body); } catch { throw new AuthError(400, "JSON tidak valid."); }
      input = scholarshipInput(parsed);
    }
    const result = await backendScholarships(`/${id}`, token, method, input);
    if (method === "PUT") {
      try { if (parseScholarshipRow((result as { data?: unknown })?.data).id !== Number(id)) throw new Error(); }
      catch { throw new AuthError(502, "Respons pembaruan belum sesuai kontrak. Periksa katalog sebelum mencoba lagi."); }
    }
    return authResponse({ message: method === "DELETE" ? "Beasiswa berhasil diarsipkan." : "Beasiswa berhasil diperbarui." });
  } catch (error) { return scholarshipFailure(error, request); }
}
export function PUT(request: NextRequest, context: Context) { return mutate(request, context, "PUT"); }
export function DELETE(request: NextRequest, context: Context) { return mutate(request, context, "DELETE"); }
