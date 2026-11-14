"use client";

import Image from "next/image";
import { ArrowRight, Bot } from "lucide-react";
import { AdminTab } from "./types";

interface AdminHeroProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export default function AdminHero({ onNavigateTab }: AdminHeroProps) {
  return (
    <section className="mb-6">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#4A047D] via-[#5F089E] to-[#7B1FA2] text-white p-6 sm:p-8 lg:p-10 shadow-lg shadow-purple-950/15">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Pusat Manajemen Kelulusan &amp; Direktori Alumni
            </h1>

            <p className="text-sm sm:text-base text-purple-100/90 max-w-2xl font-normal leading-relaxed">
              Pantau sebaran kampus, analisis statistik SNBP/SNBT, dan telusuri
              profil riwayat prestasi alumni SMARIHASTA secara akurat dalam satu
              dashboard terpadu.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab("Direktori Alumni")}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-[#5F089E] text-xs font-bold hover:bg-purple-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Buka Direktori Alumni</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab("AI Strategi Jurusan")}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-xs"
              >
                <Bot className="w-3.5 h-3.5 text-amber-300" />
                <span>Konsultasi AI Strategi</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
              {/* Gambar bintang.svg di sebelah kiri student.svg */}
              <div className="relative w-20 sm:w-28 lg:w-36 aspect-[170/244] -mr-5 sm:-mr-8 lg:-mr-10 translate-x-4 z-10 shrink-0 pointer-events-none">
                <Image
                  src="/images/bintang.svg"
                  alt="Dekorasi Bintang"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Aset Utama: student.svg */}
              <div className="relative w-64 sm:w-72 md:w-80 lg:w-96 aspect-[397/258] z-20 shrink-0">
                <Image
                  src="/images/student.svg"
                  alt="Hero Banner Siswa Smarihasta"
                  fill
                  className="object-contain filter drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}
