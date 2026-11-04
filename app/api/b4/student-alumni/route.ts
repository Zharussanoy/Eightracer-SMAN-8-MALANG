import { NextRequest } from "next/server";
import { parseStudentAlumniPage } from "@/lib/b4-student-alumni";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { alumniFailure } from "@/lib/server/backend-alumni";
import { readStudentAlumni } from "@/lib/server/backend-student-alumni";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    // Kontrak filter siswa belum dirinci: hanya pagination BE, pencarian UI berlaku pada halaman aktif.
    if ([...query.keys()].some((key) => key !== "page" || query.getAll(key).length !== 1) || (query.has("page") && (!/^[1-9]\d*$/.test(query.get("page")!) || !Number.isSafeInteger(Number(query.get("page")))))) throw new AuthError(422, "Halaman Jejak Alumni tidak valid.");
    return authResponse(parseStudentAlumniPage(await readStudentAlumni(request, `/jejak-alumni?${query}`)));
  } catch (error) { return alumniFailure(error, request); }
}
