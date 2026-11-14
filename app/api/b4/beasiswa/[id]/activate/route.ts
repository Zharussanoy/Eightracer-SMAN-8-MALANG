import {NextRequest} from "next/server";
import {AuthError,authResponse,checkMutation,SESSION_COOKIE} from "@/lib/server/backend-auth";
import {backendScholarships,scholarshipFailure} from "@/lib/server/backend-scholarships";
import {parseScholarshipRow} from "@/lib/b4-scholarships";
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{
  checkMutation(request);
  const token=request.cookies.get(SESSION_COOKIE)?.value;
  if(!token)throw new AuthError(401,"Silakan masuk dengan akun sekolah.");
  const {id}=await params;
  if(!/^[1-9]\d*$/.test(id)||!Number.isSafeInteger(Number(id))||request.nextUrl.search)throw new AuthError(422,"ID beasiswa tidak valid.");
  const text=await request.text();if(text.length>1000)throw new AuthError(413,"Permintaan terlalu besar.");
  let input;try{input=JSON.parse(text);}catch{throw new AuthError(400,"JSON tidak valid.");}
  if(!input||Array.isArray(input)||typeof input!=="object"||Object.keys(input).length)throw new AuthError(422,"Aktivasi hanya mengubah status program.");
  const payload=await backendScholarships(`/${id}/activate`,token,"POST",{});
  const row=parseScholarshipRow((payload as {data?:unknown}).data);
  if(row.id!==Number(id)||!row.active)throw new AuthError(502,"Aktivasi belum dapat dipastikan. Muat ulang katalog.");
  return authResponse({message:"Beasiswa berhasil diaktifkan."});
 }catch(error){return scholarshipFailure(error,request);}
}
