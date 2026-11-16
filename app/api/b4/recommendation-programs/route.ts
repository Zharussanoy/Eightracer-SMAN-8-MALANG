import {NextRequest} from "next/server";
import {AuthError,authResponse} from "@/lib/server/backend-auth";
import {backendRecommendations,recommendationFailure} from "@/lib/server/backend-recommendations";
import {parseGeneralScholarshipPage} from "@/lib/b4-general-scholarships";
export async function GET(request:NextRequest){try{
 const q=request.nextUrl.searchParams;
 if([...q.keys()].some(k=>k!=="page"||q.getAll(k).length!==1)||q.has("page")&&(!/^[1-9]\d*$/.test(q.get("page")!)||Number(q.get("page"))>1000))throw new AuthError(422,"Halaman tidak valid.");
 return authResponse(parseGeneralScholarshipPage(await backendRecommendations(request,"/rekomendasi-program",{query:q})));
}catch(error){return recommendationFailure(error,request);}}
