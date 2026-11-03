"use client";

import { useState } from "react";
import { Search, Download, Filter, ChevronDown } from "lucide-react";

// ── 1. Data Profil Siswa ──
const PROFIL_SISWA = {
  nama: "Alya Putri Rahma",
  kelas: "Kelas XII TKJ",
  tahunAjaran: "Tahun ajaran 2026/2027",
  rataRataNilai: 88.4,
};

// ── 2. Data KPI Hasil Perbandingan ──
const KPI_DATA = [
  {
    label: "ALUMNI YANG MIRIP",
    value: "12",
    note: "Dari data alumni tersedia",
  },
  {
    label: "KEMIRIPAN TERTINGGI",
    value: "92%",
    note: "Profil nilai paling mendekati",
  },
  {
    label: "RATA-RATA NILAI SAYA",
    value: "88,4",
    note: "Berdasarkan nilai akademik",
  },
];

// ── 3. Data Grafik Perbandingan per Mata Pelajaran ──
interface MataPelajaranBar {
  nama: string;
  nilaiku: number;
  nilaiAlumni: number;
  maxNilai: number;
}

const DATA_GRAFIK: MataPelajaranBar[] = [
  { nama: "Matematika",       nilaiku: 88, nilaiAlumni: 82, maxNilai: 100 },
  { nama: "Bahasa Indonesia", nilaiku: 91, nilaiAlumni: 87, maxNilai: 100 },
  { nama: "Bahasa Inggris",   nilaiku: 84, nilaiAlumni: 86, maxNilai: 100 },
  { nama: "Produktif TKJ",    nilaiku: 93, nilaiAlumni: 89, maxNilai: 100 },
];

// ── 4. Data Tabel Alumni dengan Nilai Serupa ──
interface AlumniRow {
  rank: number;
  nama: string;
  nisn: string;
  nilaiRataRata: number;
  skor: number;
  programStudi: string;
  angkatan: number;
}

const DATA_ALUMNI: AlumniRow[] = [
  { rank: 1, nama: "Nadia Putri Ramadhani",  nisn: "0061284731", nilaiRataRata: 94.20, skor: 98.4, programStudi: "Teknik Informatika", angkatan: 2024 },
  { rank: 2, nama: "Rizky Aditya Pratama",   nisn: "0061284718", nilaiRataRata: 93.85, skor: 97.9, programStudi: "Teknik Informatika", angkatan: 2024 },
  { rank: 3, nama: "Salsabila Nur Aini",     nisn: "0061284792", nilaiRataRata: 92.70, skor: 96.8, programStudi: "Teknik Komputer",    angkatan: 2024 },
  { rank: 4, nama: "Muhammad Farhan",        nisn: "0061284706", nilaiRataRata: 91.45, skor: 95.2, programStudi: "Teknik Komputer",    angkatan: 2024 },
  { rank: 5, nama: "Alya Safitri",           nisn: "0061284765", nilaiRataRata: 90.80, skor: 93.7, programStudi: "Sistem Informasi",   angkatan: 2024 },
];

// ── Warna medali ──
function MedalColor(rank: number): string {
  if (rank === 1) return "#F2B32E";
  if (rank === 2) return "#C4CFDE";
  if (rank === 3) return "#C79163";
  return "transparent";
}

