import {NextRequest} from "next/server";
import {authResponse,AuthError} from "@/lib/server/backend-auth";
import {backendRecommendations,recommendationFailure,recommendationId,recommendationInput} from "@/lib/server/backend-recommendations";
import {parseRecommendationDraft} from "@/lib/b4-recommendation-data";
type Context={params:Promise<{id:string;detail:string}>};
async function mutate(request:NextRequest,context:Context,method:"PATCH"|"DELETE"){
 try{
  const params=await context.params,studentId=recommendationId(params.id),detailId=recommendationId(params.detail);
  const fields=method==="DELETE"?["recommendation_id","revision"]:["recommendation_id","revision","reason","timing","hidden"];
  const body=await recommendationInput(request,fields);
  if(request.nextUrl.search||typeof body.recommendation_id!=="number"||typeof body.revision!=="number")throw new AuthError(422,"Pilih draft yang valid.");
  const batchId=recommendationId(String(body.recommendation_id)),revision=recommendationId(String(body.revision));
  const changes:Record<string,unknown>={siswa_id:studentId,revision};
  if(method==="PATCH"){
   if(!["reason","timing","hidden"].some(k=>Object.hasOwn(body,k)))throw new AuthError(422,"Tidak ada perubahan.");
   if(Object.hasOwn(body,"reason")){if(typeof body.reason!=="string"||!body.reason.trim()||body.reason.length>1500)throw new AuthError(422,"Alasan kecocokan wajib diisi, maksimal 1500 karakter.");changes.alasan_rekomendasi=body.reason.trim();}
   if(Object.hasOwn(body,"timing")){if(body.timing!==null&&(typeof body.timing!=="string"||body.timing.length>180))throw new AuthError(422,"Waktu yang disarankan maksimal 180 karakter.");changes.waktu_disarankan=typeof body.timing==="string"?body.timing.trim()||null:null;}
   if(Object.hasOwn(body,"hidden")){if(typeof body.hidden!=="boolean")throw new AuthError(422,"Pilihan visibilitas tidak valid.");changes.is_hidden=body.hidden;}
  }
  const draft=parseRecommendationDraft(await backendRecommendations(request,"/rekomendasi-beasiswa/"+batchId+"/detail/"+detailId,{method,body:changes}));
  if(draft.id!==batchId||draft.studentId!==studentId)throw Error("Mismatched recommendation");
  return authResponse({draft});
 }catch(error){return recommendationFailure(error,request);}
}
export function PATCH(request:NextRequest,context:Context){return mutate(request,context,"PATCH");}
export function DELETE(request:NextRequest,context:Context){return mutate(request,context,"DELETE");}
