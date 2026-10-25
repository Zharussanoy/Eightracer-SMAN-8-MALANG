"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminHero from "@/components/admin/AdminHero";
import AdminTabNav from "@/components/admin/AdminTabNav";
import AdminSummarySection from "@/components/admin/AdminSummarySection";
import AdminAlumniTable from "@/components/admin/AdminAlumniTable";
import AdminAiStrategiSection from "@/components/admin/AdminAiStrategiSection";
import AlumniFormModal from "@/components/admin/AlumniFormModal";
import CsvImportModal from "@/components/admin/CsvImportModal";

import { AdminRole, AdminTab, AlumniItem } from "@/components/admin/types";
import { INITIAL_ALUMNI } from "@/components/admin/mockData";

function AdminDashboardContent() {
  const searchParams = useSearchParams();

  const [role, setRole] = useState<AdminRole>("admin");

  const [activeTab, setActiveTab] = useState<AdminTab>("Ringkasan");

  const [alumniList, setAlumniList] = useState<AlumniItem[]>(INITIAL_ALUMNI);
  const [selectedIds, setSelectedIds] = useState<string[]>(["alm-1", "alm-2"]);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniItem | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "siswa") {
      setRole("siswa");
    } else if (roleParam === "admin") {
      setRole("admin");
    }

    const tabParam = searchParams.get("tab");
    if (tabParam === "direktori") {
      setActiveTab("Direktori Alumni");
    } else if (tabParam === "ai") {
      setActiveTab("AI Strategi Jurusan");
    }
  }, [searchParams]);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <AdminNavbar
        role={role}
        onRoleChange={setRole}
        onNavigateTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AdminHero onNavigateTab={setActiveTab} />
        <AdminTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alumniCount={alumniList.length}
        />

        {activeTab === "Ringkasan" && (
          <AdminSummarySection onNavigateTab={setActiveTab} />
        )}
        {activeTab === "Direktori Alumni" && (
          <AdminAlumniTable
            role={role}
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
          &copy; {new Date().getFullYear()} Eightracer SMAN 8 Malang. Sistem Informasi
          Kelulusan &amp; Direktori Alumni Terpadu.
        </p>
      </footer>
    </div>
  );
}

export default function AdminPage() {
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
