"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  CircleUserRound,
  ShieldCheck,
  Eye,
  Download,
  Calculator,
  Atom,
  TerminalSquare,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
  X,
  Trophy,
  Award,
  Plus,
  Trash2,
  Edit2,
  Target,
} from "lucide-react";
import SiswaB1Navbar from "./SiswaB1Navbar";
import { SiswaB1PdfPreviewModal } from "./SiswaB1PdfPreviewModal";
import { SiswaB1SubjectDetailModal } from "./SiswaB1SubjectDetailModal";
import { SiswaB1EvaluasiSection } from "./SiswaB1EvaluasiSection";
import { SiswaB1ProfilSection } from "./SiswaB1ProfilSection";
import {
  SiswaB1Tab,
  MapelPilihanDetail,
} from "./types";
import {
  SISWA_B1_PROFILE,
  RECOMMENDED_SUBJECTS,
} from "./mockData";

export default function SiswaB1Page() {
  const [activeTab, setActiveTab] = useState<SiswaB1Tab>(
    "Rekomendasi Mapel Pilihan"
  );
  const [selectedSubject, setSelectedSubject] =
    useState<MapelPilihanDetail | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleDownloadPdf = () => {
    triggerToast(
      "Surat_Rekomendasi_Peminatan_Amalia_Mayasari_X3.pdf berhasil diunduh!"
    );
  };

  const renderSubjectIcon = (type: MapelPilihanDetail["iconType"]) => {
    switch (type) {
      case "math":
        return <Calculator className="w-5 h-5" />;
      case "physics":
        return <Atom className="w-5 h-5" />;
      case "informatics":
        return <TerminalSquare className="w-5 h-5" />;
      case "chemistry":
        return <FlaskConical className="w-5 h-5" />;
    }
  };

  const tabs: SiswaB1Tab[] = [
    "Rekomendasi Mapel Pilihan",
    "Evaluasi Nilai Mapel Pilihan",
    "Profil & Portofolio Akademik",
  ];

  return (
    <div
      className="siswa-b1-root min-h-screen bg-white flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900 text-[#1E1E1E]"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 max-w-md bg-white border border-[#E9E9E9] rounded-2xl shadow-xl p-4 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#1E1E1E]">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navbar */}
      <SiswaB1Navbar />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-[#737373] mb-6"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-[#5F089E] transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#737373]" />
            <span>Beranda</span>
          </Link>
          <span className="text-[#CFC2D4]">/</span>
          <span>B1 (Peminatan &amp; Profil Siswa)</span>
          <span className="text-[#CFC2D4]">/</span>
          <span className="text-[#56078E] font-medium">{activeTab}</span>
        </nav>

        {/* Top Header Section: Dynamic per active tab */}
        {activeTab === "Evaluasi Nilai Mapel Pilihan" ? (
          <section className="mb-8 space-y-2 animate-in fade-in duration-200">
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#1E1E1E] leading-tight">
              Evaluasi Nilai Mapel Pilihan
            </h1>
            <p className="text-xs sm:text-sm text-[#4C4452] leading-relaxed max-w-lg">
              Pemeriksaan silang nilai digital dengan buku rapor fisik oleh Wali Kelas.
            </p>
          </section>
        ) : activeTab === "Profil & Portofolio Akademik" ? (
          <section className="mb-8 space-y-2 animate-in fade-in duration-200">
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#1E1E1E] leading-tight">
              Profil &amp; Portofolio Akademik Siswa
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-lg">
              Kelola data diri dan kembangkan portofolio prestasimu di sini.
            </p>
          </section>
        ) : (
          <section className="w-full rounded-[20px] border-2 border-[#E9E9E9] bg-white px-6 sm:px-10 py-7 sm:py-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
            <div className="flex items-center gap-5 sm:gap-7">
              <div className="w-14 h-14 rounded-xl bg-[#5F089E] text-white flex items-center justify-center shadow-xs shrink-0">
                <CircleUserRound className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-[32px] font-bold text-[#1E1E1E] leading-tight">
                  Halo, {SISWA_B1_PROFILE.nama}
                </h1>
                <p className="text-sm sm:text-base text-black mt-1">
                  {SISWA_B1_PROFILE.sapaan}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1.5 text-sm border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <p className="text-[#737373] font-normal">
                NISN: <span className="font-medium">{SISWA_B1_PROFILE.nisn}</span>
              </p>
              <p className="text-black font-medium">
                Kelas: <span className="font-semibold">{SISWA_B1_PROFILE.kelas}</span>
              </p>
            </div>
          </section>
        )}

        {/* Navigation Tabs */}
        <div className="w-full border-b border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.02)] mb-9 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between max-w-5xl mx-auto px-2 sm:px-8 min-w-max gap-8">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-3.5 px-2 text-sm sm:text-base transition-all relative cursor-pointer ${
                    isActive
                      ? "text-[#5F089E] font-bold"
                      : "text-[#4C4452] font-normal hover:text-[#5F089E]"
                  }`}
                >
                  {tab}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5F089E] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: REKOMENDASI MAPEL PILIHAN */}
        {activeTab === "Rekomendasi Mapel Pilihan" && (
          <div className="space-y-12 animate-in fade-in duration-200">
            {/* Official Recommendation Letter Card with Top Purple Accent */}
            <div className="relative pt-2">
              {/* Top purple bar accent behind card matching Figma */}
              <div className="absolute top-0 left-2 right-2 h-8 rounded-[20px] bg-[#5F089E]" />

              <div className="relative rounded-[20px] border-2 border-[#E9E9E9] bg-white px-6 sm:px-9 py-7 sm:py-8 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start sm:items-center gap-5 sm:gap-6">
                    <div className="w-12 h-12 rounded-xl bg-[#F1DBFF] text-[#2D0050] flex items-center justify-center shadow-2xs shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-lg sm:text-2xl lg:text-[26px] font-semibold text-black tracking-tight leading-snug uppercase">
                        SURAT REKOMENDASI MATA PELAJARAN PEMINATAN
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-1.5 text-xs sm:text-sm text-black">
                        <p>
                          <span className="font-bold">Tanggal Diterbitkan:</span>{" "}
                          <span className="font-medium">
                            {SISWA_B1_PROFILE.suratRekomendasi.tanggalTerbit}
                          </span>
                        </p>
                        <p>
                          <span className="font-bold">Dikirim oleh:</span>{" "}
                          <span className="font-medium">
                            {SISWA_B1_PROFILE.suratRekomendasi.pengirim}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2 lg:pt-0 lg:self-end">
                    <button
                      type="button"
                      onClick={() => setShowPdfPreview(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 h-9 rounded-lg bg-[#ECEEF1] hover:bg-[#dfe3e8] text-[#410070] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Pratinjau PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-9 rounded-lg bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Surat Rekomendasi (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Rekomendasi Mata Pelajaran Pilihan */}
            <section className="space-y-7">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-2xl sm:text-[32px] font-bold text-[#1E1E1E] leading-tight">
                  Rekomendasi Mata Pelajaran Pilihan
                </h2>
                <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                  Berikut rekomendasi mapel pilihan untukmu berdasarkan hasil analisis data akademik
                  dan minat kariermu.
                </p>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {RECOMMENDED_SUBJECTS.map((subj) => (
                  <div
                    key={subj.id}
                    onClick={() => setSelectedSubject(subj)}
                    className="group rounded-[20px] border-2 border-[#E9E9E9] hover:border-[#5F089E] bg-white p-6 sm:p-7 flex flex-col justify-between min-h-[260px] transition-all duration-200 hover:shadow-lg hover:shadow-purple-950/5 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="space-y-5">
                      {/* Icon Box */}
                      <div className="flex items-center justify-between">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: subj.iconBg,
                            color: subj.iconColor,
                          }}
                        >
                          {renderSubjectIcon(subj.iconType)}
                        </div>

                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5F089E] opacity-0 group-hover:opacity-100 transition-opacity">
                          {subj.tingkatKesesuaian}% Cocok
                        </span>
                      </div>

                      {/* Subject Label & Name */}
                      <div className="space-y-1.5 pt-1">
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider block"
                          style={{ color: subj.labelColor }}
                        >
                          {subj.urutan}
                        </span>
                        <h3 className="text-lg font-bold text-[#191C1E] group-hover:text-[#5F089E] transition-colors leading-snug">
                          {subj.nama}
                        </h3>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-5 mt-8 border-t border-[#CFC2D4]/30 flex items-center justify-between text-[#410070]">
                      <span className="text-sm font-semibold">Cek Detail</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: EVALUASI NILAI MAPEL PILIHAN */}
        {activeTab === "Evaluasi Nilai Mapel Pilihan" && (
          <SiswaB1EvaluasiSection onShowToast={triggerToast} />
        )}

        {/* TAB 3: PROFIL & PORTOFOLIO AKADEMIK */}
        {activeTab === "Profil & Portofolio Akademik" && (
          <SiswaB1ProfilSection onShowToast={triggerToast} />
        )}
      </main>

      {/* Modals */}
      <SiswaB1PdfPreviewModal
        isOpen={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        onDownload={handleDownloadPdf}
      />

      <SiswaB1SubjectDetailModal
        subject={selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#F5F5F5] py-6 text-center text-xs text-[#737373] bg-white">
        <p>
          &copy; 2026 Eightracer SMAN 8 Malang &bull; Kelompok B1 (Peminatan &amp; Profil Siswa)
        </p>
      </footer>
    </div>
  );
}

