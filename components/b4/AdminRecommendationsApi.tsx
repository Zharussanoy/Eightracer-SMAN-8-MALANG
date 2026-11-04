"use client";

import {useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {useUser} from "@/context/UserContext";
import B4Shell from "./B4Shell";
import RecommendationAdminView,{type RecommendationFilters} from "./RecommendationAdminView";
import {recommendationRequest,type RecommendationDraft} from "@/lib/b4-recommendation-data";
import type {RecommendationPreview} from "@/lib/b4-recommendations";
import type {RecommendationStudentPage} from "@/lib/b4-students";

const emptyFilters={query:"",classroom:"",cohort:"",publication:""};
export default function AdminRecommendationsApi(){
 const {currentUser,refreshSession}=useUser(),router=useRouter();
 const [filters,setFilters]=useState<RecommendationFilters>(emptyFilters);
 const query=new URLSearchParams({page:"1"});
 if(filters.query.trim())query.set("search",filters.query.trim());
 if(filters.classroom)query.set("kelas_id",filters.classroom);
 if(filters.cohort)query.set("angkatan",filters.cohort);
 if(filters.publication)query.set("publication",filters.publication);
 const queryKey=query.toString(),allowed=currentUser.schoolStaff===true;
 const [students,setStudents]=useState<{key:string;data?:RecommendationStudentPage;error?:string}>();
 const currentStudents=students?.key===queryKey?students:undefined;
 const page=currentStudents?.data,student=page?.data[0];
 const [target,setTarget]=useState<{studentId:number;level:string}>();
 const targetLevel=target?.studentId===student?.id?target?.level??"SMA":student?.cohort?"Kuliah":"SMA";
 const [version,setVersion]=useState(0),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const lock=useRef(false),requestKey=student?student.id+":"+targetLevel+":"+version:"";
 const [result,setResult]=useState<{key:string;data?:RecommendationPreview;draft?:RecommendationDraft|null;error?:string}>();
 const [mutation,setMutation]=useState<{key:string;draft:RecommendationDraft}>();
 const current=result?.key===requestKey?result:undefined;
 const draft=mutation?.key===requestKey?mutation.draft:current?.draft;
 const candidates=draft?.candidates??current?.data?.candidates.map(c=>({...c,reason:null,preparations:[] as string[]}))??[];
 const canPublish=draft?.status==="pending"&&candidates.length>0&&candidates.every(c=>c.complete===true)&&candidates.some(c=>c.meets===true);
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
 },[allowed,queryKey,refreshSession,router]);
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
 async function save(action:"generate"|"review"){
  if(!student||lock.current||action==="review"&&!canPublish)return;
  lock.current=true;setBusy(true);setMessage("");
  try{
   const response=await recommendationRequest<{draft:RecommendationDraft}>("/api/b4/recommendations/"+student.id+"/"+action,{method:"POST",body:action==="generate"?{target_jenjang:targetLevel}:{recommendation_id:draft!.id,status_review:"disetujui"}});
   setMutation({key:requestKey,draft:response.draft});setMessage(action==="generate"?"Draft tersimpan. Periksa seluruh kriteria sebelum publikasi.":"Rekomendasi telah dipublikasikan untuk akun siswa ini.");
  }catch(error){if(!expired(error))setMessage(error instanceof Error?error.message:"Perubahan belum dapat disimpan.");}
  finally{lock.current=false;setBusy(false);}
 }
 if(!allowed)return <B4Shell title="Rekomendasi Beasiswa" description="Tinjau rekomendasi beasiswa dan publikasikan hasil yang sesuai kepada siswa." dataNote=""><p role="alert">Akun ini belum memiliki izin membaca rekomendasi siswa.</p></B4Shell>;
 return <RecommendationAdminView filters={filters} onFilter={(field,value)=>{if(!busy){setFilters(v=>({...v,[field]:value}));setMessage("");}}} page={page} student={student}
  loading={!currentStudents||!!student&&!current} error={currentStudents?.error??current?.error} candidates={candidates} draft={draft} targetLevel={targetLevel}
  onTarget={level=>{if(student&&!busy){setTarget({studentId:student.id,level});setMessage("");}}}
  busy={busy} canGenerate={!!student&&!!current?.data} canPublish={canPublish} message={message} onGenerate={()=>void save("generate")} onPublish={()=>void save("review")}
  onReset={()=>{setFilters(emptyFilters);setVersion(v=>v+1);setMessage("");}}/>;
}
