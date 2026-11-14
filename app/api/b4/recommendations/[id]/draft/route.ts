import {NextRequest} from "next/server";
import {authResponse,AuthError} from "@/lib/server/backend-auth";
import {backendRecommendations,recommendationFailure,recommendationId} from "@/lib/server/backend-recommendations";
import {parseRecommendationDraft} from "@/lib/b4-recommendation-data";
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{const studentId=recommendationId((await params).id),q=request.nextUrl.searchParams,level=q.get("target_jenjang");
 if([...q.keys()].some(k=>k!=="target_jenjang"||q.getAll(k).length!==1)||!["SMA","Kuliah"].includes(level??""))throw new AuthError(422,"Pilih jenjang yang valid.");
 const payload=await backendRecommendations(request,"/rekomendasi-beasiswa",{query:new URLSearchParams({siswa_id:String(studentId),target_jenjang:level!})}) as {data?:unknown[]};
 if(!Array.isArray(payload.data))throw Error("Invalid list");const draft=payload.data[0]?parseRecommendationDraft(payload.data[0]):null;
 if(draft&&(draft.studentId!==studentId||draft.targetLevel!==level))throw Error("Mismatched draft");
 return authResponse({draft});}catch(e){return recommendationFailure(e,request);}
}
