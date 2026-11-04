"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {useUser} from "@/context/UserContext";
import {recommendationRequest,type StudentRecommendation} from "@/lib/b4-recommendation-data";

export function useStudentRecommendations(){
 const {currentUser,refreshSession}=useUser(),router=useRouter();
 const [result,setResult]=useState<{data?:StudentRecommendation[];error?:string}>();
 useEffect(()=>{
  if(currentUser.role!=="siswa")return;
  const abort=new AbortController();let running=false;
  async function refresh(){
   if(running||abort.signal.aborted)return;
   running=true;
   try{
    const value=await recommendationRequest<{data:StudentRecommendation[]}>("/api/b4/rekomendasi?role=siswa",{signal:abort.signal});
    if(!abort.signal.aborted)setResult({data:value.data});
   }catch(error){
    if(abort.signal.aborted)return;
    if(error&&typeof error==="object"&&"status" in error&&error.status===401){void refreshSession();router.replace("/login");}
    setResult({error:error instanceof Error?error.message:"Rekomendasi belum dapat dimuat."});
   }finally{running=false;}
  }
  const visible=()=>{if(document.visibilityState==="visible")void refresh();};
  void refresh();window.addEventListener("focus",visible);document.addEventListener("visibilitychange",visible);
  const timer=window.setInterval(visible,20_000);
  return()=>{abort.abort();window.clearInterval(timer);window.removeEventListener("focus",visible);document.removeEventListener("visibilitychange",visible);};
 },[currentUser.id,currentUser.role,refreshSession,router]);
 return {result,allowed:currentUser.role==="siswa"};
}
