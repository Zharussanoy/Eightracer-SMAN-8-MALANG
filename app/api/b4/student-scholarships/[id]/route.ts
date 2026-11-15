import {NextRequest} from "next/server";
import {AuthError,authResponse} from "@/lib/server/backend-auth";
import {backendRecommendations,recommendationFailure,recommendationId} from "@/lib/server/backend-recommendations";
import {parseGeneralScholarship} from "@/lib/b4-general-scholarships";
export async function GET(request:NextRequest,context:{params:Promise<{id:string}>}){try{
 if(request.nextUrl.search)throw new AuthError(422,"Pilihan beasiswa tidak valid.");
 const id=recommendationId((await context.params).id),payload=await backendRecommendations(request,"/beasiswa-siswa/"+id) as {data:unknown};
 const program=parseGeneralScholarship(payload.data,true);if(program.id!==id)throw new AuthError(502,"Informasi beasiswa belum dapat dibaca.");
 return authResponse({data:program});
}catch(error){return recommendationFailure(error,request);}}
