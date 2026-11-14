"use client";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Edit2,
  GraduationCap,
  Layers,
  Lightbulb,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  eligibilitasService,
  KlasterProdiItem,
  KlasterProdiPayload,
  prodiAdminService,
  ptnService,
  PerguruanTinggiItem,
} from "@/services/b2";

// Curated PTN Favorit Siswa SMARIHASTA (SMAN 8 Malang)
const TOP_PTN_SMARIHASTA = [
  {
    id: "ub",
    nama_pt: "Universitas Brawijaya",
    nama_singkat: "UB",
    kota: "Malang",
    provinsi: "Jawa Timur",
    akreditasi: "Unggul",
    daya_tampung_snbp: "5.495",
    rasio_ketetatan: "1 : 7.2",
    favorit_jalur: "Saintek & Soshum",
  },
  {
    id: "um",
    nama_pt: "Universitas Negeri Malang",
    nama_singkat: "UM",
    kota: "Malang",
    provinsi: "Jawa Timur",
    akreditasi: "Unggul",
    daya_tampung_snbp: "3.240",
    rasio_ketetatan: "1 : 6.8",
    favorit_jalur: "Pendidikan & Sains",
  },
  {
    id: "its",
    nama_pt: "Institut Teknologi Sepuluh Nopember",
    nama_singkat: "ITS",
    kota: "Surabaya",
    provinsi: "Jawa Timur",
    akreditasi: "Unggul",
    daya_tampung_snbp: "1.564",
    rasio_ketetatan: "1 : 9.5",
    favorit_jalur: "Teknik & Informatika",
  },
  {
    id: "unair",
    nama_pt: "Universitas Airlangga",
    nama_singkat: "UNAIR",
    kota: "Surabaya",
    provinsi: "Jawa Timur",
    akreditasi: "Unggul",
    daya_tampung_snbp: "2.830",
    rasio_ketetatan: "1 : 8.9",
    favorit_jalur: "Kedokteran & Sosial",
  },
  {
    id: "ugm",
    nama_pt: "Universitas Gadjah Mada",
    nama_singkat: "UGM",
    kota: "Yogyakarta",
    provinsi: "D.I. Yogyakarta",
    akreditasi: "Unggul",
    daya_tampung_snbp: "2.821",
    rasio_ketetatan: "1 : 12.4",
    favorit_jalur: "Semua Rumpun",
  },
  {
    id: "ui",
    nama_pt: "Universitas Indonesia",
    nama_singkat: "UI",
    kota: "Depok",
    provinsi: "Jawa Barat",
    akreditasi: "Unggul",
    daya_tampung_snbp: "2.105",
    rasio_ketetatan: "1 : 14.1",
    favorit_jalur: "Kedokteran & Hukum",
  },
  {
    id: "itb",
    nama_pt: "Institut Teknologi Bandung",
    nama_singkat: "ITB",
    kota: "Bandung",
    provinsi: "Jawa Barat",
    akreditasi: "Unggul",
    daya_tampung_snbp: "2.093",
    rasio_ketetatan: "1 : 11.2",
    favorit_jalur: "STEI & FTI",
  },
  {
    id: "ipb",
    nama_pt: "IPB University",
    nama_singkat: "IPB",
    kota: "Bogor",
    provinsi: "Jawa Barat",
    akreditasi: "Unggul",
    daya_tampung_snbp: "1.980",
    rasio_ketetatan: "1 : 8.1",
    favorit_jalur: "Agro & Biosains",
  },
];

// Opsi Kecerdasan Majemuk Dominan Gardner
const OPSI_KECERDASAN = [
  "Logis-Matematis",
  "Linguistik-Verbal",
  "Visual-Spasial",
  "Kinestetik-Jasmani",
  "Musikal-Ritmik",
  "Interpersonal",
  "Intrapersonal",
  "Naturalis",
  "Eksistensial",
];

