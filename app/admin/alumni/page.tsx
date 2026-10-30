"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminHero from "@/components/admin/b-3/AdminHero";
import AdminTabNav from "@/components/admin/b-3/AdminTabNav";
import AdminSummarySection from "@/components/admin/b-3/AdminSummarySection";
import AdminAlumniTable from "@/components/admin/b-3/AdminAlumniTable";
import AdminAiStrategiSection from "@/components/admin/b-3/AdminAiStrategiSection";
import AdminFormSection from "@/components/admin/b-3/AdminFormSection";
import AlumniFormModal from "@/components/admin/b-3/AlumniFormModal";
import CsvImportModal from "@/components/admin/b-3/CsvImportModal";

import { AdminRole, AdminTab, AlumniItem } from "@/components/admin/b-3/types";
import { INITIAL_ALUMNI } from "@/components/admin/b-3/mockData";
import { useUser, PresetKey } from "@/context/UserContext";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const { switchRole } = useUser();

  const [role, setRole] = useState<AdminRole>("alumni");
  const [activeTab, setActiveTab] = useState<AdminTab>("Ringkasan");

  const [alumniList, setAlumniList] = useState<AlumniItem[]>(INITIAL_ALUMNI);
  const [selectedIds, setSelectedIds] = useState<string[]>(["alm-1", "alm-2"]);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Sync role & tab with query params
  useEffect(() => {
    const roleParam = searchParams.get("role") as AdminRole | null;
    if (
      roleParam === "siswa" ||
      roleParam === "alumni" ||
      roleParam === "guru" ||
      roleParam === "admin"
    ) {
      const timer = setTimeout(() => {
        setRole(roleParam);
        const mapPreset: Record<AdminRole, PresetKey> = {
          siswa: "siswa_aktif",
          alumni: "siswa_alumni",
          guru: "guru",
          admin: "admin",
        };
        switchRole(mapPreset[roleParam]);
      }, 0);
      return () => clearTimeout(timer);
    }

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
    }
  }, [searchParams, switchRole]);

  // Handle role change from navbar
  const handleRoleChange = (newRole: AdminRole) => {
    setRole(newRole);
    if (
      activeTab === "Formulir Pendataan" &&
      newRole !== "alumni" &&
      newRole !== "admin"
    ) {
      setActiveTab("Ringkasan");
    }
  };

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
  };

  const handleImportComplete = (newRows: AlumniItem[]) => {
    setAlumniList((prev) => [...newRows, ...prev]);
  };

  // Adapter role untuk AdminAlumniTable yang menerima "admin" | "siswa"
  const tableRole = role === "admin" ? "admin" : "siswa";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <AdminNavbar
        role={role}
        onRoleChange={handleRoleChange}
        onNavigateTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <AdminHero onNavigateTab={setActiveTab} />

        <AdminTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alumniCount={alumniList.length}
          role={role}
        />

        {activeTab === "Ringkasan" && (
          <AdminSummarySection onNavigateTab={setActiveTab} />
        )}

        {activeTab === "Direktori Alumni" && (
          <AdminAlumniTable
            role={tableRole}
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

        {activeTab === "AI Strategi Jurusan" && (
          <AdminAiStrategiSection onNavigateTab={setActiveTab} />
        )}

        {activeTab === "Formulir Pendataan" && (
          <AdminFormSection role={role} />
        )}
      </main>

      <AlumniFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveAlumni}
        initialData={editingAlumni}
      />

      <CsvImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />

      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} Eightracer SMAN 8 Malang &bull; Fitur Tim B3.
          Sistem Informasi Kelulusan &amp; Direktori Alumni Terpadu.
        </p>
      </footer>
    </div>
  );
}

export default function AdminAlumniPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-[#5F089E] rounded-full animate-spin" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
