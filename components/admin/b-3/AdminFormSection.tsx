"use client";

import React, { useState } from "react";
import {
  FileText,
  School,
  Building2,
  Award,
  Briefcase,
  CheckCircle2,
  Save,
} from "lucide-react";
import { AdminRole, B3Role } from "./types";
import { FormDataPendataan } from "@/types/user";

interface AdminFormSectionProps {
  role?: AdminRole | B3Role;
  onSaveSuccess?: (data: FormDataPendataan) => void;
}

const DEFAULT_B3_FORM: FormDataPendataan = {
  nisn: "0054819283",
  nama: "Naysilla Salsa Ardiyati",
  angkatan: "Alumni 2024",
  tahunLulus: 2024,
  kampus: "Universitas Brawijaya",
  kampusKode: "UB",
  jurusan: "Teknik Informatika",
  jenjang: "S1",
  jalur: "SNBP",
  statusPenerimaan: "Lolos / Diterima",
  nilaiRapor: 94.5,
  skorUtbk: null,
  pekerjaan: "Mahasiswa Aktif & Praktisi IT",
  isKipk: true,
  sertifikat: [
    "Juara 1 Olimpiade Sains & Informatika Tingkat Provinsi",
    "Finalis National Logic & Programming Competition",
  ],
};

export default function AdminFormSection({
  role = "alumni",
  onSaveSuccess,
}: AdminFormSectionProps) {
  // Hooks MUST be declared unconditionally at top level
  const [formState, setFormState] = useState<FormDataPendataan>(DEFAULT_B3_FORM);
  const [toastSuccess, setToastSuccess] = useState(false);

  // Jika bukan role alumni atau admin, jangan tampilkan formulir
  if (role !== "alumni" && role !== "admin") {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
        <p className="text-slate-500 text-sm">
          Formulir Pendataan hanya dapat diakses oleh Alumni atau Admin.
        </p>
      </div>
    );
  }

  const handleFieldChange = (
    field: keyof FormDataPendataan,
    val: string | number | boolean | null
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveSuccess) {
      onSaveSuccess(formState);
    }
    setToastSuccess(true);
    setTimeout(() => {
      setToastSuccess(false);
    }, 3000);
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-9 shadow-sm border border-slate-200/80 space-y-6">
      {/* Header Form */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#5F089E] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Formulir Pendataan Alumni
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pendataan terpadu riwayat kelolosan perguruan tinggi, nilai rapor, dan jenjang studi alumni SMAN 8 Malang (Fitur B3).
          </p>
        </div>
      </div>

      {/* Alert Toast Sukses Simpan */}
      {toastSuccess && (
        <div className="p-4 rounded-2xl bg-purple-700 text-white flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>Data pendataan alumni berhasil disimpan!</span>
          </div>
        </div>
      )}

      {/* ================= FORM BODY ================= */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Bagian 1: Identitas Alumni */}
        <div>
          <h3 className="text-xs font-black uppercase text-purple-800 tracking-wider mb-3 flex items-center gap-1.5">
            <School className="w-4 h-4" />
            1. Data Identitas &amp; Kelulusan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                NISN
              </label>
              <input
                type="text"
                value={formState.nisn}
                onChange={(e) => handleFieldChange("nisn", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap Siswa / Alumni
              </label>
              <input
                type="text"
                value={formState.nama}
                onChange={(e) => handleFieldChange("nama", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Angkatan Kelulusan
              </label>
              <select
                value={formState.angkatan}
                onChange={(e) => {
                  const angk = e.target.value;
                  handleFieldChange("angkatan", angk);
                  const yr = parseInt(angk.replace(/\D/g, "")) || 2024;
                  handleFieldChange("tahunLulus", yr);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              >
                <option value="Alumni 2024">Alumni 2024</option>
                <option value="Alumni 2023">Alumni 2023</option>
                <option value="Alumni 2022">Alumni 2022</option>
                <option value="Alumni 2021">Alumni 2021</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bagian 2: Perguruan Tinggi & Kelolosan */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase text-purple-800 tracking-wider mb-3 flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            2. Data Perguruan Tinggi &amp; Kelolosan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Perguruan Tinggi (PTN / PTS)
              </label>
              <input
                type="text"
                value={formState.kampus}
                onChange={(e) => handleFieldChange("kampus", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kode Kampus (Singkatan)
              </label>
              <input
                type="text"
                value={formState.kampusKode}
                onChange={(e) => handleFieldChange("kampusKode", e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jenjang Studi
              </label>
              <select
                value={formState.jenjang}
                onChange={(e) => handleFieldChange("jenjang", e.target.value as "S1" | "D4" | "D3")}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              >
                <option value="S1">S1 (Sarjana)</option>
                <option value="D4">D4 (Sarjana Terapan)</option>
                <option value="D3">D3 (Diploma Tiga)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Program Studi / Jurusan
              </label>
              <input
                type="text"
                value={formState.jurusan}
                onChange={(e) => handleFieldChange("jurusan", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jalur Masuk
              </label>
              <select
                value={formState.jalur}
                onChange={(e) => handleFieldChange("jalur", e.target.value as "SNBP" | "SNBT" | "Mandiri")}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              >
                <option value="SNBP">SNBP (Jalur Prestasi)</option>
                <option value="SNBT">SNBT (Jalur Tes UTBK)</option>
                <option value="Mandiri">Mandiri / Kedinasan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status Penerimaan
              </label>
              <input
                type="text"
                value={formState.statusPenerimaan}
                onChange={(e) => handleFieldChange("statusPenerimaan", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>
          </div>
        </div>

        {/* Bagian 3: Nilai Akademik & Prestasi */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase text-purple-800 tracking-wider mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            3. Nilai Rapor &amp; Skor UTBK
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rata-rata Nilai Rapor (Sem 1 - 5)
              </label>
              <input
                type="number"
                step="0.1"
                value={formState.nilaiRapor}
                onChange={(e) => handleFieldChange("nilaiRapor", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Skor UTBK (Jika Ada / SNBT)
              </label>
              <input
                type="number"
                placeholder="Kosongkan jika SNBP"
                value={formState.skorUtbk ?? ""}
                onChange={(e) =>
                  handleFieldChange(
                    "skorUtbk",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Penerima KIP-Kuliah
              </label>
              <select
                value={formState.isKipk ? "ya" : "tidak"}
                onChange={(e) => handleFieldChange("isKipk", e.target.value === "ya")}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              >
                <option value="ya">Ya (Penerima KIP-Kuliah)</option>
                <option value="tidak">Tidak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bagian 4: Karir / Pekerjaan Terkini */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase text-purple-800 tracking-wider mb-3 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            4. Perkembangan Karir &amp; Pekerjaan Saat Ini
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Aktivitas / Karir Terkini (Khusus Alumni)
            </label>
            <input
              type="text"
              placeholder="Contoh: Mahasiswa Aktif, Software Engineer, Data Scientist, dll"
              value={formState.pekerjaan || ""}
              onChange={(e) => handleFieldChange("pekerjaan", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
            />
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#5F089E] hover:bg-[#4d0680] text-white transition-all shadow-md shadow-purple-950/15 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Data Pendataan</span>
          </button>
        </div>
      </form>
    </section>
  );
}
