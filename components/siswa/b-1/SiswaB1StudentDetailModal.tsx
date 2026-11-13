"use client";

import React from "react";
import {
  X,
  ExternalLink,
  Mail,
  GraduationCap,
  Award,
  Sparkles,
  BookOpen,
  School,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { DirektoriSiswaItem } from "./types";

interface SiswaB1StudentDetailModalProps {
  student: DirektoriSiswaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SiswaB1StudentDetailModal: React.FC<SiswaB1StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-[#410070] via-[#5F089E] to-[#7B1FA2] p-6 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 hover:rotate-90 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 text-white text-xl font-extrabold flex items-center justify-center shrink-0 shadow-md">
              {student.avatarInitials}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {student.nama}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[11px] font-semibold text-white">
                  {student.kelas}
                </span>
              </div>
              <p className="text-xs text-purple-100 font-medium">
                {student.peranEkskul}
              </p>
              <p className="text-[11px] text-purple-200">
                NISN: <span className="font-mono">{student.nisn}</span> &bull; {student.fase} &bull; Angkatan {student.tahunMasuk}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] text-[#1E1E1E]">
          {/* Section: Peminatan & Target PTN */}
          <div className="rounded-2xl border border-purple-100 bg-[#FAF5FF] p-4.5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5F089E] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Peminatan &amp; Target Studi Lanjut</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  RUMPUN PEMINATAN
                </span>
                <p className="font-bold text-slate-900">{student.rumpunPeminatan}</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  TARGET PROGRAM STUDI
                </span>
                <p className="font-bold text-[#5F089E]">{student.targetStudi}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-2xs flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 className="w-4 h-4 text-[#5F089E] shrink-0" />
                <span className="font-medium">Rekomendasi PTN Impian:</span>
              </div>
              <span className="font-bold text-slate-900 text-right">
                {student.rekomendasiPtn}
              </span>
            </div>
          </div>

          {/* Section: Mata Pelajaran Pilihan yang Diambil */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-[#5F089E]" />
              <span>Paket Rekomendasi Mapel Pilihan (Fase F)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(student.mapelPilihanList || [
                "Matematika Tingkat Lanjut",
                "Fisika Terapan",
                "Informatika",
                "Bahasa Inggris Lanjut",
              ]).map((mapel, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5 text-xs"
                >
                  <span className="w-5 h-5 rounded-md bg-[#5F089E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800">{mapel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Biografi */}
          {student.biografi && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Biografi &amp; Motivasi Belajar
              </span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                &ldquo;{student.biografi}&rdquo;
              </p>
            </div>
          )}

          {/* Section: Prestasi & Penghargaan */}
          {student.prestasi && student.prestasi.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Prestasi &amp; Rekam Jejak Unggulan</span>
              </div>
              <div className="space-y-2">
                {student.prestasi.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-amber-200/70 bg-amber-50/40 text-xs flex items-center gap-2.5 text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Keahlian & Minat */}
          {student.keahlian && student.keahlian.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Keahlian &amp; Minat Akademik
              </span>
              <div className="flex flex-wrap gap-2">
                {student.keahlian.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-[#5F089E] border border-purple-200/70"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section: Kontak Akademik Siswa */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Email Resmi:</span>
              <a
                href={`mailto:${student.email}`}
                className="font-medium text-[#5F089E] hover:underline"
              >
                {student.email}
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <School className="w-3.5 h-3.5" />
              <span>SMA Negeri 8 Malang &bull; SMARIHASTA</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

