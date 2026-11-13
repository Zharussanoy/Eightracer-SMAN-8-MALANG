"use client";

import { X, Award, CheckCircle, BookOpen, Compass, Brain } from "lucide-react";
import { StudentB1WaliKelas } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentB1WaliKelas;
}

export default function WaliKelasB1StudentDetailModal({
  isOpen,
  onClose,
  student,
}: Props) {
  if (!isOpen) return null;

  const detail = student.profilDetail || {
    mapelPilihan: [
      "Matematika Tingkat Lanjut",
      "Informatika Terapan",
      "Kimia Terapan",
      "Fisika Lanjut",
    ],
    riasec: {
      kode: "Investigative - Realistic",
      label: "Investigatif - Realistis",
      deskripsi:
        "Memiliki minat riset mendalam, analisis komputasi kuantitatif, dan eksplorasi laboratorium sains.",
    },
    kecerdasanMajemuk: {
      tipe: "Logis-Matematis, Spasial",
      deskripsi:
        "Unggul dalam penalaran analitis sistematis, pengenalan pola grafis, dan pemodelan sains kompleks.",
    },
    prestasi: [
      {
        id: "p-1",
        judul: "Juara 2 OSN Informatika Kota Malang 2024",
        penyelenggara: "Pusat Prestasi Nasional (Puspresnas) - Kemendikbudristek",
        tahun: "2024",
        tingkat: "Kota / Kabupaten",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[680px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#5F089E] uppercase">
              Detail Profil Siswa
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-[#5F089E] to-[#8C3BE2] text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                {student.initial}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {student.nama}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  NISN: {student.nisn} &bull; Kelas {student.kelas} &bull; {student.semester}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Grid: Mapel Pilihan & Minat/Bakat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mapel Pilihan */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#5F089E]" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Mata Pelajaran Pilihan
                </h4>
              </div>
              <ul className="space-y-2">
                {detail.mapelPilihan.map((mapel, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200/80 shadow-2xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{mapel}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Minat & Bakat */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#5F089E]" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Minat &amp; Karakteristik
                </h4>
              </div>

              {/* RIASEC Card */}
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-[#5F089E] uppercase tracking-wider block">
                  Asesmen RIASEC (Holland Code)
                </span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">
                  {detail.riasec.label} ({detail.riasec.kode})
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {detail.riasec.deskripsi}
                </p>
              </div>

              {/* Multiple Intelligence Card */}
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  <Brain className="w-3 h-3" />
                  <span>Kecerdasan Majemuk</span>
                </div>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">
                  {detail.kecerdasanMajemuk.tipe}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {detail.kecerdasanMajemuk.deskripsi}
                </p>
              </div>
            </div>
          </div>

          {/* Prestasi Siswa */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Riwayat Prestasi &amp; Penghargaan
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {detail.prestasi.length} Prestasi Tercatat
              </span>
            </div>

            <div className="space-y-2.5">
              {detail.prestasi.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-start justify-between shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.judul}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.penyelenggara}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-[#5F089E]">
                      {p.tingkat}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {p.tahun}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#5F089E] hover:bg-[#4E0782] rounded-xl transition-all shadow-xs"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
}

