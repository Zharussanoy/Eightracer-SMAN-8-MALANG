import {parseRecommendationPreview,type RecommendationCandidate} from "./b4-recommendations";
export interface ProgramNote {revision:number;reason:string|null;timing:string|null}
export interface ProgramStudent {id:number;name:string;classroom:string|null;candidate:RecommendationCandidate;fingerprint:string;reason:string;note:ProgramNote|null}
export interface ProgramBatch {data:ProgramStudent[];total:number;nextCursor:number|null;analysedAt:string}
const object=(v:unknown):Record<string,unknown>=>{if(!v||typeof v!=="object"||Array.isArray(v))throw Error("Hasil analisis belum dapat dibaca.");return v as Record<string,unknown>;};
const integer=(v:unknown,min=0)=>{if(typeof v!=="number"||!Number.isSafeInteger(v)||v<min)throw Error("Angka analisis tidak valid.");return v;};
const text=(v:unknown)=>typeof v==="string"?v:null;
export function parseProgramNote(value:unknown):ProgramNote {const r=object(value);return {revision:integer(r.revision,1),reason:text(r.reason),timing:text(r.timing)};}
export function parseProgramBatch(value:unknown,programId:number):ProgramBatch {
 const r=object(value);if(!Array.isArray(r.data)||r.data.length>10||typeof r.analysed_at!=="string")throw Error("Daftar analisis tidak valid.");
 const seen=new Set<number>();
 const data=r.data.map(value=>{const s=object(value),id=integer(s.id,1),name=text(s.name),fingerprint=text(s.fingerprint),preview=parseRecommendationPreview(s.preview);
  if(seen.has(id)||!name||!fingerprint||!/^[a-f0-9]{64}$/.test(fingerprint)||preview.candidates.length!==1||preview.candidates[0].id!==programId)throw Error("Siswa atau program analisis tidak sesuai.");seen.add(id);
  return {id,name,classroom:text(s.classroom),candidate:preview.candidates[0],fingerprint,reason:text(s.reason)??"",note:s.note==null?null:parseProgramNote(s.note)};
 });
 const total=integer(r.total),nextCursor=r.next_cursor===null?null:integer(r.next_cursor,1);
 if(total<data.length||nextCursor!==null&&(!data.length||nextCursor!==data[data.length-1].id))throw Error("Urutan analisis tidak valid.");
 return {data,total,nextCursor,analysedAt:r.analysed_at};
}
function bucket(c:RecommendationCandidate){return c.complete&&c.meets?2:!c.complete&&!c.checklist.some(k=>k.status==="belum_terpenuhi")?1:0;}
export function sortProgramStudents(rows:ProgramStudent[]):ProgramStudent[]{
 return [...rows].sort((a,b)=>bucket(b.candidate)-bucket(a.candidate)||(b.candidate.score??0)-(a.candidate.score??0)
  ||((a.candidate.meets&&b.candidate.meets||bucket(a.candidate)===1&&bucket(b.candidate)===1)?(b.candidate.ranking.similarity??0)-(a.candidate.ranking.similarity??0):0)
  ||a.name.localeCompare(b.name,"id",{sensitivity:"base"})||a.id-b.id);
}
export function parseProgramExplanation(value:unknown){const r=object(object(value).data);if(typeof r.reason!=="string"||typeof r.llmUsed!=="boolean"||!Array.isArray(r.preparations)||r.preparations.some(v=>typeof v!=="string"))throw Error("Penjelasan belum dapat dibaca.");return{reason:r.reason,llmUsed:r.llmUsed,preparations:r.preparations as string[]};}
