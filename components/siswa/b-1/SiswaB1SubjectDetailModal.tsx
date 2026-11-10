"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { MapelPilihanDetail } from "./types";

interface SiswaB1SubjectDetailModalProps {
  subject: MapelPilihanDetail | null;
  onClose: () => void;
}

export const SiswaB1SubjectDetailModal: React.FC<
  SiswaB1SubjectDetailModalProps
> = ({ subject, onClose }) => {
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(
    null
  );
  const [showEvaluationNote, setShowEvaluationNote] = useState<boolean>(false);
  const [progressWidth, setProgressWidth] = useState<number>(0);

  useEffect(() => {
    if (subject) {
      setSelectedTopicIndex(null);
      setShowEvaluationNote(false);
      // Animate progress bar smoothly when drawer opens
      const timer = setTimeout(() => {
        setProgressWidth(subject.tingkatKesesuaian);
      }, 80);
      return () => clearTimeout(timer);
    } else {
      setProgressWidth(0);
    }
  }, [subject]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (subject) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [subject, onClose]);

  if (!subject) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#1F1A22]/50 backdrop-blur-[4px] flex justify-end font-sans animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Right Slide-Over Panel (Width 646px matching Figma spec) */}
      <aside
        className="relative w-full max-w-[646px] h-full bg-white shadow-2xl overflow-y-auto flex flex-col justify-between px-6 sm:px-9 py-10 sm:py-12 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-8">
          {/* Header Subject Title */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide text-black">
              {subject.nama}
            </h2>
          </div>

          {/* Box 1: ESTIMASI TINGKAT PENGUASAAN MATERI */}
          <div className="w-full rounded-[20px] bg-[#F5EFF7] border-2 border-[#E9E9E9] p-5 sm:p-6 space-y-5">
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.275px] text-[#4F378B] block">
                ESTIMASI TINGKAT PENGUASAAN MATERI
              </span>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-black">
                    {subject.labelPenguasaan}
                  </span>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full h-3 bg-[#ECEEF1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5F089E] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Inner White Box: Catatan Penjelasan */}
            <div className="w-full rounded-[20px] bg-white border-2 border-[#E9E9E9] p-5 space-y-3">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4F378B] block">
                Catatan Penjelasan:
              </span>
              <p className="text-xs text-[#191C1E] leading-relaxed">
                {subject.catatanPenjelasan}
              </p>
            </div>
          </div>

          {/* Fokus Pembelajaran & 4 Interactive Topic Pills */}
          <div className="space-y-6 pt-1">
            <p className="text-xs text-black leading-relaxed px-1">
              {subject.deskripsiFokus}
            </p>

            {/* 2x2 Grid Topic Pills matching Figma coordinates */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-[420px] mx-auto pt-1">
              {subject.topikUtama.map((topik, index) => {
                const isSelected = selectedTopicIndex === index;
                return (
                  <button
                    key={topik.nama}
                    type="button"
                    onClick={() =>
                      setSelectedTopicIndex(isSelected ? null : index)
                    }
                    className={`min-h-[68px] px-4 py-3 rounded-[20px] border-2 flex items-center justify-center text-center text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#5F089E] bg-[#FAF5FF] text-[#5F089E] font-bold shadow-xs scale-[1.02]"
                        : "border-[#E9E9E9] bg-white text-black font-normal hover:border-[#5F089E]/50 hover:bg-purple-50/30"
                    }`}
                  >
                    <span>{topik.nama}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Topic Explanation Preview when a pill is clicked */}
            {selectedTopicIndex !== null && (
              <div className="max-w-[460px] mx-auto p-3.5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs text-[#410070] flex items-start gap-2.5 animate-in fade-in duration-150">
                <Sparkles className="w-4 h-4 text-[#5F089E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">
                    Fokus Topik: {subject.topikUtama[selectedTopicIndex].nama}
                  </span>
                  <span className="text-slate-700 leading-relaxed">
                    {subject.topikUtama[selectedTopicIndex].deskripsi}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section: STRATEGI BELAJAR MANDIRI */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.275px] text-[#31111D]">
              STRATEGI BELAJAR MANDIRI
            </h3>

            {/* Card 1: Rekomendasi Alokasi Jam Mandiri */}
            <div className="w-full rounded-[20px] border-2 border-[#E9E9E9] bg-white p-5 sm:p-6 space-y-2.5 hover:border-purple-200 transition-colors">
              <h4 className="text-xs font-bold text-black">
                Rekomendasi Alokasi Jam Mandiri:
              </h4>
              <p className="text-xs text-black leading-relaxed">
                {subject.rekomendasiAlokasiJam}
              </p>
            </div>

            {/* Card 2: Fokus Penguatan Materi */}
            <div className="w-full rounded-[20px] border-2 border-[#E9E9E9] bg-white p-5 sm:p-6 space-y-2.5 hover:border-purple-200 transition-colors">
              <h4 className="text-xs font-bold text-black">
                Fokus Penguatan Materi:
              </h4>
              <p className="text-xs text-black leading-relaxed">
                {subject.fokusPenguatanMateri}
              </p>
            </div>
          </div>

          {/* Section: CATATAN EVALUASI AKADEMIK */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => setShowEvaluationNote(!showEvaluationNote)}
              className="text-[11px] font-bold uppercase tracking-[0.275px] text-[#31111D] hover:text-[#5F089E] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>CATATAN EVALUASI AKADEMIK</span>
            </button>

            {showEvaluationNote && (
              <div className="w-full rounded-[20px] border-2 border-[#E9E9E9] bg-[#FAF5FF] p-5 text-xs text-slate-800 leading-relaxed flex items-start gap-2.5 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-[#5F089E] shrink-0 mt-0.5" />
                <p>{subject.catatanEvaluasiAkademik}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right Action Button: Tutup */}
        <div className="pt-10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#6750A4] hover:bg-[#563f91] active:bg-[#483280] text-white text-sm font-medium transition-colors shadow-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </aside>
    </div>
  );
};
