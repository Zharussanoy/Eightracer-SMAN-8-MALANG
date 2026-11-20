"use client";

import React, { useEffect, useState, useMemo } from "react";
import { apiRequest } from "@/lib/api";
import {
  Search,
  RotateCcw,
  ExternalLink,
  Mail,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  School,
  CheckCircle2,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { DirektoriSiswaItem } from "./types";
import { SiswaB1StudentDetailModal } from "./SiswaB1StudentDetailModal";

interface SiswaB1DirektoriSectionProps {
  onShowToast: (msg: string) => void;
}

export const SiswaB1DirektoriSection: React.FC<SiswaB1DirektoriSectionProps> = ({
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState("Semua Angkatan");
  const [selectedKelas, setSelectedKelas] = useState("Semua Rombel & Kelas");
  const [selectedPeminatan, setSelectedPeminatan] = useState("Semua Peminatan");

  const [directoryItems, setDirectoryItems] = useState<DirektoriSiswaItem[]>([]);
  const [availableKelas, setAvailableKelas] = useState<string[]>([]);
  const [totalSiswaAktif, setTotalSiswaAktif] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudentForModal, setSelectedStudentForModal] =
    useState<DirektoriSiswaItem | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiRequest<{
          ringkasan?: { total_siswa_aktif?: number };
          daftar_kelas?: string[];
          meta?: { total?: number };
          data?: Array<{
            id: number;
            nama?: string;
            nama_lengkap?: string;
            nisn: string;
            kelas: string;
            fase?: string;
            fase_kurikulum?: string;
            angkatan?: string;
            tahun_masuk?: string;
            rumpun_peminatan?: string;
            target_studi?: string;
            fokus_pilihan?: string;
            email?: string;
            rekomendasi_ptn?: string;
            inisial?: string;
            biografi?: string;
            prestasi?: string[];
            keahlian?: string[];
            mapel_pilihan?: string[];
          }>;
        }>("/siswa/direktori?per_page=500");

        if (!active || !res) return;

        const list = res.data || [];
        setTotalSiswaAktif(
          res.ringkasan?.total_siswa_aktif ?? res.meta?.total ?? list.length
        );

        const mapped: DirektoriSiswaItem[] = list.map((s) => ({
          id: String(s.id),
          nama: s.nama || s.nama_lengkap || "-",
          nisn: s.nisn || "-",
          kelas: s.kelas ? `Kelas ${s.kelas}` : "-",
          fase: s.fase || s.fase_kurikulum || "Fase E",
          angkatan: s.angkatan || "-",
          tahunMasuk: s.tahun_masuk || "-",
          rumpunPeminatan: s.rumpun_peminatan || "Menunggu Validasi BK",
          peranEkskul: "Siswa Aktif SMAN 8 Malang",
          targetStudi: s.target_studi || "-",
          fokusPilihan: s.fokus_pilihan || "-",
          email: s.email || "-",
          rekomendasiPtn: s.rekomendasi_ptn || "-",
          avatarInitials: s.inisial || "SW",
          biografi: s.biografi || "",
          prestasi: s.prestasi || [],
          keahlian: s.keahlian || [],
          mapelPilihanList: s.mapel_pilihan || [],
        }));

        setDirectoryItems(mapped);
        if (res.daftar_kelas && res.daftar_kelas.length > 0) {
          setAvailableKelas(res.daftar_kelas);
        } else {
          const uniqueKelas = Array.from(
            new Set(list.map((s) => s.kelas).filter(Boolean))
          ).sort();
          setAvailableKelas(uniqueKelas);
        }
      } catch {
        if (active) {
          setDirectoryItems([]);
          setTotalSiswaAktif(0);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    return directoryItems.filter((student) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = student.nama.toLowerCase().includes(query);
        const matchNisn = student.nisn.includes(query);
        if (!matchName && !matchNisn) return false;
      }

      if (selectedAngkatan !== "Semua Angkatan") {
        const matchFase = student.fase.toLowerCase().includes(selectedAngkatan.toLowerCase());
        const matchAngkatan = student.angkatan.toLowerCase().includes(selectedAngkatan.toLowerCase());
        if (!matchFase && !matchAngkatan) {
          return false;
        }
      }

      if (selectedKelas !== "Semua Rombel & Kelas") {
        if (student.kelas.toLowerCase() !== `kelas ${selectedKelas.toLowerCase()}` && !student.kelas.toLowerCase().includes(selectedKelas.toLowerCase())) {
          return false;
        }
      }

      if (selectedPeminatan !== "Semua Peminatan") {
        if (!student.rumpunPeminatan.toLowerCase().includes(selectedPeminatan.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [directoryItems, searchQuery, selectedAngkatan, selectedKelas, selectedPeminatan]);

  const handleResetFilter = () => {
    setSearchQuery("");
    setSelectedAngkatan("Semua Angkatan");
    setSelectedKelas("Semua Rombel & Kelas");
    setSelectedPeminatan("Semua Peminatan");
    setCurrentPage(1);
    onShowToast("Filter direktori siswa berhasil direset.");
  };

  const handleOpenDetail = (student: DirektoriSiswaItem) => {
    setSelectedStudentForModal(student);
  };

  const getSubjectChips = (student: DirektoriSiswaItem): string[] => {
    if (student.mapelPilihanList && student.mapelPilihanList.length > 0) {
      return student.mapelPilihanList;
    }
    const clean = student.fokusPilihan.replace(/^Fokus Pilihan:\s*/i, "");
    if (!clean || clean === "-") return [];
    return clean
      .split(/,\s*|\s+dan\s+/i)
      .map((s) => s.trim())
      .filter(Boolean);
  };

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
      <section className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-7 h-7 rounded-lg bg-purple-100 text-[#5F089E] flex items-center justify-center font-bold text-xs">
            <Users className="w-3.5 h-3.5" />
          </span>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            Pencarian &amp; Filter Profil Siswa
          </h2>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {availableKelas.map((kls) => (
                <option key={kls} value={kls}>
                  Kelas {kls}
                </option>
              ))}
            </select>
          </div>

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
              <option value="Fase E">Fase E (Kelas X)</option>
              <option value="Fase F">Fase F (Kelas XI &amp; XII)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Gunakan filter di atas untuk menyaring siswa berdasarkan rombel kelas dan angkatan.</span>
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

      <div className="space-y-4">
        {filteredStudents
          .slice((currentPage - 1) * 5, currentPage * 5)
          .map((student) => (
            <article
              key={student.id}
              className="w-full rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 hover:border-[#5F089E]/60 hover:shadow-xl hover:shadow-purple-950/5 transition-all duration-200 shadow-2xs space-y-4 group font-sans"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FAF5FF] to-[#E9D5FF]/60 border border-purple-200 text-[#5F089E] text-base sm:text-lg font-extrabold flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    {student.avatarInitials}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(student)}
                        className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#5F089E] transition-colors inline-flex items-center gap-1.5 cursor-pointer text-left"
                      >
                        <span>{student.nama}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5F089E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>

                      {/* Kelas */}
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-[#5F089E] border border-purple-200">
                        {student.kelas}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={`mailto:${student.email}`}
                        className="text-xs font-medium text-slate-600 hover:text-[#5F089E] hover:underline"
                      >
                        {student.email}
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenDetail(student)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-purple-50 hover:bg-[#5F089E] text-[#5F089E] hover:text-white border border-purple-200/80 hover:border-transparent text-xs font-bold transition-all duration-200 cursor-pointer self-start sm:self-center shrink-0 shadow-2xs hover:shadow-md hover:scale-105 active:scale-95 group/btn"
                >
                  <span>Detail Profil</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </button>
              </div>

              {/* Keahlian / Minat */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#5F089E]" />
                  <span>Keahlian / Minat:</span>
                </span>
                {student.keahlian && student.keahlian.length > 0 ? (
                  student.keahlian.map((k, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200"
                    >
                      {k}
                    </span>
                  ))
                ) : student.targetStudi && student.targetStudi !== "-" ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-[#5F089E] border border-purple-100">
                    {student.targetStudi}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">Belum diisi</span>
                )}
              </div>
            </article>
          ))}

        {filteredStudents.length === 0 && (
          <div className="w-full rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 sm:p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#5F089E] flex items-center justify-center mx-auto shadow-xs">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-800">
                Belum Ada Data Siswa Terdata
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Direktori siswa akan otomatis menampilkan data siswa sesuai hasil impor Excel oleh Admin / Guru BK.
              </p>
            </div>
            {(searchQuery || selectedAngkatan !== "Semua Angkatan" || selectedKelas !== "Semua Rombel & Kelas" || selectedPeminatan !== "Semua Peminatan") && (
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
            )}
          </div>
        )}
      </div>

      <footer className="pt-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-200/80">
        <p className="font-medium text-slate-600">
          Menampilkan{" "}
          <strong className="text-slate-900">
            {Math.min(5, Math.max(0, filteredStudents.length - (currentPage - 1) * 5))}
          </strong>{" "}
          dari <strong className="text-slate-900">{filteredStudents.length}</strong> siswa terdaftar
        </p>

        {(() => {
          const totalPages = Math.max(1, Math.ceil(filteredStudents.length / 5));
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

          return (
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pages.map((item, idx) => {
                if (item === "ellipsis") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-1 text-sm text-slate-400">
                      &hellip;
                    </span>
                  );
                }
                const isActive = currentPage === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#5F089E] text-white shadow-xs"
                        : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })()}
      </footer>

      <SiswaB1StudentDetailModal
        isOpen={!!selectedStudentForModal}
        student={selectedStudentForModal}
        onClose={() => setSelectedStudentForModal(null)}
      />
    </div>
  );
};
