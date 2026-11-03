import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FilterX,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { StudentB1 } from "./types";
import { MOCK_STUDENTS_B1 } from "./mockData";

// Enrichment for Monitoring Mapel Peminatan & Tingkat Keberhasilan
const ENRICHED_MONITORING_DATA: Record<
  string,
  {
    mapelPilihanUtama: string;
    nilaiMapelPilihan: number;
    trenNilaiMapel: "naik" | "stabil" | "menurun";
    persentaseKeberhasilan: number;
    statusKesesuaian: "Sesuai" | "Perlu Penyesuaian" | "Perlu Peninjauan";
    keteranganTren: string;
  }
> = {
  "std-1": {
    mapelPilihanUtama: "Informatika & Data Science",
    nilaiMapelPilihan: 91.5,
    trenNilaiMapel: "naik",
    persentaseKeberhasilan: 94.8,
    statusKesesuaian: "Sesuai",
    keteranganTren: "Nilai meningkat stabil (+3.5 poin)",
  },
  "std-2": {
    mapelPilihanUtama: "Biologi Lanjut & Kimia",
    nilaiMapelPilihan: 92.0,
    trenNilaiMapel: "stabil",
    persentaseKeberhasilan: 93.2,
    statusKesesuaian: "Sesuai",
    keteranganTren: "Konsisten di atas ambang kompetensi",
  },
  "std-3": {
    mapelPilihanUtama: "Sosiologi & Bahasa Asing Lanjut",
    nilaiMapelPilihan: 76.5,
    trenNilaiMapel: "menurun",
    persentaseKeberhasilan: 68.4,
    statusKesesuaian: "Perlu Penyesuaian",
    keteranganTren: "Menurun (-6.2 poin pada UTS Semester 2)",
  },
  "std-4": {
    mapelPilihanUtama: "Seni Rupa & Desain Grafis",
    nilaiMapelPilihan: 71.0,
    trenNilaiMapel: "menurun",
    persentaseKeberhasilan: 59.5,
    statusKesesuaian: "Perlu Peninjauan",
    keteranganTren: "Di bawah target kelulusan SNBP DKV (-9.0 poin)",
  },
  "std-5": {
    mapelPilihanUtama: "Fisika Lanjut & Matematika TL",
    nilaiMapelPilihan: 88.0,
    trenNilaiMapel: "stabil",
    persentaseKeberhasilan: 89.5,
    statusKesesuaian: "Sesuai",
    keteranganTren: "Sesuai dengan target prodi Teknik Mesin",
  },
  "std-6": {
    mapelPilihanUtama: "Matematika Tingkat Lanjut",
    nilaiMapelPilihan: 93.5,
    trenNilaiMapel: "naik",
    persentaseKeberhasilan: 95.0,
    statusKesesuaian: "Sesuai",
    keteranganTren: "Peningkatan signifikan di aljabar & kalkulus",
  },
  "std-7": {
    mapelPilihanUtama: "Sosiologi & Psikologi Sosial",
    nilaiMapelPilihan: 74.0,
    trenNilaiMapel: "menurun",
    persentaseKeberhasilan: 64.2,
    statusKesesuaian: "Perlu Penyesuaian",
    keteranganTren: "Terdapat penurunan pada materi statistika sosial",
  },
  "std-8": {
    mapelPilihanUtama: "Ekonomi Bisnis & Akuntansi",
    nilaiMapelPilihan: 69.5,
    trenNilaiMapel: "menurun",
    persentaseKeberhasilan: 54.0,
    statusKesesuaian: "Perlu Peninjauan",
    keteranganTren: "Penurunan konsistensi nilai akuntansi & kuantitatif",
  },
};

const MAPEL_OPTIONS = [
  "Semua Mapel Peminatan",
  "Informatika & Data Science",
  "Biologi Lanjut & Kimia",
  "Fisika Lanjut & Matematika TL",
  "Matematika Tingkat Lanjut",
  "Sosiologi & Bahasa Asing Lanjut",
  "Seni Rupa & Desain Grafis",
  "Ekonomi Bisnis & Akuntansi",
];

const KELAS_OPTIONS = ["Semua Kelas", "X-1", "X-2", "X-3", "X-4", "X-5"];

const STATUS_KESESUAIAN_OPTIONS = [
  "Semua Status Keberhasilan",
  "Sesuai (>= 80%)",
  "Perlu Penyesuaian (65% - 79%)",
  "Perlu Peninjauan (< 65%)",
];

