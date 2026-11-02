"use client";

import { useState } from "react";
import { RecapAsesmen, NilaiSemester } from "./mockDataSiswa";
import { ChevronRight } from "lucide-react";

interface DashboardCardsWrapperProps {
  recapData: RecapAsesmen[];
  nilaiData: NilaiSemester[];
}

export function DashboardChartsWrapper({
  recapData,
  nilaiData,
}: DashboardCardsWrapperProps) {
  return (
    <div className="relative w-full rounded-[28px] bg-[#2E0249] p-5 sm:p-7 shadow-md flex flex-col gap-5">
      {/* Kartu Recap Asesmen */}
      <RecapAsesmenCard data={recapData} />

      {/* Kartu Nilai Akademik dengan Interaksi Klik Semester */}
      <NilaiAkademikCard data={nilaiData} />


    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 1. KARTU RECAP ASESMEN
// ────────────────────────────────────────────────────────────
interface RecapAsesmenCardProps {
  data: RecapAsesmen[];
}

export function RecapAsesmenCard({ data }: RecapAsesmenCardProps) {
  return (
    <div className="rounded-[18px] bg-white p-6 shadow-sm">
      <h3
        className="font-bold text-xl text-black mb-5"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        Recap Asesmen
      </h3>

      <div className="flex flex-col gap-4">
        {data.map((item) => {
          const pct = Math.round((item.skor / item.total) * 100);
          return (
            <div key={item.kategori} className="flex items-center gap-3">
              <span
                className="text-sm text-[#72747A] w-40 shrink-0 leading-tight"
                style={{ fontFamily: "SF Pro, Inter, sans-serif" }}
              >
                {item.kategori}
              </span>

              <div className="flex-1 h-10 rounded bg-[#F0F2F5] overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-700"
                  style={{ width: `${pct}%`, background: "#3468FF" }}
                />
              </div>

              <span
                className="text-sm text-[#72747A] w-24 text-right shrink-0"
                style={{ fontFamily: "SF Pro, Inter, sans-serif" }}
              >
                {item.skor} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 2A. HELPER: predikat dari nilai
// ────────────────────────────────────────────────────────────
function getPredikat(nilai: number): "A" | "B" | "C" {
  if (nilai >= 90) return "A";
  if (nilai >= 75) return "B";
  return "C";
}

// ────────────────────────────────────────────────────────────
// 2B. TABEL DETAIL NILAI SEMESTER (bergaya NilaiTertinggi)
// ────────────────────────────────────────────────────────────
function NilaiSemesterTable({ semesterData }: { semesterData: NilaiSemester }) {
  const [search, setSearch] = useState("");
  const maxNilai = Math.max(...semesterData.mapel.map((m) => m.nilai));
  const filtered = semesterData.mapel.filter((m) =>
    search.trim() === "" ? true : m.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="mt-5 rounded-[14px] bg-[#F0E6F5] p-5 animate-in fade-in slide-in-from-top-2 duration-200"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Header: Judul & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="font-bold text-[18px] text-[#14141C] leading-snug">
            Nilai Tertinggi Mata Pelajaran
          </h4>
          <p className="font-normal text-[11px] text-[#6E6B78] mt-0.5">
            Nilai terbaik per mata pelajaran &middot; Semester {semesterData.semester} (data contoh)
          </p>
        </div>
        <div className="relative w-full sm:w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6E6B78]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 16.65A7 7 0 1 0 2.35 9.35a7 7 0 0 0 14.3 7.3z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mata pelajaran..."
            className="w-full h-[34px] pl-9 pr-3 rounded-[8px] bg-white border border-[#DECFE8] text-[10px] text-[#14141C] placeholder-[#6E6B78] outline-none focus:border-[#6305B0] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[500px]">
          {/* Header Kolom */}
          <div className="w-full h-[30px] bg-[#E6D4F0] rounded-[6px] px-3.5 grid grid-cols-[1fr_110px_80px_90px] items-center gap-2 mb-1.5">
            <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider">MATA PELAJARAN</div>
            <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider text-center">NILAI TERTINGGI</div>
            <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider text-center">PREDIKAT</div>
            <div className="text-[9px] font-semibold text-[#6305B0] uppercase tracking-wider text-center">STATUS</div>
          </div>

          {/* Baris Data */}
          <div className="space-y-1">
            {filtered.length === 0 ? (
              <div className="w-full bg-white rounded-[5px] py-4 text-center text-xs text-[#6E6B78]">
                Tidak ada mata pelajaran yang sesuai.
              </div>
            ) : (
              filtered.map((item) => {
                const predikat = getPredikat(item.nilai);
                const isTertinggi = item.nilai === maxNilai;
                return (
                  <div
                    key={item.nama}
                    className="w-full min-h-[34px] bg-white rounded-[5px] px-3.5 py-1.5 grid grid-cols-[1fr_110px_80px_90px] items-center gap-2 hover:bg-[#FAF6FC] transition-colors"
                  >
                    <div className="text-[11px] font-medium text-[#14141C] truncate">{item.nama}</div>
                    <div className="text-[12px] font-bold text-[#6305B0] text-center">{item.nilai}</div>
                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center justify-center w-[36px] h-[22px] rounded-[6px] text-[10px] font-bold ${
                          predikat === "A"
                            ? "bg-[#E0F5E8] text-[#148557]"
                            : predikat === "B"
                            ? "bg-[#FFF2D6] text-[#A6630F]"
                            : "bg-[#FDECEA] text-[#C0392B]"
                        }`}
                      >
                        {predikat}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      {isTertinggi ? (
                        <span className="inline-flex items-center justify-center px-2.5 h-[22px] rounded-[6px] text-[9px] font-semibold bg-[#E0F5E8] text-[#148557]">
                          Tertinggi
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#6E6B78]">&#8212;</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-[#DECFE8]">
        <p className="text-[10px] text-[#6E6B78]">Menampilkan {filtered.length} mata pelajaran</p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 2C. KARTU NILAI AKADEMIK DENGAN DETAIL NILAI PER SEMESTER
// ────────────────────────────────────────────────────────────
interface NilaiAkademikCardProps {
  data: NilaiSemester[];
}

export function NilaiAkademikCard({ data }: NilaiAkademikCardProps) {
  // null = tidak ada yang terbuka; klik = buka; klik lagi = tutup (toggle)
  const [activeSem, setActiveSem] = useState<number | null>(null);

  const handleToggle = (semNum: number) => {
    setActiveSem((prev) => (prev === semNum ? null : semNum));
  };

  const selectedSemesterData =
    activeSem !== null ? data.find((s) => s.semester === activeSem) : null;

  return (
    <div className="rounded-[18px] bg-white p-6 shadow-sm">
      {/* Header Nilai Akademik */}
      <div className="flex items-center justify-between mb-5">
        <h3
          className="font-bold text-xl text-black"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Nilai Akademik
        </h3>

        {/* Tombol panah navigasi kanan atas */}
        <button
          type="button"
          onClick={() => {
            // Rotasi semester berikutnya ketika tombol panah diklik
            if (activeSem === null) {
              setActiveSem(1);
            } else {
              const nextSem = activeSem >= data.length ? 1 : activeSem + 1;
              setActiveSem(nextSem);
            }
          }}
          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="Lihat semester berikutnya"
          aria-label="Semester berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Donut Charts Lingkaran Nilai Semester */}
      <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-3 justify-between no-scrollbar">
        {data.map((sem) => {
          const radius = 36;
          const circ = 2 * Math.PI * radius;
          const offset = circ - (sem.rata / 100) * circ;
          const isActive = activeSem === sem.semester;

          return (
            <div
              key={sem.semester}
              onClick={() => handleToggle(sem.semester)}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle(sem.semester);
                }
              }}
              className="flex flex-col items-center gap-2.5 shrink-0 cursor-pointer group select-none"
            >
              {/* Donut Chart Circle Button */}
              <div
                id={`donut-sem-${sem.semester}`}
                className={`relative w-[88px] h-[88px] rounded-full p-1 transition-all duration-200 ${
                  isActive
                    ? "ring-3 ring-[#226CE0] ring-offset-2 scale-110 shadow-lg"
                    : "hover:scale-105 group-hover:ring-2 group-hover:ring-[#226CE0]/40"
                }`}
              >
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 88 88"
                  className="rotate-[-90deg] w-full h-full"
                >
                  {/* Lingkaran latar belakang track */}
                  <circle
                    cx="44"
                    cy="44"
                    r={radius}
                    fill="none"
                    stroke="rgba(34,108,224,0.12)"
                    strokeWidth="9"
                  />

                  {/* Lingkaran progress bar biru */}
                  <circle
                    cx="44"
                    cy="44"
                    r={radius}
                    fill="none"
                    stroke="#226CE0"
                    strokeWidth="9"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>

                {/* Angka Rata-rata di Tengah Lingkaran */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-[15px] font-black transition-colors ${
                      isActive ? "text-[#226CE0] scale-110" : "text-[#226CE0]"
                    }`}
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {sem.rata}
                  </span>
                </div>
              </div>

              {/* Label Nama Semester */}
              <span
                className={`text-[15px] font-bold text-center transition-colors ${
                  isActive ? "text-[#226CE0]" : "text-black group-hover:text-[#226CE0]"
                }`}
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Semester {sem.semester}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail tabel nilai semester — pop-up dengan animasi dari bulatan */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: selectedSemesterData ? "1fr" : "0fr",
          transition: "grid-template-rows 300ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          {selectedSemesterData && (
            <div
              style={{
                animation: "popUp 280ms cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              <style>{`
                @keyframes popUp {
                  0%   { opacity: 0; transform: scale(0.92) translateY(-8px); }
                  60%  { opacity: 1; transform: scale(1.02) translateY(2px); }
                  100% { opacity: 1; transform: scale(1) translateY(0); }
                }
              `}</style>
              <NilaiSemesterTable semesterData={selectedSemesterData} />
            </div>
          )}
        </div>
      </div>

      {/* Hint */}
      <p
        className="text-[11px] text-[#6E6B7A] mt-4"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        * Klik donut chart untuk melihat atau menutup detail nilai per semester
      </p>
    </div>
  );
}
