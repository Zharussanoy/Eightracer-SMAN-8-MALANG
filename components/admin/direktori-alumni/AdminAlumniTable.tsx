"use client";

import { useState, useMemo } from "react";
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
  MessageCircle,
} from "lucide-react";
import { AlumniItem, AdminRole, KategoriPerguruanTinggi } from "./types";
import { exportToPDF } from "@/utils/exportToPdf";

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

  // Filter States
  const [filterKategoriPt, setFilterKategoriPt] = useState<string>("SEMUA");
  const [filterKampus, setFilterKampus] = useState("SEMUA");
  const [filterJalur, setFilterJalur] = useState("SEMUA");
  const [filterKipk, setFilterKipk] = useState("SEMUA");
  const [isExporting, setIsExporting] = useState(false);

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

  const filteredAlumni = useMemo(() => {
    return alumniList.filter((item) => {
      // 1. Pencarian
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nisn.includes(searchQuery) ||
        item.jurusan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kampus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.kelas && item.kelas.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Filter Kategori Perguruan Tinggi (Negeri, Swasta, Kedinasan, Luar Negeri)
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

      // 3. Filter Kampus Spesifik
      const matchKampus =
        filterKampus === "SEMUA" || item.kampusKode === filterKampus;

      // 4. Filter Jalur Masuk
      const matchJalur =
        filterJalur === "SEMUA" ||
        item.jalur.toUpperCase() === filterJalur.toUpperCase();

      // 5. Filter KIP-K
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
            Database kelulusan, persebaran kampus, nomor kontak, &amp; data tracer siswa
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
                className={`w-4 h-4 shrink-0 ${
                  isExporting ? "animate-bounce" : ""
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

        {/* 5 Filter Controls (Responsif) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Search Bar */}
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

          {/* 2. Filter Kategori Perguruan Tinggi (Negeri, Swasta, Kedinasan, Luar Negeri) */}
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

          {/* 3. Filter Kampus Spesifik */}
          <div>
            <select
              value={filterKampus}
              onChange={(e) => setFilterKampus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#5F089E]/20 focus:border-[#5F089E] transition-all cursor-pointer"
            >
              <option value="SEMUA">Pilih Kampus (Semua)</option>
              <option value="UB">Universitas Brawijaya (UB)</option>
              <option value="ITB">ITB Bandung</option>
              <option value="UGM">Universitas Gadjah Mada (UGM)</option>
              <option value="UM">Universitas Negeri Malang (UM)</option>
              <option value="ITS">ITS Surabaya</option>
              <option value="UNAIR">Universitas Airlangga (UNAIR)</option>
              <option value="UI">Universitas Indonesia (UI)</option>
              <option value="UNDIP">Universitas Diponegoro (UNDIP)</option>
              <option value="STAN">PKN STAN</option>
              <option value="TELKOM">Telkom University</option>
              <option value="NTU">Nanyang Technological Univ (NTU)</option>
            </select>
          </div>

          {/* 4. Filter Jalur Masuk (Diperbarui) */}
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

      {/* Tabel Data Alumni Sesuai Format Gambar */}
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
                  className={`p-4 transition-colors space-y-3 ${
                    role === "admin" && isSelected
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

                    {alumni.nomorWa && (
                      <div className="flex items-center gap-1 pt-0.5">
                        <span className="text-[11px] text-slate-500">WA:</span>
                        <a
                          href={`https://wa.me/${alumni.nomorWa
                            .replace(/\D/g, "")
                            .replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline text-xs"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>{alumni.nomorWa}</span>
                        </a>
                      </div>
                    )}
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
                      {alumni.sertifikat && alumni.sertifikat.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setViewCertAlumni(alumni)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-[#5F089E] hover:bg-purple-100 text-[10px] font-bold border border-purple-200 transition-colors cursor-pointer"
                        >
                          <Award className="w-3 h-3" />
                          <span>{alumni.sertifikat.length} Berkas</span>
                          <Eye className="w-3 h-3 opacity-60" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          0 Berkas
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View (>= md) Sesuai Kolom Gambar:
            NO | NAMA | KLS | PROGRAM STUDI | PERGURUAN TINGGI | NOMOR WA | KIPK | PIL | PDSS | SERTIF */}
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
                {/* 1. NO */}
                <th className="py-3.5 px-3 w-12 text-center">NO</th>

                {/* 2. NAMA */}
                <th className="py-3.5 px-4 min-w-[150px]">NAMA</th>

                {/* 3. KLS */}
                <th className="py-3.5 px-3 w-24 text-center">KLS</th>

                {/* 4. PROGRAM STUDI */}
                <th className="py-3.5 px-4 min-w-[160px]">PROGRAM STUDI</th>

                {/* 5. PERGURUAN TINGGI */}
                <th className="py-3.5 px-4 min-w-[180px]">PERGURUAN TINGGI</th>

                {/* 6. NOMOR WA */}
                <th className="py-3.5 px-3 min-w-[130px] text-center">NOMOR WA</th>

                {/* 7. KIPK */}
                <th className="py-3.5 px-3 w-20 text-center">KIPK</th>

                {/* 8. PIL */}
                <th className="py-3.5 px-3 w-14 text-center">PIL</th>

                {/* 9. PDSS */}
                <th className="py-3.5 px-3 w-20 text-center">PDSS</th>

                {/* 10. SERTIF */}
                <th className="py-3.5 px-3 w-24 text-center">SERTIF</th>

                {/* AKSI (Khusus Admin) */}
                {role === "admin" && (
                  <th className="py-3.5 px-3 w-20 text-center">AKSI</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAlumni.length === 0 ? (
                <tr>
                  <td
                    colSpan={role === "admin" ? 12 : 10}
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
                      className={`hover:bg-purple-50/40 transition-colors ${
                        role === "admin" && isSelected ? "bg-purple-50/30" : ""
                      }`}
                    >
                      {/* Checkbox Admin */}
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

                      {/* 1. NO */}
                      <td className="py-3 px-3 text-center font-bold text-slate-600 text-xs">
                        {idx + 1}
                      </td>

                      {/* 2. NAMA */}
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

                      {/* 3. KLS */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] inline-block">
                          {alumni.kelas || "XII MIPA 1"}
                        </span>
                      </td>

                      {/* 4. PROGRAM STUDI */}
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

                      {/* 5. PERGURUAN TINGGI */}
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

                      {/* 6. NOMOR WA */}
                      <td className="py-3 px-3 text-center">
                        {alumni.nomorWa ? (
                          <a
                            href={`https://wa.me/${alumni.nomorWa
                              .replace(/\D/g, "")
                              .replace(/^0/, "62")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                            title="Kirim pesan WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{alumni.nomorWa}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* 7. KIPK */}
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

                      {/* 8. PIL */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 border border-purple-200 text-[#5F089E] font-bold text-xs">
                          {alumni.pilihanKe
                            ? alumni.pilihanKe.replace(/\D/g, "") || alumni.pilihanKe
                            : "1"}
                        </span>
                      </td>

                      {/* 9. PDSS */}
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
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-700">
                            {alumni.sertifikat ? alumni.sertifikat.length : 0} Berkas
                          </span>
                          {alumni.sertifikat && alumni.sertifikat.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setViewCertAlumni(alumni)}
                              className="p-1 rounded-md text-slate-400 hover:text-[#5F089E] hover:bg-purple-100 transition-colors cursor-pointer"
                              title="Lihat Berkas Sertifikat"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* AKSI Admin */}
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
            Menampilkan 1–{filteredAlumni.length} dari {alumniList.length} total data alumni
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

      {/* Modal Detail Sertifikat */}
      {viewCertAlumni && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2 text-[#5F089E]">
                <Award className="w-4 h-4" />
                <h3 className="font-bold text-sm">Daftar Berkas Sertifikat</h3>
              </div>
              <button
                onClick={() => setViewCertAlumni(null)}
                className="text-slate-400 hover:bg-slate-200 rounded-lg p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2">
              <span className="text-xs text-slate-500 mb-1 block">
                Milik:{" "}
                <strong className="text-slate-800">
                  {viewCertAlumni.nama}
                </strong>{" "}
                ({viewCertAlumni.kelas || "XII"})
              </span>
              {viewCertAlumni.sertifikat?.map((cert, idx) => (
                <div
                  key={idx}
                  className="text-xs font-medium text-slate-700 bg-purple-50/50 px-3 py-2.5 rounded-xl border border-purple-100 flex items-start gap-2"
                >
                  <span className="text-[#5F089E] font-bold">{idx + 1}.</span>
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
