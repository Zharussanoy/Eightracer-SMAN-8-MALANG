"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Pencil,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  SendHorizontal,
  Clock,
  HelpCircle,
  Edit3,
  Lock,
} from "lucide-react";
import { EvaluasiNilaiRowItem, StudentB1Account } from "./types";
import { EVALUASI_NILAI_ROWS } from "./mockData";
import { SiswaB1PerbaikanNilaiModal } from "./SiswaB1PerbaikanNilaiModal";
import { determineStudentAccess } from "./studentAccessPolicy";

interface SiswaB1EvaluasiSectionProps {
  onShowToast: (msg: string) => void;
  student: StudentB1Account;
}

export const SiswaB1EvaluasiSection: React.FC<SiswaB1EvaluasiSectionProps> = ({
  onShowToast,
  student,
}) => {
  const initialData = student.evaluasiRows || EVALUASI_NILAI_ROWS;
  const [rows, setRows] = useState<EvaluasiNilaiRowItem[]>(initialData);
  const [selectedRowNote, setSelectedRowNote] = useState<string | null>(null);
  const [modalTargetRow, setModalTargetRow] = useState<EvaluasiNilaiRowItem | null>(null);
  const kimiaInputRef = useRef<HTMLInputElement | null>(null);

  // Sync rows if student changes
  useEffect(() => {
    setRows(student.evaluasiRows || EVALUASI_NILAI_ROWS);
  }, [student]);

  const access = determineStudentAccess(student);

  // Jika belum ada nilai sama sekali
  if (access.evaluasiStatus === "BELUM_ADA_NILAI") {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 font-sans">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              Jenjang {access.jenjang} &bull; Semester {student.semester}
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Belum Ada Nilai Mata Pelajaran Pilihan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {access.keteranganAksesEvaluasi}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscrepancy = rows.some(
    (r) => r.statusValidasi === "Perlu Koreksi Fisik"
  );

  const isAllValidated =
    rows.length > 0 && rows.every((r) => r.statusValidasi === "Tervalidasi Rapor Fisik");

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

  const handleScoreChange = (id: string, newValue: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        // KETENTUAN: Jika nilai sudah divalidasi oleh guru, siswa tidak bisa mengubahnya
        if (row.statusValidasi === "Tervalidasi Rapor Fisik") {
          return row;
        }

        const cleanVal = newValue;
        if (cleanVal.trim() === "") {
          return {
            ...row,
            nilaiInputSiswa: "",
            nilaiTerverifikasi: null,
            statusValidasi: "Belum Diisi",
          };
        }

        return {
          ...row,
          nilaiInputSiswa: cleanVal,
          nilaiTerverifikasi: null,
          statusValidasi: "Menunggu Validasi",
        };
      })
    );
  };

  const handleAutoMatchPhysicalReport = (id: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return {
          ...row,
          nilaiInputSiswa: row.nilaiRaporSebenarnya,
          nilaiTerverifikasi: row.nilaiRaporSebenarnya,
          statusValidasi: "Tervalidasi Rapor Fisik",
          catatanKoreksi: undefined,
        };
      })
    );
    setSelectedRowNote(null);
    onShowToast("Nilai telah disesuaikan dengan legger rapor fisik!");
  };

  const handleSaveDraft = () => {
    onShowToast("Draft input nilai berhasil disimpan!");
  };

  const handleSubmitValidation = () => {
    const anyEmpty = rows.some((r) => !r.nilaiInputSiswa || r.nilaiInputSiswa.trim() === "");
    if (anyEmpty) {
      onShowToast("Harap isi seluruh nilai mata pelajaran sebelum mengajukan validasi!");
      return;
    }

    setRows((prev) =>
      prev.map((r) => {
        // Jika sudah tervalidasi, biarkan tetap tervalidasi & terkunci
        if (r.statusValidasi === "Tervalidasi Rapor Fisik") return r;

        const numVal = parseFloat(r.nilaiInputSiswa);
        const targetVal = parseFloat(r.nilaiRaporSebenarnya);

        // Jika cocok dengan legger rapor fisik, guru memvalidasi dan siswa tidak bisa mengubahnya
        if (!isNaN(numVal) && Math.abs(numVal - targetVal) < 0.01) {
          return {
            ...r,
            nilaiTerverifikasi: r.nilaiRaporSebenarnya,
            statusValidasi: "Tervalidasi Rapor Fisik",
            catatanKoreksi: undefined,
          };
        }

        // Jika terdapat perbedaan fisik rapor
        return {
          ...r,
          statusValidasi: "Perlu Koreksi Fisik",
          catatanKoreksi: `Terdapat selisih nilai fisik rapor. Nilai tercatat pada legger rapor fisik: ${r.nilaiRaporSebenarnya}`,
        };
      })
    );

    onShowToast(
      "Nilai berhasil diajukan! Nilai yang sesuai telah divalidasi oleh Guru dan dikunci permanen."
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Header bar evaluasi nilai rapor peminatan */}
      <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5F089E] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#5F089E] uppercase tracking-wider block">
              Evaluasi Nilai Rapor Peminatan (Fase F)
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              Silakan masukkan nilai mata pelajaran pilihanmu sesuai dengan buku rapor fisik.
            </p>
          </div>
        </div>

        {isAllValidated ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tervalidasi oleh Guru &bull; Nilai Terkunci</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-[#5F089E] border border-purple-200 self-start sm:self-auto shadow-2xs">
            <Pencil className="w-3.5 h-3.5" />
            <span>Formulir Pengisian Nilai</span>
          </span>
        )}
      </div>

      {/* Petunjuk Pengisian Nilai (Tanpa Stepper Alur) */}
      <div className="pt-1">
        <p className="text-xs font-semibold text-[#5F089E]">
          Ketik langsung angka nilai (0 - 100) pada kolom &ldquo;Nilai Input Siswa&rdquo; di bawah
        </p>
      </div>

      {/* Red Discrepancy Banner if any error row */}
      {hasDiscrepancy && (
        <div className="w-full rounded-[20px] bg-[#FFF8F7] border border-[#FFDAD6] p-5 sm:p-6 transition-all duration-300 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#BA1A1A] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-sm font-bold text-[#410002]">
                    Catatan Perbaikan dari Wali Kelas (Drs. H. Subagyo)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFDAD6] text-[#410002]">
                    PERLU DIPERBAIKI
                  </span>
                </div>
                <p className="text-xs text-[#93000A]">
                  Diterima pada: 25 November 2026, 14:15 WIB &bull; Tenggat Revisi: 28 November 2026
                </p>
                <p className="text-xs sm:text-sm text-[#410002] pt-1 leading-relaxed">
                  Terdapat perbedaan angka nilai rapor. Silakan input ulang nilai yang tertera di buku rapor fisikmu.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenPerbaikanModal()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer self-start shrink-0 active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Perbaiki Nilai</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-xs overflow-hidden p-6 sm:p-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#E9E9E9] text-[11px] font-bold text-[#737373] uppercase tracking-wider">
                <th className="py-3 px-3">Mata Pelajaran Pilihan</th>
                <th className="py-3 px-3 text-center">Semester</th>
                <th className="py-3 px-3 text-center">Nilai Input Siswa</th>
                <th className="py-3 px-3 text-center">Nilai Terverifikasi</th>
                <th className="py-3 px-3 text-center">Status Validasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {rows.map((row) => {
                const isErrorRow = row.statusValidasi === "Perlu Koreksi Fisik";
                const isRowValidated = row.statusValidasi === "Tervalidasi Rapor Fisik";
                const isSelectedNote = selectedRowNote === row.id;

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`transition-colors ${
                        isErrorRow
                          ? "bg-rose-50/20 hover:bg-rose-50/40"
                          : "hover:bg-slate-50/70"
                      }`}
                    >
                      {/* MATA PELAJARAN PILIHAN */}
                      <td className="py-4 px-3 font-medium text-[#1E1E1E]">
                        <div className="flex items-center gap-2">
                          <span>{row.mataPelajaran}</span>
                          {isErrorRow && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </div>
                      </td>

                      {/* SEMESTER */}
                      <td className="py-4 px-3 text-center font-normal text-[#1E1E1E]">
                        {row.semester}
                      </td>

                      {/* NILAI INPUT SISWA (TERKUNCI JIKA SUDAH DIVALIDASI GURU) */}
                      <td className="py-4 px-3 text-center">
                        {isRowValidated ? (
                          <div
                            className="inline-flex items-center justify-center gap-1.5"
                            title="Nilai telah divalidasi oleh Guru/Wali Kelas dan dikunci permanen"
                          >
                            <span className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                              <Lock className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{row.nilaiInputSiswa || row.nilaiTerverifikasi}</span>
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">/100</span>
                          </div>
                        ) : isErrorRow ? (
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <input
                              ref={row.mataPelajaran.includes("Kimia") ? kimiaInputRef : null}
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={row.nilaiInputSiswa}
                              onChange={(e) => handleScoreChange(row.id, e.target.value)}
                              placeholder="0.0"
                              className="w-20 text-center text-xs sm:text-sm font-bold rounded-lg px-2.5 py-1.5 outline-none border border-rose-400 text-[#BA1A1A] bg-rose-50/80 focus:ring-2 focus:ring-rose-300 transition-all"
                            />
                            <span className="text-[11px] text-slate-400 font-medium">/100</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <input
                              ref={row.mataPelajaran.includes("Kimia") ? kimiaInputRef : null}
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={row.nilaiInputSiswa}
                              onChange={(e) => handleScoreChange(row.id, e.target.value)}
                              placeholder="0.0"
                              className="w-20 text-center text-xs sm:text-sm font-bold rounded-lg px-2.5 py-1.5 outline-none border border-purple-200 text-[#5F089E] bg-[#FAF5FF] focus:border-[#5F089E] focus:ring-2 focus:ring-[#5F089E]/20 transition-all"
                            />
                            <span className="text-[11px] text-slate-400 font-medium">/100</span>
                          </div>
                        )}
                      </td>

                      {/* NILAI TERVERIFIKASI */}
                      <td className="py-4 px-3 text-center">
                        {row.nilaiTerverifikasi ? (
                          <span className="font-semibold text-[#1E1E1E]">
                            {row.nilaiTerverifikasi}
                          </span>
                        ) : row.statusValidasi === "Belum Diisi" ? (
                          <span className="text-xs text-slate-400 font-medium">-</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-[#795900] font-medium">
                            <RotateCcw className="w-3 h-3 text-[#795900]" />
                            <span>Menunggu Koreksi</span>
                          </span>
                        )}
                      </td>

                      {/* STATUS VALIDASI */}
                      <td className="py-4 px-3 text-center">
                        {row.statusValidasi === "Belum Diisi" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Belum Diisi</span>
                          </span>
                        )}

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
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Menunggu Validasi</span>
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Interactive Discrepancy Detail Row */}
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

        {/* Bottom Right Action Buttons */}
        <div className="pt-8 mt-4 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isAllValidated}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 h-9 rounded-xl border border-[#CFC2D4]/60 text-xs sm:text-sm font-semibold shadow-2xs transition-all duration-200 ${
              isAllValidated
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-white hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-xs active:scale-95 text-[#191C1E] cursor-pointer"
            }`}
          >
            <Save className="w-3.5 h-3.5 text-[#191C1E]" />
            <span>Simpan Draft</span>
          </button>

          <button
            type="button"
            disabled={isAllValidated}
            onClick={handleSubmitValidation}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2 h-9 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs transition-all duration-200 ${
              isAllValidated
                ? "bg-emerald-600 shadow-emerald-900/10 cursor-not-allowed"
                : "bg-[#5F089E] hover:bg-[#4d0680] hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer"
            }`}
          >
            {isAllValidated ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Seluruh Nilai Telah Divalidasi &amp; Dikunci</span>
              </>
            ) : (
              <>
                <SendHorizontal className="w-4 h-4" />
                <span>Ajukan Validasi Nilai</span>
              </>
            )}
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
