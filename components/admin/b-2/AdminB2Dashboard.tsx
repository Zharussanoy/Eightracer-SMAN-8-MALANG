"use client";

import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Filter,
  FolderOpen,
  MapPin,
  Pencil,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import DetailSiswaModal from "./DetailSiswaModal";
import {
  DATA_MANAJEMEN_SISWA,
  DATA_MINAT_RIASEC,
  DATA_RANKING_ELIGIBILITAS,
  DATA_SEBARAN_JURUSAN,
  DATA_SEMESTER_AVG,
  KPI_HEADER_ITEMS,
  SiswaDataItem,
  STATS_KUOTA_ELIGIBEL,
} from "./mockDataAdminB2";

// Komponen Lingkaran Donut Nilai Rapor
function CircularProgress({ value, label }: { value: number; label: string }) {
  // Nilai 0 - 100
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-18 h-18 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
          {/* Background circle */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            stroke="#E0EBFF"
            strokeWidth="5"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            stroke="#226CE0"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span
          className="absolute text-[12px] font-bold text-[#14141C]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <span
        className="text-[11px] font-medium text-[#6E6678]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function AdminB2Dashboard() {
  const [activeTab, setActiveTab] = useState<"ranking" | "manajemen">("ranking");

  // State pencarian ranking eligibilitas
  const [searchRanking, setSearchRanking] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("2026/2027 Ganjil");

  // State manajemen data siswa
  const [searchSiswa, setSearchSiswa] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua Kelas");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [filterGender, setFilterGender] = useState("Semua Gender");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);


  const [selectedDetailSiswa, setSelectedDetailSiswa] = useState<SiswaDataItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


  const filteredRanking = DATA_RANKING_ELIGIBILITAS.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchRanking.toLowerCase()) ||
      item.nisn.includes(searchRanking)
  );


  const filteredSiswa = DATA_MANAJEMEN_SISWA.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchSiswa.toLowerCase()) ||
      item.nisn.includes(searchSiswa);
    const matchKelas =
      filterKelas === "Semua Kelas" || item.kelas.includes(filterKelas);
    const matchStatus =
      filterStatus === "Semua Status" || item.statusKelengkapan === filterStatus;
    const matchGender =
      filterGender === "Semua Gender" || item.gender === filterGender;
    return matchSearch && matchKelas && matchStatus && matchGender;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredSiswa.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearchSiswa("");
    setFilterKelas("Semua Kelas");
    setFilterStatus("Semua Status");
    setFilterGender("Semua Gender");
  };

  useEffect(() => {
    const handleScroll = () => {
      const sectionManajemen = document.getElementById("section-manajemen-data");
      if (!sectionManajemen) return;

      const triggerOffset = 260;
      const scrollPos = window.scrollY + triggerOffset;
      const manajemenTop = sectionManajemen.offsetTop;

      if (scrollPos >= manajemenTop) {
        setActiveTab("manajemen");
      } else {
        setActiveTab("ranking");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const scrollToSection = (sectionId: string, tab: "ranking" | "manajemen") => {
    setActiveTab(tab);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -150;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div
      className="flex-1 max-w-[1440px] w-full mx-auto px-6 lg:px-10 pt-6 pb-20 text-[#1F1729]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >

      <div className="mb-6">
        <p className="text-[12px] text-[#6E6678] font-normal mb-1">
          Beranda/B2/Dashboard
        </p>
        <h1
          className="text-[28px] sm:text-[32px] font-bold text-[#1F1729] tracking-tight leading-tight"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Rekam Data Siswa
        </h1>
        <p className="text-[13px] text-[#6E6678] mt-1">
          Akses karakteristik, eligibilitas dan rekomendasi prodi
        </p>
      </div>


      <div className="sticky top-20 z-40 bg-[#FCFAFF]/95 backdrop-blur-md pt-2 mb-8 border-b border-[#EAECF0] transition-all">
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => scrollToSection("section-ranking-eligibilitas", "ranking")}
            className={`pb-3 text-[14px] font-semibold transition-all relative cursor-pointer ${activeTab === "ranking"
                ? "text-[#6941C6] border-b-2 border-[#7F56D9]"
                : "text-[#6E6678] hover:text-[#1F1729]"
              }`}
          >
            Ranking Eligibilitas
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("section-manajemen-data", "manajemen")}
            className={`pb-3 text-[14px] font-semibold transition-all relative cursor-pointer ${activeTab === "manajemen"
                ? "text-[#6941C6] border-b-2 border-[#7F56D9]"
                : "text-[#6E6678] hover:text-[#1F1729]"
              }`}
          >
            Manajemen Data
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
        {KPI_HEADER_ITEMS.map((kpi) => {
          return (
            <div
              key={kpi.id}
              className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-semibold text-[#6E6678] mb-1">
                  {kpi.label}
                </p>
                <p
                  className={`text-[24px] font-bold leading-tight ${kpi.colorTheme === "purple"
                      ? "text-[#6941C6]"
                      : kpi.colorTheme === "green"
                        ? "text-[#148557]"
                        : "text-[#1F1729]"
                    }`}
                >
                  {kpi.value}
                </p>
                <p className="text-[11px] text-[#6E6678] mt-1">{kpi.subtext}</p>
              </div>

              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${kpi.colorTheme === "blue"
                    ? "bg-[#EEF4FF] text-[#226CE0]"
                    : kpi.colorTheme === "purple"
                      ? "bg-[#F4EBFF] text-[#7F56D9]"
                      : kpi.colorTheme === "cyan"
                        ? "bg-[#E0F2FE] text-[#0284C7]"
                        : "bg-[#DCFCE7] text-[#148557]"
                  }`}
              >
                {kpi.iconType === "users" && <Users className="w-5 h-5" />}
                {kpi.iconType === "pin" && <MapPin className="w-5 h-5" />}
                {kpi.iconType === "chart" && <TrendingUp className="w-5 h-5" />}
                {kpi.iconType === "shield" && <ShieldCheck className="w-5 h-5" />}
              </div>
            </div>
          );
        })}
      </div>


      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#1F1729]">
              Distribusi Profil & Direktori Siswa Angkatan
            </h2>
            <p className="text-[12px] text-[#6E6678]">
              Pemetaan sebaran minat bakat RIASEC, capaian rata-rata akademik per
              semester, dan status kelengkapan biodata 248 siswa angkatan.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-[#F4EBFF] text-[#6941C6] border border-[#E9D7FE] text-[11px] font-semibold shrink-0">
            <Users className="w-3.5 h-3.5" />
            <span>248 Siswa Terdata</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-stretch">

          <div className="bg-[#F9F5FF] border border-[#E9D7FE] rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-[#1F1729]">
                  Sebaran Jurusan Asal
                </h3>
                <span className="text-[11px] font-semibold text-[#6941C6] bg-white px-2.5 py-0.5 rounded-full border border-[#E9D7FE]">
                  Total 240 Siswa
                </span>
              </div>

              <div className="flex flex-col gap-5 mt-5">
                {DATA_SEBARAN_JURUSAN.map((jurusan) => (
                  <div key={jurusan.nama} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#1F1729]">
                        {jurusan.nama}
                      </span>
                      <span className="font-bold text-[#6941C6]">
                        {jurusan.jumlah} Siswa ({jurusan.persen}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white overflow-hidden border border-[#E9D7FE]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${jurusan.persen}%`,
                          background: jurusan.warna,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E9D7FE] mt-6 text-[11px] text-[#6E6678]">
              Data terverifikasi per angkatan aktif 2024/2025 semester berjalan.
            </div>
          </div>


          <div
            className="rounded-2xl p-6 sm:p-7 shadow-md text-white flex flex-col gap-5 border border-purple-900/40"
            style={{
              background: "linear-gradient(145deg, #1A0A33 0%, #2E125C 50%, #441A87 100%)",
            }}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                PEMETAAN POTENSI KOMPREHENSIF
              </span>
              <h3 className="text-[18px] sm:text-[20px] font-bold mt-0.5 text-white">
                Sebaran Minat RIASEC & Rata-rata Nilai Angkatan (TA 2024/2025)
              </h3>
            </div>


            <div className="bg-white rounded-xl p-5 text-[#1F1729] shadow-xs">
              <div className="mb-3.5">
                <h4 className="text-[14px] font-bold text-[#1F1729]">
                  Distribusi Minat RIASEC Angkatan
                </h4>
                <p className="text-[11px] text-[#6E6678]">
                  Persentase dominasi asesmen psikometrik & kesesuaian output jurusan siswa
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {DATA_MINAT_RIASEC.map((item) => (
                  <div
                    key={item.kategori}
                    className="grid grid-cols-[170px_1fr_95px] items-center gap-3 text-[12px]"
                  >
                    <span className="text-[#6E6678] truncate">
                      {item.kategori}
                    </span>
                    <div className="h-3 rounded-full bg-[#EFEAF4] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${item.persen}%`,
                          background: "#226CE0",
                        }}
                      />
                    </div>
                    <span className="text-right font-medium text-[#1F1729]">
                      {item.siswa} Siswa ({item.persen}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>


            <div className="bg-white rounded-xl p-5 text-[#1F1729] shadow-xs">
              <h4 className="text-[14px] font-bold text-[#1F1729] mb-4">
                Rata-rata Nilai Rapor Angkatan per Semester (Semester 1 s/d 5)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 justify-items-center">
                {DATA_SEMESTER_AVG.map((sem) => (
                  <CircularProgress
                    key={sem.semester}
                    value={sem.nilai}
                    label={sem.semester}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


      <div id="section-ranking-eligibilitas" className="mb-12 scroll-mt-36">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#1F1729]">
              Manajemen & Ranking Eligibilitas SNBP
            </h2>
            <p className="text-[12px] text-[#6E6678]">
              Perhitungan otomatis ranking kuota SNBP berdasarkan bobot rapor
              terukur, skor TKA, capaian portofolio & rekam jejak.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/admin/b2/kustomisasi-bobot"
              className="px-3.5 py-2 rounded-lg border border-[#D0D5DD] bg-white text-[12px] font-semibold text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#7F56D9]" />
              <span>Kustomisasi Bobot Penilaian</span>
            </Link>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-[#7F56D9] hover:bg-[#6941C6] active:bg-[#53389E] text-white text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Jalankan Kalkulasi</span>
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

          <div className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[11px] font-semibold text-[#6E6678]">
                  Total Kuota Tersedia
                </p>
                <p className="text-[22px] font-bold text-[#1F1729] mt-0.5">
                  {STATS_KUOTA_ELIGIBEL.totalKuota}{" "}
                  <span className="text-[14px] font-normal text-[#6E6678]">
                    / {STATS_KUOTA_ELIGIBEL.totalSiswa} Siswa
                  </span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center">
                <FolderOpen className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="w-full h-2 rounded-full bg-[#F2F4F7] overflow-hidden flex mb-2 border border-[#EAECF0]">
                <div
                  style={{ width: `${STATS_KUOTA_ELIGIBEL.mipaPersen}%` }}
                  className="bg-[#7F56D9] h-full"
                />
                <div
                  style={{ width: `${STATS_KUOTA_ELIGIBEL.ipsPersen}%` }}
                  className="bg-[#D6BBFB] h-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#6E6678]">
                <span>
                  {STATS_KUOTA_ELIGIBEL.mipaKuota} MIPA (
                  {STATS_KUOTA_ELIGIBEL.mipaPersen}%)
                </span>
                <span>
                  {STATS_KUOTA_ELIGIBEL.ipsKuota} IPS (
                  {STATS_KUOTA_ELIGIBEL.ipsPersen}%)
                </span>
              </div>
            </div>
          </div>


          <div className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[11px] font-semibold text-[#6E6678]">
                  Siswa Eligible
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[22px] font-bold text-[#148557]">
                    {STATS_KUOTA_ELIGIBEL.siswaEligible}
                  </p>
                  <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#148557] text-[10px] font-bold">
                    100% Valid
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] text-[#148557] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#148557] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#148557]" />
              <span>Kuota ranking Eligible</span>
            </div>
          </div>


          <div className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[11px] font-semibold text-[#6E6678]">
                  Tidak Eligible SNBP
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[22px] font-bold text-[#D92D20]">
                    {STATS_KUOTA_ELIGIBEL.tidakEligible}
                  </p>
                  <span className="px-2 py-0.5 rounded-full bg-[#FEE4E2] text-[#D92D20] text-[10px] font-bold">
                    Di luar 40%
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6E6678]">
              <span className="w-2 h-2 rounded-full bg-[#6E6678]" />
              <span>Bimbingan intensif UTBK disiapkan</span>
            </div>
          </div>
        </div>


        <div
          className="rounded-2xl overflow-hidden bg-white border border-[#E9D7FE] shadow-2xs"
        >

          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#EAECF0] bg-[#FAF9FE]">
            <div>
              <h3 className="font-bold text-[16px] text-[#1F1729]">
                Ranking Eligibilitas Siswa
              </h3>
              <p className="text-[11px] text-[#6E6678]">
                Peringkat berdasarkan akumulasi pembobotan kriteria
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">

              <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white border border-[#D0D5DD] focus-within:border-[#7F56D9] min-w-[190px]">
                <Search className="w-3.5 h-3.5 text-[#667085]" />
                <input
                  type="text"
                  placeholder="Cari nama atau NISN..."
                  value={searchRanking}
                  onChange={(e) => setSearchRanking(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[12px] text-[#1F1729]"
                />
              </div>


              <div className="relative">
                <select
                  value={filterPeriode}
                  onChange={(e) => setFilterPeriode(e.target.value)}
                  className="h-9 px-3 pr-8 rounded-lg bg-white border border-[#D0D5DD] text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] text-[12px] font-semibold appearance-none cursor-pointer outline-none transition-colors"
                >
                  <option>2026/2027 Ganjil</option>
                  <option>2025/2026 Genap</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#6941C6] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>


              <button
                type="button"
                className="h-9 px-3.5 rounded-lg bg-white border border-[#D0D5DD] text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-[#6941C6]" />
                <span>Filter</span>
              </button>

              <button
                type="button"
                className="h-9 px-4 rounded-lg bg-[#7F56D9] hover:bg-[#6941C6] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </button>
            </div>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="bg-[#F8F9FC] border-b border-[#EAECF0] text-[#475467] uppercase text-[10px] font-bold tracking-wider">
                  <th className="px-5 py-3">RANK</th>
                  <th className="px-5 py-3">NAMA SISWA</th>
                  <th className="px-5 py-3">NISN</th>
                  <th className="px-5 py-3">NILAI RATA-RATA</th>
                  <th className="px-5 py-3">SKOR</th>
                  <th className="px-5 py-3">STATUS</th>
                  <th className="px-5 py-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {filteredRanking.map((row, idx) => {
                  const isShade = idx % 2 === 1;
                  return (
                    <tr
                      key={row.nisn}
                      className={`transition-colors hover:bg-[#F9F5FF] ${isShade ? "bg-[#FCFAFF]" : "bg-white"
                        }`}
                    >

                      <td className="px-5 py-3.5 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={
                              row.rank <= 3 ? "text-[#6941C6]" : "text-[#667085]"
                            }
                          >
                            {String(row.rank).padStart(2, "0")}
                          </span>
                          {row.rank === 1 && (
                            <span className="w-4 h-4 rounded-full bg-[#F2B32E] text-white text-[9px] font-bold flex items-center justify-center">
                              1
                            </span>
                          )}
                          {row.rank === 2 && (
                            <span className="w-4 h-4 rounded-full bg-[#C4CFDE] text-white text-[9px] font-bold flex items-center justify-center">
                              2
                            </span>
                          )}
                          {row.rank === 3 && (
                            <span className="w-4 h-4 rounded-full bg-[#C79163] text-white text-[9px] font-bold flex items-center justify-center">
                              3
                            </span>
                          )}
                        </div>
                      </td>


                      <td className="px-5 py-3.5 font-semibold text-[#14141C]">
                        {row.nama}
                      </td>


                      <td className="px-5 py-3.5 text-[#667085]">{row.nisn}</td>


                      <td className="px-5 py-3.5 font-bold text-[#14141C]">
                        {row.nilaiRataRata.toFixed(2).replace(".", ",")}
                      </td>


                      <td className="px-5 py-3.5 font-bold text-[#6941C6]">
                        {row.skor.toFixed(1).replace(".", ",")}
                      </td>


                      <td className="px-5 py-3.5">
                        {row.status === "Eligible" ? (
                          <span className="px-2.5 py-1 rounded-md bg-[#DCFCE7] text-[#148557] font-semibold text-[11px] inline-block">
                            Eligible
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-[#FEF0C7] text-[#B54708] font-semibold text-[11px] inline-block">
                            Evaluasi
                          </span>
                        )}
                      </td>


                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          className="text-[#667085] hover:text-[#6941C6] font-bold px-2 py-1 cursor-pointer"
                        >
                          •••
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>


          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 text-[11px] text-[#667085] border-t border-[#EAECF0] bg-white">
            <span>Menampilkan 1-5 dari 248 siswa</span>
            <span className="font-semibold text-[#6941C6]">
              Halaman 1 dari 10 (Kuota SNBP Terpenuhi: 72/72)
            </span>
          </div>
        </div>
      </div>


      <div id="section-manajemen-data" className="scroll-mt-36">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#1F1729]">
              Manajemen Data Siswa
            </h2>
            <p className="text-[12px] text-[#6E6678]">
              Kelola data induk, riwayat akademik, konsistensi minat bakat, dan
              verifikasi berkas seluruh siswa angkatan 2024/2025.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              className="px-3.5 py-2 rounded-lg border border-[#D0D5DD] bg-white text-[12px] font-semibold text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#7F56D9]" />
              <span>Import Data</span>
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-[#7F56D9] hover:bg-[#6941C6] active:bg-[#53389E] text-white text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Tambah Siswa Baru</span>
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

          <div className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#6E6678]">
                TOTAL SISWA TERDAFTAR
              </p>
              <p className="text-[24px] font-bold text-[#1F1729] mt-0.5">420</p>
              <p className="text-[11px] text-[#6E6678] mt-1">
                240 MIPA &nbsp;|&nbsp; 180 IPS
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>


          <div className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#6E6678]">
                  DATA LENGKAP
                </p>
                <p className="text-[24px] font-bold text-[#1F1729] mt-0.5">382</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#148557] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full h-2 rounded-full bg-[#F2F4F7] overflow-hidden flex border border-[#EAECF0]">
                <div style={{ width: "91%" }} className="bg-[#148557] h-full" />
              </div>
              <p className="text-right text-[10px] text-[#148557] font-bold mt-1">
                91.0%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#6E6678]">
                TOTAL KELAS / ROMBEL
              </p>
              <p className="text-[24px] font-bold text-[#1F1729] mt-0.5">12</p>
              <p className="text-[11px] text-[#6E6678] mt-1">
                6 Kelas MIPA (1-6) &nbsp;|&nbsp; 6 Kelas IPS (1-3)
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>
        </div>


        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2.5">

            <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white border border-[#D0D5DD] focus-within:border-[#7F56D9] min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-[#667085]" />
              <input
                type="text"
                placeholder="Cari nama siswa atau NISN..."
                value={searchSiswa}
                onChange={(e) => setSearchSiswa(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[12px] text-[#1F1729]"
              />
            </div>

            <div className="relative">
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="h-9 px-3 pr-8 rounded-lg bg-white border border-[#D0D5DD] text-[#344054] text-[12px] appearance-none cursor-pointer outline-none hover:border-[#7F56D9]"
              >
                <option>Semua Kelas</option>
                <option>MIPA</option>
                <option>IPS</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>


            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 px-3 pr-8 rounded-lg bg-white border border-[#D0D5DD] text-[#344054] text-[12px] appearance-none cursor-pointer outline-none hover:border-[#7F56D9]"
              >
                <option>Semua Status</option>
                <option>Lengkap</option>
                <option>Verifikasi Berkas</option>
                <option>Belum Lengkap</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>


            <div className="relative">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="h-9 px-3 pr-8 rounded-lg bg-white border border-[#D0D5DD] text-[#344054] text-[12px] appearance-none cursor-pointer outline-none hover:border-[#7F56D9]"
              >
                <option>Semua Gender</option>
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>


            <button
              type="button"
              onClick={handleResetFilters}
              className="h-9 px-3 rounded-lg border border-[#D0D5DD] bg-white text-[#667085] text-[12px] font-medium flex items-center gap-1 hover:text-[#6941C6] hover:border-[#7F56D9] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#6E6678]">
            <span className="w-2 h-2 rounded-full bg-[#148557]" />
            <span>Menampilkan 420 siswa terdaftar</span>
          </div>
        </div>


        <div className="bg-white rounded-xl border border-[#EAECF0] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="bg-[#F8F9FC] border-b border-[#EAECF0] text-[#475467] font-semibold text-[11px]">
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredSiswa.length > 0 &&
                        selectedIds.length === filteredSiswa.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-[#D0D5DD] text-[#7F56D9] focus:ring-[#7F56D9] cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3.5">Siswa</th>
                  <th className="px-4 py-3.5">Kelas</th>
                  <th className="px-4 py-3.5">Gender</th>
                  <th className="px-4 py-3.5">Status Kelengkapan</th>
                  <th className="px-4 py-3.5">Rata-rata Rapor & Minat</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {filteredSiswa.map((siswa) => {
                  const isChecked = selectedIds.includes(siswa.id);
                  return (
                    <tr
                      key={siswa.id}
                      className={`hover:bg-[#F9F5FF] transition-colors ${isChecked ? "bg-[#FAF8FF]" : ""
                        }`}
                    >

                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(siswa.id)}
                          className="rounded border-[#D0D5DD] text-[#7F56D9] focus:ring-[#7F56D9] cursor-pointer"
                        />
                      </td>


                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-[#6941C6] shrink-0 border border-[#E9D7FE]"
                            style={{ background: siswa.initialsBg || "#F4EBFF" }}
                          >
                            {siswa.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1F1729]">
                              {siswa.nama}
                            </p>
                            <p className="text-[10px] text-[#6E6678]">
                              NISN: {siswa.nisn}
                            </p>
                          </div>
                        </div>
                      </td>


                      <td className="px-4 py-3.5 text-[#1F1729] font-medium">
                        {siswa.kelas}
                      </td>


                      <td className="px-4 py-3.5 text-[#6E6678]">
                        <span className="flex items-center gap-1.5">
                          <span>{siswa.gender === "Laki-laki" ? "♂" : "♀"}</span>
                          <span>{siswa.gender}</span>
                        </span>
                      </td>


                      <td className="px-4 py-3.5">
                        {siswa.statusKelengkapan === "Lengkap" && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#148557] text-[10px] font-semibold">
                            <span>Lengkap</span>
                            <span className="font-bold">
                              {siswa.kelengkapanDetail}
                            </span>
                          </div>
                        )}
                        {siswa.statusKelengkapan === "Verifikasi Berkas" && (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-[#FEF0C7] text-[#B54708] text-[10px] font-semibold">
                            Verifikasi Berkas
                          </span>
                        )}
                        {siswa.statusKelengkapan === "Belum Lengkap" && (
                          <div className="inline-flex flex-col">
                            <span className="px-2.5 py-1 rounded-full bg-[#FEE4E2] text-[#D92D20] text-[10px] font-semibold">
                              Belum Lengkap
                            </span>
                            <span className="text-[9px] text-[#D92D20] mt-0.5">
                              {siswa.kelengkapanDetail}
                            </span>
                          </div>
                        )}
                      </td>


                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-bold text-[#1F1729]">
                            {siswa.rataRapor.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-[#6E6678]">
                            Rekomendasi: {siswa.rekomendasiMinat}
                          </p>
                        </div>
                      </td>


                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-[#667085]">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDetailSiswa(siswa);
                              setIsDetailModalOpen(true);
                            }}
                            title="Lihat Detail Siswa"
                            className="p-1.5 rounded-md hover:bg-[#F4EBFF] hover:text-[#6941C6] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/admin/b2/edit-siswa/${siswa.id}`}
                            title="Edit Data Siswa"
                            className="p-1.5 rounded-md hover:bg-[#F4EBFF] hover:text-[#6941C6] transition-colors cursor-pointer inline-flex items-center justify-center"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            title="Hapus Siswa"
                            className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>


          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-t border-[#EAECF0] text-[11px] text-[#667085] bg-white">
            <div className="flex items-center gap-4">
              <span>Menampilkan 1-8 dari 420 siswa</span>
              <div className="flex items-center gap-1.5">
                <span>Tampilkan per halaman:</span>
                <select className="border border-[#D0D5DD] rounded-md px-2 py-0.5 bg-white text-[#1F1729] outline-none">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
            </div>


            <div className="flex items-center gap-1">
              <button
                type="button"
                className="px-2.5 py-1 rounded text-[#667085] hover:text-[#101828] disabled:opacity-40"
              >
                ‹ Sebelumnya
              </button>
              <button
                type="button"
                className="w-6 h-6 rounded-md bg-[#7F56D9] text-white font-bold flex items-center justify-center text-[11px] shadow-2xs"
              >
                1
              </button>
              <button
                type="button"
                className="w-6 h-6 rounded-md text-[#667085] hover:bg-[#F9F5FF] hover:text-[#6941C6] flex items-center justify-center text-[11px]"
              >
                2
              </button>
              <button
                type="button"
                className="w-6 h-6 rounded-md text-[#667085] hover:bg-[#F9F5FF] hover:text-[#6941C6] flex items-center justify-center text-[11px]"
              >
                3
              </button>
              <span className="px-1 text-[#667085]">...</span>
              <button
                type="button"
                className="w-6 h-6 rounded-md text-[#667085] hover:bg-[#F9F5FF] hover:text-[#6941C6] flex items-center justify-center text-[11px]"
              >
                10
              </button>
              <button
                type="button"
                className="px-2.5 py-1 rounded text-[#6941C6] font-semibold hover:underline"
              >
                Selanjutnya ›
              </button>
            </div>
          </div>
        </div>
      </div>

      <DetailSiswaModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        siswa={selectedDetailSiswa}
      />
    </div>
  );
}

