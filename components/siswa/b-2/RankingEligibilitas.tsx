"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Award, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Info, Loader2 } from "lucide-react";
import { eligibilitasService } from "@/services/b2";

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
  const [liveData, setLiveData] = useState<{
    siswa?: { id: number; nisn?: string; nama_lengkap: string };
    hasil_eligibilitas?: {
      periode?: string;
      peringkat?: number;
      total_skor_akhir?: number;
      status_eligible?: string;
      tanggal_kalkulasi?: string;
    };
    rincian_komponen?: {
      rapor?: { raw: number; normalisasi: number };
      tka?: { raw: number; normalisasi: number };
      prestasi?: { raw: number; normalisasi: number };
      presensi?: { raw: number; normalisasi: number };
      karakter?: { raw: number; normalisasi: number };
      organisasi?: { raw: number; normalisasi: number };
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      setIsLoading(true);
      try {
        const res = await eligibilitasService.getDetailSkorSiswaSaya();
        if (res?.data && isMounted) {
          setLiveData(res.data);
          setSyncNotice("Terhubung ke Engine Eligibilitas SMAN 8 Malang (Live API)");
        }
      } catch (err: any) {
        console.warn("Koneksi detail skor siswa (fallback):", err?.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, []);

  const dynamicKpiStats: KpiStat[] = [
    {
      label: "NILAI RATA-RATA KAMU",
      value: liveData?.rincian_komponen?.rapor?.raw
        ? Number(liveData.rincian_komponen.rapor.raw).toFixed(1).replace(".", ",")
        : KPI_STATS[0].value,
      description: "Dari seluruh semester & mata pelajaran",
    },
    {
      label: "NILAI TES AKADEMIK (TKA)",
      value: liveData?.rincian_komponen?.tka?.raw
        ? Number(liveData.rincian_komponen.tka.raw).toFixed(1).replace(".", ",")
        : "88,5",
      description: "Skor Tes Kemampuan Akademik",
    },
    {
      label: "TOTAL SKOR ELIGIBILITAS",
      value: liveData?.hasil_eligibilitas?.total_skor_akhir
        ? Number(liveData.hasil_eligibilitas.total_skor_akhir).toFixed(1).replace(".", ",")
        : "91,2",
      description: "Akumulasi pembobotan SPMK",
    },
    {
      label: "PERINGKAT SEKOLAH",
      value: liveData?.hasil_eligibilitas?.peringkat
        ? `#${liveData.hasil_eligibilitas.peringkat}`
        : "#1",
      description: `Status: ${liveData?.hasil_eligibilitas?.status_eligible || "Eligible"} (Kuota 40%)`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full max-w-[1360px] mx-auto text-[#14141C]">
      {/* ──────────────────────────────────────────────────────────
          HERO STATUS ELIGIBILITAS SISWA (LIVE DARI ENGINE B2)
         ────────────────────────────────────────────────────────── */}
      <div className="rounded-[16px] bg-gradient-to-r from-[#5F089E] to-[#7915C4] text-white p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-900 text-[11px] font-bold flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              {liveData?.hasil_eligibilitas?.status_eligible || "Eligible SNBP"}
            </span>
            <span className="text-[11px] font-medium text-purple-200">
              Periode {liveData?.hasil_eligibilitas?.periode || "2025/2026"}
            </span>
            {syncNotice && (
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white/90">
                Live Engine
              </span>
            )}
            {isLoading && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-200" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ fontFamily: "Inter, sans-serif" }}>
            {liveData?.siswa?.nama_lengkap || "Ahmad B2 Pratama"}
          </h2>
          <p className="text-xs text-purple-100 max-w-xl">
            Selamat! Berdasarkan hasil kalkulasi multi-kriteria SPMK, profil akademikmu masuk dalam <strong>kuota 40% siswa eligible SNBP</strong> SMAN 8 Malang.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-3.5 sm:p-4 rounded-xl border border-white/20 shrink-0">
          <div className="text-center px-2">
            <span className="block text-[10px] font-semibold text-purple-200 uppercase">Peringkat</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-300">
              #{liveData?.hasil_eligibilitas?.peringkat ?? 1}
            </span>
          </div>
          <div className="w-[1px] h-10 bg-white/20" />
          <div className="text-center px-2">
            <span className="block text-[10px] font-semibold text-purple-200 uppercase">Total Skor</span>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {liveData?.hasil_eligibilitas?.total_skor_akhir
                ? Number(liveData.hasil_eligibilitas.total_skor_akhir).toFixed(1)
                : "91.2"}
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          RINCIAN 6 KOMPONEN PEMBOBOTAN ELIGIBILITAS (SPMK)
         ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[14px] p-5 border border-purple-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-[14px] sm:text-[15px] text-[#1A1721] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#6305B0]" />
              Rincian Komponen Skor Eligibilitas (Bobot SPMK)
            </h3>
            <p className="text-[11px] text-slate-500">
              Komposisi pembobotan objektif berdasarkan formula SPMK SMAN 8 Malang
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#6305B0] bg-[#F2E8F7] px-2.5 py-1 rounded-lg">
            Terverifikasi Sistem
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Rapor (40%)", raw: liveData?.rincian_komponen?.rapor?.raw ?? 89.27, norm: liveData?.rincian_komponen?.rapor?.normalisasi ?? 89.27, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "TKA (20%)", raw: liveData?.rincian_komponen?.tka?.raw ?? 88.5, norm: liveData?.rincian_komponen?.tka?.normalisasi ?? 88.5, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Prestasi (15%)", raw: liveData?.rincian_komponen?.prestasi?.raw ?? 95.0, norm: liveData?.rincian_komponen?.prestasi?.normalisasi ?? 95.0, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Presensi (10%)", raw: liveData?.rincian_komponen?.presensi?.raw ?? 98.0, norm: liveData?.rincian_komponen?.presensi?.normalisasi ?? 98.0, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "Karakter (10%)", raw: liveData?.rincian_komponen?.karakter?.raw ?? 85.0, norm: liveData?.rincian_komponen?.karakter?.normalisasi ?? 85.0, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Organisasi (5%)", raw: liveData?.rincian_komponen?.organisasi?.raw ?? 80.0, norm: liveData?.rincian_komponen?.organisasi?.normalisasi ?? 80.0, color: "text-indigo-600", bg: "bg-indigo-50" },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-xl border border-slate-100 ${item.bg} flex flex-col justify-between`}>
              <span className="text-[10px] font-bold text-slate-600 block mb-1">{item.label}</span>
              <div>
                <span className={`text-[16px] sm:text-[18px] font-black ${item.color}`}>
                  {Number(item.raw).toFixed(1)}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Norm: {Number(item.norm).toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
        {dynamicKpiStats.map((kpi) => (
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
