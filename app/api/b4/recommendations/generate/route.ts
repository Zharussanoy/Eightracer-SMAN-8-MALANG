import {NextRequest} from "next/server";
import {authResponse,AuthError} from "@/lib/server/backend-auth";
import {backendRecommendations,recommendationFailure,recommendationInput} from "@/lib/server/backend-recommendations";
import {parseStudentRecommendations} from "@/lib/b4-recommendation-data";
export async function POST(request:NextRequest){
 try{
  const body=await recommendationInput(request,["target_jenjang"]);
  if(request.nextUrl.search||body.target_jenjang!==undefined&&!["SMA","Kuliah"].includes(String(body.target_jenjang)))throw new AuthError(422,"Pilih jenjang yang valid.");
  const payload=await backendRecommendations(request,"/rekomendasi-beasiswa/saya/generate",{method:"POST",body}) as {state?:string;generated_at?:string};
  if(payload.state!=="ready"||typeof payload.generated_at!=="string")throw new AuthError(502,"Hasil rekomendasi belum dapat dibaca.");
  return authResponse({data:parseStudentRecommendations(payload),state:"ready",generatedAt:payload.generated_at});
 }catch(error){return recommendationFailure(error,request);}
}
