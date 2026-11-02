"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

interface MapelItem {
  id: string;
  mataPelajaran: string;
  nilaiTertinggi: number;
  predikat: "A" | "B" | "C";
  status: "Tertinggi" | "—";
}

// Data Nilai Tertinggi Mata Pelajaran Umum & Pilihan (Sesuai Screenshot Figma)
const DATA_MAPEL_UMUM: MapelItem[] = [
  { id: "u-1", mataPelajaran: "Pendidikan Agama", nilaiTertinggi: 92, predikat: "A", status: "—" },
  { id: "u-2", mataPelajaran: "Pendidikan Pancasila", nilaiTertinggi: 94, predikat: "A", status: "—" },
  { id: "u-3", mataPelajaran: "Bahasa Indonesia", nilaiTertinggi: 91, predikat: "A", status: "—" },
  { id: "u-4", mataPelajaran: "Bahasa Inggris", nilaiTertinggi: 93, predikat: "A", status: "—" },
  { id: "u-5", mataPelajaran: "PJOK", nilaiTertinggi: 90, predikat: "A", status: "—" },
  { id: "u-6", mataPelajaran: "Sejarah", nilaiTertinggi: 89, predikat: "B", status: "—" },
  { id: "u-7", mataPelajaran: "Seni Budaya", nilaiTertinggi: 95, predikat: "A", status: "Tertinggi" },
  { id: "u-8", mataPelajaran: "Informatika", nilaiTertinggi: 98, predikat: "A", status: "Tertinggi" },
];

const DATA_MAPEL_PILIHAN: MapelItem[] = [
  { id: "p-1", mataPelajaran: "Matematika Lanjut", nilaiTertinggi: 96, predikat: "A", status: "Tertinggi" },
  { id: "p-2", mataPelajaran: "Kimia", nilaiTertinggi: 88, predikat: "B", status: "—" },
  { id: "p-3", mataPelajaran: "Biologi", nilaiTertinggi: 92, predikat: "A", status: "—" },
];

