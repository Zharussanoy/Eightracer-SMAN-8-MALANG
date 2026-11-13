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
  const [note, setNote] = useState(
    "Terdapat perbedaan angka nilai rapor. Mohon periksa kembali dan sesuaikan dengan buku rapor fisikmu."
  );

  const initialRapor = student.mapelDiscrepancy?.bukuRapor ?? 90.0;
  const [bukuRaporValue, setBukuRaporValue] = useState<number>(initialRapor);

  if (!isOpen) return null;

  const discrepancy = student.mapelDiscrepancy || {
    namaMapel: "KIMIA",
    inputMandiri: 86.0,
    bukuRapor: 90.0,
    selisih: -4.0,
  };

  const selisihTerkini = discrepancy.inputMandiri - bukuRaporValue;

  const handleSend = () => {
    onSubmit(note, bukuRaporValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#5F089E] uppercase">
              Perbaikan Nilai Rapor
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {discrepancy.namaMapel} ({student.semester})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Identitas Siswa Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
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
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Hasil Komparasi Verifikasi
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-slate-200 rounded-xl p-3.5 text-center bg-white shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nilai Sebelumnya (Input Siswa)
                </span>
                <span className="text-3xl font-extrabold text-[#5F089E] mt-1 block">
                  {discrepancy.inputMandiri.toFixed(1)}
                </span>
              </div>
              <div className="border-2 border-rose-200 rounded-xl p-3.5 text-center bg-rose-50/40 shadow-xs">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                  Nilai Sesuai Rapor Fisik (Input Guru)
                </span>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={bukuRaporValue}
                    onChange={(e) => setBukuRaporValue(parseFloat(e.target.value) || 0)}
                    className="w-24 text-center text-2xl font-extrabold text-[#BA1A1A] border border-rose-300 rounded-lg bg-white px-2 py-0.5 outline-none focus:ring-2 focus:ring-[#5F089E]"
                  />
                  <span className="text-xs font-semibold text-rose-600">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Selisih */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                Terdapat Selisih {selisihTerkini > 0 ? `+${selisihTerkini.toFixed(1)}` : selisihTerkini.toFixed(1)} Poin.
              </span>{" "}
              Nilai yang diinputkan siswa ({discrepancy.inputMandiri.toFixed(1)}) berbeda dari catatan buku rapor fisik ({bukuRaporValue.toFixed(1)}).
            </div>
          </div>

          {/* Input Catatan Koreksi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Catatan Koreksi Wali Kelas:
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuliskan instruksi atau konfirmasi perbedaan nilai untuk siswa..."
              className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5F089E] focus:border-transparent resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#5F089E] hover:bg-[#4E0782] rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            Kirim Permintaan Revisi
          </button>
        </div>
      </div>
    </div>
  );
}

