"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {ArrowLeft,CheckCircle2,CircleAlert,GraduationCap,Pencil,Plus,Save,Search,Sparkles,X} from "lucide-react";
import {useUser} from "@/context/UserContext";
import {recommendationRequest} from "@/lib/b4-recommendation-data";
import {recommendationCriterionLabel,recommendationEligibility} from "@/lib/b4-recommendations";
import {sortProgramStudents,type ProgramBatch,type ProgramStudent,type ProgramNote} from "@/lib/b4-program-analysis";
import type {GeneralScholarship,GeneralScholarshipPage} from "@/lib/b4-general-scholarships";
import {REGISTRATION_STATUS_LABELS,parseScholarshipRow,type RegistrationStatus,type ScholarshipCriterion,type ScholarshipRow} from "@/lib/b4-scholarships";
import {recommendationPeriod} from "@/lib/b4-recommendation-copy";
import {displayTitle} from "@/lib/display-copy";
import B4Shell,{Avatar} from "./B4Shell";
import NumberPagination from "./NumberPagination";
import {useStudentScholarshipCatalog} from "./useStudentScholarshipCatalog";

const EDITOR="/admin/basis-data-beasiswa";
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const durationText=(value:number|null|undefined,unit:string|null|undefined)=>value===null||value===undefined?"-":new Intl.NumberFormat("id-ID",{maximumFractionDigits:2}).format(value)+(unit?" "+unit:"");
const dateText=(value:string|null|undefined)=>value?new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(value+"T00:00:00Z")):"Belum ditentukan";
const operatorText=(value:string)=>value===">="?"≥":value==="<="?"≤":value==="!="?"≠":value;
const closedByDate=(closes:string|null|undefined)=>!!closes&&today()>closes;
const registrationTone=(value:RegistrationStatus)=>value==="dibuka"?"open":value==="ditutup"||value==="tidak_tersedia"?"closed":value==="belum_dibuka"?"pending":"neutral";
const registrationLabel=(value:RegistrationStatus)=>REGISTRATION_STATUS_LABELS[value];
const criterionStatus=(value:string|null)=>value==="terpenuhi"?"Terpenuhi":value==="belum_terpenuhi"?"Belum terpenuhi":"Belum diketahui";
const eligibilityChip=(candidate:ProgramStudent["candidate"])=>candidate.complete!==true||candidate.meets===null
 ?{tone:"pending",label:"Data belum lengkap"}
 :candidate.meets?{tone:"met",label:"Memenuhi"}:{tone:"unmet",label:"Belum memenuhi"};
type DetailState={id:number;row?:ScholarshipRow;error?:string};

async function getScholarshipDetail(id:number,signal?:AbortSignal):Promise<ScholarshipRow>{
 const payload=await recommendationRequest<{data?:unknown}>(`/api/b4/beasiswa/${id}`,{signal});
 const row=parseScholarshipRow(payload?.data);
 if(row.id!==id||!row.input)throw Error("Detail persyaratan belum lengkap. Coba muat ulang halaman.");
 return row;
}

