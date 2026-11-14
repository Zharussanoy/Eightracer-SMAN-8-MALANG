"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import type { AlumniProfile, AlumniPage, AlumniTimeline } from "@/lib/b4-alumni-legacy";
import B4Shell from "./B4Shell";
import NumberPagination from "./NumberPagination";
import FigmaIcon from "./FigmaIcon";
import AdminTimelineView from "./AdminTimelineView";
import AdminAlumniInformationView from "./AdminAlumniInformationView";

function useAlumniRead<T>(path: string | null) {
  const { refreshSession } = useUser();
  const router = useRouter();
  const [retry, setRetry] = useState(0);
  const key = `${path}:${retry}`;
  const [result, setResult] = useState<{ key: string; data?: T; error?: string }>();
  useEffect(() => {
    if (!path) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(path, { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store", signal: abort.signal });
        const payload = await response.json();
        if (abort.signal.aborted) return;
        if (response.status === 401) { void refreshSession(); router.replace("/login"); }
        if (!response.ok) throw new Error(payload.message ?? "Data alumni belum dapat dimuat.");
        setResult({ key, data: payload });
      } catch (error) {
        if (!abort.signal.aborted) setResult({ key, error: error instanceof Error ? error.message : "Aplikasi belum dapat dihubungi." });
      }
    }, 300);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [path, key, refreshSession, router]);
  return { ...(result?.key === key ? result : {}), retry: () => setRetry((value) => value + 1) };
}

