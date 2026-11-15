"use client";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import StudentScholarshipCatalogApi,{StudentScholarshipDetailApi} from "./StudentScholarshipCatalogApi";
import {useUser} from "@/context/UserContext";
import StudentRecommendationsApi,{StudentRecommendationDetailApi} from "./StudentRecommendationsApi";
import B4Shell from "./B4Shell";
function RecommendationSession(){
 const {authStatus,authMessage}=useUser();
 return <B4Shell student showDemoProfile={false} title="Rekomendasi Beasiswa" description="Mulai percakapan untuk menemukan pilihan beasiswamu." dataNote=""><div className="bc4-empty"><p role="status">{authStatus==="loading"?"Memeriksa sesi akun…":authStatus==="anonymous"?"Masuk dengan akun siswa untuk mulai bertanya dan menyimpan rekomendasi milikmu.":authMessage}</p>{authStatus==="anonymous"&&<Link className="bc4-button" href="/login">Masuk</Link>}</div></B4Shell>;
}
export default function StudentRecommendationsPage(){
 const {authStatus,currentUser}=useUser(),params=useSearchParams();
 if(authStatus!=="authenticated")return <RecommendationSession/>;
 return params.get("hasil")==="1"?<StudentRecommendationsApi key={currentUser.id}/>:<StudentScholarshipCatalogApi key={currentUser.id}/>;
}
export function StudentRecommendationDetail({id}:{id:string}){
 const {authStatus,currentUser}=useUser();
 if(authStatus!=="authenticated")return <RecommendationSession/>;
 const catalogId=/^catalog-([1-9]\d*)$/.exec(id);
 return catalogId&&Number.isSafeInteger(Number(catalogId[1]))?<StudentScholarshipDetailApi key={currentUser.id+":"+id} id={Number(catalogId[1])}/>:<StudentRecommendationDetailApi key={currentUser.id+":"+id} id={id}/>;
}
