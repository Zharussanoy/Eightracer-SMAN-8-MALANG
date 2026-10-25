"use client";

import {
  GraduationCap,
  Building2,
  TrendingUp,
  Users,
  ClipboardList,
} from "lucide-react";
import { AdminTab } from "./types";

interface AdminSummarySectionProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export default function AdminSummarySection({
  onNavigateTab,
}: AdminSummarySectionProps) {
  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Total Alumni Terdata
              </span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                1.500
              </span>
              <span className="text-xs text-slate-400 font-medium block mt-1">
                Siswa
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#5F089E] flex items-center justify-center border border-purple-100">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#5F089E] h-full w-[85%] rounded-full" />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Diterima di PTN
              </span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                1.350
              </span>
              <span className="text-xs text-blue-600 font-semibold block mt-1">
                90% dari Total Kelulusan
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-600 h-full w-[90%] rounded-full" />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Jalur SNBP & SNBT
              </span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                900
              </span>
              <span className="text-xs text-emerald-600 font-semibold block mt-1">
                60% Seleksi Nasional
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[60%] rounded-full" />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Jalur Mandiri & Swasta
              </span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                98
              </span>
              <span className="text-xs text-amber-600 font-semibold block mt-1">
                Kemitraan Mandiri
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-amber-500 h-full w-[25%] rounded-full" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-[#5F089E] shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Butuh memeriksa rincian data per siswa?
            </span>
            <span className="text-xs text-slate-600">
              Buka tab <strong>Direktori Alumni</strong> untuk melihat
              tabel kelulusan, sertifikat prestasi, status KIP-K, atau filter prodi.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab("Direktori Alumni")}
          className="px-4 py-2 rounded-xl bg-[#5F089E] text-white text-xs font-bold hover:bg-[#4D0680] transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          Buka Direktori Alumni &rarr;
        </button>
      </div>
    </section>
  );
}
