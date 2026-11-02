"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

// ── 1. Data Alur Perbandingan ──
interface WorkflowStep {
  number: string;
  title: string;
  description: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    number: "01",
    title: "Ambil nilai siswa",
    description: "Nilai akademik kamu",
  },
  {
    number: "02",
    title: "Cari alumni serupa",
    description: "Berdasarkan kemiripan nilai",
  },
  {
    number: "03",
    title: "Olah perbandingan",
    description: "Nilai siswa dan alumni",
  },
  {
    number: "04",
    title: "Lihat hasil",
    description: "Ringkasan dan detail",
  },
];

// ── 2. Data Kartu Ringkasan Statistik Nilai ──
interface KpiStat {
  label: string;
  value: string;
  description: string;
}

const KPI_STATS: KpiStat[] = [
  {
    label: "NILAI RATA-RATA KAMU",
    value: "88,6",
    description: "Dari seluruh mata pelajaran",
  },
  {
    label: "RATA-RATA ALUMNI SERUPA",
    value: "87,9",
    description: "Alumni dengan profil nilai mirip",
  },
  {
    label: "SELISIH NILAI",
    value: "+0,7",
    description: "Di atas rata-rata alumni",
  },
  {
    label: "ALUMNI DIBANDINGKAN",
    value: "24",
    description: "Data alumni yang cocok",
  },
];

// ── 3. Data Perbandingan Nilai Akademik (Grafik Batang Horizontal) ──
interface PerbandinganKategori {
  kategori: string;
  nilaiKamu: number;
  nilaiAlumni: number;
}

const DATA_PERBANDINGAN_GRAFIK: PerbandinganKategori[] = [
  { kategori: "Mapel umum", nilaiKamu: 89, nilaiAlumni: 87 },
  { kategori: "Mapel pilihan", nilaiKamu: 86, nilaiAlumni: 85 },
  { kategori: "Informatika", nilaiKamu: 96, nilaiAlumni: 91 },
  { kategori: "Bahasa Inggris", nilaiKamu: 91, nilaiAlumni: 90 },
  { kategori: "Matematika", nilaiKamu: 88, nilaiAlumni: 89 },
];

// ── 4. Data Alumni dengan Nilai Serupa ──
interface AlumniSerupa {
  initial: string;
  nama: string;
  tahun: string;
  nilai: string;
  statusKemiripan: "Sangat mirip" | "Mirip";
}

const DATA_ALUMNI_SERUPA: AlumniSerupa[] = [
  {
    initial: "A",
    nama: "Alumni A",
    tahun: "Lulus 2024",
    nilai: "89,2",
    statusKemiripan: "Sangat mirip",
  },
  {
    initial: "B",
    nama: "Alumni B",
    tahun: "Lulus 2023",
    nilai: "88,4",
    statusKemiripan: "Mirip",
  },
  {
    initial: "C",
    nama: "Alumni C",
    tahun: "Lulus 2025",
    nilai: "87,8",
    statusKemiripan: "Mirip",
  },
];

// ── 5. Data Tabel Detail Perbandingan Nilai ──
interface DetailNilaiRow {
  mataPelajaran: string;
  nilaiKamu: number;
  rataAlumni: number;
  selisih: string;
  keterangan: string;
  selisihStatus: "positif" | "negatif" | "netral";
}

const DATA_DETAIL_TABEL: DetailNilaiRow[] = [
  {
    mataPelajaran: "Pendidikan Agama",
    nilaiKamu: 90,
    rataAlumni: 88,
    selisih: "+2",
    keterangan: "Di atas rata-rata",
    selisihStatus: "positif",
  },
  {
    mataPelajaran: "Pendidikan Pancasila",
    nilaiKamu: 92,
    rataAlumni: 90,
    selisih: "+2",
    keterangan: "Di atas rata-rata",
    selisihStatus: "positif",
  },
  {
    mataPelajaran: "Bahasa Indonesia",
    nilaiKamu: 89,
    rataAlumni: 90,
    selisih: "-1",
    keterangan: "Sedikit di bawah",
    selisihStatus: "negatif",
  },
  {
    mataPelajaran: "Bahasa Inggris",
    nilaiKamu: 91,
    rataAlumni: 89,
    selisih: "+2",
    keterangan: "Di atas rata-rata",
    selisihStatus: "positif",
  },
  {
    mataPelajaran: "PJOK",
    nilaiKamu: 88,
    rataAlumni: 87,
    selisih: "+1",
    keterangan: "Di atas rata-rata",
    selisihStatus: "positif",
  },
  {
    mataPelajaran: "Sejarah",
    nilaiKamu: 86,
    rataAlumni: 86,
    selisih: "0",
    keterangan: "Setara",
    selisihStatus: "netral",
  },
  {
    mataPelajaran: "Seni Budaya",
    nilaiKamu: 93,
    rataAlumni: 90,
    selisih: "+3",
    keterangan: "Di atas rata-rata",
    selisihStatus: "positif",
  },
  {
    mataPelajaran: "Informatika",
    nilaiKamu: 96,
    rataAlumni: 91,
    selisih: "+5",
    keterangan: "Jauh di atas",
    selisihStatus: "positif",
  },
];

