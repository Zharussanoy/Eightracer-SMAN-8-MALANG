"use client";

import React from "react";
import {
  Lock,
  Hourglass,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { StudentB1Account } from "./types";
import { StudentAccessRules } from "./studentAccessPolicy";

interface SiswaB1EvaluasiLockedStateProps {
  student: StudentB1Account;
  accessRules: StudentAccessRules;
  onGoToRekomendasi: () => void;
  onGoToProfil: () => void;
}

export const SiswaB1EvaluasiLockedState: React.FC<SiswaB1EvaluasiLockedStateProps> = ({
  student,
  accessRules,
  onGoToRekomendasi,
  onGoToProfil,
}) => {
  const isPendingValidation = accessRules.evaluasiStatus === "BELUM_DIVALIDASI";

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      {/* Banner Utama Pembatasan Akses */}
      <div className="rounded-3xl border-2 border-amber-200/90 bg-amber-50/50 p-8 sm:p-12 shadow-xs text-center max-w-2xl mx-auto space-y-6">
        {isPendingValidation ? (
          <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] text-[#5F089E] flex items-center justify-center mx-auto shadow-xs">
            <Hourglass className="w-8 h-8 stroke-[2.2]" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
        )}

        <div className="space-y-2">
          {isPendingValidation ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#854D0E] border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse" />
              STATUS: MENUNGGU VALIDASI &amp; PENGUNCIAN
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
              Akses Terkunci &bull; Kelas X (Fase E)
            </span>
          )}

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isPendingValidation
              ? "Evaluasi Nilai Belum Dapat Diakses"
              : "Evaluasi Nilai Mapel Pilihan Belum Tersedia"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {accessRules.keteranganAksesEvaluasi}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onGoToRekomendasi}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <BookOpen className="w-4 h-4" />
            <span>Buka Rekomendasi Mapel Pilihan</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={onGoToProfil}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 text-xs sm:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-95 cursor-pointer"
          >
            <span>Lihat Profil Siswa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
