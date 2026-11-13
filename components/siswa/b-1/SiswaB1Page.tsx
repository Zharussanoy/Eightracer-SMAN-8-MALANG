"use client";

import {
  ArrowRight,
  Atom,
  Calculator,
  CheckCircle2,
  CircleUserRound,
  Download,
  FlaskConical,
  Home,
  Hourglass,
  Lock,
  ShieldCheck,
  TerminalSquare,
  X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  MOCK_STUDENT_ACCOUNTS,
  RECOMMENDED_SUBJECTS,
} from "./mockData";
import { SiswaB1DirektoriSection } from "./SiswaB1DirektoriSection";
import { SiswaB1EvaluasiLockedState } from "./SiswaB1EvaluasiLockedState";
import { SiswaB1EvaluasiSection } from "./SiswaB1EvaluasiSection";
import SiswaB1Navbar from "./SiswaB1Navbar";
import { SiswaB1PdfPreviewModal } from "./SiswaB1PdfPreviewModal";
import { SiswaB1ProfilSection } from "./SiswaB1ProfilSection";
import { SiswaB1SimulasiSwitcher } from "./SiswaB1SimulasiSwitcher";
import { SiswaB1SubjectDetailModal } from "./SiswaB1SubjectDetailModal";
import { SiswaB1SuratPendingModal } from "./SiswaB1SuratPendingModal";
import { determineStudentAccess } from "./studentAccessPolicy";
import {
  MapelPilihanDetail,
  SiswaB1Tab,
  StudentB1Account,
} from "./types";

