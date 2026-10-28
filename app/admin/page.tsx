"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import AlumniMapSection from "@/components/AlumniMapSection";
import AlumniTestimonialsSection from "@/components/AlumniTestimonialsSection";
import AboutSection from "@/components/AboutSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import { AdminRole, AdminTab } from "@/components/admin/b-3/types";

function AdminLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<AdminRole>("admin");

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "siswa" || roleParam === "admin") {
      setRole(roleParam);
    }

    // Redirect legacy/direct tab queries (e.g. /admin?tab=direktori) to /admin/alumni
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const queryString = searchParams.toString();
      router.replace(`/admin/alumni?${queryString}`);
    }
  }, [searchParams, router]);

  const handleNavigateTab = (tab: AdminTab) => {
    if (tab === "Ringkasan") {
      router.push("/admin/alumni");
    } else if (tab === "Direktori Alumni") {
      router.push("/admin/alumni?tab=direktori");
    } else if (tab === "AI Strategi Jurusan") {
      router.push("/admin/alumni?tab=ai");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Admin Navigation Bar */}
      <AdminNavbar
        role={role}
        onRoleChange={setRole}
        onNavigateTab={handleNavigateTab}
      />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <Hero />

        {/* Tentang Eightracer & Statistik */}
        <AboutSection />

        {/* 4 Layanan Utama Berbasis Data */}
        <ServicesSection />

        {/* Peta Sebaran Alumni Interaktif */}
        <AlumniMapSection />

        {/* Cerita & Kesan Alumni */}
        <AlumniTestimonialsSection />

        {/* Call to Action Banner */}
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-[#5F089E] rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLandingContent />
    </Suspense>
  );
}
