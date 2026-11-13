"use client";

import { X, CheckCircle2, ShieldCheck } from "lucide-react";
import { StudentB1WaliKelas } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentB1WaliKelas;
  onConfirm: () => void;
}

export default function WaliKelasB1ApproveModal({
  isOpen,
  onClose,
  student,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  const discrepancy = student.mapelDiscrepancy || {
    namaMapel: "KIMIA",
    inputMandiri: 86.0,
    bukuRapor: 90.0,
    selisih: 0,
  };

  const handleApprove = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                Konfirmasi Validasi
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Validasi Nilai Rapor Fisik
              </h3>
            </div>
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
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 leading-relaxed">
            <p className="font-semibold">
              Apakah Anda yakin ingin memvalidasi dan menyetujui nilai rapor fisik ini?
            </p>
            <p className="mt-1 text-emerald-700 text-[11px]">
              Nilai digital siswa akan disahkan dan status rapor akan diperbarui menjadi{" "}
              <span className="font-bold underline">Tervalidasi Rapor Fisik</span>.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Nama Siswa</span>
              <span className="font-bold text-slate-900">{student.nama}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Mata Pelajaran</span>
              <span className="font-bold text-slate-900">{discrepancy.namaMapel}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Nilai Final Disetujui</span>
              <span className="font-extrabold text-[#5F089E] text-sm">
                {discrepancy.bukuRapor.toFixed(1)} / 100
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Wali Kelas Pengesah</span>
              <span className="font-bold text-slate-700 text-right">
                Drs. H. Subagyo <br />
                <span className="text-[10px] text-slate-400 font-normal">NIP: 196804151994031002</span>
              </span>
            </div>
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
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4" />
            Setujui &amp; Sahkan Nilai
          </button>
        </div>
      </div>
    </div>
  );
}

