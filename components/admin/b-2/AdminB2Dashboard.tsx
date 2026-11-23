"use client";

import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  FolderOpen,
  GraduationCap,
  Info,
  Loader2,
  MapPin,
  Pencil,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DetailSiswaModal from "./DetailSiswaModal";
import {
  eligibilitasService,
  importExcelService,
  ImportExcelResult,
  siswaAdminService
} from "@/services/b2";
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

  // Integrasi Backend Engine Kalkulasi Eligibilitas (B2)
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcNotification, setCalcNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleJalankanKalkulasi = async () => {
    try {
      setIsCalculating(true);
      setCalcNotification(null);
      const res = await eligibilitasService.kalkulasiOtomatis();
      setCalcNotification({
        type: "success",
        message: res?.message || "Kalkulasi ranking eligibilitas berhasil diproses di backend!",
      });
      // Segera sinkronkan ulang tabel ranking dengan data hasil kalkulasi terbaru
      await fetchLiveRanking(1, searchRanking);
    } catch (err: any) {
      setCalcNotification({
        type: "error",
        message: err?.message || "Terjadi kesalahan saat memproses kalkulasi eligibilitas di backend.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Integrasi Backend: Live Data Ranking Eligibilitas (RankingController)
  const [rankingData, setRankingData] = useState<any[]>(DATA_RANKING_ELIGIBILITAS);
  const [isRankingLoading, setIsRankingLoading] = useState(false);
  const [rankingPage, setRankingPage] = useState(1);
  const [rankingPagination, setRankingPagination] = useState({
    total: DATA_RANKING_ELIGIBILITAS.length,
    lastPage: 1,
    from: 1,
    to: DATA_RANKING_ELIGIBILITAS.length,
  });

  const fetchLiveRanking = async (page = 1, search = searchRanking) => {
    try {
      setIsRankingLoading(true);
      const res = await eligibilitasService.getRankingList({
        page,
        per_page: 10,
        search: search.trim() || undefined,
      });

      if (res?.data?.data && Array.isArray(res.data.data)) {
        const paginated = res.data;
        const mapped = paginated.data.map((item: any) => ({
          id: item.siswa?.id || String(item.rank),
          rank: item.rank,
          nama: item.siswa?.nama_lengkap || "Siswa",
          nisn: item.siswa?.nisn || "-",
          kelas: item.siswa?.kelas || "XII",
          nilaiRataRata: Number(item.skor_akhir) || 0,
          skor: Number(item.skor_akhir) || 0,
          status:
            item.status_eligible === "eligible" || item.status_eligible === "Eligible"
              ? "Eligible"
              : item.status_eligible === "cadangan" || item.status_eligible === "Cadangan"
              ? "Cadangan"
              : "Tidak Eligible",
        }));
        setRankingData(mapped);
        setRankingPagination({
          total: paginated.total ?? mapped.length,
          lastPage: paginated.last_page ?? 1,
          from: paginated.from ?? 1,
          to: paginated.to ?? mapped.length,
        });
        setRankingPage(page);
      }
    } catch (err: any) {
      console.warn("Koneksi Backend Ranking (fallback ke mock):", err?.message);
    } finally {
      setIsRankingLoading(false);
    }
  };

  // Integrasi Ekspor Laporan Eligibilitas (LaporanEligibilitasController)
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfPreviewModalOpen, setPdfPreviewModalOpen] = useState(false);
  const [pdfReportData, setPdfReportData] = useState<{
    metadata: {
      judul: string;
      tanggal_unduh: string;
      total_siswa: number;
    };
    daftar_peringkat: any[];
  } | null>(null);

  const handleDownloadExcel = async (params?: { kelas?: string; jurusan_id?: number | string }) => {
    try {
      setIsExportingExcel(true);
      await eligibilitasService.downloadExportExcel(params);
      setCalcNotification({
        type: "success",
        message: "Laporan eligibilitas format Excel/CSV berhasil diunduh dari backend!",
      });
    } catch (err: any) {
      setCalcNotification({
        type: "error",
        message: err?.message || "Gagal mengunduh laporan Excel.",
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleCetakPdf = async (filterKelasParam?: string) => {
    try {
      setIsExportingPdf(true);
      const res = await eligibilitasService.getExportPdfData({
        kelas: filterKelasParam && filterKelasParam !== "Semua Kelas" ? filterKelasParam : undefined,
      });
      if (res?.data) {
        setPdfReportData(res.data);
        setPdfPreviewModalOpen(true);
      } else {
        throw new Error("Gagal mengambil data laporan eligibilitas dari backend.");
      }
    } catch (err: any) {
      setCalcNotification({
        type: "error",
        message: err?.message || "Gagal memuat pratinjau dokumen PDF laporan eligibilitas.",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintReport = () => {
    if (!pdfReportData) return;

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const metadata = pdfReportData.metadata;
    const daftar = pdfReportData.daftar_peringkat || [];

    const rowsHtml = daftar
      .map((item) => {
        const statusBadge =
          item.status_eligible === "eligible" || item.status_eligible === "Eligible"
            ? '<span style="background-color:#DCFCE7;color:#148557;padding:2px 8px;border-radius:9999px;font-weight:bold;font-size:10px;">Eligible</span>'
            : item.status_eligible === "cadangan" || item.status_eligible === "Cadangan"
            ? '<span style="background-color:#FEF0C7;color:#B54708;padding:2px 8px;border-radius:9999px;font-weight:bold;font-size:10px;">Cadangan</span>'
            : '<span style="background-color:#FEE4E2;color:#D92D20;padding:2px 8px;border-radius:9999px;font-weight:bold;font-size:10px;">Tidak Eligible</span>';

        return `
          <tr>
            <td style="text-align:center;font-weight:bold;">${item.peringkat}</td>
            <td>${item.siswa?.nisn || "-"}</td>
            <td>${item.siswa?.nis || "-"}</td>
            <td style="font-weight:600;">${item.siswa?.nama_lengkap || "-"}</td>
            <td style="text-align:center;">${item.siswa?.kelas || "-"}</td>
            <td style="text-align:right;">${item.rincian_skor?.rapor !== undefined ? Number(item.rincian_skor.rapor).toFixed(1) : "-"}</td>
            <td style="text-align:right;">${item.rincian_skor?.tka !== undefined ? Number(item.rincian_skor.tka).toFixed(1) : "-"}</td>
            <td style="text-align:right;">${item.rincian_skor?.prestasi !== undefined ? Number(item.rincian_skor.prestasi).toFixed(1) : "-"}</td>
            <td style="text-align:right;">${item.rincian_skor?.presensi !== undefined ? Number(item.rincian_skor.presensi).toFixed(1) : "-"}</td>
            <td style="text-align:right;">${item.rincian_skor?.karakter !== undefined ? Number(item.rincian_skor.karakter).toFixed(1) : "-"}</td>
            <td style="text-align:right;">${item.rincian_skor?.organisasi !== undefined ? Number(item.rincian_skor.organisasi).toFixed(1) : "-"}</td>
            <td style="text-align:right;font-weight:bold;color:#1F1729;">${Number(item.total_skor_akhir).toFixed(2)}</td>
            <td style="text-align:center;">${statusBadge}</td>
          </tr>
        `;
      })
      .join("");

    const docHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${metadata.judul} - SMAN 8 MALANG</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 0; padding: 10px; font-size: 11px; }
          .kop { display: flex; align-items: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 14px; }
          .kop-text { flex: 1; text-align: center; }
          .kop-text h2 { margin: 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
          .kop-text h1 { margin: 2px 0; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
          .kop-text p { margin: 1px 0; font-size: 10px; color: #444; }
          .doc-title { text-align: center; margin: 14px 0 10px; }
          .doc-title h3 { margin: 0; font-size: 14px; font-weight: 800; text-decoration: underline; letter-spacing: 0.5px; }
          .meta-bar { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th, td { border: 1px solid #777; padding: 5px 6px; font-size: 10px; }
          th { background-color: #f2f4f8; text-align: center; font-weight: bold; }
          tr:nth-child(even) { background-color: #fafafa; }
          .ttd-container { margin-top: 25px; display: flex; justify-content: flex-end; page-break-inside: avoid; }
          .ttd-box { width: 260px; text-align: center; font-size: 11px; }
          .ttd-space { height: 55px; }
        </style>
      </head>
      <body>
        <div class="kop">
          <div class="kop-text">
            <h2>PEMERINTAH PROVINSI JAWA TIMUR</h2>
            <h2>DINAS PENDIDIKAN</h2>
            <h1>SMA NEGERI 8 MALANG (SMARIHASTA)</h1>
            <p>Jalan Veteran No. 19 Malang, Jawa Timur 65145 | Telp: (0341) 551096 | Website: sman8malang.sch.id</p>
          </div>
        </div>

        <div class="doc-title">
          <h3>${metadata.judul.toUpperCase()}</h3>
          <p style="margin:2px 0;font-size:11px;color:#555;">Tahun Ajaran 2026/2027</p>
        </div>

        <div class="meta-bar">
          <span><strong>Waktu Ekspor:</strong> ${metadata.tanggal_unduh}</span>
          <span><strong>Total Peserta:</strong> ${metadata.total_siswa} Siswa</span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:35px;">Rank</th>
              <th>NISN</th>
              <th>NIS</th>
              <th>Nama Lengkap</th>
              <th>Kelas</th>
              <th>Rapor</th>
              <th>TKA</th>
              <th>Prestasi</th>
              <th>Presensi</th>
              <th>Karakter</th>
              <th>Organisasi</th>
              <th>Total Skor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="ttd-container">
          <div class="ttd-box">
            <p>Malang, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p>Kepala SMA Negeri 8 Malang,</p>
            <div class="ttd-space"></div>
            <p><strong>Drs. H. Moh. Sulthon, M.Pd.</strong></p>
            <p style="font-size:10px;color:#555;">NIP. 19680512 199403 1 008</p>
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

  // Integrasi Import Massal Excel Siswa & Rapor (ImportExcelController)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportExcelResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImportFile(file);
      setImportModalOpen(true);
      setImportResult(null);
      setImportError(null);
    }
    if (e.target) e.target.value = "";
  };

  const handleExecuteImport = async () => {
    if (!selectedImportFile) return;
    try {
      setIsImporting(true);
      setImportError(null);
      const res = await importExcelService.importExcel(selectedImportFile);
      setImportResult(res.data);
      // Sinkronkan ulang data siswa dan ranking live
      await Promise.all([
        fetchLiveSiswa(1, searchSiswa, filterKelas),
        fetchLiveRanking(1, searchRanking),
      ]);
    } catch (err: any) {
      setImportError(err?.message || "Terjadi kesalahan saat memproses impor berkas Excel.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplateCsv = () => {
    const templateContent = `nisn,nama_lengkap,nis,jenis_kelamin,kelas,nilai_tka,nilai_rapor,kehadiran\n0061284731,Ahmad Rizky Pratama,12841,L,XII MIPA 1,88.5,89.2,98\n0061284732,Beatrix Anindya,12842,P,XII MIPA 1,91.0,92.4,100\n0061284733,Christian Wijaya,12843,L,XII IPS 1,84.0,86.0,96`;
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_import_siswa_rapor.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const [liveSiswaList, setLiveSiswaList] = useState<any[]>([]);
  const [isSiswaLoading, setIsSiswaLoading] = useState(false);
  const [siswaPage, setSiswaPage] = useState(1);
  const [siswaPagination, setSiswaPagination] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  // State Modal Tambah Siswa Baru (B2 Admin)
  const [isAddSiswaModalOpen, setIsAddSiswaModalOpen] = useState(false);
  const [isAddingSiswa, setIsAddingSiswa] = useState(false);
  const [addSiswaError, setAddSiswaError] = useState<string | null>(null);
  const [formSiswaNisn, setFormSiswaNisn] = useState("");
  const [formSiswaNis, setFormSiswaNis] = useState("");
  const [formSiswaNama, setFormSiswaNama] = useState("");
  const [formSiswaPanggilan, setFormSiswaPanggilan] = useState("");
  const [formSiswaGender, setFormSiswaGender] = useState<"L" | "P">("L");
  const [formSiswaUsername, setFormSiswaUsername] = useState("");
  const [formSiswaPassword, setFormSiswaPassword] = useState("");
  const [formSiswaTempatLahir, setFormSiswaTempatLahir] = useState("");
  const [formSiswaTanggalLahir, setFormSiswaTanggalLahir] = useState("");
  const [formSiswaNilaiTka, setFormSiswaNilaiTka] = useState("");
  const [formSiswaAlamat, setFormSiswaAlamat] = useState("");

  const handleOpenAddSiswaModal = () => {
    setFormSiswaNisn("");
    setFormSiswaNis("");
    setFormSiswaNama("");
    setFormSiswaPanggilan("");
    setFormSiswaGender("L");
    setFormSiswaUsername("");
    setFormSiswaPassword("");
    setFormSiswaTempatLahir("");
    setFormSiswaTanggalLahir("");
    setFormSiswaNilaiTka("");
    setFormSiswaAlamat("");
    setAddSiswaError(null);
    setIsAddSiswaModalOpen(true);
  };

  const handleSaveNewSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSiswaNisn.trim()) {
      setAddSiswaError("NISN siswa wajib diisi.");
      return;
    }
    if (!formSiswaNama.trim()) {
      setAddSiswaError("Nama Lengkap Siswa wajib diisi.");
      return;
    }

    try {
      setIsAddingSiswa(true);
      setAddSiswaError(null);

      const payload: any = {
        nisn: formSiswaNisn.trim(),
        nama_lengkap: formSiswaNama.trim(),
        jenis_kelamin: formSiswaGender,
      };

      if (formSiswaNis.trim()) payload.nis = formSiswaNis.trim();
      if (formSiswaPanggilan.trim()) payload.nama_panggilan = formSiswaPanggilan.trim();
      if (formSiswaUsername.trim()) payload.username = formSiswaUsername.trim();
      if (formSiswaPassword.trim()) payload.password = formSiswaPassword.trim();
      if (formSiswaTempatLahir.trim()) payload.tempat_lahir = formSiswaTempatLahir.trim();
      if (formSiswaTanggalLahir.trim()) payload.tanggal_lahir = formSiswaTanggalLahir.trim();
      if (formSiswaAlamat.trim()) payload.alamat_rumah = formSiswaAlamat.trim();
      if (formSiswaNilaiTka.trim() && !isNaN(Number(formSiswaNilaiTka))) {
        payload.nilai_tka = Number(formSiswaNilaiTka);
      }

      const res = await siswaAdminService.create(payload);
      alert(res?.message || `Siswa "${formSiswaNama}" berhasil didaftarkan ke sistem.`);
      setIsAddSiswaModalOpen(false);
      fetchLiveSiswa(1, "", "");
    } catch (err: any) {
      setAddSiswaError(err?.message || "Gagal menambahkan data siswa ke sistem.");
    } finally {
      setIsAddingSiswa(false);
    }
  };

  const fetchLiveSiswa = async (page: number = 1, nama?: string, kelas?: string) => {
    try {
      setIsSiswaLoading(true);
      const res = await siswaAdminService.getAll({
        page,
        nama_lengkap: nama || undefined,
        kelas: kelas && kelas !== "Semua Kelas" ? kelas : undefined,
      });

      if (res?.data) {
        const paginatedData = res.data.data || res.data;
        if (Array.isArray(paginatedData)) {
          const mapped = paginatedData.map((item: any) => {
            const namaKelas = item.riwayat_kelas?.[0]?.kelas?.nama_kelas || item.kelas || "-";
            const initials = item.nama_lengkap
              ? item.nama_lengkap
                  .split(" ")
                  .map((w: string) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "SW";
            return {
              id: String(item.id),
              initials,
              initialsBg: "#F4EBFF",
              nama: item.nama_lengkap || item.nama || "Siswa",
              nisn: item.nisn || "-",
              kelas: namaKelas,
              gender: item.jenis_kelamin === "L" ? "Laki-laki" : item.jenis_kelamin === "P" ? "Perempuan" : item.gender || "Laki-laki",
              statusKelengkapan: item.statusKelengkapan || "Lengkap",
              kelengkapanDetail: item.kelengkapanDetail || "(100%)",
              rataRapor: item.nilai_rapor_avg ? parseFloat(item.nilai_rapor_avg) : 88.5,
              rekomendasiMinat: item.rekomendasi_prodi?.[0]?.klaster?.nama_klaster || "Riset Saintifik",
              rawItem: item,
            };
          });
          setLiveSiswaList(mapped);
          setSiswaPagination({
            total: res.data.total ?? mapped.length,
            currentPage: res.data.current_page ?? page,
            lastPage: res.data.last_page ?? 1,
            from: res.data.from ?? 1,
            to: res.data.to ?? mapped.length,
          });
        }
      }
    } catch (err) {
      console.warn("Gagal memuat siswa live, menggunakan fallback mock:", err);
    } finally {
      setIsSiswaLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRanking(1, "");
    fetchLiveSiswa(1, "", "");
  }, []);

  const filteredRanking = rankingData.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchRanking.toLowerCase()) ||
      item.nisn.includes(searchRanking)
  );

  const filteredSiswaMock = DATA_MANAJEMEN_SISWA.filter((item) => {
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

  const displayedSiswa = liveSiswaList.length > 0 ? liveSiswaList : filteredSiswaMock;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayedSiswa.map((s) => s.id));
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
    fetchLiveSiswa(1, "", "");
  };

  const handleDeleteSiswa = async (id: string, nama: string) => {
    if (
      confirm(
        `Yakin ingin menghapus data siswa ${nama}? Tindakan ini akan menghapus akun dan data akademik terkait.`
      )
    ) {
      try {
        await siswaAdminService.delete(id);
        alert(`Data siswa ${nama} berhasil dihapus.`);
        fetchLiveSiswa(siswaPage, searchSiswa, filterKelas);
      } catch (err: any) {
        alert(err?.message || "Gagal menghapus data siswa.");
      }
    }
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
            className={`pb-3 text-[14px] font-semibold transition-all duration-200 relative cursor-pointer hover:scale-[1.02] active:scale-95 ${activeTab === "ranking"
                ? "text-[#6941C6] border-b-2 border-[#7F56D9]"
                : "text-[#6E6678] hover:text-[#1F1729]"
              }`}
          >
            Ranking Eligibilitas
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("section-manajemen-data", "manajemen")}
            className={`pb-3 text-[14px] font-semibold transition-all duration-200 relative cursor-pointer hover:scale-[1.02] active:scale-95 ${activeTab === "manajemen"
                ? "text-[#6941C6] border-b-2 border-[#7F56D9]"
                : "text-[#6E6678] hover:text-[#1F1729]"
              }`}
          >
            Manajemen Data
          </button>
          <Link
            href="/admin/b2/master-prodi"
            className="pb-3 text-[14px] font-semibold text-[#6E6678] hover:text-[#6941C6] hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4 text-[#7F56D9]" />
            <span>Master Prodi &amp; Kuota SNBP</span>
          </Link>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
        {KPI_HEADER_ITEMS.map((kpi) => {
          return (
            <div
              key={kpi.id}
              className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex items-center justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-purple-200 cursor-default group"
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
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${kpi.colorTheme === "blue"
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

            {/* Panel: Rata-rata Nilai Mata Pelajaran Pilihan */}
            <div className="bg-white rounded-xl p-5 text-[#1F1729] shadow-xs">
              <div className="mb-3.5">
                <h4 className="text-[14px] font-bold text-[#1F1729]">
                  Rata-rata Nilai Mata Pelajaran Pilihan
                </h4>
                <p className="text-[11px] text-[#6E6678]">
                  Distribusi perolehan nilai rapor pada mata pelajaran pendukung peminatan
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { label: "Bahasa & Sastra Inggris", value: 90.1 },
                  { label: "Ekonomi", value: 89.0 },
                  { label: "Matematika Tingkat Lanjut", value: 88.4 },
                  { label: "Sosiologi / Geografi", value: 87.8 },
                  { label: "Biologi", value: 87.2 },
                  { label: "Kimia", value: 86.5 },
                  { label: "Fisika", value: 85.8 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[170px_1fr_50px] items-center gap-3 text-[12px]"
                  >
                    <span className="text-[#6E6678] truncate">{item.label}</span>
                    <div className="h-3 rounded-full bg-[#EFEAF4] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${item.value}%`,
                          background: "#226CE0",
                        }}
                      />
                    </div>
                    <span className="text-right font-semibold text-[#1F1729]">
                      {item.value.toFixed(1)}
                    </span>
                  </div>
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
            <Link
              href="/admin/b2/master-prodi"
              className="px-3.5 py-2 rounded-lg border border-[#D0D5DD] bg-white text-[12px] font-semibold text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#7F56D9]" />
              <span>Master Prodi &amp; Kuota SNBP</span>
            </Link>
            <Link
              href="/admin/b2/users"
              className="px-3.5 py-2 rounded-lg border border-[#D0D5DD] bg-white text-[12px] font-semibold text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-[#7F56D9]" />
              <span>Manajemen Pengguna</span>
            </Link>
            <button
              type="button"
              disabled={isCalculating}
              onClick={handleJalankanKalkulasi}
              className="px-4 py-2 rounded-lg bg-[#7F56D9] hover:bg-[#6941C6] active:bg-[#53389E] text-white text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menghitung...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Jalankan Kalkulasi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {calcNotification && (
          <div
            className={`mb-4 p-3.5 rounded-xl flex items-center justify-between gap-3 text-[13px] border animate-in fade-in duration-200 ${
              calcNotification.type === "success"
                ? "bg-[#DCFCE7] border-[#86EFAC] text-[#148557]"
                : "bg-[#FEE4E2] border-[#FECDCA] text-[#D92D20]"
            }`}
          >
            <div className="flex items-center gap-2">
              {calcNotification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{calcNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setCalcNotification(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}


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

              <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white border border-[#D0D5DD] focus-within:border-[#7F56D9] min-w-[210px]">
                <Search className="w-3.5 h-3.5 text-[#667085]" />
                <input
                  type="text"
                  placeholder="Cari nama atau NISN..."
                  value={searchRanking}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchRanking(val);
                    fetchLiveRanking(1, val);
                  }}
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
                onClick={() => fetchLiveRanking(1, searchRanking)}
                title="Muat Ulang Ranking dari Backend"
                className="h-9 px-3.5 rounded-lg bg-white border border-[#D0D5DD] text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-[#6941C6] ${isRankingLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                disabled={isExportingPdf}
                onClick={() => handleCetakPdf()}
                title="Cetak Laporan Dokumen PDF Resmi (Kop SMARIHASTA)"
                className="h-9 px-3.5 rounded-lg bg-white border border-[#D0D5DD] text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                {isExportingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7F56D9]" />
                ) : (
                  <Printer className="w-3.5 h-3.5 text-[#7F56D9]" />
                )}
                <span>Cetak PDF</span>
              </button>

              <button
                type="button"
                disabled={isExportingExcel}
                onClick={() => handleDownloadExcel()}
                title="Unduh Laporan Excel / CSV dari Backend"
                className="h-9 px-4 rounded-lg bg-[#7F56D9] hover:bg-[#6941C6] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {isExportingExcel ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Unduh Excel</span>
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
                {isRankingLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#6941C6]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#7F56D9]" />
                        <span className="text-[12px] font-medium text-[#475467]">
                          Menghubungkan ke backend dan memuat daftar ranking...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRanking.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-[13px]">
                      Tidak ditemukan data siswa atau hasil eligibilitas belum dikalkulasi.
                    </td>
                  </tr>
                ) : (
                  filteredRanking.map((row, idx) => {
                    const isShade = idx % 2 === 1;
                    const isEligible = row.status === "Eligible";
                    const isCadangan = row.status === "Cadangan";

                    return (
                      <tr
                        key={row.id || `${row.nisn}-${idx}`}
                        className={`transition-colors hover:bg-[#F9F5FF] ${
                          isShade ? "bg-[#FCFAFF]" : "bg-white"
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
                          <div>
                            <span>{row.nama}</span>
                            {row.kelas && (
                              <span className="block text-[11px] font-normal text-[#667085]">
                                {row.kelas}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-[#667085]">{row.nisn}</td>

                        <td className="px-5 py-3.5 font-bold text-[#14141C]">
                          {typeof row.nilaiRataRata === "number"
                            ? row.nilaiRataRata.toFixed(2).replace(".", ",")
                            : "-"}
                        </td>

                        <td className="px-5 py-3.5 font-bold text-[#6941C6]">
                          {typeof row.skor === "number"
                            ? row.skor.toFixed(2).replace(".", ",")
                            : "-"}
                        </td>

                        <td className="px-5 py-3.5">
                          {isEligible ? (
                            <span className="px-2.5 py-1 rounded-md bg-[#DCFCE7] text-[#148557] font-semibold text-[11px] inline-block">
                              Eligible
                            </span>
                          ) : isCadangan ? (
                            <span className="px-2.5 py-1 rounded-md bg-[#FEF0C7] text-[#B54708] font-semibold text-[11px] inline-block">
                              Cadangan
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-[#FEE4E2] text-[#D92D20] font-semibold text-[11px] inline-block">
                              Tidak Eligible
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            title="Detail Skor Siswa"
                            onClick={() => {
                              alert(`Detail Skor untuk ${row.nama} (Peringkat #${row.rank}, Skor Akhir: ${row.skor})`);
                            }}
                            className="text-[#667085] hover:text-[#6941C6] font-bold px-2 py-1 cursor-pointer transition-colors"
                          >
                            •••
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 text-[11px] text-[#667085] border-t border-[#EAECF0] bg-white">
            <span>
              Menampilkan {filteredRanking.length > 0 ? `${rankingPagination.from}-${rankingPagination.to}` : "0"} dari {rankingPagination.total} siswa terdata
            </span>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#6941C6]">
                Halaman {rankingPage} dari {rankingPagination.lastPage}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={rankingPage <= 1 || isRankingLoading}
                  onClick={() => fetchLiveRanking(rankingPage - 1, searchRanking)}
                  className="px-2.5 py-1 rounded border border-[#D0D5DD] hover:bg-[#F9F5FF] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-semibold text-[#344054] cursor-pointer transition-colors"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={rankingPage >= rankingPagination.lastPage || isRankingLoading}
                  onClick={() => fetchLiveRanking(rankingPage + 1, searchRanking)}
                  className="px-2.5 py-1 rounded border border-[#D0D5DD] hover:bg-[#F9F5FF] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-semibold text-[#344054] cursor-pointer transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleSelectFile}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Import Massal Excel/CSV Data Siswa & Rapor"
              className="px-3.5 py-2 rounded-lg border border-[#D0D5DD] bg-white text-[12px] font-semibold text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#7F56D9]" />
              <span>Import Data</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddSiswaModal}
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
                        displayedSiswa.length > 0 &&
                        selectedIds.length === displayedSiswa.length
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
                {isSiswaLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-[#667085]">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#7F56D9]" />
                        <span>Memuat data siswa dari database...</span>
                      </div>
                    </td>
                  </tr>
                ) : displayedSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-[#667085]">
                      Tidak ada data siswa yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  displayedSiswa.map((siswa) => {
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
                            className="p-1.5 rounded-md hover:bg-[#F4EBFF] hover:text-[#6941C6] hover:scale-110 active:scale-90 transition-all duration-150 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/admin/b2/edit-siswa/${siswa.id}`}
                            title="Edit Data Siswa"
                            className="p-1.5 rounded-md hover:bg-[#F4EBFF] hover:text-[#6941C6] hover:scale-110 active:scale-90 transition-all duration-150 cursor-pointer inline-flex items-center justify-center"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteSiswa(siswa.id, siswa.nama)}
                            title="Hapus Siswa"
                            className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 hover:scale-110 active:scale-90 transition-all duration-150 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>


          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-t border-[#EAECF0] text-[11px] text-[#667085] bg-white">
            <div className="flex items-center gap-4">
              <span>
                Menampilkan{" "}
                {displayedSiswa.length > 0
                  ? `${siswaPagination.from || 1}-${siswaPagination.to || displayedSiswa.length}`
                  : "0"}{" "}
                dari {siswaPagination.total || displayedSiswa.length} siswa
              </span>
            </div>


            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#6941C6]">
                Halaman {siswaPage} dari {siswaPagination.lastPage || 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={siswaPage <= 1 || isSiswaLoading}
                  onClick={() => {
                    const prev = siswaPage - 1;
                    setSiswaPage(prev);
                    fetchLiveSiswa(prev, searchSiswa, filterKelas);
                  }}
                  className="px-2.5 py-1 rounded border border-[#D0D5DD] hover:bg-[#F9F5FF] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-semibold text-[#344054] cursor-pointer"
                >
                  ‹ Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={siswaPage >= (siswaPagination.lastPage || 1) || isSiswaLoading}
                  onClick={() => {
                    const next = siswaPage + 1;
                    setSiswaPage(next);
                    fetchLiveSiswa(next, searchSiswa, filterKelas);
                  }}
                  className="px-2.5 py-1 rounded border border-[#D0D5DD] hover:bg-[#F9F5FF] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-semibold text-[#344054] cursor-pointer"
                >
                  Selanjutnya ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DetailSiswaModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        siswa={selectedDetailSiswa}
      />

      {importModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isImporting) setImportModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-[520px] rounded-2xl bg-white shadow-xl border border-[#E9D7FE] overflow-hidden text-[#1F2937]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#EAECF0] bg-[#FAF9FE]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[#1F1729]">
                    Import Massal Excel Siswa &amp; Rapor
                  </h3>
                  <p className="text-[11px] text-[#6E6678]">
                    Unggah data siswa dan nilai rapor secara sekaligus
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isImporting}
                onClick={() => setImportModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-[12px]">
              {/* Selected File Card */}
              {selectedImportFile && (
                <div className="p-3.5 rounded-xl border border-[#D0D5DD] bg-[#F8F9FC] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileSpreadsheet className="w-4 h-4 text-[#7F56D9] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1F1729] truncate text-[12px]">
                        {selectedImportFile.name}
                      </p>
                      <p className="text-[10px] text-[#667085]">
                        {(selectedImportFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-[#7F56D9] hover:underline font-semibold shrink-0 cursor-pointer"
                  >
                    Ganti Berkas
                  </button>
                </div>
              )}

              {/* Petunjuk Format Kolom */}
              <div className="p-3.5 rounded-xl bg-[#F4EBFF]/50 border border-[#E9D7FE] text-[#53389E] space-y-1.5">
                <p className="font-semibold text-[11px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#7F56D9]" />
                  Format Kolom yang Didukung Backend:
                </p>
                <p className="text-[10.5px] leading-relaxed text-[#6941C6]">
                  Kolom wajib: <strong>nisn</strong>, <strong>nama_lengkap</strong> (atau nama).<br />
                  Kolom opsional: <strong>nis</strong>, <strong>jenis_kelamin</strong> (L/P), <strong>kelas</strong>, <strong>nilai_tka</strong>, <strong>nilai_rapor</strong>, <strong>kehadiran</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadTemplateCsv}
                  className="text-[11px] font-bold text-[#7F56D9] hover:text-[#53389E] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Unduh Contoh Template CSV
                </button>
              </div>

              {/* Alert Error */}
              {importError && (
                <div className="p-3 rounded-xl bg-[#FEE4E2] border border-[#FECDCA] text-[#D92D20] text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Gagal Mengimpor:</strong>
                    <span>{importError}</span>
                  </div>
                </div>
              )}

              {/* Alert Hasil Import */}
              {importResult && (
                <div className="p-3.5 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-[#148557] space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-[12px]">
                      Impor Selesai Diproses: {importResult.berhasil} baris berhasil ditambahkan/diperbarui!
                    </span>
                  </div>
                  <p className="text-[11px] text-[#15803D]">
                    Total diproses: {importResult.total_baris_diproses} baris | Gagal: {importResult.gagal} baris
                  </p>
                  {importResult.rincian_gagal && importResult.rincian_gagal.length > 0 && (
                    <div className="mt-2 p-2 rounded-lg bg-white/70 border border-[#86EFAC] text-[10px] space-y-1 max-h-28 overflow-y-auto">
                      <p className="font-bold text-[#B91C1C]">Rincian baris gagal:</p>
                      {importResult.rincian_gagal.map((rg, idx) => (
                        <p key={idx} className="text-[#B91C1C]">
                          Baris {rg.baris} (NISN: {rg.nisn || "-"}): {rg.alasan}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-[#EAECF0] bg-[#FAF9FE]">
              <button
                type="button"
                disabled={isImporting}
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#D0D5DD] text-[#344054] hover:bg-white text-[12px] font-semibold transition-colors cursor-pointer"
              >
                {importResult ? "Tutup" : "Batal"}
              </button>
              <button
                type="button"
                disabled={isImporting || !selectedImportFile}
                onClick={handleExecuteImport}
                className="px-4 py-2 rounded-lg bg-[#7F56D9] hover:bg-[#6941C6] text-white text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Mulai Impor</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL TAMBAH SISWA BARU */}
      {isAddSiswaModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isAddingSiswa) setIsAddSiswaModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-[560px] max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl border border-[#E9D7FE] overflow-hidden text-[#1F2937]">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-[#EAECF0] bg-[#FAF9FE] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[#1F1729]">
                    Tambah Data Siswa Baru
                  </h3>
                  <p className="text-[11px] text-[#6E6678]">
                    Daftarkan identitas induk siswa &amp; akun portal Eightracer
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isAddingSiswa}
                onClick={() => setIsAddSiswaModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSaveNewSiswa} className="p-5 space-y-4 text-[12px] overflow-y-auto flex-1">
              {addSiswaError && (
                <div className="p-3 rounded-xl bg-[#FEE4E2] border border-[#FECDCA] text-[#D92D20] text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{addSiswaError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    NISN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="Contoh: 0061284739"
                    value={formSiswaNisn}
                    onChange={(e) => setFormSiswaNisn(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D0D5DD] font-mono text-[#1F1729] focus:outline-hidden focus:ring-2 focus:ring-[#7F56D9]/20 focus:border-[#7F56D9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    NIS (Nomor Induk Sekolah)
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    placeholder="Contoh: 12849"
                    value={formSiswaNis}
                    onChange={(e) => setFormSiswaNis(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D0D5DD] font-mono text-[#1F1729] focus:outline-hidden focus:ring-2 focus:ring-[#7F56D9]/20 focus:border-[#7F56D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Raka Danendra Pratama"
                  value={formSiswaNama}
                  onChange={(e) => setFormSiswaNama(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#D0D5DD] text-[#1F1729] focus:outline-hidden focus:ring-2 focus:ring-[#7F56D9]/20 focus:border-[#7F56D9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Raka"
                    value={formSiswaPanggilan}
                    onChange={(e) => setFormSiswaPanggilan(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D0D5DD] text-[#1F1729] focus:outline-hidden focus:ring-2 focus:ring-[#7F56D9]/20 focus:border-[#7F56D9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formSiswaGender}
                    onChange={(e) => setFormSiswaGender(e.target.value as "L" | "P")}
                    className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] bg-white text-[#1F1729] focus:outline-hidden focus:ring-1 focus:ring-[#7F56D9]"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              {/* Akun Portal Siswa */}
              <div className="p-3.5 rounded-xl bg-[#FAF9FE] border border-[#E9D7FE] space-y-3">
                <p className="font-semibold text-[11.5px] text-[#53389E] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#7F56D9]" />
                  Informasi Akun Portal Eightracer:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-medium text-[#475467] mb-1">
                      Username (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Default: NISN"
                      value={formSiswaUsername}
                      onChange={(e) => setFormSiswaUsername(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[11.5px] text-[#1F1729]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-[#475467] mb-1">
                      Password (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Default: password123"
                      value={formSiswaPassword}
                      onChange={(e) => setFormSiswaPassword(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[11.5px] text-[#1F1729]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Kota Lahir"
                    value={formSiswaTempatLahir}
                    onChange={(e) => setFormSiswaTempatLahir(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] text-[#1F1729]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formSiswaTanggalLahir}
                    onChange={(e) => setFormSiswaTanggalLahir(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] text-[#1F1729]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    Skor TKA Awal
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="Contoh: 88.5"
                    value={formSiswaNilaiTka}
                    onChange={(e) => setFormSiswaNilaiTka(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] text-[#1F1729]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                  Alamat Rumah
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat domisili siswa..."
                  value={formSiswaAlamat}
                  onChange={(e) => setFormSiswaAlamat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] text-[#1F1729]"
                />
              </div>

              {/* Footer Modal Form */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAECF0]">
                <button
                  type="button"
                  disabled={isAddingSiswa}
                  onClick={() => setIsAddSiswaModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#D0D5DD] text-[#344054] hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAddingSiswa}
                  className="px-4 py-2 rounded-lg bg-[#7F56D9] hover:bg-[#6941C6] text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAddingSiswa ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <span>Daftarkan Siswa</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ─── MODAL PRATINJAU DOKUMEN LAPORAN ELIGIBILITAS PDF ─── */}
      {pdfPreviewModalOpen && pdfReportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#D0D5DD]">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#EAECF0] bg-[#FAF9FE]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1F1729]">
                    Pratinjau Laporan Eligibilitas Siswa
                  </h3>
                  <p className="text-[11px] text-[#6E6678]">
                    Dokumen resmi SMA Negeri 8 Malang siap dicetak atau disimpan sebagai PDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="px-4 py-2 rounded-lg bg-[#7F56D9] hover:bg-[#6941C6] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadExcel()}
                  disabled={isExportingExcel}
                  className="px-3.5 py-2 rounded-lg bg-white border border-[#D0D5DD] text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-4 h-4 text-[#7F56D9]" />
                  <span>Unduh Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPdfPreviewModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#667085] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Document Preview */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F4F5F7]">
              <div className="bg-white p-8 sm:p-10 rounded-xl shadow-sm border border-[#E4E7EC] max-w-4xl mx-auto text-[#1A1A1A]">
                {/* Kop Surat SMAN 8 Malang */}
                <div className="border-b-[3px] border-double border-black pb-3 mb-4 text-center">
                  <h2 className="text-[14px] font-bold uppercase tracking-wide m-0">
                    Pemerintah Provinsi Jawa Timur
                  </h2>
                  <h2 className="text-[14px] font-bold uppercase tracking-wide m-0">
                    Dinas Pendidikan
                  </h2>
                  <h1 className="text-[18px] font-black uppercase tracking-wider text-[#1F1729] my-0.5">
                    SMA Negeri 8 Malang (SMARIHASTA)
                  </h1>
                  <p className="text-[10px] text-[#444] m-0">
                    Jalan Veteran No. 19 Malang, Jawa Timur 65145 | Telp: (0341) 551096 | Website: sman8malang.sch.id
                  </p>
                </div>

                {/* Judul Laporan */}
                <div className="text-center my-4">
                  <h3 className="text-[14px] font-extrabold uppercase underline tracking-wide text-[#1F1729]">
                    {pdfReportData.metadata.judul}
                  </h3>
                  <p className="text-[11px] text-[#667085] mt-1">
                    Tahun Ajaran 2026/2027 • Kuota SNBP Resmi Sekolah
                  </p>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-[11px] text-[#475467] mb-3 bg-[#F8F9FC] p-2.5 rounded-lg border border-[#EAECF0]">
                  <span>
                    <strong>Waktu Ekspor:</strong> {pdfReportData.metadata.tanggal_unduh}
                  </span>
                  <span>
                    <strong>Total Siswa Terdata:</strong> {pdfReportData.metadata.total_siswa} Siswa
                  </span>
                </div>

                {/* Tabel Peringkat */}
                <div className="overflow-x-auto border border-[#D0D5DD] rounded-lg">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#F2F4F8] border-b border-[#D0D5DD] text-[#344054] font-bold">
                        <th className="p-2 text-center w-10 border-r border-[#D0D5DD]">Rank</th>
                        <th className="p-2 border-r border-[#D0D5DD]">NISN</th>
                        <th className="p-2 border-r border-[#D0D5DD]">Nama Lengkap</th>
                        <th className="p-2 text-center border-r border-[#D0D5DD]">Kelas</th>
                        <th className="p-2 text-right border-r border-[#D0D5DD]">Rapor</th>
                        <th className="p-2 text-right border-r border-[#D0D5DD]">TKA</th>
                        <th className="p-2 text-right border-r border-[#D0D5DD]">Prestasi</th>
                        <th className="p-2 text-right border-r border-[#D0D5DD]">Presensi</th>
                        <th className="p-2 text-right border-r border-[#D0D5DD]">Karakter</th>
                        <th className="p-2 text-right border-r border-[#D0D5DD]">Total Skor</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECF0]">
                      {pdfReportData.daftar_peringkat.map((row) => (
                        <tr key={row.peringkat} className="hover:bg-slate-50">
                          <td className="p-2 text-center font-bold text-[#6941C6] border-r border-[#EAECF0]">
                            {row.peringkat}
                          </td>
                          <td className="p-2 text-[#475467] border-r border-[#EAECF0]">
                            {row.siswa?.nisn || "-"}
                          </td>
                          <td className="p-2 font-semibold text-[#1F1729] border-r border-[#EAECF0]">
                            {row.siswa?.nama_lengkap || "-"}
                          </td>
                          <td className="p-2 text-center text-[#475467] border-r border-[#EAECF0]">
                            {row.siswa?.kelas || "-"}
                          </td>
                          <td className="p-2 text-right text-[#344054] border-r border-[#EAECF0]">
                            {row.rincian_skor?.rapor !== undefined ? Number(row.rincian_skor.rapor).toFixed(1) : "-"}
                          </td>
                          <td className="p-2 text-right text-[#344054] border-r border-[#EAECF0]">
                            {row.rincian_skor?.tka !== undefined ? Number(row.rincian_skor.tka).toFixed(1) : "-"}
                          </td>
                          <td className="p-2 text-right text-[#344054] border-r border-[#EAECF0]">
                            {row.rincian_skor?.prestasi !== undefined ? Number(row.rincian_skor.prestasi).toFixed(1) : "-"}
                          </td>
                          <td className="p-2 text-right text-[#344054] border-r border-[#EAECF0]">
                            {row.rincian_skor?.presensi !== undefined ? Number(row.rincian_skor.presensi).toFixed(1) : "-"}
                          </td>
                          <td className="p-2 text-right text-[#344054] border-r border-[#EAECF0]">
                            {row.rincian_skor?.karakter !== undefined ? Number(row.rincian_skor.karakter).toFixed(1) : "-"}
                          </td>
                          <td className="p-2 text-right font-bold text-[#1F1729] border-r border-[#EAECF0]">
                            {Number(row.total_skor_akhir).toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.status_eligible === "Eligible" || row.status_eligible === "eligible"
                                  ? "bg-[#DCFCE7] text-[#148557]"
                                  : row.status_eligible === "Cadangan" || row.status_eligible === "cadangan"
                                  ? "bg-[#FEF0C7] text-[#B54708]"
                                  : "bg-[#FEE4E2] text-[#D92D20]"
                              }`}
                            >
                              {row.status_eligible}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tanda Tangan */}
                <div className="mt-8 flex justify-end">
                  <div className="w-64 text-center text-[11px] text-[#1F1729]">
                    <p className="m-0">
                      Malang, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="m-0 font-medium">Kepala SMA Negeri 8 Malang,</p>
                    <div className="h-16" />
                    <p className="m-0 font-bold underline">Drs. H. Moh. Sulthon, M.Pd.</p>
                    <p className="m-0 text-[10px] text-[#667085]">NIP. 19680512 199403 1 008</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