export default function AdminAlumniApi({ timeline = false, studentId, detail = false }: { timeline?: boolean; studentId?: string; detail?: boolean }) {
  return <Suspense fallback={<p role="status">Memuat halaman alumni…</p>}><Page timeline={timeline} studentId={studentId} detail={detail} /></Suspense>;
}
function Page({ timeline, studentId, detail }: { timeline: boolean; studentId?: string; detail: boolean }) {
  const { currentUser } = useUser();
  const params = useSearchParams();
  const id = studentId ?? params.get("id");
  return <B4Shell title={detail ? "Informasi Detail Alumni" : timeline ? "Timeline Individu" : "Alumni di Perguruan Tinggi"} active={detail ? "alumni" : timeline ? "timeline" : "alumni"}
    description="Lihat data penerimaan dan riwayat pendidikan alumni yang tercatat di sekolah." dataNote="">
    {!currentUser.schoolStaff ? <p role="alert">Akun ini belum memiliki izin membaca data alumni admin.</p>
      : timeline && id ? <Timeline key={`${id}:${params.get("penerimaan_id")}`} id={id} admissionId={params.get("penerimaan_id")} detail={detail} /> : <Directory timeline={timeline} />}
  </B4Shell>;
}
function Directory({ timeline }: { timeline: boolean }) {
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("");
  const [admission, setAdmission] = useState("");
  const [cohort, setCohort] = useState("");
  const [university, setUniversity] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const query = new URLSearchParams({ page: String(page) });
  if (search.trim()) query.set("search", search.trim());
  if (program.trim()) query.set("program_studi", program.trim());
  if (admission) query.set("jalur_masuk", admission);
  if (cohort) query.set("angkatan", cohort);
  if (university) query.set("perguruan_tinggi_id", university);
  const result = useAlumniRead<AlumniPage>(`/api/b4/alumni?${query}`);
  const data = result.data;
  const change = (set: (value: string) => void, value: string) => { set(value); setPage(1); };
  return <>
    <div className="bc4-filterRow">
      <label className="bc4-field bc4-fieldSearch"><FigmaIcon name="search" size={18} /><span className="b4-srOnly">Cari nama alumni</span><input type="search" placeholder="Cari nama alumni" maxLength={100} value={search} onChange={(e) => change(setSearch, e.target.value)} /></label>
      <label className="bc4-field"><span className="b4-srOnly">Perguruan Tinggi</span><select aria-label="Perguruan Tinggi" value={university} onChange={(e) => change(setUniversity, e.target.value)}><option value="">Perguruan Tinggi</option>{university && !data?.data.some((row) => String(row.universityId) === university) && <option value={university}>Perguruan Tinggi terpilih</option>}{[...new Map(data?.data.filter((row) => row.universityId !== null && row.universityId !== undefined).map((row) => [row.universityId, row.university])).entries()].map(([id, name]) => <option key={id} value={String(id)}>{name ?? "Nama PT belum tercatat"}</option>)}</select></label>
      <label className="bc4-field"><span className="b4-srOnly">Program Studi</span><input placeholder="Program Studi" maxLength={100} value={program} onChange={(e) => change(setProgram, e.target.value)} /></label>
      <label className="bc4-field"><span className="b4-srOnly">Jalur Masuk</span><select value={admission} onChange={(e) => change(setAdmission, e.target.value)}><option value="">Semua Jalur Masuk</option>{["SNBP", "SNBT", "Mandiri"].map((value) => <option key={value}>{value}</option>)}</select></label>

    </div>
    {!timeline && <details className="bc4-extraInformation bc4-cohortFilter"><summary>Filter angkatan</summary><label className="bc4-field">Angkatan (tahun lulus)<input placeholder="Contoh: 2025" inputMode="numeric" maxLength={4} value={cohort} onChange={e => change(setCohort, e.target.value)} /></label></details>}
    {(search || program || admission || cohort || university) && <button className="b4-resetFilters" onClick={() => { setSearch(""); setProgram(""); setAdmission(""); setCohort(""); setUniversity(""); setPage(1); }}>Reset pencarian dan filter</button>}
    {result.error ? <div className="bc4-empty"><p role="alert">{result.error}</p><button className="bc4-button" onClick={result.retry}>Coba lagi</button></div>
      : !data ? <p role="status">Memuat daftar alumni dari sekolah…</p> : timeline && data.data.length ? <>
        <label className="bc4-field">Pilih alumni<select value={data.data.find((row) => row.id === selectedId)?.id ?? data.data[0].id} onChange={(e) => setSelectedId(Number(e.target.value))}>{data.data.map((row) => <option key={row.id} value={row.id}>{row.name} · {row.university ?? "PT belum tercatat"} · {row.program ?? "Prodi belum tercatat"}</option>)}</select></label>
        <Timeline key={(data.data.find((row) => row.id === selectedId) ?? data.data[0]).id} id={String((data.data.find((row) => row.id === selectedId) ?? data.data[0]).studentId)} profile={data.data.find((row) => row.id === selectedId) ?? data.data[0]} />
        <div className="bc4-timelinePagination"><NumberPagination current={data.currentPage} last={data.lastPage} onChange={setPage} /></div>
      </> : <div className="b4-tableFrame">
        <div className="b4-tableScroll" role="region" aria-label="Daftar alumni" tabIndex={0}><table className="b4-table">
          <thead><tr><th>Nama Alumni</th><th>Perguruan Tinggi</th><th>Program Studi</th><th>Jalur Masuk</th><th>Status Penerimaan</th><th><span className="b4-srOnly">Aksi</span></th></tr></thead>
          <tbody>{data.data.map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.university ?? "Belum tercatat"}</td><td>{row.program ?? "Belum tercatat"}</td><td>{row.admission ?? "Belum tercatat"}</td><td>{row.status ?? "Belum tercatat"}</td><td><Link className="b4-detailButton" aria-label={`Lihat detail ${row.name}`} href={`/admin/alumni-perguruan-tinggi/informasi-detail?id=${row.id}`}>Lihat Detail</Link></td></tr>)}
            {!data.data.length && <tr><td colSpan={6}>Tidak ada alumni yang sesuai dengan pencarian dan filter.</td></tr>}</tbody>
        </table></div>
        <div className="b4-tableFooter"><p>Menampilkan {data.data.length ? (data.currentPage - 1) * data.perPage + 1 : 0}–{data.data.length ? (data.currentPage - 1) * data.perPage + data.data.length : 0} dari {data.total} penerimaan PT</p><NumberPagination current={data.currentPage} last={data.lastPage} onChange={setPage} /></div>
      </div>}
  </>;
}
function Timeline({ id, profile, admissionId, detail = false }: { id: string; profile?: AlumniProfile; admissionId?: string | null; detail?: boolean }) {
  const valid = /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));
  const result = useAlumniRead<AlumniTimeline>(valid ? `/api/b4/alumni/${id}/timeline` : null);
  const identity = useAlumniRead<AlumniProfile>(valid && !profile ? `/api/b4/alumni/${id}/profile${admissionId ? `?penerimaan_id=${encodeURIComponent(admissionId)}` : ""}` : null);
  const resolved = profile ?? identity.data;
  return <>
    {!profile && <Link className="bc4-button" href={detail ? "/admin/alumni-perguruan-tinggi" : "/admin/timeline-individu"}>Kembali ke daftar alumni</Link>}
    {identity.error && <p role="alert">Profil belum dapat dimuat: {identity.error} <button className="bc4-button" onClick={identity.retry}>Coba lagi</button></p>}
    {detail && !admissionId && <p className="b4-chartFootnote">Buka kembali melalui Lihat Detail di daftar alumni untuk memuat kampus dan program studi penerimaan yang dipilih.</p>}
    {!valid ? <p role="alert">ID alumni tidak valid. Pilih melalui daftar alumni.</p>
      : result.error ? <div className="bc4-empty"><p role="alert">{result.error}</p><button className="bc4-button" onClick={result.retry}>Coba lagi</button></div>
        : !result.data || (!profile && !identity.data && !identity.error) ? <p role="status">Memuat profil dan riwayat alumni…</p> : detail ? <AdminAlumniInformationView data={result.data} profile={resolved} /> : <AdminTimelineView data={result.data} profile={resolved} />}
  </>;
}
