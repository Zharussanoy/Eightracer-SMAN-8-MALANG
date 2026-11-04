"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import Footer from "@/components/shared/Footer";
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
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Lock,
  Pencil,
  X,
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  siswaProfileService,
  SiswaProfileData,
  UpdateProfilePayload,
  UpdatePasswordPayload,
} from "@/services/b2";

export default function ProfilePage() {
  const { currentUser, currentPreset, switchRole, getDisplayRole, isLoggedIn, login, logout } =
    useUser();

  // State Live Data Siswa dari Backend
  const [liveProfile, setLiveProfile] = useState<SiswaProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // State Modal Edit Profil
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [editProfileError, setEditProfileError] = useState<string | null>(null);
  const [formNamaLengkap, setFormNamaLengkap] = useState("");
  const [formNamaPanggilan, setFormNamaPanggilan] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formNis, setFormNis] = useState("");
  const [formJenisKelamin, setFormJenisKelamin] = useState<"L" | "P">("L");
  const [formTempatLahir, setFormTempatLahir] = useState("");
  const [formTanggalLahir, setFormTanggalLahir] = useState("");
  const [formAgama, setFormAgama] = useState("");
  const [formGolonganDarah, setFormGolonganDarah] = useState("");
  const [formAlamat, setFormAlamat] = useState("");
  const [formNilaiTka, setFormNilaiTka] = useState("");
  const [formCatatan, setFormCatatan] = useState("");

  // State Modal Ganti Password
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formCurrentPassword, setFormCurrentPassword] = useState("");
  const [formNewPassword, setFormNewPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State Notifikasi Toast
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      const timer = setTimeout(() => {
        login();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, login]);

  // Muat data profil live dari backend jika token tersedia
  const fetchLiveProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const res = await siswaProfileService.getProfile();
      if (res?.data) {
        setLiveProfile(res.data);
      }
    } catch (err: any) {
      // Jika belum login token atau role bukan siswa, fallback ke mock currentUser
      console.warn("Koneksi API Profil Siswa (fallback mode):", err?.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchLiveProfile();
  }, [currentPreset]);

  const displayRole = getDisplayRole();

  // Buka Modal Edit Profil
  const handleOpenEditModal = () => {
    const active = liveProfile;
    setFormNamaLengkap(active?.nama_lengkap || currentUser.name);
    setFormNamaPanggilan(active?.nama_panggilan || "");
    setFormUsername(active?.user?.username || currentUser.email.split("@")[0]);
    setFormNis(active?.nis || "");
    setFormJenisKelamin(active?.jenis_kelamin || "L");
    setFormTempatLahir(active?.tempat_lahir || "");
    setFormTanggalLahir(active?.tanggal_lahir ? active.tanggal_lahir.substring(0, 10) : "");
    setFormAgama(active?.agama || "Islam");
    setFormGolonganDarah(active?.golongan_darah || "O");
    setFormAlamat(active?.alamat_rumah || "");
    setFormNilaiTka(active?.nilai_tka ? String(active.nilai_tka) : "");
    setFormCatatan(active?.catatan || "");
    setEditProfileError(null);
    setIsEditModalOpen(true);
  };

  // Simpan Pembaruan Profil ke Backend
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaLengkap.trim()) {
      setEditProfileError("Nama Lengkap wajib diisi.");
      return;
    }

    try {
      setIsSubmittingProfile(true);
      setEditProfileError(null);

      const payload: UpdateProfilePayload = {
        nama_lengkap: formNamaLengkap.trim(),
        nama_panggilan: formNamaPanggilan.trim() || undefined,
        username: formUsername.trim() || undefined,
        nis: formNis.trim() || undefined,
        jenis_kelamin: formJenisKelamin,
        tempat_lahir: formTempatLahir.trim() || undefined,
        tanggal_lahir: formTanggalLahir || undefined,
        agama: formAgama.trim() || undefined,
        golongan_darah: formGolonganDarah.trim() || undefined,
        alamat_rumah: formAlamat.trim() || undefined,
        catatan: formCatatan.trim() || undefined,
      };

      if (formNilaiTka.trim() && !isNaN(Number(formNilaiTka))) {
        payload.nilai_tka = Number(formNilaiTka);
      }

      const res = await siswaProfileService.updateProfile(payload);
      if (res?.data) {
        setLiveProfile(res.data);
      }

      setNotification({
        type: "success",
        message: res?.message || "Data profil siswa berhasil diperbarui ke database!",
      });
      setIsEditModalOpen(false);
    } catch (err: any) {
      setEditProfileError(
        err?.message || "Terjadi kesalahan saat menyimpan perubahan profil siswa."
      );
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // Buka Modal Ganti Password
  const handleOpenPasswordModal = () => {
    setFormCurrentPassword("");
    setFormNewPassword("");
    setFormConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordError(null);
    setIsPasswordModalOpen(true);
  };

  // Simpan Password Baru ke Backend
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCurrentPassword) {
      setPasswordError("Password saat ini wajib diisi.");
      return;
    }
    if (formNewPassword.length < 8) {
      setPasswordError("Password baru minimal harus 8 karakter.");
      return;
    }
    if (formNewPassword !== formConfirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    try {
      setIsSubmittingPassword(true);
      setPasswordError(null);

      const payload: UpdatePasswordPayload = {
        current_password: formCurrentPassword,
        new_password: formNewPassword,
        new_password_confirmation: formConfirmPassword,
      };

      const res = await siswaProfileService.updatePassword(payload);

      setNotification({
        type: "success",
        message: res?.message || "Password akun berhasil diperbarui! Silakan gunakan password baru saat login berikutnya.",
      });
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      setPasswordError(
        err?.message || "Password saat ini tidak sesuai atau format password baru belum memenuhi syarat."
      );
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Hitung rata-rata rapor live jika tersedia
  const calculatedRataRapor =
    liveProfile?.nilai_rapor && liveProfile.nilai_rapor.length > 0
      ? (
          liveProfile.nilai_rapor.reduce((sum, r) => sum + (Number(r.nilai_akhir) || 0), 0) /
          liveProfile.nilai_rapor.length
        ).toFixed(2)
      : String(currentUser.nilaiRataRata);

  const displayNama = liveProfile?.nama_lengkap || currentUser.name;
  const displayNisn = liveProfile?.nisn || currentUser.nisn;
  const displayEmail = liveProfile?.user?.username
    ? `${liveProfile.user.username}@sman8malang.sch.id`
    : currentUser.email;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Simulator Role & Profil */}
        <section className="bg-gradient-to-r from-[#390460] via-[#5F089E] to-[#7B1FA2] text-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-purple-950/15 flex flex-col md:flex-row items-center justify-between gap-4 border border-purple-400/30">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Layers className="text-amber-300 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold flex items-center gap-1.5 justify-center md:justify-start">
                <span>Simulator Role &amp; Profil</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-400 text-purple-950">
                  LIVE PORTAL
                </span>
              </p>
              <p className="text-xs text-purple-200">
                Data profil terhubung ke backend API Laravel dengan dukungan ganti password berotentikasi Sanctum.
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
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

        {/* Alert Notifikasi Global */}
        {notification && (
          <div
            className={`p-4 rounded-2xl flex items-start gap-3 border shadow-xs animate-in fade-in duration-200 ${
              notification.type === "success"
                ? "bg-[#DCFCE7] border-[#86EFAC] text-[#148557]"
                : "bg-[#FEE4E2] border-[#FECDCA] text-[#D92D20]"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#148557]" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#D92D20]" />
            )}
            <div className="flex-1 text-[13px] font-medium leading-relaxed">
              {notification.message}
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-current opacity-70 hover:opacity-100 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
              alt={displayNama}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Informasi Identitas Pokok */}
          <div className="flex-1 text-center sm:text-left space-y-3 z-10">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {displayNama}
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
                {displayEmail}
              </span>
              {displayNisn && (
                <span>
                  NISN: <b className="text-slate-800">{displayNisn}</b>
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
                onClick={handleOpenEditModal}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#5F089E] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Biodata Siswa</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPasswordModal}
                className="px-4 py-2 rounded-xl border border-purple-200 hover:bg-purple-50 text-[#5F089E] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Lock className="w-3.5 h-3.5 text-purple-600" />
                <span>Ganti Password</span>
              </button>

              <Link
                href="/alumni?tab=direktori"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white font-bold text-xs transition-colors shadow-sm"
              >
                <span>Buka Direktori Alumni </span>
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
                      {calculatedRataRapor} / 100
                    </span>
                  </div>
                  {liveProfile?.nilai_tka && (
                    <div className="flex justify-between items-center py-1 border-t border-slate-100 pt-2">
                      <span className="text-slate-500 font-medium">Nilai TKA (Skolastik)</span>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800">
                        {liveProfile.nilai_tka}
                      </span>
                    </div>
                  )}
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
                    <p className="font-bold text-[#5F089E]">
                      {liveProfile?.rekomendasi_prodi?.[0]?.klaster?.nama_klaster || currentUser.targetProdi}
                    </p>
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

            {/* Card 3: Biodata Lengkap Siswa Terdata */}
            {liveProfile && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 text-[#5F089E] font-bold text-base">
                    <User className="w-5 h-5" />
                    <h2>Biodata Induk &amp; Karakteristik Terverifikasi</h2>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    NIS: {liveProfile.nis || "-"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-medium block">Tempat, Tanggal Lahir</span>
                    <span className="font-bold text-slate-800 text-[13px] mt-0.5 block">
                      {liveProfile.tempat_lahir || "Malang"}, {liveProfile.tanggal_lahir?.substring(0, 10) || "2006-05-15"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-medium block">Jenis Kelamin / Gol. Darah</span>
                    <span className="font-bold text-slate-800 text-[13px] mt-0.5 block">
                      {liveProfile.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} (Gol. {liveProfile.golongan_darah || "O"})
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-medium block">Kode Minat RIASEC</span>
                    <span className="font-bold text-purple-700 text-[13px] mt-0.5 block font-mono">
                      {liveProfile.asesmen_karakteristik?.[0]?.kode_riasec || "IRC"} &bull; {liveProfile.asesmen_karakteristik?.[0]?.kecerdasan_majemuk_dominan || "Logis-Matematis"}
                    </span>
                  </div>
                </div>

                {liveProfile.alamat_rumah && (
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span><strong>Alamat:</strong> {liveProfile.alamat_rumah}</span>
                  </p>
                )}
              </div>
            )}

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
                  <h2>Hak Akses Administrator</h2>
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
                  href="/alumni?tab=direktori"
                  className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 font-bold text-xs flex flex-col justify-between transition-all group"
                >
                  <Users className="w-6 h-6 text-[#5F089E] mb-3 group-hover:scale-110 transition-transform" />
                  <span>Kelola Direktori Alumni</span>
                  <span className="text-[10px] text-purple-600 font-normal mt-1">Tambah, edit &amp; hapus data alumni</span>
                </Link>

                <Link
                  href="/alumni?tab=direktori"
                  className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-bold text-xs flex flex-col justify-between transition-all group"
                >
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
                  <span>Impor Data CSV</span>
                  <span className="text-[10px] text-emerald-600 font-normal mt-1">Impor batch ratusan data kelulusan</span>
                </Link>

                <Link
                  href="/alumni?tab=ai"
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

      {/* ================= MODAL EDIT PROFIL SISWA ================= */}
      {isEditModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingProfile) setIsEditModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-[580px] max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-purple-100 overflow-hidden text-slate-800">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-purple-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#5F089E] text-white flex items-center justify-center shadow-xs">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[15px] text-slate-900">
                    Edit Biodata &amp; Informasi Siswa
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Perbarui data identitas pribadi dan profil akademik Eightracer
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmittingProfile}
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {editProfileError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editProfileError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNamaLengkap}
                    onChange={(e) => setFormNamaLengkap(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    value={formNamaPanggilan}
                    onChange={(e) => setFormNamaPanggilan(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username Login
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIS (Nomor Induk)
                  </label>
                  <input
                    type="text"
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formJenisKelamin}
                    onChange={(e) => setFormJenisKelamin(e.target.value as "L" | "P")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formTempatLahir}
                    onChange={(e) => setFormTempatLahir(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formTanggalLahir}
                    onChange={(e) => setFormTanggalLahir(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Agama
                  </label>
                  <input
                    type="text"
                    value={formAgama}
                    onChange={(e) => setFormAgama(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Golongan Darah
                  </label>
                  <input
                    type="text"
                    value={formGolonganDarah}
                    onChange={(e) => setFormGolonganDarah(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nilai TKA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formNilaiTka}
                    onChange={(e) => setFormNilaiTka(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Rumah
                </label>
                <textarea
                  rows={2}
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan / Minat Siswa
                </label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                />
              </div>

              {/* Footer Modal Form */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingProfile}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="px-5 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL GANTI PASSWORD ================= */}
      {isPasswordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingPassword) setIsPasswordModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-[440px] rounded-3xl bg-white shadow-2xl border border-purple-100 overflow-hidden text-slate-800">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-purple-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center shadow-xs font-black">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[15px] text-slate-900">
                    Ubah Kata Sandi Akun
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pastikan kata sandi baru kuat dan mudah Anda ingat
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmittingPassword}
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSavePassword} className="p-5 sm:p-6 space-y-4 text-xs">
              {passwordError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Password Saat Ini */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password Saat Ini <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    placeholder="Masukkan password akun saat ini"
                    value={formCurrentPassword}
                    onChange={(e) => setFormCurrentPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter kombinasi"
                    value={formNewPassword}
                    onChange={(e) => setFormNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Disarankan memuat huruf besar, huruf kecil, dan angka.
                </p>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Konfirmasi Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Ketik ulang password baru Anda"
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#5F089E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Footer Modal Password */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingPassword}
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-5 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memperbarui...</span>
                    </>
                  ) : (
                    <span>Perbarui Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