// Opsi Kelompok Rumpun
const OPSI_RUMPUN = ["SAINTEK", "SOSHUM", "CAMPURAN"];

export default function ManajemenMasterProdi() {
  const [activeTab, setActiveTab] = useState<"prodi" | "ptn">("prodi");

  // State List Prodi & Klaster
  const [prodiList, setProdiList] = useState<KlasterProdiItem[]>([]);
  const [isLoadingProdi, setIsLoadingProdi] = useState(true);
  const [searchProdi, setSearchProdi] = useState("");
  const [filterRumpun, setFilterRumpun] = useState<string>("SEMUA");
  const [filterRiasec, setFilterRiasec] = useState<string>("SEMUA");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    perPage: 10,
    lastPage: 1,
  });

  // State List PTN
  const [ptnList, setPtnList] = useState<PerguruanTinggiItem[]>([]);
  const [isLoadingPtn, setIsLoadingPtn] = useState(false);
  const [searchPtn, setSearchPtn] = useState("");

  // State Modal Tambah / Edit Prodi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProdi, setEditingProdi] = useState<KlasterProdiItem | null>(null);
  const [formNamaProdi, setFormNamaProdi] = useState("");
  const [formRumpun, setFormRumpun] = useState<string>("SAINTEK");
  const [formKodeRiasec, setFormKodeRiasec] = useState("");
  const [formKecerdasan, setFormKecerdasan] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Konfirmasi Hapus
  const [deletingProdi, setDeletingProdi] = useState<KlasterProdiItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // State Sinkronisasi Kuota
  const [isSyncingKuota, setIsSyncingKuota] = useState(false);

  // Muat data master prodi dari Backend Laravel
  const fetchProdiList = async (page = 1) => {
    try {
      setIsLoadingProdi(true);
      const params: any = { page };
      if (searchProdi.trim()) params.nama_prodi = searchProdi.trim();
      if (filterRumpun !== "SEMUA") params.kelompok_rumpun = filterRumpun;
      if (filterRiasec !== "SEMUA") params.kode_riasec = filterRiasec;

      const res = await prodiAdminService.getAll(params);
      if (res?.data?.data) {
        setProdiList(res.data.data);
        setPaginationMeta({
          total: res.data.total,
          perPage: res.data.per_page,
          lastPage: res.data.last_page,
        });
        setCurrentPage(res.data.current_page);
      }
    } catch (err: any) {
      console.warn("Gagal mengambil data prodi dari backend:", err?.message);
    } finally {
      setIsLoadingProdi(false);
    }
  };

  // Muat data Perguruan Tinggi dari Backend
  const fetchPtnList = async () => {
    try {
      setIsLoadingPtn(true);
      const res = await ptnService.getAll({
        search: searchPtn.trim() || undefined,
        per_page: 20,
      });
      if (res?.data && Array.isArray(res.data)) {
        setPtnList(res.data);
      }
    } catch (err: any) {
      console.warn("Gagal mengambil data PTN:", err?.message);
    } finally {
      setIsLoadingPtn(false);
    }
  };

  useEffect(() => {
    fetchProdiList(1);
  }, [filterRumpun, filterRiasec]);

  useEffect(() => {
    if (activeTab === "ptn") {
      fetchPtnList();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProdiList(1);
  };

  const handleOpenAddModal = () => {
    setEditingProdi(null);
    setFormNamaProdi("");
    setFormRumpun("SAINTEK");
    setFormKodeRiasec("");
    setFormKecerdasan(OPSI_KECERDASAN[0]);
    setFormDeskripsi("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prodi: KlasterProdiItem) => {
    setEditingProdi(prodi);
    setFormNamaProdi(prodi.nama_klaster || "");
    // Deteksi rumpun dari deskripsi jika ada
    let detectedRumpun = "SAINTEK";
    if (
      prodi.deskripsi?.toLowerCase().includes("soshum") ||
      prodi.nama_klaster?.toLowerCase().includes("hukum") ||
      prodi.nama_klaster?.toLowerCase().includes("ekonomi") ||
      prodi.nama_klaster?.toLowerCase().includes("sosial")
    ) {
      detectedRumpun = "SOSHUM";
    }
    setFormRumpun(detectedRumpun);
    setFormKodeRiasec(prodi.kode_riasec_relevan || "");
    setFormKecerdasan(prodi.kecerdasan_relevan || OPSI_KECERDASAN[0]);
    setFormDeskripsi(prodi.deskripsi || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProdi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaProdi.trim()) {
      setFormError("Nama Program Studi / Klaster wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload: KlasterProdiPayload = {
        nama_klaster: formNamaProdi.trim(),
        nama_prodi: formNamaProdi.trim(),
        kode_riasec_relevan: formKodeRiasec.trim().toUpperCase() || undefined,
        kecerdasan_relevan: formKecerdasan.trim() || undefined,
        deskripsi:
          formDeskripsi.trim() ||
          `Rumpun ${formRumpun} · Program studi rekomendasi SNBP SMARIHASTA`,
        kelompok_rumpun: formRumpun,
      };

      if (editingProdi) {
        // Update existing prodi
        await prodiAdminService.update(editingProdi.id, payload);
        setNotification({
          type: "success",
          message: `Program studi "${formNamaProdi}" berhasil diperbarui.`,
        });
      } else {
        // Create new prodi
        await prodiAdminService.create(payload);
        setNotification({
          type: "success",
          message: `Program studi "${formNamaProdi}" berhasil ditambahkan ke database.`,
        });
      }

      setIsModalOpen(false);
      fetchProdiList(currentPage);
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan data program studi ke backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProdi) return;
    try {
      setIsDeleting(true);
      await prodiAdminService.delete(deletingProdi.id);
      setNotification({
        type: "success",
        message: `Program studi "${deletingProdi.nama_klaster}" berhasil dihapus.`,
      });
      setDeletingProdi(null);
      fetchProdiList(currentPage);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "Gagal menghapus program studi dari database.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSyncKuota = async () => {
    try {
      setIsSyncingKuota(true);
      setNotification(null);
      const res = await eligibilitasService.kalkulasiOtomatis();
      setNotification({
        type: "success",
        message:
          res?.message ||
          "Kalkulasi daya tampung dan kuota eligibilitas SNBP berhasil disinkronkan!",
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "Terjadi kesalahan saat menyinkronkan kuota SNBP.",
      });
    } finally {
      setIsSyncingKuota(false);
    }
  };

  return (
    <div
      className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#1F1729]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Tombol Navigasi Kembali */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/b2"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6941C6] hover:text-[#53389E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Admin B2</span>
        </Link>
        <span className="text-[12px] text-[#6E6678]">
          Portal Manajemen B2 · SMAN 8 Malang
        </span>
      </div>

      {/* Header Utama & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center shadow-2xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1F1729] tracking-tight">
              Master Program Studi &amp; Kuota SNBP PTN
            </h1>
          </div>
          <p className="text-[13px] text-[#6E6678] max-w-3xl leading-relaxed">
            Kelola master klaster program studi, pemetaan kelompok rumpun keilmuan, profil
            kecocokan RIASEC, kecerdasan majemuk, serta kuota eligibilitas daya tampung SNBP PTN
            SMARIHASTA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            disabled={isSyncingKuota}
            onClick={handleSyncKuota}
            className="px-3.5 py-2.5 rounded-lg border border-[#D0D5DD] bg-white text-[12px] font-semibold text-[#344054] hover:border-[#7F56D9] hover:text-[#6941C6] transition-colors flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#7F56D9] ${isSyncingKuota ? "animate-spin" : ""}`}
            />
            <span>{isSyncingKuota ? "Menyinkronkan..." : "Sinkronkan Kuota SNBP"}</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-lg bg-[#7F56D9] hover:bg-[#6941C6] active:bg-[#53389E] text-white text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Program Studi</span>
          </button>
        </div>
      </div>

      {/* Alert Notifikasi */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 border shadow-2xs animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-[#DCFCE7] border-[#86EFAC] text-[#148557]"
              : "bg-[#FEE4E2] border-[#FECDCA] text-[#D92D20]"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#148557]" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#D92D20]" />
          )}
          <div className="flex-1 text-[13px] font-medium leading-relaxed">
            {notification.message}
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-current opacity-70 hover:opacity-100 p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Statistik Kuota SNBP & Ringkasan Kapasitas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#6E6678] uppercase tracking-wider">
              Total Kuota Eligible SNBP
            </p>
            <p className="text-[24px] font-bold text-[#6941C6] mt-1">168 Siswa</p>
            <p className="text-[11px] text-[#6E6678] mt-0.5">
              40% Kuota Akreditasi A (dari 420 siswa)
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#6E6678] uppercase tracking-wider">
              Alokasi Kuota MIPA
            </p>
            <p className="text-[24px] font-bold text-[#1F1729] mt-1">96 Siswa</p>
            <p className="text-[11px] text-[#148557] font-medium mt-0.5">
              57.1% Porsi Jurusan MIPA
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EFF8FF] text-[#175CD3] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#6E6678] uppercase tracking-wider">
              Alokasi Kuota IPS
            </p>
            <p className="text-[24px] font-bold text-[#1F1729] mt-1">72 Siswa</p>
            <p className="text-[11px] text-[#B54708] font-medium mt-0.5">
              42.9% Porsi Jurusan IPS
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#FEF3F2] text-[#B42318] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#EAECF0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#6E6678] uppercase tracking-wider">
              Master Klaster Terdata
            </p>
            <p className="text-[24px] font-bold text-[#148557] mt-1">
              {paginationMeta.total} Klaster
            </p>
            <p className="text-[11px] text-[#6E6678] mt-0.5">
              Terhubung ke Rekomendasi SAW
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#ECFDF3] text-[#027A48] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigasi Tab */}
      <div className="bg-white rounded-2xl border border-[#EAECF0] shadow-xs overflow-hidden">
        <div className="flex border-b border-[#EAECF0] bg-[#FAF9FE] px-5 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("prodi")}
            className={`pb-3.5 px-4 text-[13px] font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === "prodi"
                ? "text-[#6941C6] border-b-2 border-[#7F56D9]"
                : "text-[#6E6678] hover:text-[#1F1729]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Program Studi &amp; Klaster Keilmuan</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-[#F4EBFF] text-[#6941C6] font-bold">
              {paginationMeta.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ptn")}
            className={`pb-3.5 px-4 text-[13px] font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === "ptn"
                ? "text-[#6941C6] border-b-2 border-[#7F56D9]"
                : "text-[#6E6678] hover:text-[#1F1729]"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Katalog PTN &amp; Referensi Daya Tampung</span>
          </button>
        </div>

        {/* TAB 1: MASTER PRODI & KLASTER */}
        {activeTab === "prodi" && (
          <div className="p-5 sm:p-6">
            {/* Filter & Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari program studi atau kata kunci klaster..."
                  value={searchProdi}
                  onChange={(e) => setSearchProdi(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#D0D5DD] bg-white text-[12px] text-[#1F1729] placeholder-[#98A2B3] focus:outline-hidden focus:ring-2 focus:ring-[#7F56D9]/20 focus:border-[#7F56D9]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-[12px] text-[#667085]">
                  <span className="font-medium">Rumpun:</span>
                  <select
                    value={filterRumpun}
                    onChange={(e) => setFilterRumpun(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[12px] font-medium text-[#344054] focus:outline-hidden focus:ring-1 focus:ring-[#7F56D9]"
                  >
                    <option value="SEMUA">Semua Rumpun</option>
                    <option value="SAINTEK">SAINTEK</option>
                    <option value="SOSHUM">SOSHUM</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-[12px] text-[#667085]">
                  <span className="font-medium">RIASEC:</span>
                  <select
                    value={filterRiasec}
                    onChange={(e) => setFilterRiasec(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[12px] font-medium text-[#344054] focus:outline-hidden focus:ring-1 focus:ring-[#7F56D9]"
                  >
                    <option value="SEMUA">Semua Kode</option>
                    <option value="R">Realistis (R)</option>
                    <option value="I">Investigatif (I)</option>
                    <option value="A">Artistik (A)</option>
                    <option value="S">Sosial (S)</option>
                    <option value="E">Enterprising (E)</option>
                    <option value="C">Konvensional (C)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-[#FAF9FE] border border-[#D0D5DD] text-[12px] font-semibold text-[#344054] hover:bg-[#F4EBFF] hover:text-[#6941C6] transition-colors cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </form>

            {/* Tabel Master Prodi */}
            <div className="border border-[#EAECF0] rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-[#FAF9FE] border-b border-[#EAECF0] text-[#6E6678] font-semibold">
                      <th className="px-5 py-3 w-14">No</th>
                      <th className="px-5 py-3">Nama Program Studi / Klaster</th>
                      <th className="px-5 py-3">Kelompok Rumpun</th>
                      <th className="px-5 py-3">Kode RIASEC</th>
                      <th className="px-5 py-3">Kecerdasan Relevan</th>
                      <th className="px-5 py-3">Deskripsi &amp; Cakupan</th>
                      <th className="px-5 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0]">
                    {isLoadingProdi ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-[#667085]">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7F56D9]" />
                          <span>Memuat master program studi dari backend...</span>
                        </td>
                      </tr>
                    ) : prodiList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-[#667085]">
                          <div className="w-12 h-12 rounded-full bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center mx-auto mb-3">
                            <Layers className="w-6 h-6" />
                          </div>
                          <p className="font-semibold text-[13px] text-[#1F1729]">
                            Belum Ada Data Program Studi Ditemukan
                          </p>
                          <p className="text-[11px] text-[#6E6678] mt-1 max-w-sm mx-auto">
                            Gunakan tombol &quot;+ Tambah Program Studi&quot; di atas untuk
                            mendaftarkan master klaster baru.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      prodiList.map((prodi, idx) => {
                        const isSoshum =
                          prodi.deskripsi?.toLowerCase().includes("soshum") ||
                          prodi.nama_klaster?.toLowerCase().includes("hukum") ||
                          prodi.nama_klaster?.toLowerCase().includes("ekonomi");
                        return (
                          <tr
                            key={prodi.id}
                            className={`hover:bg-[#FCFAFF] transition-colors ${
                              idx % 2 === 1 ? "bg-[#FAF9FE]/40" : "bg-white"
                            }`}
                          >
                            <td className="px-5 py-3.5 font-bold text-[#6E6678]">
                              {(currentPage - 1) * paginationMeta.perPage + idx + 1}
                            </td>

                            <td className="px-5 py-3.5 font-semibold text-[#1F1729]">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#7F56D9]" />
                                <span>{prodi.nama_klaster}</span>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              {isSoshum ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]">
                                  SOSHUM
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]">
                                  SAINTEK
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-3.5">
                              {prodi.kode_riasec_relevan ? (
                                <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[11px] bg-[#F4EBFF] text-[#6941C6] border border-[#E9D7FE]">
                                  {prodi.kode_riasec_relevan}
                                </span>
                              ) : (
                                <span className="text-[#98A2B3]">-</span>
                              )}
                            </td>

                            <td className="px-5 py-3.5 text-[#344054]">
                              {prodi.kecerdasan_relevan ? (
                                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#475467]">
                                  <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B]" />
                                  {prodi.kecerdasan_relevan}
                                </span>
                              ) : (
                                <span className="text-[#98A2B3]">-</span>
                              )}
                            </td>

                            <td className="px-5 py-3.5 text-[#667085] max-w-xs truncate">
                              {prodi.deskripsi || "-"}
                            </td>

                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(prodi)}
                                  className="p-1.5 rounded-lg border border-[#D0D5DD] hover:bg-[#F4EBFF] hover:border-[#7F56D9] text-[#344054] hover:text-[#6941C6] transition-colors cursor-pointer"
                                  title="Edit Program Studi"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingProdi(prodi)}
                                  className="p-1.5 rounded-lg border border-[#FECDCA] hover:bg-[#FEE4E2] text-[#D92D20] transition-colors cursor-pointer"
                                  title="Hapus Program Studi"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 text-[11px] text-[#667085] border-t border-[#EAECF0] bg-white">
                <span>
                  Menampilkan {prodiList.length} dari {paginationMeta.total} program studi terdata
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#6941C6]">
                    Halaman {currentPage} dari {paginationMeta.lastPage || 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || isLoadingProdi}
                      onClick={() => fetchProdiList(currentPage - 1)}
                      className="px-2.5 py-1 rounded border border-[#D0D5DD] hover:bg-[#F9F5FF] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-semibold text-[#344054] cursor-pointer transition-colors"
                    >
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= paginationMeta.lastPage || isLoadingProdi}
                      onClick={() => fetchProdiList(currentPage + 1)}
                      className="px-2.5 py-1 rounded border border-[#D0D5DD] hover:bg-[#F9F5FF] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-semibold text-[#344054] cursor-pointer transition-colors"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KATALOG PTN & DAYA TAMPUNG */}
        {activeTab === "ptn" && (
          <div className="p-5 sm:p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-bold text-[#1F1729]">
                  Daftar Perguruan Tinggi Negeri (PTN) Favorit SMARIHASTA
                </h3>
                <p className="text-[12px] text-[#6E6678]">
                  Referensi daya tampung dan rasio persaingan SNBP untuk mendukung konseling
                  pemilihan jurusan siswa.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama kampus atau kota..."
                  value={searchPtn}
                  onChange={(e) => setSearchPtn(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#D0D5DD] text-[12px] text-[#1F1729] focus:outline-hidden focus:ring-1 focus:ring-[#7F56D9]"
                />
              </div>
            </div>

            {/* Grid Kartu PTN */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TOP_PTN_SMARIHASTA.filter(
                (pt) =>
                  !searchPtn.trim() ||
                  pt.nama_pt.toLowerCase().includes(searchPtn.toLowerCase()) ||
                  pt.nama_singkat.toLowerCase().includes(searchPtn.toLowerCase()) ||
                  pt.kota.toLowerCase().includes(searchPtn.toLowerCase())
              ).map((ptn) => (
                <div
                  key={ptn.id}
                  className="bg-white rounded-xl border border-[#EAECF0] p-4.5 hover:border-[#7F56D9] hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#F4EBFF] text-[#7F56D9] font-bold text-[14px] flex items-center justify-center border border-[#E9D7FE]">
                        {ptn.nama_singkat}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#148557] border border-[#86EFAC]">
                        Akreditasi {ptn.akreditasi}
                      </span>
                    </div>

                    <h4 className="font-bold text-[13px] text-[#1F1729] line-clamp-1">
                      {ptn.nama_pt}
                    </h4>
                    <p className="text-[11px] text-[#6E6678] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#98A2B3]" />
                      {ptn.kota}, {ptn.provinsi}
                    </p>

                    <div className="mt-3.5 pt-3 border-t border-[#EAECF0] space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-[#475467]">
                        <span>Daya Tampung SNBP:</span>
                        <span className="font-semibold text-[#1F1729]">
                          {ptn.daya_tampung_snbp} Kursi
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#475467]">
                        <span>Rasio Ketetatan:</span>
                        <span className="font-semibold text-[#6941C6]">
                          {ptn.rasio_ketetatan}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#475467]">
                        <span>Fokus Unggulan:</span>
                        <span className="font-medium text-[#148557]">
                          {ptn.favorit_jalur}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F2F4F7]">
                    <span className="text-[10.5px] font-semibold text-[#7F56D9] hover:text-[#53389E] inline-flex items-center gap-1">
                      <span>Lihat Kuota Rinci</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT PROGRAM STUDI */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-[540px] rounded-2xl bg-white shadow-xl border border-[#E9D7FE] overflow-hidden text-[#1F2937]">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-[#EAECF0] bg-[#FAF9FE]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[#1F1729]">
                    {editingProdi
                      ? "Edit Data Program Studi"
                      : "Tambah Program Studi / Klaster Baru"}
                  </h3>
                  <p className="text-[11px] text-[#6E6678]">
                    Master referensi rekomendasi prodi &amp; kriteria minat bakat siswa
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSaveProdi} className="p-5 space-y-4 text-[12px]">
              {formError && (
                <div className="p-3 rounded-xl bg-[#FEE4E2] border border-[#FECDCA] text-[#D92D20] text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                  Nama Program Studi / Klaster Keilmuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Teknik Informatika / Ilmu Komputer"
                  value={formNamaProdi}
                  onChange={(e) => setFormNamaProdi(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#D0D5DD] text-[#1F1729] focus:outline-hidden focus:ring-2 focus:ring-[#7F56D9]/20 focus:border-[#7F56D9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    Kelompok Rumpun
                  </label>
                  <select
                    value={formRumpun}
                    onChange={(e) => setFormRumpun(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] bg-white text-[#1F1729] focus:outline-hidden focus:ring-1 focus:ring-[#7F56D9]"
                  >
                    {OPSI_RUMPUN.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    Kode RIASEC Relevan
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Contoh: IRC, RIA, SEC"
                    value={formKodeRiasec}
                    onChange={(e) => setFormKodeRiasec(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D0D5DD] text-[#1F1729] font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-[#7F56D9]/20 focus:border-[#7F56D9]"
                  />
                  <p className="text-[10px] text-[#6E6678] mt-1">
                    Kombinasi Realistic, Investigative, Artistic, Social, Enterprising, Conventional.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                  Kecerdasan Majemuk Dominan
                </label>
                <select
                  value={formKecerdasan}
                  onChange={(e) => setFormKecerdasan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] bg-white text-[#1F1729] focus:outline-hidden focus:ring-1 focus:ring-[#7F56D9]"
                >
                  {OPSI_KECERDASAN.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                  Deskripsi &amp; Cakupan Jurusan
                </label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan klaster program studi, keahlian utama, dan bidang karir lulusan..."
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#D0D5DD] text-[#1F1729] focus:outline-hidden focus:ring-2 focus:ring-[#7F56D9]/20 focus:border-[#7F56D9]"
                />
              </div>

              {/* Footer Modal Form */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAECF0]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#D0D5DD] text-[#344054] hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#7F56D9] hover:bg-[#6941C6] text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingProdi ? "Simpan Perubahan" : "Tambahkan Program Studi"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deletingProdi && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeletingProdi(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-[420px] rounded-2xl bg-white shadow-xl border border-[#FECDCA] overflow-hidden text-[#1F2937] p-5">
            <div className="w-10 h-10 rounded-full bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[15px] text-[#1F1729]">Hapus Program Studi?</h3>
            <p className="text-[12px] text-[#6E6678] mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus program studi{" "}
              <strong className="text-[#1F1729]">&quot;{deletingProdi.nama_klaster}&quot;</strong>{" "}
              dari basis data master? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingProdi(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#D0D5DD] text-[#344054] hover:bg-slate-50 text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-[#D92D20] hover:bg-[#B42318] text-white text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
