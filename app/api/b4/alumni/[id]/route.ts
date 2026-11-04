import { NextRequest } from "next/server";
import { parseAlumniDetail } from "@/lib/b4-alumni";
import { parseAlumniTimeline } from "@/lib/b4-timeline";
import { alumniBackend } from "@/lib/server/alumni-backend";
import { AuthError, authFailure, authResponse } from "@/lib/server/backend-auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const query = request.nextUrl.searchParams;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))
      || [...query.keys()].some((key) => key !== "timeline_complete" || query.getAll(key).length !== 1)
      || (query.has("timeline_complete") && query.get("timeline_complete") !== "1")) throw new AuthError(422, "ID/filter alumni tidak valid.");
    const result = await alumniBackend(request, `/${id}${query.has("timeline_complete") ? "?timeline_complete=1" : ""}`);
    if (result.response) return result.response;
    try { return authResponse({ data: query.has("timeline_complete") ? parseAlumniTimeline(result.payload) : parseAlumniDetail(result.payload) }); }
    catch { throw new AuthError(502, "Respons detail alumni belum sesuai kontrak."); }
  } catch (error) { return authFailure(error); }
}
