import {NextRequest} from "next/server";
import {authResponse,AuthError} from "@/lib/server/backend-auth";
import {backendRecommendations,recommendationFailure,recommendationInput} from "@/lib/server/backend-recommendations";
import {parseScholarshipChat} from "@/lib/b4-recommendation-data";
export async function POST(request:NextRequest){
 try{const body=await recommendationInput(request,["message","beasiswa_id","target_jenjang"]);
 if(request.nextUrl.search||typeof body.message!=="string"||body.message.trim().length<3||body.message.length>2000
 ||body.beasiswa_id!==undefined&&(typeof body.beasiswa_id!=="number"||!Number.isSafeInteger(body.beasiswa_id)||body.beasiswa_id<1)
 ||body.target_jenjang!==undefined&&!["SMA","Kuliah"].includes(String(body.target_jenjang)))throw new AuthError(422,"Isi pertanyaan dan program yang valid.");
 return authResponse(parseScholarshipChat(await backendRecommendations(request,"/chat-beasiswa",{method:"POST",body})));
 }catch(e){return recommendationFailure(e,request);}
}