export default function RankingEligibilitas() {
  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full max-w-[1360px] mx-auto text-[#14141C]">
      {/* ──────────────────────────────────────────────────────────
          SECTION 1: ALUR PERBANDINGAN
         ────────────────────────────────────────────────────────── */}
      <div>
        <p
          className="text-[10px] font-bold text-[#6305B0] uppercase tracking-wider mb-2.5"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          ALUR PERBANDINGAN
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {WORKFLOW_STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-[#F2E8F7] rounded-[10px] p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Lingkaran nomor berbingkai ungu */}
                <div className="w-[34px] h-[34px] rounded-full bg-white border border-[#6305B0] flex items-center justify-center shrink-0">
                  <span
                    className="text-[10px] font-bold text-[#6305B0]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {step.number}
                  </span>
                </div>

                <div className="truncate">
                  <h3
                    className="text-[11px] font-semibold text-[#1A1721] truncate leading-tight"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-[9px] text-[#6E6B7A] truncate mt-0.5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Ikon panah ke kanan */}
              <ArrowRight className="w-4 h-4 text-[#6305B0] shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          SECTION 2: KARTU RINGKASAN STATISTIK NILAI (4 KARTU)
         ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {KPI_STATS.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#F2E8F7] rounded-[12px] p-4 sm:p-4.5 flex flex-col justify-between min-h-[108px] shadow-2xs"
          >
            <p
              className="text-[9px] font-semibold text-[#6E6B7A] uppercase tracking-wider"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {kpi.label}
            </p>

            <div className="my-1">
              <span
                className="text-[25px] sm:text-[27px] font-bold text-[#6305B0] leading-none tracking-tight"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {kpi.value}
              </span>
            </div>

            <p
              className="text-[9px] text-[#6E6B7A]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {kpi.description}
            </p>
          </div>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────────
          SECTION 3: DUA PANEL BERDAMPINGAN (GRAFIK & DAFTAR ALUMNI)
         ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* Panel Kiri: Perbandingan Nilai Akademik (Grafik Bar Horizontal) */}
        <div className="bg-[#F2E8F7] rounded-[12px] p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <h2
              className="text-[15px] font-bold text-[#1A1721] leading-snug"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Perbandingan Nilai Akademik
            </h2>
            <p
              className="text-[10px] text-[#6E6B7A] mt-0.5 mb-3"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Rata-rata nilai per kelompok mata pelajaran
            </p>

            {/* Legenda Grafik */}
            <div className="flex items-center gap-5 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[#6305B0]"></span>
                <span
                  className="text-[9px] font-medium text-[#1A1721]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Nilai kamu
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[#476EF2]"></span>
                <span
                  className="text-[9px] font-medium text-[#1A1721]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Rata-rata alumni
                </span>
              </div>
            </div>

            {/* Daftar Batang Horizontal */}
            <div className="space-y-3.5">
              {DATA_PERBANDINGAN_GRAFIK.map((item) => {
                // Menghitung persentase lebar batang (berbasis nilai max ~100)
                const widthKamuPercent = Math.max(10, Math.min(100, (item.nilaiKamu / 100) * 100));
                const widthAlumniPercent = Math.max(10, Math.min(100, (item.nilaiAlumni / 100) * 100));

                return (
                  <div key={item.kategori} className="flex items-center gap-3">
                    {/* Label Kategori */}
                    <div
                      className="w-[95px] sm:w-[110px] text-[10px] font-medium text-[#1A1721] shrink-0 truncate"
                      style={{ fontFamily: "Inter, sans-serif" }}
                      title={item.kategori}
                    >
                      {item.kategori}
                    </div>

                    {/* Area 2 Bar Stack Vertikal Halus */}
                    <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
                      {/* Bar Nilai Kamu (Ungu, tebal 10px) */}
                      <div className="w-full bg-transparent h-[10px] flex items-center">
                        <div
                          className="h-[10px] bg-[#6305B0] rounded-[4px] transition-all duration-300"
                          style={{ width: `${widthKamuPercent}%` }}
                        />
                      </div>

                      {/* Bar Rata-rata Alumni (Biru, tinggi 7px) */}
                      <div className="w-full bg-transparent h-[7px] flex items-center">
                        <div
                          className="h-[7px] bg-[#476EF2] rounded-[4px] transition-all duration-300"
                          style={{ width: `${widthAlumniPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Angka Nilai di Ujung */}
                    <div className="flex items-center gap-2.5 shrink-0 w-[55px] justify-end">
                      <span
                        className="text-[9px] font-bold text-[#6305B0] w-5 text-right"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.nilaiKamu}
                      </span>
                      <span
                        className="text-[9px] font-bold text-[#476EF2] w-5 text-right"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.nilaiAlumni}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Kanan: Alumni dengan Nilai Serupa */}
        <div className="bg-[#F2E8F7] rounded-[12px] p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <h2
              className="text-[15px] font-bold text-[#1A1721] leading-snug"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Alumni dengan Nilai Serupa
            </h2>
            <p
              className="text-[10px] text-[#6E6B7A] mt-0.5 mb-4"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Sistem mencocokkan profil nilai untuk pembanding yang relevan.
            </p>

            {/* List Alumni Items */}
            <div className="space-y-2.5">
              {DATA_ALUMNI_SERUPA.map((alumni) => {
                const isSangatMirip = alumni.statusKemiripan === "Sangat mirip";
                return (
                  <div
                    key={alumni.nama}
                    className="w-full bg-white rounded-[8px] p-2.5 sm:px-3 sm:py-2.5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    {/* Sisi Kiri: Avatar & Info Alumni */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-[34px] h-[34px] rounded-full bg-[#E6D1F0] flex items-center justify-center shrink-0">
                        <span
                          className="text-[11px] font-bold text-[#6305B0]"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {alumni.initial}
                        </span>
                      </div>

                      <div className="truncate">
                        <p
                          className="text-[11px] font-semibold text-[#1A1721] leading-tight truncate"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {alumni.nama}
                        </p>
                        <p
                          className="text-[9px] text-[#6E6B7A] mt-0.5 truncate"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {alumni.tahun}
                        </p>
                      </div>
                    </div>

                    {/* Sisi Kanan: Skor & Badge Status Kemiripan */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <span
                        className="text-[12px] font-bold text-[#6305B0]"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {alumni.nilai}
                      </span>

                      <div
                        className={`px-3 py-1 rounded-[6px] text-[9px] font-medium min-w-[85px] text-center ${
                          isSangatMirip
                            ? "bg-[#E0F5E8] text-[#148557]"
                            : "bg-[#DEE8FF] text-[#476EF2]"
                        }`}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {alumni.statusKemiripan}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          SECTION 4: TABEL DETAIL PERBANDINGAN NILAI
         ────────────────────────────────────────────────────────── */}
      <div className="bg-[#F2E8F7] rounded-[12px] p-4 sm:p-5 shadow-2xs">
        {/* Header Bagian Tabel */}
        <div className="mb-3.5">
          <h2
            className="text-[16px] font-bold text-[#1A1721] leading-snug"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Detail Perbandingan Nilai
          </h2>
          <p
            className="text-[10px] text-[#6E6B7A] mt-0.5"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Nilai siswa dibandingkan dengan rata-rata alumni yang memiliki nilai serupa.
          </p>
        </div>

        {/* Tabel Data Responsif */}
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[700px]">
            {/* Header Kolom Tabel */}
            <div className="w-full h-[34px] bg-[#E6D1F0] rounded-[6px] px-3.5 grid grid-cols-[1.5fr_100px_120px_90px_140px] items-center gap-2 mb-2">
              <div
                className="text-[9px] font-bold text-[#6305B0] uppercase tracking-wider text-left"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                MATA PELAJARAN
              </div>
              <div
                className="text-[9px] font-bold text-[#6305B0] uppercase tracking-wider text-left pl-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                NILAI KAMU
              </div>
              <div
                className="text-[9px] font-bold text-[#6305B0] uppercase tracking-wider text-left pl-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                RATA-RATA ALUMNI
              </div>
              <div
                className="text-[9px] font-bold text-[#6305B0] uppercase tracking-wider text-left pl-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                SELISIH
              </div>
              <div
                className="text-[9px] font-bold text-[#6305B0] uppercase tracking-wider text-left"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                KETERANGAN
              </div>
            </div>

            {/* Baris-Baris Data Tabel */}
            <div className="space-y-1.5">
              {DATA_DETAIL_TABEL.map((row) => {
                // Penentuan warna selisih: hijau (+) positif, oranye (-) negatif, netral (0)
                let selisihColor = "text-[#6E6B7A]";
                if (row.selisihStatus === "positif") {
                  selisihColor = "text-[#148557]"; // hijau
                } else if (row.selisihStatus === "negatif") {
                  selisihColor = "text-[#A6630F]"; // oranye
                }

                return (
                  <div
                    key={row.mataPelajaran}
                    className="w-full min-h-[33px] bg-white rounded-[4px] px-3.5 py-1.5 grid grid-cols-[1.5fr_100px_120px_90px_140px] items-center gap-2 transition-colors hover:bg-[#FAF6FC]"
                  >
                    {/* 1. Mata Pelajaran */}
                    <div
                      className="text-[10px] font-medium text-[#1A1721] text-left truncate"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {row.mataPelajaran}
                    </div>

                    {/* 2. Nilai Kamu (Ungu) */}
                    <div
                      className="text-[11px] font-bold text-[#6305B0] text-left pl-1"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {row.nilaiKamu}
                    </div>

                    {/* 3. Rata-rata Alumni (Biru) */}
                    <div
                      className="text-[11px] font-bold text-[#476EF2] text-left pl-1"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {row.rataAlumni}
                    </div>

                    {/* 4. Selisih (Warna sesuai nilai) */}
                    <div
                      className={`text-[10px] font-semibold text-left pl-1 ${selisihColor}`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {row.selisih}
                    </div>

                    {/* 5. Keterangan */}
                    <div
                      className="text-[9px] text-[#6E6B7A] text-left truncate"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {row.keterangan}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
