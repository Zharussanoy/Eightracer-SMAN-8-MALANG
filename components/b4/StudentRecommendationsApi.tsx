"use client";
import {SampleValue, sampleAlumniReference} from "./SampleData";

import Link from "next/link";
import {GraduationCap,ShieldCheck,Sparkles,CheckCircle2,CircleHelp} from "lucide-react";
import {type StudentRecommendation} from "@/lib/b4-recommendation-data";
import {recommendationEligibility,recommendationCriterionLabel} from "@/lib/b4-recommendations";
import B4Shell,{Avatar} from "./B4Shell";
import {useStudentRecommendations} from "./useStudentRecommendations";
import { displayTitle } from "@/lib/display-copy";

const known=(v:string|null)=>v??"Belum tercatat";
function Evaluation({item}:{item:StudentRecommendation}){
 return <div>{item.checklist.length?item.checklist.map((c,i)=><div key={i} className={"bc4-evaluation"+(c.status==="terpenuhi"?"":" bc4-pending")}>{c.status==="terpenuhi"?<CheckCircle2 size={30}/>:<CircleHelp size={30}/>}<span><strong>{recommendationCriterionLabel(c.criterion)}</strong>: {c.operator} {known(c.required)} · {c.status?.replaceAll("_"," ")??"Belum diketahui"}</span></div>):<p>Rincian kriteria belum tersedia.</p>}</div>;
}
export default function StudentRecommendationsApi(){
 const {result,allowed}=useStudentRecommendations(),items=result?.data??[],preview=items.some(item=>item.preview===true);
 return <B4Shell student showDemoProfile={false} title="Rekomendasi Beasiswa" description="Temukan peluang beasiswa yang sesuai dengan profil dan perjalanan akademikmu." dataNote="">
  <div className="bc4-note"><ShieldCheck size={35}/><div><strong>{preview?"Pratinjau Katalog Beasiswa":"Rekomendasi Berdasarkan Profilmu"}</strong><p>{preview?"Data dari katalog sekolah; belum menjadi rekomendasi personal atau keputusan kelayakan.":"Hasil dihitung otomatis dari profil, kriteria beasiswa, dan ranking kecocokan. Penjelasan AI membantu memahami hasil; keputusan penerimaan tetap mengikuti penyelenggara."}</p></div></div>
  <h2 className="bc4-listTitle">{preview?"Informasi Beasiswa Sekolah":"Rekomendasi Beasiswa Untukmu"}</h2>
  {!allowed?<p role="alert">Halaman ini tersedia untuk akun siswa.</p>:result?.error?<div className="bc4-empty" role="alert">{result.error}</div>:!result?<p role="status">Memuat rekomendasi sekolah…</p>:items.length?<div className="bc4-grid3 bc4-resultCards">{items.map((item,index)=>
   <article className="bc4-panel bc4-scholarCard" key={item.key}><h3><GraduationCap size={29}/>{displayTitle(item.name)}</h3>
    <dl className="bc4-metrics"><div><dt>Jenjang</dt><dd>{displayTitle(known(item.level))}</dd></div><div><dt>Pendanaan</dt><dd><SampleValue value={null} label="Pendanaan"/></dd></div><div><dt>Periode</dt><dd><SampleValue value={item.period} label="Periode"/></dd></div></dl>
    <p className="bc4-reason">{item.reason??recommendationEligibility(item)}</p><Link className={"bc4-button "+(index===0?"bc4-primary":"")} href={"/siswa/rekomendasi-beasiswa/"+item.key}>{item.preview?"Lihat Detail Beasiswa":"Lihat Detail Rekomendasi"}</Link>
   </article>)}</div>:<div className="bc4-empty">Belum ada program beasiswa yang sesuai dengan jenjangmu. Lengkapi profil dan periksa kembali katalog beasiswa.</div>}
  <div className="bc4-note" style={{marginTop:35}}><Sparkles size={36}/><div><strong>Masih Ingin Mencari Informasi Beasiswa?</strong><p>Pelajari informasi beasiswa berdasarkan katalog dan data milikmu.</p></div><Link href="/siswa/rekomendasi-beasiswa/chat" className="bc4-button bc4-primary">Tanya Eightracer AI</Link></div>
 </B4Shell>;
}
export function StudentRecommendationDetailApi({id}:{id:string}){
 const {result,allowed}=useStudentRecommendations(),item=result?.data?.find(v=>v.key===id);
 const reference=item?sampleAlumniReference(item.name):null;
 return <B4Shell student showDemoProfile={false} title="Detail Rekomendasi Beasiswa" description="Pelajari informasi dan alasan kecocokan beasiswa yang direkomendasikan untukmu." parent={{label:"Rekomendasi Beasiswa",href:"/siswa/rekomendasi-beasiswa"}} dataNote="">
  {!allowed?<p role="alert">Halaman ini tersedia untuk akun siswa.</p>:result?.error?<div className="bc4-empty" role="alert">{result.error}</div>:!result?<p role="status">Memuat rekomendasi sekolah…</p>:!item?<div className="bc4-empty">Rekomendasi tidak tersedia untuk akun ini atau sumber datanya telah berubah. <Link href="/siswa/rekomendasi-beasiswa">Kembali ke rekomendasi</Link></div>:<>
   <section className="bc4-panel bc4-recommendationHeader"><GraduationCap size={45}/><div style={{flex:1}}><h3>{displayTitle(item.name)}</h3><p>{displayTitle(known(item.provider))} · {displayTitle(known(item.level))}</p></div><div className="bc4-score"><span>Skor Kecocokan Kriteria</span><strong>{item.complete&&item.score!==null?item.score+"/100":"Belum dapat dinilai"}</strong></div></section>
   <div className="bc4-note" style={{marginTop:28}}><div><strong>{item.preview?"Informasi Katalog":"Alasan Kecocokan"}</strong><p>{item.reason??recommendationEligibility(item)}</p></div></div>
   <div className="bc4-detailRecGrid"><div><section className="bc4-panel"><h2>Evaluasi Kriteria Siswa</h2><Evaluation item={item}/></section>
    <section className="bc4-panel"><h2>Referensi dari Jejak Alumni</h2><div className="bc4-yellowCard bc4-referenceAlumni" data-source={reference?"local-presentation":undefined}>{reference?<div className="bc4-profile" style={{padding:0,border:0}}><Avatar name={reference.name} example={false}/><div><h2>{displayTitle(reference.name)}</h2><p>{displayTitle(reference.university)} · {displayTitle(reference.program)}</p><p>Jalur {displayTitle(reference.admission)} · IPK {reference.gpa}</p><span className="bc4-tag">Angkatan {reference.cohort}</span><span className="bc4-tag">{displayTitle(reference.scholarship)}</span></div></div>:<p>Belum ada referensi alumni untuk beasiswa ini.</p>}<p style={{margin:"15px 0"}}>Pelajari catatan alumni yang telah dipublikasikan sekolah melalui Jejak Alumni. Hasil pemeriksaan kriteria ini bukan jaminan lolos seleksi.</p><Link className="bc4-button" href={reference?.detailHref??"/siswa/jejak-alumni"}>Lihat Jejak Alumni</Link></div></section>
   </div><div><aside className="bc4-panel"><h2>Informasi Beasiswa</h2><dl className="bc4-facts">{[["Penyelenggara",known(item.provider)],["Jenjang",known(item.level)],["Pendanaan","Belum tercatat"],["Periode",known(item.period)],["Waktu yang Disarankan",item.timing??item.opens??"-"]].map(([label,value])=><div key={label}><dt>{displayTitle(label)}</dt><dd><SampleValue value={value} label={label}/></dd></div>)}</dl></aside>
    <aside className="bc4-aiCta"><h2>Masih Ada yang Ingin Kamu Ketahui?</h2><p>Tanyakan informasi beasiswa ini berdasarkan katalog sekolah.</p><Link className="bc4-button" href={"/siswa/rekomendasi-beasiswa/chat?beasiswa="+item.scholarshipId}>Tanya tentang beasiswa ini</Link></aside>
   </div></div>
  </>}
 </B4Shell>;
}
