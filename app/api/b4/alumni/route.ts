import { NextRequest } from "next/server";
import { parseAlumniPage } from "@/lib/b4-alumni";
import { alumniBackend } from "@/lib/server/alumni-backend";
import { AuthError, authFailure, authResponse } from "@/lib/server/backend-auth";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const allowed = ["search", "perguruan_tinggi_id", "program_studi", "jalur_masuk", "page", "timeline_complete"];
    if ([...query.keys()].some((key) => !allowed.includes(key) || query.getAll(key).length !== 1)
      || (query.get("search") ?? "").length > 100 || (query.get("program_studi") ?? "").length > 255
      || (query.get("jalur_masuk") ?? "").length > 50
      || (query.has("timeline_complete") && query.get("timeline_complete") !== "1")
      || ["page", "perguruan_tinggi_id"].some((key) => query.has(key)
        && (!/^[1-9]\d*$/.test(query.get(key)!) || !Number.isSafeInteger(Number(query.get(key)))))) {
      throw new AuthError(422, "Pencarian/filter alumni tidak valid.");
    }
    const upstream = new URLSearchParams(query);
    upstream.set("include_filters", "1"); upstream.set("per_page", "8");
    const result = await alumniBackend(request, `?${upstream}`, { resource: "b4/alumni" });
    if (result.response) return result.response;
    try {
      if (query.has("timeline_complete") && (result.payload as { timeline_complete_only?: unknown })?.timeline_complete_only !== true) throw new Error("Penyaring timeline belum diterapkan.");
      return authResponse(parseAlumniPage(result.payload));
    }
    catch { throw new AuthError(502, "Data rekomendasi belum dapat dibaca. Silakan coba lagi."); }
  } catch (error) { return authFailure(error); }
}
