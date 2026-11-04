"use client";

import { useState, useMemo, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  X,
  Award,
  Eye,
  CheckCircle2,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AlumniItem, AdminRole, KategoriPerguruanTinggi } from "./types";
import { exportToPDF } from "@/utils/exportToPdf";
import { apiFetch } from "@/lib/api";
import { ApiAlumni } from "@/lib/alumni";
import SearchableSelect, { Option } from "./SearchableSelect";

interface AdminAlumniTableProps {
  role: AdminRole;
  alumniList: AlumniItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (alumni: AlumniItem) => void;
  onOpenImportModal: () => void;
  onDeleteRow: (id: string) => void;
}

export default function AdminAlumniTable({
  role,
  alumniList,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onOpenAddModal,
  onOpenEditModal,
  onOpenImportModal,
  onDeleteRow,
}: AdminAlumniTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewCertAlumni, setViewCertAlumni] = useState<AlumniItem | null>(null);
  const [detailAlumni, setDetailAlumni] = useState<ApiAlumni | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!viewCertAlumni) {
      setDetailAlumni(null);
      return;
    }
    setIsLoadingDetail(true);
    setErrorDetail(null);
    apiFetch<ApiAlumni>(`/alumni/${viewCertAlumni.id}`)
      .then((res) => setDetailAlumni(res))
      .catch((err) => setErrorDetail(err.message))
      .finally(() => setIsLoadingDetail(false));
  }, [viewCertAlumni]);
  // Filter States
  const [filterKategoriPt, setFilterKategoriPt] = useState<string>("SEMUA");
  const [filterKampus, setFilterKampus] = useState("SEMUA");
  const [filterJalur, setFilterJalur] = useState("SEMUA");
  const [filterKipk, setFilterKipk] = useState("SEMUA");
  const [isExporting, setIsExporting] = useState(false);

  // 1. Ekstrak Opsi Kampus Dinamis dari alumniList
  const kampusOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();

    alumniList.forEach((item) => {
      if (item.kampusKode && item.kampus) {
        map.set(item.kampusKode, `${item.kampus} (${item.kampusKode})`);
      }
    });

    const dynamicOptions: Option[] = Array.from(map.entries()).map(
      ([kode, nama]) => ({
        value: kode,
        label: nama,
      })
    );

    dynamicOptions.sort((a, b) => a.label.localeCompare(b.label));

    return [{ value: "SEMUA", label: "Pilih Kampus (Semua)" }, ...dynamicOptions];
  }, [alumniList]);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportToPDF(
        filteredAlumni,
        filterJalur,
        "2025/2026",
        filterKategoriPt
      );
    } catch (err) {
      console.error("Gagal export PDF:", err);
      alert("Gagal mengunduh laporan PDF. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Logika Pemfilteran Data Alumni
  const filteredAlumni = useMemo(() => {
    return alumniList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nisn.includes(searchQuery) ||
        item.jurusan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kampus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.kelas && item.kelas.toLowerCase().includes(searchQuery.toLowerCase()));

      const itemKategori: KategoriPerguruanTinggi =
        item.jenisKampus ||
        (item.kampusKode === "STAN"
          ? "Kedinasan"
          : item.kampusKode === "TELKOM"
            ? "Swasta"
            : item.kampusKode === "NTU"
              ? "Luar Negeri"
              : "Negeri");

      const matchKategoriPt =
        filterKategoriPt === "SEMUA" || itemKategori === filterKategoriPt;

      const matchKampus =
        filterKampus === "SEMUA" || item.kampusKode === filterKampus;

      const matchJalur =
        filterJalur === "SEMUA" ||
        item.jalur.toUpperCase() === filterJalur.toUpperCase();

      const matchKipk =
        filterKipk === "SEMUA" ||
        (filterKipk === "KIPK" && item.isKipk) ||
        (filterKipk === "REGULER" && !item.isKipk);

      return (
        matchSearch &&
        matchKategoriPt &&
        matchKampus &&
        matchJalur &&
        matchKipk
      );
    });
  }, [
    alumniList,
    searchQuery,
    filterKategoriPt,
    filterKampus,
    filterJalur,
    filterKipk,
  ]);

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Data Alumni
            </h2>
          </div>
          <p className="text-sm text-slate-500 font-normal">
            Database kelulusan, persebaran kampus, nilai kelulusan, &amp; data tracer siswa
          </p>
        </div>

        {role === "admin" && (
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenImportModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300/80 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Import CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-300/80 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Download
                className={`w-4 h-4 shrink-0 ${isExporting ? "animate-bounce" : ""
                  }`}
              />
              <span>{isExporting ? "Mengekspor..." : "Export PDF"}</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="col-span-2 sm:col-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5F089E] text-white hover:bg-[#4D0680] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tambah Data Alumni</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900">
              {filteredAlumni.length} Alumni Ditemukan
            </span>
            <span className="text-xs text-slate-400">
              (Total: {alumniList.length})
            </span>
            {role === "admin" && selectedIds.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5F089E] font-bold border border-purple-200/70">
                {selectedIds.length} data terpilih
              </span>
            )}
          </div>
        </div>

        {/* 5 Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Search Bar Utama */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NISN, kls, prodi..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#5F089E]/20 focus:border-[#5F089E] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Filter Kategori PT */}
          <div>
            <select
              value={filterKategoriPt}
              onChange={(e) => setFilterKategoriPt(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#5F089E]/20 focus:border-[#5F089E] transition-all cursor-pointer"
            >
              <option value="SEMUA">Kategori PT (Semua)</option>
              <option value="Negeri">Negeri (PTN)</option>
              <option value="Swasta">Swasta (PTS)</option>
              <option value="Kedinasan">Kedinasan (PTK)</option>
              <option value="Luar Negeri">Luar Negeri (PTLN)</option>
            </select>
          </div>

          {/* 3. Filter Kampus (Searchable Dropdown Dinamis) */}
          <div>
            <SearchableSelect
              options={kampusOptions}
              value={filterKampus}
              onChange={(val) => setFilterKampus(val)}
              placeholder="Pilih Kampus (Semua)"
            />
          </div>

          {/* 4. Filter Jalur Masuk */}
          <div>
            <select
              value={filterJalur}
              onChange={(e) => setFilterJalur(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#5F089E]/20 focus:border-[#5F089E] transition-all cursor-pointer"
            >
              <option value="SEMUA">Jalur Masuk (Semua Jalur)</option>
              <option value="SNBP">SNBP (Prestasi)</option>
              <option value="SNBT">SNBT (Tes UTBK)</option>
              <option value="Mandiri">Mandiri / Swasta</option>
              <option value="Kedinasan">Kedinasan (Ikatan Dinas)</option>
              <option value="SPAN-PTKIN">SPAN-PTKIN (Keagamaan)</option>
              <option value="Luar Negeri">Luar Negeri (International)</option>
            </select>
          </div>

          {/* 5. Filter KIP-K */}
          <div>
            <select
              value={filterKipk}
              onChange={(e) => setFilterKipk(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#5F089E]/20 focus:border-[#5F089E] transition-all cursor-pointer"
            >
              <option value="SEMUA">Status KIP-K (Semua)</option>
              <option value="KIPK">Penerima KIP-K</option>
              <option value="REGULER">Reguler / Non KIP-K</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Data Alumni */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Mobile Header Selection */}
        {role === "admin" && filteredAlumni.length > 0 && (
          <div className="md:hidden flex items-center justify-between p-3.5 bg-slate-50 border-b border-slate-200 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={
                  filteredAlumni.length > 0 &&
                  selectedIds.length === filteredAlumni.length
                }
                onChange={onSelectAll}
                className="w-4 h-4 rounded-sm border-slate-300 text-[#5F089E] focus:ring-[#5F089E] cursor-pointer"
              />
              <span>Pilih Semua Data ({filteredAlumni.length})</span>
            </label>
          </div>
        )}

        {/* Mobile View (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredAlumni.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium text-xs px-4">
              Tidak ada data alumni yang cocok dengan pencarian / filter.
            </div>
          ) : (
            filteredAlumni.map((alumni, idx) => {
              const isSelected = selectedIds.includes(alumni.id);
              return (
                <div
                  key={alumni.id}
                  className={`p-4 transition-colors space-y-3 ${role === "admin" && isSelected
                    ? "bg-purple-50/40"
                    : "hover:bg-slate-50/60"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {role === "admin" && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(alumni.id)}
                          className="w-4 h-4 rounded-sm border-slate-300 text-[#5F089E] focus:ring-[#5F089E] cursor-pointer mt-0.5"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {alumni.nama}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                            {alumni.kelas || "XII"}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            NISN: {alumni.nisn}
                          </span>
                        </div>
                      </div>
                    </div>

                    {role === "admin" && (
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(alumni)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#5F089E] hover:bg-purple-100 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRow(alumni.id)}
                          title="Hapus"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-[#5F089E] text-[10px] font-bold shrink-0">
                          {alumni.kampusKode}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          {alumni.kampus}
                        </span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold shrink-0">
                        {alumni.jenisKampus || "Negeri"}
                      </span>
                    </div>

                    <div className="text-slate-600 font-medium">
                      Prodi:{" "}
                      <span className="text-slate-900 font-semibold">
                        {alumni.jurusan}
                      </span>
                    </div>

                    {/* Menampilkan Nilai di Mobile View */}
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-[11px] text-slate-500">Nilai:</span>
                      <span className="text-xs font-bold text-slate-900">
                        {alumni.nilai ?? "-"}
                      </span>
                    </div>
                  </div>

                  {/* Badges: KIPK, PIL, PDSS, SERTIF */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200 text-[10px]">
                        Pil {alumni.pilihanKe ? alumni.pilihanKe.replace(/\D/g, "") || alumni.pilihanKe : "1"}
                      </span>

                      {alumni.statusPdss === "Eligible" || alumni.statusPdss === "Ya" ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px]">
                          PDSS: Eligible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium border border-slate-200 text-[10px]">
                          Non-PDSS
                        </span>
                      )}

                      {alumni.isKipk ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          KIP-K
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium">
                          Reguler
                        </span>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setViewCertAlumni(alumni)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-[#5F089E] hover:bg-purple-100 text-[10px] font-bold border border-purple-200 transition-colors cursor-pointer"
                      >
                        <Award className="w-3 h-3" />
                        <span>{alumni.sertifikat?.length || 0} Berkas</span>
                        <Eye className="w-3 h-3 opacity-60" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider text-[11px]">
                {role === "admin" && (
                  <th className="py-3.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredAlumni.length > 0 &&
                        selectedIds.length === filteredAlumni.length
                      }
                      onChange={onSelectAll}
                      className="w-4 h-4 rounded-sm border-slate-300 text-[#5F089E] focus:ring-[#5F089E] cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-3.5 px-3 w-12 text-center">NO</th>
                <th className="py-3.5 px-4 min-w-[150px]">NAMA</th>
                <th className="py-3.5 px-3 w-24 text-center">KLS</th>
                <th className="py-3.5 px-4 min-w-[160px]">PROGRAM STUDI</th>
                <th className="py-3.5 px-4 min-w-[180px]">PERGURUAN TINGGI</th>

                {/* Kolom NILAI */}
                <th className="py-3.5 px-3 w-24 text-center">NILAI</th>

                <th className="py-3.5 px-3 w-20 text-center">KIPK</th>
                <th className="py-3.5 px-3 w-14 text-center">PIL</th>
                <th className="py-3.5 px-3 w-20 text-center">PDSS</th>
                <th className="py-3.5 px-3 w-24 text-center">SERTIF</th>

                {role === "admin" && (
                  <th className="py-3.5 px-3 w-20 text-center">AKSI</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAlumni.length === 0 ? (
                <tr>
                  <td
                    colSpan={role === "admin" ? 12 : 11}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    Tidak ada data alumni yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredAlumni.map((alumni, idx) => {
                  const isSelected = selectedIds.includes(alumni.id);
                  return (
                    <tr
                      key={alumni.id}
                      className={`hover:bg-purple-50/40 transition-colors ${role === "admin" && isSelected ? "bg-purple-50/30" : ""
                        }`}
                    >
                      {role === "admin" && (
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(alumni.id)}
                            className="w-4 h-4 rounded-sm border-slate-300 text-[#5F089E] focus:ring-[#5F089E] cursor-pointer"
                          />
                        </td>
                      )}

                      <td className="py-3 px-3 text-center font-bold text-slate-600 text-xs">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-xs">
                            {alumni.nama}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {alumni.nisn}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] inline-block">
                          {alumni.kelas || "XII MIPA 1"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">
                            {alumni.jurusan}
                          </span>
                          <span className="text-[10px] text-purple-600 font-medium">
                            {alumni.jenjang || "S1"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-[#5F089E] border border-purple-200 text-[10px] font-bold">
                              {alumni.kampusKode}
                            </span>
                            <span className="font-semibold text-slate-800 text-xs">
                              {alumni.kampus}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-medium text-slate-500">
                              {alumni.jenisKampus || "Negeri"}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-bold text-purple-600">
                              {alumni.jalur}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Isi Kolom NILAI */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-slate-800 text-xs">
                          {alumni.nilai ?? "-"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {alumni.isKipk ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            Ya
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium">
                            Tidak
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 border border-purple-200 text-[#5F089E] font-bold text-xs">
                          {alumni.pilihanKe
                            ? alumni.pilihanKe.replace(/\D/g, "") || alumni.pilihanKe
                            : "1"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {alumni.statusPdss === "Eligible" ||
                          alumni.statusPdss === "Ya" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                            Eligible
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-medium">
                            Tidak
                          </span>
                        )}
                      </td>

                      {/* 10. SERTIF */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setViewCertAlumni(alumni)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-[#5F089E] hover:bg-purple-100 text-[10px] font-bold border border-purple-200 transition-colors cursor-pointer"
                        >
                          <span>{alumni.sertifikat?.length || 0} Berkas</span>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {role === "admin" && (
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenEditModal(alumni)}
                              title="Edit Data Alumni"
                              className="p-1 rounded-lg text-slate-400 hover:text-[#5F089E] hover:bg-purple-100 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteRow(alumni.id)}
                              title="Hapus"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-4 py-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Menampilkan{filteredAlumni.length} dari {alumniList.length} total data alumni
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-40"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-[#5F089E] text-white font-bold text-xs flex items-center justify-center shadow-2xs"
            >
              1
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center transition-colors"
            >
              2
            </button>
            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Alumni */}
      {viewCertAlumni && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2 text-[#5F089E]">
                <Award className="w-4 h-4" />
                <h3 className="font-bold text-sm">Detail Alumni</h3>
              </div>
              <button
                onClick={() => setViewCertAlumni(null)}
                className="text-slate-400 hover:bg-slate-200 rounded-lg p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="p-8 text-center text-sm text-slate-500">Memuat detail...</div>
            ) : errorDetail ? (
              <div className="p-8 text-center text-sm text-red-500">{errorDetail}</div>
            ) : detailAlumni ? (
              <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Nama</span>
                    <span className="font-bold text-slate-800">{detailAlumni.nama}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Tahun Lulus</span>
                    <span className="font-semibold text-slate-800">{detailAlumni.tahun_lulus ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Universitas</span>
                    <span className="font-semibold text-slate-800">{detailAlumni.univ ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Program Studi</span>
                    <span className="font-semibold text-slate-800">{detailAlumni.prodi ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Jenjang</span>
                    <span className="font-semibold text-slate-800">{detailAlumni.strata ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Jalur Masuk</span>
                    <span className="font-semibold text-slate-800">{detailAlumni.jalur_masuk ?? "-"}</span>
                  </div>
                  {detailAlumni.sub_jalur && (
                    <div className="col-span-2">
                      <span className="text-[11px] text-slate-500 block">Sub Jalur</span>
                      <span className="font-semibold text-slate-800">{detailAlumni.sub_jalur}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] text-slate-500 block">Pilihan Ke-</span>
                    <span className="font-semibold text-slate-800">{detailAlumni.pilihan_ke ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Status Penerimaan</span>
                    <span className="font-semibold text-slate-800">{detailAlumni.status_penerimaan ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Nilai Rapor</span>
                    <span className="font-semibold text-slate-800">{detailAlumni.nilai_rapor ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Skor UTBK</span>
                    <span className="font-semibold text-slate-800">{detailAlumni.skor_utbk ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">KIP-K</span>
                    <span className="font-semibold text-slate-800">{detailAlumni.is_kipk ? "Ya" : "Tidak"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 block mb-2">Sertifikat</span>
                  {detailAlumni.sertifikat && detailAlumni.sertifikat.length > 0 ? (
                    <div className="space-y-2">
                      {detailAlumni.sertifikat.map((cert, idx) => (
                        <div key={idx} className="text-xs font-medium text-slate-700 bg-purple-50/50 px-3 py-2.5 rounded-xl border border-purple-100 flex items-start gap-2">
                          <span className="text-[#5F089E] font-bold">{idx + 1}.</span>
                          <span>
                            {cert.nama_kompetisi ?? "-"}
                            {cert.tingkat && ` (${cert.tingkat})`}
                            {cert.peringkat && ` - ${cert.peringkat}`}
                            {cert.tahun && ` - ${cert.tahun}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Tidak ada sertifikat</span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}