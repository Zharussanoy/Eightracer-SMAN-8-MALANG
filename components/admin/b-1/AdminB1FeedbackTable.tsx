"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Eye,
  X,
  BookOpen,
  Clock,
} from "lucide-react";
import { StudentB1 } from "./types";
import { apiRequest } from "@/lib/api";

const DEFAULT_MAPEL_OPTIONS = [
  "Semua Mapel Peminatan",
  "Matematika Tingkat Lanjut",
  "Fisika",
  "Informatika",
  "Bahasa Jepang",
  "Biologi",
  "Kimia",
  "Bahasa Inggris Tingkat Lanjut",
  "Ekonomi",
  "Sosiologi",
  "Geografi",
  "Bahasa Indonesia Tingkat Lanjut",
];

const DEFAULT_KELAS_OPTIONS = ["Semua Kelas", "X-1", "X-2", "X-3", "X-4", "X-5"];

const STATUS_KESESUAIAN_OPTIONS = [
  "Semua Status Keberhasilan",
  "Sesuai (>= 80%)",
  "Perlu Penyesuaian (65% - 79%)",
  "Perlu Peninjauan (< 65%)",
];

interface AdminB1FeedbackTableProps {
  students?: StudentB1[];
  onSelectStudentFeedback?: (student: StudentB1) => void;
  savedFeedbackStudentIds?: Set<string>;
  onShowToast?: (msg: string) => void;
}

