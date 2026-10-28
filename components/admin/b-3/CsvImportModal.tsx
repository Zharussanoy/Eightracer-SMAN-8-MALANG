"use client";

import { useState } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { AlumniItem } from "./types";
import { SAMPLE_IMPORT_ALUMNI } from "./mockData";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newRows: AlumniItem[]) => void;
}

export default function CsvImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: CsvImportModalProps) {
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [importedRows, setImportedRows] = useState<AlumniItem[]>([]);
  const [isProcessingValidation, setIsProcessingValidation] = useState(false);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setImportStep(1);
    setUploadedFileName(null);
    setImportedRows([]);
    setIsProcessingValidation(false);
    onClose();
  };

  const handleFileSelected = (fileName: string) => {
    setUploadedFileName(fileName);
    setImportStep(2);
    setIsProcessingValidation(true);
    setTimeout(() => {
      setIsProcessingValidation(false);
      setImportedRows(SAMPLE_IMPORT_ALUMNI);
    }, 1200);
  };

  const handleExecuteImport = () => {
    setImportStep(3);
  };

  const handleFinish = () => {
    onImportComplete(importedRows);
    handleResetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Import Data Alumni (Berkas CSV)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {importStep === 1 && "Langkah 1: Unggah berkas CSV alumni"}
                {importStep === 2 && "Langkah 2: Validasi & preview format kolom"}
                {importStep === 3 && "Langkah 3: Proses impor selesai"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {importStep === 1 && (
            <div className="space-y-4">
              <div
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".csv";
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelected(file.name);
                    }
                  };
                  input.click();
                }}
                className="border-2 border-dashed border-purple-200 hover:border-[#5F089E] rounded-2xl p-8 text-center bg-purple-50/30 hover:bg-purple-50/60 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-purple-100 text-[#5F089E] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Pilih berkas CSV alumni Anda
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Tarik dan lepaskan file .csv ke sini atau klik untuk menelusuri penyimpanan lokal Anda.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                  <span>Pilih File (.csv)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Ingin mencoba cepat?
                  </span>
                  <span className="text-slate-500">
                    Gunakan 3 baris data contoh alumni SMARIHASTA 2024.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleFileSelected("data-alumni-smarihasta-2024.csv")}
                    className="px-3 py-1.5 rounded-lg bg-[#5F089E] text-white font-bold hover:bg-[#4D0680] transition-colors cursor-pointer"
                  >
                    Uji Data Contoh
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Mengunduh template CSV...")}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Template</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {importStep === 2 && (
            <div className="space-y-4">
              {isProcessingValidation ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-purple-200 border-t-[#5F089E] rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-800">
                    Memvalidasi baris CSV...
                  </p>
                  <p className="text-xs text-slate-500">
                    Memeriksa integritas NISN, kolom PTN, dan format nilai rapor.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-900 block">
                        Berkas valid: {uploadedFileName}
                      </span>
                      <span className="text-emerald-700">
                        {importedRows.length} baris siap dimasukkan ke database direktori.
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5">NISN</th>
                          <th className="p-2.5">Nama</th>
                          <th className="p-2.5">Kampus</th>
                          <th className="p-2.5">Jalur</th>
                          <th className="p-2.5">Nilai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {importedRows.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono">{r.nisn}</td>
                            <td className="p-2.5 font-semibold text-slate-900">
                              {r.nama}
                            </td>
                            <td className="p-2.5">{r.kampusKode}</td>
                            <td className="p-2.5">{r.jalur}</td>
                            <td className="p-2.5 font-bold">{r.nilai}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setImportStep(1)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Ganti File</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteImport}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <span>Lanjutkan Simpan ke Database</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {importStep === 3 && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Impor Berhasil Dilakukan!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Sebanyak <strong>{importedRows.length} data alumni</strong> telah
                  berhasil dimasukkan ke dalam daftar direktori aktif.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-6 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4D0680] text-white text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  Selesai &amp; Tampilkan di Tabel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
