"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, ChevronRight, Landmark } from "lucide-react";
import B4Navbar from "./B4Navbar";
import B4Tabs from "./B4Tabs";
import "./college.css";

const scholarshipData = [
  { label: "Beasiswa Unggulan Kemendikbud", count: 48 },
  { label: "Tanoto Scholars Foundation", count: 28 },
  { label: "Djarum Beasiswa Plus", count: 24 },
  { label: "Beasiswa Internal Perguruan Tinggi", count: 18 },
  { label: "Lainnya / Beasiswa Kemitraan Industri", count: 10 },
  { label: "Beasiswa Kartu Indonesia Pintar", count: 8 },
  { label: "Program bantuan daerah", count: 6 },
];

const tuitionByUniversity = [
  { name: "Universitas Gadjah Mada (UGM)", students: 42, location: "Sleman, DI. Yogyakarta", min: 500_000, max: 12_500_000, lower: "Golongan I", upper: "Golongan Unggul" },
  { name: "Universitas Brawijaya (UB)", students: 58, location: "Malang, Jawa Timur", min: 500_000, max: 11_000_000, lower: "Golongan I", upper: "Golongan VII" },
  { name: "Institut Teknologi Sepuluh Nopember (ITS)", students: 35, location: "Surabaya, Jawa Timur", min: 1_000_000, max: 10_000_000, lower: "Golongan II", upper: "Golongan VI" },
  { name: "Universitas Airlangga (UNAIR)", students: 27, location: "Surabaya, Jawa Timur", min: 1_000_000, max: 9_000_000, lower: "Golongan II", upper: "Golongan V" },
  { name: "Universitas Indonesia (UI)", students: 10, location: "Depok, Jawa Barat", min: 500_000, max: 13_000_000, lower: "Golongan I (BOP-B)", upper: "Kelas Tertinggi (BOP-A)" },
  { name: "Universitas Negeri Malang (UM)", students: 31, location: "Malang, Jawa Timur", min: 500_000, max: 8_500_000, lower: "Golongan I", upper: "Golongan VIII" },
  { name: "Universitas Jember (UNEJ)", students: 22, location: "Jember, Jawa Timur", min: 500_000, max: 7_500_000, lower: "Golongan I", upper: "Golongan VII" },
];

const tuitionByProgram = [
  { name: "Psikologi", students: 36, location: "12 perguruan tinggi", min: 500_000, max: 13_000_000, lower: "UKT Terendah", upper: "UKT Tertinggi" },
  { name: "Teknik Informatika", students: 54, location: "15 perguruan tinggi", min: 500_000, max: 12_000_000, lower: "UKT Terendah", upper: "UKT Tertinggi" },
  { name: "Manajemen", students: 42, location: "11 perguruan tinggi", min: 500_000, max: 10_000_000, lower: "UKT Terendah", upper: "UKT Tertinggi" },
  { name: "Kedokteran", students: 18, location: "6 perguruan tinggi", min: 1_000_000, max: 25_000_000, lower: "UKT Terendah", upper: "UKT Tertinggi" },
  { name: "Ilmu Hukum", students: 24, location: "9 perguruan tinggi", min: 500_000, max: 11_000_000, lower: "UKT Terendah", upper: "UKT Tertinggi" },
  { name: "Akuntansi", students: 28, location: "10 perguruan tinggi", min: 500_000, max: 9_000_000, lower: "UKT Terendah", upper: "UKT Tertinggi" },
];

const gpaDistribution = [
  { label: "< 3.00", count: 4 },
  { label: "3.00–3.24", count: 18 },
  { label: "3.25–3.49", count: 45 },
  { label: "3.50–3.74", count: 68 },
  { label: "3.75–4.00", count: 37 },
];

