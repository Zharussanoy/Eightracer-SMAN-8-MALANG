"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { EvaluasiNilaiRowItem } from "./types";

interface SiswaB1PerbaikanNilaiModalProps {
  isOpen: boolean;
  rowItem: EvaluasiNilaiRowItem | null;
  onClose: () => void;
  onSubmit: (id: string, newScore: string) => void;
}

export const SiswaB1PerbaikanNilaiModal: React.FC<
  SiswaB1PerbaikanNilaiModalProps
> = ({ isOpen, rowItem, onClose, onSubmit }) => {
  const [inputVal, setInputVal] = useState<string>("");

  useEffect(() => {
    if (rowItem) {
      // Default to target physical score if needed or row's target physical
      setInputVal(rowItem.nilaiRaporSebenarnya || rowItem.nilaiInputSiswa);
    }
  }, [rowItem]);

  if (!isOpen || !rowItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSubmit(rowItem.id, inputVal.trim());
  };

  const noteMessage =
    rowItem.catatanKoreksi ||
    `Terdapat perbedaan data (fisik rapor: ${rowItem.nilaiRaporSebenarnya}, sistem: ${rowItem.nilaiInputSiswa}). Wali Kelas akan memverifikasi`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className="w-full max-w-[560px] bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-4 flex items-start justify-between border-b border-slate-100/60">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373] block">
              PERBAIKAN NILAI RAPOR
            </span>
            <h2 className="text-sm sm:text-base font-semibold text-[#1E1E1E]">
              Mata Pelajaran: {rowItem.mataPelajaran} (Semester {rowItem.semester})
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-[#737373] hover:text-[#1E1E1E] transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-7 space-y-6">
          {/* Note Card Box */}
          <div className="rounded-[16px] border border-[#E9E9E9] bg-white p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-[#1E1E1E]">
                Catatan Perbaikan dari Wali Kelas:
              </h3>
              <p className="text-xs text-[#4C4452] leading-relaxed">
                {noteMessage}
              </p>
            </div>

            {/* Score Comparison Boxes */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              {/* Nilai Sebelumnya */}
              <div className="rounded-[14px] border border-[#E9E9E9] bg-white p-4 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#737373] block mb-2">
                  Nilai Sebelumnya
                </span>
                <span className="text-2xl sm:text-[28px] font-bold text-[#BA1A1A] leading-none">
                  {rowItem.nilaiInputSiswa}
                </span>
              </div>

              {/* Nilai Sesuai Rapor */}
              <div
                onClick={() => setInputVal(rowItem.nilaiRaporSebenarnya)}
                className="rounded-[14px] border border-[#E9E9E9] bg-white p-4 flex flex-col justify-between hover:border-[#5F089E]/50 transition-colors cursor-pointer group"
                title="Klik untuk memilih nilai ini"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-[#737373]">
                    Nilai Sesuai Rapor
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-[#5F089E] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-2xl sm:text-[28px] font-bold text-[#5F089E] leading-none">
                  {rowItem.nilaiRaporSebenarnya}
                </span>
              </div>
            </div>
          </div>

          {/* Form Input: Nilai Baru Sesuai Rapor Fisik */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1E1E1E]">
                Nilai Baru Sesuai Rapor Fisik <span className="text-[#BA1A1A]">*</span>
              </label>
              <span className="text-[11px] text-[#737373]">Skala 0-100</span>
            </div>

            <div className="relative rounded-[16px] border border-[#CFC2D4] bg-white px-5 py-3 flex items-center justify-between focus-within:border-[#5F089E] focus-within:ring-2 focus-within:ring-[#5F089E]/15 transition-all">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Contoh: 90.0"
                className="w-full text-2xl sm:text-[28px] font-bold text-[#5F089E] outline-none bg-transparent"
              />
              <span className="text-sm font-semibold text-[#737373] ml-2 shrink-0">
                /100
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#4C4452] transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 h-10 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              Simpan &amp; Ajukan Nilai
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

