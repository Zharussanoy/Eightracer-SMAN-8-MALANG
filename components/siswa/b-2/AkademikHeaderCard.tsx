"use client";

import { useState } from "react";
import { AKADEMIK_SUMMARY_CARDS } from "./mockDataSiswa";
import { Download, ChevronDown, CheckCircle2, X, User } from "lucide-react";

export default function AkademikHeaderCard() {
  const [selectedTahun, setSelectedTahun] = useState("2026 / 2027");
  const [showExportToast, setShowExportToast] = useState(false);

  const handleExportPdf = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3500);
  };

  return (
    <div className="flex flex-col gap-6" style={{ fontFamily: "Inter, Montserrat, sans-serif" }}>

      {showExportToast && (
        <div className="p-3.5 px-4 rounded-xl bg-[#E0F5E8] border border-[#B7E7CB] text-[#148557] flex items-center justify-between gap-3 shadow-xs transition-all animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold">
              Simulasi Ekspor: Rapor Akademik Tegar Saputra ({selectedTahun}) berhasil diunduh.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowExportToast(false)}
            className="text-current hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}


      <div className="rounded-[14px] bg-[#F0E6F5] p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">

        <div className="flex items-center gap-4">

          <div className="w-[72px] h-[84px] rounded-[10px] border-2 border-dashed border-[#DECFE8] bg-white flex flex-col items-center justify-center text-slate-300 shrink-0 shadow-2xs">
            <User className="w-6 h-6 text-slate-300 stroke-[1.5]" />
            <span className="text-[9px] text-slate-400 mt-1 font-medium tracking-wide">
              Foto Siswa
            </span>
          </div>


          <div>
            <h2 className="font-bold text-base text-[#14141C] leading-snug">
              Tegar Saputra
            </h2>
            <p className="font-normal text-[11px] text-[#6E6B78] mt-0.5">
              NISN 0061284731 <span className="mx-1">•</span> Kelas XII-A <span className="mx-1">•</span> SMA Negeri 8 Malang
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[7px] bg-[#E0F5E8] text-[#148557] font-semibold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#148557]"></span>
                Aktif
              </span>
            </div>
          </div>
        </div>


        <div className="flex flex-col sm:flex-row sm:items-end gap-3 self-start lg:self-center">
          
          <div>
            <label
              htmlFor="select-tahun-ajaran"
              className="block font-semibold text-[9px] uppercase tracking-wider text-[#6E6B78] mb-1"
            >
              TAHUN AJARAN
            </label>
            <div className="relative">
              <select
                id="select-tahun-ajaran"
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="w-44 h-[38px] pl-3 pr-8 rounded-[8px] bg-white border-[1.2px] border-[#DECFE8] text-[11px] font-medium text-[#14141C] appearance-none outline-none cursor-pointer focus:border-[#6305B0]"
              >
                <option value="2026 / 2027">2026 / 2027</option>
                <option value="2025 / 2026">2025 / 2026</option>
                <option value="2024 / 2025">2024 / 2025</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#6E6B78]">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>


          <button
            type="button"
            onClick={handleExportPdf}
            className="h-[38px] px-4 rounded-[8px] bg-[#6305B0] hover:bg-[#520492] text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {AKADEMIK_SUMMARY_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-[12px] bg-[#F0E6F5] p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs min-h-[112px]"
          >
            <span className="font-semibold text-[9px] uppercase tracking-wider text-[#6E6B78]">
              {card.label}
            </span>
            <span className="font-bold text-[27px] text-[#6305B0] leading-none my-1">
              {card.value}
            </span>
            <span className="font-normal text-[10px] text-[#6E6B78]">
              {card.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
