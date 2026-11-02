"use client";

import { KARAKTERISTIK_SUMMARY } from "./mockDataSiswa";
import { Check, User } from "lucide-react";

export default function KarakteristikProfileCard() {
  const data = KARAKTERISTIK_SUMMARY;

  return (
    <div className="flex flex-col gap-6" style={{ fontFamily: "Inter, Montserrat, sans-serif" }}>

      <div className="rounded-[14px] bg-[#F0E6F5] p-5 sm:p-6 shadow-2xs">

        <div className="flex items-start gap-4">

          <div className="w-[76px] h-[90px] rounded-[10px] border-2 border-dashed border-[#DECFE8] bg-white flex flex-col items-center justify-center text-slate-300 shrink-0 shadow-2xs">
            <User className="w-6 h-6 text-slate-300 stroke-[1.5]" />
            <span className="text-[9px] text-slate-400 mt-1 font-medium tracking-wide">
              Foto Siswa
            </span>
          </div>


          <div className="flex flex-col justify-center min-w-0 flex-1 pt-1">
            <h2 className="font-bold text-[15px] text-[#14141C] leading-tight truncate">
              {data.nama}
            </h2>
            <p className="font-normal text-[10px] text-[#6E6B78] mt-1">
              NISN: {data.nisn}
            </p>
            <p className="font-medium text-[11px] text-[#6E6B78] mt-0.5">
              {data.kelas}
            </p>


            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[7px] bg-[#E0F5E8] text-[#148557] font-semibold text-[10px]">
                <Check className="w-3 h-3 stroke-[3]" />
                {data.status}
              </span>
            </div>
          </div>
        </div>


        <div className="w-full border-t border-[#DECFE8] my-4" />


        <div>
          <h3 className="font-semibold text-xs text-[#14141C]">
            Ringkasan profil
          </h3>
          <p className="font-normal text-[11px] text-[#6E6B78] mt-1">
            {data.ringkasan}
          </p>
          <p className="font-normal text-[10px] text-[#6E6B78] mt-1">
            Pembaruan terakhir: {data.pembaruanTerakhir}
          </p>
        </div>
      </div>


      <div className="rounded-[14px] bg-[#F0E6F5] p-5 shadow-2xs">
        <h3 className="font-semibold text-sm text-[#14141C]">
          Akumulasi Nilai Rapor
        </h3>


        <div className="flex items-baseline justify-between mt-2.5">
          <span className="font-bold text-[32px] text-[#6305B0] leading-none">
            {data.akumulasiNilaiRapor.toString().replace(".", ",")}%
          </span>
          <span className="font-semibold text-xs text-[#6305B0]">
            {data.peringkat}
          </span>
        </div>


        <div className="w-full h-2.5 bg-white rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[#6305B0] rounded-full transition-all duration-700"
            style={{ width: `${data.akumulasiNilaiRapor}%` }}
          />
        </div>
      </div>
    </div>
  );
}