const continuityBands = [
  { label: "IPK 3.00 – 3.24 (18 Alumni)", active: 61, inactive: 29, unknown: 10 },
  { label: "IPK 3.25 – 3.49 (45 Alumni)", active: 78, inactive: 17, unknown: 5 },
  { label: "IPK 3.50 – 3.74 (68 Alumni)", active: 91, inactive: 7, unknown: 2 },
  { label: "IPK 3.75 – 4.00 (37 Alumni)", active: 95, inactive: 5, unknown: 0 },
];

function FilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return <label className="b4-selectField b4-analyticsFilter">
    <span className="b4-srOnly">{label}</span>
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{label}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
    <ChevronDown size={17} aria-hidden="true" />
  </label>;
}

function ChartBars({ data, label }: { data: { label: string; count: number }[]; label: string }) {
  const max = Math.max(...data.map((item) => item.count));
  return <div className="b4-chartBars" role="img" aria-label={label}>
    {data.map((item) => <div className="b4-chartBarColumn" key={item.label}>
      <strong>{item.count}</strong>
      <span className="b4-chartBar" style={{ height: `${Math.max(8, item.count / max * 80)}%` }} />
      <span className="b4-chartBarLabel">{item.label}</span>
    </div>)}
  </div>;
}

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function ScholarshipAnalyticsPage() {
  const [cohort, setCohort] = useState("");
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [scholarship, setScholarship] = useState("");
  const [showAllScholarships, setShowAllScholarships] = useState(false);
  const [showAllTuition, setShowAllTuition] = useState(false);
  const [tuitionMode, setTuitionMode] = useState<"university" | "program">("university");

  const scholarshipRows = showAllScholarships ? scholarshipData : scholarshipData.slice(0, 5);
  const tuitionRows = tuitionMode === "university" ? tuitionByUniversity : tuitionByProgram;
  const tuitionMax = Math.max(...tuitionRows.map((item) => item.max));
  const visibleTuition = showAllTuition ? tuitionRows : tuitionRows.slice(0, 5);
  const filterSummary = [cohort, university, program, scholarship].filter(Boolean).join(" · ");
  const cohortPopulation: Record<string, number> = { "2021": 43, "2022": 50, "2023": 60, "2024": 90, "2025": 57 };
  const cohortKipk: Record<string, number> = { "2021": 0, "2022": 6, "2023": 8, "2024": 28, "2025": 14 };
  const populationMatches = [
    cohort ? cohortPopulation[cohort] : undefined,
    university ? tuitionByUniversity.find((item) => item.name === university)?.students : undefined,
    program ? tuitionByProgram.find((item) => item.name === program)?.students : undefined,
  ].filter((value): value is number => value !== undefined);
  const totalAlumni = populationMatches.length ? Math.min(...populationMatches) : 300;
  const scholarshipCount = Math.min(totalAlumni, scholarship ? scholarshipData.find((item) => item.label === scholarship)?.count ?? 0 : 98);
  const kipkPopulation = cohort ? cohortKipk[cohort] : 56;
  const kipkCount = Math.min(totalAlumni, kipkPopulation);
  const scholarshipPercent = filterSummary ? Math.round(scholarshipCount / Math.max(1, totalAlumni) * 100) : 74;

  return <div className="b4-page">
    <B4Navbar />
    <main>
      <section className="b4-hero" aria-labelledby="b4-analytics-title">
        <div className="b4-container">
          <nav aria-label="Breadcrumb" className="b4-breadcrumb">
            <Link href="/admin#layanan">Layanan</Link><ChevronRight size={14} aria-hidden="true" />
            <span>Alumni dan Beasiswa</span><ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">Analitik Beasiswa</span>
          </nav>
          <h1 id="b4-analytics-title">Analitik Beasiswa</h1>
          <p>Lihat perjalanan pendidikan dan perkembangan kuliah alumni dari masa sekolah hingga kondisi terkini.</p>
        </div>
      </section>

      <div className="b4-container">
        <B4Tabs active="Analitik Beasiswa" />
        <div className="b4-analyticsPage">
          <section className="b4-analyticsFilters" aria-label="Filter analitik beasiswa">
            <FilterSelect label="Angkatan" value={cohort} options={["2021", "2022", "2023", "2024", "2025"]} onChange={setCohort} />
            <FilterSelect label="Perguruan Tinggi" value={university} options={[...new Set(tuitionByUniversity.map((item) => item.name))]} onChange={setUniversity} />
            <FilterSelect label="Semua Program Studi" value={program} options={[...new Set(tuitionByProgram.map((item) => item.name))]} onChange={setProgram} />
            <FilterSelect label="Beasiswa" value={scholarship} options={scholarshipData.map((item) => item.label)} onChange={setScholarship} />
          </section>
          {filterSummary && <p className="b4-analyticsFilterStatus" role="status">Filter pratinjau: {filterSummary}</p>}

          <section className="b4-analyticsStats" aria-label="Ringkasan alumni">
            <article><span>Total Alumni Terpantau</span><strong>{totalAlumni} Alumni</strong><small>Alumni dengan rekam progress aktif</small></article>
            <article><span>Penerima Beasiswa</span><strong>{scholarshipCount} Alumni</strong><small>{scholarshipPercent}% dari total alumni</small></article>
            <article><span>Penerima KIP-K</span><strong>{kipkCount} Alumni</strong><small>KIP-Kuliah Merdeka Terverifikasi</small></article>
          </section>

          <section className="b4-analyticsSection" aria-labelledby="b4-scholarship-section-title">
            <h2 id="b4-scholarship-section-title">Beasiswa &amp; KIP-K</h2>
            <div className="b4-analyticsGrid">
              <article className="b4-analyticsCard">
                <h3>Penerima KIP-K / Angkatan</h3>
                <ChartBars label="Jumlah penerima KIP-K per angkatan: 2022 enam, 2023 delapan, 2024 dua puluh delapan, 2025 empat belas" data={[{ label: "2022", count: 6 }, { label: "2023", count: 8 }, { label: "2024", count: 28 }, { label: "2025", count: 14 }]} />
                <p className="b4-chartFootnote">Total akumulasi 56 penerima</p>
              </article>
              <article className="b4-analyticsCard b4-scholarshipDistribution">
                <h3>Distribusi Beasiswa</h3>
                <div className="b4-scholarshipBars">
                  {scholarshipRows.map((item) => <div className="b4-scholarshipBarRow" key={item.label}>
                    <div><span>{item.label}</span><strong>{item.count}<small> Alumni</small></strong></div>
                    <span className="b4-scholarshipTrack"><span style={{ width: `${item.count / 48 * 100}%` }} /></span>
                  </div>)}
                </div>
                <footer><span>Total akumulasi 98 penerima</span><button type="button" onClick={() => setShowAllScholarships(!showAllScholarships)}>{showAllScholarships ? "Lihat lebih sedikit" : "Lihat lainnya"}</button></footer>
              </article>
            </div>
          </section>

          <section className="b4-analyticsSection" aria-labelledby="b4-tuition-section-title">
            <header className="b4-analyticsSectionHeading">
              <h2 id="b4-tuition-section-title">Range Uang Kuliah Tunggal</h2>
              <div className="b4-analyticsToggle" role="group" aria-label="Kelompok data UKT">
                <button type="button" aria-pressed={tuitionMode === "university"} className={tuitionMode === "university" ? "b4-toggleActive" : ""} onClick={() => { setTuitionMode("university"); setShowAllTuition(false); }}><Landmark size={15} fill="currentColor" />Perguruan Tinggi</button>
                <button type="button" aria-pressed={tuitionMode === "program"} className={tuitionMode === "program" ? "b4-toggleActive" : ""} onClick={() => { setTuitionMode("program"); setShowAllTuition(false); }}><BookOpen size={15} fill="currentColor" />Program Studi</button>
              </div>
            </header>
            <div className="b4-tuitionRows">
              {visibleTuition.map((item) => <article className="b4-tuitionRow" key={item.name}>
                <div className="b4-tuitionIdentity"><strong>{item.name}</strong><span>{item.students} alumni tercatat · {item.location}</span></div>
                <div className="b4-tuitionRange">
                  <div className="b4-tuitionMinMax"><span>Min: <strong>{formatRupiah(item.min)}</strong></span><span>Maks: <strong>{formatRupiah(item.max)}</strong></span></div>
                  <div className="b4-rangeTrack" role="img" aria-label={`Rentang UKT dari ${formatRupiah(item.min)} hingga ${formatRupiah(item.max)}`}>
                    <span className="b4-rangeSelected" style={{ width: `${Math.max(0, item.max / tuitionMax * 100 - 5)}%` }} />
                    <i className="b4-rangeDot b4-rangeDotStart" />
                    <i className="b4-rangeDot b4-rangeDotEnd" style={{ left: `${item.max / tuitionMax * 100}%` }} />
                  </div>
                  <div className="b4-tuitionRangeLabels"><span>{item.lower}</span><small>Rentang {formatRupiah(item.max - item.min)}</small><span>{item.upper}</span></div>
                </div>
              </article>)}
            </div>
            <div className="b4-tuitionMore"><button type="button" onClick={() => setShowAllTuition(!showAllTuition)}>{showAllTuition ? "Lihat lebih sedikit" : "Lihat lainnya"}</button></div>
          </section>

          <section className="b4-analyticsSection" aria-labelledby="b4-gpa-section-title">
            <h2 id="b4-gpa-section-title">IPK &amp; Keberlanjutan Beasiswa</h2>
            <div className="b4-analyticsGrid">
              <article className="b4-analyticsCard">
                <h3>Distribusi IPK Alumni</h3>
                <ChartBars label="Distribusi IPK alumni: empat di bawah tiga, delapan belas antara tiga dan 3.24, 45 antara 3.25 dan 3.49, 68 antara 3.50 dan 3.74, dan 37 antara 3.75 dan empat" data={gpaDistribution} />
                <p className="b4-chartFootnote">87% Alumni di atas batas aman</p>
              </article>
              <article className="b4-analyticsCard b4-continuityCard">
                <h3>Status Beasiswa Berdasarkan Rentang IPK</h3>
                <div className="b4-continuityRows">{continuityBands.map((band) => <div className="b4-continuityRow" key={band.label}>
                  <div><span>{band.label}</span><small>{band.active}% Aktif</small></div>
                  <span className="b4-continuityTrack"><i style={{ width: `${band.active}%` }} /><i style={{ width: `${band.inactive}%` }} /><i style={{ width: `${band.unknown}%` }} /></span>
                </div>)}</div>
                <footer className="b4-chartLegend"><span><i />Aktif</span><span><i />Tidak berlanjut</span><span><i />Belum ada data</span></footer>
              </article>
            </div>
          </section>

          <section className="b4-analyticsSection b4-historyAnalytics" aria-labelledby="b4-history-analytics-title">
            <h2 id="b4-history-analytics-title">Pola Historis Mendapat Beasiswa</h2>
            <div className="b4-historyStats">
              {[{ term: "Semester 1", alumni: 19, note: "Beasiswa jalur penerimaan awal/KIP-K" }, { term: "Semester 2", alumni: 45 }, { term: "Semester 3", alumni: 38 }, { term: "Semester 4+", alumni: 26 }].map((item) => <article key={item.term}>
                <span>{item.term}</span><strong>{item.alumni} Alumni</strong>{item.note && <small>{item.note}</small>}
              </article>)}
            </div>
          </section>
          <p className="b4-analyticsDemoNote">Pratinjau B4 · Angka analitik pada halaman ini merupakan data contoh.</p>
        </div>
      </div>
    </main>
  </div>;
}
