"use client";

import { Bot, Sparkles, ArrowRight } from "lucide-react";
import { AdminTab } from "./types";

interface AdminAiStrategiSectionProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export default function AdminAiStrategiSection({
  onNavigateTab,
}: AdminAiStrategiSectionProps) {
  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-purple-200/80 shadow-sm text-center max-w-3xl mx-auto space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 text-[#5F089E] flex items-center justify-center mx-auto border border-purple-100 shadow-inner">
          <Bot className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Navigasi Fitur AI Strategi Jurusan</span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Simulator &amp; Rekomendasi Program Studi Berbasis AI
        </h3>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Modul AI Strategi Jurusan Eightracer menganalisis nilai rapor, skor UTBK,
          dan sertifikat prestasi alumni terdahulu untuk memetakan peluang kelulusan
          siswa di PTN impian secara presisi.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab("Direktori Alumni")}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            &larr; Kembali ke Direktori Alumni
          </button>
          <button
            type="button"
            onClick={() => alert("Fitur AI Strategi Jurusan sedang disiapkan!")}
            className="px-5 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4D0680] text-white text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <span>Buka Pratinjau Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
