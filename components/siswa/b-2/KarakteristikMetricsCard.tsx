"use client";

import { METRIK_KARAKTERISTIK } from "./mockDataSiswa";

export default function KarakteristikMetricsCard() {
  const metrics = METRIK_KARAKTERISTIK;

  return (
    <div
      className="rounded-[14px] bg-[#F0E6F5] p-6 sm:p-7 shadow-2xs"
      style={{ fontFamily: "Inter, Montserrat, sans-serif" }}
    >

      <h2
        className="font-bold text-xl text-[#000000] mb-6"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        Karakteristik
      </h2>


      <div className="flex flex-col">
        {metrics.map((item, index) => (
          <div
            key={item.kategori}
            className={`flex items-center gap-4 sm:gap-6 py-4 ${
              index !== metrics.length - 1 ? "border-b border-[#DECFE8]" : ""
            }`}
          >
 
            <span className="font-medium text-xs sm:text-[13px] text-[#14141C] w-36 sm:w-48 shrink-0 leading-normal">
              {item.kategori}
            </span>


            <div className="flex-1 h-3.5 bg-white rounded-full overflow-hidden shadow-2xs">
              <div
                className="h-full bg-[#3863FA] rounded-full transition-all duration-700"
                style={{ width: `${item.persentase}%` }}
              />
            </div>


            <span className="font-bold text-xs sm:text-[13px] text-[#6305B0] w-12 text-right shrink-0">
              {item.persentase}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
