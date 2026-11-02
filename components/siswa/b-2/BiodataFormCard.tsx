"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { BiodataSiswa, DAFTAR_KELAS_B2 } from "./mockDataSiswa";
import {
  Save,
  X,
  Database,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

interface BiodataFormCardProps {
  biodata: BiodataSiswa;
  isEditing: boolean;
  onSave: (updated: BiodataSiswa) => void;
  onCancel: () => void;
  onEnableEdit: () => void;
}

export default function BiodataFormCard({
  biodata,
  isEditing,
  onSave,
  onCancel,
  onEnableEdit,
}: BiodataFormCardProps) {
  const [formData, setFormData] = useState<BiodataSiswa>(biodata);
  const [showToast, setShowToast] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleInputChange = (
    field: keyof BiodataSiswa,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleSimulateSync = () => {
    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 1000);
  };

  return (
    <div
      className="flex flex-col gap-5 h-full justify-between"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      {showToast && (
        <div className="p-3.5 px-4 rounded-xl bg-[#E0F5E8] border border-[#B7E7CB] text-[#148557] flex items-center justify-between gap-3 shadow-xs transition-all animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold">
              Biodata berhasil disimpan ke pratinjau profil.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="text-current hover:opacity-75 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="rounded-[24px] border-2 border-[#5F089E] bg-[#FAF7FD] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-xl text-[#101828]">
            Formulir Biodata
          </h2>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                isEditing
                  ? "bg-purple-100 text-[#5F089E] border-[#DECFE8]"
                  : "bg-white text-slate-500 border-slate-200"
              }`}
            >
              {isEditing ? "Mode Edit" : "Mode Pratinjau"}
            </span>

            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setFormData(biodata);
                  onEnableEdit();
                }}
                className="px-3 py-1 rounded-lg text-xs font-bold text-[#5F089E] hover:bg-[#EFE6F5] transition-colors cursor-pointer"
              >
                Ubah
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label
              htmlFor="form-nama"
              className="text-xs sm:text-sm font-medium text-[#344054] mb-1.5 block"
            >
              Nama Lengkap
            </label>

            <input
              id="form-nama"
              type="text"
              readOnly={!isEditing}
              value={isEditing ? formData.nama : biodata.nama}
              onChange={(e) =>
                handleInputChange("nama", e.target.value)
              }
              className={`w-full px-5 py-3 h-[52px] rounded-[16px] border-2 border-[#5F089E] bg-white font-bold text-base text-[#101828] outline-none transition-all ${
                isEditing
                  ? "focus:ring-2 focus:ring-[#5F089E]/20"
                  : "cursor-default"
              }`}
            />
          </div>

          {/* Kelas */}
          <div>
            <label
              htmlFor="form-kelas"
              className="text-xs sm:text-sm font-medium text-[#344054] mb-1.5 block"
            >
              Kelas
            </label>

            <div className="relative w-full max-w-[260px]">
              {isEditing ? (
                <select
                  id="form-kelas"
                  value={formData.kelas}
                  onChange={(e) =>
                    handleInputChange("kelas", e.target.value)
                  }
                  className="w-full px-5 py-3 h-[52px] rounded-[16px] border-2 border-[#5F089E] bg-white font-bold text-base text-[#101828] outline-none appearance-none cursor-pointer pr-10 focus:ring-2 focus:ring-[#5F089E]/20"
                >
                  {DAFTAR_KELAS_B2.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="form-kelas"
                  type="text"
                  readOnly
                  value={biodata.kelas}
                  className="w-full px-5 py-3 h-[52px] rounded-[16px] border-2 border-[#5F089E] bg-white font-bold text-base text-[#101828] outline-none pr-10 cursor-default"
                />
              )}

              {isEditing && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#101828]">
                  <ChevronDown className="w-5 h-5 font-bold stroke-[2.5]" />
                </div>
              )}
            </div>
          </div>

          {/* Tempat dan Tanggal Lahir serta Jenis Kelamin */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Tempat Lahir */}
              <div>
                <label
                  htmlFor="form-tempat-lahir"
                  className="text-xs sm:text-sm font-medium text-[#344054] mb-1.5 block"
                >
                  Tempat Lahir
                </label>

                <input
                  id="form-tempat-lahir"
                  type="text"
                  readOnly={!isEditing}
                  value={
                    isEditing
                      ? formData.tempatLahir
                      : biodata.tempatLahir
                  }
                  onChange={(e) =>
                    handleInputChange("tempatLahir", e.target.value)
                  }
                  className={`w-full px-4 py-3 h-[52px] rounded-[16px] border-2 border-[#5F089E] bg-white font-bold text-base text-[#101828] outline-none transition-all ${
                    isEditing
                      ? "focus:ring-2 focus:ring-[#5F089E]/20"
                      : "cursor-default"
                  }`}
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label
                  htmlFor="form-tgl-lahir"
                  className="text-xs sm:text-sm font-medium text-[#344054] mb-1.5 block"
                >
                  Tanggal Lahir
                </label>

                <input
                  id="form-tgl-lahir"
                  type="text"
                  readOnly={!isEditing}
                  value={
                    isEditing
                      ? formData.tanggalLahir
                      : biodata.tanggalLahir
                  }
                  onChange={(e) =>
                    handleInputChange("tanggalLahir", e.target.value)
                  }
                  placeholder="MM/DD/YYYY"
                  className={`w-full px-4 py-3 h-[52px] rounded-[16px] border-2 border-[#5F089E] bg-white font-bold text-base text-[#101828] outline-none transition-all ${
                    isEditing
                      ? "focus:ring-2 focus:ring-[#5F089E]/20"
                      : "cursor-default"
                  }`}
                />
              </div>
            </div>

            {/* Jenis Kelamin — JSX sudah diperbaiki */}
            <div>
              <label
                htmlFor="form-jk"
                className="text-xs sm:text-sm font-medium text-[#344054] mb-1.5 block"
              >
                Jenis Kelamin
              </label>

              <div className="relative">
                {isEditing ? (
                  <select
                    id="form-jk"
                    value={formData.jenisKelamin}
                    onChange={(e) =>
                      handleInputChange(
                        "jenisKelamin",
                        e.target.value as "Laki-laki" | "Perempuan"
                      )
                    }
                    className="w-full px-4 py-3 h-[52px] rounded-[16px] border-2 border-[#5F089E] bg-white font-bold text-base text-[#101828] outline-none appearance-none cursor-pointer pr-9 focus:ring-2 focus:ring-[#5F089E]/20"
                  >
                    <option value="Laki-laki">Laki Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                ) : (
                  <input
                    id="form-jk"
                    type="text"
                    readOnly
                    value={
                      biodata.jenisKelamin === "Laki-laki"
                        ? "Laki Laki"
                        : biodata.jenisKelamin
                    }
                    className="w-full px-4 py-3 h-[52px] rounded-[16px] border-2 border-[#5F089E] bg-white font-bold text-base text-[#101828] outline-none pr-9 cursor-default"
                  />
                )}

                {isEditing && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#101828]">
                    <ChevronDown className="w-5 h-5 font-bold stroke-[2.5]" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NIS / NISN */}
          <div className="pt-1">
            <label
              htmlFor="form-nis"
              className="text-xs sm:text-sm font-medium text-[#344054] mb-1.5 block"
            >
              NIS / NISN
            </label>

            <input
              id="form-nis"
              type="text"
              readOnly={!isEditing}
              value={isEditing ? formData.nis : biodata.nis}
              onChange={(e) =>
                handleInputChange("nis", e.target.value)
              }
              className={`w-full max-w-[155px] px-4 py-3 h-[52px] rounded-[16px] border-2 border-[#5F089E] bg-white font-bold text-base text-[#101828] text-center outline-none transition-all ${
                isEditing
                  ? "focus:ring-2 focus:ring-[#5F089E]/20"
                  : "cursor-default"
              }`}
            />
          </div>

          {/* Tombol Simpan dan Batal */}
          {isEditing && (
            <div className="pt-4 border-t border-[#EAECF0] flex items-center justify-end gap-3 animate-in fade-in">
              <button
                type="button"
                onClick={() => {
                  setFormData(biodata);
                  onCancel();
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Batal
              </button>

              <button
                type="submit"
                id="btn-simpan-biodata"
                className="px-5 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4E0682] text-white font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Perubahan
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Sinkronisasi Data */}
      <div className="rounded-[16px] border border-[#DECFE8] bg-[#EFE6F5]/50 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#5F089E] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Database className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-bold text-sm text-[#101828] leading-tight">
              Sinkronisasi Pangkalan Data Sekolah & Siswa (PDSS)
            </h3>

            <p className="text-xs text-[#667085] mt-0.5 leading-normal">
              NISN dan NIK telah terhubung dengan server Pusat Data dan
              Teknologi Informasi Kemendikbudristek.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulateSync}
          disabled={isSyncing}
          className="self-start sm:self-center shrink-0 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#DECFE8] text-[11px] font-bold text-[#5F089E] hover:bg-white flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          title="Klik untuk simulasi sinkronisasi"
        >
          {isSyncing ? (
            <RefreshCw className="w-3 h-3 animate-spin text-[#5F089E]" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#5F089E]" />
          )}

          <span>
            {isSyncing ? "Menyinkronkan..." : "Terhubung (API v3.2)"}
          </span>
        </button>
      </div>
    </div>
  );
}