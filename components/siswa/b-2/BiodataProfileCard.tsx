"use client";

import { BiodataSiswa } from "./mockDataSiswa";
import { Edit3, User } from "lucide-react";
import Image from "next/image";

interface BiodataProfileCardProps {
  biodata: BiodataSiswa;
  isEditing: boolean;
  onToggleEdit: () => void;
}

export default function BiodataProfileCard({
  biodata,
  isEditing,
  onToggleEdit,
}: BiodataProfileCardProps) {
  return (
    <div
      className="h-full rounded-[24px] border-2 border-[#5F089E] bg-[#FAF7FD] p-5 sm:p-6 flex flex-col items-center justify-between shadow-xs"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="w-full flex flex-col items-center">

        {biodata.fotoUrl ? (
          <div className="w-[96px] h-[140px] relative overflow-hidden rounded-[2px] shadow-sm shrink-0 bg-red-600">
            <Image
              src={biodata.fotoUrl}
              alt={biodata.nama}
              width={96}
              height={140}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        ) : (
          <div className="w-[100px] h-[142px] rounded-[10px] border-2 border-dashed border-[#DECFE8] bg-white flex flex-col items-center justify-center text-slate-300 shrink-0 shadow-2xs">
            <User className="w-9 h-9 text-slate-300 stroke-[1.5]" />
            <span className="text-[10px] text-slate-400 mt-1.5 font-medium tracking-wide">
              Foto Siswa
            </span>
          </div>
        )}


        <h2 className="font-bold text-base text-[#101828] mt-2.5 text-center leading-tight">
          {biodata.nama}
        </h2>
        <p className="font-normal text-xs text-[#344054] mt-0.5 text-center">
          {biodata.nisn}
        </p>


        <div className="mt-2 flex items-center gap-1.5 p-1 rounded-lg bg-[#EFE6F5]">
          <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#DECFE8] text-[#5F089E] text-[11px] font-bold">
            {biodata.kelas === "A" ? "XII-A" : biodata.kelas}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium text-[#12B76A] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]"></span>
            {biodata.status}
          </span>
        </div>

        <div className="w-full border-t border-[#EAECF0] my-3" />


        <div className="w-full flex flex-col items-center text-center">
          <h3 className="font-bold text-xs text-[#101828] mb-1.5">
            Kontak siswa
          </h3>


          <p className="text-[10px] text-[#98A2B3] uppercase tracking-wide">
            Email
          </p>
          <p className="text-xs font-medium text-[#344054] mt-0.5 mb-2 break-all">
            {biodata.email}
          </p>


          <p className="text-[10px] text-[#98A2B3] uppercase tracking-wide">
            Nomor telepon
          </p>
          <p className="text-xs font-medium text-[#344054] mt-0.5 mb-2">
            {biodata.telepon}
          </p>


          <p className="text-[10px] text-[#98A2B3] uppercase tracking-wide">
            Alamat
          </p>
          <p className="text-xs font-medium text-[#344054] mt-0.5">
            {biodata.alamat}
          </p>
        </div>


        <div className="w-full border-t border-[#EAECF0] my-3" />
      </div>


      <button
        type="button"
        id="btn-edit-biodata-profile"
        onClick={onToggleEdit}
        className="w-44 py-2.5 px-4 rounded-xl bg-[#5F089E] hover:bg-[#4E0682] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 mt-1"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>{isEditing ? "Tutup Mode Edit" : "Edit Biodata"}</span>
      </button>
    </div>
  );
}
