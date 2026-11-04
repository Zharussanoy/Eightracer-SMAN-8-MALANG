"use client";

import {useRef,useState,type FormEvent} from "react";
import {CheckCircle2,CircleAlert,Eye,EyeOff,GraduationCap,RefreshCw,Search,Send,Sparkles,X} from "lucide-react";
import B4Shell,{Avatar} from "./B4Shell";
import {recommendationCriterionLabel,recommendationEligibility,type RecommendationCandidate} from "@/lib/b4-recommendations";
import type {RecommendationStudent,RecommendationStudentPage} from "@/lib/b4-students";
import type {RecommendationDraft,EditableRecommendationCandidate} from "@/lib/b4-recommendation-data";

export interface RecommendationFilters {query:string;classroom:string;cohort:string;publication:string}
export interface RecommendationAdminViewProps {
 filters:RecommendationFilters;onFilter:(field:keyof RecommendationFilters,value:string)=>void;
 page:RecommendationStudentPage|undefined;student:RecommendationStudent|undefined;loading:boolean;error?:string;
 candidates:EditableRecommendationCandidate[];
 draft:RecommendationDraft|null|undefined;targetLevel:string;onTarget:(value:string)=>void;
 onEdit:(candidate:EditableRecommendationCandidate,reason:string,timing:string)=>Promise<boolean>;
 onVisibility:(candidate:EditableRecommendationCandidate)=>Promise<boolean>;
 onRemove:(candidate:EditableRecommendationCandidate)=>Promise<boolean>;
 busy:boolean;canGenerate:boolean;canPublish:boolean;message:string;onGenerate:()=>void;onPublish:()=>void;onReset:()=>void;
}
const known=(value:string|null|undefined)=>value??"-";
function Evaluation({candidate}:{candidate:RecommendationCandidate}){
 return <div>{candidate.checklist.length?candidate.checklist.map((check,index)=><div className={"bc4-evaluation"+(check.status==="terpenuhi"?"":" bc4-pending")} key={index}>
  {check.status==="terpenuhi"?<CheckCircle2 size={32}/>:<CircleAlert size={32}/>}<span>{recommendationCriterionLabel(check.criterion)}: {check.operator} {known(check.required)}. {check.status==="terpenuhi"?"Terpenuhi":check.status==="belum_terpenuhi"?"Belum terpenuhi":"Belum diketahui"}</span>
 </div>):<div className="bc4-evaluation bc4-pending"><CircleAlert size={32}/><span>Rincian kriteria belum tersedia.</span></div>}</div>;
}
function completeness(candidates:RecommendationAdminViewProps["candidates"],fields:string[]){
 const checks=candidates.flatMap(c=>c.checklist).filter(c=>fields.includes(c.criterion));
 const missing=[...new Set(checks.filter(c=>c.status==="belum_diketahui").map(c=>recommendationCriterionLabel(c.criterion)))];
 return {known:checks.length>0&&missing.length===0,text:missing.length?"Belum tercatat: "+missing.join(", ")+".":checks.length?"Data untuk "+[...new Set(checks.map(c=>recommendationCriterionLabel(c.criterion)))].join(", ")+" sudah tercatat.":"-"};
}
export default function RecommendationAdminView(p:RecommendationAdminViewProps){
 const {student,candidates,draft,filters}=p;
 const [editing,setEditing]=useState<EditableRecommendationCandidate|null>(null);
 const [deleting,setDeleting]=useState<EditableRecommendationCandidate|null>(null);
 const [reason,setReason]=useState(""),[timing,setTiming]=useState("");
 const editor=useRef<HTMLDialogElement>(null),confirmation=useRef<HTMLDialogElement>(null);
 function edit(candidate:EditableRecommendationCandidate){setEditing(candidate);setReason(candidate.reason??"");setTiming(candidate.timing??"");editor.current?.showModal();}
 async function submit(event:FormEvent){event.preventDefault();if(editing&&await p.onEdit(editing,reason,timing))editor.current?.close();}
 const visibleCount=candidates.filter(v=>!v.hidden).length;
 const academic=completeness(candidates,["nilai_tka","rata_rapor","jumlah_prestasi","skor_prestasi","ipk"]);
 const economy=completeness(candidates,["penghasilan_orang_tua","bantuan_sosial_sesuai"]);
 const cards=[{title:"Kelengkapan Data Siswa",...academic},{title:"Asesmen RIASEC",known:false,text:"-"}, {title:"Latar Belakang Ekonomi",...economy}];
 const published=draft?.status==="disetujui";
 return <B4Shell title="Rekomendasi Beasiswa" description="Tinjau rekomendasi beasiswa dan publikasikan hasil yang sesuai kepada siswa." dataNote="">
  <div className="bc4-filterRow">
   <label className="b4-searchField"><Search size={22}/><span className="b4-srOnly">Cari nama siswa</span><input aria-label="Cari nama siswa" type="search" list="bc4-students" value={filters.query} placeholder="Cari nama siswa" maxLength={100} disabled={p.busy} onChange={e=>p.onFilter("query",e.target.value)}/><datalist id="bc4-students">{p.page?.data.map(v=><option key={v.id} value={v.name}/>)}</datalist></label>
   <label className="b4-selectField"><select aria-label="Kelas siswa" value={filters.classroom} disabled={p.busy} onChange={e=>p.onFilter("classroom",e.target.value)}><option value="">Semua Kelas</option>{p.page?.filters.classrooms.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
   <label className="b4-selectField"><select aria-label="Angkatan siswa" value={filters.cohort} disabled={p.busy} onChange={e=>p.onFilter("cohort",e.target.value)}><option value="">Semua Angkatan</option>{p.page?.filters.cohorts.map(v=><option key={v}>{v}</option>)}</select></label>
   <label className="b4-selectField"><select aria-label="Status publikasi" value={filters.publication} disabled={p.busy} onChange={e=>p.onFilter("publication",e.target.value)}><option value="">Semua Status</option><option value="false">Rekomendasi Belum dirilis</option><option value="true">Sudah Dipublikasikan</option></select></label>
  </div>
  {p.error&&<p className="bc4-status" role="alert">{p.error}</p>}
  {p.loading&&<p className="bc4-status" role="status">Memuat data siswa dan rekomendasi…</p>}
  {!p.loading&&p.page&&!student&&<div className="bc4-empty">Tidak ada siswa yang sesuai.<button className="bc4-button" onClick={p.onReset}>Reset filter</button></div>}
  <div className="bc4-profileRow"><div className="bc4-profile"><Avatar name={student?.name??"-"} example={false}/><div><h2>{student?.name??"-"}</h2><p>{known(student?.classroom)} · Angkatan {known(student?.cohort)}</p><p>NISN {student?.hasNisn?"••••••••••":"-"}</p></div></div>
   <section className="bc4-current"><h3>Status Rekomendasi</h3><dl className="bc4-metrics"><div><dt>Status</dt><dd>{draft?published?"Ditinjau":draft.status==="ditolak"?"Ditolak":"Draft":"-"}</dd></div><div><dt>Jumlah</dt><dd>{candidates.length?visibleCount+" Beasiswa":"-"}</dd></div><div><dt>Publikasi</dt><dd>{draft?published?"Sudah Rilis":"Belum Rilis":"-"}</dd></div></dl></section>
  </div>
  <section className="bc4-section"><h2 className="bc4-sectionHeading">Kelengkapan Data Siswa</h2><div className="bc4-sectionBody"><div className="bc4-grid3">{cards.map(card=><article className="bc4-yellowCard" key={card.title}><div className="bc4-splitTitle"><h3>{card.title}</h3><span className={"bc4-badge"+(card.known?"":" bc4-badgeWarning")}>{card.known&&<CheckCircle2 size={12}/>} {card.known?"Tersedia":"Belum Lengkap"}</span></div><p>{card.text}</p></article>)}</div>
   <aside className="bc4-note" style={{marginTop:20}}><Sparkles size={22}/><div><h3>Prinsip AI Eightracer</h3><p>Kriteria ditinjau berdasarkan data yang tersedia. Data yang belum tercatat ditandai belum diketahui dan tidak diganti dengan perkiraan.</p></div></aside>
  </div></section>
  <section className="bc4-section"><h2 className="bc4-sectionHeading">Hasil Rekomendasi Beasiswa<button className="bc4-button" type="button" disabled={p.busy||!p.canGenerate} onClick={p.onGenerate}><RefreshCw size={16}/>{p.busy?"Memproses…":"Generate Ulang"}</button></h2><div className="bc4-sectionBody">
   <div className="bc4-toggleRow"><label className="bc4-field">Target Jenjang<select value={p.targetLevel} disabled={p.busy||!student} onChange={e=>p.onTarget(e.target.value)}><option>SMA</option><option>Kuliah</option></select></label></div>
   {candidates.map(candidate=><article className={"bc4-recommendation"+(candidate.hidden?" bc4-recommendationHidden":"")} key={candidate.id}>
    <header className="bc4-recommendationHeader"><div><h3>{candidate.name}</h3><p>{known(candidate.provider)}</p></div><div className="bc4-score"><span>Skor Kecocokan</span><strong>{candidate.complete&&candidate.score!==null?candidate.score+"/100":"-"}</strong></div></header>
    <div className="bc4-recBody"><div><h4>Alasan Kecocokan AI</h4><p>{candidate.reason??recommendationEligibility(candidate)}</p><div className="bc4-evaluation"><GraduationCap size={30}/><span>Referensi alumni mengikuti catatan yang dipublikasikan sekolah.</span></div><div className="bc4-pair"><div className="bc4-yellowCard"><p>Periode Pendaftaran</p><strong>{known(candidate.period)}</strong></div><div className="bc4-yellowCard"><p>Tipe Pendanaan</p><strong>-</strong></div></div></div><div><h4>Evaluasi Kriteria Siswa</h4><Evaluation candidate={candidate}/></div></div>
    <footer className="bc4-recFooter"><span>{candidate.hidden?"Disembunyikan dari publikasi":recommendationEligibility(candidate)}</span><div className="bc4-actions"><button type="button" className="bc4-button" disabled={p.busy||!draft||!candidate.detailId} title={!draft?"Simpan draft melalui Generate Ulang terlebih dahulu.":undefined} onClick={()=>void p.onVisibility(candidate)}>{candidate.hidden?<Eye size={16}/>:<EyeOff size={16}/>} {candidate.hidden?"Tampilkan":"Sembunyikan"}</button><button type="button" className="bc4-button" disabled={p.busy||!draft||!candidate.detailId} onClick={()=>edit(candidate)}>Edit</button><button type="button" className="bc4-button bc4-danger" disabled={p.busy||!draft||!candidate.detailId} onClick={()=>{setDeleting(candidate);confirmation.current?.showModal();}}>Hapus</button></div></footer>
   </article>)}
   {!candidates.length&&<div className="bc4-empty">Belum ada rekomendasi untuk ditampilkan.</div>}
   <aside className="bc4-note"><CircleAlert size={25}/><div><h3>Catatan Sistem</h3><p>Tinjau seluruh rekomendasi sebelum dipublikasikan. Hasil dengan kriteria yang belum lengkap belum dapat dirilis kepada siswa.</p></div><button className="bc4-button bc4-primary" type="button" disabled={p.busy||!p.canPublish} onClick={p.onPublish}><Send size={18}/>Publikasikan Ke Siswa</button></aside>
  </div></section><p className="bc4-status" role="status">{p.message}</p>

  <dialog ref={editor} className="bc4-dialog" aria-labelledby="bc4-edit-recommendation-title" onCancel={e=>{if(p.busy)e.preventDefault();}}>
   <header className="bc4-dialogTitle"><h2 id="bc4-edit-recommendation-title">Edit Rekomendasi Beasiswa</h2><button className="bc4-iconButton" type="button" aria-label="Tutup edit rekomendasi" disabled={p.busy} onClick={()=>editor.current?.close()}><X/></button></header>
   <form className="bc4-dialogBody bc4-fields" onSubmit={e=>void submit(e)}>
    <section className="bc4-readonly"><h3>Informasi Referensi · Read Only</h3><div className="bc4-pair"><div className="bc4-yellowCard"><p>Nama Beasiswa</p><strong>{editing?.name??"-"}</strong></div><div className="bc4-yellowCard"><p>Skor Kecocokan</p><strong>{editing?.complete&&editing.score!==null?editing.score+"/100":"-"}</strong></div></div><h3>Evaluasi Kriteria Beasiswa</h3>{editing&&<Evaluation candidate={editing}/>}<p>Data master dikelola melalui Basis Data Beasiswa. Skor tidak dapat diubah dari formulir ini.</p></section>
    <label className="bc4-field">Alasan Kecocokan<textarea required value={reason} onChange={e=>setReason(e.target.value)} maxLength={1500} disabled={p.busy}/></label>
    <label className="bc4-field">Waktu yang Disarankan Untuk Mendaftar<input value={timing} onChange={e=>setTiming(e.target.value)} maxLength={180} disabled={p.busy}/></label>
    <p className="bc4-status" role="status">{p.message}</p><div className="bc4-actions"><button type="button" className="bc4-button" disabled={p.busy} onClick={()=>editor.current?.close()}>Batal</button><button type="submit" className="bc4-button bc4-primary" disabled={p.busy||!reason.trim()}>Simpan</button></div>
   </form>
  </dialog>
  <dialog ref={confirmation} className="bc4-dialog" style={{maxWidth:480}} aria-labelledby="bc4-delete-title" onCancel={e=>{if(p.busy)e.preventDefault();}}>
   <div className="bc4-dialogBody"><h2 id="bc4-delete-title" style={{fontWeight:700,fontSize:23}}>Hapus rekomendasi?</h2><p style={{margin:"16px 0"}}>Rekomendasi ini akan dihapus dari daftar siswa. Riwayatnya tetap tersimpan oleh sekolah.</p><p className="bc4-status" role="status">{p.message}</p><div className="bc4-actions"><button type="button" className="bc4-button" disabled={p.busy} onClick={()=>confirmation.current?.close()}>Batal</button><button type="button" className="bc4-button bc4-primary" disabled={p.busy||!deleting} onClick={async()=>{if(deleting&&await p.onRemove(deleting))confirmation.current?.close();}}>Hapus rekomendasi</button></div></div>
  </dialog>
 </B4Shell>;
}
