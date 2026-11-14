"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import type { AnalyticsData, AnalyticStats } from "@/lib/b4-analytics";
import B4Shell from "./B4Shell";
import { AnalyticsBars, AnalyticsDistribution } from "./AnalyticsCharts";

const known = (value: number | null) => value === null ? "Belum tercatat" : value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
const money = (value: number | null) => value === null ? "Belum tercatat" : `Rp${value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
function Stats({ value, currency = false, metric }: { value: AnalyticStats; currency?: boolean; metric?: string }) {
  const format = currency ? money : known;
  return <dl className="bc4-infoList"><dt>Data diketahui</dt><dd data-analytics-stat={metric && `${metric}.known`}>{known(value.known)}</dd><dt>Belum tercatat</dt><dd data-analytics-stat={metric && `${metric}.unknown`}>{known(value.unknown)}</dd><dt>Minimum</dt><dd data-analytics-stat={metric && `${metric}.minimum`}>{format(value.minimum)}</dd><dt>Maksimum</dt><dd data-analytics-stat={metric && `${metric}.maximum`}>{format(value.maximum)}</dd><dt>Rata-rata</dt><dd data-analytics-stat={metric && `${metric}.mean`}>{format(value.mean)}</dd></dl>;
}
function ScholarshipFilter({ value, options, onChange }: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const dropdown = useRef<HTMLDetailsElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ value: string; label: string }>();
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && dropdown.current && !dropdown.current.contains(event.target)) dropdown.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dropdown.current?.open) {
        dropdown.current.open = false;
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const choices = options.filter(option => option.label.toLocaleLowerCase("id-ID").includes(search.toLocaleLowerCase("id-ID")));
  const selectedName = options.find(option => option.value === value)?.label ?? (selected?.value === value ? selected.label : null);
  const choose = (next: string) => {
    setSelected(options.find(option => option.value === next));
    onChange(next);
    if (dropdown.current) dropdown.current.open = false;
    trigger.current?.focus();
  };
  return <details className="bc4-scholarshipFilter" ref={dropdown} onToggle={event => { if (event.currentTarget.open) searchInput.current?.focus(); }}>
    <summary ref={trigger} aria-label="Filter Beasiswa"><span>{value ? selectedName ?? "Beasiswa terpilih" : "Beasiswa"}</span><ChevronDown size={17} aria-hidden="true" /></summary>
    <div className="bc4-scholarshipOptions">
      <label className="b4-searchField"><span className="b4-srOnly">Cari pilihan beasiswa</span><input ref={searchInput} type="search" placeholder="Cari nama beasiswa" maxLength={100} value={search} onChange={event => setSearch(event.target.value)} /></label>
      <div className="bc4-scholarshipChoices" role="group" aria-label="Pilihan beasiswa">
        <button type="button" aria-pressed={!value} onClick={() => choose("")}>Semua Beasiswa</button>
        {choices.map(option => <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => choose(option.value)}>{option.label}</button>)}
      </div>
      {!choices.length && <p role="status">Tidak ada beasiswa yang sesuai.</p>}
    </div>
  </details>;
}
export default function ScholarshipAnalyticsApi({ view = "analytics" }: { view?: "analytics" | "summary" }) {
  return <Suspense fallback={<p role="status">Memuat halaman analitik…</p>}><AnalyticsView view={view} /></Suspense>;
}
function AnalyticsView({ view }: { view: "analytics" | "summary" }) {
  const summary = view === "summary";
  const params = useSearchParams();
  const pathname = usePathname();
  const { currentUser, authStatus, refreshSession } = useUser();
  const router = useRouter();
  const [cohort, setCohort] = useState(params.get("angkatan") ?? "");
  const [program, setProgram] = useState(params.get("prodi") ?? params.get("program_studi") ?? "");
  const [scholarship, setScholarship] = useState(params.get("beasiswa_id") ?? "");
  const [period, setPeriod] = useState(params.get("periode") ?? "");
  const [retry, setRetry] = useState(0);
  const [more, setMore] = useState(false);
  const [moreRanges, setMoreRanges] = useState(false);
  const [mode, setMode] = useState("university");
  const pdfLock = useRef(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const query = new URLSearchParams();
  if (cohort) query.set("angkatan", cohort);
  if (program.trim()) query.set("prodi", program.trim());
  if (scholarship) query.set("beasiswa_id", scholarship);
  if (period.trim()) query.set("periode", period.trim());
  const search = query.toString();
  useEffect(() => {
    const timer = setTimeout(() => window.history.replaceState(null, "", `${pathname}${search ? `?${search}` : ""}`), 200);
    return () => clearTimeout(timer);
  }, [pathname, search]);
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
      const link = document.createElement("a"); link.href = url; link.download = "eightracer-analitik-sekolah.pdf"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setPdfError(error instanceof Error ? error.message : "PDF belum dapat diunduh."); }
    finally { pdfLock.current = false; setPdfBusy(false); }
  }
  useEffect(() => {
    if (authStatus !== "authenticated" || !currentUser.schoolStaff || invalidYear) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/b4/analytics?${search}`, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal: abort.signal });
        const payload = await response.json();
        if (abort.signal.aborted) return;
        if (response.status === 401) { void refreshSession(); router.replace("/login"); }
        if (response.status === 403) void refreshSession();
        if (!response.ok) throw new Error(payload.message ?? "Analitik belum dapat dimuat.");
        setResult({ key, data: payload });
      } catch (error) { if (!abort.signal.aborted) setResult({ key, error: error instanceof Error ? error.message : "Aplikasi belum dapat dihubungi." }); }
    }, 300);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [search, key, invalidYear, authStatus, currentUser.schoolStaff, refreshSession, router]);
  const current = result?.key === key ? result : null;
  const data = current?.data;
  return <B4Shell title={summary ? "Ringkasan Pola Per-Angkatan" : "Analitik Beasiswa"} active={summary ? "summary" : "analytics"} tabQuery={search} description={summary ? "Lihat jumlah alumni, catatan bantuan pendidikan, dan pola beasiswa per periode." : "Telusuri distribusi beasiswa, KIP-K, serta statistik UKT dan IPK alumni."} dataNote="">
    {authStatus === "loading" ? <p role="status">Memeriksa sesi akun…</p> : authStatus === "unavailable" ? <div className="bc4-empty"><p role="alert">Sesi akun belum dapat diperiksa. Periksa koneksi layanan sekolah.</p><button className="bc4-button" onClick={() => void refreshSession()}>Coba lagi</button></div> : !currentUser.schoolStaff || authStatus !== "authenticated" ? <div className="bc4-empty"><p role="alert">Masuk dengan akun admin atau guru BK yang memiliki izin analitik sekolah.</p><Link className="bc4-button" href="/login">Masuk</Link></div> : <div className="b4-analyticsPage bc4-analyticsLive">
      <div className="b4-analyticsFilters" aria-label="Filter analitik beasiswa">
        <label className="b4-searchField"><span className="b4-srOnly">Angkatan</span><input placeholder="Angkatan" inputMode="numeric" maxLength={4} value={cohort} onChange={(e) => setCohort(e.target.value)} /></label>
        <label className="b4-searchField"><span className="b4-srOnly">Program Studi</span><input placeholder="Program Studi" maxLength={100} value={program} onChange={(e) => setProgram(e.target.value)} /></label>
        <ScholarshipFilter value={scholarship} options={result?.data?.scholarshipOptions ?? []} onChange={setScholarship} />
        <label className="b4-searchField"><span className="b4-srOnly">Periode</span><input placeholder="Periode" maxLength={100} value={period} onChange={(e) => setPeriod(e.target.value)} /></label>
      </div>
      {search && <button className="b4-resetFilters" onClick={() => { setCohort(""); setProgram(""); setScholarship(""); setPeriod(""); }}>Reset filter</button>}
      {invalidYear ? <p role="alert">Isi tahun angkatan dengan 4 digit.</p> : current?.error ? <div className="bc4-empty"><p role="alert">{current.error}</p><button className="bc4-button" onClick={() => setRetry((value) => value + 1)}>Coba lagi</button></div> : !data ? <p role="status">Memuat analitik dari sekolah…</p> : <>
        {summary && <section className="b4-analyticsStats" aria-label="Ringkasan alumni">
          <article><span>Total Alumni Sekolah</span><strong className={data.total === null ? "bc4-metricMissing" : undefined} data-analytics-metric="total">{data.total === null ? "Belum tersedia" : `${known(data.total)} Alumni`}</strong><small>{known(data.school?.admittedAlumni ?? null)} alumni dengan penerimaan PT berstatus diterima</small></article>
          <article><span>Beasiswa Selain KIP</span><strong className={data.recipients === null ? "bc4-metricMissing" : undefined} data-analytics-metric="recipients">{data.recipients === null ? "Belum tersedia" : `${known(data.recipients)} Alumni`}</strong><small>{data.recipients === null ? "Jumlah penerima belum tersedia" : "Sesuai catatan sekolah"}</small></article>
          <article><span>Penerima KIP-K</span><strong className={data.kipk === null ? "bc4-metricMissing" : undefined} data-analytics-metric="kipk">{data.kipk === null ? "Belum tersedia" : `${known(data.kipk)} Alumni`}</strong><small>Sesuai catatan sekolah</small></article>
        </section>}
        {!summary && <><section className="b4-analyticsSection"><h2>Beasiswa &amp; KIP-K</h2><div className="b4-analyticsGrid">
          <article className="b4-analyticsCard"><h3>Penerima KIP-K / Angkatan</h3><AnalyticsBars label="Penerima KIP-K menurut angkatan" data={data.cohorts} /></article>
          <article className="b4-analyticsCard b4-scholarshipDistribution"><h3>Distribusi Beasiswa</h3><AnalyticsDistribution data={more ? data.distribution : data.distribution.slice(0, 5)} /><p className="b4-chartFootnote">Jumlah per program tidak dijumlahkan menjadi penerima unik.</p>{data.distribution.length > 5 && <button className="bc4-button" onClick={() => setMore(!more)}>{more ? "Lihat lebih sedikit" : "Lihat lainnya"}</button>}</article>
        </div></section>
        <section className="b4-analyticsSection"><h2>Range Uang Kuliah Tunggal<button type="button" className="bc4-button" disabled={pdfBusy} onClick={() => void downloadPdf()}>{pdfBusy ? "Mengunduh…" : "Ekspor PDF"}</button></h2>{pdfError && <p role="alert" className="bc4-status" style={{ padding: "12px 29px" }}>{pdfError}</p>}<div className="b4-analyticsGrid">
          <article className="b4-analyticsCard"><h3>Ringkasan UKT</h3><Stats value={data.ukt} currency metric="ukt" /></article>
          <article className="b4-analyticsCard"><h3>IPK Alumni</h3><Stats value={data.ipk} metric="ipk" /></article>
        </div><div className="b4-analyticsToggle" role="group" aria-label="Urutan rentang UKT" style={{ padding: 20 }}><button disabled={!data.ranges.length} aria-pressed={mode === "university"} onClick={() => setMode("university")}>Perguruan Tinggi</button><button disabled={!data.ranges.length} aria-pressed={mode === "program"} onClick={() => setMode("program")}>Program Studi</button></div><div className="b4-tuitionRows">{data.ranges.length ? (moreRanges ? data.ranges : data.ranges.slice(0, 5)).map((item, index) => <article className="b4-tuitionRow" key={index}><div className="b4-tuitionIdentity"><strong>{mode === "university" ? item.university : item.program}</strong><span>{mode === "university" ? item.program : item.university} · {known(item.count)} alumni</span></div><div className="bc4-tuitionValues"><div className="bc4-tuitionLimits"><span>Min: {money(item.stats.minimum)}</span><span>Maks: {money(item.stats.maximum)}</span></div>{item.stats.minimum !== null && item.stats.maximum !== null && <TuitionRange minimum={item.stats.minimum} maximum={item.stats.maximum} />}<p>Rata-rata: {money(item.stats.mean)}</p></div></article>) : <p className="bc4-empty">Belum ada rentang UKT kampus/program studi yang tercatat.</p>}</div>{data.ranges.length > 5 && <div className="bc4-rangeMore"><span>Menampilkan {moreRanges ? data.ranges.length : 5} dari {data.ranges.length} kelompok kampus/prodi</span><button type="button" className="bc4-button" aria-expanded={moreRanges} onClick={() => setMoreRanges(!moreRanges)}>{moreRanges ? "Lihat lebih sedikit" : "Lihat lainnya"}</button></div>}</section>
        <section className="b4-analyticsSection"><h2>IPK &amp; Keberlanjutan Beasiswa</h2><div className="b4-analyticsGrid"><article className="b4-analyticsCard"><h3>Distribusi IPK Alumni</h3><AnalyticsBars label="Distribusi IPK Alumni" data={data.ipkDistribution ?? []} /><details className="bc4-extraInformation"><summary>Tren IPK per periode</summary>{data.ipkTrend.length ? data.ipkTrend.map((item, index) => <div key={index}><h4>{item.label}</h4><Stats value={item.stats} /></div>) : <p className="bc4-empty">Belum ada tren IPK yang tercatat.</p>}</details></article><article className="b4-analyticsCard"><h3>Keberlanjutan Beasiswa</h3><p className="bc4-empty">Data keberlanjutan berdasarkan rentang IPK belum tersedia dari BE.</p></article></div></section>
        </>}
        {summary && <section className="b4-analyticsSection bc4-patternSection"><h2>Pola Beasiswa per Periode</h2><div className="b4-historyStats">{data.periods.length ? data.periods.map((item, index) => <article key={index}><span>{item.label}</span><strong>{known(item.count)} Alumni</strong><small>KIP-K: {known(item.kipk)} alumni</small>{item.scholarships.map((program, index) => <p key={index}>{program.label}: {known(program.count)} alumni · Proses {known(program.processing)} · Diterima {known(program.accepted)} · Ditolak {known(program.rejected)}</p>)}</article>) : <p className="bc4-empty">Belum ada tren beasiswa per periode yang tercatat.</p>}</div></section>}
        {summary && <aside className="bc4-note"><div><h3>Cara membaca ringkasan</h3><p>Angkatan berarti tahun lulus. Catatan beasiswa selain KIP dan KIP dapat dimiliki alumni yang sama, sehingga keduanya tidak boleh dijumlahkan sebagai total penerima unik.</p><Link href={`/admin/analitik-beasiswa${search ? `?${search}` : ""}`} className="bc4-button">Lihat grafik dan UKT/IPK</Link></div></aside>}
        <p className="b4-chartFootnote">{!summary && <>Snapshot UKT/IPK: {known(data.measuredAlumni)} alumni. Data belum tercatat tidak dianggap nol. </>}{data.asOf && `Data per ${data.asOf}.`}{!summary && " PDF adalah laporan sekolah dengan filter yang sama, bukan hanya bagian layar yang sedang dibuka."}</p>
      </>}
    </div>}
  </B4Shell>;
}

function TuitionRange({ minimum, maximum }: { minimum: number; maximum: number }) {
  // A visual scale only; retain the server's minimum, maximum and mean unchanged.
  const start = maximum > 0 ? Math.min(100, minimum / maximum * 100) : 0;
  return <div className="bc4-tuitionTrack" role="img" aria-label={`Rentang UKT ${money(minimum)} sampai ${money(maximum)}`}><span style={{ left: `${start}%`, right: 0 }} /><i style={{ left: `${start}%` }} /><i style={{ left: "100%" }} /></div>;
}
