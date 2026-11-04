import { NextRequest } from "next/server";
import { parseAlumniPage } from "@/lib/b4-alumni";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { alumniFailure, readBackendAlumni } from "@/lib/server/backend-alumni";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const allowed = ["search", "page", "perguruan_tinggi_id", "program_studi", "jalur_masuk", "angkatan"];
    if ([...query.keys()].some((key) => !allowed.includes(key) || query.getAll(key).length !== 1)
      || [...query.values()].some((value) => value.length > 100)
      || ["page", "perguruan_tinggi_id"].some((key) => query.has(key) && (!/^[1-9]\d*$/.test(query.get(key)!) || !Number.isSafeInteger(Number(query.get(key)))))
      || (query.has("angkatan") && !/^\d{4}$/.test(query.get("angkatan")!))) throw new AuthError(422, "Filter daftar alumni tidak valid.");
    const backendQuery = new URLSearchParams(query);
    backendQuery.set("per_page", "20");
    return authResponse(parseAlumniPage(await readBackendAlumni(request, `/study-tracer?${backendQuery}`)));
  } catch (error) { return alumniFailure(error, request); }
}