export default function SiswaB1Page() {
  // Simulasi akun aktif: Default Amalia Mayasari (Kelas X-3)
  const [currentStudent, setCurrentStudent] = useState<StudentB1Account>(
    MOCK_STUDENT_ACCOUNTS[0]
  );
  // Status Validasi Surat Rekomendasi oleh Admin/Guru BK
  const [isSuratValidated, setIsSuratValidated] = useState<boolean>(() => {
    return MOCK_STUDENT_ACCOUNTS[0].isSuratValidated ?? false;
  });
  const [activeTab, setActiveTab] = useState<SiswaB1Tab>(
    "Rekomendasi Mapel Pilihan"
  );
  const [selectedSubject, setSelectedSubject] =
    useState<MapelPilihanDetail | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Evaluasi hak akses terpisah dari UI, memperhatikan jenjang & status validasi surat
  const accessRules = determineStudentAccess(currentStudent, isSuratValidated);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleSelectAccount = (acc: StudentB1Account) => {
    setCurrentStudent(acc);
    if (acc.isSuratValidated !== undefined) {
      setIsSuratValidated(acc.isSuratValidated);
    }
    const newRules = determineStudentAccess(acc, acc.isSuratValidated);
    triggerToast(
      `Berhasil masuk sebagai ${acc.nama} (${acc.kelas} - Jenjang ${newRules.jenjang})`
    );
  };

  const handleToggleSuratValidation = (validated: boolean) => {
    setIsSuratValidated(validated);
    triggerToast(
      validated
        ? "Status Surat Rekomendasi: Tervalidasi & Terkunci oleh Admin/BK"
        : "Status Surat Rekomendasi: Menunggu Validasi & Penguncian oleh Admin/BK"
    );
  };

  const handleOpenSuratRekomendasi = () => {
    if (!isSuratValidated) {
      setShowPendingModal(true);
    } else {
      setShowPdfPreview(true);
    }
  };

  const handleDownloadPdf = () => {
    if (!isSuratValidated) {
      setShowPendingModal(true);
      return;
    }
    triggerToast(
      `Surat_Rekomendasi_Peminatan_${currentStudent.nama.replace(/\s+/g, "_")}_${currentStudent.kelas}.pdf berhasil diunduh!`
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

  const tabs: { label: SiswaB1Tab; locked?: boolean; badge?: string }[] = [
    {
      label: "Rekomendasi Mapel Pilihan",
    },
    {
      label: "Evaluasi Nilai Mapel Pilihan",
      locked: !accessRules.canAccessEvaluasi,
      badge: !accessRules.canAccessEvaluasi
        ? "Menunggu Validasi BK"
        : undefined,
    },
    {
      label: "Profil & Portofolio Akademik",
    },
    {
      label: "Direktori Siswa",
    },
  ];

  return (
    <div
      className="siswa-b1-root min-h-screen bg-white flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900 text-slate-900"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 max-w-md bg-white border border-[#E9E9E9] rounded-2xl shadow-xl p-4 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-900">{toastMessage}</p>
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

      {/* Navbar with dynamic active student */}
      <SiswaB1Navbar currentStudent={currentStudent} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 font-sans">
        {/* Simulasi Switcher Bar (Pengujian Jenjang Kelas X, XI, XII & Validasi Surat) */}
        <SiswaB1SimulasiSwitcher
          accounts={MOCK_STUDENT_ACCOUNTS}
          currentAccount={currentStudent}
          onSelectAccount={handleSelectAccount}
          isSuratValidated={isSuratValidated}
          onToggleSuratValidation={handleToggleSuratValidation}
        />

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs font-sans text-slate-500 mb-6 py-1"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-[#5F089E] transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Beranda</span>
          </Link>
          <span className="text-slate-300 font-normal">/</span>
          <span>B1 (Peminatan &amp; Profil Siswa)</span>
          <span className="text-slate-300 font-normal">/</span>
          <span className="text-[#5F089E] font-semibold">{activeTab}</span>
        </nav>

        {/* Top Header Section: Dynamic per active tab */}
        {activeTab === "Evaluasi Nilai Mapel Pilihan" ? (
          <section className="mb-8 space-y-1.5 font-sans animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Evaluasi Nilai Mapel Pilihan
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#5F089E]">
                Jenjang {accessRules.jenjang}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-3xl">
              Pemeriksaan silang nilai digital dengan buku rapor fisik oleh Wali Kelas.
            </p>
          </section>
        ) : activeTab === "Profil & Portofolio Akademik" ? (
          <section className="mb-8 space-y-1.5 font-sans animate-in fade-in duration-200">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Profil &amp; Portofolio Akademik Siswa
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-3xl">
              Kelola data diri dan kembangkan portofolio prestasimu di sini.
            </p>
          </section>
        ) : activeTab === "Direktori Siswa" ? (
          <section className="mb-8 space-y-1.5 font-sans animate-in fade-in duration-200">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Direktori Siswa SMARIHASTA
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-3xl">
              Eksplorasi rekam jejak, konsentrasi peminatan mata pelajaran, dan target studi lanjut rekan Bhaskara.
            </p>
          </section>
        ) : (
          <section className="w-full rounded-[20px] border border-slate-200 bg-white px-6 sm:px-8 py-6 sm:py-7 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs font-sans">
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="w-14 h-14 rounded-xl bg-[#5F089E] text-white flex items-center justify-center shadow-xs shrink-0">
                <CircleUserRound className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Halo, {currentStudent.nama}
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#5F089E] border border-purple-200 text-xs font-bold">
                    Fase {accessRules.jenjang === "X" ? "E (Kelas X)" : `F (Kelas ${accessRules.jenjang})`}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-normal mt-1">
                  Selamat datang di portal rekomendasi mapel pilihan
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1.5 text-sm border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <p className="text-slate-500 font-normal text-xs sm:text-sm">
                NISN: <span className="font-semibold font-mono text-slate-800">{currentStudent.nisn}</span>
              </p>
              <p className="text-slate-800 font-medium text-xs sm:text-sm">
                Kelas: <span className="font-bold text-[#5F089E]">{currentStudent.kelas}</span> &bull; Semester {currentStudent.semester}
              </p>
            </div>
          </section>
        )}

        {/* Navigation Tabs with Access Restriction Badge */}
        <div className="w-full border-b border-slate-200 mb-8 sm:mb-9 font-sans overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between max-w-5xl mx-auto px-2 sm:px-8 min-w-max gap-8">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(tab.label)}
                  className={`py-3.5 px-2 text-sm transition-all duration-200 relative cursor-pointer flex items-center gap-2 active:scale-95 ${
                    isActive
                      ? "text-[#5F089E] font-bold"
                      : "text-slate-600 font-medium hover:text-[#5F089E] hover:-translate-y-0.5"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.locked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 transition-transform group-hover:scale-105">
                      <Lock className="w-2.5 h-2.5" />
                      Terkunci
                    </span>
                  )}
                  {!tab.locked && tab.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 transition-transform group-hover:scale-105">
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5F089E] rounded-full animate-in fade-in zoom-in-95 duration-200" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: REKOMENDASI MAPEL PILIHAN */}
        {activeTab === "Rekomendasi Mapel Pilihan" && (
          <div className="space-y-12 animate-in fade-in duration-200">
            {/* Official Recommendation Letter Card */}
            <div className="relative pt-2">
              <div
                className="absolute top-0 left-2 right-2 h-8 rounded-[20px] transition-colors bg-[#5F089E]"
              />

              <div
                onClick={handleOpenSuratRekomendasi}
                className="relative rounded-[20px] border-2 border-[#E9E9E9] bg-white px-6 sm:px-9 py-7 sm:py-8 shadow-xs hover:border-[#5F089E]/60 hover:shadow-xl hover:shadow-purple-950/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group active:scale-[0.995]"
                title="Klik untuk melihat status surat rekomendasi peminatan"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start sm:items-center gap-5 sm:gap-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-2xs shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 bg-[#F1DBFF] text-[#2D0050]">
                      <ShieldCheck className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-lg sm:text-2xl lg:text-[26px] font-semibold tracking-tight leading-snug uppercase text-slate-900 group-hover:text-[#5F089E] transition-colors">
                          SURAT REKOMENDASI PEMINATAN
                        </h2>
                        {!isSuratValidated ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#5F089E] border border-purple-200 transition-transform group-hover:scale-105">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5F089E] animate-pulse" />
                            Menunggu Validasi BK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 transition-transform group-hover:scale-105">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Tervalidasi Resmi
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-1.5 text-xs sm:text-sm text-black">
                        <p>
                          <span className="font-bold">Tanggal Diterbitkan:</span>{" "}
                          <span className="font-medium">
                            {isSuratValidated ? "12 Mei 2026" : "Dalam Proses Peninjauan"}
                          </span>
                        </p>
                        <p>
                          <span className="font-bold">Dikirim oleh:</span>{" "}
                          <span className="font-medium">
                            Dra. Endang Sulastri (Koordinator BK)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div
                    className="flex items-center justify-end pt-2 lg:pt-0 lg:self-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!isSuratValidated ? (
                      <button
                        type="button"
                        onClick={handleOpenSuratRekomendasi}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-10 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer"
                      >
                        <Hourglass className="w-4 h-4 transition-transform group-hover:rotate-12" />
                        <span>Sedang dalam Proses Peninjauan</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOpenSuratRekomendasi}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-10 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer"
                      >
                        <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                        <span>Unduh Surat Rekomendasi (PDF)</span>
                      </button>
                    )}
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
                  {isSuratValidated
                    ? "Berikut rekomendasi mapel pilihan untukmu berdasarkan hasil analisis data akademik dan minat kariermu."
                    : "Rekomendasi paket mata pelajaran pilihan akan otomatis ditampilkan setelah surat rekomendasi divalidasi oleh Guru BK."}
                </p>
              </div>

              {!isSuratValidated ? (
                /* KONDISI BELUM DIVALIDASI: Kartu rekomendasi mapel pilihan BELUM MUNCUL */
                <div className="w-full rounded-[24px] border-2 border-dashed border-amber-200/90 bg-[#FFFDF5] p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-5 shadow-2xs">
                  <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] text-[#5F089E] flex items-center justify-center mx-auto shadow-xs">
                    <Hourglass className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#854D0E] border border-amber-300">
                      <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse" />
                      STATUS: MENUNGGU VALIDASI GURU BK
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Rekomendasi Mapel Pilihan Belum Tersedia
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                      Paket 4 rekomendasi mata pelajaran pilihan Fase F Anda belum dapat ditampilkan karena masih dalam proses evaluasi oleh Tim Guru Bimbingan dan Konseling SMAN 8 Malang. Kartu rekomendasi akan otomatis muncul di halaman ini setelah Guru BK menyelesaikan validasi.
                    </p>
                  </div>
                </div>
              ) : (
                /* KONDISI TERVALIDASI: 4 Cards Grid Muncul Lengkap (Gaya Uiverse dengan Tema Ungu Sistem) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                  {RECOMMENDED_SUBJECTS.map((subj) => (
                    <div
                      key={subj.id}
                      onClick={() => setSelectedSubject(subj)}
                      className="group relative rounded-[24px] border-2 border-slate-200/90 bg-white p-6 sm:p-7 flex flex-col justify-between min-h-[300px] transition-all duration-300 hover:border-[#5F089E] hover:shadow-2xl hover:shadow-purple-950/10 hover:-translate-y-2 active:scale-[0.98] cursor-pointer overflow-hidden font-sans"
                    >
                      {/* Top Floating Tag (Persis .tag di snippet Uiverse) */}
                      <div className="absolute top-4 right-4 z-10">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold shadow-2xs transition-all duration-300 group-hover:scale-105 ${
                            subj.tingkatKesesuaian >= 95
                              ? "bg-[#5F089E] text-white"
                              : "bg-purple-50 text-[#5F089E] border border-purple-200/80"
                          }`}
                        >
                          {subj.tingkatKesesuaian}% Cocok
                        </span>
                      </div>

                      <div className="space-y-4 pt-1">
                        {/* Card Visual / Icon Showcase Area (Persis .card-image di snippet) */}
                        <div className="w-full flex items-center justify-start pt-1">
                          <div
                            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xs"
                            style={{
                              backgroundColor: subj.iconBg,
                              color: subj.iconColor,
                            }}
                          >
                            {renderSubjectIcon(subj.iconType)}
                          </div>
                        </div>

                        {/* Content Area (Persis .content di snippet) */}
                        <div className="space-y-1.5 pt-1">
                          <span
                            className="text-[11px] font-bold uppercase tracking-wider block transition-colors group-hover:opacity-90"
                            style={{ color: subj.labelColor }}
                          >
                            {subj.urutan}
                          </span>
                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#5F089E] transition-colors leading-snug">
                            {subj.nama}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                            {subj.kategori}
                          </p>
                        </div>
                      </div>

                      {/* Card Button Full-Width: Tersembunyi saat normal, muncul saat kursor di area card */}
                      <div className="pt-4 mt-3 border-t border-slate-100/90 transition-all duration-300 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                        <button
                          type="button"
                          className="w-full h-10 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-purple-900/20 active:scale-95 cursor-pointer"
                        >
                          <span>Cek Detail Mata Pelajaran</span>
                          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: EVALUASI NILAI MAPEL PILIHAN (DENGAN PEMBATASAN KELAS X & VALIDASI SURAT) */}
        {activeTab === "Evaluasi Nilai Mapel Pilihan" && (
          <>
            {/* KETENTUAN: Kelas X atau Surat Rekomendasi belum divalidasi TIDAK DAPAT mengakses Evaluasi Nilai */}
            {!accessRules.canAccessEvaluasi ? (
              <SiswaB1EvaluasiLockedState
                student={currentStudent}
                accessRules={accessRules}
                onGoToRekomendasi={() => setActiveTab("Rekomendasi Mapel Pilihan")}
                onGoToProfil={() => setActiveTab("Profil & Portofolio Akademik")}
              />
            ) : (
              /* Kelas XI dan XII dengan evaluasi status dinamis (Input Mandiri) */
              <SiswaB1EvaluasiSection
                student={currentStudent}
                onShowToast={triggerToast}
              />
            )}
          </>
        )}

        {/* TAB 3: PROFIL & PORTOFOLIO AKADEMIK (DENGAN RIWAYAT KELAS & SEMESTER) */}
        {activeTab === "Profil & Portofolio Akademik" && (
          <SiswaB1ProfilSection
            student={currentStudent}
            onShowToast={triggerToast}
          />
        )}

        {/* TAB 4: DIREKTORI SISWA (EKSPLORASI PROFIL SISWA LAIN) */}
        {activeTab === "Direktori Siswa" && (
          <SiswaB1DirektoriSection onShowToast={triggerToast} />
        )}
      </main>

      {/* Modals */}
      <SiswaB1SuratPendingModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        onGoToProfil={() => setActiveTab("Profil & Portofolio Akademik")}
      />

      <SiswaB1PdfPreviewModal
        isOpen={showPdfPreview}
        student={currentStudent}
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