// ── Komponen Utama ──
export default function PerbandinganNilai() {
  const [angkatan, setAngkatan] = useState("Semua angkatan");
  const [kelompokMapel, setKelompokMapel] = useState("Semua mata pelajaran");
  const [programStudi, setProgramStudi] = useState("Semua program studi");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalAlumni = 248;
  const pageSize = 5;
  const totalPages = Math.ceil(totalAlumni / pageSize);

  const filteredAlumni = DATA_ALUMNI.filter(
    (a) =>
      a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nisn.includes(searchQuery)
  );

  return (
    <div
      className="flex flex-col gap-6 w-full max-w-[1360px] mx-auto"
      style={{ fontFamily: "Inter, sans-serif", color: "#1F1729" }}
    >
      {/* ─── ROW 1: Profil + Atur Perbandingan ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 items-stretch">
        {/* Kartu Profil Siswa */}
        <div
          className="rounded-[12px] p-5 sm:p-6 flex flex-col justify-between"
          style={{ background: "#F0E5F5", minHeight: 180 }}
        >
          <div>
            <p
              className="text-[12px] font-semibold uppercase tracking-wider mb-2.5"
              style={{ color: "#6E6678" }}
            >
              PROFIL AKADEMIK SAYA
            </p>
            <h2
              className="font-bold text-[22px] leading-tight mb-1.5"
              style={{ color: "#1F1729", fontFamily: "Inter, sans-serif" }}
            >
              {PROFIL_SISWA.nama}
            </h2>
            <p className="text-[12px]" style={{ color: "#6E6678" }}>
              {PROFIL_SISWA.kelas}&nbsp;•&nbsp;{PROFIL_SISWA.tahunAjaran}
            </p>
          </div>
          <div
            className="mt-4 rounded-[8px] px-3.5 py-2 inline-flex flex-col"
            style={{ background: "#F0E6F7", width: 160 }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#6E6678" }}
            >
              RATA-RATA NILAI
            </span>
            <span
              className="font-bold text-[20px] leading-tight"
              style={{ color: "#6200A8" }}
            >
              {PROFIL_SISWA.rataRataNilai.toFixed(1).replace(".", ",")}
            </span>
          </div>
        </div>

        {/* Kartu Atur Perbandingan */}
        <div
          className="rounded-[12px] p-5 sm:p-6 flex flex-col justify-between"
          style={{ background: "#F0E5F5" }}
        >
          <p
            className="font-bold text-[18px] mb-3.5"
            style={{ color: "#1F1729" }}
          >
            Atur Perbandingan
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            {/* Dropdown Angkatan */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#6E6678" }}
              >
                ANGKATAN ALUMNI
              </label>
              <div
                className="relative flex items-center rounded-[7px] px-3 h-10 cursor-pointer"
                style={{
                  background: "#FCFCFF",
                  border: "1px solid #E8E3ED",
                }}
              >
                <span className="text-[12px] font-medium flex-1 truncate" style={{ color: "#1F1729" }}>
                  {angkatan}
                </span>
                <ChevronDown className="w-4 h-4 ml-1 shrink-0" style={{ color: "#6E6678" }} />
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  value={angkatan}
                  onChange={(e) => setAngkatan(e.target.value)}
                >
                  <option>Semua angkatan</option>
                  <option>2024</option>
                  <option>2023</option>
                  <option>2022</option>
                </select>
              </div>
            </div>

            {/* Dropdown Kelompok Mata Pelajaran */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#6E6678" }}
              >
                KELOMPOK MATA PELAJARAN
              </label>
              <div
                className="relative flex items-center rounded-[7px] px-3 h-10 cursor-pointer"
                style={{ background: "#FCFCFF", border: "1px solid #E8E3ED" }}
              >
                <span className="text-[12px] font-medium flex-1 truncate" style={{ color: "#1F1729" }}>
                  {kelompokMapel}
                </span>
                <ChevronDown className="w-4 h-4 ml-1 shrink-0" style={{ color: "#6E6678" }} />
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  value={kelompokMapel}
                  onChange={(e) => setKelompokMapel(e.target.value)}
                >
                  <option>Semua mata pelajaran</option>
                  <option>Matematika & Sains</option>
                  <option>Bahasa</option>
                  <option>Produktif</option>
                </select>
              </div>
            </div>

            {/* Dropdown Program Studi */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#6E6678" }}
              >
                PROGRAM STUDI
              </label>
              <div
                className="relative flex items-center rounded-[7px] px-3 h-10 cursor-pointer"
                style={{ background: "#FCFCFF", border: "1px solid #E8E3ED" }}
              >
                <span className="text-[12px] font-medium flex-1 truncate" style={{ color: "#1F1729" }}>
                  {programStudi}
                </span>
                <ChevronDown className="w-4 h-4 ml-1 shrink-0" style={{ color: "#6E6678" }} />
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  value={programStudi}
                  onChange={(e) => setProgramStudi(e.target.value)}
                >
                  <option>Semua program studi</option>
                  <option>Teknik Informatika</option>
                  <option>Teknik Komputer</option>
                  <option>Sistem Informasi</option>
                </select>
              </div>
            </div>

            {/* Tombol Bandingkan */}
            <button
              className="h-10 px-5 rounded-[7px] font-semibold text-[12px] text-white shrink-0 transition-opacity hover:opacity-90 active:opacity-80"
              style={{ background: "#6200A8" }}
            >
              Bandingkan
            </button>
          </div>
        </div>
      </div>

      {/* ─── ROW 2: KPI Cards ─── */}
      <div>
        <h2
          className="font-bold text-[22px] mb-3.5"
          style={{ color: "#1F1729", fontFamily: "Inter, sans-serif" }}
        >
          Hasil Perbandingan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {KPI_DATA.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-[11px] p-5 sm:p-6"
              style={{ background: "#F0E5F5" }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#6E6678" }}
              >
                {kpi.label}
              </p>
              <p
                className="font-bold text-[26px] leading-tight mb-1"
                style={{ color: "#1F1729" }}
              >
                {kpi.value}
              </p>
              <p className="text-[11px]" style={{ color: "#6E6678" }}>
                {kpi.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ROW 3: Grafik Perbandingan per Mata Pelajaran ─── */}
      <div
        className="rounded-[12px] p-6"
        style={{ background: "#F0E5F5" }}
      >
        <p
          className="font-bold text-[18px] mb-1"
          style={{ color: "#1F1729" }}
        >
          Perbandingan Nilai per Mata Pelajaran
        </p>
        <p className="text-[12px] mb-4" style={{ color: "#6E6678" }}>
          Nilaiku dibandingkan dengan rata-rata alumni terpilih.
        </p>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-2.5 rounded-[2px]"
              style={{ background: "#6200A8" }}
            />
            <span className="text-[11px] font-medium" style={{ color: "#6E6678" }}>
              Nilai saya
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-2.5 rounded-[2px]"
              style={{ background: "#B8A1D1" }}
            />
            <span className="text-[11px] font-medium" style={{ color: "#6E6678" }}>
              Rata-rata alumni
            </span>
          </div>
        </div>

        {/* Bar rows */}
        <div className="flex flex-col gap-5">
          {DATA_GRAFIK.map((item) => {
            const pctKu = (item.nilaiku / item.maxNilai) * 100;
            const pctAlumni = (item.nilaiAlumni / item.maxNilai) * 100;
            return (
              <div key={item.nama} className="flex items-start gap-4">
                {/* Label Mata Pelajaran */}
                <div
                  className="text-[13px] font-medium shrink-0 pt-0.5"
                  style={{ color: "#6E6678", width: 150 }}
                >
                  {item.nama}
                </div>

                {/* Bars */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-2.5 rounded-[4px] bg-white/50 overflow-hidden">
                      <div
                        className="h-full rounded-[4px] transition-all duration-700"
                        style={{
                          width: `${pctKu}%`,
                          background: "#6200A8",
                        }}
                      />
                    </div>
                    <span
                      className="text-[11px] font-bold w-6 text-right"
                      style={{ color: "#1F1729" }}
                    >
                      {item.nilaiku}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-2.5 rounded-[4px] bg-white/50 overflow-hidden">
                      <div
                        className="h-full rounded-[4px] transition-all duration-700"
                        style={{
                          width: `${pctAlumni}%`,
                          background: "#B8A1D1",
                        }}
                      />
                    </div>
                    <span
                      className="text-[11px] font-medium w-6 text-right"
                      style={{ color: "#6E6678" }}
                    >
                      {item.nilaiAlumni}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── ROW 4: Tabel Alumni dengan Nilai Serupa ─── */}
      <div
        className="rounded-[12px] overflow-hidden"
        style={{
          background: "#F0E6F5",
          border: "1.5px solid #6305B0",
        }}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5 border-b border-[#DECFE8]">
          <h3
            className="font-bold text-[18px] flex-1 min-w-[200px]"
            style={{ color: "#1F1729" }}
          >
            Alumni dengan Nilai Serupa
          </h3>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3.5 h-10 rounded-[9px] flex-1 min-w-[190px] max-w-[280px]"
            style={{ background: "#FFFFFF", border: "1px solid #DECFE8" }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: "#6E6B78" }} />
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[12px]"
              style={{ color: "#1F1729", fontFamily: "Inter, sans-serif" }}
            />
          </div>

          {/* Filter Angkatan */}
          <button
            className="h-10 px-4 rounded-[9px] font-semibold text-[12px] flex items-center gap-1.5 shrink-0"
            style={{
              background: "#FFFFFF",
              border: "1px solid #6305B0",
              color: "#6305B0",
            }}
          >
            2026/2027 Ganjil
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Filter */}
          <button
            className="h-10 px-4 rounded-[9px] font-semibold text-[12px] flex items-center gap-1.5 shrink-0"
            style={{
              background: "#FFFFFF",
              border: "1px solid #6305B0",
              color: "#6305B0",
            }}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>

          {/* Unduh CSV */}
          <button
            className="h-10 px-4 rounded-[9px] font-semibold text-[12px] flex items-center gap-1.5 shrink-0 text-white hover:opacity-90 transition-opacity"
            style={{ background: "#6305B0" }}
          >
            <Download className="w-4 h-4" />
            Unduh CSV
          </button>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  RANK
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  NAMA SISWA
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  NISN
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  NILAI RATA-RATA
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  SKOR
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  PROGRAM STUDI
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  ANGKATAN
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAlumni.map((row, idx) => {
                const isShade = idx % 2 === 1;
                const medalColor = MedalColor(row.rank);
                const isTop3 = row.rank <= 3;
                return (
                  <tr
                    key={row.nisn}
                    style={{ background: isShade ? "#F7F0FA" : "transparent" }}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-bold text-[13px]"
                          style={{
                            color: isTop3 ? "#6305B0" : "#6E6B78",
                          }}
                        >
                          {String(row.rank).padStart(2, "0")}
                        </span>
                        {isTop3 && (
                          <span
                            className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ background: medalColor }}
                          >
                            {row.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Nama */}
                    <td
                      className="px-4 py-3.5 text-[13px] font-medium"
                      style={{ color: "#14141C" }}
                    >
                      {row.nama}
                    </td>

                    {/* NISN */}
                    <td
                      className="px-4 py-3.5 text-[12px]"
                      style={{ color: "#6E6B78" }}
                    >
                      {row.nisn}
                    </td>

                    {/* Nilai Rata-Rata */}
                    <td
                      className="px-4 py-3.5 text-[13px] font-medium"
                      style={{ color: "#14141C" }}
                    >
                      {row.nilaiRataRata.toFixed(2).replace(".", ",")}
                    </td>

                    {/* Skor */}
                    <td
                      className="px-4 py-3.5 text-[13px] font-semibold"
                      style={{ color: "#6305B0" }}
                    >
                      {row.skor.toFixed(1).replace(".", ",")}
                    </td>

                    {/* Program Studi */}
                    <td
                      className="px-4 py-3.5 text-[12px]"
                      style={{ color: "#6E6B78" }}
                    >
                      {row.programStudi}
                    </td>

                    {/* Angkatan */}
                    <td
                      className="px-4 py-3.5 text-[13px] font-semibold"
                      style={{ color: "#14141C" }}
                    >
                      {row.angkatan}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel */}
        <div
          className="flex items-center justify-between px-4 py-3.5 border-t"
          style={{ borderColor: "#DECFE8" }}
        >
          <span className="text-[12px] font-medium" style={{ color: "#6E6678" }}>
            Menampilkan {filteredAlumni.length} dari {totalAlumni} siswa
          </span>

          {/* Pagination */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded flex items-center justify-center text-[13px] font-bold disabled:opacity-40"
              style={{ color: "#6305B0" }}
            >
              ‹
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className="w-7 h-7 rounded text-[12px] font-semibold transition-colors"
                style={{
                  background: currentPage === p ? "#6305B0" : "transparent",
                  color: currentPage === p ? "#FFFFFF" : "#6305B0",
                }}
              >
                {p}
              </button>
            ))}
            <span className="text-[12px] font-semibold px-1" style={{ color: "#6305B0" }}>
              ...
            </span>
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="w-7 h-7 rounded text-[12px] font-semibold"
              style={{ color: "#6305B0" }}
            >
              {totalPages}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded flex items-center justify-center text-[13px] font-bold disabled:opacity-40"
              style={{ color: "#6305B0" }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
