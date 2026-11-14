"use client";
import Link from "next/link";
import {useUser} from "@/context/UserContext";
import StudentRecommendationsApi,{StudentRecommendationDetailApi} from "./StudentRecommendationsApi";
import B4Shell from "./B4Shell";
function RecommendationSession(){
 const {authStatus,authMessage}=useUser();
 return <B4Shell student showDemoProfile={false} title="Rekomendasi Beasiswa" description="Mulai percakapan untuk menemukan pilihan beasiswamu." dataNote=""><div className="bc4-empty"><p role="status">{authStatus==="loading"?"Memeriksa sesi akun…":authStatus==="anonymous"?"Masuk dengan akun siswa untuk mulai bertanya dan menyimpan rekomendasi milikmu.":authMessage}</p>{authStatus==="anonymous"&&<Link className="bc4-button" href="/login">Masuk</Link>}</div></B4Shell>;
}
export default function StudentRecommendationsPage(){
 const {authStatus,currentUser}=useUser();
 return authStatus==="authenticated"?<StudentRecommendationsApi key={currentUser.id}/>:<RecommendationSession/>;
}
export function StudentRecommendationDetail({id}:{id:string}){
 const {authStatus,currentUser}=useUser();
 return authStatus==="authenticated"?<StudentRecommendationDetailApi key={currentUser.id+":"+id} id={id}/>:<RecommendationSession/>;
}
