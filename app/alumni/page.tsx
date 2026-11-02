"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import LandingContent from "@/components/shared/LandingContent";
import AdminHero from "@/components/admin/direktori-alumni/AdminHero";
import AdminTabNav from "@/components/admin/direktori-alumni/AdminTabNav";
import AdminSummarySection from "@/components/admin/direktori-alumni/AdminSummarySection";
import AdminAlumniTable from "@/components/admin/direktori-alumni/AdminAlumniTable";
import AdminAiStrategiSection from "@/components/admin/direktori-alumni/AdminAiStrategiSection";
import AdminFormSection from "@/components/admin/direktori-alumni/AdminFormSection";

import { AdminTab, AlumniItem } from "@/components/admin/direktori-alumni/types";
import { INITIAL_ALUMNI } from "@/components/admin/direktori-alumni/mockData";
import { useUser } from "@/context/UserContext";

function AlumniPageContent() {
  const searchParams = useSearchParams();
  const { currentUser } = useUser();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<AdminTab>("Direktori Alumni");
  const [alumniList] = useState<AlumniItem[]>(INITIAL_ALUMNI);

  useEffect(() => {
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
  }, [tabParam]);

  // Jika diakses melalui /alumni tanpa parameter tab, tampilkan landing page terlebih dahulu
  if (!tabParam) {
    return <LandingContent />;
  }

  // Jika diakses dengan tab (?tab=direktori / ?tab=ai / dll.), tampilkan fitur B3
  return (
    <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <AdminHero onNavigateTab={setActiveTab} />

      <AdminTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alumniCount={alumniList.length}
        role="alumni"
      />

      {activeTab === "Ringkasan" && (
        <AdminSummarySection onNavigateTab={setActiveTab} />
      )}

      {activeTab === "Direktori Alumni" && (
        <AdminAlumniTable
          role="alumni"
          alumniList={alumniList}
          selectedIds={[]}
          onToggleSelect={() => {}}
          onSelectAll={() => {}}
          onOpenAddModal={() => {}}
          onOpenEditModal={() => {}}
          onOpenImportModal={() => {}}
          onDeleteRow={() => {}}
        />
      )}

      {activeTab === "AI Strategi Jurusan" && (
        <AdminAiStrategiSection onNavigateTab={setActiveTab} />
      )}

      {activeTab === "Formulir Pendataan" && (
        <AdminFormSection role="alumni" />
      )}
    </main>
  );
}

export default function AlumniPage() {
  return (
    <Suspense fallback={null}>
      <AlumniPageContent />
    </Suspense>
  );
}
