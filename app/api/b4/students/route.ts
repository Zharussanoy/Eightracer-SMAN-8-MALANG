import { NextRequest } from "next/server";
import { parseRecommendationStudents } from "@/lib/b4-students";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { readBackendRecommendations, recommendationFailure } from "@/lib/server/backend-recommendations";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    if ([...query.keys()].some((key) => !["search", "angkatan", "page"].includes(key) || query.getAll(key).length !== 1)
      || (query.get("search") ?? "").length > 100
      || (query.has("angkatan") && !/^\d{4}$/.test(query.get("angkatan")!))
      || (query.has("page") && (!/^[1-9]\d*$/.test(query.get("page")!) || !Number.isSafeInteger(Number(query.get("page")))))) throw new AuthError(422, "Pencarian siswa tidak valid. Angkatan harus 4 digit.");
    const backendQuery = new URLSearchParams(query);
    backendQuery.set("per_page", "20");
    return authResponse(parseRecommendationStudents(await readBackendRecommendations(request, "/siswa", backendQuery)));
  } catch (error) { return recommendationFailure(error, request); }
}
