import { NextRequest } from "next/server";
import { parseAlumniDetail } from "@/lib/b4-alumni";
import { alumniBackend } from "@/lib/server/alumni-backend";
import { AuthError, authFailure, authResponse } from "@/lib/server/backend-auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)) || request.nextUrl.search) throw new AuthError(422, "ID alumni tidak valid.");
    const result = await alumniBackend(request, `/${id}`);
    if (result.response) return result.response;
    try { return authResponse({ data: parseAlumniDetail(result.payload) }); }
    catch { throw new AuthError(502, "Respons detail alumni belum sesuai kontrak."); }
  } catch (error) { return authFailure(error); }
}
