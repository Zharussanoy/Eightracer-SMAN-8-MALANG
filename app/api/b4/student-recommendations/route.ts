import { NextRequest } from "next/server";
import { parseStudentRecommendations } from "@/lib/b4-student-recommendations";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { readBackendRecommendations, recommendationFailure } from "@/lib/server/backend-recommendations";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const page = query.get("page") ?? "1";
    if ([...query.keys()].some(key => key !== "page" || query.getAll(key).length !== 1) || !/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(Number(page))) throw new AuthError(422, "Halaman rekomendasi tidak valid.");
    const result = parseStudentRecommendations(await readBackendRecommendations(request, "/rekomendasi-beasiswa/saya", new URLSearchParams({ page })));
    if (result.currentPage !== Number(page)) throw new AuthError(502, "Halaman respons rekomendasi berbeda dari permintaan.");
    return authResponse(result);
  } catch (error) { return recommendationFailure(error, request); }
}
