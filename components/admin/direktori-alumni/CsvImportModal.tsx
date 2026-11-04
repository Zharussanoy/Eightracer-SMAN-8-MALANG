"use client";

import { useState } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportResult {
  message: string;
  berhasil: number;
  gagal: number;
  error_detail: Array<{ sheet: string; baris: number; pesan: string }>;
}

export default function CsvImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: CsvImportModalProps) {
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setImportStep(1);
    setSelectedFile(null);
    setUploadedFileName(null);
    setIsProcessing(false);
    setImportResult(null);
    setImportError(null);
    onClose();
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setUploadedFileName(file.name);
    setImportStep(2);
    setImportError(null);
    setImportResult(null);
  };

  const handleExecuteImport = async () => {
    if (!selectedFile) {
      setImportError("Tidak ada file yang dipilih.");
      return;
    }

    setIsProcessing(true);
    setImportError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("eightracer_token")
          : null;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/alumni/import`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || `Request failed: ${res.status}`);
      }

      setImportResult(json);
      setImportStep(3);
    } catch (err: any) {
      setImportError(err.message || "Import gagal.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    onImportComplete();
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
                Import Data Alumni (Berkas Excel/CSV)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {importStep === 1 && "Langkah 1: Unggah berkas alumni"}
                {importStep === 2 && "Langkah 2: Konfirmasi & proses import"}
                {importStep === 3 && "Langkah 3: Hasil import"}
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
                  input.accept = ".csv,.xlsx,.xls";
                  input.onchange = (e: Event) => {
                    const target = e.target as HTMLInputElement | null;
                    const file = target?.files?.[0];
                    if (file) {
                      handleFileSelected(file);
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
                  Pilih berkas Excel/CSV alumni
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Mendukung .xlsx, .xls, dan .csv sesuai format spreadsheet alumni SMAN 8 Malang.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                  <span>Pilih File</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Format file
                  </span>
                  <span className="text-slate-500">
                    Gunakan file Excel asli dari Guru BK (multi-sheet: SNBP, SNBT, dll.).
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => alert("Template belum tersedia. Gunakan file Excel asli Guru BK.")}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Info Format</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {importStep === 2 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-900 block">
                    Berkas siap: {uploadedFileName}
                  </span>
                  <span className="text-emerald-700">
                    File akan diproses sesuai sheet yang dikenali (SNBP, SNBT, MANDIRI, dll.).
                  </span>
                </div>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setImportStep(1);
                    setSelectedFile(null);
                    setUploadedFileName(null);
                    setImportError(null);
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Ganti File</span>
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Proses Import</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {importStep === 3 && importResult && (
            <div className="space-y-4">
              <div className="py-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Import Selesai
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Berhasil: <strong className="text-emerald-700">{importResult.berhasil}</strong> &middot;{" "}
                    Gagal: <strong className="text-rose-600">{importResult.gagal}</strong>
                  </p>
                </div>
              </div>

              {importResult.gagal > 0 && importResult.error_detail.length > 0 && (
                <div className="border border-rose-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto text-xs">
                  <div className="bg-rose-50 px-3 py-2 font-bold text-rose-700 border-b border-rose-200">
                    Detail Gagal ({importResult.error_detail.length} baris)
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                      <tr>
                        <th className="p-2">Sheet</th>
                        <th className="p-2">Baris</th>
                        <th className="p-2">Pesan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {importResult.error_detail.slice(0, 50).map((err, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-mono">{err.sheet}</td>
                          <td className="p-2 font-mono">{err.baris}</td>
                          <td className="p-2">{err.pesan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-6 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4D0680] text-white text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  Selesai &amp; Refresh Tabel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}