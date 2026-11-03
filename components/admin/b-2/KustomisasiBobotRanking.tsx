"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Pencil,
  Plus,
  X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface KomponenBobot {
  id: string;
  nama: string;
  deskripsi: string;
  bobot: number;
}

export const OPSI_JENIS_VARIABEL = [
  {
    nama: "Nilai TKA",
    deskripsiDefault: "Akademik",
  },
  {
    nama: "Rata-Rata raport semester 1-5",
    deskripsiDefault: "Akademik · Nilai rata-rata kumulatif siswa semester 1-5",
  },
  {
    nama: "Prestasi Akademik",
    deskripsiDefault: "Olimpiade, lomba, kompetisi akademik",
  },
  {
    nama: "Prestasi Non-Akademik",
    deskripsiDefault: "Olahraga, seni, organisasi, dan lainnya",
  },
  {
    nama: "Catatan Karakter",
    deskripsiDefault: "Evaluasi sikap, kedisiplinan, dan rekam jejak siswa",
  },
];

const INITIAL_BOBOT_ITEMS: KomponenBobot[] = [
  {
    id: "1",
    nama: "Rata-rata rapor semester 1-5",
    deskripsi: "Akademik • Nilai rata-rata kumulatif siswa semester 1-5",
    bobot: 40,
  },
  {
    id: "2",
    nama: "Prestasi akademik",
    deskripsi: "Olimpiade, lomba, kompetisi akademik",
    bobot: 25,
  },
  {
    id: "3",
    nama: "Prestasi non-akademik",
    deskripsi: "Olahraga, seni, organisasi, dan lainnya",
    bobot: 20,
  },
  {
    id: "4",
    nama: "Nilai TKA",
    deskripsi: "Akademik",
    bobot: 15,
  },
];

