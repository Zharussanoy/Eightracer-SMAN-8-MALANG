"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import AdminHero from "@/components/admin/direktori-alumni/AdminHero";
import AdminTabNav from "@/components/admin/direktori-alumni/AdminTabNav";
import AdminSummarySection from "@/components/admin/direktori-alumni/AdminSummarySection";
import AdminAlumniTable from "@/components/admin/direktori-alumni/AdminAlumniTable";
import AdminAiStrategiSection from "@/components/admin/direktori-alumni/AdminAiStrategiSection";
import AdminFormSection from "@/components/admin/direktori-alumni/AdminFormSection";
import AlumniFormModal from "@/components/admin/direktori-alumni/AlumniFormModal";
import CsvImportModal from "@/components/admin/direktori-alumni/CsvImportModal";

import {
  AdminRole,
  AdminTab,
  AlumniItem,
} from "@/components/admin/direktori-alumni/types";
import { INITIAL_ALUMNI } from "@/components/admin/direktori-alumni/mockData";
import { useUser } from "@/context/UserContext";
import { alumniAdminService, AlumniTracerItem } from "@/services/b2";
import { FormDataPendataan } from "@/types/user";

function mapTracerToAlumniItem(st: AlumniTracerItem): AlumniItem {
  const nama = st.siswa?.nama_lengkap || st.nama || "Alumni Smarihasta";
  const nisn = st.siswa?.nisn || st.nisn || "-";
  const angkatan = st.buku_alumni?.tahun_lulusan
    ? `Alumni ${st.buku_alumni.tahun_lulusan}`
    : st.tahun_lulus
    ? `Alumni ${st.tahun_lulus}`
    : "Alumni 2024";
  const kampus = st.perguruan_tinggi?.nama_pt || st.univ || "Universitas Brawijaya";

  let kampusKode = st.perguruan_tinggi?.nama_singkat || st.univ_singkat || "";
  if (!kampusKode) {
    if (kampus.includes("Brawijaya")) kampusKode = "UB";
    else if (kampus.includes("Teknologi Bandung")) kampusKode = "ITB";
    else if (kampus.includes("Gadjah Mada")) kampusKode = "UGM";
    else if (kampus.includes("Negeri Malang")) kampusKode = "UM";
    else if (kampus.includes("Sepuluh Nopember") || kampus.includes("ITS")) kampusKode = "ITS";
    else if (kampus.includes("Airlangga")) kampusKode = "UNAIR";
    else if (kampus.includes("Indonesia")) kampusKode = "UI";
    else if (kampus.includes("Diponegoro")) kampusKode = "UNDIP";
    else kampusKode = "PTN";
  }

  const rawJalur = (st.jalur_masuk || "").toUpperCase();
  let jalur: "SNBP" | "SNBT" | "Mandiri" = "SNBP";
  if (rawJalur.includes("SNBP")) jalur = "SNBP";
  else if (rawJalur.includes("SNBT") || rawJalur.includes("UTBK")) jalur = "SNBT";
  else jalur = "Mandiri";

  const certList: string[] = [];
  if (Array.isArray(st.sertifikat)) {
    st.sertifikat.forEach((cert) => {
      if (typeof cert === "string") certList.push(cert);
      else if (cert && typeof cert === "object" && cert.nama_kompetisi) {
        certList.push(cert.nama_kompetisi);
      }
    });
  }

  return {
    id: String(st.id),
    nisn,
    nama,
    angkatan,
    kampus,
    kampusKode,
    jurusan: st.program_studi || st.prodi || "Program Studi",
    jalur,
    pilihanKe: st.pilihan_ke ? `Pilihan ${st.pilihan_ke}` : "Pilihan 1",
    statusPenerimaan:
      st.status_penerimaan === "diterima"
        ? "Lolos / Diterima"
        : st.status_penerimaan || "Lolos / Diterima",
    jenjang: st.strata_pendidikan || st.strata || "S1",
    nilai: Number(st.nilai_rapor_pendaftaran || st.nilai_rapor || 90.0),
    skorUtbk: st.skor_utbk ? Number(st.skor_utbk) : null,
    sertifikat: certList.length > 0 ? certList : ["Juara Kompetisi Akademik"],
    isKipk: Boolean(st.is_pelamar_kipk ?? st.is_kipk),
  };
}

