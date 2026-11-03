"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { StudentB1 } from "./types";

interface AdminB1StudentDetailModalProps {
  student: StudentB1 | null;
  onClose: () => void;
}

export default function AdminB1StudentDetailModal({
  student,
  onClose,
}: AdminB1StudentDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!student) return null;

  // Compute initials e.g. "Amalia Mayasari" -> "AM"
  const nameParts = student.nama.trim().split(" ");
  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : student.nama.slice(0, 2).toUpperCase();

  // Fallbacks matching Figma CSS values if not provided
  const namaPanggilan = student.namaPanggilan || nameParts[0];
  const bahasa = student.bahasaKeseharian || "Bahasa Indonesia & Bahasa Jawa";
  const citaCita = student.citaCita || "Software Engineer & AI Researcher";
  const hobi = student.hobi || "Desain UI/UX, Membaca Buku Teknologi, Fotografi";
  const warna = student.warnaFavorit || "Ungu";
  const makanan = student.makananFavorit || "Nasi Goreng";
  const gameOnline = student.permainanOnline || "Roblox, Mobile Legends";
  const gameOffline = student.permainanOffline || "Catur & Monopoli";

  const kondisiOrtu = student.kondisiOrtu || "Lengkap";
  const ayahPekerjaan = student.ayahPekerjaan || "Bambang S. (Karyawan Swasta )";
  const ibuPekerjaan = student.ibuPekerjaan || "Sri Wahyuni (Ibu Rumah Tangga)";
  const penghasilan = student.penghasilanGabungan || "Rp 6.500.000/ bln";
  const kontak = student.kontakOrtu || "+62 812–3456–7890";

  const pip = student.bansos?.pip || "Tidak Terdaftar";
  const pkh = student.bansos?.pkh || "Tidak Terdaftar";
  const kisBpjs = student.bansos?.kisBpjs || "Mandiri Kelas 2";
  const kip = student.bansos?.kip || "Tidak Memiliki";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[rgba(31,26,34,0.5)] backdrop-blur-[4px] animate-in fade-in duration-200 font-['Montserrat',sans-serif]"
      onClick={onClose}
    >
      {/* Modal Dialog Card (920px width) */}
      <div
        className="w-full max-w-[920px] bg-white rounded-[24px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border border-[#E9E9E9] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Accent Strip */}
        <div className="w-full h-[6px] bg-gradient-to-r from-[#410070] via-[#5F089E] to-[#795900] shrink-0" />

        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 pb-4 bg-white shrink-0 border-b border-purple-50">
          <div className="flex flex-col gap-1 pr-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight tracking-tight">
              Detail Informasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Verifikasi kelengkapan biodata, metrik objektif nilai rapor semester 1, asesmen RIASEC, dan kecerdasan majemuk siswa.
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-purple-50 hover:bg-purple-100 flex items-center justify-center shrink-0 transition-colors cursor-pointer text-slate-600 hover:text-[#5F089E]"
            aria-label="Tutup jendela modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="px-6 sm:px-8 py-4 overflow-y-auto space-y-6">
          {/* 1. Top Student Identity Card */}
          <div className="w-full bg-[#FBF0FC] rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4 border border-purple-100">
            <div className="flex items-center gap-4">
              {/* Student Avatar Initial Circle */}
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-[#5F089E] shadow-md shadow-purple-900/20 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shrink-0">
                {initials}
              </div>

              {/* Identity Info */}
              <div className="flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {student.nama}
                </h3>
                <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 mt-1">
                  <span>NISN: <span className="font-mono text-slate-700">{student.nisn}</span></span>
                  <span className="hidden sm:inline text-slate-300">&bull;</span>
                  <span>Kelas: <span className="font-semibold text-slate-700">{student.kelas}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Two-Column Data Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
            {/* COLUMN 1: BIODATA & PROFIL MINAT PERSONAL */}
            <div className="w-full bg-gradient-to-b from-purple-50/30 to-white bg-white rounded-xl p-4 shadow-xs border border-purple-100 space-y-4 flex flex-col">
              {/* Pillar Title */}
              <h4 className="text-sm sm:text-base font-bold text-[#5F089E] tracking-wide">
                Biodata
              </h4>

              {/* Data Induk Singkat Card */}
              <div className="bg-[#FBF0FC] rounded-lg p-2.5 space-y-1.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Nama Lengkap:</span>
                  <span className="font-semibold text-slate-900">{student.nama}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Nama Panggilan:</span>
                  <span className="font-bold text-[#5F089E]">{namaPanggilan}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>NISN:</span>
                  <span className="font-medium text-slate-900 font-mono">{student.nisn}</span>
                </div>
                <div className="flex items-start justify-between text-slate-500 pt-0.5">
                  <span className="shrink-0">Bahasa Keseharian:</span>
                  <span className="font-medium text-slate-900 text-right ml-2">{bahasa}</span>
                </div>
              </div>

              {/* Peminatan Section */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  PEMINATAN
                </span>

                {/* Cita-cita Card */}
                <div className="bg-white rounded-lg p-2.5 border border-purple-100 space-y-0.5">
                  <span className="text-xs text-slate-500 font-medium block">
                    Cita-cita:
                  </span>
                  <span className="text-sm font-bold text-[#5F089E] block leading-tight">
                    {citaCita}
                  </span>
                </div>

                {/* Hobi Card */}
                <div className="bg-white rounded-lg p-2.5 border border-purple-100 space-y-0.5">
                  <span className="text-xs text-slate-500 font-medium block">
                    Hobi:
                  </span>
                  <span className="text-xs sm:text-sm text-slate-800 block leading-tight">
                    {hobi}
                  </span>
                </div>

                {/* Warna Favorit */}
                <div className="bg-white rounded-lg px-2.5 py-1.5 border border-purple-100 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-xs text-slate-500 font-medium">
                    Warna Favorit:
                  </span>
                  <span className="font-medium text-slate-800">{warna}</span>
                </div>

                {/* Makanan Favorit */}
                <div className="bg-white rounded-lg px-2.5 py-1.5 border border-purple-100 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-xs text-slate-500 font-medium">
                    Makanan Favorit:
                  </span>
                  <span className="text-slate-800">{makanan}</span>
                </div>

                {/* Permainan / Game Favorit */}
                <div className="bg-white rounded-lg p-2.5 border border-purple-100 space-y-1.5">
                  <span className="text-xs text-slate-500 font-medium block">
                    Permainan / Game Favorit:
                  </span>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="bg-purple-100 text-[#5F089E] text-[10px] font-semibold px-2 py-0.5 rounded">
                      Online: {gameOnline}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Offline: {gameOffline}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: LATAR BELAKANG & BANTUAN SOSIAL */}
            <div className="w-full bg-gradient-to-b from-purple-50/30 to-white bg-white rounded-xl p-4 shadow-xs border border-purple-100 space-y-4 flex flex-col">
              {/* Pillar Title */}
              <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-wide">
                Latar Belakang
              </h4>

              {/* Detail Orang Tua & Penghasilan Card */}
              <div className="bg-[#FBF0FC] rounded-lg p-2.5 space-y-2 text-xs sm:text-sm">
                {/* Kondisi Ortu */}
                <div className="flex items-center justify-between pb-1.5 border-b border-purple-100">
                  <span className="text-slate-500">Kondisi Orang Tua / Wali:</span>
                  <span className="font-semibold text-slate-900">{kondisiOrtu}</span>
                </div>

                {/* Ayah & Pekerjaan */}
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-500 block">
                    Ayah &amp; Pekerjaan:
                  </span>
                  <span className="font-medium text-slate-900 block leading-tight">
                    {ayahPekerjaan}
                  </span>
                </div>

                {/* Ibu & Pekerjaan */}
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-500 block">
                    Ibu &amp; Pekerjaan:
                  </span>
                  <span className="font-medium text-slate-900 block leading-tight">
                    {ibuPekerjaan}
                  </span>
                </div>

                {/* Penghasilan Gabungan */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-500">Penghasilan Gabungan:</span>
                  <span className="font-bold text-[#5F089E]">{penghasilan}</span>
                </div>

                {/* Kontak Ortu */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Kontak Orang Tua / Wali:</span>
                  <span className="font-medium text-slate-900">{kontak}</span>
                </div>
              </div>

              {/* Status Bantuan Sosial */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  STATUS BANTUAN SOSIAL
                </span>

                <div className="space-y-1.5">
                  {/* Row 1: PIP and PKH in 2 cols */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-white rounded-lg px-2.5 py-1.5 border border-purple-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">PIP:</span>
                      <span className="font-medium text-slate-700">{pip}</span>
                    </div>
                    <div className="bg-white rounded-lg px-2.5 py-1.5 border border-purple-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">PKH:</span>
                      <span className="font-medium text-slate-700">{pkh}</span>
                    </div>
                  </div>

                  {/* Row 2: KIS / BPJS */}
                  <div className="bg-white rounded-lg px-2.5 py-1.5 border border-purple-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">KIS / BPJS Kesehatan:</span>
                    <span className="font-bold text-[#5F089E]">{kisBpjs}</span>
                  </div>

                  {/* Row 3: KIP */}
                  <div className="bg-white rounded-lg px-2.5 py-1.5 border border-purple-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">KIP:</span>
                    <span className="font-medium text-slate-700">{kip}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="w-full bg-[#FBF0FC] px-6 sm:px-8 py-3.5 flex items-center justify-end shrink-0 border-t border-purple-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] active:bg-[#3d0566] text-white text-sm font-semibold transition-all shadow-md shadow-purple-900/20 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
