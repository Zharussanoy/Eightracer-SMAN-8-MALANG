"use client";

import React, { useState, useEffect } from "react";
import { X, BookOpen, Clock, Sparkles } from "lucide-react";
import { MapelPilihanDetail } from "./types";

interface SiswaB1SubjectDetailModalProps {
  subject: MapelPilihanDetail | null;
  onClose: () => void;
}

export const SiswaB1SubjectDetailModal: React.FC<
  SiswaB1SubjectDetailModalProps
> = ({ subject, onClose }) => {
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    setSelectedTopicIndex(null);
  }, [subject]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (subject) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [subject, onClose]);

  if (!subject) return null;

  // Helper untuk menentukan inisial mata pelajaran (misal: MTL, IDS, FIS, KIM)
  const getSubjectInitials = (name: string): string => {
    if (name.includes("Matematika")) return "MTL";
    if (name.includes("Informatika")) return "IDS";
    if (name.includes("Fisika")) return "FIS";
    if (name.includes("Kimia")) return "KIM";
    if (name.includes("Biologi")) return "BIO";
    if (name.includes("Ekonomi")) return "EKO";
    if (name.includes("Sosiologi")) return "SOS";
    if (name.includes("Geografi")) return "GEO";
    const words = name.split(" ").filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0] + (words[2]?.[0] || "")).toUpperCase();
    }
    return name.slice(0, 3).toUpperCase();
  };

  // Helper metadata probabilitas, silabus, dan prasyarat
  const getSubjectMeta = (subj: MapelPilihanDetail) => {
    if (subj.nama.includes("Matematika")) {
      return {
        initials: "MTL",
        percentage: "95.3%",
        statusBadge: "Sangat Tinggi (Optimal)",
        statusColor: "bg-[#410070]",
        rationale:
          "Nilai rapor Semester 1 pada matematika dan penalaran logis-matematis yang kuat membuktikan kapasitas tinggi siswa untuk menembus tantangan Matematika Tingkat Lanjut. Siswa diprediksi mampu menuntaskan seluruh capaian pembelajaran Fase F secara mandiri dan berprestasi optimal.",
        silabus:
          "Geometri Analitik Irisan Kerucut (Parabola, Elips, Hiperbola), Polinomial (Suku Banyak), Matriks Lanjutan & Transformasi Geometri, Vektor Ruang Dimensi-3, Limit Fungsi Trigonometri, serta Kalkulus Diferensial & Integral Lanjutan.",
        prasyarat:
          "Kemampuan aljabar tingkat lanjut, faktorisasi, relasi fungsi, identitas trigonometri, dan logika pembuktian matematis Semester 1.",
      };
    }
    if (subj.nama.includes("Informatika")) {
      return {
        initials: "IDS",
        percentage: "95.0%",
        statusBadge: "Sangat Tinggi (Optimal)",
        statusColor: "bg-[#410070]",
        rationale:
          "Skor keselarasan RIASEC Investigative-Realistic dan portofolio komputasi digital membuktikan kapasitas unggul siswa untuk menuntaskan kurikulum Informatika & Data Science. Siswa diprediksi mampu mengembangkan sistem perangkat lunak dan analisis data secara mandiri.",
        silabus:
          "Struktur Data & Algoritma Lanjut (Searching, Sorting, Rekursi), Rekayasa Perangkat Lunak (SDLC & UI/UX Design), Pemodelan Basis Data Relasional & Kueri SQL, Arsitektur Jaringan Komputer & Protokol Internet, serta Dasar Keamanan Siber & Cloud Computing.",
        prasyarat:
          "Fondasi logika computational thinking, matematika diskrit dasar, algoritma sekuensial, dan literasi sistem operasi Semester 1.",
      };
    }
    if (subj.nama.includes("Fisika")) {
      return {
        initials: "FIS",
        percentage: "89.5%",
        statusBadge: "Tinggi (Sangat Baik)",
        statusColor: "bg-[#5F089E]",
        rationale:
          "Nilai praktikum laboratorium dan pemahaman konsep mekanika dasar Semester 1 membuktikan kapasitas siswa dalam menyelesaikan pemodelan fisis. Siswa diprediksi mampu menguasai topik rekayasa teknologi Fase F dengan baik.",
        silabus:
          "Mekanika Lanjut & Dinamika Rotasi Benda Tegar, Gelombang Mekanik & Optik Terapan, Termodinamika & Efisiensi Mesin Kalor, Induksi Elektromagnetik & Rangkaian Arus Bolak-Balik, serta Pengantar Fisika Kuantum & Relativitas Khusus.",
        prasyarat:
          "Penguasaan analisis vektor gaya, trigonometri sudut istimewa, hukum gerak Newton, kalkulus diferensial dasar, dan konversi satuan Semester 1.",
      };
    }
    if (subj.nama.includes("Kimia")) {
      return {
        initials: "KIM",
        percentage: "88.0%",
        statusBadge: "Tinggi (Sangat Baik)",
        statusColor: "bg-[#5F089E]",
        rationale:
          "Capaian akademis pada konsep stoikiometri dan struktur atom Semester 1 menunjukkan fondasi pemahaman reaksi kimia yang solid. Siswa diprediksi mampu mengikuti pembelajaran kimia analitik dan eksperimen laboratorium lanjutan.",
        silabus:
          "Stoikiometri Tingkat Lanjut & Sifat Koligatif Larutan, Termokimia & Kinetika Reaksi Kimia, Kesetimbangan Kimia Industri & Asam-Basa, Elektrokimia & Proteksi Korosi Logam, serta Kimia Organik & Makromolekul Polimer.",
        prasyarat:
          "Penguasaan tata nama senyawa, persamaan reaksi kimia setara, konsep mol, hukum dasar kimia, dan keselamatan kerja laboratorium Semester 1.",
      };
    }
    return {
      initials: getSubjectInitials(subj.nama),
      percentage: `${subj.nilaiDasar ? subj.nilaiDasar.toFixed(1) : subj.tingkatKesesuaian + ".0"}%`,
      statusBadge:
        subj.tingkatKesesuaian >= 90
          ? "Sangat Tinggi (Optimal)"
          : "Tinggi (Sangat Baik)",
      statusColor: "bg-[#5F089E]",
      rationale: subj.catatanEvaluasiAkademik || subj.catatanPenjelasan,
      silabus: subj.deskripsiFokus,
      prasyarat: subj.fokusPenguatanMateri,
    };
  };

  const meta = getSubjectMeta(subject);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end font-sans text-slate-900 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Right Slide-Over Panel (Modern & Clean Matching Design Specs) */}
      <aside
        className="relative w-full max-w-[620px] h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP PURPLE BANNER HEADER (Persis Gambar 2) */}
        <div className="bg-[#4E007A] px-6 py-6 sm:px-8 sm:py-7 shrink-0 text-white flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            {/* Lingkaran Inisial Kuning-Emas */}
            <div className="w-12 h-12 rounded-full bg-[#FCD34D] text-[#3B1E08] font-black text-sm flex items-center justify-center shrink-0 shadow-md tracking-wider">
              {meta.initials}
            </div>

            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight truncate">
                {subject.nama}
              </h2>
            </div>
          </div>

          {/* Tombol Tutup Silang Melingkar */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all duration-200 hover:rotate-90 hover:scale-110 active:scale-95 cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* KARTU 1: % PROBABILITAS KEBERHASILAN PENGUASAAN (Persis Gambar 2) */}
          <div className="rounded-[24px] bg-[#FAF6FD] border border-purple-100/90 p-6 sm:p-7 space-y-4 shadow-xs">
            {/* Header Card Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                % PROBABILITAS KEBERHASILAN PENGUASAAN
              </span>
              <span
                className={`px-3.5 py-1 rounded-full text-white text-xs font-bold shadow-2xs tracking-wide ${meta.statusColor}`}
              >
                {meta.statusBadge}
              </span>
            </div>

            {/* Metric Row */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-4xl sm:text-5xl font-black text-[#410070] tracking-tight leading-none">
                {meta.percentage}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600">
                Tingkat Kapabilitas Tuntas
              </span>
            </div>

            {/* Deskripsi Penjelasan Akademik */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              {meta.rationale}
            </p>
          </div>

          {/* KARTU 2: SILABUS CAPAIAN PEMBELAJARAN FASE F (Persis Gambar 2) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
              <BookOpen className="w-4 h-4 text-[#5F089E] stroke-[2.2]" />
              <span>SILABUS CAPAIAN PEMBELAJARAN FASE F</span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {meta.silabus}
              </p>

              {/* 4 Topic Chips / Pills Interaktif */}
              {subject.topikUtama && subject.topikUtama.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                    Modul Fokus Pembelajaran:
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {subject.topikUtama.map((topik, idx) => {
                      const isSelected = selectedTopicIndex === idx;
                      return (
                        <button
                          key={topik.nama}
                          type="button"
                          onClick={() =>
                            setSelectedTopicIndex(isSelected ? null : idx)
                          }
                          className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#5F089E] bg-[#FAF5FF] text-[#5F089E] font-bold shadow-xs scale-[1.01]"
                              : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-purple-200 hover:bg-white"
                          }`}
                        >
                          <span className="block truncate">{topik.nama}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Detail Penjelasan Topik yang Diklik */}
                  {selectedTopicIndex !== null && (
                    <div className="p-3.5 rounded-xl bg-[#FAF5FF] border border-purple-200/70 text-xs text-slate-800 space-y-1 animate-in fade-in duration-150">
                      <span className="font-bold text-[#4E007A] block">
                        Fokus: {subject.topikUtama[selectedTopicIndex].nama}
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {subject.topikUtama[selectedTopicIndex].deskripsi}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* KARTU 3: PRASYARAT KEILMUAN & FONDASI SMT 1 (Persis Gambar 2) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
              <Clock className="w-4 h-4 text-[#5F089E] stroke-[2.2]" />
              <span>PRASYARAT KEILMUAN &amp; FONDASI SMT 1</span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {meta.prasyarat}
              </p>
            </div>
          </div>

          {/* KARTU 4: REKOMENDASI ALOKASI JAM MANDIRI */}
          {subject.rekomendasiAlokasiJam && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Sparkles className="w-4 h-4 text-[#5F089E] stroke-[2.2]" />
                <span>REKOMENDASI BELAJAR MANDIRI</span>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {subject.rekomendasiAlokasiJam}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </aside>
    </div>
  );
};
