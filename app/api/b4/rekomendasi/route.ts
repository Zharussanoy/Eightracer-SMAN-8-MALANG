import {NextRequest} from "next/server";
import {authResponse,AuthError} from "@/lib/server/backend-auth";
import {backendRecommendations,recommendationFailure} from "@/lib/server/backend-recommendations";
import {parseStudentRecommendations,parseRecommendationDraft} from "@/lib/b4-recommendation-data";
export async function GET(request:NextRequest){
 try{const q=request.nextUrl.searchParams;
 if([...q.keys()].some(k=>k!=="role"||q.getAll(k).length!==1)||q.has("role")&&!["admin","siswa"].includes(q.get("role")!))throw new AuthError(422,"Filter rekomendasi tidak valid.");
 const mine=q.get("role")==="siswa";
 const payload=await backendRecommendations(request,mine?"/rekomendasi-beasiswa/saya":"/rekomendasi-beasiswa") as {data?:unknown[]};
 if(mine)return authResponse({data:parseStudentRecommendations(payload)});
 if(!Array.isArray(payload.data))throw Error("Invalid list");return authResponse({data:payload.data.map(v=>parseRecommendationDraft(v))});
 }catch(e){return recommendationFailure(e,request);}
}
