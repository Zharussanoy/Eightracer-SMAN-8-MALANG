"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Plus,
  Trophy,
  Award,
  GraduationCap,
  School,
  Edit2,
  Trash2,
  X,
  Bold,
  Italic,
  List,
  Code,
  Sparkles,
  Camera,
  History,
  CheckCircle2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { PenghargaanSiswaItem, RiwayatPendidikanItem, StudentB1Account } from "./types";
import {
  INITIAL_AWARDS,
  INITIAL_SKILLS,
  INITIAL_EDUCATION,
  SISWA_B1_PROFILE,
} from "./mockData";
import { SiswaB1AddAwardModal } from "./SiswaB1AddAwardModal";
import { SiswaB1AddSkillModal } from "./SiswaB1AddSkillModal";

interface SiswaB1ProfilSectionProps {
  onShowToast: (msg: string) => void;
  student?: StudentB1Account;
}

export const SiswaB1ProfilSection: React.FC<SiswaB1ProfilSectionProps> = ({
  onShowToast,
  student,
}) => {
  // 1. Identitas Diri state
  const [namaLengkap, setNamaLengkap] = useState(student?.nama || "Amalia Mayasari");
  const [namaPanggilan, setNamaPanggilan] = useState(student?.namaPanggilan || "Amalia");
  const [kelas, setKelas] = useState(student?.kelas || "X - 3");
  const [email, setEmail] = useState(student?.email || "amalia.mayasari@siswa.sman8malang.sch.id");
  const [avatarInitials, setAvatarInitials] = useState(student?.avatarInitials || "AM");

  // Sync state when student switches
  useEffect(() => {
    if (student) {
      setNamaLengkap(student.nama);
      setNamaPanggilan(student.namaPanggilan);
      setKelas(student.kelas);
      setEmail(student.email);
      setAvatarInitials(student.avatarInitials);
    }
  }, [student]);

  // 2. Biografi state
  const [bio, setBio] = useState(
    "Siswa kelas XII SMAN 8 Kota Malang yang memiliki minat mendalam di bidang pemrograman, kecerdasan buatan, dan sains data. Aktif mengembangkan proyek teknologi terbuka dan berambisi melanjutkan studi di Teknik Informatika ITS."
  );

  // 3. Keahlian & Minat state
  const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  // 4. Riwayat Pendidikan & Prestasi state
  const [educationList] = useState<RiwayatPendidikanItem[]>(INITIAL_EDUCATION);
  const [awards, setAwards] = useState<PenghargaanSiswaItem[]>(INITIAL_AWARDS);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  // Handlers
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
    onShowToast(`Keahlian "${skillToRemove}" dihapus.`);
  };

  const handleSaveSkills = (newSkills: string[]) => {
    setSkills(newSkills);
    onShowToast("Daftar keahlian berhasil diperbarui!");
  };

  const handleAddAward = (newAward: PenghargaanSiswaItem) => {
    setAwards((prev) => [newAward, ...prev]);
    onShowToast("Prestasi & penghargaan baru berhasil ditambahkan!");
  };

  const handleDeleteAward = (id: string) => {
    setAwards((prev) => prev.filter((a) => a.id !== id));
    onShowToast("Data prestasi dihapus.");
  };

  const handlePhotoUpload = () => {
    onShowToast("Foto profil diperbarui (simulasi upload berhasil).");
  };

  const handlePhotoDelete = () => {
    setAvatarInitials("AM");
    onShowToast("Foto profil dikembalikan ke inisial nama.");
  };

  const handleSaveChanges = () => {
    onShowToast("Perubahan profil dan portofolio akademik berhasil disimpan!");
  };

  const handleResetChanges = () => {
    if (student) {
      setNamaLengkap(student.nama);
      setNamaPanggilan(student.namaPanggilan);
      setKelas(student.kelas);
      setEmail(student.email);
      setAvatarInitials(student.avatarInitials);
    }
    setBio(
      "Siswa kelas XII SMAN 8 Kota Malang yang memiliki minat mendalam di bidang pemrograman, kecerdasan buatan, dan sains data. Aktif mengembangkan proyek teknologi terbuka dan berambisi melanjutkan studi di Teknik Informatika ITS."
    );
    setSkills(INITIAL_SKILLS);
    setAwards(INITIAL_AWARDS);
    onShowToast("Perubahan profil dikembalikan ke data awal.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      {/* ========================================================== */}
      {/* SECTION 1: IDENTITAS DIRI & DATA TERPROTEKSI + PRATINJAU KARTU */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: 1 Identitas Diri */}
        <div className="lg:col-span-7 rounded-[20px] border-2 border-[#E9E9E9] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
          {/* Header 1 Identitas Diri */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#CFC2D4]/20">
            <span className="w-6 h-6 rounded-md bg-[#5F089E] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#1E1E1E]">
              Identitas Diri
            </h2>
          </div>

          {/* Upload Box */}
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#EFE6F5] border-2 border-[#E9D5FF] text-[#5F089E] text-2xl font-extrabold flex items-center justify-center shadow-xs shrink-0">
              {avatarInitials}
            </div>

            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <h3 className="text-xs font-bold text-[#111827]">
                Unggah Foto Profil
              </h3>
              <p className="text-[11px] text-[#6B7280] leading-relaxed max-w-sm">
                Rekomendasi rasio 1:1, latar belakang polos rapi, pakaian seragam SMARIHASTA atau jas almamater. Maks. 2MB (JPG, PNG).
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePhotoUpload}
                  className="px-3.5 py-1.5 rounded-lg bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs font-semibold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Ganti Foto</span>
                </button>
                <button
                  type="button"
                  onClick={handlePhotoDelete}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] hover:bg-slate-50 hover:text-slate-900 active:scale-95 text-[#4B5563] text-xs font-semibold transition-all duration-200 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#000000] block">
                Nama Lengkap Siswa
              </label>
              <input
                type="text"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-[#1E1E1E] bg-[#F2F4F7] border border-[#CFC2D4]/30 rounded-lg px-3.5 py-2.5 outline-none focus:border-[#5F089E]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#000000] block">
                Nama Panggilan
              </label>
              <input
                type="text"
                value={namaPanggilan}
                onChange={(e) => setNamaPanggilan(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-[#1E1E1E] bg-[#F2F4F7] border border-[#CFC2D4]/30 rounded-lg px-3.5 py-2.5 outline-none focus:border-[#5F089E]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#000000] block">
                Kelas
              </label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-[#1E1E1E] bg-[#F2F4F7] border border-[#CFC2D4]/30 rounded-lg px-3.5 py-2.5 outline-none focus:border-[#5F089E]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#000000] block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-[#1E1E1E] bg-[#F2F4F7] border border-[#CFC2D4]/30 rounded-lg px-3.5 py-2.5 outline-none focus:border-[#5F089E]"
              />
            </div>
          </div>

          {/* Target Prodi SNBP Box */}
          <div className="rounded-xl border border-[#F3E8FF] bg-[#FAF5FF]/50 p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#5F089E] flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </span>
              <h4 className="text-xs font-bold text-[#111827]">
                Target Program Studi &amp; Perguruan Tinggi Impian
              </h4>
            </div>

            <div className="rounded-lg border border-[#E9D5FF] bg-white p-2.5 flex items-center gap-2.5 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-[#5F089E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <p className="text-xs font-semibold text-[#111827]">
                {SISWA_B1_PROFILE.targetProdiUtama} - {SISWA_B1_PROFILE.targetKampusUtama}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Data Pokok Siswa Terproteksi + Widget Pratinjau Kartu Publik */}
        <div className="lg:col-span-5 space-y-6">
          {/* Data Pokok Siswa Terproteksi Card (Hanya Baca / Read-Only) */}
          <div className="rounded-[20px] border-2 border-[#E9E9E9] bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5F089E]" />
                <h3 className="text-xs font-bold text-[#111827]">
                  Data Pokok Siswa Terproteksi
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                <Lock className="w-2.5 h-2.5" />
                Read-Only
              </span>
            </div>

            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Data pokok ini tersinkronisasi langsung dengan Dapodik &amp; arsip sekolah, ditampilkan untuk verifikasi dan tidak dapat diedit secara mandiri.
            </p>

            <div className="space-y-2">
              {[
                {
                  label: "Nomor Induk Kependudukan (NIK)",
                  value: "357301******0004",
                  badge: "Terkunci",
                },
                {
                  label: "Alamat Rumah & RT/RW",
                  value: "Jl. Simpang Borobudur No. 18, Malang",
                  badge: "Terkunci",
                },
                {
                  label: "Status Bantuan Sosial / PIP",
                  value: "Bukan Penerima KIP / PIP",
                  badge: "Terverifikasi",
                },
                {
                  label: "Catatan Layanan Konseling",
                  value: "Arsip Khusus Bimbingan Konseling",
                  badge: "Privat BK",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-[#374151] block">
                      {item.label}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-700">
                      {item.value}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[10px] font-bold shrink-0 shadow-2xs">
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                    <span>{item.badge}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-1 border-t border-slate-100 text-[11px] text-[#854D0E] bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>Untuk perubahan data pokok di atas, silakan mengajukan permohonan ke loket Tata Usaha atau Koordinator BK SMAN 8 Malang.</span>
            </div>
          </div>

          {/* Panel: Pratinjau Kartu Publik (Widget Ringkas) */}
          <div className="rounded-2xl bg-gradient-to-br from-[#410070] to-[#5F089E] p-5 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]/20 text-[10px] font-bold tracking-wider text-[#E9D5FF] uppercase">
              <span>PRATINJAU KARTU PUBLIK</span>
              <School className="w-4 h-4 text-[#E9D5FF]" />
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {avatarInitials}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  {namaLengkap}
                </h4>
                <p className="text-[10px] text-[#E9D5FF] mt-0.5">
                  {kelas} &bull; SMARIHASTA
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-black/20 p-3 space-y-1">
              <span className="text-[9px] font-bold tracking-wider text-[#FCC850] uppercase block">
                TARGET PTN IMPIAN:
              </span>
              <p className="text-xs font-semibold text-white">
                {SISWA_B1_PROFILE.targetProdiUtama} - ITS Surabaya
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 2: BIOGRAFI & RINGKASAN DIRI */}
      {/* ========================================================== */}
      <div className="rounded-[20px] border-2 border-[#E9E9E9] bg-white p-6 sm:p-8 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#CFC2D4]/20">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-[#5F089E] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#1E1E1E]">
                Biografi &amp; Ringkasan Diri
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Ceritakan sedikit tentang dirimu...
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-[#9CA3AF] self-end sm:self-auto">
            {bio.length} / 500 Karakter
          </span>
        </div>

        {/* Rich Editor Box with Toolbar */}
        <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden focus-within:border-[#5F089E] transition-all">
          {/* Toolbar */}
          <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-3 py-2 flex items-center gap-1.5 text-[#1F2937]">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-slate-200 text-xs font-serif italic transition-colors cursor-pointer"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
              title="Code / Monospace"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1" />
            <span className="text-[11px] text-[#9CA3AF]">
              Format teks markdown didukung
            </span>
          </div>

          <textarea
            maxLength={500}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-4 text-xs sm:text-sm text-[#1F2937] leading-relaxed bg-white outline-none resize-none"
            placeholder="Tuliskan minat akademik, aspirasi karier, dan proyek yang sedang kamu tekuni..."
          />
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 3: KEAHLIAN & MINAT */}
      {/* ========================================================== */}
      <div className="rounded-[20px] border-2 border-[#E9E9E9] bg-white p-6 sm:p-8 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#CFC2D4]/20">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-[#5F089E] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#1E1E1E]">
              Keahlian &amp; Minat
            </h2>
          </div>
          <span className="text-xs font-medium text-[#9CA3AF] self-end sm:self-auto">
            {skills.length} / 10 Keahlian
          </span>
        </div>

        {/* Skill Badges & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {skills.map((skill, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FAF5FF] border border-[#E9D5FF] text-[#5F089E] text-xs font-medium group transition-all"
            >
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="w-3.5 h-3.5 rounded-full hover:bg-purple-200/80 flex items-center justify-center cursor-pointer transition-colors"
                title={`Hapus ${skill}`}
              >
                <X className="w-3 h-3 text-[#5F089E]" />
              </button>
              <span>{skill}</span>
            </div>
          ))}

          {/* Button Tambah Keahlian */}
          <button
            type="button"
            onClick={() => setIsSkillModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-[#5F089E] hover:bg-purple-50 text-[#5F089E] text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Keahlian</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 4: RIWAYAT PENDIDIKAN & PRESTASI */}
      {/* ========================================================== */}
      <div className="rounded-[20px] border-2 border-[#E9E9E9] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex items-center gap-3 pb-3 border-b border-[#CFC2D4]/20">
          <span className="w-6 h-6 rounded-md bg-[#5F089E] text-white text-xs font-bold flex items-center justify-center">
            4
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1E1E1E]">
              Riwayat Pendidikan &amp; Prestasi
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Tambahkan riwayat prestasi atau pencapaianmu...
            </p>
          </div>
        </div>

        {/* 4.0 RIWAYAT KELAS & SEMESTER AKADEMIK (KETENTUAN 8) */}
        {student?.riwayatAkademik && student.riwayatAkademik.length > 0 && (
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#5F089E]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
                RIWAYAT KELAS &amp; SEMESTER (Fase Akademik)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {student.riwayatAkademik.map((rw) => (
                <div
                  key={rw.id}
                  className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40 flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#5F089E] text-white">
                        Jenjang {rw.jenjang}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Kelas {rw.kelas} &bull; Smt {rw.semester}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Tahun Ajaran: {rw.tahunAjaran}
                    </p>
                    <p className="text-[10px] text-purple-900/80 mt-1 font-semibold">
                      {rw.statusKeterangan}
                    </p>
                  </div>
                  {rw.rataRataNilai && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Rerata
                      </span>
                      <span className="text-sm font-extrabold text-[#5F089E]">
                        {rw.rataRataNilai.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4.1 RIWAYAT PENDIDIKAN */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
            RIWAYAT PENDIDIKAN
          </span>

          <div className="space-y-2.5">
            {educationList.map((edu) => (
              <div
                key={edu.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                  edu.isCurrent
                    ? "bg-[#FAF5FF]/40 border-[#F3E8FF]"
                    : "bg-[#F9FAFB] border-[#F3F4F6]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      edu.isCurrent
                        ? "bg-[#5F089E] text-white"
                        : "bg-white border border-[#E5E7EB] text-[#4B5563]"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">
                      {edu.namaSekolah}
                    </h4>
                    <p
                      className={`text-[11px] ${
                        edu.isCurrent ? "text-[#7E22CE]" : "text-[#6B7280]"
                      }`}
                    >
                      {edu.keterangan}
                    </p>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  {edu.isCurrent ? (
                    <span className="px-2.5 py-1 rounded-md bg-[#5F089E] text-white text-[11px] font-bold">
                      {edu.tahun}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-[#6B7280] text-[11px] font-semibold">
                      {edu.tahun}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4.2 PENGHARGAAN & PRESTASI */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
              PENGHARGAAN &amp; PRESTASI
            </span>

            <button
              type="button"
              onClick={() => setIsAwardModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-semibold text-[#374151] transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#374151]" />
              <span>Tambah Prestasi</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {awards.map((award) => (
              <div
                key={award.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                  award.isUtama
                    ? "bg-[#FFFBEB]/50 border-[#FDE68A]/80"
                    : "bg-white border-[#E5E7EB]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      award.isUtama
                        ? "bg-[#FEF3C7] text-[#B45309]"
                        : "bg-[#F3F4F6] text-[#374151]"
                    }`}
                  >
                    {award.isUtama ? (
                      <Trophy className="w-4 h-4" />
                    ) : (
                      <Award className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">
                      {award.judul}
                    </h4>
                    <p className="text-[11px] text-[#6B7280]">
                      {award.penyelenggara}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() =>
                      onShowToast(`Menampilkan detail penghargaan: ${award.judul}`)
                    }
                    className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAward(award.id)}
                    className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {awards.length === 0 && (
              <p className="text-xs text-slate-400 py-3 text-center">
                Belum ada data penghargaan. Klik &ldquo;Tambah Prestasi&rdquo; untuk menambahkan.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Button Simpan Perubahan di Akhir Halaman */}
      <div className="rounded-[20px] border-2 border-[#E9E9E9] bg-white p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#5F089E] flex items-center justify-center shrink-0 shadow-2xs">
            <Save className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1E1E1E]">
              Simpan Pembaruan Profil &amp; Portofolio
            </h4>
            <p className="text-xs text-[#737373] mt-0.5">
              Simpan seluruh perubahan informasi profil, biografi, keahlian, dan prestasi akademik siswa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleResetChanges}
            className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] hover:bg-slate-100 hover:text-slate-900 active:scale-95 text-slate-600 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-xl hover:shadow-purple-950/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <SiswaB1AddAwardModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        onSubmit={handleAddAward}
      />

      <SiswaB1AddSkillModal
        isOpen={isSkillModalOpen}
        activeSkills={skills}
        onClose={() => setIsSkillModalOpen(false)}
        onSaveSkills={handleSaveSkills}
      />
    </div>
  );
};