export default function NilaiTertinggiTablePanel({ semesterNumber = 1 }: { semesterNumber?: number }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUmum = useMemo(() => {
    if (!searchQuery.trim()) return DATA_MAPEL_UMUM;
    const q = searchQuery.toLowerCase();
    return DATA_MAPEL_UMUM.filter((m) => m.mataPelajaran.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredPilihan = useMemo(() => {
    if (!searchQuery.trim()) return DATA_MAPEL_PILIHAN;
    const q = searchQuery.toLowerCase();
    return DATA_MAPEL_PILIHAN.filter((m) => m.mataPelajaran.toLowerCase().includes(q));
  }, [searchQuery]);

  const totalMapel = filteredUmum.length + filteredPilihan.length;

  return (
    <div
      className="w-full rounded-[14px] bg-[#F0E6F5] p-5 sm:p-6 shadow-2xs mt-4"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Header: Judul & Kolom Pencarian ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-[18px] text-[#14141C] leading-snug">
            Nilai Tertinggi Mata Pelajaran
          </h3>
          <p className="font-normal text-[11px] text-[#6E6B78] mt-0.5">
            Nilai terbaik per mata pelajaran · Semester {semesterNumber} (data contoh)
          </p>
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full sm:w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6E6B78]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mata pelajaran..."
            className="w-full h-[34px] pl-9 pr-3 rounded-[8px] bg-white border border-[#DECFE8] text-[10px] text-[#14141C] placeholder-[#6E6B78] outline-none focus:border-[#6305B0] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ── GRUP 1: Mata Pelajaran Umum ── */}
      <div className="mb-5">
        <h4 className="text-[13px] font-bold text-[#6305B0] mb-2 leading-snug">
          Mata Pelajaran Umum
        </h4>

        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[640px]">
            {/* Header Kolom Grup Umum */}
            <div className="w-full h-[30px] bg-[#E6D4F0] rounded-[6px] px-3.5 grid grid-cols-[1fr_130px_90px_90px] items-center gap-2 mb-1.5">
              <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider">
                MATA PELAJARAN
              </div>
              <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider text-center">
                NILAI TERTINGGI
              </div>
              <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider text-center">
                PREDIKAT
              </div>
              <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider text-center">
                STATUS
              </div>
            </div>

            {/* Baris-baris Data Umum */}
            <div className="space-y-1">
              {filteredUmum.length === 0 ? (
                <div className="w-full bg-white rounded-[5px] py-4 text-center text-xs text-[#6E6B78]">
                  Tidak ada mata pelajaran umum yang sesuai.
                </div>
              ) : (
                filteredUmum.map((item) => (
                  <div
                    key={item.id}
                    className="w-full min-h-[34px] bg-white rounded-[5px] px-3.5 py-1.5 grid grid-cols-[1fr_130px_90px_90px] items-center gap-2 transition-colors hover:bg-[#FAF6FC]"
                  >
                    <div className="text-[11px] font-medium text-[#14141C] truncate">
                      {item.mataPelajaran}
                    </div>

                    <div className="text-[12px] font-bold text-[#6305B0] text-center">
                      {item.nilaiTertinggi}
                    </div>

                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center justify-center w-[36px] h-[22px] rounded-[6px] text-[10px] font-bold ${
                          item.predikat === "A"
                            ? "bg-[#E0F5E8] text-[#148557]"
                            : "bg-[#FFF2D6] text-[#A6630F]"
                        }`}
                      >
                        {item.predikat}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      {item.status === "Tertinggi" ? (
                        <span className="inline-flex items-center justify-center px-2.5 h-[22px] rounded-[6px] text-[9px] font-semibold bg-[#E0F5E8] text-[#148557]">
                          Tertinggi
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#6E6B78] text-center">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── GRUP 2: Mata Pelajaran Pilihan ── */}
      <div>
        <h4 className="text-[13px] font-bold text-[#6305B0] mb-2 leading-snug">
          Mata Pelajaran Pilihan
        </h4>

        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[640px]">
            {/* Header Kolom Grup Pilihan */}
            <div className="w-full h-[30px] bg-[#E6D4F0] rounded-[6px] px-3.5 grid grid-cols-[1fr_130px_90px_90px] items-center gap-2 mb-1.5">
              <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider">
                MATA PELAJARAN
              </div>
              <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider text-center">
                NILAI TERTINGGI
              </div>
              <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider text-center">
                PREDIKAT
              </div>
              <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider text-center">
                STATUS
              </div>
            </div>

            {/* Baris-baris Data Pilihan */}
            <div className="space-y-1">
              {filteredPilihan.length === 0 ? (
                <div className="w-full bg-white rounded-[5px] py-4 text-center text-xs text-[#6E6B78]">
                  Tidak ada mata pelajaran pilihan yang sesuai.
                </div>
              ) : (
                filteredPilihan.map((item) => (
                  <div
                    key={item.id}
                    className="w-full min-h-[34px] bg-white rounded-[5px] px-3.5 py-1.5 grid grid-cols-[1fr_130px_90px_90px] items-center gap-2 transition-colors hover:bg-[#FAF6FC]"
                  >
                    <div className="text-[11px] font-medium text-[#14141C] truncate">
                      {item.mataPelajaran}
                    </div>

                    <div className="text-[12px] font-bold text-[#6305B0] text-center">
                      {item.nilaiTertinggi}
                    </div>

                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center justify-center w-[36px] h-[22px] rounded-[6px] text-[10px] font-bold ${
                          item.predikat === "A"
                            ? "bg-[#E0F5E8] text-[#148557]"
                            : "bg-[#FFF2D6] text-[#A6630F]"
                        }`}
                      >
                        {item.predikat}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      {item.status === "Tertinggi" ? (
                        <span className="inline-flex items-center justify-center px-2.5 h-[22px] rounded-[6px] text-[9px] font-semibold bg-[#E0F5E8] text-[#148557]">
                          Tertinggi
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#6E6B78] text-center">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="pt-3 mt-3 border-t border-[#DECFE8]">
        <p className="text-[10px] text-[#6E6B78]">
          Menampilkan {totalMapel} mata pelajaran
        </p>
      </div>
    </div>
  );
}
