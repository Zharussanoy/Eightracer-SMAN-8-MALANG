"use client";

import { SiswaProfile, OverallSkor } from "./mockDataSiswa";
import { User } from "lucide-react";
import Image from "next/image";

interface SiswaProfileCardProps {
  profile: SiswaProfile;
  skor: OverallSkor;
}

const SKOR_ITEMS = [
  { key: "karakter" as const, label: "Karakter", color: "#5F089E" },
  { key: "nilai" as const, label: "Nilai", color: "#226CE0" },
  { key: "prestasi" as const, label: "Prestasi", color: "#5F089E" },
  { key: "kehadiran" as const, label: "Kehadiran", color: "#148557" },
];

export default function SiswaProfileCard({
  profile,
  skor,
}: SiswaProfileCardProps) {
  return (
    <div className="flex flex-col gap-4">

      <div
        className="rounded-[20px] border-2 border-[#5F089E] bg-[#EFE6F5] p-6 flex flex-col items-center gap-3"
        style={{ minHeight: 378 }}
      >

        {profile.fotoUrl ? (
          <div className="w-[105px] h-[155px] relative overflow-hidden rounded-[2px] shadow-sm shrink-0 bg-red-600 mt-2">
            <Image
              src={profile.fotoUrl}
              alt={profile.nama}
              width={105}
              height={155}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        ) : (
          <div className="w-[100px] h-[142px] rounded-[10px] border-2 border-dashed border-[#DECFE8] bg-white flex flex-col items-center justify-center text-slate-300 shrink-0 shadow-2xs mt-2">
            <User className="w-9 h-9 text-slate-300 stroke-[1.5]" />
            <span className="text-[10px] text-slate-400 mt-1.5 font-medium tracking-wide">
              Foto Siswa
            </span>
          </div>
        )}


        <p
          className="font-bold text-xl text-black leading-tight text-center"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {profile.nama}
        </p>


        <p
          className="text-xl text-black text-center"
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
        >
          {profile.nisn}
        </p>


        <div className="flex gap-3 flex-wrap justify-center">
          <span
            className="px-3 py-1 rounded-[7px] bg-white border border-[#DECFE8] text-[#6305B0] text-[11px] font-semibold"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {profile.kelas}
          </span>
          <span
            className={`px-3 py-1 rounded-[7px] text-[11px] font-semibold ${
              profile.status === "Aktif"
                ? "bg-[#E0F5E8] text-[#148557]"
                : "bg-red-50 text-red-600"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            ● {profile.status}
          </span>
        </div>
      </div>


      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-sm font-bold text-slate-700"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Overall Skor
          </span>
          <span
            className="text-lg font-black text-[#5F089E]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {skor.total}%
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {SKOR_ITEMS.map((item) => {
            const val = skor[item.key];
            return (
              <div key={item.key}>
                <div className="flex justify-between mb-1.5">
                  <span
                    className="text-xs text-slate-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-xs font-bold text-slate-800"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {val}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${val}%`, background: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
