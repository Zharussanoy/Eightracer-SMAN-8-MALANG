"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { recommendationEligibility, recommendationCriterionLabel, recommendationStatusLabel, type RecommendationPreview } from "@/lib/b4-recommendations";
import { recommendationRequest, type RecommendationDraft } from "@/lib/b4-recommendation-data";
import type { RecommendationStudent } from "@/lib/b4-students";
import RecommendationStudentPicker from "./RecommendationStudentPicker";
import B4Shell from "./B4Shell";

const known = (value: string | number | null) => value ?? "Belum tersedia";
const status = recommendationStatusLabel;
export default function AdminRecommendationsApi() {
  const { currentUser } = useUser();
  const [student, setStudent] = useState<RecommendationStudent | null>(null);
  return <B4Shell title="Rekomendasi Beasiswa" description="Pelajari pratinjau kecocokan beasiswa berdasarkan data siswa yang tersedia." dataNote="">
    {!currentUser.schoolStaff ? <p role="alert">Akun ini belum memiliki izin membaca pratinjau siswa.</p> : <>
      <aside className="bc4-note"><div><h3>Evaluasi dari data sekolah</h3><p>Periksa data dan kriteria terlebih dahulu. Generate membuat draft; publikasi memerlukan peninjauan Admin/BK. Skor bukan persentase peluang lolos.</p></div></aside>
      {!student ? <RecommendationStudentPicker onSelect={setStudent} /> : <><div className="bc4-profileRow"><div className="bc4-profile"><div><h2>{student.name}</h2><p>Angkatan {student.cohort ?? "belum tercatat"}</p></div></div><div className="bc4-current"><h3>Status</h3><p>Target dan status rekomendasi ditampilkan pada hasil di bawah.</p><button className="bc4-button" onClick={() => setStudent(null)}>Ganti siswa</button></div></div><Preview key={student.id} studentId={student.id} defaultLevel={student.cohort ? "Kuliah" : "SMA"} /></>}
    </>}
  </B4Shell>;
}
function Preview({ studentId, defaultLevel }: { studentId: number; defaultLevel: string }) {
  const { refreshSession } = useUser();
  const router = useRouter();
  const [level, setLevel] = useState(defaultLevel);
  const [retry, setRetry] = useState(0);
  const key = `${studentId}:${level}:${retry}`;
  const [result, setResult] = useState<{ key: string; data?: RecommendationPreview; draft?: RecommendationDraft | null; error?: string }>();
  const [mutation, setMutation] = useState<{key:string;draft:RecommendationDraft}|null>(null);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const lock=useRef(false);
  useEffect(() => {
    const abort = new AbortController();
    async function load() {
      try {
        const [preview,saved]=await Promise.all([
          recommendationRequest<RecommendationPreview>("/api/b4/recommendations/"+studentId+"/preview?target_jenjang="+level,{signal:abort.signal}),
          recommendationRequest<{draft:RecommendationDraft|null}>("/api/b4/recommendations/"+studentId+"/draft?target_jenjang="+level,{signal:abort.signal}),
        ]);
        if(!abort.signal.aborted)setResult({key,data:preview,draft:saved.draft});
      } catch (error) { if (abort.signal.aborted) return; if(error && typeof error === "object" && "status" in error && error.status === 401) { void refreshSession(); router.replace("/login"); return; } setResult({ key, error: error instanceof Error ? error.message : "Aplikasi belum dapat dihubungi." }); }
    }
    void load();
    return () => abort.abort();
  }, [studentId, level, key, refreshSession, router]);
  const current = result?.key === key ? result : null;
  const data = current?.data;
  const draft=mutation?.key===key?mutation.draft:current?.draft;
  const candidates=draft?.candidates??data?.candidates.map(c=>({...c,reason:null,preparations:[] as string[]}))??[];
  const canPublish=draft?.status==="pending"&&candidates.length>0&&candidates.every(c=>c.complete===true)&&candidates.some(c=>c.meets===true);
  async function save(action:"generate"|"review"){
    if(lock.current||action==="review"&&!canPublish)return;
    lock.current=true;setBusy(true);setMessage("");
    try{
      const response=await recommendationRequest<{draft:RecommendationDraft}>("/api/b4/recommendations/"+studentId+"/"+action,{method:"POST",
        body:action==="generate"?{target_jenjang:level}:{recommendation_id:draft!.id,status_review:"disetujui"}});
      setMutation({key,draft:response.draft});
      setMessage(action==="generate"?"Draft tersimpan. Periksa checklist sebelum publikasi.":"Rekomendasi telah dipublikasikan untuk akun siswa ini.");
    }catch(error){
      if(error&&typeof error==="object"&&"status" in error&&error.status===401){void refreshSession();router.replace("/login");}
      setMessage(error instanceof Error?error.message:"Perubahan belum dapat disimpan.");
    }finally{lock.current=false;setBusy(false);}
  }
  return <>
    <div className="bc4-toggleRow"><label className="bc4-field">Target Jenjang<select disabled={busy} value={level} onChange={(e) => setLevel(e.target.value)}><option>SMA</option><option>Kuliah</option></select></label><button className="bc4-button" disabled={busy} onClick={() => {setMessage("");setRetry((value) => value + 1);}}>Muat ulang pratinjau</button></div>
    {current?.error ? <div className="bc4-empty"><p role="alert">{current.error}</p><button className="bc4-button" onClick={() => setRetry((value) => value + 1)}>Coba lagi</button></div> : !data ? <p role="status">Memuat pratinjau dari BE…</p> : <section className="bc4-section"><h2 className="bc4-sectionHeading">Kandidat Beasiswa · {candidates.length}</h2><div className="bc4-sectionBody">
      <aside className="bc4-note"><div><h3>Pemeringkatan Kemiripan Teks</h3><p>{status(data.ranking.status)}</p>{data.ranking.reason && <p>{recommendationStatusLabel(data.ranking.reason)}</p>}</div></aside>
      {!candidates.length && <p className="bc4-empty">Tidak ada kandidat beasiswa untuk target jenjang ini pada respons BE.</p>}
      {candidates.map((candidate) => <article className="bc4-recommendation" key={candidate.id} data-preview-candidate={candidate.id}>
        <header className="bc4-recommendationHeader"><div><h3><GraduationCap size={22} aria-hidden="true" /> {candidate.name}</h3><p>{candidate.provider ?? "Penyelenggara belum tercatat"} · {known(candidate.level)}</p></div><div className="bc4-score"><span>Skor Kecocokan Kriteria</span><strong data-preview-score={candidate.id}>{candidate.score === null || candidate.complete !== true ? "Belum dapat dinilai" : `${candidate.score}/100`}</strong></div></header>
        <div className="bc4-recBody"><div><h4>Hasil Evaluasi BE</h4>{candidate.reason && <p>{candidate.reason}</p>}{candidate.preparations.length>0&&<ul>{candidate.preparations.map((item,index)=><li key={index}>{item}</li>)}</ul>}<p data-preview-eligibility={candidate.id}>{recommendationEligibility(candidate)}</p>{candidate.context && <p>{candidate.context}</p>}<div className="bc4-pair"><div className="bc4-yellowCard"><p>Periode Pendaftaran</p><strong>{known(candidate.period)}</strong>{(candidate.opens || candidate.closes) && <p>{candidate.opens ?? "Belum ditentukan"} – {candidate.closes ?? "Belum ditentukan"}</p>}</div><div className="bc4-yellowCard"><p>Durasi</p><strong>{candidate.duration === null ? "Belum tercatat" : `${candidate.duration} ${candidate.durationUnit ?? "(satuan belum tercatat)"}`}</strong></div></div><p data-preview-similarity={candidate.id}>Kemiripan teks: {candidate.ranking.similarity === null ? "Belum tersedia" : `${candidate.ranking.similarity}/1`}</p>{candidate.ranking.reason && <p>{recommendationStatusLabel(candidate.ranking.reason)}</p>}{candidate.ranking.rank !== null && <p>Urutan BE: {candidate.ranking.rank}</p>}</div>
          <div><h4>Evaluasi Kriteria Siswa</h4>{candidate.checklist.length ? candidate.checklist.map((item, index) => <div className="bc4-evaluation" key={index}><div><strong>{recommendationCriterionLabel(item.criterion)}</strong><p>Persyaratan: {item.operator ?? ""} {known(item.required)}</p><p>Status: {status(item.status)}</p></div></div>) : <p>Belum ada rincian kriteria yang dikirim BE.</p>}</div></div>
      </article>)}
      <aside className="bc4-note"><div><h3>{draft ? "Status: "+status(draft.status) : "Belum ada draft tersimpan"}</h3><p>Generate membuat draft dari data siswa dan katalog. Tinjau seluruh kriteria sebelum publikasi. Data yang belum diketahui perlu dilengkapi.</p>{message&&<p role="status">{message}</p>}</div><div className="bc4-actions"><button className="bc4-button" disabled={busy} onClick={()=>void save("generate")}>{busy?"Memproses…":draft?"Generate Ulang":"Generate Rekomendasi"}</button><button className="bc4-button bc4-primary" disabled={busy||!canPublish} onClick={()=>void save("review")}>Publikasikan Ke Siswa</button></div></aside>
    </div></section>}
  </>;
}
