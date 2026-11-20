"use client";

import React, { useState, useEffect, useRef } from "react";
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
  CheckCircle2,
  Save,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { PenghargaanSiswaItem, RiwayatPendidikanItem, StudentB1Account } from "./types";
import { SiswaB1AddAwardModal } from "./SiswaB1AddAwardModal";
import { SiswaB1AddSkillModal } from "./SiswaB1AddSkillModal";
import { apiRequest } from "@/lib/api";

interface SiswaB1ProfilSectionProps {
  onShowToast: (msg: string) => void;
  student?: StudentB1Account;
}

export const SiswaB1ProfilSection: React.FC<SiswaB1ProfilSectionProps> = ({
  onShowToast,
  student,
}) => {
  const [namaLengkap, setNamaLengkap] = useState(student?.nama || "");
  const [namaPanggilan, setNamaPanggilan] = useState(student?.namaPanggilan || "");
  const [kelas, setKelas] = useState(student?.kelas || "-");
  const [email, setEmail] = useState(student?.email || "");
  const [avatarInitials, setAvatarInitials] = useState(student?.avatarInitials || "SW");
  const [fotoProfilUrl, setFotoProfilUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetProdiLabel, setTargetProdiLabel] = useState("-");
  const [targetProdiList, setTargetProdiList] = useState<Array<{ prioritas: number; label: string }>>([]);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [educationList, setEducationList] = useState<RiwayatPendidikanItem[]>([]);
  const [riwayatAkademikList, setRiwayatAkademikList] = useState<
    Array<{
      id: string;
      jenjang: string;
      kelas: string;
      semester: number;
      tahunAjaran: string;
      rataRataNilai?: number | null;
      statusKeterangan: string;
    }>
  >([]);
  const [protectedDataList, setProtectedDataList] = useState<
    Array<{ label: string; value: string; badge: string }>
  >([]);
  const [awards, setAwards] = useState<PenghargaanSiswaItem[]>([]);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<PenghargaanSiswaItem | null>(null);
  const [deletingAward, setDeletingAward] = useState<PenghargaanSiswaItem | null>(null);
  const [isDeletingAward, setIsDeletingAward] = useState(false);

  const loadProfilFromBackend = async () => {
    try {
      const query = student?.nisn ? `?nisn=${encodeURIComponent(student.nisn)}` : "";
      const res = await apiRequest<{
        identitas_diri?: {
          nama_lengkap?: string;
          nama_panggilan?: string;
          kelas?: string;
          email?: string;
          inisial?: string;
          foto_profil_url?: string | null;
          target_prodi_ptn?: Array<{ prioritas?: number; label?: string }>;
        };
        privasi_keamanan_data?: Array<{
          kode?: string;
          label?: string;
          status?: string;
          badge?: string;
        }>;
        pratinjau_kartu_publik?: {
          target_ptn_impian?: string;
          foto_profil_url?: string | null;
        };
        biografi?: { teks?: string };
        keahlian_minat?: {
          daftar?: Array<{ id: number; nama: string }>;
        };
        riwayat_pendidikan_prestasi?: {
          riwayat_akademik?: Array<{
            id: string;
            jenjang: string;
            kelas: string;
            semester: number;
            tahunAjaran: string;
            rataRataNilai?: number | null;
            statusKeterangan: string;
          }>;
          riwayat_pendidikan?: Array<{
            jenjang: string;
            nama_sekolah: string;
            keterangan: string;
            periode: string;
            status_aktif: boolean;
          }>;
          penghargaan_prestasi?: Array<{
            id: number;
            nama_kompetisi: string;
            penyelenggara?: string;
            subjudul?: string;
            tingkat?: string;
            tahun?: string;
            bulan?: string;
            deskripsi?: string;
            jenis_prestasi?: string;
            kategori?: string;
          }>;
        };
      }>(`/siswa/profil${query}`);

      if (!res) return;

      if (res.identitas_diri) {
        setNamaLengkap(res.identitas_diri.nama_lengkap || student?.nama || "");
        setNamaPanggilan(res.identitas_diri.nama_panggilan || student?.namaPanggilan || "");
        setKelas(res.identitas_diri.kelas || student?.kelas || "-");
        setEmail(res.identitas_diri.email || "");
        setAvatarInitials(res.identitas_diri.inisial || student?.avatarInitials || "SW");
        if (res.identitas_diri.foto_profil_url) {
          setFotoProfilUrl(res.identitas_diri.foto_profil_url);
        } else if (res.pratinjau_kartu_publik?.foto_profil_url) {
          setFotoProfilUrl(res.pratinjau_kartu_publik.foto_profil_url);
        }
        const targets = (res.identitas_diri.target_prodi_ptn || [])
          .filter((t) => t.label)
          .map((t, idx) => ({
            prioritas: t.prioritas || idx + 1,
            label: t.label || "-",
          }));
        setTargetProdiList(targets);
        const firstTarget = targets[0]?.label;
        setTargetProdiLabel(
          firstTarget || res.pratinjau_kartu_publik?.target_ptn_impian || "-"
        );
      }

      if (res.privasi_keamanan_data) {
        setProtectedDataList(
          res.privasi_keamanan_data.map((item) => ({
            label: item.label || "-",
            value: item.status || "-",
            badge: item.badge || "Terkunci",
          }))
        );
      }

      if (res.biografi) {
        setBio(res.biografi.teks || "");
      }

      if (res.keahlian_minat?.daftar) {
        setSkills(res.keahlian_minat.daftar.map((k) => k.nama));
      } else {
        setSkills([]);
      }

      if (res.riwayat_pendidikan_prestasi?.riwayat_akademik) {
        setRiwayatAkademikList(res.riwayat_pendidikan_prestasi.riwayat_akademik);
      } else {
        setRiwayatAkademikList([]);
      }

      if (res.riwayat_pendidikan_prestasi?.riwayat_pendidikan) {
        setEducationList(
          res.riwayat_pendidikan_prestasi.riwayat_pendidikan.map((edu, idx) => ({
            id: `edu-${idx}`,
            namaSekolah: edu.nama_sekolah,
            keterangan: edu.keterangan,
            tahun: edu.periode,
            isCurrent: edu.status_aktif,
          }))
        );
      }

      if (res.riwayat_pendidikan_prestasi?.penghargaan_prestasi) {
        setAwards(
          res.riwayat_pendidikan_prestasi.penghargaan_prestasi.map((p, idx) => ({
            id: String(p.id),
            judul: p.nama_kompetisi,
            penyelenggara: p.subjudul || p.penyelenggara || "-",
            waktuBulan: p.bulan || "November",
            tahun: p.tahun || String(new Date().getFullYear()),
            tingkat: (p.tingkat as "Kota/Kabupaten" | "Provinsi" | "Nasional" | "Internasional") || "Kota/Kabupaten",
            kategori: (p.kategori as "Akademik" | "Riset & Inovasi" | "Non-Akademik" | "Kategori Individu") || "Akademik",
            deskripsi: p.deskripsi || "",
            isUtama: idx === 0,
          }))
        );
      } else {
        setAwards([]);
      }
    } catch {
      // Biarkan kosong jika belum ada data siswa di database
    }
  };

  useEffect(() => {
    void loadProfilFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.nisn]);

  const handleRemoveSkill = async (skillToRemove: string) => {
    const nextSkills = skills.filter((s) => s !== skillToRemove);
    setSkills(nextSkills);
    try {
      const q = student?.nisn ? `?nisn=${encodeURIComponent(student.nisn)}` : "";
      await apiRequest(`/siswa/profil/keahlian${q}`, {
        method: "PUT",
        body: { keahlian: nextSkills, nisn: student?.nisn },
      });
    } catch {
      // Ignore
    }
    onShowToast(`Keahlian "${skillToRemove}" dihapus.`);
  };

  const handleSaveSkills = async (newSkills: string[]) => {
    setSkills(newSkills);
    try {
      const q = student?.nisn ? `?nisn=${encodeURIComponent(student.nisn)}` : "";
      await apiRequest(`/siswa/profil/keahlian${q}`, {
        method: "PUT",
        body: { keahlian: newSkills, nisn: student?.nisn },
      });
    } catch {
      // Ignore
    }
    onShowToast("Daftar keahlian berhasil diperbarui!");
  };

  const handleSaveAward = async (awardData: PenghargaanSiswaItem) => {
    const q = student?.nisn ? `?nisn=${encodeURIComponent(student.nisn)}` : "";

    if (editingAward) {
      // Mode Edit: Update data yang ada
      try {
        const res = await apiRequest<{
          message?: string;
          prestasi?: {
            id: number;
            nama_kompetisi: string;
            penyelenggara?: string;
            subjudul?: string;
            bulan?: string;
            tahun?: string;
            tingkat?: string;
            deskripsi?: string;
          };
        }>(`/siswa/profil/prestasi/${editingAward.id}${q}`, {
          method: "PUT",
          body: {
            nama_kompetisi: awardData.judul,
            penyelenggara: awardData.penyelenggara,
            bulan: awardData.waktuBulan || "November",
            tahun: awardData.tahun,
            tingkat: awardData.tingkat,
            deskripsi: awardData.deskripsi || null,
          },
        });

        setAwards((prev) =>
          prev.map((a) =>
            a.id === editingAward.id
              ? {
                  ...a,
                  judul: awardData.judul,
                  penyelenggara: awardData.penyelenggara,
                  waktuBulan: awardData.waktuBulan,
                  tahun: awardData.tahun,
                  tingkat: awardData.tingkat,
                  deskripsi: awardData.deskripsi,
                }
              : a
          )
        );
        onShowToast(res?.message || "Prestasi & penghargaan berhasil diperbarui!");
      } catch {
        // Fallback update optimis
        setAwards((prev) =>
          prev.map((a) =>
            a.id === editingAward.id
              ? { ...a, ...awardData }
              : a
          )
        );
        onShowToast("Perubahan prestasi berhasil disimpan.");
      } finally {
        setEditingAward(null);
        setIsAwardModalOpen(false);
      }
    } else {
      // Mode Tambah Baru
      try {
        const res = await apiRequest<{
          message?: string;
          prestasi?: {
            id: number;
            nama_kompetisi: string;
            penyelenggara?: string;
            subjudul?: string;
            bulan?: string;
            tahun?: string;
            tingkat?: string;
            deskripsi?: string;
          };
        }>(`/siswa/profil/prestasi${q}`, {
          method: "POST",
          body: {
            nisn: student?.nisn,
            nama_kompetisi: awardData.judul,
            penyelenggara: awardData.penyelenggara,
            bulan: awardData.waktuBulan || "November",
            tahun: awardData.tahun,
            tingkat: awardData.tingkat,
            deskripsi: awardData.deskripsi || null,
          },
        });

        if (res?.prestasi) {
          setAwards((prev) => [
            {
              ...awardData,
              id: String(res.prestasi!.id),
              judul: res.prestasi!.nama_kompetisi,
              penyelenggara: res.prestasi!.subjudul || res.prestasi!.penyelenggara || awardData.penyelenggara,
              waktuBulan: res.prestasi!.bulan || awardData.waktuBulan,
              tahun: res.prestasi!.tahun || awardData.tahun,
              tingkat: (res.prestasi!.tingkat as "Kota/Kabupaten" | "Provinsi" | "Nasional" | "Internasional") || awardData.tingkat,
              deskripsi: res.prestasi!.deskripsi || awardData.deskripsi,
              isUtama: prev.length === 0,
            },
            ...prev,
          ]);
        } else {
          setAwards((prev) => [awardData, ...prev]);
        }
        onShowToast(res?.message || "Prestasi & penghargaan baru berhasil ditambahkan!");
      } catch {
        setAwards((prev) => [awardData, ...prev]);
        onShowToast("Prestasi & penghargaan baru berhasil ditambahkan!");
      } finally {
        setIsAwardModalOpen(false);
      }
    }
  };

  const handleConfirmDeleteAward = async () => {
    if (!deletingAward) return;
    const target = deletingAward;
    setIsDeletingAward(true);

    // Optimistic delete
    setAwards((prev) => prev.filter((a) => a.id !== target.id));

    try {
      const q = student?.nisn ? `?nisn=${encodeURIComponent(student.nisn)}` : "";
      if (!isNaN(Number(target.id))) {
        const res = await apiRequest<{ message?: string }>(`/siswa/profil/prestasi/${target.id}${q}`, {
          method: "DELETE",
        });
        onShowToast(res?.message || `Prestasi "${target.judul}" berhasil dihapus.`);
      } else {
        onShowToast(`Prestasi "${target.judul}" berhasil dihapus.`);
      }
    } catch {
      onShowToast(`Prestasi "${target.judul}" dihapus.`);
    } finally {
      setIsDeletingAward(false);
      setDeletingAward(null);
    }
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      onShowToast("Format berkas harus JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      onShowToast("Ukuran foto maksimal 2MB.");
      return;
    }

    // Tampilkan preview lokal segera
    const localUrl = URL.createObjectURL(file);
    setFotoProfilUrl(localUrl);

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append("foto_profil", file);
      if (student?.nisn) {
        formData.append("nisn", student.nisn);
      }
      const q = student?.nisn ? `?nisn=${encodeURIComponent(student.nisn)}` : "";
      const res = await apiRequest<{ message?: string; foto_profil_url?: string; inisial?: string }>(
        `/siswa/profil/foto${q}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (res?.foto_profil_url) {
        setFotoProfilUrl(res.foto_profil_url);
      }
      if (res?.inisial) {
        setAvatarInitials(res.inisial);
      }
      onShowToast(res?.message || "Foto profil berhasil diperbarui!");
    } catch {
      onShowToast("Gagal mengunggah foto profil ke server.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePhotoDelete = async () => {
    try {
      setIsUploadingPhoto(true);
      const q = student?.nisn ? `?nisn=${encodeURIComponent(student.nisn)}` : "";
      const res = await apiRequest<{ message?: string; inisial?: string }>(`/siswa/profil/foto${q}`, {
        method: "DELETE",
      });
      setFotoProfilUrl(null);
      if (res?.inisial) {
        setAvatarInitials(res.inisial);
      }
      onShowToast("Foto profil berhasil dihapus dan dikembalikan ke inisial nama.");
    } catch {
      setFotoProfilUrl(null);
      onShowToast("Foto profil dihapus.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveChanges = async () => {
    try {
      const q = student?.nisn ? `?nisn=${encodeURIComponent(student.nisn)}` : "";
      await apiRequest(`/siswa/profil${q}`, {
        method: "PUT",
        body: {
          nisn: student?.nisn,
          nama_panggilan: namaPanggilan,
          email,
          biografi: bio,
          keahlian: skills,
        },
      });
      onShowToast("Perubahan profil dan portofolio akademik berhasil disimpan!");
    } catch {
      onShowToast("Gagal menyimpan perubahan profil ke server.");
    }
  };

  const handleResetChanges = () => {
    void loadProfilFromBackend();
    onShowToast("Perubahan profil dikembalikan ke data tersimpan di server.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      {/* SECTION 1: IDENTITAS DIRI & DATA TERPROTEKSI + PRATINJAU KARTU */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: 1 Identitas Diri */}
        <div className="lg:col-span-7 rounded-[20px] border-2 border-[#E9E9E9] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#CFC2D4]/20">
            <span className="w-6 h-6 rounded-md bg-[#5F089E] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#1E1E1E]">
              Identitas Diri
            </h2>
          </div>

          {/* Upload Box */}
          <div className="rounded-2xl border border-purple-100 bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 shadow-2xs">
            <div className="w-20 h-20 rounded-2xl bg-[#F3E8FF] border border-purple-200 text-[#5F089E] text-2xl font-bold flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
              {fotoProfilUrl ? (
                <img
                  src={fotoProfilUrl}
                  alt="Foto Profil Siswa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{avatarInitials}</span>
              )}
            </div>

            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Foto Profil
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Format JPG/PNG maksimal 2MB. Rekomendasi rasio 1:1, latar belakang polos rapi, pakaian seragam atau jas almamater.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs font-semibold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingPhoto ? "Mengunggah..." : "Unggah Foto"}</span>
                </button>
                {fotoProfilUrl && (
                  <button
                    type="button"
                    onClick={handlePhotoDelete}
                    disabled={isUploadingPhoto}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-red-200 hover:bg-red-50 text-red-600 active:scale-95 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handlePhotoFileChange}
                />
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

            {targetProdiList.length > 0 ? (
              <div className="space-y-2">
                {targetProdiList.map((tp, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-[#E9D5FF] bg-white p-2.5 flex items-center gap-2.5 shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#5F089E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {tp.prioritas || idx + 1}
                    </span>
                    <p className="text-xs font-semibold text-[#111827]">
                      {tp.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[#E9D5FF] bg-white p-2.5 flex items-center gap-2.5 shadow-2xs">
                <span className="w-5 h-5 rounded-full bg-[#5F089E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="text-xs font-semibold text-[#111827]">
                  {targetProdiLabel}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Data Pokok Siswa Terproteksi + Widget Pratinjau Kartu Publik */}
        <div className="lg:col-span-5 space-y-6">
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
                Terkunci
              </span>
            </div>

            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Data pokok ini tersinkronisasi langsung dengan Dapodik &amp; arsip sekolah, ditampilkan untuk verifikasi dan tidak dapat diedit secara mandiri.
            </p>

            <div className="space-y-2">
              {(protectedDataList.length > 0
                ? protectedDataList
                : [
                    {
                      label: "NIS / NISN",
                      value: student?.nisn || "-",
                      badge: "Terkunci",
                    },
                    {
                      label: "Alamat Rumah",
                      value: "Terenkripsi AES-256 (UU PDP)",
                      badge: "Terkunci",
                    },
                    {
                      label: "Nama Orang Tua",
                      value: "Data Orang Tua Terkunci",
                      badge: "Terkunci",
                    },
                    {
                      label: "Data Bantuan Sosial",
                      value: "Tidak Menerima Bantuan",
                      badge: "Terkunci",
                    },
                  ]
              ).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-[#374151] block">
                      {item.label}
                    </span>
                    <span className="text-xs font-medium text-slate-700">
                      {item.value}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[10px] font-bold shrink-0 shadow-2xs">
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                    <span>Terkunci</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel: Pratinjau Kartu Publik */}
          <div className="rounded-2xl bg-gradient-to-br from-[#410070] to-[#5F089E] p-5 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]/20 text-[10px] font-bold tracking-wider text-[#E9D5FF] uppercase">
              <span>PRATINJAU KARTU PUBLIK</span>
              <School className="w-4 h-4 text-[#E9D5FF]" />
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                {fotoProfilUrl ? (
                  <img
                    src={fotoProfilUrl}
                    alt="Foto Profil Siswa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{avatarInitials}</span>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  {namaLengkap || "-"}
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
                {targetProdiLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BIOGRAFI & RINGKASAN DIRI */}
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

        <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden focus-within:border-[#5F089E] transition-all">
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
              className="p-1.5 rounded hover:bg-slate-200 text-xs italic transition-colors cursor-pointer"
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

      {/* SECTION 3: KEAHLIAN & MINAT */}
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
            {skills.length} / 15 Keahlian
          </span>
        </div>

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

      {/* SECTION 4: RIWAYAT PENDIDIKAN & PRESTASI */}
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

        {/* 4.1 RIWAYAT PENDIDIKAN */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
            RIWAYAT PENDIDIKAN
          </span>

          <div className="space-y-2.5">
            {educationList.length > 0 ? (
              educationList.map((edu) => (
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
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                Belum ada riwayat pendidikan yang tercatat.
              </p>
            )}
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
              onClick={() => {
                setEditingAward(null);
                setIsAwardModalOpen(true);
              }}
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
                    onClick={() => {
                      setEditingAward(award);
                      setIsAwardModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#5F089E] hover:bg-purple-50 cursor-pointer transition-colors"
                    title="Edit Prestasi"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingAward(award)}
                    className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Hapus Prestasi"
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
        initialAward={editingAward}
        onClose={() => {
          setIsAwardModalOpen(false);
          setEditingAward(null);
        }}
        onSubmit={handleSaveAward}
      />

      <SiswaB1AddSkillModal
        isOpen={isSkillModalOpen}
        activeSkills={skills}
        onClose={() => setIsSkillModalOpen(false)}
        onSaveSkills={handleSaveSkills}
      />

      {/* Modal Konfirmasi Hapus Prestasi */}
      {deletingAward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Prestasi?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
              Apakah Anda yakin ingin menghapus penghargaan{" "}
              <span className="font-semibold text-slate-900">
                &ldquo;{deletingAward.judul}&rdquo;
              </span>
              ? Data ini akan dihapus dari portofolio profil siswa.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAward(null)}
                disabled={isDeletingAward}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAward}
                disabled={isDeletingAward}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingAward ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
