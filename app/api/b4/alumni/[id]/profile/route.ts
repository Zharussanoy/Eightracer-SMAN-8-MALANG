import { NextRequest } from "next/server";
import { parseAlumniProfile } from "@/lib/b4-alumni-legacy";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { alumniFailure, readBackendAlumni } from "@/lib/server/backend-alumni";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params, query = request.nextUrl.searchParams, admission = query.get("penerimaan_id");
    const valid = (value: string) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
    if (!valid(id) || [...query.keys()].some((key) => key !== "penerimaan_id" || query.getAll(key).length !== 1) || (admission !== null && !valid(admission))) throw new AuthError(422, "Pilihan profil alumni tidak valid.");
    const payload = await readBackendAlumni(request, admission ? `/study-tracer/${admission}` : `/siswa/${id}`);
    return authResponse(parseAlumniProfile(payload, Number(id), admission ? Number(admission) : undefined));
  } catch (error) { return alumniFailure(error, request); }
}
