"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {GraduationCap,Search,Sparkles} from "lucide-react";
import {useUser} from "@/context/UserContext";
import {recommendationRequest} from "@/lib/b4-recommendation-data";
import {recommendationCriterionLabel,recommendationEligibility} from "@/lib/b4-recommendations";
import {sortProgramStudents,type ProgramBatch,type ProgramStudent,type ProgramNote} from "@/lib/b4-program-analysis";
import type {GeneralScholarship,GeneralScholarshipPage} from "@/lib/b4-general-scholarships";
import {recommendationPeriod} from "@/lib/b4-recommendation-copy";
import {displayTitle} from "@/lib/display-copy";
import B4Shell from "./B4Shell";
import NumberPagination from "./NumberPagination";

export default function AdminProgramRecommendationsApi(){
 const {currentUser,refreshSession}=useUser();
 const allowed=currentUser.schoolStaff===true;
 const [page,setPage]=useState(1),[catalog,setCatalog]=useState<GeneralScholarshipPage>(),[error,setError]=useState("");
 const [program,setProgram]=useState<GeneralScholarship>(),[rows,setRows]=useState<ProgramStudent[]>([]),[complete,setComplete]=useState(false);
 const [progress,setProgress]=useState({count:0,total:0}),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const [selectedId,setSelectedId]=useState<number>(),[resultPage,setResultPage]=useState(1),[query,setQuery]=useState(""),[status,setStatus]=useState("");
 const [reason,setReason]=useState(""),[timing,setTiming]=useState("");
 const [explanation,setExplanation]=useState<{id:number;reason:string;preparations:string[];llmUsed:boolean}>();
 const generation=useRef(0),lock=useRef(false);
 useEffect(()=>()=>{generation.current++;},[]);
 useEffect(()=>{
  if(!allowed)return;let active=true;
  recommendationRequest<GeneralScholarshipPage>("/api/b4/recommendation-programs?page="+page).then(v=>{if(active){setCatalog(v);setError("");}}).catch(e=>{if(active)setError(e instanceof Error?e.message:"Katalog belum dapat dimuat.");});
  return()=>{active=false;};
 },[allowed,page]);
 const selected=rows.find(s=>s.id===selectedId);
 function failed(e:unknown){if(e&&typeof e==="object"&&"status" in e&&e.status===401)void refreshSession();return e instanceof Error?e.message:"Proses belum berhasil. Coba lagi.";}
 async function analyse(){
  if(!program||lock.current)return;lock.current=true;setBusy(true);setMessage("");setProgress({count:0,total:0});setRows([]);setComplete(false);setSelectedId(undefined);setExplanation(undefined);
  const token=++generation.current;let after=0;const accumulated:ProgramStudent[]=[];const seen=new Set<number>();
  try{for(let batch=0;batch<2000;batch++){
   const result=await recommendationRequest<ProgramBatch>(`/api/b4/recommendation-programs/${program.id}/analyse`,{method:"POST",body:{after_id:after}});
   if(token!==generation.current)return;
   for(const student of result.data){if(seen.has(student.id))throw Error("Daftar siswa berubah. Jalankan analisis kembali.");seen.add(student.id);accumulated.push(student);}
   setProgress({count:accumulated.length,total:result.total});
   if(result.nextCursor===null){setRows(sortProgramStudents(accumulated));setResultPage(1);setComplete(true);setMessage("Analisis selesai untuk "+accumulated.length+" siswa aktif.");break;}
   if(result.nextCursor<=after)throw Error("Urutan analisis tidak valid.");after=result.nextCursor;
   // Respect the server's batch limit; do not retry failed writes automatically.
   await new Promise(resolve=>setTimeout(resolve,2100));
  }}catch(e){if(token===generation.current)setMessage(failed(e));}
  finally{lock.current=false;if(token===generation.current)setBusy(false);}
 }
 async function explain(){
  if(!program||!selected||lock.current)return;lock.current=true;setBusy(true);setMessage("");const token=generation.current;
  try{const result=await recommendationRequest<{data:{reason:string;preparations:string[];llmUsed:boolean}}>(`/api/b4/recommendation-programs/${program.id}/students/${selected.id}/explain`,{method:"POST",body:{}});if(token===generation.current)setExplanation({id:selected.id,...result.data});}
  catch(e){setMessage(failed(e));}finally{lock.current=false;setBusy(false);}
 }
 async function saveNote(){
  if(!program||!selected||lock.current)return;lock.current=true;setBusy(true);setMessage("");
  try{const result=await recommendationRequest<{data:ProgramNote}>(`/api/b4/recommendation-programs/${program.id}/students/${selected.id}/note`,{method:"POST",body:{fingerprint:selected.fingerprint,revision:selected.note?.revision??0,reason,timing}});
   setRows(v=>v.map(s=>s.id===selected.id?{...s,note:result.data}:s));setMessage("Catatan admin berhasil disimpan.");
  }catch(e){setMessage(failed(e));}finally{lock.current=false;setBusy(false);}
 }
 const visible=rows.filter(s=>(!query||s.name.toLocaleLowerCase("id").includes(query.toLocaleLowerCase("id")))&&(!status||status==="met"&&s.candidate.complete&&s.candidate.meets||status==="missing"&&!s.candidate.complete||status==="unmet"&&s.candidate.complete&&!s.candidate.meets));
 return <B4Shell title="Rekomendasi Beasiswa" description="Pilih beasiswa untuk menganalisis kecocokan siswa aktif dan menambahkan saran bila diperlukan." dataNote="">
 {!allowed?<p role="alert">Akun ini belum memiliki izin mengelola rekomendasi.</p>:!program?<>
  <h2 className="bc4-listTitle">Pilihan Beasiswa</h2>
  {error?<p role="alert">{error}</p>:!catalog||catalog.currentPage!==page?<p role="status">Memuat beasiswa…</p>:<>
   <div className="bc4-grid3 bc4-resultCards bc4-recommendationCards bc4-catalogCards">{catalog.data.map(p=><article className="bc4-panel bc4-scholarCard" key={p.id}>
    <h3><GraduationCap size={25}/>{displayTitle(p.name)}</h3><p>{displayTitle(p.provider??"-")}</p>
    <dl className="bc4-metrics bc4-cardFacts"><div><dt>Jenjang</dt><dd>{p.level}</dd></div><div className="bc4-cardPeriod"><dt>Periode Pendaftaran</dt><dd>{recommendationPeriod(p)}</dd></div></dl>
    <p className="bc4-reason">{p.description?p.description.slice(0,220):"Pelajari persyaratan program dan analisis kecocokan siswa."}</p>
    <button className="bc4-button bc4-cardDetail" onClick={()=>{setProgram(p);setRows([]);setComplete(false);setSelectedId(undefined);setMessage("");setQuery("");setStatus("");}}>Lihat Analisis Siswa</button>
   </article>)}</div>
   {!catalog.data.length&&<p className="bc4-empty">Belum ada beasiswa aktif. Tambahkan informasi melalui Basis Data Beasiswa.</p>}
   {catalog.lastPage>1&&<NumberPagination current={page} last={catalog.lastPage} onChange={setPage} label="Halaman beasiswa"/>}
  </>}
 </>:<>
  <div className="bc4-actions"><button className="bc4-button" disabled={busy} onClick={()=>{generation.current++;setProgram(undefined);}}>Kembali ke Beasiswa</button><Link className="bc4-button" href="/admin/basis-data-beasiswa">Kelola Informasi Beasiswa</Link></div>
  <section className="bc4-panel bc4-recommendationHeader"><GraduationCap size={36}/><div><h3>{displayTitle(program.name)}</h3><p>{displayTitle(program.provider??"-")} · {program.level}</p><p>{recommendationPeriod(program)}</p></div></section>
  <div className="bc4-actions"><button className="bc4-button bc4-primary" disabled={busy} onClick={()=>void analyse()}>{complete?"Perbarui Analisis":"Analisis Siswa"}</button></div>
  {busy&&!selected&&<p role="status">Menganalisis {progress.count} dari {progress.total||"…"} siswa aktif…</p>}
  {!complete&&!busy&&<div className="bc4-empty">Mulai analisis untuk melihat siswa yang sesuai dengan kriteria program ini.</div>}
  {complete&&<>
   <div className="bc4-filterRow bc4-programFilters"><label className="bc4-field bc4-programSearch"><Search size={20} aria-hidden="true"/><input aria-label="Cari nama siswa dalam hasil analisis" placeholder="Cari nama siswa" value={query} onChange={e=>{setQuery(e.target.value);setResultPage(1);}}/></label><label className="bc4-field"><select aria-label="Status kecocokan" value={status} onChange={e=>{setStatus(e.target.value);setResultPage(1);}}><option value="">Semua Hasil</option><option value="met">Memenuhi Kriteria</option><option value="missing">Data Belum Lengkap</option><option value="unmet">Belum Memenuhi</option></select></label></div>
   <div className="b4-tableScroll"><table className="bc4-progressTable"><thead><tr><th>Nama Siswa</th><th>Kelas</th><th>Kecocokan Kriteria</th><th>Status</th><th>Detail</th></tr></thead><tbody>{visible.slice((resultPage-1)*10,resultPage*10).map(s=><tr key={s.id}><td>{displayTitle(s.name)}</td><td>{displayTitle(s.classroom??"-")}</td><td>{s.candidate.score===null||!s.candidate.complete?"-":new Intl.NumberFormat("id-ID",{maximumFractionDigits:2}).format(s.candidate.score)+"/100"}</td><td>{recommendationEligibility(s.candidate)}</td><td><button className="bc4-button" disabled={busy} onClick={()=>{setSelectedId(s.id);setReason(s.note?.reason??"");setTiming(s.note?.timing??"");setMessage("");}}>Lihat Detail</button></td></tr>)}</tbody></table></div>
   {visible.length>10&&<NumberPagination current={resultPage} last={Math.ceil(visible.length/10)} onChange={setResultPage} label="Halaman hasil analisis"/>}
   {!visible.length&&<p className="bc4-empty">Tidak ada siswa yang sesuai dengan filter ini.</p>}
   <p>Hasil diurutkan berdasarkan pemenuhan kriteria, skor, lalu kemiripan minat jika tersedia. Skor bukan peluang diterima.</p>
  </>}
  {selected&&<section className="bc4-panel bc4-programDetail"><h2>{displayTitle(selected.name)}</h2><p>{displayTitle(selected.classroom??"-")}</p><h3>Evaluasi Kriteria</h3>
   {selected.candidate.checklist.map((c,i)=><div className={"bc4-evaluation"+(c.status==="terpenuhi"?"":" bc4-pending")} key={i}><span><strong>{recommendationCriterionLabel(c.criterion)}</strong>: {c.operator} {c.required??"-"} — {c.status==="terpenuhi"?"Terpenuhi":c.status==="belum_terpenuhi"?"Belum terpenuhi":"Belum diketahui"}</span></div>)}
   <h3>Alasan Kecocokan</h3><p>{explanation?.id===selected.id?explanation.reason:selected.reason}</p>
   {explanation?.id===selected.id&&<><ul>{explanation.preparations.map((p,i)=><li key={i}>{p}</li>)}</ul><p>{explanation.llmUsed?"Penjelasan dibantu AI berdasarkan hasil evaluasi.":"Ringkasan berdasarkan evaluasi kriteria. Layanan AI belum tersedia."}</p></>}
   <button className="bc4-button" disabled={busy} onClick={()=>void explain()}><Sparkles size={18}/>Jelaskan dengan AI</button>
   <h3>Catatan Admin (Opsional)</h3><div className="bc4-fields"><label className="bc4-field">Catatan dan Saran<textarea value={reason} maxLength={1500} disabled={busy} onChange={e=>setReason(e.target.value)} placeholder="Tambahkan catatan atau saran persiapan"/></label><label className="bc4-field">Waktu yang Disarankan<input value={timing} maxLength={180} disabled={busy} onChange={e=>setTiming(e.target.value)} placeholder="Opsional"/></label></div>
   <button className="bc4-button bc4-primary" disabled={busy} onClick={()=>void saveNote()}>Simpan Catatan</button>
  </section>}
 </>}
 {message&&<p className="bc4-status" role="status">{message}</p>}
 </B4Shell>;
}
