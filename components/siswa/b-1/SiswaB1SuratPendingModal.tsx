"use client";

import React from "react";
import { X, Hourglass, ArrowRight } from "lucide-react";

interface SiswaB1SuratPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToProfil?: () => void;
}

export const SiswaB1SuratPendingModal: React.FC<SiswaB1SuratPendingModalProps> = ({
  isOpen,
  onClose,
  onGoToProfil,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans text-slate-900 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-200/80 p-7 sm:p-9 text-center space-y-6 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup Silang di Kanan Atas */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all duration-200 hover:rotate-90 hover:scale-110 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Badge Status Kuning/Amber (Persis di Gambar) */}
        <div className="flex justify-center pt-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#FEF3C7] text-[#854D0E] shadow-2xs tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#B45309] shrink-0 animate-pulse" />
            STATUS: MENUNGGU VALIDASI &amp; PENGUNCIAN
          </span>
        </div>

        {/* 2. Ikon Jam Pasir Ungu di dalam Rounded Square (Persis di Gambar) */}
        <div className="flex justify-center">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#F3E8FF] text-[#5F089E] flex items-center justify-center shadow-xs">
            <Hourglass className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
          </div>
        </div>

        {/* 3. Judul Utama (Persis di Gambar) */}
        <div className="space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold text-[#1E1E1E] leading-snug px-2">
            Rekomendasi Peminatan Sedang Ditinjau oleh Guru BK
          </h3>

          {/* 4. Deskripsi Penjelasan Lengkap (Persis di Gambar) */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Paket rekomendasi mata pelajaran pilihan Fase F Anda saat ini sedang dalam
            proses evaluasi oleh Tim Guru Bimbingan dan Konseling SMAN 8 Malang.
            Kartu rekomendasi mata pelajaran dan Surat Keputusan (SK) resmi akan
            otomatis ditampilkan di halaman ini setelah Guru BK menyelesaikan validasi
            dan mengunci keputusan penetapan peminatan.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            Mengerti
          </button>
          {onGoToProfil && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToProfil();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-95 cursor-pointer group"
            >
              <span>Lihat Portofolio</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

