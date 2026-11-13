"use client";

import React from "react";
import {
  X,
  Download,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { SISWA_B1_PROFILE } from "./mockData";
import { StudentB1Account } from "./types";

interface SiswaB1PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  student?: StudentB1Account;
}

export const SiswaB1PdfPreviewModal: React.FC<SiswaB1PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  student,
}) => {
  if (!isOpen) return null;

  const { suratRekomendasi } = SISWA_B1_PROFILE;
  const namaSiswa = student?.nama || SISWA_B1_PROFILE.nama;
  const nisnSiswa = student?.nisn || SISWA_B1_PROFILE.nisn;
  const kelasSiswa = student?.kelas || SISWA_B1_PROFILE.kelas;

  // Paket mapel persis seperti di gambar user & Admin B1
  const paketMataPelajaran = [
    "Matematika Tingkat Lanjut",
    "Fisika Lanjut",
    "Informatika & Data Science",
    "Kimia Terapan",
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans text-slate-900 animate-in fade-in duration-150"
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs font-bold transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all duration-200 hover:rotate-90 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body - 100% Presisi Match 4 Gambar Surat Admin & Siswa */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-6">
            {/* Kop Surat Resmi (Sesuai Gambar 1) */}
            <div className="text-center space-y-0.5 pb-2">
              <p className="text-xs sm:text-[13px] font-bold text-slate-900 uppercase tracking-wider">
                PEMERINTAH PROVINSI JAWA TIMUR
              </p>
              <p className="text-xs sm:text-[13px] font-bold text-slate-900 uppercase tracking-wider">
                DINAS PENDIDIKAN
              </p>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
                SEKOLAH MENENGAH ATAS NEGERI 8 MALANG
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Jl. Veteran 37 Telp. (0341) 551096 FAX (0341) 575795 MALANG
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500">
                website: www.sman8malang.sch.id &bull; E-mail: sman8malang@gmail.com
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500">
                NPSN: 20533640 Kode Pos : 65145
              </p>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider pt-0.5">
                KOTA MALANG
              </p>
            </div>

            {/* Divider Line */}
            <hr className="border-slate-200" />

            {/* Judul & Nomor Surat (Sesuai Gambar 1) */}
            <div className="text-center space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide underline underline-offset-4">
                SURAT REKOMENDASI PEMINATAN
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Nomor: {suratRekomendasi.nomorSurat}
              </p>
            </div>

            {/* Paragraf Pembuka (Sesuai Gambar 1) */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-left">
              {suratRekomendasi.pembuka}
            </p>

            {/* Student Metadata Box (Sesuai Gambar 2) */}
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-900 bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-slate-100 font-sans">
              <div className="flex items-center">
                <span className="w-28 sm:w-32 text-slate-500 shrink-0">
                  Nama Lengkap
                </span>
                <span className="text-slate-400 mr-2 shrink-0">:</span>
                <span className="font-semibold text-slate-900">
                  {namaSiswa}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 sm:w-32 text-slate-500 shrink-0">
                  NISN
                </span>
                <span className="text-slate-400 mr-2 shrink-0">:</span>
                <span className="font-medium text-slate-900">
                  {nisnSiswa}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 sm:w-32 text-slate-500 shrink-0">
                  Kelas
                </span>
                <span className="text-slate-400 mr-2 shrink-0">:</span>
                <span className="font-semibold text-slate-900">
                  {kelasSiswa}
                </span>
              </div>
            </div>

            {/* Paket Mata Pelajaran Pilihan (Sesuai Gambar 2) */}
            <div className="space-y-2 pt-1">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                Paket Mata Pelajaran Pilihan:
              </span>

              {/* Chips Mata Pelajaran Ungu Muda Sesuai Gambar 2 */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {paketMataPelajaran.map((mapel, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-[#F6EEFE] text-[#5F089E] text-xs sm:text-sm font-semibold"
                  >
                    {mapel}
                  </span>
                ))}
              </div>
            </div>

            {/* Keterangan dan Penegasan Box (Sesuai Gambar 2 & 3) */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4">
              <h4 className="text-center font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-900">
                KETERANGAN DAN PENEGASAN
              </h4>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed text-left">
                {suratRekomendasi.keterangan.map((paragraf, idx) => (
                  <p key={idx}>{paragraf}</p>
                ))}
              </div>
            </div>

            {/* Area Tanda Tangan (Sesuai Gambar 3 & 4) */}
            <div className="pt-6 flex justify-end text-xs sm:text-sm text-slate-900">
              <div className="text-left w-64 sm:w-72 space-y-1">
                <p className="text-slate-800">Malang, 12 Mei 2026</p>
                <p className="font-bold text-slate-900 uppercase leading-snug">
                  KOORDINATOR BIMBINGAN<br />KONSELING
                </p>
                <div className="h-16 flex items-center">
                  <span className="text-xs italic text-slate-400 font-serif">
                    (Telah Ditandatangani Secara Elektronik)
                  </span>
                </div>
                <p className="font-bold text-slate-900 underline underline-offset-4">
                  Dra. Endang Sulastri
                </p>
                <p className="text-xs text-slate-500 font-normal">
                  NIP: 196908151994122003
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
