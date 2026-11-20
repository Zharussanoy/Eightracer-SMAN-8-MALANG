"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Pencil,
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
import { SiswaB1PerbaikanNilaiModal } from "./SiswaB1PerbaikanNilaiModal";
import { determineStudentAccess } from "./studentAccessPolicy";
import { apiRequest } from "@/lib/api";

interface SiswaB1EvaluasiSectionProps {
  onShowToast: (msg: string) => void;
  student: StudentB1Account;
}

interface DiscrepancyBannerInfo {
  tampilkan_banner: boolean;
  judul?: string;
  badge?: string;
  diterima_pada?: string;
  tenggat_revisi?: string;
  pesan?: string;
  catatan_wali_kelas?: string;
  nilai_rapor_id?: number;
}

function mapStatusFromBackend(status?: string): EvaluasiNilaiRowItem["statusValidasi"] {
  if (status === "tervalidasi") return "Tervalidasi Rapor Fisik";
  if (status === "perlu_koreksi") return "Perlu Koreksi Fisik";
  if (status === "menunggu_validasi") return "Menunggu Validasi";
  return "Belum Diisi";
}

export const SiswaB1EvaluasiSection: React.FC<SiswaB1EvaluasiSectionProps> = ({
  onShowToast,
  student,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(() => {
    return student.semester >= 3 && student.semester <= 6 ? student.semester : 3;
  });
  const [rows, setRows] = useState<EvaluasiNilaiRowItem[]>(student.evaluasiRows || []);
  const [discrepancyBanner, setDiscrepancyBanner] = useState<DiscrepancyBannerInfo | null>(null);
  const [selectedRowNote, setSelectedRowNote] = useState<string | null>(null);
  const [modalTargetRow, setModalTargetRow] = useState<EvaluasiNilaiRowItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const kimiaInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        const sem = selectedSemester;
        const query = student.nisn
          ? `?semester=${sem}&nisn=${encodeURIComponent(student.nisn)}`
          : `?semester=${sem}`;
        const res = await apiRequest<{
          catatan_perbaikan_wali_kelas?: DiscrepancyBannerInfo;
          daftar_nilai_pilihan?: Array<{
            id: number;
            mata_pelajaran_id?: number;
            mata_pelajaran_pilihan: string;
            semester: number;
            nilai_input_siswa: number;
            nilai_input_formatted: string;
            nilai_terverifikasi: number | null;
            status_validasi: string;
            modal_perbaikan?: {
              catatan_wali_kelas?: string;
              nilai_sesuai_rapor?: number;
            };
          }>;
        }>(`/siswa/evaluasi-nilai${query}`);

        if (!active || !res) return;

        if (res.catatan_perbaikan_wali_kelas) {
          setDiscrepancyBanner(res.catatan_perbaikan_wali_kelas);
        } else {
          setDiscrepancyBanner(null);
        }

        if (Array.isArray(res.daftar_nilai_pilihan) && res.daftar_nilai_pilihan.length > 0) {
          const mapped: EvaluasiNilaiRowItem[] = res.daftar_nilai_pilihan.map((r) => {
            const status = mapStatusFromBackend(r.status_validasi);
            const hasInput = status !== "Belum Diisi" || r.nilai_input_siswa > 0;
            const inputStr = hasInput ? r.nilai_input_formatted : "";
            const verifStr =
              r.nilai_terverifikasi !== null && r.nilai_terverifikasi !== undefined
                ? r.nilai_terverifikasi.toFixed(1)
                : null;
            const raporFisik =
              r.modal_perbaikan?.nilai_sesuai_rapor !== undefined
                ? r.modal_perbaikan.nilai_sesuai_rapor.toFixed(1)
                : verifStr || inputStr || "0.0";

            return {
              id: String(r.id),
              mataPelajaranId: r.mata_pelajaran_id,
              mataPelajaran: r.mata_pelajaran_pilihan,
              semester: r.semester || selectedSemester,
              nilaiInputSiswa: inputStr,
              nilaiTerverifikasi: status === "Tervalidasi Rapor Fisik" ? verifStr || inputStr : null,
              nilaiRaporSebenarnya: raporFisik,
              statusValidasi: status,
              catatanKoreksi: r.modal_perbaikan?.catatan_wali_kelas,
            };
          });
          setRows(mapped);
        } else if (student.evaluasiRows && student.evaluasiRows.length > 0) {
          setRows(
            student.evaluasiRows.map((r) => ({
              ...r,
              semester: selectedSemester,
            }))
          );
        }
      } catch {
        if (active) setRows(student.evaluasiRows || []);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [student.nisn, selectedSemester]);

  const access = determineStudentAccess(student, student.isSuratValidated);

  if (access.evaluasiStatus === "BELUM_ADA_NILAI" || (rows.length === 0 && !isLoading)) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 font-sans">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              Jenjang {access.jenjang} &bull; Semester {selectedSemester}
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
      rows[0];
    if (rowToEdit) setModalTargetRow(rowToEdit);
  };

  const handleModalSubmitScore = async (id: string, newScore: string) => {
    handleScoreChange(id, newScore);
    
    // Periksa apakah masih ada mapel lain yang perlu koreksi fisik selain id ini
    const remainingRows = rows.filter(
      (r) => r.id !== id && r.statusValidasi === "Perlu Koreksi Fisik"
    );

    if (remainingRows.length > 0) {
      setModalTargetRow(remainingRows[0]);
    } else {
      setModalTargetRow(null);
    }

    if (!isNaN(Number(id))) {
      try {
        await apiRequest(`/siswa/evaluasi-nilai/item/${id}/perbaiki`, {
          method: "PUT",
          body: {
            nilai_perbaikan: parseFloat(newScore),
          },
        });
      } catch {
        // Ignore if offline
      }
    }
    onShowToast(
      `Nilai berhasil diperbarui menjadi ${newScore} dan diajukan untuk verifikasi!`
    );
  };

  const handleScoreChange = (id: string, newValue: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

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

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);
      const res = await apiRequest<{
        message?: string;
        daftar_nilai_pilihan?: Array<{
          id: number;
          mata_pelajaran_id?: number;
          mata_pelajaran_pilihan: string;
          semester: number;
          nilai_input_siswa: number;
          nilai_input_formatted: string;
          nilai_terverifikasi: number | null;
          status_validasi: string;
          modal_perbaikan?: {
            catatan_wali_kelas?: string;
            nilai_sesuai_rapor?: number;
          };
        }>;
      }>("/siswa/evaluasi-nilai/simpan-draft", {
        method: "POST",
        body: {
          nisn: student.nisn || undefined,
          semester: selectedSemester,
          nilai: rows
            .filter((r) => r.nilaiInputSiswa && r.nilaiInputSiswa.trim() !== "")
            .map((r) => ({
              id: !isNaN(Number(r.id)) ? Number(r.id) : undefined,
              mata_pelajaran_id: r.mataPelajaranId,
              nama_mapel: r.mataPelajaran,
              nilai_input_siswa: parseFloat(r.nilaiInputSiswa),
              semester: selectedSemester,
            })),
        },
      });

      if (Array.isArray(res?.daftar_nilai_pilihan) && res.daftar_nilai_pilihan.length > 0) {
        setRows(
          res.daftar_nilai_pilihan.map((r) => {
            const status = mapStatusFromBackend(r.status_validasi);
            const hasInput = status !== "Belum Diisi" || r.nilai_input_siswa > 0;
            const inputStr = hasInput ? r.nilai_input_formatted : "";
            const verifStr =
              r.nilai_terverifikasi !== null && r.nilai_terverifikasi !== undefined
                ? r.nilai_terverifikasi.toFixed(1)
                : null;
            const raporFisik =
              r.modal_perbaikan?.nilai_sesuai_rapor !== undefined
                ? r.modal_perbaikan.nilai_sesuai_rapor.toFixed(1)
                : verifStr || inputStr || "0.0";

            return {
              id: String(r.id),
              mataPelajaranId: r.mata_pelajaran_id,
              mataPelajaran: r.mata_pelajaran_pilihan,
              semester: r.semester || selectedSemester,
              nilaiInputSiswa: inputStr,
              nilaiTerverifikasi: status === "Tervalidasi Rapor Fisik" ? verifStr || inputStr : null,
              nilaiRaporSebenarnya: raporFisik,
              statusValidasi: status,
              catatanKoreksi: r.modal_perbaikan?.catatan_wali_kelas,
            };
          })
        );
      }
      onShowToast(res?.message || `Draft input nilai Semester ${selectedSemester} berhasil disimpan!`);
    } catch {
      onShowToast("Gagal menyimpan draft nilai ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitValidation = async () => {
    const anyEmpty = rows.some((r) => !r.nilaiInputSiswa || r.nilaiInputSiswa.trim() === "");
    if (anyEmpty) {
      onShowToast(`Harap isi seluruh nilai mata pelajaran Semester ${selectedSemester} sebelum mengajukan validasi!`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiRequest<{
        message?: string;
        daftar_nilai_pilihan?: Array<{
          id: number;
          mata_pelajaran_id?: number;
          mata_pelajaran_pilihan: string;
          semester: number;
          nilai_input_siswa: number;
          nilai_input_formatted: string;
          nilai_terverifikasi: number | null;
          status_validasi: string;
          modal_perbaikan?: {
            catatan_wali_kelas?: string;
            nilai_sesuai_rapor?: number;
          };
        }>;
      }>("/siswa/evaluasi-nilai/ajukan-validasi", {
        method: "POST",
        body: {
          nisn: student.nisn || undefined,
          semester: selectedSemester,
          nilai: rows.map((r) => ({
            id: !isNaN(Number(r.id)) ? Number(r.id) : undefined,
            mata_pelajaran_id: r.mataPelajaranId,
            nama_mapel: r.mataPelajaran,
            nilai_input_siswa: parseFloat(r.nilaiInputSiswa),
            semester: selectedSemester,
          })),
        },
      });

      if (Array.isArray(res?.daftar_nilai_pilihan) && res.daftar_nilai_pilihan.length > 0) {
        setRows(
          res.daftar_nilai_pilihan.map((r) => {
            const status = mapStatusFromBackend(r.status_validasi);
            const hasInput = status !== "Belum Diisi" || r.nilai_input_siswa > 0;
            const inputStr = hasInput ? r.nilai_input_formatted : "";
            const verifStr =
              r.nilai_terverifikasi !== null && r.nilai_terverifikasi !== undefined
                ? r.nilai_terverifikasi.toFixed(1)
                : null;
            const raporFisik =
              r.modal_perbaikan?.nilai_sesuai_rapor !== undefined
                ? r.modal_perbaikan.nilai_sesuai_rapor.toFixed(1)
                : verifStr || inputStr || "0.0";

            return {
              id: String(r.id),
              mataPelajaranId: r.mata_pelajaran_id,
              mataPelajaran: r.mata_pelajaran_pilihan,
              semester: r.semester || selectedSemester,
              nilaiInputSiswa: inputStr,
              nilaiTerverifikasi: status === "Tervalidasi Rapor Fisik" ? verifStr || inputStr : null,
              nilaiRaporSebenarnya: raporFisik,
              statusValidasi: status,
              catatanKoreksi: r.modal_perbaikan?.catatan_wali_kelas,
            };
          })
        );
      } else {
        setRows((prev) =>
          prev.map((r) => ({ ...r, statusValidasi: "Menunggu Validasi" }))
        );
      }
      onShowToast(
        res?.message || `Nilai Semester ${selectedSemester} berhasil diajukan untuk divalidasi oleh Wali Kelas!`
      );
    } catch {
      onShowToast("Gagal mengajukan validasi nilai ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Header bar evaluasi nilai rapor peminatan */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5F089E] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#5F089E] uppercase tracking-wider block">
              Evaluasi Nilai Rapor Peminatan (Fase F)
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              Silakan masukkan nilai mata pelajaran pilihanmu sesuai dengan buku rapor fisik berkala.
            </p>
          </div>
        </div>

        {/* Pemilih Semester (Semester 3, 4, 5, 6) */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-purple-200/90 shadow-2xs self-start md:self-auto">
          <span className="text-[11px] font-bold text-slate-500 px-2 hidden sm:inline">Pilih Semester:</span>
          {[3, 4, 5, 6].map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => setSelectedSemester(sem)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSemester === sem
                  ? "bg-[#5F089E] text-white shadow-xs scale-102"
                  : "text-slate-600 hover:text-[#5F089E] hover:bg-purple-50"
              }`}
            >
              Semester {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Petunjuk Pengisian Nilai & Status Semester */}
      <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[#5F089E]">
          Ketik langsung angka nilai (0 - 100) pada kolom &ldquo;Nilai Input Siswa&rdquo; di bawah untuk <strong>Semester {selectedSemester}</strong>
        </p>
        {isAllValidated && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Nilai Semester {selectedSemester} Tervalidasi Rapor Fisik
          </span>
        )}
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
                    {discrepancyBanner?.judul || "Catatan Perbaikan dari Wali Kelas"}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFDAD6] text-[#410002]">
                    {discrepancyBanner?.badge || "PERLU DIPERBAIKI"}
                  </span>
                </div>
                {(discrepancyBanner?.diterima_pada || discrepancyBanner?.tenggat_revisi) && (
                  <p className="text-xs text-[#93000A]">
                    Diterima pada: {discrepancyBanner.diterima_pada || "-"} &bull; Tenggat Revisi: {discrepancyBanner.tenggat_revisi || "-"}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-[#410002] pt-1 leading-relaxed">
                  {discrepancyBanner?.catatan_wali_kelas ||
                    discrepancyBanner?.pesan ||
                    "Terdapat perbedaan angka nilai rapor. Silakan input ulang nilai yang tertera di buku rapor fisikmu."}
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
                      <td className="py-4 px-3 font-medium text-[#1E1E1E]">
                        <div className="flex items-center gap-2">
                          <span>{row.mataPelajaran}</span>
                          {isErrorRow && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-3 text-center font-normal text-[#1E1E1E]">
                        {row.semester || selectedSemester}
                      </td>

                      <td className="py-4 px-3 text-center">
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
                            className={`w-20 text-center text-xs sm:text-sm font-bold rounded-lg px-2.5 py-1.5 outline-none transition-all ${
                              isErrorRow
                                ? "border border-rose-400 text-[#BA1A1A] bg-rose-50/80 focus:ring-2 focus:ring-rose-300"
                                : isRowValidated
                                ? "border border-emerald-300 text-emerald-800 bg-emerald-50/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                : "border border-purple-200 text-[#5F089E] bg-[#FAF5FF] focus:border-[#5F089E] focus:ring-2 focus:ring-[#5F089E]/20"
                            }`}
                          />
                          <span className="text-[11px] text-slate-400 font-medium">/100</span>
                        </div>
                      </td>

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
        <div className="pt-8 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
            <span>
              Semester Aktif: <strong className="text-slate-900 font-bold">Semester {selectedSemester}</strong>
            </span>
            <span className="text-slate-300">&bull;</span>
            <span>
              {rows.filter((r) => r.nilaiInputSiswa && r.nilaiInputSiswa.trim() !== "").length} dari {rows.length} nilai terisi
            </span>
            {isAllValidated && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Tervalidasi
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 h-9 rounded-xl border border-[#CFC2D4]/60 text-xs sm:text-sm font-semibold shadow-2xs transition-all duration-200 bg-white hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-xs active:scale-95 text-[#191C1E] cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#191C1E]" />
              <span>Simpan Draft</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitValidation}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 h-9 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs transition-all duration-200 bg-[#5F089E] hover:bg-[#4d0680] hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>
                {isAllValidated
                  ? `Perbarui Nilai (Semester ${selectedSemester})`
                  : `Ajukan Validasi Nilai (Semester ${selectedSemester})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      <SiswaB1PerbaikanNilaiModal
        isOpen={!!modalTargetRow}
        rowItem={modalTargetRow}
        allRows={rows}
        onClose={() => setModalTargetRow(null)}
        onSubmit={handleModalSubmitScore}
      />
    </div>
  );
};
