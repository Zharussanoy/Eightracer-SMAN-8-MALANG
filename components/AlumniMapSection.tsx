"use client";

import dynamic from "next/dynamic";
import { GraduationCap, Building2, TrendingUp } from "lucide-react";

// Dynamic import with SSR: false
const AlumniMapChart = dynamic(() => import("./AlumniMapChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] sm:h-[620px] rounded-2xl sm:rounded-3xl bg-[#EFE6F5]/40 border-2 border-dashed border-[#5F089E]/30 flex flex-col items-center justify-center text-slate-500 gap-3 p-6">
      <div className="w-10 h-10 border-3 border-[#5F089E] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs sm:text-sm font-semibold text-slate-600">
        Memuat peta sebaran alumni PTN...
      </span>
    </div>
  ),
});

export default function AlumniMapSection() {
  return (
    <section id="sebaran-alumni" className="py-20 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-12 text-left">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#5F089E] uppercase block mb-2">
            SEBARAN ALUMNI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Peta Sebaran Alumni Interaktif
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Eksplorasi persebaran kelulusan siswa SMAN 8 Malang di Perguruan Tinggi Negeri (PTN) favorit di seluruh Indonesia secara interaktif.
          </p>
        </div>

        {/* 1. STATISTIK SERAPAN PTN (3 GRID LAYOUT DI ATAS PETA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {/* Grid 1: Total Alumni di PTN */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#EFE6F5]/50 border-2 border-[#5F089E]/25 hover:border-[#5F089E]/60 transition-all duration-300 shadow-xs hover:shadow-md flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white border border-[#5F089E]/20 flex items-center justify-center text-[#5F089E] shadow-xs shrink-0">
              <GraduationCap className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Total Alumni di PTN
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#5F089E] tracking-tight block">
                1.250+ <span className="text-sm font-bold text-slate-600">Alumni</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                Terdata aktif di PTN seluruh Indonesia
              </span>
            </div>
          </div>

          {/* Grid 2: Top 3 PTN Tujuan */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#EFE6F5]/50 border-2 border-[#5F089E]/25 hover:border-[#5F089E]/60 transition-all duration-300 shadow-xs hover:shadow-md flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white border border-[#5F089E]/20 flex items-center justify-center text-[#5F089E] shadow-xs shrink-0">
              <Building2 className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Top 3 PTN Tujuan
              </span>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-[#5F089E]/25 text-xs font-black text-[#5F089E] shadow-2xs">
                  UB
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-[#5F089E]/25 text-xs font-black text-[#5F089E] shadow-2xs">
                  UM
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-[#5F089E]/25 text-xs font-black text-[#5F089E] shadow-2xs">
                  ITS
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Destinasi kampus pilihan terbanyak
              </span>
            </div>
          </div>

          {/* Grid 3: Jalur Penerimaan */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#EFE6F5]/50 border-2 border-[#5F089E]/25 hover:border-[#5F089E]/60 transition-all duration-300 shadow-xs hover:shadow-md flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white border border-[#5F089E]/20 flex items-center justify-center text-[#5F089E] shadow-xs shrink-0">
              <TrendingUp className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Jalur Penerimaan
              </span>
              <div className="inline-flex flex-wrap items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#5F089E]/25 text-xs font-bold shadow-2xs">
                <span className="text-[#5F089E]">SNBP 40%</span>
                <span className="text-purple-300">|</span>
                <span className="text-[#5F089E]">SNBT 45%</span>
                <span className="text-purple-300">|</span>
                <span className="text-slate-700">Mandiri 15%</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block mt-1">
                Akurasi seleksi nasional & mandiri
              </span>
            </div>
          </div>
        </div>

        {/* PETA INTERAKTIF FULL-WIDTH */}
        <div className="w-full">
          <AlumniMapChart />
        </div>
      </div>
    </section>
  );
}
