"use client";

import SiswaNavbar from "@/components/siswa/SiswaNavbar";
import SiswaTabNav from "@/components/siswa/SiswaTabNav";
import PerbandinganNilai from "@/components/siswa/b-2/PerbandinganNilai";
import { useRouter } from "next/navigation";

export default function PerbandinganNilaiPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-purple-100">
      <SiswaNavbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 lg:px-10 pt-8 pb-16">
        {/* Breadcrumb & Judul */}
        <div className="mb-6">
          <p
            className="text-xs sm:text-sm text-[#667085] mb-1.5"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Beranda/B2/Perbandingan Nilai
          </p>
          <h1
            className="text-[28px] sm:text-[32px] font-bold text-[#101828] tracking-tight leading-tight"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Perbandingan Nilai dengan Alumni
          </h1>
          <p
            className="text-sm sm:text-[15px] text-[#667085] mt-1"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Lihat kemiripan capaian akademimu dengan alumni sebagai referensi mengenai peluang studi lanjut.
          </p>
        </div>

        {/* Tab Nav */}
        <div className="mb-7">
          <SiswaTabNav
            activeTab="Perbandingan Nilai"
            onTabChange={(tab) => {
              if (tab === "Perbandingan Nilai") return;
              router.push("/siswa");
            }}
          />
        </div>

        {/* Konten */}
        <PerbandinganNilai />
      </main>
    </div>
  );
}

