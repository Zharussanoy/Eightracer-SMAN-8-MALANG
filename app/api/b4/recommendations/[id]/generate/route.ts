import {NextRequest} from "next/server";
import {authResponse,AuthError} from "@/lib/server/backend-auth";
import {backendRecommendations,recommendationFailure,recommendationId,recommendationInput} from "@/lib/server/backend-recommendations";
import {parseRecommendationDraft} from "@/lib/b4-recommendation-data";
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{const studentId=recommendationId((await params).id),body=await recommendationInput(request,["target_jenjang"]);
 if(request.nextUrl.search||!["SMA","Kuliah"].includes(String(body.target_jenjang)))throw new AuthError(422,"Pilih jenjang yang valid.");
 const draft=parseRecommendationDraft(await backendRecommendations(request,"/siswa/"+studentId+"/rekomendasi-beasiswa/generate",{method:"POST",body}));
 if(draft.studentId!==studentId||draft.targetLevel!==body.target_jenjang)throw Error("Mismatched draft");
 return authResponse({draft},201);}catch(e){return recommendationFailure(e,request);}
}
