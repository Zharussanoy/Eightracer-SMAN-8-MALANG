"use client";
import {useEffect,useState} from "react";
import {useUser} from "@/context/UserContext";
export function useStudentScholarshipCatalog<T>(path:string|null){
 const {currentUser,authStatus,refreshSession}=useUser();
 const [state,setState]=useState<{key:string;data?:T;error?:string}>(),[retry,setRetry]=useState(0);
 const key=String(currentUser.id)+":"+path+":"+retry;
 useEffect(()=>{
  if(!path||authStatus!=="authenticated")return;let disposed=false,running=false;
  async function load(){if(disposed||running)return;running=true;try{
   const response=await fetch(path!,{headers:{Accept:"application/json"},credentials:"same-origin",cache:"no-store"});
   const payload=await response.json().catch(()=>null);if(disposed)return;
   if(!response.ok){if(response.status===401)void refreshSession();throw Error(payload?.message??"Informasi beasiswa belum dapat dimuat.");}
   setState({key,data:payload as T});
  }catch(error){if(!disposed)setState({key,error:error instanceof Error?error.message:"Informasi beasiswa belum dapat dimuat."});}finally{running=false;}}
  const visible=()=>{if(document.visibilityState==="visible")void load();};void load();window.addEventListener("focus",visible);
  return()=>{disposed=true;window.removeEventListener("focus",visible);};
 },[path,key,authStatus,refreshSession]);
 const current=state?.key===key?state:undefined;
 return {data:current?.data,error:current?.error,retry:()=>setRetry(v=>v+1)};
}