export default function KustomisasiBobotRanking() {
  const [items, setItems] = useState<KomponenBobot[]>(INITIAL_BOBOT_ITEMS);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedJenis, setSelectedJenis] = useState(OPSI_JENIS_VARIABEL[1].nama);
  const [deskripsi, setDeskripsi] = useState(OPSI_JENIS_VARIABEL[1].deskripsiDefault);
  const [bobot, setBobot] = useState<number | "">(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<KomponenBobot | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const totalBobot = items.reduce((sum, item) => sum + (Number(item.bobot) || 0), 0);
  const isValidTotal = totalBobot === 100;

  const handleOpenAddModal = () => {
    setSelectedJenis("Rata-Rata raport semester 1-5");
    setDeskripsi("Akademik · Nilai rata-rata kumulatif siswa semester 1-5");
    setBobot(0);
    setIsDropdownOpen(false);
    setModalError(null);
    setIsAddModalOpen(true);
  };

  const handleSelectJenis = (opsi: (typeof OPSI_JENIS_VARIABEL)[0]) => {
    setSelectedJenis(opsi.nama);
    setDeskripsi(opsi.deskripsiDefault);
    setIsDropdownOpen(false);
    setModalError(null);
  };

  const handleBobotChange = (id: string, val: string) => {
    const num = val === "" ? 0 : Math.max(0, Math.min(100, Number(val)));
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, bobot: num } : item))
    );
    if (notification) setNotification(null);
  };

  const handleDeleteItem = (id: string) => {
    if (items.length <= 1) {
      setNotification({
        type: "error",
        message: "Minimal harus ada 1 komponen penilaian.",
      });
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    setNotification({
      type: "success",
      message: "Komponen berhasil dihapus.",
    });
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();

    const bobotAngka = Number(bobot);

    if (isNaN(bobotAngka) || bobotAngka < 0) {
      setModalError("Persentase bobot tidak boleh bernilai negatif.");
      return;
    }

    if (totalBobot + bobotAngka > 100) {
      setModalError(
        `Total bobot tidak boleh melebihi 100%. Total saat ini ${totalBobot}%, sisa kuota bobot yang tersedia adalah ${Math.max(
          0,
          100 - totalBobot
        )}%.`
      );
      return;
    }

    const newItem: KomponenBobot = {
      id: Date.now().toString(),
      nama: selectedJenis,
      deskripsi: deskripsi.trim() || "Kriteria tambahan",
      bobot: bobotAngka,
    };

    setItems((prev) => [...prev, newItem]);
    setIsAddModalOpen(false);
    setNotification({
      type: "success",
      message: `Variabel "${newItem.nama}" (${newItem.bobot}%) berhasil ditambahkan ke daftar bobot ranking.`,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setItems((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    setEditingItem(null);
    setNotification({
      type: "success",
      message: "Perubahan komponen berhasil disimpan.",
    });
  };

  const handleSimpanDanHitung = () => {
    if (!isValidTotal) {
      setNotification({
        type: "error",
        message: `Total bobot saat ini ${totalBobot}%. Pastikan total bobot tepat 100% sebelum menyimpan.`,
      });
      return;
    }

    setNotification({
      type: "success",
      message:
        "Bobot penilaian berhasil disimpan! Skor dan ranking seluruh siswa telah dihitung ulang secara otomatis.",
    });
  };

  return (
    <div
      className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 py-8 text-[#1F1729]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="mb-6">
        <Link
          href="/admin/b2"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6941C6] hover:text-[#53389E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Admin B2</span>
        </Link>
      </div>

      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 border shadow-xs animate-in fade-in duration-200 ${notification.type === "success"
              ? "bg-[#DCFCE7] border-[#86EFAC] text-[#148557]"
              : "bg-[#FEE4E2] border-[#FECDCA] text-[#D92D20]"
            }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-[13px] leading-relaxed">
            {notification.message}
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#EAECF0] shadow-sm p-6 sm:p-8">
        <div className="border-b border-[#EAECF0] pb-5 mb-6">
          <h1
            className="text-[22px] sm:text-[24px] font-bold text-[#1F1729] leading-tight"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Kustomisasi Bobot Ranking
          </h1>
          <p className="text-[13px] text-[#6E6678] mt-1.5">
            Sesuaikan persentase kontribusi setiap variabel.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_130px_90px] items-center text-[11px] font-semibold text-[#475467] uppercase tracking-wider pb-3 border-b border-[#EAECF0] px-2">
          <span>KOMPONEN</span>
          <span className="text-center">BOBOT (%)</span>
          <span className="text-right pr-2">AKSI</span>
        </div>

        <div className="divide-y divide-[#EAECF0]">
          {items.map((item, index) => {
            const formattedIndex = String(index + 1).padStart(2, "0");
            return (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_130px_90px] items-center gap-3 py-4.5 px-2 hover:bg-[#F9F5FF] rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3.5 pr-2">
                  <div className="w-9 h-9 rounded-lg bg-[#F4EBFF] text-[#6941C6] border border-[#E9D7FE] flex items-center justify-center font-bold text-[12px] shrink-0 mt-0.5">
                    {formattedIndex}
                  </div>
                  <div>
                    <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#1F1729] leading-snug">
                      {item.nama}
                    </h3>
                    <p className="text-[11px] sm:text-[12px] text-[#6E6678] mt-0.5 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative flex items-center w-24">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.bobot === 0 ? "" : item.bobot}
                      placeholder="0"
                      onChange={(e) => handleBobotChange(item.id, e.target.value)}
                      className="w-full h-10 px-3 pr-7 rounded-lg border border-[#D0D5DD] bg-white text-center text-[14px] font-semibold text-[#1F1729] outline-none focus:border-[#7F56D9] focus:ring-2 focus:ring-[#7F56D9]/15 transition-all"
                    />
                    <span className="absolute right-3 text-[13px] font-semibold text-[#6E6678] pointer-events-none">
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pr-1">
                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    title="Edit Variabel"
                    className="p-1.5 rounded-md text-[#6941C6] hover:bg-[#F4EBFF] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Hapus Variabel"
                    className="p-1.5 rounded-md text-[#D92D20] hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#EAECF0] flex items-center justify-between px-2">
          <span className="text-[13px] font-medium text-[#6E6678]">
            Total Akumulasi Bobot:
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`text-[16px] font-bold ${isValidTotal ? "text-[#148557]" : "text-[#D92D20]"
                }`}
            >
              {totalBobot}%
            </span>
            {isValidTotal ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#148557] text-[11px] font-bold">
                ✓ Sesuai (100%)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FEE4E2] text-[#D92D20] text-[11px] font-bold">
                Wajib 100% ({totalBobot > 100 ? `Kelebihan ${totalBobot - 100}%` : `Kurang ${100 - totalBobot}%`})
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-[#EAECF0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[#D0D5DD] hover:border-[#7F56D9] text-[#6941C6] text-[13px] font-semibold hover:bg-[#F9F5FF] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#7F56D9]" />
            <span>Tambah variabel baru</span>
          </button>

          <button
            type="button"
            onClick={handleSimpanDanHitung}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${isValidTotal
                ? "bg-[#7F56D9] hover:bg-[#6941C6] active:bg-[#53389E]"
                : "bg-[#7F56D9]/50 hover:bg-[#7F56D9]/60"
              }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Simpan & hitung ulang</span>
          </button>
        </div>

        <div className="mt-6 text-[12px] text-[#6E6678] space-y-1 px-1">
          <p>Perubahan akan menghitung ulang skor dan memperbarui ranking siswa.</p>
          <p>Pastikan total bobot = 100% sebelum menyimpan.</p>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-[560px] w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <div className="border-b border-[#EAECF0] pb-4 mb-6">
              <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1F1729] leading-tight">
                Tambah variabel penilaian
              </h2>
              <p className="text-[13px] text-[#6E6678] mt-1">
                Tambahkan komponen baru ke dalam perhitungan ranking.
              </p>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-5">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-[#FEE4E2] border border-[#FECDCA] text-[#D92D20] text-[12px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="relative">
                <label className="block text-[13px] font-medium text-[#1F1729] mb-2">
                  Jenis Variabel
                </label>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="w-full h-[50px] px-4 rounded-xl border border-[#D0D5DD] bg-white flex items-center justify-between text-left cursor-pointer hover:border-[#7F56D9] focus:outline-none focus:ring-2 focus:ring-[#7F56D9]/15 transition-all"
                >
                  <span className="text-[14px] font-medium text-[#6941C6] truncate">
                    {selectedJenis}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#6941C6] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white rounded-2xl shadow-xl border border-[#EAECF0] p-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[260px] overflow-y-auto">
                    {OPSI_JENIS_VARIABEL.map((opsi) => {
                      const isSelected = selectedJenis === opsi.nama;
                      return (
                        <div
                          key={opsi.nama}
                          onClick={() => handleSelectJenis(opsi)}
                          className={`w-full px-4 py-3 rounded-xl text-[14px] font-medium transition-all cursor-pointer flex items-center justify-between ${isSelected
                              ? "bg-[#F4EBFF] text-[#6941C6] font-semibold border border-[#E9D7FE]"
                              : "text-[#344054] hover:bg-[#F9F5FF] hover:text-[#6941C6] border border-transparent"
                            }`}
                        >
                          <span>{opsi.nama}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#6941C6] stroke-[2.5]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1F1729] mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Deskripsi komponen penilaian..."
                  className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] text-[13px] text-[#475467] outline-none focus:border-[#7F56D9] focus:ring-2 focus:ring-[#7F56D9]/15 resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1F1729] mb-2">
                  Bobot (%)
                </label>
                <div className="relative w-[110px]">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={bobot === 0 ? "0" : bobot}
                    onChange={(e) => {
                      setModalError(null);
                      setBobot(
                        e.target.value === "" ? "" : Number(e.target.value)
                      );
                    }}
                    className="w-full h-[46px] px-4 rounded-xl border border-[#D0D5DD] text-[14px] font-medium text-[#1F1729] outline-none focus:border-[#7F56D9] focus:ring-2 focus:ring-[#7F56D9]/15 transition-all text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#EAECF0] mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-7 py-2.5 rounded-xl border border-[#D0D5DD] text-[14px] font-medium text-[#344054] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-[#7F56D9] hover:bg-[#6941C6] active:bg-[#53389E] text-[14px] font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="font-bold text-[16px] text-[#1F1729]">
                Edit Variabel Penilaian
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#1F1729] mb-1">
                  Nama Komponen
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.nama}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, nama: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#D0D5DD] text-[13px] outline-none focus:border-[#7F56D9]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1F1729] mb-1">
                  Deskripsi / Kategori
                </label>
                <input
                  type="text"
                  value={editingItem.deskripsi}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, deskripsi: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#D0D5DD] text-[13px] outline-none focus:border-[#7F56D9]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1F1729] mb-1">
                  Persentase Bobot (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={editingItem.bobot}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      bobot: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#D0D5DD] text-[13px] outline-none focus:border-[#7F56D9]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-[13px] font-semibold bg-[#7F56D9] hover:bg-[#6941C6] text-white"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}