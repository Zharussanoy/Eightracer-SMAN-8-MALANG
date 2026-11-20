"use client";

import { useState } from "react";
import { X, AlertTriangle, Send } from "lucide-react";
import { StudentB1WaliKelas } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentB1WaliKelas;
  onSubmit: (note: string, updatedBukuRapor?: number) => void;
}

export default function WaliKelasB1RevisiModal({
  isOpen,
  onClose,
  student,
  onSubmit,
}: Props) {
  const availableMapelList = student.daftarNilaiPilihan && student.daftarNilaiPilihan.length > 0
    ? student.daftarNilaiPilihan
    : [student.mapelDiscrepancy || { namaMapel: "KIMIA", inputMandiri: 86.0, bukuRapor: 90.0, selisih: -4.0 }];

  // Prioritaskan memilih mapel yang pertama kali ada selisih
  const initialIndex = availableMapelList.findIndex((m) => m.adaSelisih || Math.abs(m.selisih) >= 0.1);
  const [selectedMapelIdx, setSelectedMapelIdx] = useState<number>(initialIndex >= 0 ? initialIndex : 0);

  const currentMapel = availableMapelList[selectedMapelIdx] || availableMapelList[0];

  const [note, setNote] = useState(
    "Terdapat perbedaan angka nilai rapor. Mohon periksa kembali dan sesuaikan dengan buku rapor fisikmu."
  );

  const [bukuRaporValue, setBukuRaporValue] = useState<number>(currentMapel.bukuRapor);

  const handleSelectMapel = (idx: number) => {
    setSelectedMapelIdx(idx);
    const chosen = availableMapelList[idx];
    if (chosen) {
      setBukuRaporValue(chosen.bukuRapor);
    }
  };

  if (!isOpen) return null;

  const selisihTerkini = currentMapel.inputMandiri - bukuRaporValue;

  const handleSend = () => {
    onSubmit(note, bukuRaporValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[560px] max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 pt-5 pb-3.5 border-b border-slate-100 bg-white">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#5F089E] uppercase">
              Perbaikan Nilai Rapor
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {currentMapel.namaMapel} ({student.semester})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollable jika layar pendek) */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-3.5">
          {/* Tab Selector Mapel jika ada lebih dari 1 */}
          {availableMapelList.length > 1 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Pilih Mata Pelajaran yang Direvisi:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {availableMapelList.map((m, idx) => {
                  const isSelected = selectedMapelIdx === idx;
                  const hasDiff = m.adaSelisih || Math.abs(m.selisih) >= 0.1;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectMapel(idx)}
                      className={`text-left p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#5F089E] bg-purple-50 text-[#5F089E] shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{m.namaMapel}</span>
                        {hasDiff && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 ml-1" />
                        )}
                      </div>
                      <span className="text-[10px] font-normal text-slate-400 block mt-0.5">
                        Input: {m.inputMandiri.toFixed(1)} &bull; Rapor: {m.bukuRapor.toFixed(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Identitas Siswa Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Identitas Siswa
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {student.nama}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                NISN: {student.nisn} &bull; {student.semester}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 text-[#5F089E]">
                KELAS {student.kelas}
              </span>
            </div>
          </div>

          {/* Hasil Komparasi Verifikasi */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hasil Komparasi: {currentMapel.namaMapel}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="border-2 border-slate-200 rounded-xl p-2.5 text-center bg-white shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Input Siswa
                </span>
                <span className="text-2xl font-extrabold text-[#5F089E] mt-0.5 block">
                  {currentMapel.inputMandiri.toFixed(1)}
                </span>
              </div>
              <div className="border-2 border-rose-200 rounded-xl p-2.5 text-center bg-rose-50/40 shadow-xs">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                  Sesuai Rapor Fisik (Koreksi)
                </span>
                <div className="mt-0.5 flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={bukuRaporValue}
                    onChange={(e) => setBukuRaporValue(parseFloat(e.target.value) || 0)}
                    className="w-20 text-center text-xl font-extrabold text-[#BA1A1A] border border-rose-300 rounded-lg bg-white px-2 py-0.5 outline-none focus:ring-2 focus:ring-[#5F089E]"
                  />
                  <span className="text-xs font-semibold text-rose-600">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Selisih */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold">
                Terdapat Selisih {selisihTerkini > 0 ? `+${selisihTerkini.toFixed(1)}` : selisihTerkini.toFixed(1)} Poin.
              </span>{" "}
              Nilai yang diinputkan siswa ({currentMapel.inputMandiri.toFixed(1)}) berbeda dari catatan buku rapor fisik ({bukuRaporValue.toFixed(1)}).
            </div>
          </div>

          {/* Input Catatan Koreksi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Catatan Koreksi Wali Kelas:
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuliskan instruksi atau konfirmasi perbedaan nilai untuk siswa..."
              className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5F089E] focus:border-transparent resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer (Selalu terlihat di bagian bawah modal) */}
        <div className="shrink-0 flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 bg-slate-50/90 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#5F089E] hover:bg-[#4E0782] rounded-xl shadow-md shadow-purple-900/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Minta Revisi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

