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
import { apiFetch } from "@/lib/api";
import { ApiAlumni, mapApiAlumniToItem } from "@/lib/alumni";
import { FormDataPendataan } from "@/types/user";
import { mapPendataanToItem, normalizePendataan, pendataanStorageKey, validatePendataan } from "@/lib/pendataan";
import { useUser } from "@/context/UserContext";

// B3 records remain local until a backend write contract is available.
function withSavedPendataan(items: AlumniItem[], userId: string): AlumniItem[] {
  try {
    const saved = localStorage.getItem(pendataanStorageKey(userId));
    if (!saved) return items;
    const data = normalizePendataan(JSON.parse(saved) as FormDataPendataan);
    if (validatePendataan(data)) return items;
    const item = mapPendataanToItem(data, `pendataan:${userId}`);
    return [item, ...items.filter((entry) => entry.id !== item.id && entry.nisn !== item.nisn)];
  } catch {
    return items;
  }
}

function AlumniPageContent() {
  const searchParams = useSearchParams();
  const { getDisplayRole, currentUser } = useUser();
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
  const [alumniList, setAlumniList] = useState<AlumniItem[]>([]);
  const [isLoadingAlumni, setIsLoadingAlumni] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      const timer = setTimeout(() => {
        setAlumniList(withSavedPendataan(INITIAL_ALUMNI, currentUser.id));
        setIsLoadingAlumni(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let cancelled = false;
    apiFetch<{ data: ApiAlumni[] }>("/alumni?per_page=250")
      .then((res) => {
        if (!cancelled) setAlumniList(withSavedPendataan(res.data.map(mapApiAlumniToItem), currentUser.id));
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("Gagal fetch alumni dari API, menggunakan mock data:", err);
        setAlumniList(withSavedPendataan(INITIAL_ALUMNI, currentUser.id));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAlumni(false);
      });
    return () => { cancelled = true; };
  }, [currentUser.id]);
  const [selectedIds, setSelectedIds] = useState<string[]>(["alm-1", "alm-2"]);

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
  const handleDeleteRow = (id: string) => {
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

  const handleSaveAlumni = (
    alumniData: Omit<AlumniItem, "id">,
    editId?: string | null
  ) => {
    if (editId === `pendataan:${currentUser.id}`) {
      const saved = localStorage.getItem(pendataanStorageKey(currentUser.id));
      if (!saved) throw new Error("Data pendataan lokal tidak ditemukan.");
      const previous: FormDataPendataan = JSON.parse(saved);
      const updated = normalizePendataan({
        ...previous,
        ...alumniData,
        kelas: alumniData.kelas || "",
        nomorWa: alumniData.nomorWa || "",
        jenisKampus: alumniData.jenisKampus || "",
        nilaiRapor: alumniData.nilai,
      });
      const error = validatePendataan(updated);
      if (error) throw new Error(error);
      localStorage.setItem(pendataanStorageKey(currentUser.id), JSON.stringify(updated));
    }
    if (editId) {
      setAlumniList((prev) =>
        prev.map((item) =>
          item.id === editId ? { ...alumniData, id: editId } : item
        )
      );
    } else {
      const newEntry: AlumniItem = {
        ...alumniData,
        id: `alm-${Date.now()}`,
      };
      setAlumniList((prev) => [newEntry, ...prev]);
    }
    setShowFormModal(false);
  };
  const handleImportComplete = () => {
    apiFetch<{ data: ApiAlumni[] }>("/alumni?per_page=250")
      .then((res) => setAlumniList(res.data.map(mapApiAlumniToItem)))
      .catch((err) => console.error("Gagal refresh alumni:", err));
  };

  const refreshAlumni = () => {
    apiFetch<{ data: ApiAlumni[] }>("/alumni?per_page=250")
      .then((res) => {
        setAlumniList(withSavedPendataan(res.data.map(mapApiAlumniToItem), currentUser.id));
      })
      .catch((err) => {
        console.error("Gagal refresh alumni:", err);
      });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Section */}
        <AdminHero onNavigateTab={setActiveTab} />

        {/* Tab Navigasi Dinamis Berdasarkan Role */}
        <AdminTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alumniCount={alumniList.length}
          role={currentRole}
        />

        {/* Konten Tab 1: Ringkasan */}
        {activeTab === "Ringkasan" && (
          <AdminSummarySection onNavigateTab={setActiveTab} />
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
            key={currentUser.id}
            role={currentRole}
            onSaveSuccess={(data) => {
              const item = mapPendataanToItem(data, `pendataan:${currentUser.id}`);
              setAlumniList((previous) => [item, ...previous.filter((entry) => entry.id !== item.id && entry.nisn !== item.nisn)]);
            }}
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
