"use client";

import React from "react";
import { CatatanSiswaItem } from "./mockDataSiswa";

interface CatatanTablePanelProps {
  catatanList: CatatanSiswaItem[];
  selectedId: string;
  onSelectCatatan: (item: CatatanSiswaItem) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

export default function CatatanTablePanel({
  catatanList,
  selectedId,
  onSelectCatatan,
  searchTerm,
  onSearchChange,
  currentPage,
  onPageChange,
  pageSize = 8,
}: CatatanTablePanelProps) {
  // Filter pencarian berdasarkan: ID Catatan, ID Siswa, jenis catatan, atau deskripsi
  const filteredList = catatanList.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const idCatatanStr = String(item.idCatatan || item.id || "").toLowerCase();
    const idSiswaStr = String(item.idSiswa || "").toLowerCase();
    const jenisStr = String(item.jenisCatatan || item.kategori || "").toLowerCase();
    const deskripsiStr = String(item.deskripsiCatatan || item.ringkasan || "").toLowerCase();

    return (
      idCatatanStr.includes(term) ||
      idSiswaStr.includes(term) ||
      jenisStr.includes(term) ||
      deskripsiStr.includes(term)
    );
  });

  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedList = filteredList.slice(startIndex, startIndex + pageSize);

  // Template kolom grid presisi dan konsisten antara header dan setiap baris data
  const gridColumnsClass =
    "grid grid-cols-[68px_56px_60px_130px_76px_1fr_95px] gap-3 items-center";

  return (
    <div className="w-full bg-[#F0E6F5] rounded-[14px] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
      <div>
        {/* Header Panel: Judul, Subtitle, & Kolom Pencarian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div>
            <h2
              className="text-[16px] font-bold text-[#14141C] leading-snug"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Riwayat Catatan
            </h2>
            <p
              className="text-[10px] text-[#6E6B78] mt-0.5"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Catatan perkembangan dan komunikasi siswa
            </p>
          </div>

          {/* Search Box dengan placeholder "Cari catatan..." */}
          <div className="relative w-full sm:w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6E6B78]">
              <svg
                className="w-3.5 h-3.5 text-[#6E6B78]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(1);
              }}
              placeholder="Cari catatan..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border-[1.2px] border-[#DECFE8] rounded-[7px] text-[10px] text-[#14141C] placeholder-[#6E6B78] focus:outline-none focus:ring-1 focus:ring-[#6305B0] focus:border-[#6305B0] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  onPageChange(1);
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Tabel Riwayat Catatan */}
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[720px]">
            {/* Header Tabel */}
            <div
              className={`w-full h-[34px] bg-[#E6D4F0] rounded-[6px] px-3.5 ${gridColumnsClass} mb-2`}
            >
              {/* 1. ID Catatan */}
              <div
                className="text-[9px] font-semibold text-[#6305B0] whitespace-nowrap text-left"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                ID Catatan
              </div>

              {/* 2. ID Siswa */}
              <div
                className="text-[9px] font-semibold text-[#6305B0] whitespace-nowrap text-left pl-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                ID Siswa
              </div>

              {/* 3. Semester */}
              <div
                className="text-[9px] font-semibold text-[#6305B0] whitespace-nowrap text-left pl-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Semester
              </div>

              {/* 4. Jenis Catatan */}
              <div
                className="text-[9px] font-semibold text-[#6305B0] whitespace-nowrap text-left"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Jenis Catatan
              </div>

              {/* 5. Poin Disiplin */}
              <div
                className="text-[9px] font-semibold text-[#6305B0] whitespace-nowrap text-left pl-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Poin Disiplin
              </div>

              {/* 6. Deskripsi Catatan */}
              <div
                className="text-[9px] font-semibold text-[#6305B0] whitespace-nowrap text-left"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Deskripsi Catatan
              </div>

              {/* 7. Tanggal Pencatatan */}
              <div
                className="text-[9px] font-semibold text-[#6305B0] whitespace-nowrap text-left"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Tanggal Pencatatan
              </div>
            </div>

            {/* Baris Tabel */}
            <div className="space-y-1.5">
              {paginatedList.length === 0 ? (
                <div className="w-full bg-white rounded-[4px] py-10 text-center text-xs text-[#6E6B78]">
                  Tidak ada catatan yang sesuai dengan pencarian.
                </div>
              ) : (
                paginatedList.map((item) => {
                  const isSelected =
                    item.id === selectedId || item.idCatatan === selectedId;

                  return (
                    <div
                      key={item.id || item.idCatatan}
                      onClick={() => onSelectCatatan(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectCatatan(item);
                        }
                      }}
                      className={`w-full min-h-[38px] px-3.5 py-2 rounded-[4px] ${gridColumnsClass} transition-all cursor-pointer select-none ${
                        isSelected
                          ? "bg-white ring-2 ring-[#6305B0] shadow-xs"
                          : "bg-white hover:bg-white/90 border border-transparent hover:border-[#DECFE8]"
                      }`}
                    >
                      {/* 1. ID Catatan */}
                      <div
                        className="text-[9px] font-medium text-[#14141C] text-left"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.idCatatan || item.id}
                      </div>

                      {/* 2. ID Siswa */}
                      <div
                        className="text-[9px] text-[#14141C] text-left pl-1"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.idSiswa || "30"}
                      </div>

                      {/* 3. Semester */}
                      <div
                        className="text-[9px] text-[#14141C] text-left pl-1"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.semester ?? 2}
                      </div>

                      {/* 4. Jenis Catatan */}
                      <div
                        className="text-[9px] text-[#14141C] truncate text-left"
                        title={item.jenisCatatan || item.kategori}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.jenisCatatan || item.kategori}
                      </div>

                      {/* 5. Poin Disiplin */}
                      <div
                        className="text-[9px] font-semibold text-[#14141C] text-left pl-1"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.poinDisiplin}
                      </div>

                      {/* 6. Deskripsi Catatan */}
                      <div
                        className="text-[9px] text-[#14141C] leading-snug break-words pr-2 line-clamp-2 text-left"
                        title={item.deskripsiCatatan || item.ringkasan}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.deskripsiCatatan || item.ringkasan}
                      </div>

                      {/* 7. Tanggal Pencatatan */}
                      <div
                        className="text-[9px] text-[#14141C] whitespace-nowrap text-left"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.tanggalPencatatan || item.tanggal}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-2">
        <p
          className="text-[9px] text-[#6E6B78]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Menampilkan {paginatedList.length} dari {totalItems} catatan
        </p>

        <div className="flex items-center gap-1.5 text-[9px] text-[#6E6B78]">
          <button
            type="button"
            disabled={validCurrentPage <= 1}
            onClick={() => onPageChange(validCurrentPage - 1)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#E6D4F0] disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-bold cursor-pointer disabled:cursor-not-allowed"
            title="Halaman sebelumnya"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
            const isActive = pg === validCurrentPage;
            return (
              <button
                key={pg}
                type="button"
                onClick={() => onPageChange(pg)}
                className={`w-5 h-5 flex items-center justify-center rounded text-[9px] transition-colors cursor-pointer ${
                  isActive
                    ? "font-bold text-[#6305B0] bg-[#E6D4F0]"
                    : "text-[#6E6B78] hover:bg-[#E6D4F0]/60"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {pg}
              </button>
            );
          })}

          <button
            type="button"
            disabled={validCurrentPage >= totalPages}
            onClick={() => onPageChange(validCurrentPage + 1)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#E6D4F0] disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-bold cursor-pointer disabled:cursor-not-allowed"
            title="Halaman berikutnya"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
