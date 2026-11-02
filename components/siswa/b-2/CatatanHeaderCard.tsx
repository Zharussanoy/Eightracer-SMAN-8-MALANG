"use client";

import React, { useState } from "react";
import { User } from "lucide-react";

interface CatatanHeaderCardProps {
  totalCatatan?: number;
  totalTindakLanjut?: number;
  totalSelesai?: number;
  totalPrivat?: number;
  onTambahCatatan?: () => void;
}

export default function CatatanHeaderCard({
  totalCatatan = 12,
  totalTindakLanjut = 2,
  totalSelesai = 8,
  totalPrivat = 2,
  onTambahCatatan,
}: CatatanHeaderCardProps) {
  const [showModalTambah, setShowModalTambah] = useState(false);

  const handleOpenTambah = () => {
    if (onTambahCatatan) {
      onTambahCatatan();
    } else {
      setShowModalTambah(true);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5" style={{ fontFamily: "Inter, Montserrat, sans-serif" }}>

      <div className="rounded-[14px] bg-[#F0E6F5] p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div className="flex items-center gap-3.5">

          <div className="w-[72px] h-[84px] rounded-[10px] border-2 border-dashed border-[#DECFE8] bg-white flex flex-col items-center justify-center text-slate-300 shrink-0 shadow-2xs">
            <User className="w-6 h-6 text-slate-300 stroke-[1.5]" />
            <span className="text-[9px] text-slate-400 mt-1 font-medium tracking-wide">
              Foto Siswa
            </span>
          </div>


          <div>
            <h2 className="font-bold text-[16px] text-[#14141C] leading-snug">
              Tegar Saputra
            </h2>
            <p className="font-normal text-[11px] text-[#6E6B78] mt-0.5">
              NISN 0061284731 <span className="mx-1">•</span> Kelas XII-A <span className="mx-1">•</span> SMA Negeri 8 Malang
            </p>
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[7px] bg-[#E0F5E8] text-[#148557] font-semibold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#148557]"></span>
                Aktif
              </span>
            </div>
          </div>
        </div>


        <div className="flex items-center gap-6 sm:gap-8 self-start md:self-center">
          <div>
            <p className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
              TOTAL CATATAN
            </p>
            <p className="text-[17px] sm:text-[19px] font-bold text-[#14141C] mt-0.5">
              {totalCatatan} catatan
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenTambah}
            className="h-[36px] px-4 rounded-[8px] bg-[#5F089E] hover:bg-[#520492] text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Tambah Catatan</span>
          </button>
        </div>
      </div>


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">

        <div className="rounded-[14px] bg-[#F0E6F5] p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs min-h-[92px]">
          <p className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            TOTAL CATATAN
          </p>
          <div className="my-1">
            <span className="text-[24px] sm:text-[26px] font-bold text-[#5F089E] leading-none">
              {totalCatatan}
            </span>
          </div>
          <p className="text-[10px] text-[#6E6B78]">
            Semua dokumentasi
          </p>
        </div>


        <div className="rounded-[14px] bg-[#F0E6F5] p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs min-h-[92px]">
          <p className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            TINDAK LANJUT
          </p>
          <div className="my-1">
            <span className="text-[24px] sm:text-[26px] font-bold text-[#14141C] leading-none">
              {totalTindakLanjut}
            </span>
          </div>
          <p className="text-[10px] text-[#6E6B78]">
            Perlu ditangani
          </p>
        </div>


        <div className="rounded-[14px] bg-[#F0E6F5] p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs min-h-[92px]">
          <p className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            SELESAI
          </p>
          <div className="my-1">
            <span className="text-[24px] sm:text-[26px] font-bold text-[#14141C] leading-none">
              {totalSelesai}
            </span>
          </div>
          <p className="text-[10px] text-[#6E6B78]">
            Sudah ditangani
          </p>
        </div>


        <div className="rounded-[14px] bg-[#F0E6F5] p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs min-h-[92px]">
          <p className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            CATATAN PRIVAT
          </p>
          <div className="my-1">
            <span className="text-[24px] sm:text-[26px] font-bold text-[#14141C] leading-none">
              {totalPrivat}
            </span>
          </div>
          <p className="text-[10px] text-[#6E6B78]">
            Akses terbatas
          </p>
        </div>
      </div>

      {showModalTambah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-[14px] shadow-xl border border-[#DECFE8] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F0E6F5] border-b border-[#DECFE8] flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#14141C]">
                Tambah Catatan Perkembangan Siswa
              </h3>
              <button
                type="button"
                onClick={() => setShowModalTambah(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-white/60 transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="p-2.5 bg-purple-50 text-[11px] text-[#5F089E] rounded-md border border-[#DECFE8]">
                Fitur tambah catatan baru disimulasikan pada frontend. Anda juga dapat langsung mengedit catatan yang sudah ada melalui tombol <strong>Edit Catatan</strong> di panel detail sebelah kanan.
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-[#DECFE8] flex justify-end">
              <button
                type="button"
                onClick={() => setShowModalTambah(false)}
                className="px-4 py-1.5 bg-[#5F089E] text-white rounded-[7px] text-[10px] font-semibold hover:bg-[#520492] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
