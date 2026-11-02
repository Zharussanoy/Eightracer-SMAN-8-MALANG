"use client";

import { useState, useMemo } from "react";
import { AKADEMIK_MAPEL_DATA } from "./mockDataSiswa";
import { Search } from "lucide-react";

export default function AkademikTablePanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = useMemo(() => {
    return AKADEMIK_MAPEL_DATA.filter((item) =>
      item.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div
      className="rounded-[14px] bg-[#F0E6F5] p-5 sm:p-6 shadow-2xs flex flex-col justify-between"
      style={{ fontFamily: "Inter, Montserrat, sans-serif" }}
    >
      <div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-base text-[#14141C] leading-tight">
              Tabel Nilai Akademik
            </h3>
            <p className="font-normal text-[10px] text-[#6E6B78] mt-0.5">
              Nilai per mata pelajaran <span className="mx-0.5">·</span> Semester ganjil
            </p>
          </div>


          <div className="relative w-full sm:w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#6E6B78]">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari mata pelajaran..."
              className="w-full h-[34px] pl-8 pr-3 rounded-[8px] bg-white border-[1.2px] border-[#DECFE8] text-[10px] text-[#14141C] placeholder-[#6E6B78] outline-none focus:border-[#6305B0]"
            />
          </div>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-1.5 min-w-[580px]">

            <thead>
              <tr className="bg-[#E6D4F0] rounded-[7px] text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider">
                <th className="py-2.5 px-3 rounded-l-[7px] font-semibold">MATA PELAJARAN</th>
                <th className="py-2.5 px-3 font-semibold text-center">SEM 1</th>
                <th className="py-2.5 px-3 font-semibold text-center">SEM 2</th>
                <th className="py-2.5 px-3 font-semibold text-center">SEM 3</th>
                <th className="py-2.5 px-3 font-semibold text-center">RATA-RATA</th>
                <th className="py-2.5 px-3 rounded-r-[7px] font-semibold text-center">PREDIKAT</th>
              </tr>
            </thead>


            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    className="bg-white rounded-[5px] text-[10px] text-[#14141C] shadow-2xs hover:bg-white/90 transition-colors"
                  >
                    <td className="py-2.5 px-3 rounded-l-[5px] font-medium">
                      {row.mataPelajaran}
                    </td>
                    <td className="py-2.5 px-3 text-center font-normal">
                      {row.sem1}
                    </td>
                    <td className="py-2.5 px-3 text-center font-normal">
                      {row.sem2}
                    </td>
                    <td className="py-2.5 px-3 text-center font-normal">
                      {row.sem3}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-[#6305B0]">
                      {row.rataRata}
                    </td>
                    <td className="py-2.5 px-3 rounded-r-[5px] text-center">
                      <span
                        className={`inline-block w-8 py-0.5 rounded-[6px] font-bold text-[9px] ${
                          row.predikat === "A"
                            ? "bg-[#E0F5E8] text-[#148557]"
                            : "bg-[#F7EDD6] text-[#A6630F]"
                        }`}
                      >
                        {row.predikat}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 bg-white rounded-[5px] text-xs text-slate-400">
                    Mata pelajaran &quot;{searchQuery}&quot; tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-2 text-[9px] text-[#6E6B78] border-t border-[#DECFE8]">
        <span>
          Menampilkan {paginatedData.length} dari {filteredData.length} mata pelajaran
        </span>

        <div className="flex items-center gap-1.5 font-semibold text-[10px] text-[#6305B0]">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-1.5 py-0.5 rounded hover:bg-white/60 disabled:opacity-30 cursor-pointer"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors ${
                currentPage === page
                  ? "bg-[#6305B0] text-white"
                  : "hover:bg-white/60 text-[#6305B0]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-1.5 py-0.5 rounded hover:bg-white/60 disabled:opacity-30 cursor-pointer"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
