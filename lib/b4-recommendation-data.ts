import { parseRecommendationPreview, type RecommendationCandidate } from "./b4-recommendations";
type Obj=Record<string,unknown>;
const obj=(v:unknown):Obj=>{if(!v||typeof v!=="object"||Array.isArray(v))throw Error("Respons rekomendasi tidak valid.");return v as Obj;};
const id=(v:unknown)=>{if(typeof v!=="number"||!Number.isSafeInteger(v)||v<1)throw Error("ID rekomendasi tidak valid.");return v;};
const text=(v:unknown)=>typeof v==="string"&&v.trim()?v:null;
const texts=(v:unknown)=>{if(!Array.isArray(v)||v.some(x=>typeof x!=="string"))throw Error("Persiapan tidak valid.");return v as string[];};
const url=(v:unknown)=>{try{const u=new URL(String(v));return ["http:","https:"].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}};
export interface RecommendationDraft{
 id:number;studentId:number;status:"pending"|"disetujui"|"ditolak";targetLevel:"SMA"|"Kuliah";
 candidates:(RecommendationCandidate&{reason:string|null;preparations:string[]})[];
}
export function parseRecommendationDraft(payload:unknown):RecommendationDraft{
 const outer=obj(payload),r=obj(outer.data??outer);
 if(!["pending","disetujui","ditolak"].includes(String(r.status_review))||!Array.isArray(r.rekomendasi_beasiswa_detail))throw Error("Draft tidak valid.");
 const details=r.rekomendasi_beasiswa_detail.map(obj);
 const preview=parseRecommendationPreview({data:{target_jenjang:r.target_jenjang,kandidat:details.map(d=>({beasiswa_id:d.beasiswa_id,beasiswa:d.beasiswa_snapshot,evaluasi:d.evaluasi_kriteria}))}});
 return {id:id(r.id),studentId:id(r.siswa_id),status:r.status_review as RecommendationDraft["status"],targetLevel:preview.targetLevel,
  candidates:preview.candidates.map((c,i)=>({...c,reason:text(details[i].alasan_rekomendasi),preparations:texts(details[i].persiapan??[])}))};
}
export interface StudentRecommendation extends RecommendationCandidate{
 key:string;batchId:number;scholarshipId:number;reason:string|null;preparations:string[];registrationUrl:string|null;registrationStatus:string|null;
}
export function parseStudentRecommendations(payload:unknown):StudentRecommendation[]{
 const root=obj(payload);if(!Array.isArray(root.data))throw Error("Daftar rekomendasi tidak valid.");
 const seenLevels=new Set<string>();const result:StudentRecommendation[]=[];
 for(const raw of root.data){
  const batch=obj(raw),batchId=id(batch.id);if(!Array.isArray(batch.beasiswa))throw Error("Detail rekomendasi tidak valid.");
  if(batch.status!=="Terpublikasi")throw Error("Rekomendasi belum dipublikasikan.");
  const level=String(batch.target_jenjang);if(seenLevels.has(level))continue;seenLevels.add(level);
  for(const rawDetail of batch.beasiswa){
   const d=obj(rawDetail),info=obj(d.informasi);if(d.memenuhi_syarat!==true)continue;
   const scholarshipId=id(d.beasiswa_id),checks=d.checklist;if(!Array.isArray(checks))throw Error("Checklist tidak valid.");
   const candidate=parseRecommendationPreview({data:{target_jenjang:batch.target_jenjang,kandidat:[{beasiswa_id:scholarshipId,beasiswa:info,evaluasi:{skor:d.skor_kecocokan,memenuhi:d.memenuhi_syarat,lengkap:checks.length>0&&checks.every(v=>obj(v).status==="terpenuhi"),checklist:checks,pemeringkatan_ml:d.pemeringkatan_ml??{}}}]}}).candidates[0];
   result.push({...candidate,key:batchId+"-"+scholarshipId,batchId,scholarshipId,reason:text(d.alasan),preparations:texts(d.persiapan??[]),registrationUrl:url(info.link_pendaftaran),registrationStatus:text(d.status_pendaftaran)});
  }
 }
 return result;
}
export interface ScholarshipChatReply {answer:string;llmUsed:boolean;status:string|null;scholarshipId:number|null;suggestions:{id:number;name:string}[]}
export function parseScholarshipChat(payload:unknown):ScholarshipChatReply{
 const r=obj(obj(payload).data),answer=text(r.answer);if(!answer||typeof r.llm_used!=="boolean")throw Error("Jawaban tidak valid.");
 if(r.suggestions!==undefined&&!Array.isArray(r.suggestions))throw Error("Pilihan tidak valid.");
 return {answer,llmUsed:r.llm_used,status:text(r.status),scholarshipId:r.beasiswa_id==null?null:id(r.beasiswa_id),
 suggestions:((r.suggestions??[]) as unknown[]).map(v=>{const s=obj(v),name=text(s.nama_beasiswa);if(!name)throw Error("Nama program tidak valid.");return{id:id(s.id),name};})};
}
export async function recommendationRequest<T>(path:string,options:{method?:"POST";body?:unknown;signal?:AbortSignal}={}):Promise<T>{
 const response=await fetch(path,{method:options.method??"GET",body:options.body===undefined?undefined:JSON.stringify(options.body),
 headers:{Accept:"application/json",...(options.body===undefined?{}:{"Content-Type":"application/json"})},credentials:"same-origin",cache:"no-store",signal:options.signal});
 const payload=await response.json().catch(()=>null);if(!response.ok){const error=new Error(payload?.message??"Rekomendasi belum dapat diproses.");Object.assign(error,{status:response.status});throw error;}return payload as T;
}
