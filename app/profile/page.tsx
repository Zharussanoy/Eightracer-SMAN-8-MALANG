"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUser, PresetKey } from "@/context/UserContext";
import {
  GraduationCap,
  School,
  UserCheck,
  ShieldCheck,
  BookOpen,
  Target,
  Briefcase,
  Mail,
  Award,
  Layers,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Sparkles,
  Users,
} from "lucide-react";

export default function ProfilePage() {
  const { currentUser, currentPreset, switchRole, getDisplayRole, isLoggedIn, login, logout } = useUser();
  useEffect(() => {
    if (!isLoggedIn) {
      const timer = setTimeout(() => {
        login();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, login]);

  const displayRole = getDisplayRole();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSimulateSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* ================= SIMULATOR GANTI ROLE (FITUR B3) ================= */}
        <section className="bg-gradient-to-r from-[#390460] via-[#5F089E] to-[#7B1FA2] text-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-purple-950/15 flex flex-col md:flex-row items-center justify-between gap-4 border border-purple-400/30">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Layers className="text-amber-300 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold flex items-center gap-1.5 justify-center md:justify-start">
                <span>Simulator Role &amp; Profil (Fitur B3)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-400 text-purple-950">
                  LIVE DEMO
                </span>
              </p>
              <p className="text-xs text-purple-200">
                Ganti role untuk melihat perubahan tampilan profil dan badge Navbar secara real-time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={logout}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-red-500/25 hover:bg-red-500/35 text-red-100 border border-red-400/30 transition-all cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => login()}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-100 border border-emerald-400/30 transition-all cursor-pointer"
              >
                Login
              </button>
            )}
            {[
              { key: "siswa_aktif", label: "1. Siswa Aktif" },
              { key: "siswa_alumni", label: "2. Alumni (Lulus)" },
              { key: "guru", label: "3. Guru / Wali Kelas" },
              { key: "admin", label: "4. Admin" },
            ].map(({ key, label }) => {
              const active = currentPreset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchRole(key as PresetKey)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${active
                      ? "bg-amber-400 text-purple-950 shadow-md shadow-amber-400/25 scale-105"
                      : "bg-white/15 hover:bg-white/25 text-white"
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= HEADER KARTU PROFIL ================= */}
        <motion.div
          key={currentUser.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden"
        >
          {/* Aksen Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Avatar Besar */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-purple-100 shadow-md shrink-0">
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Informasi Identitas Pokok */}
          <div className="flex-1 text-center sm:text-left space-y-3 z-10">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentUser.name}
              </h1>
              <span
                className={`text-xs px-3 py-1 rounded-full font-extrabold border shadow-2xs flex items-center gap-1.5 ${displayRole.badgeColor}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${displayRole.dotColor}`} />
                {displayRole.label}
              </span>
            </div>

            <p className="text-sm text-slate-500 font-medium flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-purple-600" />
                {currentUser.email}
              </span>
              {currentUser.nisn && (
                <span>
                  NISN: <b className="text-slate-800">{currentUser.nisn}</b>
                </span>
              )}
              {currentUser.nip && (
                <span>
                  NIP: <b className="text-slate-800">{currentUser.nip}</b>
                </span>
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={handleSimulateSave}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#5F089E] font-bold text-xs transition-colors cursor-pointer"
              >
                {saveSuccess ? "Tersimpan!" : "Edit Informasi Akun"}
              </button>

              <Link
                href="/admin/alumni"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white font-bold text-xs transition-colors shadow-sm"
              >
                <span>Buka Direktori Alumni (Fitur B3)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ================= TAMPILAN 1: SISWA AKTIF ================= */}
        {currentUser.role === "siswa" && currentUser.statusSiswa === "aktif" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Data Akademik Siswa */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2.5 text-[#5F089E] font-bold text-base border-b border-slate-100 pb-3">
                  <School className="w-5 h-5" />
                  <h2>Data Siswa SMAN 8 Malang</h2>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Status Akademik</span>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-green-500/10 text-green-700 border border-green-200">
                      Siswa Aktif (Tingkat Akhir)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Kelas / Rombel</span>
                    <span className="font-bold text-slate-800">{currentUser.kelas}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Wali Kelas</span>
                    <span className="font-semibold text-slate-800">Drs. Bambang Hidayat, M.Pd</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Rata-rata Nilai Rapor</span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-purple-100 text-purple-800">
                      {currentUser.nilaiRataRata} / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Target Rencana Studi PTN */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 text-[#5F089E] font-bold text-base">
                    <Target className="w-5 h-5" />
                    <h2>Target Masuk PTN (Pilihan Utama)</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-purple-950">
                    {currentUser.jalurTarget}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Perguruan Tinggi Impian:</span>
                    <p className="font-extrabold text-slate-900 text-base">
                      {currentUser.targetPtn}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Program Studi Pilihan:</span>
                    <p className="font-bold text-[#5F089E]">{currentUser.targetProdi}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Pilihan Alternatif:</span>
                    <p className="text-xs font-semibold text-slate-700">
                      {currentUser.targetPtnAlt} &bull; {currentUser.targetProdiAlt}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Relevansi dengan Fitur B3 (Alumni SMAN 8) */}
            <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50/50 rounded-3xl p-6 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm font-extrabold text-purple-950 flex items-center gap-2 justify-center sm:justify-start">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Eksplorasi Alumni SMAN 8 di {currentUser.targetPtn}
                </p>
                <p className="text-xs text-slate-600 max-w-xl">
                  Lihat rekam jejak nilai rapor, sertifikat prestasi, dan jalur kelolosan kakak kelas di {currentUser.targetPtn} pada Direktori Alumni.
                </p>
              </div>
              <Link
                href="/alumni"
                className="px-5 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white font-bold text-xs shrink-0 shadow-sm transition-all"
              >
                Bandingkan Data Alumni &rarr;
              </Link>
            </div>
          </motion.div>
        )}

        {/* ================= TAMPILAN 2: ALUMNI (SISWA YANG SUDAH LULUS) ================= */}
        {currentUser.role === "siswa" && currentUser.statusSiswa === "lulus" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Data Kelulusan */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-base border-b border-slate-100 pb-3">
                  <GraduationCap className="w-5 h-5" />
                  <h2>Status Kelulusan SMAN 8 Malang</h2>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Tahun Kelulusan</span>
                    <span className="font-extrabold text-slate-900">{currentUser.angkatan}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Status Direktori Alumni</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Terverifikasi di Database
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Jalur Kelolosan Masuk PTN</span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800">
                      {currentUser.jalurDiterima}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Pendidikan Tinggi & Karir */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-base border-b border-slate-100 pb-3">
                  <Briefcase className="w-5 h-5" />
                  <h2>Pendidikan Tinggi &amp; Karir Saat Ini</h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Perguruan Tinggi Diterima:</span>
                    <p className="font-extrabold text-slate-900 text-base">
                      {currentUser.ptnKampus}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Program Studi / Jurusan:</span>
                    <p className="font-bold text-emerald-700">{currentUser.prodiKampus}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Status Karir / Profesi:</span>
                    <p className="font-semibold text-slate-800">{currentUser.pekerjaan}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimoni / Pesan Alumni */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Pesan untuk Adik Kelas SMAN 8 Malang
              </h3>
              <p className="text-sm text-slate-600 italic leading-relaxed">
                &ldquo;Fokus kuatkan nilai rapor semester 1 sampai 5 jika mengincar SNBP, serta sertakan portofolio sertifikat lomba yang linier dengan jurusan. Semangat terus pejuang PTN Smarihasta!&rdquo;
              </p>
            </div>
          </motion.div>
        )}

        {/* ================= TAMPILAN 3: GURU / WALI KELAS ================= */}
        {currentUser.role === "guru" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Data Pengajar */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2.5 text-blue-700 font-bold text-base border-b border-slate-100 pb-3">
                  <BookOpen className="w-5 h-5" />
                  <h2>Data Pendidik &amp; Penugasan</h2>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Mata Pelajaran Diampu</span>
                    <span className="font-bold text-slate-900">{currentUser.mataPelajaran}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Penugasan Wali Kelas</span>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                      Wali Kelas {currentUser.waliKelas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Total Siswa Binaan</span>
                    <span className="font-bold text-slate-900">{currentUser.totalSiswaBinaan} Siswa</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Bimbingan Kelas */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2.5 text-blue-700 font-bold text-base border-b border-slate-100 pb-3">
                  <UserCheck className="w-5 h-5" />
                  <h2>Rekap Minat Studi Siswa {currentUser.waliKelas}</h2>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100">
                    <p className="text-lg font-black text-purple-700">18</p>
                    <p className="text-[11px] font-bold text-purple-900">Eligible SNBP</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                    <p className="text-lg font-black text-blue-700">14</p>
                    <p className="text-[11px] font-bold text-blue-900">Target SNBT</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                    <p className="text-lg font-black text-amber-700">4</p>
                    <p className="text-[11px] font-bold text-amber-900">Mandiri / Kedinasan</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  Sebagai wali kelas, Anda dapat memantau perbandingan nilai rapor siswa binaan terhadap data riwayat alumni SMAN 8 yang telah diterima di PTN tujuan.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= TAMPILAN 4: ADMIN ================= */}
        {currentUser.role === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3 text-red-600 font-bold text-lg">
                  <ShieldCheck className="w-6 h-6" />
                  <h2>Hak Akses Administrator Tim B3</h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-200">
                  Full Access
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Anda memiliki akses penuh untuk mengelola master data kelulusan, input dan validasi alumni baru, ekspor/impor file CSV, serta pengujian AI Rekomendasi Jurusan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <Link
                  href="/admin/alumni?tab=direktori"
                  className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 font-bold text-xs flex flex-col justify-between transition-all group"
                >
                  <Users className="w-6 h-6 text-[#5F089E] mb-3 group-hover:scale-110 transition-transform" />
                  <span>Kelola Direktori Alumni</span>
                  <span className="text-[10px] text-purple-600 font-normal mt-1">Tambah, edit &amp; hapus data alumni</span>
                </Link>

                <Link
                  href="/admin/alumni"
                  className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-bold text-xs flex flex-col justify-between transition-all group"
                >
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
                  <span>Impor Data CSV</span>
                  <span className="text-[10px] text-emerald-600 font-normal mt-1">Impor batch ratusan data kelulusan</span>
                </Link>

                <Link
                  href="/admin/alumni?tab=ai"
                  className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 font-bold text-xs flex flex-col justify-between transition-all group"
                >
                  <Sparkles className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <span>AI Strategi Jurusan</span>
                  <span className="text-[10px] text-blue-600 font-normal mt-1">Analisis kelolosan otomatis</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
