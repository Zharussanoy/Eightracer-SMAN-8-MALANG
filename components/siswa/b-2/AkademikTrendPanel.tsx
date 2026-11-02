"use client";

import { AKADEMIK_TREND_DATA } from "./mockDataSiswa";

export default function AkademikTrendPanel() {
  const trends = AKADEMIK_TREND_DATA;

  return (
    <div
      className="rounded-[14px] bg-[#F0E6F5] p-5 sm:p-6 shadow-2xs flex flex-col justify-between"
      style={{ fontFamily: "Inter, Montserrat, sans-serif" }}
    >
      <div>

        <h3 className="font-bold text-base text-[#14141C] leading-tight">
          Perkembangan Akademik
        </h3>
        <p className="font-normal text-[10px] text-[#6E6B78] mt-0.5 mb-6">
          Rata-rata nilai tiap semester
        </p>


        <div className="flex items-end justify-around gap-3 pt-2 pb-2">
          {trends.map((item) => (
            <div key={item.semester} className="flex flex-col items-center gap-2">

              <span className="font-bold text-[13px] text-[#6305B0]">
                {item.nilai}
              </span>


              <div className="w-[72px] sm:w-[76px] h-[195px] sm:h-[205px] rounded-lg bg-white overflow-hidden flex flex-col justify-end p-0 shadow-2xs">
                <div
                  className="w-full bg-[#3863FA] rounded-lg transition-all duration-700"
                  style={{ height: `${item.nilai}%` }}
                />
              </div>


              <span className="font-medium text-[9px] text-[#14141C] mt-1 text-center">
                {item.semester}
              </span>
            </div>
          ))}
        </div>
      </div>


      <div className="pt-3 mt-3 border-t border-[#DECFE8]">
        <h4 className="font-semibold text-[11px] text-[#14141C]">
          Ringkasan perkembangan
        </h4>
        <p className="font-normal text-[10px] text-[#6E6B78] mt-0.5">
          Nilai rata-rata menunjukkan tren meningkat.
        </p>
      </div>
    </div>
  );
}
