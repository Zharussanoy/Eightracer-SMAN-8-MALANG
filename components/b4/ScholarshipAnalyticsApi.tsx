"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Landmark, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getSchoolScholarships } from "@/lib/b4-school-data";
import type { AnalyticsData } from "@/lib/b4-analytics";
import B4Shell from "./B4Shell";
import { AnalyticsBars, AnalyticsDistribution } from "./AnalyticsCharts";
import { displayTitle } from "@/lib/display-copy";

const known = (value: number | null) => value === null ? "Belum tercatat" : value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
const money = (value: number | null) => value === null ? "Belum tercatat" : `Rp${value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
function ScholarshipFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const dropdown = useRef<HTMLDetailsElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<{ key: string; rows?: { id: string; name: string }[]; error?: string }>();
  const [selected, setSelected] = useState<{ id: string; name: string }>();
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !dropdown.current?.contains(event.target) && dropdown.current) dropdown.current.open = false; };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && dropdown.current?.open) { dropdown.current.open = false; trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try { const page = await getSchoolScholarships({ search, signal: abort.signal }); if (!abort.signal.aborted) setResult({ key: search, rows: page.data }); }
      catch { if (!abort.signal.aborted) setResult({ key: search, error: "Pilihan beasiswa belum dapat dimuat." }); }
    }, 300);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [search]);
  const rows = result?.key === search ? result.rows ?? [] : [];
  const choices = selected && !rows.some((row) => row.id === selected.id) ? [selected, ...rows] : rows;
  const choose = (id: string) => {
    setSelected(choices.find((row) => String(row.id) === id)); onChange(id);
    if (dropdown.current) dropdown.current.open = false;
    trigger.current?.focus();
  };
  const selectedName = value ? choices.find((row) => String(row.id) === value)?.name : null;
  return <details className="bc4-scholarshipFilter" ref={dropdown} onToggle={(event) => { if (event.currentTarget.open) searchInput.current?.focus(); }}>
    <summary ref={trigger} aria-label="Filter Beasiswa"><span>{displayTitle(selectedName ?? "Beasiswa")}</span><ChevronDown size={17} aria-hidden="true" /></summary>
    <div className="bc4-scholarshipOptions"><label className="b4-searchField"><span className="b4-srOnly">Cari pilihan beasiswa</span><input ref={searchInput} type="search" placeholder="Cari nama beasiswa" maxLength={100} value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      <div className="bc4-scholarshipChoices" role="group" aria-label="Pilihan beasiswa"><button type="button" aria-pressed={!value} onClick={() => choose("")}>Semua Beasiswa</button>{choices.map((row) => <button key={row.id} type="button" aria-pressed={String(row.id) === value} onClick={() => choose(String(row.id))}>{displayTitle(row.name)}</button>)}</div>
      {result?.key !== search ? <p role="status">Memuat pilihan…</p> : result.error ? <p role="status">{result.error}</p> : !rows.length && <p role="status">Tidak ada beasiswa yang sesuai.</p>}
    </div>
  </details>;
}
export default function ScholarshipAnalyticsApi({view="analytics"}:{view?:"analytics"|"summary"}) {
  const summary=view==="summary";
  const { currentUser, refreshSession } = useUser();
  const router = useRouter();
  const [cohort, setCohort] = useState("");
  const [program, setProgram] = useState("");
  const [scholarship, setScholarship] = useState("");
  const [period, setPeriod] = useState("");
  const [retry, setRetry] = useState(0);
  const [more, setMore] = useState(false);
  const [mode, setMode] = useState("university");
  const [showAllTuition,setShowAllTuition]=useState(false);
  const pdfLock = useRef(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const query = new URLSearchParams();
  if (cohort) query.set("angkatan", cohort);
  if (program.trim()) query.set("prodi", program.trim());
  if (scholarship) query.set("beasiswa_id", scholarship);
  if (period.trim()) query.set("periode", period.trim());
  const search = query.toString();
  const key = `${search}:${retry}`;
  const [result, setResult] = useState<{ key: string; data?: AnalyticsData; error?: string }>();
  const invalidYear = !!cohort && !/^\d{4}$/.test(cohort);
  async function downloadPdf() {
    if (pdfLock.current || invalidYear) return;
    pdfLock.current = true; setPdfBusy(true); setPdfError("");
    try {
      const response = await fetch(`/api/b4/reports/alumni-pdf?${search}`, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/pdf, application/json" } });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        if (response.status === 401) { void refreshSession(); router.replace("/login"); }
        throw new Error(payload?.message ?? "PDF belum dapat diunduh.");
      }
      if (!response.headers.get("content-type")?.includes("application/pdf")) throw new Error("Respons belum berupa PDF.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = url; link.download = "eightracer-buku-alumni.pdf"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setPdfError(error instanceof Error ? error.message : "PDF belum dapat diunduh."); }
    finally { pdfLock.current = false; setPdfBusy(false); }
  }
  useEffect(() => {
    if (!currentUser.schoolStaff || invalidYear) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/b4/analytics?${search}`, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal: abort.signal });
        const payload = await response.json();
        if (abort.signal.aborted) return;
        if (response.status === 401) { void refreshSession(); router.replace("/login"); }
        if (!response.ok) throw new Error(payload.message ?? "Analitik belum dapat dimuat.");
        setResult({ key, data: payload });
      } catch (error) { if (!abort.signal.aborted) setResult({ key, error: error instanceof Error ? error.message : "Aplikasi belum dapat dihubungi." }); }
    }, 300);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [search, key, invalidYear, currentUser.schoolStaff, refreshSession, router]);
  const current = result?.key === key ? result : null;
  const data = current?.data;
  const modeRanges = mode === "university" ? data?.tuitionRanges?.university : data?.tuitionRanges?.program;
  const measuredRanges=(modeRanges??data?.ranges??[]).filter(item=>item.stats.minimum!==null&&item.stats.maximum!==null);
  const rangeMax=Math.max(1,...measuredRanges.map(item=>item.stats.maximum??0));
  const visibleRanges=showAllTuition?measuredRanges:measuredRanges.slice(0,5);
  return <B4Shell title={summary?"Ringkasan Pola Per-Angkatan":"Analitik Beasiswa"} active={summary?"summary":"analytics"} description="Lihat perjalanan pendidikan dan perkembangan kuliah alumni dari masa sekolah hingga kondisi terkini." dataNote="">
    {!currentUser.schoolStaff ? <p role="alert">Akun ini belum memiliki izin membaca analitik sekolah.</p> : <div className="b4-analyticsPage bc4-analyticsLive">
      <div className="b4-analyticsFilters" aria-label="Filter analitik beasiswa">
        <label className="b4-searchField"><span className="b4-srOnly">Angkatan</span><input placeholder="Angkatan" inputMode="numeric" maxLength={4} value={cohort} onChange={(e) => setCohort(e.target.value)} /></label>
        <label className="b4-searchField"><span className="b4-srOnly">Program Studi</span><input placeholder="Program Studi" maxLength={100} value={program} onChange={(e) => setProgram(e.target.value)} /></label>
        <ScholarshipFilter value={scholarship} onChange={setScholarship} />
        <label className="b4-searchField"><span className="b4-srOnly">Periode</span><input placeholder="Periode" maxLength={100} value={period} onChange={(e) => setPeriod(e.target.value)} /></label>
      </div>
      {search && <button className="b4-resetFilters" onClick={() => { setCohort(""); setProgram(""); setScholarship(""); setPeriod(""); }}>Reset Filter</button>}
      {invalidYear ? <p role="alert">Isi tahun angkatan dengan 4 digit.</p> : current?.error ? <div className="bc4-empty"><p role="alert">{current.error}</p><button className="bc4-button" onClick={() => setRetry((value) => value + 1)}>Coba Lagi</button></div> : !data ? <p role="status">Memuat analitik dari sekolah…</p> : <>
        {summary&&<section className="b4-analyticsStats" aria-label="Ringkasan alumni">
          <article><span>Total Alumni Terpantau</span><strong className={data.total === null ? "bc4-metricMissing" : undefined} data-analytics-metric="total">{data.total === null ? "Belum tersedia" : `${known(data.total)} Alumni`}</strong><small>Alumni yang tercatat dalam analitik</small></article>
          <article><span>Penerima Beasiswa &amp; Bantuan</span><strong className={data.recipients === null ? "bc4-metricMissing" : undefined} data-analytics-metric="recipients">{data.recipients === null ? "Belum tersedia" : `${known(data.recipients)} Alumni`}</strong><small>{data.recipients === null ? "Jumlah penerima belum tersedia" : "Termasuk KIP-K dan pembebasan biaya; setiap alumni dihitung sekali"}</small></article>
          <article><span>Penerima KIP-K</span><strong className={data.kipk === null ? "bc4-metricMissing" : undefined} data-analytics-metric="kipk">{data.kipk === null ? "Belum tersedia" : `${known(data.kipk)} Alumni`}</strong><small>KIP-K berdasarkan data yang tercatat</small></article>
        </section>}
        {!summary&&<><section className="b4-analyticsSection"><h2>Beasiswa &amp; KIP-K</h2><div className="b4-analyticsGrid">
          <article className="b4-analyticsCard"><h3>Penerima KIP-K / Angkatan</h3><AnalyticsBars label="Penerima KIP-K menurut angkatan" data={data.cohorts} /></article>
          <article className="b4-analyticsCard b4-scholarshipDistribution"><h3>Distribusi Beasiswa</h3><AnalyticsDistribution data={more ? data.distribution : data.distribution.slice(0, 5)} /><p className="b4-chartFootnote">Jumlah per program tidak dijumlahkan menjadi penerima unik.</p>{data.distribution.length > 5 && <button className="bc4-button" onClick={() => setMore(!more)}>{more ? "Lihat lebih sedikit" : "Lihat lainnya"}</button>}</article>
        </div></section>
        <section className="b4-analyticsSection"><header className="b4-analyticsSectionHeading"><h2>Rentang Uang Kuliah Tunggal</h2><div className="b4-analyticsToggle" role="group" aria-label="Kelompok data UKT"><button type="button" aria-pressed={mode==="university"} className={mode==="university"?"b4-toggleActive":""} onClick={()=>{setMode("university");setShowAllTuition(false);}}><Landmark size={15}/>Perguruan Tinggi</button><button type="button" aria-pressed={mode==="program"} className={mode==="program"?"b4-toggleActive":""} onClick={()=>{setMode("program");setShowAllTuition(false);}}><BookOpen size={15}/>Program Studi</button></div></header>
          <div className="b4-tuitionRows">{visibleRanges.map((item,index)=><article className="b4-tuitionRow" key={index}><div className="b4-tuitionIdentity"><strong>{displayTitle(mode==="university"?item.university:item.program)}</strong><span>{displayTitle(mode==="university"?item.program:item.university)} · {known(item.count)} catatan</span></div><div className="b4-tuitionRange"><div className="b4-tuitionMinMax"><span>Min: <strong>{money(item.stats.minimum)}</strong></span><span>Maks: <strong>{money(item.stats.maximum)}</strong></span></div><div className="b4-rangeTrack" role="img" aria-label={"Rentang UKT "+money(item.stats.minimum)+" hingga "+money(item.stats.maximum)}><span className="b4-rangeSelected" style={{left:((item.stats.minimum??0)/rangeMax*100)+"%",width:(((item.stats.maximum??0)-(item.stats.minimum??0))/rangeMax*100)+"%"}}/><i className="b4-rangeDot b4-rangeDotStart" style={{left:((item.stats.minimum??0)/rangeMax*100)+"%"}}/><i className="b4-rangeDot b4-rangeDotEnd" style={{left:((item.stats.maximum??0)/rangeMax*100)+"%"}}/></div><div className="b4-tuitionRangeLabels"><span>UKT terendah</span><small>Rentang {money((item.stats.maximum??0)-(item.stats.minimum??0))}</small><span>UKT tertinggi</span></div></div></article>)}{!visibleRanges.length&&<p className="bc4-empty">Belum ada nominal UKT yang tercatat.</p>}</div>
          {measuredRanges.length>5&&<div className="b4-tuitionMore"><button type="button" onClick={()=>setShowAllTuition(v=>!v)}>{showAllTuition?"Lihat lebih sedikit":"Lihat lainnya"}</button></div>}
          <div className="b4-tuitionMore"><button type="button" className="bc4-button" disabled={pdfBusy} onClick={()=>void downloadPdf()}>{pdfBusy?"Mengunduh…":"Ekspor PDF"}</button>{pdfError&&<p role="alert">{pdfError}</p>}</div>
        </section>
        <section className="b4-analyticsSection"><h2>IPK &amp; Keberlanjutan Beasiswa</h2><div className="b4-analyticsGrid"><article className="b4-analyticsCard"><h3>Distribusi IPK Alumni</h3>{data.ipkDistribution?.some(item=>(item.count??0)>0)?<AnalyticsBars label="Distribusi IPK alumni dari progres terbaru" data={data.ipkDistribution}/>:<p className="bc4-empty">Belum ada IPK yang tercatat.</p>}</article><article className="b4-analyticsCard"><h3>Keberlanjutan Beasiswa</h3><p className="bc4-empty">Belum ada data keberlanjutan beasiswa yang tercatat.</p></article></div></section>
        </>}
        {summary&&<section className="b4-analyticsSection"><h2>Pola Historis Mendapat Beasiswa</h2><div className="b4-historyStats">{data.periods.length ? data.periods.map((item, index) => <article key={index}><span>{displayTitle(item.label)}</span><strong>{known(item.count)} Alumni</strong><small>KIP-K: {known(item.kipk)} alumni</small>{item.scholarships.map((program, index) => <p key={index}>{displayTitle(program.label)}: {known(program.count)} alumni · Proses {known(program.processing)} · Diterima {known(program.accepted)} · Ditolak {known(program.rejected)}</p>)}</article>) : <p className="bc4-empty">Belum ada tren beasiswa per periode yang tercatat.</p>}</div></section>}
        <p className="b4-chartFootnote">Catatan progres: {known(data.measuredAlumni)} alumni. Data belum tercatat tidak dianggap nol. {data.notes?.join(" ")}{data.asOf && ` Data per ${data.asOf}.`}</p>
      </>}
    </div>}
  </B4Shell>;
}
