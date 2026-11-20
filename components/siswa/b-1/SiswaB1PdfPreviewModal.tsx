"use client";

import React from "react";
import {
  X,
  Download,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { MapelPilihanDetail, StudentB1Account } from "./types";

export interface SuratRekomendasiInfo {
  nomorSk?: string;
  tanggalTerbit?: string;
  dikirimOleh?: string;
  nipGuruBk?: string;
  pembuka?: string;
  keterangan?: string[];
  targetProdiUtama?: string;
  targetKampusUtama?: string;
  profilRiasec?: string;
  kecerdasanDominan?: string;
}

const DEFAULT_PEMBUKA =
  "Berdasarkan hasil analisis komprehensif profil bakat, minat, evaluasi capaian rapor semester, dan tes kecerdasan majemuk peserta didik, SMA Negeri 8 Malang menerbitkan Surat Rekomendasi Peminatan Akademik bagi:";

const DEFAULT_KETERANGAN = [
  "Surat rekomendasi ini disusun oleh Guru Bimbingan dan Konseling berdasarkan hasil identifikasi potensi, minat, bakat, hasil belajar, serta informasi pendukung lainnya yang relevan. Rekomendasi ini bertujuan sebagai bahan pertimbangan dan referensi bagi murid dalam menentukan pilihan mata pelajaran sesuai dengan rencana studi lanjut dan pengembangan kariernya.",
  "Keputusan akhir mengenai pemilihan mata pelajaran tetap berada pada murid, dengan mempertimbangkan hasil refleksi diri, informasi yang tersedia, serta diskusi dan persetujuan orang tua/wali. Orang tua/wali diharapkan mendampingi murid dalam proses pengambilan keputusan tersebut.",
  "Surat rekomendasi ini tidak bersifat mengikat atau menentukan secara mutlak pilihan murid. Layanan Bimbingan dan Konseling berperan memfasilitasi murid agar mampu mengambil keputusan pendidikan secara mandiri, bertanggung jawab, dan sesuai dengan potensi serta rencana masa depannya.",
];

interface SiswaB1PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  student?: StudentB1Account;
  suratInfo?: SuratRekomendasiInfo;
  recommendedSubjects?: MapelPilihanDetail[];
}

export const SiswaB1PdfPreviewModal: React.FC<SiswaB1PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  student,
  suratInfo,
  recommendedSubjects = [],
}) => {
  if (!isOpen) return null;

  const namaSiswa = student?.nama || "-";
  const nisnSiswa = student?.nisn || "-";
  const kelasSiswa = student?.kelas || "-";
  const nomorSurat = suratInfo?.nomorSk || "-";
  const tanggalSurat = suratInfo?.tanggalTerbit || "-";
  const pembuka = suratInfo?.pembuka || DEFAULT_PEMBUKA;
  const keteranganList =
    suratInfo?.keterangan && suratInfo.keterangan.length > 0
      ? suratInfo.keterangan
      : DEFAULT_KETERANGAN;

  const namaPejabatRaw = suratInfo?.dikirimOleh || "Dra. Endang Sulastri";
  const namaPejabat = namaPejabatRaw.replace(/\s*\([^)]*\)\s*$/, "").trim() || "Dra. Endang Sulastri";
  const nipPejabat = suratInfo?.nipGuruBk || "196805121994032008";

  const paketMataPelajaran =
    recommendedSubjects.length > 0
      ? recommendedSubjects.slice(0, 4).map((s) => s.nama)
      : [];

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
                Nomor: {nomorSurat} &bull; Tervalidasi Digital
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

        {/* Document Body - Sama Persis dengan Pratinjau Surat di Role Admin */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-6">
            {/* Kop Surat Resmi */}
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
                NPSN : 20533640 Kode Pos : 65145
              </p>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                KOTA MALANG
              </p>
            </div>

            <hr className="border-slate-200" />

            {/* Judul & Nomor Surat */}
            <div className="text-center space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide underline underline-offset-4">
                SURAT REKOMENDASI PEMINATAN
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Nomor: {nomorSurat}
              </p>
            </div>

            {/* Paragraf Pembuka */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
              {pembuka}
            </p>

            {/* Student Metadata Box */}
            <div className="text-xs sm:text-sm text-slate-900 bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-slate-100 font-sans">
              <div className="grid grid-cols-[110px_16px_1fr] sm:grid-cols-[130px_16px_1fr] items-center gap-y-1.5">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="text-slate-700 font-semibold">:</span>
                <span className="font-semibold text-slate-900">{namaSiswa}</span>

                <span className="text-slate-500">NISN</span>
                <span className="text-slate-700 font-semibold">:</span>
                <span className="font-medium text-slate-900">{nisnSiswa}</span>

                <span className="text-slate-500">Kelas</span>
                <span className="text-slate-700 font-semibold">:</span>
                <span className="font-semibold text-slate-900">{kelasSiswa}</span>
              </div>
            </div>

            {/* Paket Mata Pelajaran Pilihan */}
            <div className="space-y-2 pt-1">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                Paket Mata Pelajaran Pilihan:
              </span>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {paketMataPelajaran.map((mapel, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-[#F6EEFE] text-[#5F089E] text-xs sm:text-sm font-semibold border border-purple-100"
                  >
                    {mapel}
                  </span>
                ))}
              </div>
            </div>

            {/* Keterangan dan Penegasan Box */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4">
              <h4 className="text-center font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-900">
                KETERANGAN DAN PENEGASAN
              </h4>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                {keteranganList.map((paragraf, idx) => (
                  <p key={idx}>{paragraf}</p>
                ))}
              </div>
            </div>

            {/* Area Tanda Tangan */}
            <div className="pt-6 flex justify-end text-xs sm:text-sm text-slate-900">
              <div className="text-left w-64 sm:w-72 space-y-1">
                <p className="text-slate-800">Malang, {tanggalSurat}</p>
                <p className="font-bold text-slate-900 uppercase leading-snug">
                  KOORDINATOR BIMBINGAN<br />KONSELING
                </p>
                <div className="h-16 flex items-center">
                  <span className="text-xs italic text-slate-400">
                    (Telah Ditandatangani Secara Elektronik)
                  </span>
                </div>
                <p className="font-bold text-slate-900 underline underline-offset-4">
                  {namaPejabat}
                </p>
                <p className="text-xs text-slate-500 font-normal">
                  NIP: {nipPejabat}
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
