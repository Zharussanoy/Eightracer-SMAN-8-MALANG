"use client";
import Link from "next/link";
import {useUser} from "@/context/UserContext";
import ScholarshipChatApi from "./ScholarshipChatApi";
import B4Shell from "./B4Shell";
export default function ScholarshipChatPage({recommendationId,scholarshipId,targetLevel,invalidContext}:{recommendationId?:string;scholarshipId?:number;targetLevel?:string;invalidContext?:boolean}){
 const {authStatus,currentUser,authMessage}=useUser();
 if(invalidContext)return <B4Shell student showDemoProfile={false} title="Informasi Beasiswa" description="Pelajari pilihan beasiswamu." dataNote=""><p role="alert">Pilihan beasiswa tidak valid.</p><Link href="/siswa/rekomendasi-beasiswa">Kembali ke Rekomendasi</Link></B4Shell>;
 if(authStatus==="authenticated")return <ScholarshipChatApi key={currentUser.id+":"+(scholarshipId??recommendationId??"")} recommendationId={scholarshipId?String(scholarshipId):recommendationId} targetLevel={targetLevel}/>;
 return <B4Shell student showDemoProfile={false} title="AI Rekomendasi Beasiswa" description="Mulai percakapan untuk menemukan pilihan beasiswamu." dataNote=""><div className="bc4-empty"><p role="status">{authStatus==="loading"?"Memeriksa sesi akun…":authStatus==="anonymous"?"Masuk dengan akun siswa untuk berbicara dengan Eightracer AI.":authMessage}</p>{authStatus==="anonymous"&&<Link className="bc4-button" href="/login">Masuk</Link>}</div></B4Shell>;
}
