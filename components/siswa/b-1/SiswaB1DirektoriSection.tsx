"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  RotateCcw,
  ExternalLink,
  Mail,
  Building2,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  School,
  CheckCircle2,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  BookmarkCheck,
  IdCard,
} from "lucide-react";
import { DirektoriSiswaItem } from "./types";
import { MOCK_DIREKTORI_SISWA } from "./mockData";
import { SiswaB1StudentDetailModal } from "./SiswaB1StudentDetailModal";

const ALPHABET_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface SiswaB1DirektoriSectionProps {
  onShowToast: (msg: string) => void;
}

export const SiswaB1DirektoriSection: React.FC<SiswaB1DirektoriSectionProps> = ({
  onShowToast,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState("Angkatan 2023 (Fase F - Kelas XI)");
  const [selectedKelas, setSelectedKelas] = useState("Semua Rombel & Kelas");
  const [selectedPeminatan, setSelectedPeminatan] = useState("Semua Peminatan");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Pagination & Modal State
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudentForModal, setSelectedStudentForModal] =
    useState<DirektoriSiswaItem | null>(null);

  // Filter Logic
  const filteredStudents = useMemo(() => {
    return MOCK_DIREKTORI_SISWA.filter((student) => {
      // 1. Text Search (Nama or NISN)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = student.nama.toLowerCase().includes(query);
        const matchNisn = student.nisn.includes(query);
        if (!matchName && !matchNisn) return false;
      }

      // 2. Filter Angkatan
      if (selectedAngkatan !== "Semua Angkatan") {
        if (!student.angkatan.toLowerCase().includes(selectedAngkatan.toLowerCase())) {
          return false;
        }
      }

      // 3. Filter Kelas / Rombel
      if (selectedKelas !== "Semua Rombel & Kelas") {
        if (!student.kelas.toLowerCase().includes(selectedKelas.toLowerCase())) {
          return false;
        }
      }

      // 4. Filter Peminatan
      if (selectedPeminatan !== "Semua Peminatan") {
        if (!student.rumpunPeminatan.toLowerCase().includes(selectedPeminatan.toLowerCase())) {
          return false;
        }
      }

      // 5. Quick Letter Filter
      if (activeLetter) {
        if (!student.nama.toUpperCase().startsWith(activeLetter)) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedAngkatan, selectedKelas, selectedPeminatan, activeLetter]);

  const handleResetFilter = () => {
    setSearchQuery("");
    setSelectedAngkatan("Semua Angkatan");
    setSelectedKelas("Semua Rombel & Kelas");
    setSelectedPeminatan("Semua Peminatan");
    setActiveLetter(null);
    setCurrentPage(1);
    onShowToast("Filter direktori siswa berhasil direset.");
  };

  const handleLetterClick = (letter: string) => {
    if (activeLetter === letter) {
      setActiveLetter(null);
    } else {
      setActiveLetter(letter);
      setCurrentPage(1);
    }
  };

  const handleOpenDetail = (student: DirektoriSiswaItem) => {
    setSelectedStudentForModal(student);
  };

  // Helper untuk memecah daftar mapel menjadi pills/chips
  const getSubjectChips = (student: DirektoriSiswaItem): string[] => {
    if (student.mapelPilihanList && student.mapelPilihanList.length > 0) {
      return student.mapelPilihanList;
    }
    const clean = student.fokusPilihan.replace(/^Fokus Pilihan:\s*/i, "");
    return clean
      .split(/,\s*|\s+dan\s+/i)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  // Helper warna badge peminatan
  const getPeminatanBadgeStyle = (rumpun: string) => {
    if (rumpun.includes("Sains") || rumpun.includes("Teknologi")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (rumpun.includes("Kedokteran") || rumpun.includes("Hayati")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (rumpun.includes("Sosial") || rumpun.includes("Humaniora")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-slate-900">
      {/* ========================================================= */}
      {/* FILTER & PENCARIAN: Lapang, Nyaman Dibaca, & Terstruktur */}
      {/* ========================================================= */}
      <section className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Header Bar Pencarian dengan Statistik */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-[#5F089E] flex items-center justify-center font-bold text-xs">
              <Users className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              Pencarian &amp; Filter Profil Siswa
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#5F089E] border border-purple-200/70 self-start sm:self-auto shadow-2xs">
            <IdCard className="w-3.5 h-3.5 text-[#5F089E]" />
            <span>Total Terdata: <strong>1.042 Siswa Aktif</strong></span>
          </span>
        </div>
        {/* Search Bar Lega */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari berdasarkan Nama Siswa, NISN, atau Kata Kunci..."
            className="w-full pl-12 pr-4 py-3.5 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#5F089E] focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 bg-slate-200/60 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              Hapus
            </button>
          )}
        </div>

        {/* 3 Dropdown Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Angkatan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#5F089E]" />
              <span>Angkatan / Tahun Masuk</span>
            </label>
            <select
              value={selectedAngkatan}
              onChange={(e) => {
                setSelectedAngkatan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium outline-none focus:border-[#5F089E] focus:bg-white transition-all cursor-pointer"
            >
              <option value="Semua Angkatan">Semua Angkatan</option>
              <option value="Angkatan 2023 (Fase F - Kelas XI)">Angkatan 2023 (Fase F - Kelas XI)</option>
              <option value="Angkatan 2024 (Fase E - Kelas X)">Angkatan 2024 (Fase E - Kelas X)</option>
              <option value="Angkatan 2022 (Fase F - Kelas XII)">Angkatan 2022 (Fase F - Kelas XII)</option>
            </select>
          </div>

          {/* 2. Rombel / Kelas */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-[#5F089E]" />
              <span>Rombel / Kelas</span>
            </label>
            <select
              value={selectedKelas}
              onChange={(e) => {
                setSelectedKelas(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium outline-none focus:border-[#5F089E] focus:bg-white transition-all cursor-pointer"
            >
              <option value="Semua Rombel & Kelas">Semua Rombel &amp; Kelas</option>
              <option value="Kelas XI MIPA 4">Kelas XI MIPA 4</option>
              <option value="Kelas XI MIPA 2">Kelas XI MIPA 2</option>
              <option value="Kelas XI MIPA 1">Kelas XI MIPA 1</option>
              <option value="Kelas XI IPS 1">Kelas XI IPS 1</option>
              <option value="Kelas XI IPS 2">Kelas XI IPS 2</option>
              <option value="Kelas X-3">Kelas X-3</option>
            </select>
          </div>

          {/* 3. Peminatan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#5F089E]" />
              <span>Peminatan / Rumpun Mapel</span>
            </label>
            <select
              value={selectedPeminatan}
              onChange={(e) => {
                setSelectedPeminatan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium outline-none focus:border-[#5F089E] focus:bg-white transition-all cursor-pointer"
            >
              <option value="Semua Peminatan">Semua Peminatan</option>
              <option value="Sains & Teknologi">Peminatan Sains &amp; Teknologi</option>
              <option value="Kedokteran & Ilmu Hayati">Peminatan Kedokteran &amp; Ilmu Hayati</option>
              <option value="Sosial Humaniora">Peminatan Sosial Humaniora</option>
              <option value="Desain Komunikasi Visual & Multimedia">Peminatan DKV &amp; Multimedia</option>
            </select>
          </div>
        </div>

        {/* Filter Footer Hint & Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Gunakan filter di atas untuk meninjau kecocokan mata kuliah atau klaster perguruan tinggi impian.</span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
            <button
              type="button"
              onClick={() => onShowToast(`Menampilkan ${filteredStudents.length} siswa sesuai filter.`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs font-bold shadow-xs hover:shadow-md hover:shadow-purple-950/15 transition-all cursor-pointer active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari Siswa</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ALPHABET QUICK INDEX BAR: Bersih & Responsif */}
      {/* ========================================================= */}
      <section className="w-full rounded-2xl bg-white border border-slate-200/90 p-3 shadow-2xs overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-max gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveLetter(null);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeLetter === null
                ? "bg-[#5F089E] text-white shadow-xs"
                : "text-slate-600 hover:text-[#5F089E] hover:bg-purple-50"
            }`}
          >
            Semua
          </button>
          {ALPHABET_LETTERS.map((letter) => {
            const isActive = activeLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => handleLetterClick(letter)}
                className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#5F089E] text-white shadow-xs scale-105"
                    : "text-slate-500 hover:text-[#5F089E] hover:bg-purple-50"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* DAFTAR KARTU SISWA: Lega, Rapi, & Bernafas (Tidak Padat) */}
      {/* ========================================================= */}
      <div className="space-y-6">
        {filteredStudents.map((student) => {
          const chips = getSubjectChips(student);
          const peminatanClass = getPeminatanBadgeStyle(student.rumpunPeminatan);

          return (
            <article
              key={student.id}
              className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 hover:border-[#5F089E]/60 hover:shadow-2xl hover:shadow-purple-950/8 hover:-translate-y-1.5 active:scale-[0.995] transition-all duration-300 shadow-2xs space-y-6 group"
            >
              {/* BAGIAN ATAS: Profil, Nama, NISN & Tombol Detail Profil */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Avatar Bulat dengan Badge Status */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FAF5FF] to-[#E9D5FF]/60 border-2 border-purple-200 text-[#5F089E] text-xl sm:text-2xl font-extrabold flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2">
                      {student.avatarInitials}
                    </div>
                    <div
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-emerald-600 transition-transform duration-300 group-hover:scale-110"
                      title="Siswa Terverifikasi"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                    </div>
                  </div>

                  {/* Identitas Diri */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(student)}
                        className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#5F089E] transition-colors inline-flex items-center gap-1.5 cursor-pointer text-left"
                      >
                        <span>{student.nama}</span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#5F089E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-transform duration-200 group-hover:scale-105 ${peminatanClass}`}>
                        {student.rumpunPeminatan}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-700">
                      {student.peranEkskul}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
                      <span className="font-medium text-slate-600">
                        NISN: <span className="font-mono font-bold text-slate-800">{student.nisn}</span>
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="font-medium text-[#5F089E] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 transition-transform group-hover:scale-105">
                        {student.fase}
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span>Tahun Masuk: {student.tahunMasuk}</span>
                    </div>
                  </div>
                </div>

                {/* Tombol Detail Profil Utama */}
                <button
                  type="button"
                  onClick={() => handleOpenDetail(student)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-[#5F089E] text-[#5F089E] hover:text-white border border-purple-200/80 hover:border-transparent text-xs font-bold transition-all duration-200 cursor-pointer self-start shrink-0 shadow-2xs hover:shadow-md hover:scale-105 active:scale-95 group/btn"
                >
                  <span>Detail Profil</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </button>
              </div>

              {/* BAGIAN TENGAH: Target Studi & Chips Mata Pelajaran Pilihan (Lega & Terstruktur) */}
              <div className="rounded-2xl bg-slate-50/80 border border-slate-200/70 p-4 sm:p-5 space-y-3.5 transition-all duration-200 group-hover:bg-slate-50 group-hover:border-purple-200/60">
                {/* Target Program Studi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Sparkles className="w-4 h-4 text-[#5F089E] shrink-0 transition-transform group-hover:rotate-12" />
                    <span className="text-slate-500">Target Program Studi:</span>
                    <strong className="text-slate-900 font-bold text-xs sm:text-sm">
                      {student.targetStudi}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <School className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-slate-500">Rekomendasi PTN:</span>
                    <strong className="text-slate-800 font-bold">{student.rekomendasiPtn}</strong>
                  </div>
                </div>

                {/* Chips Paket 4 Mapel Pilihan (Gaya Chips Rapi, bukan teks panjang) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Paket Mata Pelajaran Pilihan yang Diambil (Fase F):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((subj, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-purple-200/80 text-purple-900 shadow-2xs hover:scale-105 hover:border-[#5F089E] hover:text-[#5F089E] hover:shadow-xs transition-all duration-150 cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5F089E]" />
                        <span>{subj}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* BAGIAN BAWAH: Email & Kontak Akademik */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-500">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-400">Email Akademik:</span>
                  <a
                    href={`mailto:${student.email}`}
                    className="font-mono text-xs font-medium text-[#5F089E] hover:underline"
                  >
                    {student.email}
                  </a>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>SMAN 8 Malang &bull; SMARIHASTA</span>
                </div>
              </div>
            </article>
          );
        })}

        {/* Empty State jika hasil pencarian nihil */}
        {filteredStudents.length === 0 && (
          <div className="w-full rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 sm:p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#5F089E] flex items-center justify-center mx-auto shadow-xs">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-800">
                Tidak Ada Profil Siswa yang Cocok
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Tidak ditemukan profil siswa dengan kata kunci atau kombinasi filter saat ini. Silakan sesuaikan kata kunci atau reset filter.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Semua Filter</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* PAGINASI: Lega & Presisi */}
      {/* ========================================================= */}
      <footer className="pt-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-200/80">
        <p className="font-medium text-slate-600">
          Menampilkan <strong className="text-slate-900">1 - {filteredStudents.length}</strong> dari <strong className="text-slate-900">1.042</strong> siswa terdaftar
        </p>

        <div className="flex items-center gap-2 self-center sm:self-auto">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-[#5F089E] text-white font-bold flex items-center justify-center text-xs shadow-xs"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => onShowToast("Membuka halaman 2 (simulasi).")}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-center text-xs transition-colors cursor-pointer shadow-2xs"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => onShowToast("Membuka halaman 3 (simulasi).")}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-center text-xs transition-colors cursor-pointer shadow-2xs"
          >
            3
          </button>
          <span className="px-1 text-slate-400 font-bold">&hellip;</span>
          <button
            type="button"
            onClick={() => onShowToast("Membuka halaman 53 (simulasi).")}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-center text-xs transition-colors cursor-pointer shadow-2xs"
          >
            53
          </button>

          <button
            type="button"
            onClick={() => onShowToast("Membuka halaman berikutnya (simulasi).")}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Pop-up Modal Detail Profil Siswa Lain */}
      <SiswaB1StudentDetailModal
        isOpen={!!selectedStudentForModal}
        student={selectedStudentForModal}
        onClose={() => setSelectedStudentForModal(null)}
      />
    </div>
  );
};
