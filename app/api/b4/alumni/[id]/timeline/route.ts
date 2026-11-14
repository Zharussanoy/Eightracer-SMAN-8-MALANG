import { NextRequest } from "next/server";
import { parseAlumniTimeline } from "@/lib/b4-alumni-legacy";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { alumniFailure, readBackendAlumni } from "@/lib/server/backend-alumni";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)) || request.nextUrl.search) throw new AuthError(422, "ID siswa untuk timeline tidak valid.");
    return authResponse(parseAlumniTimeline(await readBackendAlumni(request, `/alumni/${id}/timeline`)));
  } catch (error) { return alumniFailure(error, request); }
}
