"use client";

import React, { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { PenghargaanSiswaItem } from "./types";

interface SiswaB1AddAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (award: PenghargaanSiswaItem) => void;
}

export const SiswaB1AddAwardModal: React.FC<SiswaB1AddAwardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [judul, setJudul] = useState(
    "Juara 2 OSN Informatika Kota Malang 2024"
  );
  const [penyelenggara, setPenyelenggara] = useState(
    "Pusat Prestasi Nasional (Puspresnas) - Kemendikbudristek"
  );
  const [bulan, setBulan] = useState("November");
  const [tahun, setTahun] = useState("2024");
  const [tingkat, setTingkat] = useState<
    "Kota/Kabupaten" | "Provinsi" | "Nasional" | "Internasional"
  >("Kota/Kabupaten");
  const [deskripsi, setDeskripsi] = useState(
    "Kompetisi pemrograman algoritma dan penalaran logika tingkat SMA se-Kota Malang."
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !penyelenggara.trim()) return;

    const newAward: PenghargaanSiswaItem = {
      id: `awd-${Date.now()}`,
      judul: judul.trim(),
      penyelenggara: penyelenggara.trim(),
      waktuBulan: bulan,
      tahun: tahun.trim(),
      tingkat: tingkat,
      kategori: "Akademik",
      deskripsi: deskripsi.trim(),
      isUtama: false,
    };

    onSubmit(newAward);
    onClose();
  };

  const tingkatOptions: ("Kota/Kabupaten" | "Provinsi" | "Nasional" | "Internasional")[] = [
    "Kota/Kabupaten",
    "Provinsi",
    "Nasional",
    "Internasional",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className="w-full max-w-[640px] bg-white rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 flex items-start justify-between border-b border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-white">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1F1A22] tracking-tight">
              Tambah Prestasi &amp; Penghargaan
            </h2>
            <p className="text-xs sm:text-sm text-[#4C4452]">
              Cantumkan rekam jejak capaian akademik, kompetisi, atau karya ilmiah.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FBF0FC] hover:bg-[#F3E8FF] flex items-center justify-center text-[#4C4452] transition-colors cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Field 1: Judul Penghargaan */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#1F1A22] block">
              Judul Penghargaan / Nama Kompetisi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full text-xs sm:text-sm text-[#1F1A22] bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 outline-none focus:border-[#5F089E] focus:ring-1 focus:ring-[#5F089E] transition-all"
              placeholder="Contoh: Juara 2 OSN Informatika Kota Malang 2024"
            />
          </div>

          {/* Field 2: Penerbit / Instansi */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#1F1A22] block">
              Penerbit / Instansi Penyelenggara <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={penyelenggara}
              onChange={(e) => setPenyelenggara(e.target.value)}
              className="w-full text-xs sm:text-sm text-[#1F1A22] bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 outline-none focus:border-[#5F089E] focus:ring-1 focus:ring-[#5F089E] transition-all"
              placeholder="Pusat Prestasi Nasional (Puspresnas) - Kemendikbudristek"
            />
          </div>

          {/* Field 3 & 4: Waktu Perolehan & Tingkat Kompetisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Waktu Perolehan */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-[#1F1A22] block">
                Waktu Perolehan <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  className="w-full text-xs sm:text-sm text-[#1F1A22] bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 outline-none focus:border-[#5F089E] cursor-pointer"
                >
                  {[
                    "Januari",
                    "Februari",
                    "Maret",
                    "April",
                    "Mei",
                    "Juni",
                    "Juli",
                    "Agustus",
                    "September",
                    "Oktober",
                    "November",
                    "Desember",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full text-xs sm:text-sm text-[#1F1A22] bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 outline-none focus:border-[#5F089E] cursor-pointer"
                >
                  {["2026", "2025", "2024", "2023", "2022", "2021"].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tingkat Kompetisi */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-[#1F1A22] block">
                Tingkat Kompetisi <span className="text-rose-500">*</span>
              </label>
              <select
                value={tingkat}
                onChange={(e) =>
                  setTingkat(
                    e.target.value as "Kota/Kabupaten" | "Provinsi" | "Nasional" | "Internasional"
                  )
                }
                className="w-full text-xs sm:text-sm text-[#1F1A22] bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 outline-none focus:border-[#5F089E] cursor-pointer"
              >
                {tingkatOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Pill Selector */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-[#4C4452]">Pilihan cepat:</span>
            {tingkatOptions.map((t) => {
              const isSelected = tingkat === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTingkat(t)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#410070] text-white"
                      : "bg-[#F5EBF7] text-[#4C4452] hover:bg-[#ebdcf0]"
                  }`}
                >
                  {t === "Kota/Kabupaten" ? "Kota/Kab" : t}
                </button>
              );
            })}
          </div>

          {/* Field 5: Deskripsi Singkat */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-[#1F1A22]">
                Deskripsi Singkat <span className="text-xs font-normal text-[#4C4452]">(Opsional)</span>
              </label>
              <span className="text-xs text-[#4C4452]">
                {deskripsi.length}/250
              </span>
            </div>
            <textarea
              maxLength={250}
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full text-xs sm:text-sm text-[#1F1A22] bg-white border border-[#E5E7EB] rounded-xl p-3 outline-none focus:border-[#5F089E] focus:ring-1 focus:ring-[#5F089E] transition-all resize-none"
              placeholder="Ceritakan ringkasan pencapaian..."
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#4C4452] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Simpan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

