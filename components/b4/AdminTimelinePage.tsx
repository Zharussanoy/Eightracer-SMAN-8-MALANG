"use client";

import { scholarshipEvidenceLabel, kipEvidenceLabel } from "@/lib/b4-scholarship-evidence";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { ApiError } from "@/lib/eightracer-api";
import { getAlumniTimeline, getTimelineAlumniPage } from "@/lib/b4-alumni-api";
import type { AlumniFilters, AlumniPage } from "@/lib/b4-alumni";
import { acceptedAwards, timelineMoney, type AlumniTimelineDetail } from "@/lib/b4-timeline";
import { educationStatus } from "@/lib/b4-progress";
import B4Shell, { Avatar } from "./B4Shell";
import AlumniAcademicTimeline from "./AlumniAcademicTimeline";
import NumberPagination from "./NumberPagination";
import { displayTitle } from "@/lib/display-copy";

type PageResult = { key: string; data?: AlumniPage; error?: string };
type DetailResult = { id: number; data?: AlumniTimelineDetail; error?: string };

export default function AdminTimelinePage() {
  const { authStatus, currentUser, refreshSession } = useUser();
  const allowed = authStatus === "authenticated" && currentUser.schoolStaff === true;
  const [query, setQuery] = useState(""), [university, setUniversity] = useState(""), [program, setProgram] = useState(""), [admission, setAdmission] = useState("");
  const [page, setPage] = useState(1), [retry, setRetry] = useState(0);
  const [result, setResult] = useState<PageResult | null>(null), [detail, setDetail] = useState<DetailResult | null>(null);
  const [filters, setFilters] = useState<AlumniFilters>({ universities: [], studyPrograms: [], admissionPaths: [] });
  const key = JSON.stringify([query, university, program, admission, page, retry]);
  const current = allowed && result?.key === key ? result : null;
  const rows = current?.data?.data ?? [];
  const activeId = rows[0]?.id;
  const currentDetail = allowed && activeId === detail?.id ? detail : null;
  const alumni = currentDetail?.data;
  const hasFilters = Boolean(query || university || program || admission);
  const refresh = () => setRetry((value) => value + 1);

  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void getTimelineAlumniPage(query, university, program, admission, page, controller.signal).then((data) => {
        if (!controller.signal.aborted) { setResult({ key, data }); setFilters(data.filters); }
      }).catch((error) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) void refreshSession();
        setResult({ key, error: error instanceof Error ? error.message : "Timeline belum dapat dimuat." });
      });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [allowed, query, university, program, admission, page, key, refreshSession]);

  useEffect(() => {
    if (!allowed || !activeId) return;
    const controller = new AbortController();
    void getAlumniTimeline(activeId, controller.signal).then(({ data }) => {
      if (!controller.signal.aborted) setDetail({ id: activeId, data });
    }).catch((error) => {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) void refreshSession();
      setDetail({ id: activeId, error: error instanceof Error ? error.message : "Detail timeline belum dapat dimuat." });
    });
    return () => controller.abort();
  }, [allowed, activeId, retry, refreshSession]);

  function change(set: (value: string) => void, value: string) { set(value); setPage(1); }
  const latest = alumni?.progress[0];
  return <B4Shell title="Timeline Individu" active="timeline" description="Lihat perjalanan pendidikan dan perkembangan kuliah alumni dari masa sekolah hingga kondisi terkini.">
    <div className="bc4-filterRow">
      <label className="bc4-field"><span className="b4-srOnly">Cari alumni</span><input aria-label="Cari alumni" placeholder="Cari nama alumni" maxLength={100} list="bc4-timeline-alumni" value={query} onChange={(event) => change(setQuery, event.target.value)} /><datalist id="bc4-timeline-alumni">{[...new Set(rows.map((row) => row.name))].map((name) => <option key={name} value={name} />)}</datalist></label>
      {[
        { label: "Perguruan Tinggi", key: "university", value: university, set: setUniversity, options: filters.universities },
        { label: "Program Studi", key: "program", value: program, set: setProgram, options: filters.studyPrograms.map((item) => ({ value: item, label: item })) },
        { label: "Jalur Masuk", key: "admission", value: admission, set: setAdmission, options: filters.admissionPaths.map((item) => ({ value: item, label: item })) },
      ].map(({ label, key, value, set, options }) => <label className="bc4-field" key={key}><span className="b4-srOnly">{displayTitle(label)}</span><select aria-label={label} value={value} onChange={(event) => change(set, event.target.value)}><option value="">{displayTitle(label)}</option>{options.map((option) => <option key={option.value} value={option.value}>{displayTitle(option.label)}</option>)}</select></label>)}
    </div>
    {!allowed ? <div className="bc4-empty" role="status">{authStatus === "loading" ? "Memeriksa sesi akun…" : "Timeline sekolah hanya untuk admin atau Guru BK yang berwenang."}</div>
      : current?.error ? <div className="bc4-empty" role="alert">{current.error}<p><button className="bc4-button" type="button" onClick={refresh}>Coba Lagi</button></p></div>
      : !current?.data ? <div className="bc4-empty" role="status">Memuat data alumni…</div>
      : !rows.length ? <div className="bc4-empty" role="status"><strong>{hasFilters ? "Tidak ada alumni yang cocok dengan pencarian ini." : "Belum ada data alumni."}</strong>
        <p>Ubah pencarian atau lihat daftar Alumni di PT.</p>
        <Link className="bc4-button" href="/admin/alumni-perguruan-tinggi">Buka Alumni di PT</Link>
        {hasFilters && <button className="bc4-button" type="button" onClick={() => { setQuery(""); setUniversity(""); setProgram(""); setAdmission(""); setPage(1); }}>Reset Filter</button>}
      </div> : <>
        {currentDetail?.error ? <div className="bc4-empty" role="alert">{currentDetail.error}<p><button className="bc4-button" type="button" onClick={refresh}>Muat Ulang</button></p></div>
          : !alumni ? <div className="bc4-empty" role="status">Memuat riwayat alumni…</div> : <>
            <div className="bc4-profileRow"><div className="bc4-profile"><Avatar name={alumni.name} example={false} /><div><h2>{displayTitle(alumni.name)}</h2><p>{displayTitle(alumni.university)} · {displayTitle(alumni.studyProgram)}</p><p>NISN {alumni.hasNisn ? "••••••••••" : "-"}</p><p>{educationStatus(latest?.status ?? null)}</p></div></div>
              <div className="bc4-current"><h3>Status Terkini</h3><dl className="bc4-metrics">{[
                ["Semester", latest?.semester ?? "-"], ["IPK", latest?.gpa ?? "-"], ["Beasiswa", scholarshipEvidenceLabel(alumni.scholarshipEvidence)], ["Status KIP-K", kipEvidenceLabel(alumni.scholarshipEvidence)], ["UKT/Semester", timelineMoney(latest?.ukt ?? null)],
              ].map(([label, value]) => <div key={label}><dt>{displayTitle(label)}</dt><dd>{displayTitle(value ?? "-")}</dd></div>)}</dl></div></div>
            <AlumniAcademicTimeline key={alumni.id} alumni={alumni} />
            {current.data.lastPage>1&&<div className="bc4-timelinePagination"><NumberPagination current={page} last={current.data.lastPage} onChange={setPage}/></div>}
          </>}
      </>}
  </B4Shell>;
}
