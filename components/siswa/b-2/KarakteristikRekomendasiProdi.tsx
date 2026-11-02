"use client";

import { REKOMENDASI_PRODI_KARAKTERISTIK } from "./mockDataSiswa";

export default function KarakteristikRekomendasiProdi() {
  const prodis = REKOMENDASI_PRODI_KARAKTERISTIK;

  return (
    <div
      className="rounded-[14px] bg-[#F0E6F5] p-5 sm:p-6 shadow-2xs"
      style={{ fontFamily: "Inter, Montserrat, sans-serif" }}
    >
  
      <h3 className="font-bold text-[17px] text-[#14141C] leading-snug">
        Rekomendasi Program Studi
      </h3>
      <p className="font-normal text-[11px] text-[#6E6B78] mt-0.5 mb-4">
        Alternatif berdasarkan kesesuaian profil siswa
      </p>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {prodis.map((item) => (
          <div
            key={item.nama}
            className="rounded-[10px] bg-white border-[1.5px] border-[#DECFE8] p-3.5 flex flex-col justify-between shadow-2xs hover:border-[#6305B0]/50 transition-colors"
          >

            <p
              className="font-semibold text-[11px] text-[#14141C] leading-snug truncate"
              title={item.nama}
            >
              {item.nama}
            </p>

            <p className="font-bold text-xl text-[#6305B0] my-2">
              {item.persentase}%
            </p>


            <div className="w-full h-[7px] bg-[#F0E6F5] rounded-[4px] overflow-hidden">
              <div
                className="h-full bg-[#6305B0] rounded-[4px] transition-all duration-700"
                style={{ width: `${item.persentase}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
