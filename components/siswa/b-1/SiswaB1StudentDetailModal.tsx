"use client";

import React from "react";
import { X, Mail, Sparkles, School, Award, CheckCircle2, Quote } from "lucide-react";
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header: Konsisten dengan pop-up rincian nilai */}
        <div className="bg-[#5F089E] p-4 text-white flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 text-white font-bold text-sm flex items-center justify-center shrink-0">
              {student.avatarInitials}
            </div>
            <div>
              <h4 className="text-base font-bold leading-snug text-white">
                {student.nama}
              </h4>
              <p className="text-xs text-purple-200 mt-0.5 font-medium">
                {student.kelas}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable, ringkas, dan proporsional */}
        <div className="p-4 sm:p-5 space-y-3.5 text-slate-800 overflow-y-auto max-h-[calc(90vh-130px)]">
          {/* Info Kelas & Email */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-[#5F089E]" />
                <span>Kelas</span>
              </span>
              <span className="font-extrabold text-[#5F089E]">{student.kelas}</span>
            </div>

            <div className="pt-2 border-t border-purple-200/50 flex items-center justify-between text-xs">
              <span className="font-bold text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#5F089E]" />
                <span>Email Akademik</span>
              </span>
              <a
                href={`mailto:${student.email}`}
                className="text-xs font-semibold text-slate-700 hover:text-[#5F089E] hover:underline"
              >
                {student.email}
              </a>
            </div>
          </div>

          {/* Keahlian & Minat Siswa */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5F089E]" />
              <span>Keahlian &amp; Minat Siswa</span>
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {student.keahlian && student.keahlian.length > 0 ? (
                student.keahlian.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-purple-900 border border-purple-200/70 shadow-2xs"
                  >
                    {item}
                  </span>
                ))
              ) : student.targetStudi && student.targetStudi !== "-" ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-purple-900 border border-purple-200/70 shadow-2xs">
                  {student.targetStudi}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">Belum ada data keahlian/minat</span>
              )}
            </div>
          </div>

          {/* Biografi & Motivasi */}
          {student.biografi && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-[#5F089E]" />
                <span>Biografi &amp; Motivasi Belajar</span>
              </span>
              <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-100">
                &ldquo;{student.biografi}&rdquo;
              </p>
            </div>
          )}

          {/* Prestasi Unggulan */}
          {student.prestasi && student.prestasi.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Prestasi &amp; Rekam Jejak Unggulan</span>
              </span>
              <div className="space-y-1.5 pt-0.5">
                {student.prestasi.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-white border border-amber-200/50 text-xs flex items-center gap-2 text-slate-800 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
