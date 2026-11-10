"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FilterX,
} from "lucide-react";
import { StudentB1, B1FilterState } from "./types";
import {
  MULTIPLE_INTELLIGENCES_OPTIONS,
  RIASEC_OPTIONS,
  KELAS_OPTIONS,
} from "./mockData";

interface AdminB1TableSectionProps {
  students: StudentB1[];
  onSelectStudent: (student: StudentB1) => void;
}

export default function AdminB1TableSection({
  students,
  onSelectStudent,
}: AdminB1TableSectionProps) {
  const [filterState, setFilterState] = useState<B1FilterState>({
    search: "",
    kecerdasan: "Semua Kecerdasan",
    riasec: "Semua RIASEC",
    kelas: "Semua Kelas",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((item) => {
      // Search check
      if (filterState.search.trim()) {
        const query = filterState.search.toLowerCase();
        const matchNisn = item.nisn.toLowerCase().includes(query);
        const matchNama = item.nama.toLowerCase().includes(query);
        const matchKelas = item.kelas.toLowerCase().includes(query);
        const matchProdi = item.minatProdi.toLowerCase().includes(query);
        if (!matchNisn && !matchNama && !matchKelas && !matchProdi) return false;
      }

      // Kecerdasan filter
      if (
        filterState.kecerdasan !== "Semua Kecerdasan" &&
        !item.kecerdasanMajemuk
          .toLowerCase()
          .includes(filterState.kecerdasan.toLowerCase())
      ) {
        return false;
      }

      // RIASEC filter
      if (
        filterState.riasec !== "Semua RIASEC" &&
        item.riasec !== filterState.riasec
      ) {
        return false;
      }

      // Kelas filter
      if (
        filterState.kelas !== "Semua Kelas" &&
        item.kelas !== filterState.kelas
      ) {
        return false;
      }

      return true;
    });
  }, [students, filterState]);

  // Pagination calculation
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleResetFilter = () => {
    setFilterState({
      search: "",
      kecerdasan: "Semua Kecerdasan",
      riasec: "Semua RIASEC",
      kelas: "Semua Kelas",
    });
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-white border border-purple-100 rounded-2xl p-5 sm:p-7 font-sans space-y-6 shadow-sm">
      {/* Search & Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="sm:col-span-2 lg:col-span-5 relative">
          <div className="flex items-center h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 gap-2.5 transition-all focus-within:ring-2 focus-within:ring-[#5F089E]/20 focus-within:bg-white focus-within:border-[#5F089E]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={filterState.search}
              onChange={(e) => {
                setFilterState((prev) => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Cari NISN, nama, atau kelas..."
              className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 text-sm font-normal outline-none"
            />
            {filterState.search && (
              <button
                type="button"
                onClick={() => setFilterState((prev) => ({ ...prev, search: "" }))}
                className="text-slate-400 hover:text-slate-700 text-xs font-medium cursor-pointer"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Dropdown: Multiple Intelligences */}
        <div className="sm:col-span-1 lg:col-span-3 relative">
          <select
            value={filterState.kecerdasan}
            onChange={(e) => {
              setFilterState((prev) => ({ ...prev, kecerdasan: e.target.value }));
              setCurrentPage(1);
            }}
            className={`w-full h-11 appearance-none bg-white border border-slate-200 rounded-xl px-3.5 pr-9 text-xs sm:text-sm font-normal outline-none cursor-pointer transition-colors hover:border-purple-300 focus:border-[#5F089E] ${
              filterState.kecerdasan === "Semua Kecerdasan"
                ? "text-slate-500"
                : "text-slate-800 font-medium"
            }`}
          >
            {MULTIPLE_INTELLIGENCES_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="text-slate-800">
                {opt === "Semua Kecerdasan" ? "Jenis Multiple Intelligences" : opt}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Dropdown: RIASEC */}
        <div className="sm:col-span-1 lg:col-span-2 relative">
          <select
            value={filterState.riasec}
            onChange={(e) => {
              setFilterState((prev) => ({ ...prev, riasec: e.target.value }));
              setCurrentPage(1);
            }}
            className={`w-full h-11 appearance-none bg-white border border-slate-200 rounded-xl px-3.5 pr-8 text-xs sm:text-sm font-normal outline-none cursor-pointer transition-colors hover:border-purple-300 focus:border-[#5F089E] ${
              filterState.riasec === "Semua RIASEC"
                ? "text-slate-500"
                : "text-slate-800 font-medium"
            }`}
          >
            {RIASEC_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="text-slate-800">
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Dropdown: Kelas */}
        <div className="sm:col-span-1 lg:col-span-2 relative">
          <select
            value={filterState.kelas}
            onChange={(e) => {
              setFilterState((prev) => ({ ...prev, kelas: e.target.value }));
              setCurrentPage(1);
            }}
            className={`w-full h-11 appearance-none bg-white border border-slate-200 rounded-xl px-3.5 pr-8 text-xs sm:text-sm font-normal outline-none cursor-pointer transition-colors hover:border-purple-300 focus:border-[#5F089E] ${
              filterState.kelas === "Semua Kelas"
                ? "text-slate-500"
                : "text-slate-800 font-medium"
            }`}
          >
            {KELAS_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="text-slate-800">
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead>
            <tr className="border-b border-purple-100">
              <th className="py-3 px-3 text-slate-500 font-bold text-xs tracking-wider uppercase">
                NISN
              </th>
              <th className="py-3 px-3 text-slate-500 font-bold text-xs tracking-wider uppercase">
                NAMA SISWA
              </th>
              <th className="py-3 px-3 text-slate-500 font-bold text-xs tracking-wider uppercase">
                KELAS
              </th>
              <th className="py-3 px-3 text-slate-500 font-bold text-xs tracking-wider uppercase">
                NILAI RAPOR
              </th>
              <th className="py-3 px-3 text-slate-500 font-bold text-xs tracking-wider uppercase">
                RIASEC
              </th>
              <th className="py-3 px-3 text-slate-500 font-bold text-xs tracking-wider uppercase">
                KECERDASAN MAJEMUK
              </th>
              <th className="py-3 px-3 text-slate-500 font-bold text-xs tracking-wider uppercase">
                MINAT PRODI
              </th>
              <th className="py-3 px-3 text-slate-500 font-bold text-xs tracking-wider uppercase text-center">
                AKSI
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-purple-50/30 transition-colors group"
                >
                  {/* NISN */}
                  <td className="py-3.5 px-3 text-sm font-mono text-slate-600 whitespace-nowrap">
                    {student.nisn}
                  </td>

                  {/* NAMA SISWA */}
                  <td className="py-3.5 px-3 text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {student.nama}
                  </td>

                  {/* KELAS */}
                  <td className="py-3.5 px-3 text-sm text-slate-600 whitespace-nowrap">
                    {student.kelas}
                  </td>

                  {/* NILAI RAPOR */}
                  <td className="py-3.5 px-3 text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {student.nilaiRapor}
                  </td>

                  {/* RIASEC BADGE */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-[#5F089E] text-xs font-bold tracking-wide">
                      {student.riasec}
                    </span>
                  </td>

                  {/* KECERDASAN MAJEMUK */}
                  <td className="py-3.5 px-3 text-sm text-slate-600 max-w-[200px] truncate">
                    {student.kecerdasanMajemuk}
                  </td>

                  {/* MINAT PRODI */}
                  <td className="py-3.5 px-3 text-sm text-slate-600 max-w-[180px] truncate">
                    {student.minatProdi}
                  </td>

                  {/* AKSI BUTTON */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(student)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#5F089E] text-xs font-semibold transition-all group-hover:scale-105 cursor-pointer border border-purple-100"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-3 h-3 text-[#5F089E]" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FilterX className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-800">
                      Tidak ada data siswa yang cocok dengan filter
                    </p>
                    <p className="text-xs text-slate-500">
                      Coba ubah kata kunci pencarian atau sesuaikan opsi filter
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilter}
                      className="mt-2 text-xs font-semibold text-[#5F089E] hover:underline cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-purple-100">
        {/* Info Text */}
        <div className="text-xs text-slate-500">
          Menampilkan {paginatedStudents.length} dari {totalItems} data siswa
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#5F089E] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 3 && currentPage < totalPages - 2 && (
            <>
              <span className="px-1 text-sm text-slate-400">&hellip;</span>
              <button
                type="button"
                onClick={() => setCurrentPage(10)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
              >
                10
              </button>
            </>
          )}

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