interface AdminB1FeedbackTableProps {
  onSelectStudentFeedback?: (student: StudentB1) => void;
  savedFeedbackStudentIds?: Set<string>;
}

export const AdminB1FeedbackTable: React.FC<AdminB1FeedbackTableProps> = ({
  onSelectStudentFeedback,
  savedFeedbackStudentIds,
}) => {
  const [baseStudents] = useState<StudentB1[]>(() => {
    return MOCK_STUDENTS_B1.map((student) => {
      const enrichment = ENRICHED_MONITORING_DATA[student.id] || {
        mapelPilihanUtama: "Mata Pelajaran Pilihan Terpilih",
        nilaiMapelPilihan: student.nilaiRapor,
        trenNilaiMapel: "stabil" as const,
        persentaseKeberhasilan: Math.round(student.nilaiRapor * 0.95),
        statusKesesuaian: "Sesuai" as const,
        keteranganTren: "Nilai relatif stabil sesuai target",
      };
      return {
        ...student,
        ...enrichment,
      };
    });
  });

  const [filterState, setFilterState] = useState({
    search: "",
    mapel: "Semua Mapel Peminatan",
    statusKeberhasilan: "Semua Status Keberhasilan",
    kelas: "Semua Kelas",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter students
  const filteredStudents = useMemo(() => {
    return baseStudents.filter((student) => {
      const matchesSearch =
        filterState.search === "" ||
        student.nama.toLowerCase().includes(filterState.search.toLowerCase()) ||
        student.nisn.includes(filterState.search) ||
        student.kelas.toLowerCase().includes(filterState.search.toLowerCase()) ||
        student.minatProdi.toLowerCase().includes(filterState.search.toLowerCase());

      const matchesMapel =
        filterState.mapel === "Semua Mapel Peminatan" ||
        student.mapelPilihanUtama === filterState.mapel;

      const matchesKelas =
        filterState.kelas === "Semua Kelas" ||
        student.kelas === filterState.kelas;

      let matchesStatus = true;
      if (filterState.statusKeberhasilan === "Sesuai (>= 80%)") {
        matchesStatus = student.statusKesesuaian === "Sesuai";
      } else if (filterState.statusKeberhasilan === "Perlu Penyesuaian (65% - 79%)") {
        matchesStatus = student.statusKesesuaian === "Perlu Penyesuaian";
      } else if (filterState.statusKeberhasilan === "Perlu Peninjauan (< 65%)") {
        matchesStatus = student.statusKesesuaian === "Perlu Peninjauan";
      }

      return matchesSearch && matchesMapel && matchesKelas && matchesStatus;
    });
  }, [baseStudents, filterState]);

  // Statistics calculation for overview summary banner
  const statSummary = useMemo(() => {
    let perluAtensi = 0;
    let menurun = 0;
    baseStudents.forEach((s) => {
      if (s.statusKesesuaian !== "Sesuai") perluAtensi++;
      if (s.trenNilaiMapel === "menurun") menurun++;
    });
    return { perluAtensi, menurun, total: baseStudents.length };
  }, [baseStudents]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handleResetFilters = () => {
    setFilterState({
      search: "",
      mapel: "Semua Mapel Peminatan",
      statusKeberhasilan: "Semua Status Keberhasilan",
      kelas: "Semua Kelas",
    });
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-white border border-purple-100 rounded-2xl p-5 sm:p-7 font-['Montserrat',sans-serif] space-y-6 shadow-sm">
      {/* Header Info & Monitoring Quick Insight */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-purple-100 pb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">
            Monitoring Nilai Mapel Peminatan &amp; Evaluasi Keberhasilan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Pantau perkembangan nilai mata pelajaran pilihan siswa terhadap persentase keberhasilan peminatan.
            Admin dan Guru BK dapat memberikan catatan feedback serta strategi belajar perbaikan secara terarah (opsional).
          </p>
        </div>

        {/* Quick Insight Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>
              <strong className="font-bold">{statSummary.perluAtensi}</strong> Siswa Perlu Penyesuaian/Review
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#5F089E] border border-purple-200 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>
              <strong className="font-bold">{statSummary.menurun}</strong> Nilai Menurun
            </span>
          </div>
        </div>
      </div>

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
              placeholder="Cari NISN, nama, kelas, atau minat prodi..."
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

        {/* Dropdown: Mapel Peminatan */}
        <div className="sm:col-span-1 lg:col-span-3 relative">
          <select
            value={filterState.mapel}
            onChange={(e) => {
              setFilterState((prev) => ({ ...prev, mapel: e.target.value }));
              setCurrentPage(1);
            }}
            className={`w-full h-11 appearance-none bg-white border border-slate-200 rounded-xl px-3.5 pr-9 text-xs sm:text-sm font-normal outline-none cursor-pointer transition-colors hover:border-purple-300 focus:border-[#5F089E] ${
              filterState.mapel === "Semua Mapel Peminatan"
                ? "text-slate-500"
                : "text-slate-800 font-medium"
            }`}
          >
            {MAPEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="text-slate-800">
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Dropdown: Status Kesesuaian / Keberhasilan */}
        <div className="sm:col-span-1 lg:col-span-2 relative">
          <select
            value={filterState.statusKeberhasilan}
            onChange={(e) => {
              setFilterState((prev) => ({ ...prev, statusKeberhasilan: e.target.value }));
              setCurrentPage(1);
            }}
            className={`w-full h-11 appearance-none bg-white border border-slate-200 rounded-xl px-3.5 pr-8 text-xs sm:text-sm font-normal outline-none cursor-pointer transition-colors hover:border-purple-300 focus:border-[#5F089E] ${
              filterState.statusKeberhasilan === "Semua Status Keberhasilan"
                ? "text-slate-500"
                : "text-slate-800 font-medium"
            }`}
          >
            {STATUS_KESESUAIAN_OPTIONS.map((opt) => (
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

      {/* Table Container Focused on Mapel Peminatan Monitoring */}
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full min-w-[850px] border-collapse text-left">
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
                MAPEL PEMINATAN
              </th>
              <th className="py-3 px-3 text-slate-500 font-bold text-xs tracking-wider uppercase">
                NILAI &amp; PERKEMBANGAN
              </th>
              <th className="py-3 px-3 text-slate-500 font-bold text-xs tracking-wider uppercase text-center">
                AKSI
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => {
                const hasSavedFeedback = savedFeedbackStudentIds?.has(student.id);
                const isDecreasing = student.trenNilaiMapel === "menurun";
                const isWarning = student.statusKesesuaian !== "Sesuai";

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors group cursor-pointer ${
                      isWarning
                        ? "bg-rose-50/20 hover:bg-rose-50/40"
                        : "hover:bg-purple-50/30"
                    }`}
                    onClick={() => onSelectStudentFeedback?.(student)}
                  >
                    {/* NISN */}
                    <td className="py-3.5 px-3 text-sm font-mono text-slate-600 whitespace-nowrap">
                      {student.nisn}
                    </td>

                    {/* NAMA SISWA */}
                    <td className="py-3.5 px-3 text-sm font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{student.nama}</span>
                        {hasSavedFeedback && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Feedback Diberikan
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                        Target: {student.minatProdi}
                      </p>
                    </td>

                    {/* KELAS */}
                    <td className="py-3.5 px-3 text-sm text-slate-600 whitespace-nowrap">
                      {student.kelas}
                    </td>

                    {/* MAPEL PEMINATAN */}
                    <td className="py-3.5 px-3 text-sm text-slate-800 max-w-[210px]">
                      <span className="font-medium">{student.mapelPilihanUtama}</span>
                    </td>

                    {/* NILAI & PERKEMBANGAN MAPEL */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          {student.nilaiMapelPilihan}
                        </span>

                        {student.trenNilaiMapel === "naik" && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Naik
                          </span>
                        )}
                        {student.trenNilaiMapel === "stabil" && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            <Minus className="w-3.5 h-3.5" />
                            Stabil
                          </span>
                        )}
                        {student.trenNilaiMapel === "menurun" && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md animate-pulse">
                            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                            Menurun
                          </span>
                        )}
                      </div>
                    </td>

                    {/* AKSI BUTTON */}
                    <td
                      className="py-3.5 px-3 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectStudentFeedback?.(student)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all group-hover:scale-105 cursor-pointer shadow-xs ${
                          isDecreasing || isWarning
                            ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20"
                            : "bg-[#5F089E] hover:bg-[#4d0680] text-white shadow-purple-900/20"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Beri Feedback</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center">
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
                      onClick={handleResetFilters}
                      className="mt-2 text-xs font-semibold text-[#5F089E] hover:underline cursor-pointer"
                    >
                      Reset Semua Filter
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <div>
          Menampilkan baris{" "}
          <span className="font-semibold text-slate-800">
            {filteredStudents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </span>{" "}
          -{" "}
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-slate-800">
            {filteredStudents.length}
          </span>{" "}
          siswa
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentPage === page
                  ? "bg-[#5F089E] text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
