"use client";

import React from "react";
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { SISWA_B1_PROFILE, RECOMMENDED_SUBJECTS } from "./mockData";

interface SiswaB1PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export const SiswaB1PdfPreviewModal: React.FC<SiswaB1PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  onDownload,
}) => {
  if (!isOpen) return null;

  const { suratRekomendasi } = SISWA_B1_PROFILE;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F1DBFF] text-[#410070] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E1E1E] leading-tight">
                Pratinjau Surat Rekomendasi Peminatan
              </h2>
              <p className="text-xs text-[#737373]">
                Nomor: {suratRekomendasi.nomorSurat} &bull; Tervalidasi Digital
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-6">
            {/* Kop Surat Resmi */}
            <div className="text-center space-y-0.5 pb-4 border-b-2 border-slate-900">
              <p className="text-xs sm:text-[13px] font-bold text-slate-900 uppercase tracking-wider">
                PEMERINTAH PROVINSI JAWA TIMUR
              </p>
              <p className="text-xs sm:text-[13px] font-bold text-slate-900 uppercase tracking-wider">
                DINAS PENDIDIKAN
              </p>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
                SEKOLAH MENENGAH ATAS NEGERI 8 MALANG
              </p>
              <p className="text-[11px] text-slate-500">
                Jl. Veteran No. 37 Telp. (0341) 551096 FAX (0341) 575795 MALANG
              </p>
              <p className="text-[11px] text-slate-500">
                Website: www.sman8malang.sch.id &bull; E-mail: sman8malang@gmail.com
              </p>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider pt-0.5">
                KOTA MALANG &bull; KODE POS 65145
              </p>
            </div>

            {/* Judul & Nomor Surat */}
            <div className="text-center space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide underline underline-offset-4">
                SURAT REKOMENDASI MATA PELAJARAN PEMINATAN
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Nomor: {suratRekomendasi.nomorSurat}
              </p>
            </div>

            {/* Paragraf Pembuka */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
              {suratRekomendasi.pembuka}
            </p>

            {/* Identitas Siswa */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-900 bg-[#FAF5FF] p-4 rounded-xl border border-[#E9D5FF]">
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-4 sm:col-span-3 text-slate-500">
                  Nama Lengkap
                </span>
                <span className="col-span-8 sm:col-span-9 font-bold text-[#1E1E1E]">
                  : {SISWA_B1_PROFILE.nama}
                </span>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-4 sm:col-span-3 text-slate-500">
                  NISN
                </span>
                <span className="col-span-8 sm:col-span-9 font-semibold">
                  : {SISWA_B1_PROFILE.nisn}
                </span>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-4 sm:col-span-3 text-slate-500">
                  Kelas Saat Ini
                </span>
                <span className="col-span-8 sm:col-span-9 font-semibold">
                  : {SISWA_B1_PROFILE.kelas}
                </span>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-4 sm:col-span-3 text-slate-500">
                  Rencana Studi PTN
                </span>
                <span className="col-span-8 sm:col-span-9 font-semibold text-[#5F089E]">
                  : {SISWA_B1_PROFILE.targetProdiUtama}
                </span>
              </div>
            </div>

            {/* Daftar 4 Mata Pelajaran Pilihan */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5F089E]" />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Paket Mata Pelajaran Pilihan Fase F yang Direkomendasikan:
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RECOMMENDED_SUBJECTS.map((subj) => (
                  <div
                    key={subj.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F089E] block">
                        {subj.urutan}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {subj.nama}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {subj.tingkatKesesuaian}% Sesuai
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keterangan & Penegasan */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
              <h4 className="text-center font-bold text-xs uppercase tracking-wider text-slate-900">
                KETERANGAN DAN PENEGASAN
              </h4>
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                {suratRekomendasi.keterangan.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            {/* Tanda Tangan */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 text-xs sm:text-sm text-slate-900">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-[11px] max-w-xs">
                <p className="font-bold flex items-center gap-1.5 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dokumen Sah &amp; Terkunci
                </p>
                <p className="text-emerald-700/90 leading-relaxed">
                  Telah diverifikasi oleh Sistem Pemetaan Akademik Eightracer SMAN 8 Malang.
                </p>
              </div>

              <div className="text-left w-64 space-y-1">
                <p className="text-xs text-slate-600">
                  Diterbitkan tanggal: {suratRekomendasi.tanggalTerbit}
                </p>
                <p className="font-semibold">Koordinator Bimbingan Konseling</p>
                <div className="h-14 flex items-center">
                  <span className="text-[11px] italic text-[#5F089E] font-medium bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                    Ditandatangani Secara Elektronik
                  </span>
                </div>
                <p className="font-bold underline">Dra. Endang Sulastri</p>
                <p className="text-xs text-slate-500">
                  NIP: {suratRekomendasi.nipPengirim}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};

