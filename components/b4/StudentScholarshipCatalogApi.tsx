"use client";
import {useState} from "react";
import Link from "next/link";
import {Sparkles} from "lucide-react";
import type {GeneralScholarship,GeneralScholarshipPage} from "@/lib/b4-general-scholarships";
import {recommendationPeriod} from "@/lib/b4-recommendation-copy";
import {displayTitle} from "@/lib/display-copy";
import FigmaIcon from "./FigmaIcon";
import B4Shell,{Avatar} from "./B4Shell";
import NumberPagination from "./NumberPagination";
import {useStudentScholarshipCatalog} from "./useStudentScholarshipCatalog";
import {useStudentRecommendations} from "./useStudentRecommendations";
const known=(value:string|null|undefined)=>value??"-";
const duration=(p:GeneralScholarship)=>p.duration?new Intl.NumberFormat("id-ID").format(p.duration)+" "+known(p.durationUnit):"-";
function Loading({error,retry}:{error?:string;retry:()=>void}){return error?<div className="bc4-empty"><p role="alert">{error}</p><button className="bc4-button" onClick={retry}>Coba Lagi</button></div>:<p role="status">Memuat informasi beasiswa…</p>;}
export default function StudentScholarshipCatalogApi(){
 const [page,setPage]=useState(1),catalog=useStudentScholarshipCatalog<GeneralScholarshipPage>("/api/b4/student-scholarships?page="+page);
 const {result}=useStudentRecommendations();
 return <B4Shell student showDemoProfile={false} title="Rekomendasi Beasiswa" description="Kenali pilihan beasiswa dan tanyakan peluang yang sesuai untukmu kepada Eightracer AI." dataNote="">
  <h2 className="bc4-listTitle">Pilihan Beasiswa</h2>
  {!catalog.data?<Loading error={catalog.error} retry={catalog.retry}/>:catalog.data.data.length?<>
   <div className="bc4-grid3 bc4-resultCards bc4-recommendationCards bc4-catalogCards">{catalog.data.data.map(program=><article className="bc4-panel bc4-scholarCard" key={program.id}>
    <h3><FigmaIcon name="graduate" size={25}/>{displayTitle(program.name)}</h3>
    <dl className="bc4-metrics bc4-cardFacts"><div><dt>Jenjang</dt><dd>{displayTitle(program.level)}</dd></div><div><dt>Durasi</dt><dd>{duration(program)}</dd></div><div className="bc4-cardPeriod"><dt>Periode Pendaftaran</dt><dd>{recommendationPeriod(program)}</dd></div></dl>
    <p className="bc4-reason">{program.description?program.description.length>220?program.description.slice(0,217)+"…":program.description:"Informasi program dan persyaratan tersedia pada detail beasiswa."}</p>
    <Link className="bc4-button bc4-cardDetail" href={"/siswa/rekomendasi-beasiswa/catalog-"+program.id}>Lihat Detail Beasiswa</Link>
   </article>)}</div>
   {catalog.data.lastPage>1&&<NumberPagination current={catalog.data.currentPage} last={catalog.data.lastPage} onChange={setPage} label="Halaman katalog beasiswa"/>}
  </>:<div className="bc4-empty">Belum ada informasi beasiswa yang tersedia.</div>}
  <div className="bc4-note" style={{marginTop:24}}><Sparkles size={32}/><div><strong>Temukan Beasiswa yang Sesuai Untukmu</strong><p>Tanyakan informasi beasiswa atau minta rekomendasi berdasarkan profilmu.</p></div><Link className="bc4-button bc4-primary" href="/siswa/rekomendasi-beasiswa/chat">Tanya Eightracer AI</Link>{result?.state==="ready"&&!!result.data?.length&&<Link className="bc4-button" href="/siswa/rekomendasi-beasiswa?hasil=1">Lihat Hasil Rekomendasi</Link>}</div>
 </B4Shell>;
}
export function StudentScholarshipDetailApi({id}:{id:number}){
 const catalog=useStudentScholarshipCatalog<{data:GeneralScholarship}>("/api/b4/student-scholarships/"+id),program=catalog.data?.data;
 return <B4Shell student showDemoProfile={false} title="Detail Beasiswa" description="Pelajari informasi program, persyaratan, dan penerima beasiswa dari SMA 8." parent={{label:"Pilihan Beasiswa",href:"/siswa/rekomendasi-beasiswa"}} dataNote="">
  {!program?<Loading error={catalog.error} retry={catalog.retry}/>:<>
   <section className="bc4-panel bc4-recommendationHeader"><FigmaIcon name="graduate" size={40}/><div><h2>{displayTitle(program.name)}</h2><p>{displayTitle(known(program.provider))} · {displayTitle(program.level)}</p></div></section>
   <div className="bc4-detailRecGrid bc4-generalDetail"><div>
    <section className="bc4-panel"><h2>Tentang Beasiswa</h2><p>{known(program.description)}</p><h3>Persyaratan Umum</h3>{program.criteria?.length?<ul>{program.criteria.map((c,index)=><li key={index}><strong>{c.name}</strong>{c.required?": "+c.operator+" "+c.required:""}</li>)}</ul>:<p>Persyaratan mengikuti ketentuan resmi penyelenggara.</p>}</section>
    <section className="bc4-panel"><h2>Penerima dari SMA 8</h2>{program.recipients?.data.length?<div className="bc4-recipientList">{program.recipients.data.map(alumni=><article className="bc4-yellowCard" key={alumni.admissionId}><div className="bc4-profile" style={{padding:0,border:0}}><Avatar name={alumni.name} small example={false}/><div><h3>{displayTitle(alumni.name)}</h3><p>{displayTitle(known(alumni.university))} · {displayTitle(known(alumni.program))}</p>{alumni.cohort&&<p>Angkatan {alumni.cohort}</p>}</div></div><Link className="bc4-button" href={"/siswa/jejak-alumni/"+alumni.admissionId}>Lihat Jejak Alumni</Link></article>)}{program.recipients.total>program.recipients.data.length&&<p>Menampilkan {program.recipients.data.length} dari {program.recipients.total} penerima yang tersedia.</p>}</div>:<p>Data penerima belum tersedia untuk ditampilkan.</p>}</section>
   </div><div><aside className="bc4-panel"><h2>Informasi Beasiswa</h2><dl className="bc4-facts">{[["Penyelenggara",known(program.provider)],["Jenjang",program.level],["Durasi",duration(program)],["Periode Pendaftaran",recommendationPeriod(program)]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{displayTitle(value)}</dd></div>)}</dl>{program.registrationUrl&&<a className="bc4-button" href={program.registrationUrl} target="_blank" rel="noopener noreferrer">Situs Resmi Beasiswa</a>}</aside>
    <aside className="bc4-aiCta"><h2>Ingin Tahu Lebih Lanjut?</h2><p>Tanyakan persyaratan, pendaftaran, atau kecocokanmu dengan beasiswa ini.</p><Link className="bc4-button" href={"/siswa/rekomendasi-beasiswa/chat?beasiswa="+program.id}>Tanya tentang Beasiswa Ini</Link></aside>
   </div></div>
  </>}
 </B4Shell>;
}
