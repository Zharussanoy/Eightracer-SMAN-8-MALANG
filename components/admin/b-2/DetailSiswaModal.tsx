"use client";

import {
  CheckCircle2,
  Compass,
  Download,
  Printer,
  Sparkles,
  User,
  X
} from "lucide-react";
import { useState } from "react";
import { SiswaDataItem } from "./mockDataAdminB2";

interface DetailSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: SiswaDataItem | null;
}

export default function DetailSiswaModal({
  isOpen,
  onClose,
  siswa,
}: DetailSiswaModalProps) {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;


  const namaSiswa = "Tegar Putra";
  const nisnSiswa = siswa?.nisn || "0054891201";
  const kelasSiswa = siswa?.kelas || "XII MIPA 1";

  const handlePrintPdf = () => {
    setDownloadSuccess("Lembar Evaluasi Siswa (PDF) berhasil dipersiapkan untuk dicetak!");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadCsv = () => {
    setDownloadSuccess("Rincian Skor Siswa (CSV) berhasil diunduh!");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-[520px] max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-xl shadow-purple-500/10 border border-purple-100 overflow-hidden text-[#1F2937] my-auto">

        {/* ─── BANNER HEADER UNGU SESUAI BINGKAI PEMETAAN POTENSI KOMPREHENSIF ─── */}
        <div
          className="px-6 pt-5 pb-5 relative text-white shrink-0 overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #1A0A33 0%, #2E125C 50%, #441A87 100%)",
          }}
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/5 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-purple-500/10 blur-lg pointer-events-none" />

          {/* Top Bar: Tag, Status Eligible & Close Button */}
          <div className="flex items-center justify-between mb-3.5 relative z-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase text-purple-200 shadow-xs border border-white/10">
              <Sparkles className="w-3 h-3 text-purple-300" />
              <span>RINCIAN AUDIT NILAI FORMULA</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white text-emerald-600 text-[10.5px] font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ELIGIBLE KUOTA
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile Identity: Bingkai Foto Kosong + Identitas */}
          <div className="flex items-center gap-4 relative z-10">
            {/* Bingkai Foto Kosong Modern */}
            <div className="w-[52px] h-[52px] rounded-2xl border-2 border-white/60 bg-white/10 flex flex-col items-center justify-center text-white/90 shrink-0 shadow-sm backdrop-blur-xs">
              <User className="w-5 h-5 stroke-[1.75]" />
              <span className="text-[8px] font-medium tracking-tight mt-0.5 opacity-90">
                Foto
              </span>
            </div>

            {/* Nama & Detail Siswa */}
            <div className="flex-1 min-w-0">
              <h2 className="text-[19px] font-bold text-white leading-tight tracking-tight truncate drop-shadow-xs">
                {namaSiswa}
              </h2>
              <p className="text-[12px] text-purple-200 font-medium mt-0.5">
                NISN: {nisnSiswa} &nbsp;•&nbsp; {kelasSiswa}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold text-purple-200 bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-xs border border-white/10">
                  Peringkat #1 dari 420
                </span>
                <span className="text-[11px] font-medium text-purple-300">
                  Akreditasi A
                </span>
              </div>
            </div>
          </div>
        </div>


        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)]">

          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
          )}


          <div className="bg-gradient-to-br from-[#FAF7FD] to-[#F3E8FF]/60 rounded-2xl p-4 border border-[#E9D5FF] flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#441A87] mb-1">
                SKOR AKHIR KCA
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[30px] font-extrabold text-[#2E125C] leading-none tracking-tight">
                  95.32
                </span>
                <span className="text-[13px] font-medium text-[#6B7280]">
                  / 100.00
                </span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1.5 flex items-center gap-1">
                <span className="text-[13px] font-bold">↑</span> Indeks Komposit Sempurna
              </p>
            </div>

            {/* Circular Progress Donut 95% */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r="27"
                  stroke="#E9D5FF"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="27"
                  stroke="#441A87"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 27}
                  strokeDashoffset={2 * Math.PI * 27 * (1 - 0.95)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[13px] font-extrabold text-[#2E125C]">
                95%
              </span>
            </div>
          </div>


          <div className="bg-white rounded-2xl p-4 border border-[#F3E8FF] shadow-xs">
            <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-3.5">
              BREAKDOWN 5 KOMPONEN PENILAIAN KCA
            </h3>

            <div className="space-y-3.5">

              {/* Komponen 1: Rata Rapor Sem 1-5 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF7FD] text-[#441A87] border border-[#E9D5FF] font-bold text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="font-semibold text-[#1F2937]">
                      Rata Rapor Sem 1-5
                    </span>
                  </div>
                  <span className="font-bold text-[#1F2937]">
                    47.40 <span className="font-normal text-[#6B7280]">/ 50 pt</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F3E8FF] overflow-hidden">
                  <div style={{ width: "94.8%" }} className="h-full rounded-full bg-[#441A87]" />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7280]">Nilai: <strong className="text-[#374151]">94.80</strong> (Bobot 50%)</span>
                  <span className="font-semibold text-emerald-600">Valid Dapodik</span>
                </div>
              </div>

              {/* Komponen 2: TKA & Minat RIASEC KCA */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF7FD] text-[#441A87] border border-[#E9D5FF] font-bold text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="font-semibold text-[#1F2937]">
                      TKA &amp; Minat RIASEC KCA
                    </span>
                  </div>
                  <span className="font-bold text-[#1F2937]">
                    14.48 <span className="font-normal text-[#6B7280]">/ 15 pt</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F3E8FF] overflow-hidden">
                  <div style={{ width: "96.5%" }} className="h-full rounded-full bg-[#581C87]" />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7280]">Nilai: <strong className="text-[#374151]">96.50</strong> (Bobot 15%)</span>
                  <span className="font-semibold text-[#441A87]">Investigative &amp; Social</span>
                </div>
              </div>


              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="font-semibold text-[#1F2937]">
                      Prestasi &amp; Portofolio
                    </span>
                  </div>
                  <span className="font-bold text-[#1F2937]">
                    19.00 <span className="font-normal text-[#6B7280]">/ 20 pt</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#FEF3C7] overflow-hidden">
                  <div style={{ width: "95%" }} className="h-full rounded-full bg-[#F59E0B]" />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7280]">Nilai: <strong className="text-[#374151]">95.00</strong> (Bobot 20%)</span>
                  <span className="font-semibold text-[#B45309]">Juara 1 OSN Biologi Nas</span>
                </div>
              </div>


              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-[#DBEAFE] text-[#2563EB] font-bold text-[10px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span className="font-semibold text-[#1F2937]">
                      Rekam Jejak Alumni di PTN
                    </span>
                  </div>
                  <span className="font-bold text-[#1F2937]">
                    9.20 <span className="font-normal text-[#6B7280]">/ 10 pt</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#DBEAFE] overflow-hidden">
                  <div style={{ width: "92%" }} className="h-full rounded-full bg-[#3B82F6]" />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7280]">Nilai: <strong className="text-[#374151]">92.00</strong> (Bobot 10%)</span>
                  <span className="font-semibold text-[#2563EB]">FK UI &amp; ITB Track</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-[#DCFCE7] text-[#059669] font-bold text-[10px] flex items-center justify-center shrink-0">
                      5
                    </span>
                    <span className="font-semibold text-[#1F2937]">
                      Karakter &amp; Kedisiplinan P5
                    </span>
                  </div>
                  <span className="font-bold text-[#1F2937]">
                    4.70 <span className="font-normal text-[#6B7280]">/ 5 pt</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#DCFCE7] overflow-hidden">
                  <div style={{ width: "94%" }} className="h-full rounded-full bg-[#10B981]" />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7280]">Nilai: <strong className="text-[#374151]">94.00</strong> (Bobot 5%)</span>
                  <span className="font-semibold text-emerald-600">Predikat Sangat Baik</span>
                </div>
              </div>
            </div>
          </div>


          <div className="bg-[#FAF7FD] rounded-2xl p-4 border border-[#E9D5FF] space-y-2.5">
            <div className="flex items-center gap-1.5 text-[#441A87] font-bold text-[11px] uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>REKOMENDASI PRODI SISTEM KCA</span>
            </div>

            <div className="space-y-2">
              <div className="bg-white rounded-xl p-3 border border-purple-100 shadow-2xs hover:border-[#DDD6FE] transition-colors">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FD] text-[#441A87] text-[10px] font-bold border border-[#E9D5FF]">
                    Pil 1
                  </span>
                  <span className="font-bold text-[13.5px] text-[#1F2937]">
                    Kedokteran
                  </span>
                </div>
                <p className="text-[11.5px] text-[#6B7280] pl-0.5">
                  Universitas Indonesia (UI)
                </p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-purple-100 shadow-2xs hover:border-[#DDD6FE] transition-colors">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FD] text-[#441A87] text-[10px] font-bold border border-[#E9D5FF]">
                    Pil 2
                  </span>
                  <span className="font-bold text-[13.5px] text-[#1F2937]">
                    Farmasi Klinis
                  </span>
                </div>
                <p className="text-[11.5px] text-[#6B7280] pl-0.5">
                  Institut Teknologi Bandung (ITB)
                </p>
              </div>
            </div>
          </div>


          {/* ─── FOOTER TOMBOL AKSI ─── */}
          <div className="space-y-2.5 pt-1">
            {/* Tombol Cetak PDF - Selaras dengan gradien PEMETAAN POTENSI KOMPREHENSIF */}
            <button
              type="button"
              onClick={handlePrintPdf}
              className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-[13px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] hover:opacity-95"
              style={{
                background: "linear-gradient(135deg, #2E125C 0%, #441A87 100%)",
              }}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lembar Hasil Evaluasi Siswa (PDF)</span>
            </button>

            {/* Tombol Unduh CSV - Lavender Soft Elegan */}
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7FD] hover:bg-[#F3E8FF] text-[#2E125C] font-semibold text-[13px] border border-[#E9D5FF] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Download className="w-4 h-4 text-[#441A87]" />
              <span>Unduh Rincian Skor (CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
