"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import type { AlumniPage, AlumniTimeline } from "@/lib/b4-alumni";
import B4Shell from "./B4Shell";
import NumberPagination from "./NumberPagination";

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

export default function AdminAlumniApi({ timeline = false, studentId }: { timeline?: boolean; studentId?: string }) {
  return <Suspense fallback={<p role="status">Memuat halaman alumni…</p>}><Page timeline={timeline} studentId={studentId} /></Suspense>;
}
function Page({ timeline, studentId }: { timeline: boolean; studentId?: string }) {
  const { currentUser } = useUser();
  const params = useSearchParams();
  const id = studentId ?? params.get("id");
  return <B4Shell title={timeline ? "Timeline Individu" : "Alumni di Perguruan Tinggi"} active={timeline ? "timeline" : "alumni"}
    description="Lihat data penerimaan dan riwayat pendidikan alumni yang tercatat di sekolah." dataNote="">
    {!currentUser.schoolStaff ? <p role="alert">Akun ini belum memiliki izin membaca data alumni admin.</p>
      : timeline && id ? <Timeline key={id} id={id} /> : <Directory timeline={timeline} />}
  </B4Shell>;
}
function Directory({ timeline }: { timeline: boolean }) {
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("");
  const [admission, setAdmission] = useState("");
  const [cohort, setCohort] = useState("");
  const [page, setPage] = useState(1);
  const query = new URLSearchParams({ page: String(page) });
  if (search.trim()) query.set("search", search.trim());
  if (program.trim()) query.set("program_studi", program.trim());
  if (admission) query.set("jalur_masuk", admission);
  if (cohort) query.set("angkatan", cohort);
  const result = useAlumniRead<AlumniPage>(`/api/b4/alumni?${query}`);
  const data = result.data;
  const change = (set: (value: string) => void, value: string) => { set(value); setPage(1); };
  return <>
    {timeline && <p>Pilih alumni untuk membuka riwayat pendidikannya.</p>}
    <div className="bc4-filterRow">
      <label className="bc4-field"><span className="b4-srOnly">Cari nama alumni</span><input type="search" placeholder="Cari nama alumni" maxLength={100} value={search} onChange={(e) => change(setSearch, e.target.value)} /></label>
      <label className="bc4-field"><span className="b4-srOnly">Program Studi</span><input placeholder="Program Studi" maxLength={100} value={program} onChange={(e) => change(setProgram, e.target.value)} /></label>
      <label className="bc4-field"><span className="b4-srOnly">Jalur Masuk</span><select value={admission} onChange={(e) => change(setAdmission, e.target.value)}><option value="">Semua Jalur Masuk</option>{["SNBP", "SNBT", "Mandiri"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="bc4-field"><span className="b4-srOnly">Angkatan</span><input placeholder="Angkatan (tahun lulus)" inputMode="numeric" maxLength={4} value={cohort} onChange={(e) => change(setCohort, e.target.value)} /></label>
    </div>
    {(search || program || admission || cohort) && <button className="b4-resetFilters" onClick={() => { setSearch(""); setProgram(""); setAdmission(""); setCohort(""); setPage(1); }}>Reset pencarian dan filter</button>}
    {result.error ? <div className="bc4-empty"><p role="alert">{result.error}</p><button className="bc4-button" onClick={result.retry}>Coba lagi</button></div>
      : !data ? <p role="status">Memuat daftar alumni dari sekolah…</p> : <div className="b4-tableFrame">
        <div className="b4-tableScroll" role="region" aria-label="Daftar alumni" tabIndex={0}><table className="b4-table">
          <thead><tr><th>Nama Alumni</th><th>Perguruan Tinggi</th><th>Program Studi</th><th>Jalur Masuk</th><th>Status Penerimaan</th><th>Aksi</th></tr></thead>
          <tbody>{data.data.map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.university ?? "Belum tercatat"}</td><td>{row.program ?? "Belum tercatat"}</td><td>{row.admission ?? "Belum tercatat"}</td><td>{row.status ?? "Belum tercatat"}</td><td><Link className="bc4-button" href={`/admin/timeline-individu?id=${row.studentId}`}>Lihat Timeline</Link></td></tr>)}
            {!data.data.length && <tr><td colSpan={6}>Tidak ada alumni yang sesuai dengan pencarian dan filter.</td></tr>}</tbody>
        </table></div>
        <div className="b4-tableFooter"><p>Menampilkan {data.data.length ? (data.currentPage - 1) * data.perPage + 1 : 0}–{data.data.length ? (data.currentPage - 1) * data.perPage + data.data.length : 0} dari {data.total} penerimaan PT</p><NumberPagination current={data.currentPage} last={data.lastPage} onChange={setPage} /></div>
      </div>}
  </>;
}
function Timeline({ id }: { id: string }) {
  const valid = /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));
  const result = useAlumniRead<AlumniTimeline>(valid ? `/api/b4/alumni/${id}/timeline` : null);
  const [selected, setSelected] = useState<string | null>(null);
  const data = result.data;
  const event = data?.events.find((item) => item.id === selected) ?? data?.events[0];
  const known = (value: string | number | null | undefined) => value ?? "Belum tercatat";
  const money = (value: number | null) => value === null ? "Belum tercatat" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  return <>
    <Link className="bc4-button" href="/admin/timeline-individu">Pilih alumni lain</Link>
    {!valid ? <p role="alert">ID alumni tidak valid. Pilih melalui daftar alumni.</p>
      : result.error ? <div className="bc4-empty"><p role="alert">{result.error}</p><button className="bc4-button" onClick={result.retry}>Coba lagi</button></div>
        : !data ? <p role="status">Memuat timeline alumni…</p> : <>
          <h2 className="bc4-listTitle">{data.name ?? "Riwayat Alumni"}</h2>
          {!data.events.length ? <p className="bc4-empty">Belum ada riwayat pendidikan yang dikirim BE untuk alumni ini.</p> : <>
            <section className="bc4-section"><h2 className="bc4-sectionHeading">Perjalanan Pendidikan</h2><div className="bc4-sectionBody"><ol className="bc4-fields">{data.events.map((item) => <li key={item.id}><button className={`bc4-button ${event?.id === item.id ? "bc4-primary" : ""}`} aria-pressed={event?.id === item.id} onClick={() => setSelected(item.id)}>{item.semester ? `Semester ${item.semester}` : item.kind.replaceAll("_", " ")} · {item.period ?? item.date ?? item.year ?? "Waktu belum tercatat"}{item.current === false ? " · Revisi terdahulu" : ""}</button></li>)}</ol></div></section>
            {event && <section className="bc4-section"><h2 className="bc4-sectionHeading">Detail Riwayat {event.semester ? `Semester ${event.semester}` : ""}</h2><div className="bc4-sectionBody bc4-grid3">
              <div className="bc4-yellowCard"><h3>Pendidikan</h3><dl className="bc4-infoList"><dt>Perguruan Tinggi</dt><dd>{known(event.university)}</dd><dt>Program Studi</dt><dd>{known(event.program)}</dd><dt>Status</dt><dd>{known(event.status)}</dd><dt>IP Kumulatif</dt><dd>{known(event.ipk)}</dd></dl></div>
              <div className="bc4-yellowCard"><h3>Bantuan & Beasiswa</h3><p>Penerima KIP-K: {event.kipk === null ? "Belum tercatat" : event.kipk ? "Ya" : "Tidak"}</p>{event.scholarships.length ? event.scholarships.map((item, index) => <p key={index}>{item.name} · {known(item.status)}</p>) : <p>Belum ada rincian beasiswa yang dikirim BE.</p>}</div>
              <div className="bc4-yellowCard"><h3>Biaya Pendidikan</h3><dl className="bc4-infoList"><dt>UKT</dt><dd>{money(event.ukt)}</dd><dt>IPI</dt><dd>{money(event.ipi)}</dd></dl></div>
            </div></section>}
          </>}
        </>}
  </>;
}
