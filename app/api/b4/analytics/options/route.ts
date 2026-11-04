import { NextRequest } from "next/server";
import { schoolScholarshipOptions } from "@/lib/b4-school-data";
import { alumniBackend } from "@/lib/server/alumni-backend";
import { alumniFailure } from "@/lib/server/backend-alumni";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
export async function GET(request: NextRequest) {
  try {
    const q=request.nextUrl.searchParams;
    if ([...q.keys()].some(k=> k!=="search" || q.getAll(k).length!==1) || (q.get("search")??"").length>100) throw new AuthError(422,"Pencarian tidak valid.");
    const result=await alumniBackend(request,"",{resource:"analitik-beasiswa/sekolah"});
    if(result.response) return result.response;
    const search=(q.get("search")??"").trim().toLocaleLowerCase("id");
    return authResponse({data:schoolScholarshipOptions(result.payload).filter(v=>v.name.toLocaleLowerCase("id").includes(search))});
  } catch(error) {return alumniFailure(error,request);}
}
