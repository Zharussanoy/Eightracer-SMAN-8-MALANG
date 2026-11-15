import {NextRequest} from "next/server";
import {AuthError,authResponse} from "@/lib/server/backend-auth";
import {backendRecommendations,recommendationFailure,recommendationId,recommendationInput} from "@/lib/server/backend-recommendations";
import {parseProgramBatch,parseProgramExplanation,parseProgramNote} from "@/lib/b4-program-analysis";
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string;action:string[]}>}){try{
 const {id,action}=await params,programId=recommendationId(id);
 if(request.nextUrl.search)throw new AuthError(422,"Permintaan tidak valid.");
 if(action.length===1&&action[0]==="analyse"){
  const body=await recommendationInput(request,["after_id"]);
  if(body.after_id!==undefined&&(typeof body.after_id!=="number"||!Number.isSafeInteger(body.after_id)||body.after_id<0))throw new AuthError(422,"Urutan siswa tidak valid.");
  const data=parseProgramBatch(await backendRecommendations(request,`/rekomendasi-program/${programId}/analisis`,{method:"POST",body}),programId);
  if(data.data.some(v=>v.id<=Number(body.after_id??0)))throw Error("Analysis cursor did not advance");
  return authResponse(data);
 }
 if(action.length!==3||action[0]!=="students"||!["explain","note"].includes(action[2]))throw new AuthError(422,"Tujuan analisis tidak valid.");
 const studentId=recommendationId(action[1]),isNote=action[2]==="note";
 const body=await recommendationInput(request,isNote?["fingerprint","revision","reason","timing"]:[]);
 if(isNote&&(typeof body.fingerprint!=="string"||!/^[a-f0-9]{64}$/.test(body.fingerprint)||typeof body.revision!=="number"||!Number.isSafeInteger(body.revision)||body.revision<0||typeof body.reason!=="string"||body.reason.length>1500||typeof body.timing!=="string"||body.timing.length>180))throw new AuthError(422,"Catatan belum lengkap atau terlalu panjang.");
 const payload=await backendRecommendations(request,`/rekomendasi-program/${programId}/siswa/${studentId}/${isNote?"catatan":"penjelasan"}`,{method:"POST",body});
 return authResponse(isNote?{data:parseProgramNote((payload as {data:unknown}).data)}:{data:parseProgramExplanation(payload)});
}catch(error){return recommendationFailure(error,request);}}
