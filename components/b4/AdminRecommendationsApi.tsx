"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, RefreshCw } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { recommendationEligibility, type RecommendationPreview } from "@/lib/b4-recommendations";
import type { RecommendationStudent } from "@/lib/b4-students";
import RecommendationStudentPicker from "./RecommendationStudentPicker";
import B4Shell from "./B4Shell";

const known = (value: string | number | null) => value ?? "Belum tersedia";
const status = (value: string | null) => value ? value.replaceAll("_", " ") : "Belum tersedia";
export default function AdminRecommendationsApi() {
  const { currentUser } = useUser();
  const [student, setStudent] = useState<RecommendationStudent | null>(null);
  return <B4Shell title="Rekomendasi Beasiswa" description="Pelajari pratinjau kecocokan beasiswa berdasarkan data siswa yang tersedia." dataNote="">
    {!currentUser.schoolStaff ? <p role="alert">Akun ini belum memiliki izin membaca pratinjau siswa.</p> : <>
      <aside className="bc4-note"><div><h3>Pratinjau baca saja</h3><p>Pemeriksaan ini tidak membuat draft atau memublikasikan rekomendasi. Skor kecocokan dan kemiripan teks bukan persentase peluang lolos.</p></div></aside>
      <div hidden={!!student}><RecommendationStudentPicker onSelect={setStudent} /></div>
      {student && <><div className="bc4-recommendationSelection"><p>Siswa yang dipilih</p><button type="button" className="bc4-button" onClick={() => setStudent(null)}>Ganti siswa</button></div><div className="bc4-profileRow"><div className="bc4-profile"><div><h2>{student.name}</h2><p>Angkatan {student.cohort ?? "belum tercatat"}</p></div></div><div className="bc4-current"><h3>Status Rekomendasi</h3><p>Pratinjau kecocokan</p><p>Status publikasi belum diperiksa</p></div></div><Preview key={student.id} studentId={student.id} /></>}
    </>}
  </B4Shell>;
}
function Preview({ studentId }: { studentId: number }) {
  const { refreshSession } = useUser();
  const router = useRouter();
  const [level, setLevel] = useState("SMA");
  const [retry, setRetry] = useState(0);
  const key = `${studentId}:${level}:${retry}`;
  const [result, setResult] = useState<{ key: string; data?: RecommendationPreview; error?: string }>();
  useEffect(() => {
    const abort = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/b4/recommendations/${studentId}/preview?target_jenjang=${level}`, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal: abort.signal });
        const payload = await response.json();
        if (abort.signal.aborted) return;
        if (response.status === 401) { void refreshSession(); router.replace("/login"); }
        if (!response.ok) throw new Error(payload.message ?? "Pratinjau belum dapat dimuat.");
        setResult({ key, data: payload });
      } catch (error) { if (!abort.signal.aborted) setResult({ key, error: error instanceof Error ? error.message : "Aplikasi belum dapat dihubungi." }); }
    }
    void load();
    return () => abort.abort();
  }, [studentId, level, key, refreshSession, router]);
  const current = result?.key === key ? result : null;
  const data = current?.data;
  return <>
    <div className="bc4-toggleRow"><label className="bc4-field">Target Jenjang<select value={level} onChange={(e) => setLevel(e.target.value)}><option>SMA</option><option>Kuliah</option></select></label><button type="button" className="bc4-button" disabled={!current} aria-busy={!current} onClick={() => setRetry((value) => value + 1)}><RefreshCw size={16} aria-hidden="true" />{!current ? "Memuat pratinjau…" : "Muat ulang pratinjau"}</button></div>
    {current?.error ? <div className="bc4-empty"><p role="alert">{current.error}</p><button type="button" className="bc4-button" onClick={() => setRetry((value) => value + 1)}>Coba lagi</button></div> : !data ? <p role="status">Memuat pratinjau dari BE…</p> : <section className="bc4-section"><h2 className="bc4-sectionHeading">Hasil Pratinjau Rekomendasi Beasiswa<span className="bc4-badge">{data.candidates.length} Kandidat</span></h2><div className="bc4-sectionBody">
      <details className="bc4-rankingDetails"><summary>Informasi pemeringkatan kemiripan teks</summary><p>{status(data.ranking.status)}</p>{data.ranking.reason && <p>{data.ranking.reason}</p>}</details>
      {!data.candidates.length && <p className="bc4-empty">Tidak ada kandidat beasiswa untuk target jenjang ini pada respons BE.</p>}
      {data.candidates.map((candidate) => <article className="bc4-recommendation" key={candidate.id} data-preview-candidate={candidate.id}>
        <header className="bc4-recommendationHeader"><div><h3><GraduationCap size={22} aria-hidden="true" /> {candidate.name}</h3><p>{candidate.provider ?? "Penyelenggara belum tercatat"} · {known(candidate.level)}</p></div><div className="bc4-score"><span>Skor Kecocokan Kriteria</span><strong data-preview-score={candidate.id}>{candidate.score === null ? "Belum tersedia" : `${candidate.score}/100`}</strong></div></header>
        <div className="bc4-recBody"><div><h4>Hasil Evaluasi BE</h4><p data-preview-eligibility={candidate.id}>{recommendationEligibility(candidate)}</p>{candidate.context && <p>{candidate.context}</p>}<div className="bc4-pair"><div className="bc4-yellowCard"><p>Periode Pendaftaran</p><strong>{known(candidate.period)}</strong>{(candidate.opens || candidate.closes) && <p>{candidate.opens ?? "Belum ditentukan"} – {candidate.closes ?? "Belum ditentukan"}</p>}</div><div className="bc4-yellowCard"><p>Durasi</p><strong>{candidate.duration === null ? "Belum tercatat" : `${candidate.duration} ${candidate.durationUnit ?? "(satuan belum tercatat)"}`}</strong></div></div><p data-preview-similarity={candidate.id}>Kemiripan teks: {candidate.ranking.similarity === null ? "Belum tersedia" : `${candidate.ranking.similarity}/1`}</p>{candidate.ranking.reason && <p>{candidate.ranking.reason}</p>}{candidate.ranking.rank !== null && <p>Urutan BE: {candidate.ranking.rank}</p>}</div>
          <div><h4>Evaluasi Kriteria Siswa</h4>{candidate.checklist.length ? candidate.checklist.map((item, index) => <div className="bc4-evaluation" key={index}><div><strong>{item.criterion}</strong><p>Persyaratan: {item.operator ?? ""} {known(item.required)}</p><p>Status: {status(item.status)}</p></div></div>) : <p>Belum ada rincian kriteria yang dikirim BE.</p>}</div></div>
        <footer className="bc4-recFooter"><span>Pratinjau · belum menjadi rekomendasi tersimpan</span><div className="bc4-actions" aria-describedby="bc4-recommendation-readonly"><button type="button" className="bc4-button" disabled>Sembunyikan</button><button type="button" className="bc4-button bc4-primary" disabled>Edit</button><button type="button" className="bc4-button bc4-danger" disabled>Hapus</button></div></footer>
      </article>)}
      <aside className="bc4-note" id="bc4-recommendation-readonly"><div><h3>Mode baca saja</h3><p>Edit, sembunyikan, hapus, generate, dan publikasi belum diaktifkan pada pemeriksaan ini. Hasil ini belum tampil kepada siswa; publikasi tetap memerlukan persetujuan Admin/BK.</p></div><div className="bc4-actions"><button type="button" className="bc4-button" disabled>Generate Rekomendasi</button><button type="button" className="bc4-button bc4-primary" disabled>Publikasikan Ke Siswa</button></div></aside>
    </div></section>}
  </>;
}
