import {NextRequest} from "next/server";
import {authResponse,AuthError} from "@/lib/server/backend-auth";
import {backendRecommendations,recommendationFailure,recommendationId,recommendationInput} from "@/lib/server/backend-recommendations";
import {parseRecommendationDraft} from "@/lib/b4-recommendation-data";
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{const studentId=recommendationId((await params).id),body=await recommendationInput(request,["recommendation_id","status_review"]);
 if(request.nextUrl.search||typeof body.recommendation_id!=="number"||!["disetujui","ditolak"].includes(String(body.status_review)))throw new AuthError(422,"Pilihan peninjauan tidak valid.");
 const recId=recommendationId(String(body.recommendation_id));
 const draft=parseRecommendationDraft(await backendRecommendations(request,"/rekomendasi-beasiswa/"+recId+"/review",{method:"PATCH",body:{status_review:body.status_review,siswa_id:studentId}}));
 if(draft.studentId!==studentId||draft.id!==recId)throw Error("Mismatched draft");return authResponse({draft});}catch(e){return recommendationFailure(e,request);}
}
