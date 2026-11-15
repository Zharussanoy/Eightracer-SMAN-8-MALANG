"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {useUser} from "@/context/UserContext";
import {recommendationRequest,type StudentRecommendation} from "@/lib/b4-recommendation-data";

export function useStudentRecommendations(){
 const {currentUser,refreshSession}=useUser(),router=useRouter();
 const [result,setResult]=useState<{data?:StudentRecommendation[];error?:string;state?:string;generatedAt?:string|null;owner?:string}>();
 useEffect(()=>{
  if(currentUser.role!=="siswa")return;
  // Let read-only requests settle; browser request tracers can leave rejected abort promises.
  let disposed=false,running=false;
  async function refresh(){
   if(running||disposed)return;
   running=true;
   try{
    const value=await recommendationRequest<{data:StudentRecommendation[];state?:string;generatedAt?:string|null}>("/api/b4/rekomendasi?role=siswa");
    if(!disposed)setResult({...value,owner:String(currentUser.id)});
   }catch(error){
    if(disposed)return;
    if(error&&typeof error==="object"&&"status" in error&&error.status===401){void refreshSession();router.replace("/login");}
    setResult({owner:String(currentUser.id),error:error instanceof Error?error.message:"Rekomendasi belum dapat dimuat."});
   }finally{running=false;}
  }
  const visible=()=>{if(document.visibilityState==="visible")void refresh();};
  void refresh();window.addEventListener("focus",visible);document.addEventListener("visibilitychange",visible);
  const timer=window.setInterval(visible,20_000);
  return()=>{disposed=true;window.clearInterval(timer);window.removeEventListener("focus",visible);document.removeEventListener("visibilitychange",visible);};
 },[currentUser.id,currentUser.role,refreshSession,router]);
 return {result:result?.owner===String(currentUser.id)?result:undefined,allowed:currentUser.role==="siswa"};
}
