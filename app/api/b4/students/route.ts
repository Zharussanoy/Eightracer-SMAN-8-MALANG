import { NextRequest } from "next/server";
import { parseRecommendationStudents } from "@/lib/b4-students";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { readBackendRecommendations, recommendationFailure } from "@/lib/server/backend-recommendations";
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    if ([...query.keys()].some(key=>!["search","angkatan","page","kelas_id","publication"].includes(key)||query.getAll(key).length!==1)
      || (query.get("search") ?? "").length > 100
      || (query.has("angkatan") && !/^\d{4}$/.test(query.get("angkatan")!))
      || ["page","kelas_id"].some(k=>query.has(k)&&(!/^[1-9]\d*$/.test(query.get(k)!)||!Number.isSafeInteger(Number(query.get(k)))))
      || (query.has("publication")&&!["true","false"].includes(query.get("publication")!))) throw new AuthError(422,"Filter siswa tidak valid.");
    const backendQuery=new URLSearchParams(query);
    if(query.has("publication")){backendQuery.delete("publication");backendQuery.set("rekomendasi_published",query.get("publication")==="true"?"1":"0");}
    backendQuery.set("per_page","20");
    return authResponse(parseRecommendationStudents(await readBackendRecommendations(request,"/siswa",backendQuery)));
  } catch(error){return recommendationFailure(error,request);}
}
