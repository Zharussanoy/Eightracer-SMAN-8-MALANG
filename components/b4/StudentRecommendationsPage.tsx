"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import type { StudentRecommendation, StudentRecommendationPage } from "@/lib/b4-student-recommendations";
import FigmaIcon from "./FigmaIcon";
import B4Shell from "./B4Shell";
import NumberPagination from "./NumberPagination";

const display = (value: string | null) => value ?? "Belum tercatat";
function Frame({ children, detail = false }: { children: ReactNode; detail?: boolean }) {
  return <B4Shell student showDemoProfile={false} dataNote="" title={detail ? "Detail Rekomendasi Beasiswa" : "Rekomendasi Beasiswa"} description={detail ? "Pelajari informasi dan alasan kecocokan beasiswa yang direkomendasikan untukmu." : "Temukan peluang beasiswa yang sesuai dengan profil dan perjalanan akademikmu."} parent={detail ? { label: "Rekomendasi Beasiswa", href: "/siswa/rekomendasi-beasiswa" } : undefined}>{children}</B4Shell>;
}
function useRecommendations(page: number) {
  const { currentUser, authStatus, authMessage, refreshSession } = useUser();
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: StudentRecommendationPage; error?: string; status?: number }>();
  const permitted = authStatus === "authenticated" && currentUser.role === "siswa";
  const key = JSON.stringify([page, retry, currentUser.id, authStatus]);
  useEffect(() => {
    if (!permitted) return;
    const abort = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/b4/student-recommendations?page=${page}`, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal: abort.signal });
        const payload = await response.json().catch(() => null);
        if (abort.signal.aborted) return;
        if (!response.ok) {
          setResult({ key, error: payload?.message ?? "Rekomendasi belum dapat dimuat. Coba lagi nanti.", status: response.status });
          if (response.status === 401) void refreshSession();
          return;
        }
        if (!payload || !Array.isArray(payload.data)) throw new Error("Respons rekomendasi belum sesuai. Coba muat ulang.");
        setResult({ key, data: payload });
      } catch { if (!abort.signal.aborted) setResult({ key, error: "Layanan rekomendasi belum dapat dihubungi. Coba lagi nanti." }); }
    }
    void load();
    return () => abort.abort();
  }, [permitted, page, key, refreshSession]);
  const current = result?.key === key ? result : null;
  const error = authStatus === "loading" ? undefined : authStatus === "unavailable" ? authMessage || "Sesi belum dapat diperiksa." : !permitted ? "Masuk dengan akun siswa untuk melihat rekomendasi milikmu." : current?.error;
  return { data: permitted ? current?.data : undefined, error, loadingSession: authStatus === "loading", needLogin: authStatus === "anonymous" || current?.status === 401, retry: () => { if (authStatus === "unavailable") void refreshSession(); else setRetry(value => value + 1); } };
}
function Notice({ result }: { result: ReturnType<typeof useRecommendations> }) {
  return result.error ? <div className="bc4-empty"><p role="alert">{result.error}</p>{result.needLogin ? <Link className="bc4-button bc4-primary" href="/login">Masuk sebagai siswa</Link> : <button type="button" className="bc4-button" onClick={result.retry}>Coba lagi</button>}</div> : <p role="status">{result.loadingSession ? "Memeriksa sesi akun…" : "Memuat rekomendasi yang disetujui sekolah…"}</p>;
}
export default function StudentRecommendationsPage() {
  const params = useSearchParams();
  const initialPage = params.get("page") ?? "1";
  const [page, setPage] = useState(/^[1-9]\d*$/.test(initialPage) && Number.isSafeInteger(Number(initialPage)) ? Number(initialPage) : 1);
  const result = useRecommendations(page);
  const data = result.data;
  return <Frame>{!data ? <Notice result={result} /> : <>
    <div className="bc4-note"><FigmaIcon name="shield" size={28} /><div><strong>Hasil Rekomendasi Sekolah</strong><p>Hasil dibaca dari layanan rekomendasi milik akunmu. Status publikasi mengikuti data sekolah.</p></div></div>
    <h2 className="bc4-listTitle">Rekomendasi Beasiswa Untukmu</h2>
    <p className="bc4-scoreNote">Skor menunjukkan kecocokan kriteria, bukan persentase peluang lolos.</p>
    {data.groups.length ? <div className="bc4-grid3 bc4-resultCards">{data.groups.map(group => <article className="bc4-panel bc4-scholarCard" key={group.id}><h3><FigmaIcon name="scholarship" size={30} />Hasil Rekomendasi · {group.level}</h3><dl className="bc4-metrics"><div><dt>Status BE</dt><dd>Terpublikasi</dd></div><div><dt>Beasiswa</dt><dd>{group.scholarshipCount}</dd></div><div><dt>Skor</dt><dd>Belum tersedia</dd></div></dl><p className="bc4-reason">Hasil sudah terpublikasi, tetapi belum memuat rincian beasiswa. Skor dan evaluasi belum tersedia.</p><Link className="bc4-button" href={`/siswa/rekomendasi-beasiswa/${group.id}?page=${data.currentPage}`}>Lihat Detail Hasil</Link></article>)}</div> : data.data.length ? <div className="bc4-grid3 bc4-resultCards">{data.data.map(item => <RecommendationCard item={item} page={data.currentPage} key={item.id} />)}</div> : <div className="bc4-empty">Belum ada rekomendasi yang disetujui untuk akunmu. Rekomendasi akan muncul setelah ditinjau Admin/BK.</div>}
    <footer className="bc4-studentAlumniFooter"><p>Menampilkan {(data.groups.length || data.data.length) ? (data.currentPage - 1) * data.perPage + 1 : 0}–{(data.groups.length || data.data.length) ? (data.currentPage - 1) * data.perPage + (data.groups.length || data.data.length) : 0} dari {data.total} hasil rekomendasi</p><NumberPagination current={data.currentPage} last={data.lastPage} onChange={setPage} label="Halaman rekomendasi siswa" /></footer>
    <aside className="bc4-note"><FigmaIcon name="discover" size={36} /><div><strong>Masih Ingin Mencari Informasi Beasiswa?</strong><p>Tanyakan informasi dan persiapan beasiswa kepada asisten sekolah.</p></div><Link className="bc4-button bc4-primary" href="/siswa/rekomendasi-beasiswa/chat">Tanya Eightracer AI</Link></aside>
  </>}</Frame>;
}
function RecommendationCard({ item, page }: { item: StudentRecommendation; page: number }) {
  return <article className="bc4-panel bc4-scholarCard"><h3><FigmaIcon name="scholarship" size={30} />{item.name}</h3>
    <dl className="bc4-metrics"><div><dt>Jenjang</dt><dd>{display(item.level)}</dd></div><div><dt>Pendanaan</dt><dd>{display(item.funding)}</dd></div><div><dt>Periode</dt><dd>{display(item.period)}</dd></div></dl>
    <p className="bc4-reason">{item.reason ?? "Alasan kecocokan belum tersedia pada hasil ini."}</p>
    <Link className="bc4-button" href={`/siswa/rekomendasi-beasiswa/${item.id}?page=${page}`} aria-label={`Lihat detail rekomendasi ${item.name}`}>Lihat Detail Rekomendasi</Link>
  </article>;
}
export function StudentRecommendationDetail({ id }: { id: string }) {
  const params = useSearchParams();
  const page = params.get("page") ?? "1";
  const valid = /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id)) && /^[1-9]\d*$/.test(page) && Number.isSafeInteger(Number(page));
  return valid ? <Detail id={Number(id)} page={Number(page)} /> : <Frame detail><div className="bc4-empty">Tautan rekomendasi tidak valid. <Link href="/siswa/rekomendasi-beasiswa">Kembali ke rekomendasi</Link></div></Frame>;
}
function Detail({ id, page }: { id: number; page: number }) {
  const result = useRecommendations(page);
  const item = result.data?.data.find(item => item.id === id);
  const group = result.data?.groups.find(group => group.id === id);
  return <Frame detail><Link className="bc4-button bc4-backRecommendations" href={`/siswa/rekomendasi-beasiswa?page=${page}`}>Kembali ke rekomendasi</Link>
    {!result.data ? <Notice result={result} /> : group ? <section className="bc4-section"><h2 className="bc4-sectionHeading">Hasil Rekomendasi · {group.level}</h2><div className="bc4-sectionBody"><dl className="bc4-recommendationFacts"><div><dt>Status BE</dt><dd>Terpublikasi</dd></div><div><dt>Jumlah beasiswa</dt><dd>{group.scholarshipCount}</dd></div><div><dt>Skor kecocokan</dt><dd>Belum tersedia</dd></div></dl><p className="bc4-empty">Hasil ini sudah terpublikasi, tetapi daftar beasiswa dari server masih kosong. Belum ada skor, persyaratan, atau alasan kecocokan beasiswa yang dapat ditampilkan. Hubungi Admin/BK untuk memeriksa isi hasil rekomendasi.</p></div></section> : !item ? <div className="bc4-empty">Rekomendasi tidak tersedia pada halaman ini atau tidak lagi disetujui. Buka kembali daftar untuk memilih hasil terbaru.</div> : <div className="bc4-studentRecommendationDetail">
      <section className="bc4-recommendation"><header className="bc4-recommendationHeader"><div><h2>{item.name}</h2><p>{display(item.provider)}</p></div><div className="bc4-score"><span>Skor Kecocokan Kriteria</span><strong>{item.score === null ? "Belum tercatat" : `${item.score}/100`}</strong></div></header>
        <div className="bc4-recBody"><div><h3>Informasi Beasiswa</h3><dl className="bc4-recommendationFacts">{[["Periode Pendaftaran", item.period], ["Tipe Pendanaan", item.funding], ["Jenjang", item.level]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{display(value)}</dd></div>)}</dl></div>
          <div><h3>Evaluasi Kriteria Siswa</h3>{item.checklist.length ? item.checklist.map((entry, index) => <div className="bc4-evaluation" key={index}><div><strong>{entry.criterion}</strong>{entry.required !== null && <p>Persyaratan: {entry.required}</p>}<p>Status: {entry.status?.replaceAll("_", " ") ?? "Belum tercatat"}</p></div></div>) : <p>Rincian evaluasi belum tersedia pada rekomendasi ini.</p>}</div>
          <div><h3>Persiapan Pendaftaran</h3>{item.preparation.length ? <ul>{item.preparation.map((step, index) => <li key={index}>{step}</li>)}</ul> : <p>Belum ada catatan persiapan pada rekomendasi ini.</p>}</div>
        </div>
      </section>
      <aside className="bc4-note"><div><h2>Alasan Kecocokan</h2><p>{item.reason ?? "Alasan kecocokan belum tersedia."}</p><p>Skor ini bukan persentase peluang lolos.</p></div></aside>
      <aside className="bc4-aiCta"><h2>Masih ada yang ingin kamu ketahui?</h2>{item.scholarshipId !== null ? <Link className="bc4-button" href={`/siswa/rekomendasi-beasiswa/chat?beasiswa=${item.scholarshipId}${item.level === "SMA" || item.level === "Kuliah" ? `&target_jenjang=${item.level}` : ""}`}>Tanya tentang beasiswa ini</Link> : <><p>Konteks program belum tersedia pada hasil ini. Kamu tetap dapat bertanya secara umum.</p><Link className="bc4-button" href="/siswa/rekomendasi-beasiswa/chat">Tanya informasi beasiswa</Link></>}</aside>
    </div>}
  </Frame>;
}
