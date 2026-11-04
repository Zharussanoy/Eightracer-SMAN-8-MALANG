"use client";

import Link from "next/link";
import {GraduationCap,ShieldCheck,Sparkles,CheckCircle2,CircleHelp} from "lucide-react";
import {type StudentRecommendation} from "@/lib/b4-recommendation-data";
import {recommendationEligibility,recommendationCriterionLabel} from "@/lib/b4-recommendations";
import B4Shell,{Avatar} from "./B4Shell";
import {useStudentRecommendations} from "./useStudentRecommendations";

const known=(v:string|null)=>v??"Belum tercatat";
function Evaluation({item}:{item:StudentRecommendation}){
 return <div>{item.checklist.length?item.checklist.map((c,i)=><div key={i} className={"bc4-evaluation"+(c.status==="terpenuhi"?"":" bc4-pending")}>{c.status==="terpenuhi"?<CheckCircle2 size={30}/>:<CircleHelp size={30}/>}<span><strong>{recommendationCriterionLabel(c.criterion)}</strong>: {c.operator} {known(c.required)} · {c.status?.replaceAll("_"," ")??"Belum diketahui"}</span></div>):<p>Rincian kriteria belum tersedia.</p>}</div>;
}
export default function StudentRecommendationsApi(){
 const {result,allowed}=useStudentRecommendations(),items=result?.data??[];
 return <B4Shell student showDemoProfile={false} title="Rekomendasi Beasiswa" description="Temukan peluang beasiswa yang sesuai dengan profil dan perjalanan akademikmu." dataNote="">
  <div className="bc4-note"><ShieldCheck size={35}/><div><strong>Rekomendasi Telah Ditinjau Sekolah</strong><p>Hasil yang ditampilkan telah ditinjau dan dipublikasikan Admin/BK untuk akunmu.</p></div></div>
  <h2 className="bc4-listTitle">Rekomendasi Beasiswa Untukmu</h2>
  {!allowed?<p role="alert">Halaman ini tersedia untuk akun siswa.</p>:result?.error?<div className="bc4-empty" role="alert">{result.error}</div>:!result?<p role="status">Memuat rekomendasi sekolah…</p>:items.length?<div className="bc4-grid3 bc4-resultCards">{items.map((item,index)=>
   <article className="bc4-panel bc4-scholarCard" key={item.key}><h3><GraduationCap size={29}/>{item.name}</h3>
    <dl className="bc4-metrics"><div><dt>Jenjang</dt><dd>{known(item.level)}</dd></div><div><dt>Pendanaan</dt><dd>Belum tercatat</dd></div><div><dt>Periode</dt><dd>{known(item.period)}</dd></div></dl>
    <p className="bc4-reason">{item.reason??recommendationEligibility(item)}</p><Link className={"bc4-button "+(index===0?"bc4-primary":"")} href={"/siswa/rekomendasi-beasiswa/"+item.key}>Lihat Detail Rekomendasi</Link>
   </article>)}</div>:<div className="bc4-empty">Belum ada rekomendasi yang dipublikasikan untuk akunmu. Hasil akan muncul setelah data lengkap dan ditinjau Admin/BK.</div>}
  <div className="bc4-note" style={{marginTop:35}}><Sparkles size={36}/><div><strong>Masih Ingin Mencari Informasi Beasiswa?</strong><p>Pelajari informasi beasiswa berdasarkan katalog dan data milikmu.</p></div><Link href="/siswa/rekomendasi-beasiswa/chat" className="bc4-button bc4-primary">Tanya Eightracer AI</Link></div>
 </B4Shell>;
}
export function StudentRecommendationDetailApi({id}:{id:string}){
 const {result,allowed}=useStudentRecommendations(),item=result?.data?.find(v=>v.key===id);
 return <B4Shell student showDemoProfile={false} title="Detail Rekomendasi Beasiswa" description="Pelajari informasi dan alasan kecocokan beasiswa yang direkomendasikan untukmu." parent={{label:"Rekomendasi Beasiswa",href:"/siswa/rekomendasi-beasiswa"}} dataNote="">
  {!allowed?<p role="alert">Halaman ini tersedia untuk akun siswa.</p>:result?.error?<div className="bc4-empty" role="alert">{result.error}</div>:!result?<p role="status">Memuat rekomendasi sekolah…</p>:!item?<div className="bc4-empty">Rekomendasi tidak tersedia untuk akun ini atau belum dipublikasikan. <Link href="/siswa/rekomendasi-beasiswa">Kembali ke rekomendasi</Link></div>:<>
   <section className="bc4-panel bc4-recommendationHeader"><GraduationCap size={45}/><div style={{flex:1}}><h3>{item.name}</h3><p>{known(item.provider)} · {known(item.level)}</p></div><div className="bc4-score"><span>Skor Kecocokan Kriteria</span><strong>{item.complete&&item.score!==null?item.score+"/100":"Belum dapat dinilai"}</strong></div></section>
   <div className="bc4-note" style={{marginTop:28}}><div><strong>Alasan Kecocokan</strong><p>{item.reason??recommendationEligibility(item)}</p></div></div>
   <div className="bc4-detailRecGrid"><div><section className="bc4-panel"><h2>Evaluasi Kriteria Siswa</h2><Evaluation item={item}/></section>
    <section className="bc4-panel"><h2>Referensi dari Jejak Alumni</h2><div className="bc4-yellowCard"><div className="bc4-profile" style={{padding:0,border:0}}><Avatar name="-" example={false}/><div><h2>-</h2><p>-</p><span className="bc4-tag">-</span><span className="bc4-tag">-</span></div></div><p style={{margin:"15px 0"}}>Pelajari catatan alumni yang telah dipublikasikan sekolah melalui Jejak Alumni. Hasil pemeriksaan kriteria ini bukan jaminan lolos seleksi.</p><Link className="bc4-button" href="/siswa/jejak-alumni">Lihat Jejak Alumni</Link></div></section>
   </div><div><aside className="bc4-panel"><h2>Informasi Beasiswa</h2><dl className="bc4-facts">{[["Penyelenggara",known(item.provider)],["Jenjang",known(item.level)],["Pendanaan","Belum tercatat"],["Periode",known(item.period)],["Waktu yang Disarankan",item.timing??item.opens??"-"]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></aside>
    <aside className="bc4-aiCta"><h2>Masih ada yang ingin kamu ketahui?</h2><p>Tanyakan informasi beasiswa ini berdasarkan katalog sekolah.</p><Link className="bc4-button" href={"/siswa/rekomendasi-beasiswa/chat?beasiswa="+item.scholarshipId}>Tanya tentang beasiswa ini</Link></aside>
   </div></div>
  </>}
 </B4Shell>;
}
