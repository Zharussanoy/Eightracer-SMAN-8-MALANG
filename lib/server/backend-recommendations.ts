import "server-only";
import { NextRequest } from "next/server";
import { AuthError, authResponse, checkMutation, clearSession, SESSION_COOKIE } from "./backend-auth";

const allowedMessages = new Set([
  "Akun belum terhubung dengan data siswa.",
  "Jenjang siswa belum diketahui. Lengkapi riwayat kelas aktif SMA.",
  "Belum ada beasiswa aktif yang sesuai jenjang.",
  "Data sumber berubah. Generate ulang sebelum publikasi.",
  "Data kriteria belum lengkap; rekomendasi tidak dapat dipublikasikan.",
  "Belum ada beasiswa yang memenuhi seluruh persyaratan.",
  "Rekomendasi sudah ditinjau. Buat draft baru untuk revisi.",
  "Rekomendasi berubah. Muat ulang sebelum menyimpan.",
  "Ada draft lebih baru. Muat ulang rekomendasi.",
  "Layanan rekomendasi belum tersedia.",
  "Gemini belum dapat menghasilkan rekomendasi valid. Silakan coba lagi.",
]);
export async function backendRecommendations(request: NextRequest, path: string, options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; query?: URLSearchParams; body?: unknown } = {}) {
  const method=options.method??"GET";
  const valid=method==="GET" ? path==="/siswa" || /^\/siswa\/[1-9]\d*\/rekomendasi-beasiswa\/preview$/.test(path) || /^\/rekomendasi-beasiswa(?:\/saya|\/[1-9]\d*)?$/.test(path)
    : method==="POST" ? path==="/chat-beasiswa" || /^\/siswa\/[1-9]\d*\/rekomendasi-beasiswa\/generate$/.test(path)
    : method==="PATCH" ? /^\/rekomendasi-beasiswa\/[1-9]\d*\/(?:review|detail\/[1-9]\d*)$/.test(path)
    : /^\/rekomendasi-beasiswa\/[1-9]\d*\/detail\/[1-9]\d*$/.test(path);
  if(!valid)throw new AuthError(422,"Tujuan rekomendasi tidak valid.");
  const token=request.cookies.get(SESSION_COOKIE)?.value;
  if(!token)throw new AuthError(401,"Silakan masuk dengan akun sekolah.");
  let base:URL;try{base=new URL(process.env.API_BASE_URL||process.env.NEXT_PUBLIC_API_BASE_URL||"");}catch{throw new AuthError(503,"Alamat BE belum dikonfigurasi.");}
  if(!["http:","https:"].includes(base.protocol)||base.username||base.password||base.search||base.hash)throw new AuthError(503,"Alamat BE tidak valid.");
  let response:Response;
  try{response=await fetch(base.href.replace(/\/+$/,"")+path+(options.query?.size?"?"+options.query:""),{
    method,headers:{Accept:"application/json",Authorization:"Bearer "+token,...(options.body===undefined?{}:{"Content-Type":"application/json"})},
    body:options.body===undefined?undefined:JSON.stringify(options.body),cache:"no-store",redirect:"error",
    signal:AbortSignal.timeout(method==="POST"?120_000:30_000),
  });}catch{throw new AuthError(503,method==="GET"?"Data rekomendasi belum dapat dihubungi.":"Respons belum diterima. Muat ulang untuk memeriksa draft sebelum mencoba lagi.");}
  const payload:unknown=await response.json().catch(()=>null);
  if(!response.ok){
    const p=payload&&typeof payload==="object"?payload as Record<string,unknown>:{};
    const known=typeof p.message==="string"&&allowedMessages.has(p.message)?p.message:null;
    throw new AuthError(response.status>=500?503:response.status,known??(
      response.status===401?"Sesi berakhir. Silakan masuk lagi.":response.status===403?"Akun ini belum memiliki izin mengakses rekomendasi ini.":
      response.status===404?(path==="/chat-beasiswa"||path.endsWith("/saya")?"Akun belum terhubung dengan data siswa.":"Data rekomendasi atau siswa tidak ditemukan."):
      response.status===409?"Data berubah. Generate ulang dan tinjau kembali sebelum publikasi.":
      response.status===422?"Periksa pilihan siswa, jenjang, atau kelengkapan data kriteria.":
      response.status===429?"Terlalu banyak permintaan. Tunggu sebelum mencoba lagi.":"Layanan rekomendasi belum tersedia."));
  }
  if(!payload||typeof payload!=="object")throw new AuthError(502,"Respons rekomendasi tidak valid.");
  return payload;
}
export function readBackendRecommendations(request:NextRequest,path:string,query=new URLSearchParams()){return backendRecommendations(request,path,{query});}
export function recommendationFailure(error:unknown,request:NextRequest){
  const status=error instanceof AuthError?error.status:502;
  const response=authResponse({message:error instanceof AuthError?error.message:"Respons rekomendasi belum sesuai kontrak.",...(status===401?{session_expired:true}:{})},status);
  return status===401?clearSession(response,request):response;
}
export async function recommendationInput(request:NextRequest,fields:string[]){
  checkMutation(request);
  const body=await request.text();if(body.length>12000)throw new AuthError(413,"Permintaan terlalu besar.");
  let data:unknown;try{data=JSON.parse(body);}catch{throw new AuthError(400,"JSON tidak valid.");}
  if(!data||typeof data!=="object"||Array.isArray(data)||Object.keys(data).some(k=>!fields.includes(k)))throw new AuthError(422,"Isian permintaan tidak valid.");
  return data as Record<string,unknown>;
}
export function recommendationId(value:string){if(!/^[1-9]\d*$/.test(value)||!Number.isSafeInteger(Number(value)))throw new AuthError(422,"ID tidak valid.");return Number(value);}
