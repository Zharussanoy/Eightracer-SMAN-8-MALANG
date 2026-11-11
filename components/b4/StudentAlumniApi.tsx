"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Building2, GraduationCap, UserRound } from "lucide-react";
import { useUser } from "@/context/UserContext";
import type { StudentAlumniDetail, StudentAlumniEvent, StudentAlumniPage } from "@/lib/b4-student-alumni";
import B4Shell from "./B4Shell";
import NumberPagination from "./NumberPagination";

const display = (value: string | number | null) => value === null ? "Belum tersedia" : String(value);
const money = (value: number | null) => value === null ? "Tidak ditampilkan atau belum tersedia" : `Rp${value.toLocaleString("id-ID")}`;
function ProfileIcon({ name }: { name: string }) { return <span className="bc4-avatar" aria-label={`Profil ${name}`}><UserRound size={48} aria-hidden="true" /></span>; }
function Frame({ children, detail = false, preview=false }: { children: ReactNode; detail?: boolean; preview?:boolean }) {
  return <B4Shell student active="alumni" showDemoProfile={false} dataNote={preview?"Pratinjau lokal data sekolah; izin publikasi belum diubah.":""} title="Jejak Alumni" description="Telusuri perjalanan pendidikan alumni dan temukan inspirasi dari pengalaman mereka." parent={detail ? { label: "Daftar Alumni", href: "/siswa/jejak-alumni" } : undefined}>{children}</B4Shell>;
}
function useAlumni<T>(path: string) {
  const { currentUser, authStatus, refreshSession } = useUser();
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: T; error?: string }>();
  const permitted = authStatus === "authenticated" && currentUser.role === "siswa";
  const key = `${path}:${retry}:${currentUser.id}:${authStatus}`;
  useEffect(() => {
    if (!permitted) return;
    const abort = new AbortController(); let running = false;
    async function load() {
      if (running || abort.signal.aborted) return;
      running = true;
      try {
        const response = await fetch(path, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal: abort.signal });
        const payload = await response.json();
        if (!response.ok) {
          if (response.status === 401) void refreshSession();
          throw new Error(payload.message ?? "Jejak Alumni belum dapat dimuat.");
        }
        if (!abort.signal.aborted) setResult({ key, data: payload });
      } catch (error) { if (!abort.signal.aborted) setResult({ key, error: error instanceof Error ? error.message : "Jejak Alumni belum dapat dihubungi." }); }
      finally { running = false; }
    }
    const visible = () => { if (document.visibilityState === "visible") void load(); };
    void load(); window.addEventListener("focus", visible); document.addEventListener("visibilitychange", visible);
    const timer = window.setInterval(visible, 20_000);
    return () => { abort.abort(); window.clearInterval(timer); window.removeEventListener("focus", visible); document.removeEventListener("visibilitychange", visible); };
  }, [path, key, permitted, refreshSession]);
  const current = result?.key === key ? result : null;
  return { data: current?.data, error: !permitted ? "Masuk dengan akun siswa untuk membaca Jejak Alumni." : current?.error, retry: () => setRetry((value) => value + 1) };
}
function Notice({ error, retry }: { error?: string; retry: () => void }) {
  return error ? <div className="bc4-empty"><p role="alert">{error}</p><button className="bc4-button" onClick={retry}>Coba lagi</button> <Link href="/login">Masuk</Link></div> : <p role="status">Memuat Jejak Alumni…</p>;
}
export default function StudentAlumniApi() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ university: "", program: "", admission: "" });
  const result = useAlumni<StudentAlumniPage>(`/api/b4/student-alumni?page=${page}`);
  const data = result.data;
  const rows = data?.data.filter((item) => item.name.toLocaleLowerCase("id-ID").includes(search.toLocaleLowerCase("id-ID")) && (Object.keys(filters) as (keyof typeof filters)[]).every((key) => !filters[key] || filters[key] === item[key])) ?? [];
  const changePage = (value: number) => { setPage(value); setSearch(""); setFilters({ university: "", program: "", admission: "" }); };
  return <Frame preview={data?.preview}><div className="bc4-studentAlumniLive">
    <div className="b4-filters"><label className="b4-searchField"><span className="b4-srOnly">Cari nama alumni pada halaman ini</span><input placeholder="Cari nama alumni" maxLength={100} value={search} onChange={(event) => setSearch(event.target.value)} /></label>{([['university', 'Perguruan Tinggi'], ['program', 'Program Studi'], ['admission', 'Jalur Masuk']] as const).map(([key, label]) => <label className="b4-selectField" key={key}><span className="b4-srOnly">{label}</span><select aria-label={label} value={filters[key]} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}><option value="">{label}</option>{[...new Set(data?.data.map((item) => item[key]).filter((value): value is string => !!value))].map((value) => <option key={value}>{value}</option>)}</select></label>)}</div>
    {data && data.lastPage > 1 && <p className="b4-chartFootnote">Pencarian dan filter berlaku pada halaman yang sedang dibuka.</p>}
    {!data ? <Notice error={result.error} retry={result.retry} /> : <>
      <h2 className="bc4-listTitle">Daftar Alumni</h2>
      {!rows.length ? <div className="bc4-empty">{data.total === 0 ? "Belum ada jejak alumni yang tersedia untuk siswa." : "Tidak ada alumni sesuai pencarian pada halaman ini."}</div> : <div className="bc4-grid3">{rows.map((alumni) => <article className="bc4-alumniCard" key={alumni.id}>
        <header><ProfileIcon name={alumni.name} /><div><h3>{alumni.name}</h3><p>Lulus SMA: {display(alumni.graduationYear)}</p></div></header>
        <div className="bc4-campus"><Building2 size={27} aria-hidden="true" /><div><p>{display(alumni.university)}</p><small>{display(alumni.program)}</small></div></div>
        <div className="bc4-cardTags">{alumni.admission && <span className="bc4-tag">{alumni.admission}</span>}{alumni.status && <span className="bc4-tag">{alumni.status}</span>}</div>
        <Link className="bc4-button" href={`/siswa/jejak-alumni/${alumni.id}`}>Lihat Jejak Alumni</Link>
      </article>)}</div>}
      <footer className="bc4-studentAlumniFooter"><span>Menampilkan {rows.length} dari {data.total} jejak alumni</span><NumberPagination current={data.currentPage} last={data.lastPage} onChange={changePage} /></footer>
    </>}
  </div></Frame>;
}
function Info({ rows }: { rows: [string, string | number | null][] }) {
  return <dl className="bc4-infoList">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{display(value)}</dd></div>)}</dl>;
}
export function StudentAlumniDetailApi({ id }: { id: string }) {
  const valid = /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));
  return valid ? <Detail key={id} id={id} /> : <Frame detail><div className="bc4-empty">Jejak alumni tidak ditemukan. <Link href="/siswa/jejak-alumni">Kembali ke daftar</Link></div></Frame>;
}
function Detail({ id }: { id: string }) {
  const result = useAlumni<StudentAlumniDetail>(`/api/b4/student-alumni/${id}`);
  const [tab, setTab] = useState("admission");
  const data = result.data;
  if (!data) return <Frame detail><Notice error={result.error} retry={result.retry} /></Frame>;
  const alumni = data.alumni;
  const semesters = data.events.flatMap((event) => event.semester === null ? [] : [event.semester]);
  return <Frame detail preview={data?.preview}><div className="bc4-studentAlumniLive">
    <div className="bc4-profileRow"><div className="bc4-profile"><ProfileIcon name={alumni.name} /><div><h2>{alumni.name}</h2><p>{display(alumni.university)} · {display(alumni.program)}</p>{alumni.admission && <span className="bc4-tag">{alumni.admission}</span>}</div></div><div className="bc4-current"><h3>Ringkasan Publikasi</h3><dl className="bc4-metrics">{[["Semester tercatat", semesters.length ? Math.max(...semesters) : null], ["Masuk PT", alumni.entryYear], ["Lulus SMA", alumni.graduationYear]].map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{display(value)}</dd></div>)}</dl></div></div>
    <div className="bc4-toggleRow" role="group" aria-label="Informasi alumni">{[["admission", "Data Masuk PT"], ["progress", "Progress Kuliah"]].map(([value, label]) => <button className={`bc4-button ${tab === value ? "bc4-primary" : ""}`} key={value} aria-pressed={tab === value} onClick={() => setTab(value)}>{label}</button>)}</div>
    {tab === "admission" ? <>
      <section className="bc4-section"><h2 className="bc4-sectionHeading">Informasi Detail Masuk Perguruan Tinggi</h2><div className="bc4-sectionBody bc4-grid2">
        <div className="bc4-panel"><h3 className="bc4-underlined">Detail Penerimaan &amp; Program Studi</h3><Info rows={[["Perguruan Tinggi", alumni.university], ["Jenis Perguruan Tinggi", data.universityType], ["Fakultas", data.faculty], ["Program Studi", alumni.program], ["Strata Pendidikan", data.degree], ["Jalur Seleksi Masuk", alumni.admission], ["Pilihan Jurusan", data.admissionChoice], ["Tahun Masuk", alumni.entryYear]]} /></div>
        <div className="bc4-panel"><h3 className="bc4-underlined">Indikator Seleksi &amp; Kelayakan Sekolah</h3><div className="bc4-campus"><div><small>Nilai Rapor Pendaftaran</small><h3>{display(data.admissionGrade)}</h3></div><div><small>Skor UTBK</small><h3>{display(data.utbk)}</h3></div></div><p className="b4-chartFootnote">Indikator lain belum tersedia pada data yang dipublikasikan.</p></div>
      </div></section>
      <section className="bc4-section"><h2 className="bc4-sectionHeading">Prestasi &amp; Portofolio Pendukung</h2><div className="bc4-sectionBody">{alumni.achievements.length ? <div className="bc4-grid3">{alumni.achievements.map((item, index) => <article className="bc4-yellowCard" key={index}>{item.level && <span className="bc4-tag">{item.level}</span>}<h3>{display(item.name ?? item.type)}</h3><p>{[item.rank, item.field, item.provider, item.year].filter(Boolean).join(" · ")}</p></article>)}</div> : <div className="bc4-empty">Belum ada prestasi pendukung yang dipublikasikan.</div>}</div></section>
    </> : <PublishedTimeline events={data.events} />}
  </div></Frame>;
}
function PublishedTimeline({ events }: { events: StudentAlumniEvent[] }) {
  const progress = events.filter((event) => event.semester !== null);
  const school = events.filter((event) => event.semester === null);
  const [selectedKey, setSelectedKey] = useState(progress[0]?.key ?? "");
  const selected = progress.find((event) => event.key === selectedKey);
  return <>
    <section className="bc4-section"><h2 className="bc4-sectionHeading">Perjalanan Pendidikan SMA</h2>{school.length ? <ol className="bc4-schoolTimeline">{school.map((event) => <li key={event.key}><span className="bc4-stageIcon"><GraduationCap size={39} aria-hidden="true" /></span><h3>{event.label}</h3><strong>{display(event.date ?? event.year)}</strong></li>)}</ol> : <div className="bc4-sectionBody bc4-empty">Belum ada riwayat sekolah yang dipublikasikan.</div>}</section>
    <section className="bc4-section"><h2 className="bc4-sectionHeading">Perjalanan Pendidikan Perguruan Tinggi</h2>{progress.length ? <div className="bc4-semesterScroll"><ol className="bc4-semesterTimeline">{progress.map((event) => <li key={event.key}><button className={event.key === selectedKey ? "bc4-semesterSelected" : ""} aria-pressed={event.key === selectedKey} aria-label={`Lihat semester ${event.semester}, ${event.period ?? event.label}`} onClick={() => setSelectedKey(event.key)}>S{event.semester}</button><h3>Semester {event.semester}</h3><p>{display(event.period)}</p><small>IPK: {display(event.ipk)}</small></li>)}</ol></div> : <div className="bc4-sectionBody bc4-empty">Belum ada progres kuliah yang dipublikasikan.</div>}</section>
    {selected && <section className="bc4-section"><h2 className="bc4-sectionHeading">Detail Semester {selected.semester}{selected.period && ` - ${selected.period}`}</h2><div className="bc4-sectionBody bc4-grid3">
      <div className="bc4-yellowCard"><h3>Capaian Akademik</h3><Info rows={[["IP Kumulatif", selected.ipk], ["Status Pendidikan", selected.status]]} /></div>
      <div className="bc4-yellowCard"><h3>Bantuan &amp; Beasiswa</h3><p>Penerima KIP-K: {selected.kipk === null ? "Belum tersedia" : selected.kipk ? "Ya" : "Tidak"}</p>{selected.scholarships.length ? selected.scholarships.map((program, index) => <p key={index}>{program.name} · {display(program.status)}</p>) : <p>Belum ada informasi beasiswa yang dipublikasikan.</p>}</div>
      <div className="bc4-yellowCard"><h3>Biaya Pendidikan</h3><Info rows={[["UKT", money(selected.ukt)], ["IPI", money(selected.ipi)]]} /></div>
    </div></section>}
  </>;
}
