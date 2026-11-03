"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  FileText,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { UploadedFileState } from "./types";

interface AdminB1UploadSectionProps {
  uploadedFile: UploadedFileState | null;
  onFileChange: (newFile: UploadedFileState | null) => void;
  onSaveData: () => void;
  isSaving: boolean;
}

export default function AdminB1UploadSection({
  uploadedFile,
  onFileChange,
  onSaveData,
  isSaving,
}: AdminB1UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const fakeCount = Math.floor(Math.random() * 80) + 320; // 320 - 400 siswa
    onFileChange({
      name: file.name,
      size: `${sizeInMB} MB`,
      readCount: fakeCount,
      status: "Siap Dipetakan",
    });
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full bg-white border border-[#E9E9E9] rounded-2xl p-6 mb-8 font-['Montserrat',sans-serif] shadow-[0px_1px_3px_rgba(0,0,0,0.02)]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-purple-100 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-[#5F089E]" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-[1.2]">
            Unggah Berkas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Sistem memproses data siswa SMAN 8 Malang secara otomatis dan terstruktur.
          </p>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full rounded-2xl border-2 border-dashed py-9 px-6 sm:px-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isDragging
            ? "bg-[#F3E8FC] border-[#5F089E]"
            : "bg-[#F8F9FA] border-purple-200 hover:border-[#5F089E]/60 hover:bg-[#FAF9FC]"
        }`}
        onClick={handleBrowseClick}
      >
        {/* Upload Icon Circle */}
        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
          <UploadCloud className="w-8 h-8 text-[#5F089E]" />
        </div>

        {/* Text Area */}
        <p className="text-sm sm:text-base font-semibold text-slate-800 text-center leading-[150%]">
          Tarik &amp; letakkan berkas Excel/CSV di sini, atau{" "}
          <span className="text-[#5F089E] underline underline-offset-2 hover:text-[#4d0680]">
            Jelajahi Berkas
          </span>
        </p>
        <p className="text-xs text-slate-500 text-center mt-1">
          Unggah data dengan mudah dan cepat.
        </p>
      </div>

      {/* Uploaded File Preview Card (Overlay + Border) */}
      {uploadedFile && (
        <div className="mt-4 w-full bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            {/* Purple Icon Box */}
            <div className="w-11 h-11 rounded-xl bg-[#5F089E] flex items-center justify-center shrink-0 shadow-sm">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>

            {/* File Info & Badges */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-semibold text-slate-900 break-all">
                  {uploadedFile.name}
                </span>
                <span className="bg-white border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
                  {uploadedFile.size}
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-emerald-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{uploadedFile.readCount} siswa terbaca</span>
                </span>
              </div>

              {/* Status Row */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Status:</span>
                <span className="bg-purple-100 text-[#5F089E] text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md">
                  {uploadedFile.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-4 pt-2">
        {uploadedFile && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
        )}

        <button
          type="button"
          onClick={handleBrowseClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#5F089E] text-sm font-semibold transition-colors cursor-pointer border border-purple-100"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#5F089E]" />
          <span>Ganti Berkas</span>
        </button>

        <button
          type="button"
          disabled={!uploadedFile || isSaving}
          onClick={onSaveData}
          className="relative flex items-center gap-2 px-6 py-2 rounded-lg bg-[#5F089E] hover:bg-[#4d0680] active:bg-[#3d0566] text-white text-sm font-semibold shadow-md shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Simpan Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
