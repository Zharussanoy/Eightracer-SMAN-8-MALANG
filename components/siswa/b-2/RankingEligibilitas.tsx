"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Info,
  Loader2,
  Printer,
  Download,
  RotateCcw,
  Search,
  Users,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import { eligibilitasService, akademikService } from "@/services/b2";
import { useUser } from "@/context/UserContext";

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

// ── 2. Data Kartu Ringkasan Statistik Nilai Default (Fallback) ──
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
    label: "NILAI TES AKADEMIK (TKA)",
    value: "88,5",
    description: "Skor Tes Kemampuan Akademik",
  },
  {
    label: "TOTAL SKOR ELIGIBILITAS",
    value: "63,2",
    description: "Akumulasi pembobotan SPMK",
  },
  {
    label: "PERINGKAT SEKOLAH",
    value: "#1",
    description: "Status: Eligible (Kuota 40%)",
  },
];

// ── 3. Data Perbandingan Nilai Akademik (Grafik Batang Horizontal) ──
interface PerbandinganKategori {
  kategori: string;
  nilaiKamu: number;
  nilaiAlumni: number;
}

const DATA_PERBANDINGAN_GRAFIK: PerbandinganKategori[] = [
  { kategori: "Matematika Umum", nilaiKamu: 89, nilaiAlumni: 87 },
  { kategori: "Informatika", nilaiKamu: 92, nilaiAlumni: 90 },
  { kategori: "Bahasa Inggris", nilaiKamu: 87, nilaiAlumni: 86 },
  { kategori: "Bahasa Indonesia", nilaiKamu: 90, nilaiAlumni: 88 },
  { kategori: "Pendidikan Pancasila", nilaiKamu: 92, nilaiAlumni: 90 },
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
    initial: "N",
    nama: "Naysilla Salsa Ardiyati",
    tahun: "Lulus 2024 • TI UB",
    nilai: "93,5",
    statusKemiripan: "Sangat mirip",
  },
  {
    initial: "D",
    nama: "Dimas Arya Pamungkas",
    tahun: "Lulus 2024 • TI ITS",
    nilai: "94,2",
    statusKemiripan: "Sangat mirip",
  },
  {
    initial: "Z",
    nama: "Zahra Anindya Putri",
    tahun: "Lulus 2024 • Kedokteran UNAIR",
    nilai: "95,8",
    statusKemiripan: "Mirip",
  },
  {
    initial: "F",
    nama: "Fajar Hidayatullah",
    tahun: "Lulus 2024 • Ilkom UGM",
    nilai: "89,6",
    statusKemiripan: "Mirip",
  },
];

// ── 5. Data Tabel Detail Perbandingan Nilai Fallback ──
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
    mataPelajaran: "Matematika Umum",
    nilaiKamu: 89,
    rataAlumni: 87,
    selisih: "+2",
    keterangan: "Di atas rata-rata",
    selisihStatus: "positif",
  },
  {
    mataPelajaran: "Informatika",
    nilaiKamu: 92,
    rataAlumni: 90,
    selisih: "+2",
    keterangan: "Di atas rata-rata",
    selisihStatus: "positif",
  },
  {
    mataPelajaran: "Bahasa Inggris",
    nilaiKamu: 87,
    rataAlumni: 86,
    selisih: "+1",
    keterangan: "Di atas rata-rata",
    selisihStatus: "positif",
  },
  {
    mataPelajaran: "Bahasa Indonesia",
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
    mataPelajaran: "Pendidikan Agama",
    nilaiKamu: 91,
    rataAlumni: 89,
    selisih: "+2",
    keterangan: "Di atas rata-rata",
    selisihStatus: "positif",
  },
];

function MedalColor(rank: number): string {
  if (rank === 1) return "#F2B32E";
  if (rank === 2) return "#C4CFDE";
  if (rank === 3) return "#C79163";
  return "transparent";
}

