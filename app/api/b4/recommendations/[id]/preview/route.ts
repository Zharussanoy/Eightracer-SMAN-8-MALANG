import { NextRequest } from "next/server";
import { parseRecommendationPreview } from "@/lib/b4-recommendations";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { readBackendRecommendations, recommendationFailure } from "@/lib/server/backend-recommendations";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const query = request.nextUrl.searchParams;
    const level = query.get("target_jenjang");
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))
      || [...query.keys()].some((key) => key !== "target_jenjang" || query.getAll(key).length !== 1)
      || (level !== "SMA" && level !== "Kuliah")) throw new AuthError(422, "Pilih siswa dan target jenjang SMA atau Kuliah yang valid.");
    const preview = parseRecommendationPreview(await readBackendRecommendations(request, `/siswa/${id}/rekomendasi-beasiswa/preview`, new URLSearchParams({ target_jenjang: level })));
    if (preview.targetLevel !== level) throw new AuthError(502, "Jenjang respons berbeda dari pilihan. Muat ulang pratinjau.");
    return authResponse(preview);
  } catch (error) { return recommendationFailure(error, request); }
}
