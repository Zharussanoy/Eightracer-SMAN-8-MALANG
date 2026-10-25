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
} from "lucide-react";
import { AlumniItem, AdminRole } from "@/components/admin/types";

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
  const [filterKampus, setFilterKampus] = useState("SEMUA");
  const [filterJalur, setFilterJalur] = useState("SEMUA");
  const [filterKipk, setFilterKipk] = useState("SEMUA");

  const filteredAlumni = useMemo(() => {
    return alumniList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nisn.includes(searchQuery) ||
        item.jurusan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKampus =
        filterKampus === "SEMUA" || item.kampusKode === filterKampus;
      const matchJalur = filterJalur === "SEMUA" || item.jalur === filterJalur;
      const matchKipk =
        filterKipk === "SEMUA" ||
        (filterKipk === "KIPK" && item.isKipk) ||
        (filterKipk === "REGULER" && !item.isKipk);

      return matchSearch && matchKampus && matchJalur && matchKipk;
    });
  }, [alumniList, searchQuery, filterKampus, filterJalur, filterKipk]);

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Data Alumni
            </h2>
          </div>
          <p className="text-sm text-slate-500 font-normal">
            Database data kelulusan &amp; sebaran alumni SMAN 8 Malang
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
              onClick={() => alert("Mengunduh laporan PDF...")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-300/80 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Export PDF</span>
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

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900">
              {alumniList.length} Alumni Terdaftar
            </span>
            {role === "admin" && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5F089E] font-bold border border-purple-200/70">
                {selectedIds.length} data terpilih untuk aksi massal
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NISN, atau jurusan..."
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

          <div>
            <select
              value={filterKampus}
              onChange={(e) => setFilterKampus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#5F089E]/20 focus:border-[#5F089E] transition-all cursor-pointer"
            >
              <option value="SEMUA">Pilih Perguruan Tinggi (Semua)</option>
              <option value="UB">Universitas Brawijaya (UB)</option>
              <option value="ITB">ITB Bandung</option>
              <option value="UGM">Universitas Gadjah Mada (UGM)</option>
              <option value="UM">Universitas Negeri Malang (UM)</option>
              <option value="ITS">ITS Surabaya</option>
              <option value="UNAIR">Universitas Airlangga (UNAIR)</option>
              <option value="UI">Universitas Indonesia (UI)</option>
              <option value="UNDIP">Universitas Diponegoro (UNDIP)</option>
            </select>
          </div>

          <div>
            <select
              value={filterJalur}
              onChange={(e) => setFilterJalur(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#5F089E]/20 focus:border-[#5F089E] transition-all cursor-pointer"
            >
              <option value="SEMUA">Jalur Masuk (Semua Jalur)</option>
              <option value="SNBP">SNBP (Prestasi)</option>
              <option value="SNBT">SNBT (Tes)</option>
              <option value="Mandiri">Mandiri / Swasta</option>
            </select>
          </div>

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

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Mobile Selection Header */}
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
              <span>Pilih Semua Data ({selectedIds.length}/{filteredAlumni.length})</span>
            </label>
          </div>
        )}

        {/* Mobile Cards List (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredAlumni.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium text-xs px-4">
              Tidak ada data alumni yang cocok dengan pencarian / filter.
            </div>
          ) : (
            filteredAlumni.map((alumni) => {
              const isSelected = selectedIds.includes(alumni.id);
              return (
                <div
                  key={alumni.id}
                  className={`p-4 transition-colors space-y-3 ${
                    role === "admin" && isSelected ? "bg-purple-50/40" : "hover:bg-slate-50/60"
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
                        <span className="font-mono text-[11px] font-semibold text-slate-500 block">
                          {alumni.nisn}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {alumni.nama}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-100">
                        {alumni.angkatan}
                      </span>
                      {role === "admin" && (
                        <div className="flex items-center gap-0.5 ml-1">
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
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-[#5F089E] text-[10px] font-bold">
                        {alumni.kampusKode}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">
                        {alumni.kampus}
                      </span>
                    </div>
                    <div className="text-slate-600 font-medium pl-0.5">
                      Prodi: <span className="text-slate-900 font-semibold">{alumni.jurusan}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          alumni.jalur === "SNBP"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : alumni.jalur === "SNBT"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {alumni.jalur}
                      </span>

                      {alumni.isKipk ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          KIP-K
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium">
                          Reguler
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-600">
                        Nilai: <strong className="text-slate-900 text-xs font-bold">{alumni.nilai}</strong>
                      </span>

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
                        <span className="text-[10px] text-slate-400 font-medium">0 Berkas</span>
                      )}
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
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                {role === "admin" && (
                  <th className="py-3.5 px-4 w-12 text-center">
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
                <th className="py-3.5 px-4">NISN</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Perguruan Tinggi</th>
                <th className="py-3.5 px-4">Jurusan / Prodi</th>
                <th className="py-3.5 px-4">Jalur Masuk</th>
                <th className="py-3.5 px-4">Nilai</th>
                <th className="py-3.5 px-4">Sertifikat</th>
                <th className="py-3.5 px-4">KIP-K</th>
                {role === "admin" && (
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAlumni.length === 0 ? (
                <tr>
                  <td
                    colSpan={role === "admin" ? 10 : 8}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    Tidak ada data alumni yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredAlumni.map((alumni) => {
                  const isSelected = selectedIds.includes(alumni.id);
                  return (
                    <tr
                      key={alumni.id}
                      className={`hover:bg-purple-50/40 transition-colors ${role === "admin" && isSelected ? "bg-purple-50/30" : ""
                        }`}
                    >
                      {role === "admin" && (
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(alumni.id)}
                            className="w-4 h-4 rounded-sm border-slate-300 text-[#5F089E] focus:ring-[#5F089E] cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-3 px-4 font-mono text-slate-500 font-semibold">
                        {alumni.nisn}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {alumni.nama}
                          </span>
                          <span className="text-[10px] text-purple-700 font-semibold">
                            {alumni.angkatan}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#5F089E] border border-purple-200 text-[10px] font-bold">
                            {alumni.kampusKode}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {alumni.kampus}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {alumni.jurusan}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${alumni.jalur === "SNBP"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : alumni.jalur === "SNBT"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                        >
                          {alumni.jalur}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {alumni.nilai}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-slate-400" />
                            {alumni.sertifikat ? alumni.sertifikat.length : 0} Berkas
                          </span>

                          {alumni.sertifikat && alumni.sertifikat.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setViewCertAlumni(alumni)}
                              className="p-1 rounded-md text-slate-400 hover:text-[#5F089E] hover:bg-purple-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {alumni.isKipk ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Penerima KIP-K
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium">
                            Reguler
                          </span>
                        )}
                      </td>

                      {role === "admin" && (
                        <td className="py-3 px-4 text-center">
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

        <div className="px-4 py-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Menampilkan 1–{filteredAlumni.length} dari {alumniList.length} data
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
      {viewCertAlumni && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2 text-[#5F089E]">
                <Award className="w-4 h-4" />
                <h3 className="font-bold text-sm">Daftar Berkas Sertifikat</h3>
              </div>
              <button onClick={() => setViewCertAlumni(null)} className="text-slate-400 hover:bg-slate-200 rounded-lg p-1.5 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2">
              <span className="text-xs text-slate-500 mb-1 block">
                Milik: <strong className="text-slate-800">{viewCertAlumni.nama}</strong>
              </span>
              {viewCertAlumni.sertifikat?.map((cert, idx) => (
                <div key={idx} className="text-xs font-medium text-slate-700 bg-purple-50/50 px-3 py-2.5 rounded-xl border border-purple-100 flex items-start gap-2">
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