export const AdminB1FeedbackTable: React.FC<AdminB1FeedbackTableProps> = ({
  students: propStudents = [],
  onSelectStudentFeedback,
  savedFeedbackStudentIds,
}) => {
  const [backendEnrichment, setBackendEnrichment] = useState<
    Record<
      string,
      {
        mapelPilihanUtama: string;
        paket4Mapel: string[];
        nilaiMapelPilihan: number | null;
        sudahInputNilai: boolean;
        semesterAktif?: number;
        daftarSemesterTerisi?: number[];
        trenNilaiMapel: "naik" | "stabil" | "menurun" | null;
        persentaseKeberhasilan: number | null;
        statusKesesuaian: "Sesuai" | "Perlu Penyesuaian" | "Perlu Peninjauan" | "Menunggu Input Nilai";
        detailNilai4Mapel?: Array<{
          urutan?: number;
          mataPelajaranId?: number;
          namaMapel: string;
          nilai: number | null;
          nilai_formatted?: string;
          statusValidasi?: string;
          labelValidasi?: string;
          sudahDiinput?: boolean;
        }>;
      }
    >
  >({});

  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<number>(3);
  const [selectedStudentForScoreModal, setSelectedStudentForScoreModal] = useState<StudentB1 | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const semParam = `&semester=${selectedSemesterFilter}`;
        const res = await apiRequest<{
          daftar_peserta_didik?: Array<{
            siswa_id: number;
            semester_aktif?: number;
            daftar_semester_terisi?: number[];
            paket_4_mapel?: string[];
            nilai_mapel?: number | null;
            rata_rata_nilai?: number | null;
            sudah_input_nilai?: boolean;
            tren?: string | null;
            persentase_keberhasilan?: number | null;
            status_kesesuaian?: string;
            detail_nilai_4_mapel?: Array<{
              urutan?: number;
              mata_pelajaran_id?: number;
              nama_mapel: string;
              nilai: number | null;
              nilai_formatted?: string;
              status_validasi?: string;
              label_validasi?: string;
              sudah_diinput?: boolean;
            }>;
          }>;
        }>(`/admin/feedback-strategi?per_page=500${semParam}`);

        if (!active || !res?.daftar_peserta_didik) return;
        const map: typeof backendEnrichment = {};
        for (const item of res.daftar_peserta_didik) {
          const id = String(item.siswa_id);
          const sudahInput = Boolean(
            item.sudah_input_nilai ||
            (item.rata_rata_nilai !== null && item.rata_rata_nilai !== undefined && item.rata_rata_nilai > 0)
          );
          const pct = sudahInput ? (item.persentase_keberhasilan ?? 85) : null;
          const trenRaw = (item.tren || "").toLowerCase();
          const tren: "naik" | "stabil" | "menurun" | null =
            !sudahInput
              ? null
              : trenRaw === "naik"
              ? "naik"
              : trenRaw === "menurun" || trenRaw === "turun"
              ? "menurun"
              : trenRaw === "stabil"
              ? "stabil"
              : null;

          const status: "Sesuai" | "Perlu Penyesuaian" | "Perlu Peninjauan" | "Menunggu Input Nilai" =
            !sudahInput
              ? "Menunggu Input Nilai"
              : pct && pct >= 80
              ? "Sesuai"
              : pct && pct >= 65
              ? "Perlu Penyesuaian"
              : "Perlu Peninjauan";

          const paket4 = item.paket_4_mapel || [];
          const mapelStr = paket4.length > 0 ? paket4.join(", ") : "Belum Ada Rekomendasi";

          map[id] = {
            mapelPilihanUtama: mapelStr,
            paket4Mapel: paket4,
            nilaiMapelPilihan: sudahInput ? (item.rata_rata_nilai ?? item.nilai_mapel ?? null) : null,
            sudahInputNilai: sudahInput,
            semesterAktif: item.semester_aktif || 3,
            daftarSemesterTerisi: item.daftar_semester_terisi || [],
            trenNilaiMapel: tren,
            persentaseKeberhasilan: pct,
            statusKesesuaian: status,
            detailNilai4Mapel: item.detail_nilai_4_mapel?.map((d) => ({
              urutan: d.urutan,
              mataPelajaranId: d.mata_pelajaran_id,
              namaMapel: d.nama_mapel,
              nilai: d.nilai !== null && d.nilai !== undefined ? Number(d.nilai) : null,
              nilai_formatted: d.nilai_formatted,
              statusValidasi: d.status_validasi,
              labelValidasi: d.label_validasi,
              sudahDiinput: Boolean(d.sudah_diinput),
            })),
          };
        }
        setBackendEnrichment(map);
      } catch {
        // Ignore if empty
      }
    })();
    return () => {
      active = false;
    };
  }, [propStudents.length, selectedSemesterFilter]);

  const baseStudents = useMemo<StudentB1[]>(() => {
    return propStudents.map((student) => {
      const enrich = backendEnrichment[student.id];
      const sudahInput = enrich ? enrich.sudahInputNilai : Boolean(student.sudahInputNilai);
      const nilaiMapel = sudahInput ? (enrich?.nilaiMapelPilihan ?? student.nilaiMapelPilihan ?? null) : null;
      const pct = sudahInput ? (enrich?.persentaseKeberhasilan ?? student.persentaseKeberhasilan ?? 85) : null;
      const status: "Sesuai" | "Perlu Penyesuaian" | "Perlu Peninjauan" | "Menunggu Input Nilai" =
        !sudahInput
          ? "Menunggu Input Nilai"
          : enrich?.statusKesesuaian ??
            (pct && pct >= 80 ? "Sesuai" : pct && pct >= 65 ? "Perlu Penyesuaian" : "Perlu Peninjauan");
      const tren: "naik" | "stabil" | "menurun" | null =
        sudahInput
          ? enrich !== undefined
            ? (enrich.trenNilaiMapel ?? null)
            : (student.trenNilaiMapel ?? null)
          : null;

      const paket4 = enrich?.paket4Mapel || student.paket4Mapel || [];
      const mapelUtama = paket4.length > 0
        ? paket4.join(", ")
        : enrich?.mapelPilihanUtama || student.mapelPilihanUtama || "Belum Ada Rekomendasi";

      return {
        ...student,
        mapelPilihanUtama: mapelUtama,
        paket4Mapel: paket4,
        nilaiMapelPilihan: nilaiMapel,
        sudahInputNilai: sudahInput,
        semesterAktif: enrich?.semesterAktif ?? student.semesterAktif ?? 3,
        daftarSemesterTerisi: enrich?.daftarSemesterTerisi ?? student.daftarSemesterTerisi ?? [],
        trenNilaiMapel: tren,
        persentaseKeberhasilan: pct ?? undefined,
        statusKesesuaian: status,
        detailNilai4Mapel: enrich?.detailNilai4Mapel || student.detailNilai4Mapel || [],
      };
    });
  }, [propStudents, backendEnrichment]);

  const [filterState, setFilterState] = useState({
    search: "",
    mapel: "Semua Mapel Peminatan",
    statusKeberhasilan: "Semua Status Keberhasilan",
    kelas: "Semua Kelas",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const kelasOptions = useMemo(() => {
    const dynamicKelas = Array.from(
      new Set(baseStudents.map((s) => s.kelas).filter((k) => k && k !== "-"))
    ).sort();
    return dynamicKelas.length > 0 ? ["Semua Kelas", ...dynamicKelas] : DEFAULT_KELAS_OPTIONS;
  }, [baseStudents]);

  const mapelOptions = useMemo(() => {
    const dynamicMapel = Array.from(
      new Set(
        baseStudents
          .flatMap((s) => (s.paket4Mapel && s.paket4Mapel.length > 0 ? s.paket4Mapel : (s.mapelPilihanUtama ? s.mapelPilihanUtama.split(", ") : [])))
          .filter((m): m is string => Boolean(m && m !== "Belum Ada Rekomendasi" && m !== "Mata Pelajaran Pilihan Terpilih"))
      )
    ).sort();
    return dynamicMapel.length > 0
      ? ["Semua Mapel Peminatan", ...dynamicMapel]
      : DEFAULT_MAPEL_OPTIONS;
  }, [baseStudents]);

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
        (student.mapelPilihanUtama || "").includes(filterState.mapel) ||
        (student.paket4Mapel || []).includes(filterState.mapel);

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
      if (s.sudahInputNilai && s.statusKesesuaian !== "Sesuai") perluAtensi++;
      if (s.sudahInputNilai && s.trenNilaiMapel === "menurun") menurun++;
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
    <div className="w-full bg-white border border-purple-100 rounded-2xl p-5 sm:p-7 font-sans space-y-6 shadow-sm">
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

      {/* Pemilih Semester (Sama persis dengan tampilan Siswa) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-purple-200/90 shadow-2xs self-start md:self-auto">
          <span className="text-[11px] font-bold text-slate-500 px-2 hidden sm:inline">Pilih Semester:</span>
          {[3, 4, 5, 6].map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => {
                setSelectedSemesterFilter(sem);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSemesterFilter === sem
                  ? "bg-[#5F089E] text-white shadow-xs scale-102"
                  : "text-slate-600 hover:text-[#5F089E] hover:bg-purple-50"
              }`}
            >
              Semester {sem}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Menampilkan data: <strong className="text-[#5F089E]">Semester {selectedSemesterFilter}</strong>
          </span>
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
            {mapelOptions.map((opt) => (
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
            {kelasOptions.map((opt) => (
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
                    <td className="py-3.5 px-3 text-sm font-medium text-slate-600 whitespace-nowrap">
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
                    <td className="py-3.5 px-3 text-sm text-slate-800 max-w-[260px]">
                      <span className="font-medium text-xs sm:text-sm leading-snug line-clamp-2" title={student.mapelPilihanUtama}>
                        {student.mapelPilihanUtama}
                      </span>
                    </td>

                    {/* NILAI & PERKEMBANGAN MAPEL */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {student.sudahInputNilai && typeof student.nilaiMapelPilihan === "number" && student.nilaiMapelPilihan > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentForScoreModal(student);
                            }}
                            title={`Klik untuk melihat rincian 4 nilai mata pelajaran pilihan siswa`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#5F089E] border border-purple-200 hover:border-purple-300 transition-all hover:scale-105 cursor-pointer group/score shadow-2xs"
                          >
                            <span className="text-sm font-bold">
                              {student.nilaiMapelPilihan}
                            </span>
                            <Eye className="w-3.5 h-3.5 text-purple-600 group-hover/score:text-[#5F089E]" />
                          </button>

                          {/* Tren hanya ditampilkan di semester berikutnya (Semester >= 4) */}
                          {(selectedSemesterFilter >= 4 && (student.semesterAktif ?? 3) >= 4) && (
                            <>
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
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentForScoreModal(student);
                          }}
                          title="Nilai belum divalidasi oleh wali kelas. Klik untuk melihat rincian."
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200 transition-colors cursor-pointer text-xs"
                        >
                          <span className="font-bold">-</span>
                          <Eye className="w-3 h-3 text-slate-400" />
                        </button>
                      )}
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

          {(() => {
            const pages: (number | "ellipsis")[] = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else if (currentPage <= 3) {
              pages.push(1, 2, 3, "ellipsis", totalPages);
            } else if (currentPage >= totalPages - 2) {
              pages.push(1, "ellipsis", totalPages - 2, totalPages - 1, totalPages);
            } else {
              pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
            }

            return pages.map((page, idx) => {
              if (page === "ellipsis") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-sm text-slate-400">
                    &hellip;
                  </span>
                );
              }
              return (
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
              );
            });
          })()}

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

      {/* Pop-up Modal: Rincian 4 Nilai Mapel Pilihan Hasil Validasi Wali Kelas */}
      {selectedStudentForScoreModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedStudentForScoreModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-purple-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#5F089E] p-4 text-white flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold leading-snug">Rincian 4 Nilai Mapel Pilihan</h4>
                <p className="text-xs text-purple-200 mt-0.5">
                  {selectedStudentForScoreModal.nama} • Kelas {selectedStudentForScoreModal.kelas} • NISN: {selectedStudentForScoreModal.nisn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForScoreModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 ml-2"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5">
              {/* Summary Stats: Rata-rata 4 Mapel */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                  Rata-rata 4 Mapel Rekomendasi
                </span>
                <div className="flex items-baseline gap-1">
                  {selectedStudentForScoreModal.sudahInputNilai &&
                  typeof selectedStudentForScoreModal.nilaiMapelPilihan === "number" &&
                  selectedStudentForScoreModal.nilaiMapelPilihan > 0 ? (
                    <>
                      <span className="text-2xl font-black text-[#5F089E]">
                        {selectedStudentForScoreModal.nilaiMapelPilihan}
                      </span>
                      <span className="text-xs text-purple-600 font-semibold">/ 100</span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 italic">
                      Kosong (Menunggu Input Siswa)
                    </span>
                  )}
                </div>
              </div>

              {/* List of 4 Elective Subjects */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#5F089E]" />
                    Daftar 4 Mata Pelajaran Rekomendasi
                  </h5>
                  <span className="text-[11px] font-bold text-[#5F089E] bg-purple-100/80 px-2 py-0.5 rounded-full border border-purple-200">
                    Semester {selectedStudentForScoreModal.semesterAktif || 3}
                  </span>
                </div>

                <div className="space-y-2">
                  {(() => {
                    const rawList = selectedStudentForScoreModal.detailNilai4Mapel;
                    const fallbackNames =
                      selectedStudentForScoreModal.paket4Mapel && selectedStudentForScoreModal.paket4Mapel.length > 0
                        ? selectedStudentForScoreModal.paket4Mapel
                        : selectedStudentForScoreModal.mapelPilihanUtama &&
                          selectedStudentForScoreModal.mapelPilihanUtama !== "Belum Ada Rekomendasi" &&
                          selectedStudentForScoreModal.mapelPilihanUtama !== "Mata Pelajaran Pilihan Terpilih"
                        ? selectedStudentForScoreModal.mapelPilihanUtama.split(", ").filter(Boolean)
                        : [];

                    const list =
                      rawList && rawList.length > 0
                        ? rawList
                        : fallbackNames.map((name, idx) => ({
                            urutan: idx + 1,
                            namaMapel: name,
                            nilai: null,
                            labelValidasi: "Menunggu Input Siswa",
                            sudahDiinput: false,
                          }));

                    return list.map((item, idx) => {
                      const adaNilai = item.nilai !== null && item.nilai !== undefined && item.sudahDiinput;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-purple-50/40 border border-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5F089E] font-bold text-xs flex items-center justify-center shrink-0">
                              {item.urutan ?? idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 leading-snug">
                                {item.namaMapel}
                              </p>
                              {adaNilai ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  {item.labelValidasi || "Tervalidasi Rapor Fisik"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                  {item.labelValidasi || "Menunggu Validasi Wali Kelas"}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            {adaNilai ? (
                              <>
                                <span className="text-base font-bold text-slate-900">
                                  {item.nilai}
                                </span>
                                <span className="text-[11px] text-slate-400 block -mt-0.5">/ 100</span>
                              </>
                            ) : (
                              <span className="text-sm text-slate-400 font-semibold">
                                -
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedStudentForScoreModal(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = selectedStudentForScoreModal;
                  setSelectedStudentForScoreModal(null);
                  onSelectStudentFeedback?.(s);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#5F089E] hover:bg-[#4d0680] text-white transition-colors shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Beri Catatan Feedback</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminB1FeedbackTable;