export default function AdminProgramRecommendationsApi(){
 const {currentUser,refreshSession}=useUser();
 const allowed=currentUser.schoolStaff===true;
 const [page,setPage]=useState(1),[catalog,setCatalog]=useState<GeneralScholarshipPage>(),[error,setError]=useState("");
 const [program,setProgram]=useState<GeneralScholarship>();
 const [detail,setDetail]=useState<DetailState>(),[detailRetry,setDetailRetry]=useState(0);
 const [rows,setRows]=useState<ProgramStudent[]>([]),[complete,setComplete]=useState(false);
 const [progress,setProgress]=useState({count:0,total:0}),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const [selectedId,setSelectedId]=useState<number>(),[resultPage,setResultPage]=useState(1),[query,setQuery]=useState(""),[status,setStatus]=useState("");
 const [reason,setReason]=useState(""),[timing,setTiming]=useState("");
 const [explanation,setExplanation]=useState<{id:number;reason:string;preparations:string[];llmUsed:boolean}>();
 const generation=useRef(0),lock=useRef(false);
 const programId=program?.id;
 const current=detail?.id===programId?detail:undefined;
 const recipients=useStudentScholarshipCatalog<{data:GeneralScholarship}>(allowed&&programId!==undefined?`/api/b4/student-scholarships/${programId}`:null);
 useEffect(()=>()=>{generation.current++;},[]);
 useEffect(()=>{
  if(!allowed)return;let active=true;
  recommendationRequest<GeneralScholarshipPage>("/api/b4/recommendation-programs?page="+page).then(v=>{if(active){setCatalog(v);setError("");}}).catch(e=>{if(active)setError(e instanceof Error?e.message:"Katalog belum dapat dimuat.");});
  return()=>{active=false;};
 },[allowed,page]);
 useEffect(()=>{
  if(!allowed||programId===undefined)return;
  const controller=new AbortController();let active=true;
  getScholarshipDetail(programId,controller.signal).then(row=>{if(active)setDetail({id:programId,row});}).catch(e=>{
   if(!active||controller.signal.aborted)return;if(e&&typeof e==="object"&&"status" in e&&e.status===401)void refreshSession();
   setDetail({id:programId,error:e instanceof Error?e.message:"Informasi rinci beasiswa belum dapat dimuat."});
  });
  return()=>{active=false;controller.abort();};
 },[allowed,programId,detailRetry,refreshSession]);
 const info=current?.row?.input,recipientProgram=recipients.data?.data;
 const name=current?.row?.name??program?.name??"";
 const provider=info?.penyelenggara??program?.provider??null;
 const description=info?.deskripsi??program?.description??null;
 const level=current?.row?.level??program?.level??"";
 const opens=current?.row?.opens??program?.opens??null;
 const closes=current?.row?.closes??program?.closes??null;
 const applyPeriod=current?.row?.applyPeriod??program?.period??null;
 const programDuration=current?.row?.duration??program?.duration??null;
 const durationUnit=current?.row?.durationUnit??program?.durationUnit??null;
 const registrationUrl=info?.link_pendaftaran??program?.registrationUrl??null;
 const closed=current?.row?.registrationStatus?(current.row.registrationStatus==="ditutup"||current.row.registrationStatus==="tidak_tersedia"):closedByDate(closes);
 const regStatus:RegistrationStatus=current?.row?.registrationStatus??(closed?"ditutup":opens&&today()<opens?"belum_dibuka":"belum_ditentukan");
 const regTone=registrationTone(regStatus);
 const criteria:ScholarshipCriterion[]=info?.kriteria??(recipientProgram?.criteria??[]).map(c=>({nama_kriteria:c.name,tipe_kriteria:"",operator:c.operator,nilai_kriteria:c.required}));
 const selected=rows.find(s=>s.id===selectedId);
 function failed(e:unknown){if(e&&typeof e==="object"&&"status" in e&&e.status===401)void refreshSession();return e instanceof Error?e.message:"Proses belum berhasil. Coba lagi.";}
 function resetAnalysis(){generation.current++;setRows([]);setComplete(false);setSelectedId(undefined);setExplanation(undefined);setMessage("");setProgress({count:0,total:0});setQuery("");setStatus("");setResultPage(1);}
 function chooseProgram(value:GeneralScholarship){resetAnalysis();setDetail(undefined);setDetailRetry(0);setProgram(value);}
 function backToCatalog(){resetAnalysis();setDetail(undefined);setProgram(undefined);}
 function retryDetail(){setDetail(undefined);setDetailRetry(v=>v+1);}
 async function analyse(){
  if(!program||closed||lock.current)return;lock.current=true;setBusy(true);setMessage("");setProgress({count:0,total:0});setRows([]);setComplete(false);setSelectedId(undefined);setExplanation(undefined);
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
 const met=rows.filter(s=>s.candidate.complete===true&&s.candidate.meets===true).length;
 const incomplete=rows.filter(s=>s.candidate.complete!==true).length;
 const percent=progress.total?Math.min(100,Math.round(progress.count/progress.total*100)):0;
 const selectedScore=selected?selected.candidate.complete&&selected.candidate.score!==null?selected.candidate.score+"/100":"Belum dapat dinilai":null;
 function openStudent(student:ProgramStudent){
  if(busy)return;
  setSelectedId(student.id);setReason(student.note?.reason??"");setTiming(student.note?.timing??"");setMessage("");
  requestAnimationFrame(()=>{
   document.getElementById("bc4-program-student")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
   document.getElementById("bc4-program-student-title")?.focus({preventScroll:true});
  });
 }
 function closeStudent(){setSelectedId(undefined);setExplanation(undefined);setMessage("");}
 return <B4Shell title="Rekomendasi Beasiswa" description="Kelola informasi beasiswa, kriteria kelayakan, dan analisis kecocokan siswa dari satu tempat." dataNote="">
 {!allowed?<div className="bc4-empty"><p role="alert">Akun ini belum memiliki izin mengelola rekomendasi.</p></div>:!program?<>
  <div className="bc4-programCatalogHead">
   <div><h2>Pilihan Beasiswa</h2><p>Buka detail untuk melihat informasi, kriteria, penerima, dan analisis kecocokan siswa.</p></div>
   <div className="bc4-programCatalogActions">
    {catalog&&catalog.total>0&&<p className="bc4-programCount"><strong>{catalog.total}</strong> beasiswa aktif</p>}
    <Link className="bc4-button bc4-primary" href={`${EDITOR}/tambah`}><Plus size={18} aria-hidden="true"/>Tambah Beasiswa</Link>
   </div>
  </div>
  {error?<div className="bc4-empty" role="alert"><p>{error}</p></div>:!catalog||catalog.currentPage!==page?<p className="bc4-status" role="status">Memuat beasiswa…</p>:<>
   <div className="bc4-grid3 bc4-resultCards bc4-recommendationCards bc4-catalogCards">{catalog.data.map(p=><article className="bc4-panel bc4-scholarCard bc4-programCard" key={p.id}>
    <div className="bc4-programCardHead"><h3><GraduationCap size={25} aria-hidden="true"/>{displayTitle(p.name)}</h3>{closedByDate(p.closes)&&<span className="bc4-regChip bc4-regChip-closed">Pendaftaran ditutup</span>}</div>
    <p className="bc4-scholarCardMeta">{displayTitle(p.provider??"-")} · {displayTitle(p.level)}</p>
    <dl className="bc4-metrics bc4-cardFacts"><div><dt>Jenjang</dt><dd>{displayTitle(p.level)}</dd></div><div><dt>Durasi</dt><dd>{durationText(p.duration,p.durationUnit)}</dd></div><div className="bc4-cardPeriod"><dt>Periode Pendaftaran</dt><dd>{recommendationPeriod(p)}</dd></div></dl>
    <div className="bc4-reason"><h4>Tentang Beasiswa</h4><p>{p.description?p.description.slice(0,220):"Pelajari persyaratan program dan analisis kecocokan siswa."}</p></div>
    <button type="button" className="bc4-button bc4-cardDetail" onClick={()=>chooseProgram(p)}>Lihat Detail Beasiswa</button>
   </article>)}</div>
   {!catalog.data.length&&<div className="bc4-empty"><p>Belum ada beasiswa aktif. Tambahkan informasi melalui Basis Data Beasiswa.</p></div>}
   {catalog.lastPage>1&&<div className="bc4-programPagination"><NumberPagination current={page} last={catalog.lastPage} onChange={setPage} label="Halaman beasiswa"/></div>}
  </>}
 </>:<>
  <button type="button" className="bc4-backLink" disabled={busy} onClick={backToCatalog}><ArrowLeft size={18} aria-hidden="true"/>Kembali ke Pilihan Beasiswa</button>
  <section className="bc4-programHeader">
   <span className="bc4-programIcon"><GraduationCap size={30} aria-hidden="true"/></span>
   <div className="bc4-programIdentity">
    <h2>{displayTitle(name)}</h2>
    <p>{displayTitle(provider??"-")} · {displayTitle(level)}</p>
    <p>{recommendationPeriod({period:applyPeriod,opens,closes})}</p>
    <p className="bc4-programBadges"><span className={"bc4-regChip bc4-regChip-"+regTone}>{registrationLabel(regStatus)}</span></p>
   </div>
  </section>
  {closed&&<div className="bc4-programNotice" role="status"><CircleAlert size={20} aria-hidden="true"/><p>Pendaftaran program ini sudah ditutup. Informasi dan kriteria tetap dapat diperbarui, tetapi analisis siswa dinonaktifkan sampai program dibuka kembali.</p></div>}
  {current?.error&&<div className="bc4-programNotice bc4-programNoticeError" role="alert"><CircleAlert size={20} aria-hidden="true"/><p>{current.error}</p><button type="button" className="bc4-button" onClick={retryDetail}>Coba Lagi</button></div>}
  <div className="bc4-detailRecGrid bc4-generalDetail"><div>
   <section className="bc4-panel"><h2>Tentang Beasiswa</h2><p>{description??"Deskripsi belum diisi. Lengkapi melalui Edit Informasi & Kriteria."}</p></section>
   <section className="bc4-panel" aria-labelledby="bc4-program-criteria">
    <h2 id="bc4-program-criteria">Kriteria Kelayakan</h2>
    {criteria.length?<ul className="bc4-criteriaReview">{criteria.map((c,index)=><li key={index}>
     <div className="bc4-criteriaReviewMain"><strong>{c.nama_kriteria}</strong><span>{c.tipe_kriteria?recommendationCriterionLabel(c.tipe_kriteria)+" · ":""}{operatorText(c.operator)} {c.nilai_kriteria}</span></div>
     <span className="bc4-criteriaWeight">Bobot {c.bobot??1}</span>
    </li>)}</ul>:current?.error?<p>Kriteria belum dapat dimuat.</p>:!current?<p role="status">Memuat kriteria…</p>:<p>Belum ada kriteria kelayakan yang tercatat. Lengkapi melalui Edit Informasi & Kriteria.</p>}
    <p className="bc4-criteriaNote">Bobot menentukan sumbangan tiap kriteria pada Skor Kriteria. Semua kriteria perlu terpenuhi agar siswa dinilai memenuhi syarat.</p>
   </section>
   <section className="bc4-panel" aria-labelledby="bc4-program-recipients">
    <h2 id="bc4-program-recipients">Penerima dari SMA 8</h2>
    {recipients.error?<p role="alert">{recipients.error}</p>:!recipientProgram?<p role="status">Memuat data penerima…</p>:recipientProgram.recipients?.data.length?<div className="bc4-recipientList">
     {recipientProgram.recipients.data.map(alumni=><article className="bc4-yellowCard" key={alumni.admissionId}>
      <div className="bc4-profile" style={{padding:0,border:0}}><Avatar name={alumni.name} small example={false}/><div><h3>{displayTitle(alumni.name)}</h3><p>{displayTitle(alumni.university??"-")} · {displayTitle(alumni.program??"-")}</p>{alumni.cohort&&<p>Angkatan {alumni.cohort}</p>}</div></div>
      <Link className="bc4-button" href={`/admin/alumni-perguruan-tinggi/informasi-detail?id=${alumni.admissionId}`}>Lihat Data Alumni</Link>
     </article>)}
     {recipientProgram.recipients.total>recipientProgram.recipients.data.length&&<p>Menampilkan {recipientProgram.recipients.data.length} dari {recipientProgram.recipients.total} penerima yang tersedia.</p>}
    </div>:<p>Belum ada penerima yang tercatat dari SMA 8.</p>}
   </section>
   <section className="bc4-panel" aria-labelledby="bc4-program-scoring">
    <h2 id="bc4-program-scoring">Cara Penilaian</h2>
    <ol className="bc4-scoringList">
     <li><strong>Kriteria kelayakan — aturan, bukan AI.</strong><p>Data siswa dibandingkan dengan kriteria dan bobot yang tercatat. Semua kriteria terpenuhi berarti memenuhi kriteria saat ini; data yang belum tersedia berarti belum dapat dinilai lengkap.</p></li>
     <li><strong>Skor Kriteria 0–100.</strong><p>Skor adalah jumlah bobot kriteria yang terpenuhi dibanding total bobot. Skor ini bukan peluang atau probabilitas diterima.</p></li>
     <li><strong>AI (Gemini) — hanya penjelasan.</strong><p>AI menjelaskan checklist hasil evaluasi dan langkah persiapan. AI tidak mengubah skor maupun status kelayakan; bila layanan AI gagal, ringkasan evaluasi tetap tampil.</p></li>
     <li><strong>ML (TF-IDF) — relevansi minat antarprogram.</strong><p>ML dipakai di halaman siswa untuk mengurutkan relevansi minat di antara beberapa program. ML tidak menentukan kelayakan dan tidak dipakai sebagai penentu pada analisis satu program.</p></li>
    </ol>
    <ul className="bc4-programNote">
     <li>Perubahan informasi dan kriteria di sini langsung berlaku pada katalog serta rekomendasi siswa.</li>
     <li>Hasil rekomendasi siswa yang sudah tersimpan akan ditandai perlu diperbarui, lalu dihitung ulang saat siswa meminta.</li>
     <li>Setelah kriteria diubah, jalankan ulang analisis agar hasil admin sesuai data terbaru.</li>
    </ul>
   </section>
   <section className="bc4-panel bc4-programAnalysis" aria-labelledby="bc4-program-analysis-title">
    <div className="bc4-programAnalysisHead">
     <div><h2 id="bc4-program-analysis-title">Analisis Kecocokan Siswa</h2><p>Jalankan analisis untuk melihat siswa aktif yang datanya sesuai dengan kriteria program ini.</p></div>
     <div className="bc4-programAnalysisActions">
      {complete&&rows.length>0&&<p className="bc4-programSummary"><strong>{rows.length}</strong> siswa dianalisis · {met} memenuhi · {incomplete} data belum lengkap</p>}
      {!closed&&<button type="button" className="bc4-button bc4-primary" disabled={busy} aria-busy={busy} onClick={()=>void analyse()}>{busy?"Memproses…":complete?"Perbarui Analisis":"Jalankan Analisis"}</button>}
     </div>
    </div>
    {closed?<div className="bc4-programNotice" role="status"><CircleAlert size={20} aria-hidden="true"/><p>Analisis tidak dijalankan karena pendaftaran sudah ditutup. Informasi dan kriteria tetap dapat diperbarui.</p></div>:<>
     {message&&!selected&&<p className="bc4-programStatus" role="status">{message}</p>}
     {busy&&!selected&&<div className="bc4-programProgress">
      <div className="bc4-programProgressHead"><span>Menganalisis kecocokan siswa…</span><span role="status">{progress.total?progress.count+" dari "+progress.total:progress.count+" siswa"}</span></div>
      <div className="bc4-progressTrack" role="progressbar" aria-label="Progres analisis siswa" aria-valuemin={0} aria-valuemax={progress.total||100} aria-valuenow={progress.total?progress.count:undefined}><span style={{width:(progress.total?percent:8)+"%"}}/></div>
      <p>Biarkan halaman ini terbuka sampai analisis selesai. Setiap batch siswa diproses bertahap.</p>
     </div>}
     {!complete&&!busy&&<p className="bc4-programHint">Analisis belum dijalankan. Gunakan tombol Jalankan Analisis untuk memulai.</p>}
     {complete&&<>
      <div className="bc4-programToolbar">
       <label className="b4-searchField bc4-programToolbarSearch"><Search size={20} aria-hidden="true"/><span className="b4-srOnly">Cari nama siswa</span><input aria-label="Cari nama siswa dalam hasil analisis" placeholder="Cari nama siswa" value={query} onChange={e=>{setQuery(e.target.value);setResultPage(1);}}/></label>
       <label className="bc4-field bc4-programToolbarFilter"><select aria-label="Status kecocokan" value={status} onChange={e=>{setStatus(e.target.value);setResultPage(1);}}><option value="">Semua Hasil</option><option value="met">Memenuhi Kriteria</option><option value="missing">Data Belum Lengkap</option><option value="unmet">Belum Memenuhi</option></select></label>
       <p className="bc4-programToolbarMeta">{visible.length} dari {rows.length} siswa</p>
      </div>
      <p className="bc4-programHint">Skor Kriteria menunjukkan bobot kriteria yang terpenuhi (0–100), bukan peluang diterima. Data yang belum tersedia tidak dianggap memenuhi.</p>
      <div className="b4-tableScroll bc4-programTable">
       <table className="bc4-progressTable"><thead><tr><th scope="col">Nama Siswa</th><th scope="col">Kelas</th><th scope="col">Skor Kriteria</th><th scope="col">Status</th><th scope="col">Detail</th></tr></thead>
        <tbody>{visible.slice((resultPage-1)*10,resultPage*10).map(s=>{const chip=eligibilityChip(s.candidate);return <tr key={s.id} className={selected?.id===s.id?"bc4-programRowSelected":undefined} onClick={()=>openStudent(s)}>
         <td><strong>{displayTitle(s.name)}</strong></td>
         <td>{displayTitle(s.classroom??"-")}</td>
         <td className="bc4-programScore">{s.candidate.score===null||!s.candidate.complete?"-":<>{new Intl.NumberFormat("id-ID",{maximumFractionDigits:2}).format(s.candidate.score)}<span>/100</span></>}</td>
         <td><span className={"bc4-statusChip bc4-statusChip-"+chip.tone} title={recommendationEligibility(s.candidate)}>{chip.label}</span></td>
         <td className="bc4-programTableAction"><button type="button" className="bc4-button" disabled={busy} aria-pressed={selected?.id===s.id} onClick={e=>{e.stopPropagation();openStudent(s);}}>Lihat Detail</button></td>
        </tr>;})}</tbody>
       </table>
      </div>
      {visible.length>10&&<div className="bc4-programPagination"><NumberPagination current={resultPage} last={Math.ceil(visible.length/10)} onChange={setResultPage} label="Halaman hasil analisis"/></div>}
      {!visible.length&&<div className="bc4-empty"><p>Tidak ada siswa yang sesuai dengan filter ini.</p></div>}
      {selected&&<section className="bc4-studentDetail" id="bc4-program-student" aria-labelledby="bc4-program-student-title">
       <div className="bc4-studentDetailMain">
        <header className="bc4-studentDetailHead">
         <div><p className="bc4-studentDetailEyebrow">Detail Siswa</p><h2 id="bc4-program-student-title" tabIndex={-1}>{displayTitle(selected.name)}</h2><p>{displayTitle(selected.classroom??"-")} · Skor Kriteria {selectedScore}</p></div>
         <button type="button" className="bc4-iconButton" aria-label="Tutup detail siswa" onClick={closeStudent}><X size={20} aria-hidden="true"/></button>
        </header>
        <div className="bc4-studentDetailBlock"><h3>Evaluasi Kriteria</h3>
         {selected.candidate.checklist.length?<div className="bc4-studentChecks">{selected.candidate.checklist.map((check,index)=><div className={"bc4-evaluation"+(check.status==="terpenuhi"?"":" bc4-pending")} key={index}>
          {check.status==="terpenuhi"?<CheckCircle2 size={22} aria-hidden="true"/>:<CircleAlert size={22} aria-hidden="true"/>}<span><strong>{recommendationCriterionLabel(check.criterion)}</strong><span>{check.operator} {check.required??"-"} — {criterionStatus(check.status)}</span></span>
         </div>)}</div>:<p>Rincian kriteria belum tersedia.</p>}
        </div>
        <div className="bc4-studentDetailBlock"><h3>Alasan Kecocokan</h3><p>{selected.reason||"-"}</p>
         {explanation?.id===selected.id&&<><ul className="bc4-studentPrep">{explanation.preparations.map((item,index)=><li key={index}>{item}</li>)}</ul><p className="bc4-studentDetailSource">{explanation.llmUsed?"Penjelasan dibantu AI berdasarkan hasil evaluasi. AI tidak mengubah skor atau status.":"Ringkasan berdasarkan evaluasi kriteria. Layanan AI belum tersedia."}</p></>}
         <p className="bc4-studentDetailSource">Kecocokan berasal dari evaluasi kriteria. AI hanya menjelaskan checklist dan tidak mengubah Skor Kriteria.</p>
        </div>
        <button type="button" className="bc4-button bc4-studentDetailAi" disabled={busy} aria-busy={busy} onClick={()=>void explain()}><Sparkles size={18} aria-hidden="true"/>Jelaskan dengan AI</button>
       </div>
       <aside className="bc4-studentDetailAside">
        <h3>Catatan Admin (Opsional)</h3>
        <p className="bc4-studentDetailAsideNote">Catatan ini tidak mengubah perhitungan otomatis yang dilihat siswa.</p>
        <div className="bc4-fields"><label className="bc4-field">Catatan dan Saran<textarea value={reason} maxLength={1500} disabled={busy} onChange={e=>setReason(e.target.value)} placeholder="Tambahkan catatan atau saran persiapan"/></label><label className="bc4-field">Waktu yang Disarankan<input value={timing} maxLength={180} disabled={busy} onChange={e=>setTiming(e.target.value)} placeholder="Opsional"/></label></div>
        <button type="button" className="bc4-button bc4-primary" disabled={busy} aria-busy={busy} onClick={()=>void saveNote()}><Save size={18} aria-hidden="true"/>{busy?"Memproses…":"Simpan Catatan"}</button>
        <p className="bc4-programStatus" role="status">{message}</p>
       </aside>
      </section>}
     </>}
    </>}
   </section>
  </div><div>
   <aside className="bc4-panel" aria-labelledby="bc4-program-info">
    <h2 id="bc4-program-info">Informasi Beasiswa</h2>
    <dl className="bc4-facts">
     <div><dt>Penyelenggara</dt><dd>{displayTitle(provider??"-")}</dd></div>
     <div><dt>Jenjang</dt><dd>{displayTitle(level)}</dd></div>
     <div><dt>Durasi</dt><dd>{durationText(programDuration,durationUnit)}</dd></div>
     <div><dt>Periode Pendaftaran</dt><dd>{recommendationPeriod({period:applyPeriod,opens,closes})}</dd></div>
     <div><dt>Status Pendaftaran</dt><dd><span className={"bc4-regChip bc4-regChip-"+regTone}>{registrationLabel(regStatus)}</span></dd></div>
     {opens&&<div><dt>Tanggal Buka</dt><dd>{dateText(opens)}</dd></div>}
     {closes&&<div><dt>Tanggal Tutup</dt><dd>{dateText(closes)}</dd></div>}
    </dl>
    {registrationUrl&&<a className="bc4-button" href={registrationUrl} target="_blank" rel="noopener noreferrer">Situs Resmi Beasiswa</a>}
   </aside>
   <aside className="bc4-panel bc4-programManage" aria-labelledby="bc4-program-manage">
    <h2 id="bc4-program-manage">Kelola Informasi</h2>
    <p>Data ini dipakai bersama oleh katalog dan rekomendasi siswa.</p>
    <div className="bc4-programButtons">
     <Link className="bc4-button bc4-primary" href={`${EDITOR}/edit?id=${program.id}`}><Pencil size={18} aria-hidden="true"/>Edit Informasi &amp; Kriteria</Link>
     <Link className="bc4-button" href={`${EDITOR}/tambah`}><Plus size={18} aria-hidden="true"/>Tambah Beasiswa</Link>
    </div>
    <p className="bc4-programManageNote">Hasil rekomendasi siswa yang sudah tersimpan akan ditandai perlu diperbarui, lalu dihitung ulang saat siswa meminta.</p>
   </aside>
  </div></div>
 </>}
 </B4Shell>;
}
