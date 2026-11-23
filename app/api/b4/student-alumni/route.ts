import { NextRequest } from "next/server";
import { parseStudentAlumniPage } from "@/lib/b4-student-alumni";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { alumniFailure } from "@/lib/server/backend-alumni";
import { readStudentAlumni } from "@/lib/server/backend-student-alumni";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const limits:Record<string,number>={search:100,program_studi:100,jalur_masuk:50};
    const allowed=["page","search","program_studi","jalur_masuk","perguruan_tinggi_id","include_filters"];
    if ([...query.keys()].some(key=>!allowed.includes(key)||query.getAll(key).length!==1)) throw new AuthError(422,"Filter Jejak Alumni tidak valid.");
    for(const key of ["page","perguruan_tinggi_id"]) if(query.has(key)&&(!/^[1-9]\d*$/.test(query.get(key)!)||!Number.isSafeInteger(Number(query.get(key))))) throw new AuthError(422,"Halaman atau kampus tidak valid.");
    for(const [key,max] of Object.entries(limits)) if(query.has(key)&&Array.from(query.get(key)!).length>max) throw new AuthError(422,"Filter Jejak Alumni terlalu panjang.");
    if(query.has("include_filters")&&query.get("include_filters")!=="1") throw new AuthError(422,"Filter Jejak Alumni tidak valid.");
    return authResponse(parseStudentAlumniPage(await readStudentAlumni(request, `/jejak-alumni?${query}`)));
  } catch (error) { return alumniFailure(error, request); }
}