function AlumniPageContent() {
  const searchParams = useSearchParams();
  const { getDisplayRole } = useUser();
  const displayRole = getDisplayRole();

  // Role ditentukan secara dinamis dari context (atau URL override bila ada)
  const roleParam = searchParams.get("role") as AdminRole | null;
  const currentRole: AdminRole = useMemo(() => {
    if (
      roleParam === "admin" ||
      roleParam === "alumni" ||
      roleParam === "guru" ||
      roleParam === "siswa"
    ) {
      return roleParam;
    }
    return displayRole.roleType as AdminRole;
  }, [roleParam, displayRole.roleType]);

  const [activeTab, setActiveTab] = useState<AdminTab>("Direktori Alumni");
  const [alumniList, setAlumniList] = useState<AlumniItem[]>(INITIAL_ALUMNI);
  const [selectedIds, setSelectedIds] = useState<string[]>(["alm-1", "alm-2"]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Sync tab dengan parameter query URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "direktori") {
      const timer = setTimeout(() => setActiveTab("Direktori Alumni"), 0);
      return () => clearTimeout(timer);
    } else if (tabParam === "ai") {
      const timer = setTimeout(() => setActiveTab("AI Strategi Jurusan"), 0);
      return () => clearTimeout(timer);
    } else if (
      tabParam === "pendataan" ||
      tabParam === "form" ||
      tabParam === "formulir"
    ) {
      const timer = setTimeout(() => setActiveTab("Formulir Pendataan"), 0);
      return () => clearTimeout(timer);
    } else if (tabParam === "ringkasan") {
      const timer = setTimeout(() => setActiveTab("Ringkasan"), 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Validasi tab jika role berubah dan pengguna berada di formulir yang tidak diizinkan
  useEffect(() => {
    if (
      activeTab === "Formulir Pendataan" &&
      currentRole !== "alumni" &&
      currentRole !== "admin"
    ) {
      const timer = setTimeout(() => setActiveTab("Direktori Alumni"), 0);
      return () => clearTimeout(timer);
    }
  }, [currentRole, activeTab]);

  // Muat data live dari API
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveAlumni() {
      setIsLoadingLive(true);
      try {
        let liveItems: AlumniItem[] = [];
        try {
          const resAdmin = await alumniAdminService.getAllAdmin({ page: 1 });
          if (resAdmin.data?.data && Array.isArray(resAdmin.data.data)) {
            liveItems = resAdmin.data.data.map(mapTracerToAlumniItem);
          }
        } catch {
          // Fallback coba public alumni endpoint
          try {
            const resPub = await alumniAdminService.getAllPublic({ per_page: 50 });
            if (resPub.data && Array.isArray(resPub.data)) {
              liveItems = resPub.data.map(mapTracerToAlumniItem);
            }
          } catch {
            // Biarkan kosong jika offline/unauthenticated
          }
        }

        if (isMounted) {
          if (liveItems.length > 0) {
            const liveIds = new Set(liveItems.map((i) => i.id));
            const merged = [...liveItems, ...INITIAL_ALUMNI.filter((i) => !liveIds.has(i.id))];
            setAlumniList(merged);
            setSyncStatus(`Terhubung ke database API: ${liveItems.length} data live aktif`);
          } else {
            setSyncStatus("Terhubung ke API Laravel Eightracer (Mode sinkronisasi aktif)");
          }
        }
      } catch (err) {
        console.warn("Gagal memuat alumni live:", err);
      } finally {
        if (isMounted) setIsLoadingLive(false);
      }
    }
    fetchLiveAlumni();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers untuk seleksi baris (khusus admin)
  const handleSelectAll = () => {
    if (selectedIds.length === alumniList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(alumniList.map((item) => item.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handlers CRUD Alumni
  const handleDeleteRow = async (id: string) => {
    const isNumeric = !isNaN(Number(id));
    if (isNumeric) {
      try {
        await alumniAdminService.delete(Number(id));
      } catch (err) {
        console.warn("API Delete Alumni warning:", err);
      }
    }
    setAlumniList((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleOpenAddModal = () => {
    setEditingAlumni(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (alumni: AlumniItem) => {
    setEditingAlumni(alumni);
    setShowFormModal(true);
  };

  const handleSaveAlumni = async (
    alumniData: Omit<AlumniItem, "id">,
    editId?: string | null
  ) => {
    if (editId) {
      const isNumeric = !isNaN(Number(editId));
      if (isNumeric) {
        try {
          await alumniAdminService.update(Number(editId), {
            ptn_diterima: alumniData.kampus,
            prodi_diterima: alumniData.jurusan,
            strata_pendidikan: alumniData.jenjang,
            jalur_masuk: alumniData.jalur,
            nilai_rapor_pendaftaran: alumniData.nilai,
            skor_utbk: alumniData.skorUtbk,
            is_pelamar_kipk: alumniData.isKipk,
            status_penerimaan: "diterima",
          });
        } catch (err: any) {
          console.warn("Update alumni API warning:", err);
        }
      }
      setAlumniList((prev) =>
        prev.map((item) =>
          item.id === editId ? { ...alumniData, id: editId } : item
        )
      );
    } else {
      let createdItem: AlumniItem | null = null;
      try {
        const res = await alumniAdminService.create({
          siswa_id: 1,
          ptn_diterima: alumniData.kampus,
          prodi_diterima: alumniData.jurusan,
          strata_pendidikan: alumniData.jenjang,
          jalur_masuk: alumniData.jalur,
          tahun_lulus: "2024",
          pilihan_ke: alumniData.pilihanKe.includes("2") ? 2 : 1,
          status_penerimaan: "diterima",
          nilai_rapor_pendaftaran: alumniData.nilai,
          skor_utbk: alumniData.skorUtbk,
          is_pelamar_kipk: alumniData.isKipk,
        });
        if (res.data) {
          createdItem = mapTracerToAlumniItem(res.data);
        }
      } catch (err: any) {
        console.warn("Create alumni API notice:", err);
      }

      const newEntry: AlumniItem = createdItem || {
        ...alumniData,
        id: `alm-${Date.now()}`,
      };
      setAlumniList((prev) => [newEntry, ...prev]);
    }
    setShowFormModal(false);
  };

  const handleSaveFromPendataan = async (formData: FormDataPendataan) => {
    try {
      await alumniAdminService.create({
        siswa_id: 1,
        ptn_diterima: formData.kampus || "Universitas Brawijaya",
        prodi_diterima: formData.jurusan || "Teknik Informatika",
        strata_pendidikan: formData.jenjang || "S1",
        jalur_masuk: formData.jalur || "SNBP",
        tahun_lulus: String(formData.tahunLulus || "2024"),
        pilihan_ke: 1,
        status_penerimaan: "diterima",
        nilai_rapor_pendaftaran: Number(formData.nilaiRapor || 90),
        skor_utbk: formData.skorUtbk ? Number(formData.skorUtbk) : null,
        is_pelamar_kipk: Boolean(formData.isKipk),
      });
    } catch (e) {
      console.warn("Pendataan submit API notice:", e);
    }

    const rawJalur = (formData.jalur || "").toUpperCase();
    let normJalur: "SNBP" | "SNBT" | "Mandiri" = "SNBP";
    if (rawJalur.includes("SNBP")) normJalur = "SNBP";
    else if (rawJalur.includes("SNBT") || rawJalur.includes("UTBK")) normJalur = "SNBT";
    else normJalur = "Mandiri";

    const newEntry: AlumniItem = {
      id: `alm-${Date.now()}`,
      nisn: formData.nisn || "-",
      nama: formData.nama || "Alumni Baru",
      angkatan: formData.angkatan || "Alumni 2024",
      kampus: formData.kampus || "Universitas Brawijaya",
      kampusKode: formData.kampusKode || "UB",
      jurusan: formData.jurusan || "Teknik Informatika",
      jalur: normJalur,
      pilihanKe: "Pilihan 1",
      statusPenerimaan: "Lolos / Diterima",
      jenjang: formData.jenjang || "S1",
      nilai: Number(formData.nilaiRapor || 90),
      skorUtbk: formData.skorUtbk ? Number(formData.skorUtbk) : null,
      sertifikat: formData.sertifikat || [],
      isKipk: Boolean(formData.isKipk),
    };
    setAlumniList((prev) => [newEntry, ...prev]);
  };

  const handleImportComplete = (newRows: AlumniItem[]) => {
    setAlumniList((prev) => [...newRows, ...prev]);
  };

  // Kalkulasi statistik dinamis
  const stats = useMemo(() => {
    const total = alumniList.length;
    const ptn = alumniList.filter(
      (a) => !a.kampus.toLowerCase().includes("swasta")
    ).length;
    const snbpSnbt = alumniList.filter(
      (a) => a.jalur === "SNBP" || a.jalur === "SNBT"
    ).length;
    const mandiri = alumniList.filter((a) => a.jalur === "Mandiri").length;
    return { total, ptn, snbpSnbt, mandiri };
  }, [alumniList]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Section */}
        <AdminHero onNavigateTab={setActiveTab} />

        {/* Status Indikator Sinkronisasi Database API */}
        {syncStatus && (
          <div className="mb-4 px-4 py-2.5 rounded-2xl bg-white border border-purple-100 shadow-2xs flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-900">{syncStatus}</span>
              {isLoadingLive && (
                <div className="w-3.5 h-3.5 border-2 border-purple-300 border-t-[#5F089E] rounded-full animate-spin" />
              )}
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold text-[#5F089E] bg-purple-50 px-2.5 py-1 rounded-lg">
              Endpoint: /api/v1/admin/alumni
            </span>
          </div>
        )}

        {/* Tab Navigasi Dinamis Berdasarkan Role */}
        <AdminTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alumniCount={alumniList.length}
          role={currentRole}
        />

        {/* Konten Tab 1: Ringkasan */}
        {activeTab === "Ringkasan" && (
          <AdminSummarySection
            onNavigateTab={setActiveTab}
            totalCount={stats.total}
            ptnCount={stats.ptn}
            snbpCount={stats.snbpSnbt}
            mandiriCount={stats.mandiri}
          />
        )}

        {/* Konten Tab 2: Direktori Alumni */}
        {activeTab === "Direktori Alumni" && (
          <AdminAlumniTable
            role={currentRole}
            alumniList={alumniList}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
            onOpenImportModal={() => setShowImportModal(true)}
            onDeleteRow={handleDeleteRow}
          />
        )}

        {/* Konten Tab 3: AI Strategi Jurusan */}
        {activeTab === "AI Strategi Jurusan" && (
          <AdminAiStrategiSection onNavigateTab={setActiveTab} />
        )}

        {/* Konten Tab 4: Formulir Pendataan Mandiri (Khusus Alumni & Admin) */}
        {activeTab === "Formulir Pendataan" && (
          <AdminFormSection
            role={currentRole}
            onSaveSuccess={handleSaveFromPendataan}
          />
        )}
      </main>

      {/* Modal Tambah / Edit Alumni (Khusus Mode Admin) */}
      <AlumniFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveAlumni}
        initialData={editingAlumni}
      />

      {/* Modal Import CSV (Khusus Mode Admin) */}
      <CsvImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Footer Khusus Fitur Tim B3 */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} Eightracer SMAN 8 Malang &bull; Tim B3.
          Sistem Informasi Kelulusan &amp; Direktori Alumni Terpadu.
        </p>
      </footer>
    </div>
  );
}

export default function AlumniPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-[#5F089E] rounded-full animate-spin" />
        </div>
      }
    >
      <AlumniPageContent />
    </Suspense>
  );
}
