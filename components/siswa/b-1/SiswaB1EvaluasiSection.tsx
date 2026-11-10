"use client";

import React, { useState, useRef } from "react";
import {
  AlertTriangle,
  Pencil,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  SendHorizontal,
  Info,
  Sparkles,
} from "lucide-react";
import { EvaluasiNilaiRowItem } from "./types";
import { EVALUASI_NILAI_ROWS } from "./mockData";
import { SiswaB1PerbaikanNilaiModal } from "./SiswaB1PerbaikanNilaiModal";

interface SiswaB1EvaluasiSectionProps {
  onShowToast: (msg: string) => void;
}

export const SiswaB1EvaluasiSection: React.FC<SiswaB1EvaluasiSectionProps> = ({
  onShowToast,
}) => {
  const [rows, setRows] = useState<EvaluasiNilaiRowItem[]>(EVALUASI_NILAI_ROWS);
  const [isEditingMode, setIsEditingMode] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2);
  const [selectedRowNote, setSelectedRowNote] = useState<string | null>(null);
  const [modalTargetRow, setModalTargetRow] = useState<EvaluasiNilaiRowItem | null>(null);
  const kimiaInputRef = useRef<HTMLInputElement | null>(null);

  const hasDiscrepancy = rows.some(
    (r) => r.statusValidasi === "Perlu Koreksi Fisik"
  );

  const handleOpenPerbaikanModal = (targetRow?: EvaluasiNilaiRowItem) => {
    const rowToEdit =
      targetRow ||
      rows.find((r) => r.statusValidasi === "Perlu Koreksi Fisik") ||
      rows[3];
    setModalTargetRow(rowToEdit);
  };

  const handleModalSubmitScore = (id: string, newScore: string) => {
    handleScoreChange(id, newScore);
    setModalTargetRow(null);
    onShowToast(
      `Nilai berhasil diperbarui menjadi ${newScore} dan diajukan untuk verifikasi!`
    );
  };

  const handleActivateFixMode = () => {
    handleOpenPerbaikanModal();
  };

  const handleScoreChange = (id: string, newValue: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const cleanVal = newValue;
        const numVal = parseFloat(cleanVal);
        const targetVal = parseFloat(row.nilaiRaporSebenarnya);

        // If user matches the physical report card score (e.g. 89.0)
        if (!isNaN(numVal) && Math.abs(numVal - targetVal) < 0.01) {
          return {
            ...row,
            nilaiInputSiswa: cleanVal,
            nilaiTerverifikasi: row.nilaiRaporSebenarnya,
            statusValidasi: "Tervalidasi Rapor Fisik",
          };
        }

        return {
          ...row,
          nilaiInputSiswa: cleanVal,
          nilaiTerverifikasi: null,
          statusValidasi:
            row.id === "row-4" ? "Perlu Koreksi Fisik" : "Menunggu Validasi",
        };
      })
    );
  };

  const handleAutoMatchPhysicalReport = (id: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              nilaiInputSiswa: row.nilaiRaporSebenarnya,
              nilaiTerverifikasi: row.nilaiRaporSebenarnya,
              statusValidasi: "Tervalidasi Rapor Fisik",
            }
          : row
      )
    );
    onShowToast(
      "Nilai Kimia berhasil disesuaikan menjadi 89.0 sesuai buku rapor fisik!"
    );
  };

  const handleSaveDraft = () => {
    setIsEditingMode(false);
    onShowToast("Draft perbaikan nilai rapor berhasil disimpan sementara.");
  };

  const handleSubmitValidation = () => {
    setIsEditingMode(false);
    setActiveStep(3);
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        nilaiTerverifikasi: row.nilaiInputSiswa,
        statusValidasi: "Tervalidasi Rapor Fisik",
      }))
    );
    onShowToast(
      "Pengajuan validasi nilai berhasil dikirim ke Wali Kelas & Koordinator BK!"
    );
  };

  const handleResetDemo = () => {
    setRows(EVALUASI_NILAI_ROWS);
    setActiveStep(2);
    setIsEditingMode(false);
    setSelectedRowNote(null);
    onShowToast("Data evaluasi dikembalikan ke kondisi awal.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Stepper Tracking Right-Aligned */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-[#737373] flex items-center gap-2">
          {activeStep === 3 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Seluruh nilai mata pelajaran pilihan telah tervalidasi
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingMode(!isEditingMode)}
              className="text-xs font-semibold text-[#5F089E] hover:underline cursor-pointer"
            >
              {isEditingMode
                ? "Selesai Edit Manual"
                : "Klik 'Perbaiki Nilai' atau angka berbingkai merah untuk mengoreksi"}
            </button>
          )}
        </div>

        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-100 self-end sm:self-auto">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-[#410070] text-white text-[11px] font-semibold flex items-center justify-center">
              1
            </span>
            <span className="text-xs font-semibold text-[#410070]">
              Input Siswa
            </span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-[#CFC2D4]" />

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] font-semibold flex items-center justify-center ${
                activeStep >= 2
                  ? "bg-[#795900] text-white"
                  : "bg-[#E0E3E6] text-[#4C4452]"
              }`}
            >
              2
            </span>
            <span
              className={`text-xs font-semibold ${
                activeStep >= 2 ? "text-[#795900]" : "text-[#4C4452]"
              }`}
            >
              Pengecekan Wali Kelas
            </span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-[#CFC2D4]" />

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] font-semibold flex items-center justify-center ${
                activeStep === 3
                  ? "bg-emerald-600 text-white"
                  : "bg-[#E0E3E6] text-[#4C4452] font-normal"
              }`}
            >
              3
            </span>
            <span
              className={`text-xs ${
                activeStep === 3
                  ? "font-semibold text-emerald-700"
                  : "font-normal text-[#4C4452]"
              }`}
            >
              Validasi BK
            </span>
          </button>
        </div>
      </div>

      {/* UC-04 Alert Box (Notifikasi Discrepancy / Catatan Revisi Rapor Fisik) */}
      {hasDiscrepancy ? (
        <div className="w-full rounded-xl bg-[#FFDAD6]/40 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#BA1A1A]/15 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Red Warning Icon Box */}
              <div className="w-10 h-10 rounded-lg bg-[#BA1A1A] text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-[#93000A]">
                    Catatan Perbaikan dari Wali Kelas (Drs. H. Subagyo)
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-[#BA1A1A] text-white text-[10px] font-bold uppercase tracking-wider">
                    PERLU DIPERBAIKI
                  </span>
                </div>
                <p className="text-xs text-[#4C4452]">
                  Diterima pada: 25 November 2026, 14:15 WIB &bull; Tenggat Revisi: 28 November 2026
                </p>
              </div>
            </div>

            {/* Perbaiki Nilai Button */}
            <button
              type="button"
              onClick={handleActivateFixMode}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 h-7 rounded-lg bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer shrink-0 self-start"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Perbaiki Nilai</span>
            </button>
          </div>

          <div className="mt-4 sm:pl-13 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-[#191C1E]">
              Terdapat perbedaan angka nilai rapor. Mohon periksa kembali dan sesuaikan dengan buku rapor fisikmu.
            </p>

            {/* Quick interactive helper chip */}
            <button
              type="button"
              onClick={() => handleAutoMatchPhysicalReport("row-4")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/90 hover:bg-white text-[#93000A] border border-[#BA1A1A]/30 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#5F089E]" />
              <span>Sesuaikan Otomatis ke Rapor Fisik (89.0)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-xl bg-emerald-50/70 p-4 sm:p-5 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                Seluruh Nilai Rapor Telah Sesuai dengan Buku Rapor Fisik
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Tidak ada perbedaan angka nilai rapor. Silakan klik &ldquo;Ajukan Validasi&rdquo; untuk mengunci data.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetDemo}
            className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer shrink-0"
          >
            Reset Simulasi
          </button>
        </div>
      )}

      {/* Main Evaluation Table Container */}
      <div className="w-full rounded-[20px] border-2 border-[#E9E9E9] bg-white px-5 sm:px-8 py-7 sm:py-8 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-3 text-left text-xs sm:text-sm font-semibold text-[#737373] uppercase tracking-wide">
                  MATA PELAJARAN PILIHAN
                </th>
                <th className="py-3 px-3 text-center text-xs sm:text-sm font-semibold text-[#737373] uppercase tracking-wide">
                  SEMESTER
                </th>
                <th className="py-3 px-3 text-center text-xs sm:text-sm font-semibold text-[#737373] uppercase tracking-wide">
                  NILAI INPUT SISWA
                </th>
                <th className="py-3 px-3 text-center text-xs sm:text-sm font-semibold text-[#737373] uppercase tracking-wide">
                  NILAI TERVERIFIKASI
                </th>
                <th className="py-3 px-3 text-center text-xs sm:text-sm font-semibold text-[#737373] uppercase tracking-wide">
                  STATUS VALIDASI
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/80">
              {rows.map((row) => {
                const isErrorRow = row.statusValidasi === "Perlu Koreksi Fisik";
                const isSelectedNote = selectedRowNote === row.id;

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() =>
                        setSelectedRowNote(isSelectedNote ? null : row.id)
                      }
                      className={`transition-colors cursor-pointer ${
                        isErrorRow
                          ? "bg-rose-50/20 hover:bg-rose-50/40"
                          : "hover:bg-slate-50/70"
                      }`}
                    >
                      {/* MATA PELAJARAN PILIHAN */}
                      <td className="py-4 px-3 text-sm sm:text-base font-normal text-[#1E1E1E]">
                        <div className="flex items-center gap-2">
                          <span>{row.mataPelajaran}</span>
                          {row.catatanKoreksi && (
                            <Info className="w-3.5 h-3.5 text-[#BA1A1A] opacity-80" />
                          )}
                        </div>
                      </td>

                      {/* SEMESTER */}
                      <td className="py-4 px-3 text-center text-sm sm:text-base font-normal text-[#1E1E1E]">
                        {row.semester}
                      </td>

                      {/* NILAI INPUT SISWA */}
                      <td
                        className="py-4 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-center">
                          {isErrorRow ? (
                            <button
                              type="button"
                              onClick={() => handleOpenPerbaikanModal(row)}
                              title="Klik untuk memperbaiki nilai rapor sesuai buku fisik"
                              className="w-16 h-7 text-center rounded-lg text-sm font-bold bg-white border border-[#BA1A1A]/70 text-[#BA1A1A] hover:bg-rose-50 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                            >
                              {row.nilaiInputSiswa}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenPerbaikanModal(row)}
                              title="Klik untuk melihat / memperbaiki nilai"
                              className="w-16 h-7 rounded-lg bg-[#F2F4F7] hover:bg-purple-50 text-[#191C1E] text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                            >
                              {row.nilaiInputSiswa}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* NILAI TERVERIFIKASI */}
                      <td className="py-4 px-3 text-center">
                        {row.nilaiTerverifikasi ? (
                          <span className="text-sm font-bold text-[#191C1E]">
                            {row.nilaiTerverifikasi}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#D97706]">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Menunggu Koreksi</span>
                          </span>
                        )}
                      </td>

                      {/* STATUS VALIDASI */}
                      <td className="py-4 px-3 text-center">
                        {row.statusValidasi === "Tervalidasi Rapor Fisik" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] fill-[#10B981]/15" />
                            <span>Tervalidasi Rapor Fisik</span>
                          </span>
                        )}

                        {row.statusValidasi === "Perlu Koreksi Fisik" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4E6] border border-[#FECDD3] text-[#BE123C] text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-[#F43F5E]" />
                            <span>Perlu Koreksi Fisik</span>
                          </span>
                        )}

                        {row.statusValidasi === "Menunggu Validasi" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                            <span>Menunggu Validasi</span>
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Interactive Discrepancy Detail Row when Kimia or edited row is clicked */}
                    {isSelectedNote && row.catatanKoreksi && isErrorRow && (
                      <tr className="bg-[#FFF8F7]">
                        <td colSpan={5} className="py-2.5 px-4 text-xs text-[#93000A]">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>
                              <strong>Detail Temuan Wali Kelas:</strong> {row.catatanKoreksi}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAutoMatchPhysicalReport(row.id)}
                              className="px-2.5 py-1 rounded-md bg-[#BA1A1A] text-white text-[11px] font-bold hover:bg-[#93000A] transition-colors cursor-pointer"
                            >
                              Ubah ke {row.nilaiRaporSebenarnya}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Right Action Buttons: Simpan Draft & Ajukan Validasi */}
        <div className="pt-8 mt-4 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 h-8.5 rounded-lg bg-white hover:bg-slate-50 border border-[#CFC2D4]/60 text-[#191C1E] text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#191C1E]" />
            <span>Simpan Draft</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitValidation}
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 h-8.5 rounded-lg bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <SendHorizontal className="w-3.5 h-3.5" />
            <span>Ajukan Validasi</span>
          </button>
        </div>
      </div>

      {/* Pop Up Perbaikan Nilai Rapor Modal */}
      <SiswaB1PerbaikanNilaiModal
        isOpen={!!modalTargetRow}
        rowItem={modalTargetRow}
        onClose={() => setModalTargetRow(null)}
        onSubmit={handleModalSubmitScore}
      />
    </div>
  );
};

