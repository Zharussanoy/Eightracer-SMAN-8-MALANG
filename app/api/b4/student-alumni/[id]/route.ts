import { NextRequest } from "next/server";
import { parseStudentAlumniDetail } from "@/lib/b4-student-alumni";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { alumniFailure } from "@/lib/server/backend-alumni";
import { readStudentAlumni } from "@/lib/server/backend-student-alumni";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)) || request.nextUrl.search) throw new AuthError(422, "ID Jejak Alumni tidak valid.");
    return authResponse(parseStudentAlumniDetail(await readStudentAlumni(request, `/jejak-alumni/${id}`), Number(id)));
  } catch (error) { return alumniFailure(error, request); }
}
