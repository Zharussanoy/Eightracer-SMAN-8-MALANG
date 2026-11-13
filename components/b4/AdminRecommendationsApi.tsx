"use client";

import {useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {useUser} from "@/context/UserContext";
import B4Shell from "./B4Shell";
import RecommendationAdminView,{type RecommendationFilters} from "./RecommendationAdminView";
import {recommendationRequest,type RecommendationDraft,type EditableRecommendationCandidate} from "@/lib/b4-recommendation-data";
import type {RecommendationPreview} from "@/lib/b4-recommendations";
import type {RecommendationStudentPage} from "@/lib/b4-students";

const emptyFilters={query:"",classroom:"",cohort:""};
export default function AdminRecommendationsApi(){
 const {currentUser,refreshSession}=useUser(),router=useRouter();
 const [filters,setFilters]=useState<RecommendationFilters>(emptyFilters);
 const query=new URLSearchParams({page:"1"});
 if(filters.query.trim())query.set("search",filters.query.trim());
 if(filters.classroom)query.set("kelas_id",filters.classroom);
 if(filters.cohort)query.set("angkatan",filters.cohort);
 const queryKey=query.toString(),allowed=currentUser.schoolStaff===true;
 const [students,setStudents]=useState<{key:string;data?:RecommendationStudentPage;error?:string}>();
 const currentStudents=students?.key===queryKey?students:undefined;
 const page=currentStudents?.data,student=page?.data[0];
 const [target,setTarget]=useState<{studentId:number;level:string}>();
 const targetLevel=target?.studentId===student?.id?target?.level??"SMA":student?.cohort?"Kuliah":"SMA";
 const [version,setVersion]=useState(0),[directoryVersion,setDirectoryVersion]=useState(0),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const lock=useRef(false),requestKey=student?student.id+":"+targetLevel+":"+version:"";
 const [result,setResult]=useState<{key:string;data?:RecommendationPreview;draft?:RecommendationDraft|null;error?:string}>();
 const [mutation,setMutation]=useState<{key:string;draft:RecommendationDraft}>();
 const current=result?.key===requestKey?result:undefined;
 const draft=mutation?.key===requestKey?mutation.draft:current?.draft;
 const candidates=draft?.candidates??current?.data?.candidates.map(c=>({...c,detailId:null,hidden:false,reason:null,timing:null,preparations:[] as string[]}))??[];
 const expired=(error:unknown)=>{
  if(error&&typeof error==="object"&&"status" in error&&error.status===401){void refreshSession();router.replace("/login");return true;}
  return false;
 };
 useEffect(()=>{
  if(!allowed)return;
  const abort=new AbortController(),timer=setTimeout(()=>{
   recommendationRequest<RecommendationStudentPage>("/api/b4/students?"+queryKey,{signal:abort.signal})
    .then(data=>{if(!abort.signal.aborted)setStudents({key:queryKey,data});})
    .catch(error=>{if(abort.signal.aborted)return;if(error?.status===401){void refreshSession();router.replace("/login");return;}setStudents({key:queryKey,error:error instanceof Error?error.message:"Daftar siswa belum dapat dimuat."});});
  },300);
  return()=>{clearTimeout(timer);abort.abort();};
 },[allowed,queryKey,refreshSession,router,version,directoryVersion]);
 useEffect(()=>{
  if(!student||!allowed)return;
  const abort=new AbortController();
  Promise.all([
   recommendationRequest<RecommendationPreview>("/api/b4/recommendations/"+student.id+"/preview?target_jenjang="+targetLevel,{signal:abort.signal}),
   recommendationRequest<{draft:RecommendationDraft|null}>("/api/b4/recommendations/"+student.id+"/draft?target_jenjang="+targetLevel,{signal:abort.signal}),
  ]).then(([data,saved])=>{if(!abort.signal.aborted)setResult({key:requestKey,data,draft:saved.draft});})
   .catch(error=>{if(abort.signal.aborted)return;if(error?.status===401){void refreshSession();router.replace("/login");return;}setResult({key:requestKey,error:error instanceof Error?error.message:"Rekomendasi belum dapat dimuat."});});
  return()=>abort.abort();
 },[student,allowed,targetLevel,requestKey,refreshSession,router]);
 async function save(){
  if(!student||lock.current)return;
  lock.current=true;setBusy(true);setMessage("");
  try{
   const response=await recommendationRequest<{draft:RecommendationDraft}>("/api/b4/recommendations/"+student.id+"/generate",{method:"POST",body:{target_jenjang:targetLevel}});
   setMutation({key:requestKey,draft:response.draft});setDirectoryVersion(v=>v+1);setMessage("Hasil rekomendasi berhasil diperbarui. Siswa mengakses hasil perhitungan secara otomatis.");
  }catch(error){
   if(!expired(error))setMessage(error instanceof Error?error.message:"Perubahan belum dapat disimpan.");
   if(error&&typeof error==="object"&&"status" in error&&error.status===409){setMutation(undefined);setVersion(v=>v+1);}
  }
  finally{lock.current=false;setBusy(false);}
 }
 async function change(candidate:EditableRecommendationCandidate,method:"PATCH"|"DELETE",body:Record<string,unknown>={}):Promise<boolean>{
  if(!student||!draft||!candidate.detailId||lock.current)return false;
  lock.current=true;setBusy(true);setMessage("");
  try{
   const response=await recommendationRequest<{draft:RecommendationDraft}>("/api/b4/recommendations/"+student.id+"/items/"+candidate.detailId,{
    method,body:{recommendation_id:draft.id,revision:draft.revision,...body}});
   setMutation({key:requestKey,draft:response.draft});setDirectoryVersion(v=>v+1);
   setMessage(method==="DELETE"?"Catatan rekomendasi admin dihapus. Perhitungan otomatis siswa tetap menggunakan profil dan katalog terkini.":"Catatan admin tersimpan. Hasil siswa tetap dihitung otomatis dari data profil dan katalog.");
   return true;
  }catch(error){
   if(!expired(error))setMessage(error instanceof Error?error.message:"Perubahan belum dapat disimpan.");
   if(error&&typeof error==="object"&&"status" in error&&error.status===409){setMutation(undefined);setVersion(v=>v+1);return true;}
   return false;
  }finally{lock.current=false;setBusy(false);}
 }
 if(!allowed)return <B4Shell title="Rekomendasi Beasiswa" description="Lihat hasil rekomendasi beasiswa berdasarkan profil dan kriteria yang tersedia." dataNote=""><p role="alert">Akun ini belum memiliki izin membaca rekomendasi siswa.</p></B4Shell>;
 return <RecommendationAdminView filters={filters} onFilter={(field,value)=>{if(!busy){setFilters(v=>({...v,[field]:value}));setMessage("");}}} page={page} student={student}
  loading={!currentStudents||!!student&&!current} error={currentStudents?.error??current?.error} candidates={candidates} draft={draft} targetLevel={targetLevel}
  onTarget={level=>{if(student&&!busy){setTarget({studentId:student.id,level});setMessage("");}}}
  onEdit={(candidate,reason,timing)=>change(candidate,"PATCH",{reason,timing})}
  onVisibility={candidate=>change(candidate,"PATCH",{hidden:!candidate.hidden})} onRemove={candidate=>change(candidate,"DELETE")}
  busy={busy} canGenerate={!!student&&!!current?.data} message={message} onGenerate={()=>void save()}
  onReset={()=>{setFilters(emptyFilters);setVersion(v=>v+1);setMessage("");}}/>;
}