export default function RankingEligibilitas() {
  const { currentUser } = useUser();
  const [liveData, setLiveData] = useState<{
    siswa?: { id: number; nisn?: string; nama_lengkap: string; nis?: string; kelas?: string };
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

  const [leaderboardList, setLeaderboardList] = useState<any[]>([]);
  const [akademikData, setAkademikData] = useState<any>(null);
  const [searchLeaderboard, setSearchLeaderboard] = useState("");
  const [activeTab, setActiveTab] = useState<"detail" | "leaderboard">("detail");
  const [isLoading, setIsLoading] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // ── Ambil Live Detail Skor & Leaderboard Ranking ──
  const fetchEligibilitas = async () => {
    setIsLoading(true);
    try {
      const isRoleAdminGuru = currentUser?.role === "admin" || currentUser?.role === "guru";

      // 1. Fetch live detail skor siswa
      let detailRes: any = null;
      if (isRoleAdminGuru) {
        detailRes = await eligibilitasService.getDetailSkorSiswaAdmin(1).catch(() => null);
      } else {
        detailRes = await eligibilitasService.getDetailSkorSiswaSaya().catch(async () => {
          return await eligibilitasService.getDetailSkorSiswaAdmin(1);
        });
      }

      if (detailRes?.data) {
        setLiveData(detailRes.data);
        setSyncNotice("Terhubung ke Engine Eligibilitas SMAN 8 Malang (Live API)");
      }

      // 2. Fetch live ranking leaderboard seangkatan
      const rankingRes = await eligibilitasService.getRankingList({ per_page: 25 }).catch(() => null);
      if (rankingRes?.data?.data && Array.isArray(rankingRes.data.data)) {
        setLeaderboardList(rankingRes.data.data);
      }

      // 3. Fetch data akademik rapor siswa
      const targetSiswaId = detailRes?.data?.siswa?.id || (isRoleAdminGuru ? 1 : undefined);
      const akRes = await akademikService.getAkademik({ siswa_id: targetSiswaId }).catch(() => null);
      if (akRes?.data) {
        setAkademikData(akRes.data);
      }
    } catch (err: any) {
      console.warn("Koneksi detail skor siswa (fallback):", err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibilitas();
  }, [currentUser]);

  // ── Hitung rata-rata nilai rapor per mapel dari backend ──
  const dynamicMapelRows: DetailNilaiRow[] = useMemo(() => {
    if (akademikData?.nilai_rapor && Array.isArray(akademikData.nilai_rapor) && akademikData.nilai_rapor.length > 0) {
      const mapelMap: Record<string, { nama: string; total: number; count: number }> = {};
      akademikData.nilai_rapor.forEach((item: any) => {
        const name = item.mata_pelajaran?.nama_mapel || `Mata Pelajaran ${item.mata_pelajaran_id}`;
        if (!mapelMap[name]) {
          mapelMap[name] = { nama: name, total: 0, count: 0 };
        }
        mapelMap[name].total += Number(item.nilai_akhir) || 0;
        mapelMap[name].count += 1;
      });

      return Object.values(mapelMap).map((m) => {
        const nilaiKamu = Math.round(m.total / m.count);
        const rataAlumni = 88;
        const diff = nilaiKamu - rataAlumni;
        const selisih = diff > 0 ? `+${diff}` : `${diff}`;
        const selisihStatus: "positif" | "negatif" | "netral" = diff > 0 ? "positif" : diff < 0 ? "negatif" : "netral";
        const keterangan = diff >= 3 ? "Jauh di atas" : diff > 0 ? "Di atas rata-rata" : diff === 0 ? "Setara" : "Perlu ditingkatkan";
        return {
          mataPelajaran: m.nama,
          nilaiKamu,
          rataAlumni,
          selisih,
          keterangan,
          selisihStatus,
        };
      });
    }
    return DATA_DETAIL_TABEL;
  }, [akademikData]);

  // Dynamic grafik data
  const dynamicGrafikItems: PerbandinganKategori[] = useMemo(() => {
    if (dynamicMapelRows && dynamicMapelRows.length > 0) {
      return dynamicMapelRows.map((r) => ({
        kategori: r.mataPelajaran,
        nilaiKamu: r.nilaiKamu,
        nilaiAlumni: r.rataAlumni,
      }));
    }
    return DATA_PERBANDINGAN_GRAFIK;
  }, [dynamicMapelRows]);

  // Dynamic KPI Stats
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
      value: liveData?.hasil_eligibilitas?.total_skor_akhir !== undefined
        ? Number(liveData.hasil_eligibilitas.total_skor_akhir).toFixed(1).replace(".", ",")
        : "63,2",
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

  // ── Unduh & Cetak Surat Keterangan Hasil Eligibilitas Siswa ──
  const handlePrintBuktiEligibilitas = () => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const siswaNama = liveData?.siswa?.nama_lengkap || "Ahmad B2 Pratama";
    const siswaNisn = liveData?.siswa?.nisn || "0061234567";
    const peringkat = liveData?.hasil_eligibilitas?.peringkat ?? 1;
    const totalSkor = liveData?.hasil_eligibilitas?.total_skor_akhir !== undefined
      ? Number(liveData.hasil_eligibilitas.total_skor_akhir).toFixed(2)
      : "63.23";
    const status = liveData?.hasil_eligibilitas?.status_eligible || "Eligible";
    const periode = liveData?.hasil_eligibilitas?.periode || "2025/2026";
    const rincian = liveData?.rincian_komponen;

    const docHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Surat Keterangan Eligibilitas - ${siswaNama}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Times New Roman', Times, serif; color: #111; margin: 0; padding: 15px; font-size: 12pt; line-height: 1.5; }
          .kop { border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 18px; text-align: center; }
          .kop h2 { margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase; }
          .kop h1 { margin: 2px 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; }
          .kop p { margin: 1px 0; font-size: 9.5pt; font-style: italic; }
          .title { text-align: center; margin: 16px 0 20px; }
          .title h3 { margin: 0; font-size: 13pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; }
          .title p { margin: 2px 0; font-size: 10.5pt; }
          table.info { width: 100%; border-collapse: collapse; margin: 15px 0; }
          table.info td { padding: 4px 6px; font-size: 11pt; vertical-align: top; }
          table.scores { width: 100%; border-collapse: collapse; margin: 15px 0; }
          table.scores th, table.scores td { border: 1px solid #333; padding: 6px 8px; font-size: 10.5pt; }
          table.scores th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
          .status-box { border: 2px solid #148557; background-color: #f0fdf4; padding: 10px 15px; margin: 15px 0; text-align: center; border-radius: 6px; }
          .status-box strong { color: #148557; font-size: 12pt; }
          .ttd-container { margin-top: 35px; display: flex; justify-content: flex-end; }
          .ttd-box { width: 260px; text-align: center; font-size: 11pt; }
          .ttd-space { height: 60px; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>PEMERINTAH PROVINSI JAWA TIMUR</h2>
          <h2>DINAS PENDIDIKAN</h2>
          <h1>SMA NEGERI 8 MALANG</h1>
          <p>Jalan Veteran No. 19 Malang 65145 | Telp: (0341) 551096 | Email: info@sman8malang.sch.id</p>
        </div>

        <div class="title">
          <h3>SURAT KETERANGAN HASIL ELIGIBILITAS SNBP</h3>
          <p>Nomor: 421.3/ 284 /101.6.9.8/2026</p>
        </div>

        <p>Kepala SMA Negeri 8 Malang menerangkan bahwa peserta didik di bawah ini:</p>

        <table class="info">
          <tr><td style="width:160px;">Nama Lengkap</td><td style="width:15px;">:</td><td><strong>${siswaNama}</strong></td></tr>
          <tr><td>Nomor Induk Siswa Nasional</td><td>:</td><td>${siswaNisn}</td></tr>
          <tr><td>Asal Sekolah</td><td>:</td><td>SMA Negeri 8 Malang (SMARIHASTA)</td></tr>
          <tr><td>Tahun Ajaran / Periode</td><td>:</td><td>${periode}</td></tr>
        </table>

        <p>Berdasarkan hasil pengolahan data akademik kumulatif (Semester 1–5), nilai TKA, prestasi, presensi, catatan karakter, dan organisasi melalui sistem eligibilitas terpadu, diperoleh hasil sebagai berikut:</p>

        <table class="scores">
          <thead>
            <tr>
              <th>No</th>
              <th>Komponen Penilaian</th>
              <th>Bobot SPMK</th>
              <th>Skor Raw</th>
              <th>Skor Terbobot</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="text-align:center;">1</td><td>Nilai Rapor Kumulatif (Semester 1–5)</td><td style="text-align:center;">40%</td><td style="text-align:right;">${rincian?.rapor?.raw ? Number(rincian.rapor.raw).toFixed(2) : "89.27"}</td><td style="text-align:right;">${rincian?.rapor?.normalisasi ? Number(rincian.rapor.normalisasi).toFixed(2) : "89.27"}</td></tr>
            <tr><td style="text-align:center;">2</td><td>Tes Kemampuan Akademik (TKA)</td><td style="text-align:center;">20%</td><td style="text-align:right;">${rincian?.tka?.raw ? Number(rincian.tka.raw).toFixed(2) : "88.50"}</td><td style="text-align:right;">${rincian?.tka?.normalisasi ? Number(rincian.tka.normalisasi).toFixed(2) : "88.50"}</td></tr>
            <tr><td style="text-align:center;">3</td><td>Prestasi dan Kompetisi</td><td style="text-align:center;">15%</td><td style="text-align:right;">${rincian?.prestasi?.raw ? Number(rincian.prestasi.raw).toFixed(2) : "0.00"}</td><td style="text-align:right;">${rincian?.prestasi?.normalisasi ? Number(rincian.prestasi.normalisasi).toFixed(2) : "0.00"}</td></tr>
            <tr><td style="text-align:center;">4</td><td>Presensi dan Kehadiran</td><td style="text-align:center;">10%</td><td style="text-align:right;">${rincian?.presensi?.raw ? Number(rincian.presensi.raw).toFixed(2) : "98.20"}</td><td style="text-align:right;">${rincian?.presensi?.normalisasi ? Number(rincian.presensi.normalisasi).toFixed(2) : "98.20"}</td></tr>
            <tr><td style="text-align:center;">5</td><td>Kedisiplinan & Karakter Siswa</td><td style="text-align:center;">10%</td><td style="text-align:right;">${rincian?.karakter?.raw ? Number(rincian.karakter.raw).toFixed(2) : "0.00"}</td><td style="text-align:right;">${rincian?.karakter?.normalisasi ? Number(rincian.karakter.normalisasi).toFixed(2) : "0.00"}</td></tr>
            <tr><td style="text-align:center;">6</td><td>Keterlibatan Organisasi Sekolah</td><td style="text-align:center;">5%</td><td style="text-align:right;">${rincian?.organisasi?.raw ? Number(rincian.organisasi.raw).toFixed(2) : "0.00"}</td><td style="text-align:right;">${rincian?.organisasi?.normalisasi ? Number(rincian.organisasi.normalisasi).toFixed(2) : "0.00"}</td></tr>
            <tr style="font-weight:bold;background-color:#fafafa;"><td colspan="4" style="text-align:right;">TOTAL SKOR AKHIR ELIGIBILITAS :</td><td style="text-align:right;">${totalSkor}</td></tr>
            <tr style="font-weight:bold;"><td colspan="4" style="text-align:right;">PERINGKAT SEKOLAH :</td><td style="text-align:right;color:#6305B0;">#${peringkat}</td></tr>
          </tbody>
        </table>

        <div class="status-box">
          Dinyatakan: <strong>${status.toUpperCase()} SEBAGAI PESERTA SELEKSI NASIONAL BERDASARKAN PRESTASI (SNBP)</strong>
        </div>

        <p>Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagai kelengkapan pendaftaran Seleksi Nasional Penerimaan Mahasiswa Baru.</p>

        <div class="ttd-container">
          <div class="ttd-box">
            <p>Malang, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p>Kepala SMA Negeri 8 Malang,</p>
            <div class="ttd-space"></div>
            <p><strong>Drs. H. Moh. Sulthon, M.Pd.</strong></p>
            <p style="font-size:10pt;">NIP. 19680512 199403 1 008</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const doc = printFrame.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(docHtml);
      doc.close();
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 3000);
    }
  };

  // Filter leaderboard
  const filteredLeaderboard = useMemo(() => {
    if (!searchLeaderboard.trim()) return leaderboardList;
    const q = searchLeaderboard.toLowerCase().trim();
    return leaderboardList.filter(
      (item) =>
        (item.siswa?.nama_lengkap && item.siswa.nama_lengkap.toLowerCase().includes(q)) ||
        (item.siswa?.nisn && item.siswa.nisn.includes(q)) ||
        String(item.rank).includes(q)
    );
  }, [leaderboardList, searchLeaderboard]);

  const currentSiswaNisn = liveData?.siswa?.nisn || "0061234567";

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

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintBuktiEligibilitas}
              className="px-3 py-1.5 rounded-lg bg-white text-[#6305B0] hover:bg-purple-50 hover:shadow-md active:scale-95 text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Bukti Kelulusan (PDF)</span>
            </button>
            <button
              type="button"
              onClick={fetchEligibilitas}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Sinkronkan Skor</span>
            </button>
          </div>
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
              {liveData?.hasil_eligibilitas?.total_skor_akhir !== undefined
                ? Number(liveData.hasil_eligibilitas.total_skor_akhir).toFixed(1)
                : "63.2"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── TAB NAVIGATION: DETAIL SKOR SAYA vs LEADERBOARD ANGKATAN ─── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("detail")}
          className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all duration-200 transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2 ${
            activeTab === "detail"
              ? "bg-[#6305B0] text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-[#6305B0] border border-slate-200 hover:border-purple-300"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Rincian &amp; Komparasi Nilai</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leaderboard")}
          className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all duration-200 transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2 ${
            activeTab === "leaderboard"
              ? "bg-[#6305B0] text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-[#6305B0] border border-slate-200 hover:border-purple-300"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leaderboard Angkatan ({leaderboardList.length} Siswa)</span>
        </button>
      </div>

      {activeTab === "detail" ? (
        <>
          {/* ──────────────────────────────────────────────────────────
              RINCIAN 6 KOMPONEN PEMBOBOTAN ELIGIBILITAS (SPMK)
             ────────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-[14px] p-5 border border-purple-100 shadow-2xs space-y-4 transition-all duration-300 hover:shadow-sm">
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
                { label: "Prestasi (15%)", raw: liveData?.rincian_komponen?.prestasi?.raw ?? 0.0, norm: liveData?.rincian_komponen?.prestasi?.normalisasi ?? 0.0, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Presensi (10%)", raw: liveData?.rincian_komponen?.presensi?.raw ?? 98.2, norm: liveData?.rincian_komponen?.presensi?.normalisasi ?? 98.2, color: "text-teal-600", bg: "bg-teal-50" },
                { label: "Karakter (10%)", raw: liveData?.rincian_komponen?.karakter?.raw ?? 0.0, norm: liveData?.rincian_komponen?.karakter?.normalisasi ?? 0.0, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Organisasi (5%)", raw: liveData?.rincian_komponen?.organisasi?.raw ?? 0.0, norm: liveData?.rincian_komponen?.organisasi?.normalisasi ?? 0.0, color: "text-indigo-600", bg: "bg-indigo-50" },
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-xl border border-slate-100 ${item.bg} flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xs cursor-default`}>
                  <span className="text-[10px] font-bold text-slate-600 block mb-1">{item.label}</span>
                  <div>
                    <span className={`text-[16px] sm:text-[18px] font-black ${item.color}`}>
                      {Number(item.raw).toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      Bobot: {Number(item.norm).toFixed(1)}
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
            {/* Panel Kiri: Perbandingan Nilai Akademik */}
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
                  Rata-rata nilai rapor kamu dibandingkan dengan target alumni
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
                  {dynamicGrafikItems.map((item) => {
                    const widthKamuPercent = Math.max(10, Math.min(100, (item.nilaiKamu / 100) * 100));
                    const widthAlumniPercent = Math.max(10, Math.min(100, (item.nilaiAlumni / 100) * 100));

                    return (
                      <div key={item.kategori} className="flex items-center gap-3">
                        <div
                          className="w-[110px] sm:w-[130px] text-[10px] font-medium text-[#1A1721] shrink-0 truncate"
                          style={{ fontFamily: "Inter, sans-serif" }}
                          title={item.kategori}
                        >
                          {item.kategori}
                        </div>

                        <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
                          <div className="w-full bg-transparent h-[10px] flex items-center">
                            <div
                              className="h-[10px] bg-[#6305B0] rounded-[4px] transition-all duration-300"
                              style={{ width: `${widthKamuPercent}%` }}
                            />
                          </div>

                          <div className="w-full bg-transparent h-[7px] flex items-center">
                            <div
                              className="h-[7px] bg-[#476EF2] rounded-[4px] transition-all duration-300"
                              style={{ width: `${widthAlumniPercent}%` }}
                            />
                          </div>
                        </div>

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
                  Sistem mencocokkan profil nilai rapor untuk pembanding yang relevan.
                </p>

                <div className="space-y-2.5">
                  {DATA_ALUMNI_SERUPA.map((alumni) => {
                    const isSangatMirip = alumni.statusKemiripan === "Sangat mirip";
                    return (
                      <div
                        key={alumni.nama}
                        className="w-full bg-white rounded-[8px] p-2.5 sm:px-3 sm:py-2.5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                      >
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
              SECTION 4: TABEL DETAIL PERBANDINGAN NILAI PER MAPEL
             ────────────────────────────────────────────────────────── */}
          <div className="bg-[#F2E8F7] rounded-[12px] p-4 sm:p-5 shadow-2xs">
            <div className="mb-3.5">
              <h2
                className="text-[16px] font-bold text-[#1A1721] leading-snug"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Detail Perbandingan Nilai per Mata Pelajaran
              </h2>
              <p
                className="text-[10px] text-[#6E6B7A] mt-0.5"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Nilai rapor siswa dihitung kumulatif dibandingkan dengan benchmark alumni terpilih.
              </p>
            </div>

            <div className="w-full overflow-x-auto no-scrollbar">
              <div className="min-w-[700px]">
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

                <div className="space-y-1.5">
                  {dynamicMapelRows.map((row) => {
                    let selisihColor = "text-[#6E6B7A]";
                    if (row.selisihStatus === "positif") {
                      selisihColor = "text-[#148557]";
                    } else if (row.selisihStatus === "negatif") {
                      selisihColor = "text-[#A6630F]";
                    }

                    return (
                      <div
                        key={row.mataPelajaran}
                        className="w-full min-h-[33px] bg-white rounded-[4px] px-3.5 py-1.5 grid grid-cols-[1.5fr_100px_120px_90px_140px] items-center gap-2 transition-colors hover:bg-[#FAF6FC]"
                      >
                        <div
                          className="text-[10px] font-medium text-[#1A1721] text-left truncate"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {row.mataPelajaran}
                        </div>

                        <div
                          className="text-[11px] font-bold text-[#6305B0] text-left pl-1"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {row.nilaiKamu}
                        </div>

                        <div
                          className="text-[11px] font-bold text-[#476EF2] text-left pl-1"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {row.rataAlumni}
                        </div>

                        <div
                          className={`text-[10px] font-semibold text-left pl-1 ${selisihColor}`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {row.selisih}
                        </div>

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
        </>
      ) : (
        /* ──────────────────────────────────────────────────────────
            TAB 2: LEADERBOARD ANGKATAN (KUOTA SNBP RESMI SEKOLAH)
           ────────────────────────────────────────────────────────── */
        <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-purple-100 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1F1729] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6305B0]" />
                Leaderboard Pemeringkatan Angkatan
              </h3>
              <p className="text-xs text-slate-500">
                Peringkat real-time siswa seangkatan dalam perebutan kuota 40% SNBP SMAN 8 Malang
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-[#FAF9FE] border border-[#DECFE8] min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={searchLeaderboard}
                onChange={(e) => setSearchLeaderboard(e.target.value)}
                className="bg-transparent text-xs outline-none w-full text-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF6FC] border-b border-[#E8DEF2] text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 text-center w-14">Rank</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3 text-right">Skor Akhir</th>
                  <th className="p-3 text-center">Status SNBP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Tidak ada data siswa yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.map((item) => {
                    const isCurrentSiswa =
                      item.siswa?.nisn === currentSiswaNisn ||
                      (liveData?.siswa?.id && item.siswa?.id === liveData.siswa.id);
                    const isTop3 = item.rank <= 3;
                    const medal = MedalColor(item.rank);

                    return (
                      <tr
                        key={item.rank}
                        className={`transition-colors ${
                          isCurrentSiswa ? "bg-purple-50 font-medium" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="p-3 text-center font-bold">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={isTop3 ? "text-[#6305B0]" : "text-slate-500"}>
                              {String(item.rank).padStart(2, "0")}
                            </span>
                            {isTop3 && (
                              <span
                                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                                style={{ background: medal }}
                              >
                                {item.rank}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {item.siswa?.nama_lengkap || "Siswa"}
                            </span>
                            {isCurrentSiswa && (
                              <span className="text-[9px] font-bold bg-[#6305B0] text-white px-2 py-0.5 rounded-full">
                                Posisi Anda
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-slate-500">
                          {item.siswa?.nisn || "-"}
                        </td>

                        <td className="p-3 text-right font-bold text-slate-800">
                          {Number(item.skor_akhir).toFixed(2)}
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status_eligible === "Eligible" || item.status_eligible === "eligible"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.status_eligible === "Cadangan" || item.status_eligible === "cadangan"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {item.status_eligible}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

