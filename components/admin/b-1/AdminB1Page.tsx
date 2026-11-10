"use client";

import { useState } from "react";
import { Montserrat } from "next/font/google";
import AdminB1Navbar from "./AdminB1Navbar";
import AdminB1Breadcrumb from "./AdminB1Breadcrumb";
import AdminB1Header from "./AdminB1Header";
import AdminB1Tabs from "./AdminB1Tabs";
import AdminB1UploadSection from "./AdminB1UploadSection";
import AdminB1TableSection from "./AdminB1TableSection";
import AdminB1StudentDetailModal from "./AdminB1StudentDetailModal";
import AdminB1Subviews from "./AdminB1Subviews";
import { B1Tab, StudentB1, UploadedFileState } from "./types";
import { DEFAULT_UPLOADED_FILE, MOCK_STUDENTS_B1 } from "./mockData";
import { CheckCircle2, X } from "lucide-react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-b1-montserrat",
});

export default function AdminB1Page() {
  const [activeTab, setActiveTab] = useState<B1Tab>("Pusat Manajemen Data");
  const [students] = useState<StudentB1[]>(MOCK_STUDENTS_B1);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(
    DEFAULT_UPLOADED_FILE
  );
  const [selectedStudent, setSelectedStudent] = useState<StudentB1 | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveData = () => {
    if (!uploadedFile) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setUploadedFile((prev) =>
        prev ? { ...prev, status: "Tersimpan" } : null
      );
      setToastMessage(
        `Sukses! Berkas ${uploadedFile.name} (${uploadedFile.readCount} siswa) berhasil disimpan & disinkronkan ke pemetaan.`
      );
      setTimeout(() => setToastMessage(null), 5000);
    }, 1200);
  };

  return (
    <div
      className={`b1-root ${montserrat.variable} ${montserrat.className} min-h-screen bg-white flex flex-col font-['Montserrat',sans-serif] selection:bg-purple-100 selection:text-purple-900 text-[#1E1E1E]`}
    >
      {/* Strictly scope Montserrat font to all B1 elements */}
      <style jsx global>{`
        .b1-root,
        .b1-root * {
          font-family: var(--font-b1-montserrat), "Montserrat", sans-serif !important;
        }
      `}</style>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 max-w-md bg-white border border-[#E9E9E9] rounded-2xl shadow-xl p-4 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-[#1E1E1E]">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Navigation */}
      <AdminB1Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <AdminB1Breadcrumb activeTab={activeTab} />

        {/* Page Title & Subtitle */}
        <AdminB1Header activeTab={activeTab} />

        {/* Subnavigation Tabs */}
        <AdminB1Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Views */}
        {activeTab === "Pusat Manajemen Data" ? (
          <>
            {/* Upload Section */}
            <AdminB1UploadSection
              uploadedFile={uploadedFile}
              onFileChange={setUploadedFile}
              onSaveData={handleSaveData}
              isSaving={isSaving}
            />

            {/* Table & Filter Section */}
            <AdminB1TableSection
              students={students}
              onSelectStudent={setSelectedStudent}
            />
          </>
        ) : (
          <AdminB1Subviews
            activeTab={activeTab}
            onNavigateToData={() => setActiveTab("Pusat Manajemen Data")}
            onShowToast={(msg) => {
              setToastMessage(msg);
              setTimeout(() => setToastMessage(null), 5000);
            }}
          />
        )}
      </main>

      {/* Student Detail Modal */}
      <AdminB1StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Simple Footer */}
      <footer className="mt-auto border-t border-[#F5F5F5] py-6 text-center text-xs text-[#737373] bg-white">
        <p>
          &copy; 2026 Eightracer SMAN 8 Malang &bull; Kelompok B1 (Peminatan &amp; Profil Siswa)
        </p>
      </footer>
    </div>
  );
}
