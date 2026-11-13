"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ChevronLeft,
  Search,
  X,
  Edit2,
  Check,
} from "lucide-react";
import WaliKelasB1Navbar from "./WaliKelasB1Navbar";
import { initialWaliKelasStudents } from "./mockData";
import { StudentB1WaliKelas } from "./types";
import WaliKelasB1RevisiModal from "./WaliKelasB1RevisiModal";
import WaliKelasB1ApproveModal from "./WaliKelasB1ApproveModal";
import WaliKelasB1StudentDetailModal from "./WaliKelasB1StudentDetailModal";

export default function WaliKelasB1Page() {
  const [students, setStudents] = useState<StudentB1WaliKelas[]>(
    initialWaliKelasStudents
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("std-1");

  // Modals state
  const [isRevisiModalOpen, setIsRevisiModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalStudent, setDetailModalStudent] =
    useState<StudentB1WaliKelas | null>(null);

  // State untuk edit nilai buku rapor fisik langsung oleh guru
  const [isEditingRapor, setIsEditingRapor] = useState(false);
  const [inputBukuRapor, setInputBukuRapor] = useState<string>("");

  // Success alert toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  const handleOpenDetailModal = (student: StudentB1WaliKelas) => {
    setDetailModalStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleSaveBukuRapor = () => {
    const parsed = parseFloat(inputBukuRapor);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      showToast("Harap masukkan nilai rapor yang valid antara 0 - 100.");
      return;
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudent.id && s.mapelDiscrepancy) {
          const selisihBaru = s.mapelDiscrepancy.inputMandiri - parsed;
          return {
            ...s,
            mapelDiscrepancy: {
              ...s.mapelDiscrepancy,
              bukuRapor: parsed,
              selisih: selisihBaru,
            },
          };
        }
        return s;
      })
    );

    setIsEditingRapor(false);
    showToast(`Nilai rapor fisik untuk ${selectedStudent.nama} berhasil diperbarui menjadi ${parsed.toFixed(1)}!`);
  };

  const handleApproveDiscrepancy = () => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              statusRapor: "Tervalidasi Rapor Fisik",
              hasDiscrepancy: false,
            }
          : s
      )
    );
    showToast(
      `Nilai rapor fisik siswa ${selectedStudent.nama} berhasil disahkan dan divalidasi!`
    );
  };

  const handleSendRevision = (note: string, updatedBukuRapor?: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudent.id) {
          const updatedDiscrepancy = s.mapelDiscrepancy
            ? {
                ...s.mapelDiscrepancy,
                bukuRapor: updatedBukuRapor ?? s.mapelDiscrepancy.bukuRapor,
                selisih: updatedBukuRapor
                  ? s.mapelDiscrepancy.inputMandiri - updatedBukuRapor
                  : s.mapelDiscrepancy.selisih,
              }
            : undefined;

          return {
            ...s,
            statusRapor: "Perlu Koreksi Fisik",
            mapelDiscrepancy: updatedDiscrepancy,
          };
        }
        return s;
      })
    );
    showToast(
      `Permintaan perbaikan nilai (${updatedBukuRapor ?? selectedStudent.mapelDiscrepancy?.bukuRapor}) telah dikirimkan ke siswa ${selectedStudent.nama}. Catatan: "${note}"`
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Antrean count
  const pendingCount = students.filter(
    (s) => s.statusRapor === "Antrean Cek"
  ).length;

  // Filtered students by search query
  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      student.nama.toLowerCase().includes(q) ||
      student.nisn.toLowerCase().includes(q) ||
      student.statusRapor.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FDFBF9] font-sans flex flex-col text-slate-800">
      <WaliKelasB1Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 max-w-md bg-white border border-[#E9D7FE] shadow-xl rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-8 h-8 rounded-full bg-[#F9F5FF] text-[#5F089E] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 block mb-0.5">
              Notifikasi Sistem
            </span>
            <span className="text-slate-600 leading-relaxed">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 py-8 flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
          <Link href="/" className="hover:text-slate-700 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="hover:text-slate-700 transition-colors">
            B1 (Peminatan &amp; Profil Siswa)
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 font-semibold">
            Pemantauan Kelas Binaan
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight">
            Pemantauan Kelas Binaan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau perkembangan data akademik, profil, dan capaian belajar siswa di kelasmu
          </p>
          <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-2xs">
            <span className="text-[#5F089E] font-bold">Kelas: X-3</span>
            <span>&bull;</span>
            <span>Wali Kelas: Drs. H. Subagyo</span>
          </div>
        </div>

        {/* Two-Column Grid: Left Student Table, Right Validation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Tabel Daftar Siswa (col-span-7 / 8) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Table Header & Search Bar */}
            <div className="p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Daftar Siswa
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pantau kelengkapan profil, pemilihan mata pelajaran, dan status akademik siswa.
                </p>
              </div>

              {/* Search Bar & Total Counter */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama atau NISN..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F089E]/20 focus:border-[#5F089E] transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <span className="text-xs font-semibold text-[#5F089E] bg-[#F9F5FF] px-2.5 py-2 rounded-xl border border-[#E9D7FE] shrink-0">
                  Total: {students.length} Siswa
                </span>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-12">No</th>
                    <th className="py-3 px-4">NISN &amp; Nama Siswa</th>
                    <th className="py-3 px-4 text-center">Kelengkapan Profil</th>
                    <th className="py-3 px-4 text-center">Mapel Pilihan</th>
                    <th className="py-3 px-4 text-center">Rata-Rata</th>
                    <th className="py-3 px-4 text-center">Status Rapor</th>
                    <th className="py-3 px-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const isSelected = student.id === selectedStudentId;
                      return (
                        <tr
                          key={student.id}
                          onClick={() => setSelectedStudentId(student.id)}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[rgba(241,219,255,0.22)] border-l-4 border-l-[#5F089E]"
                              : "hover:bg-slate-50/60"
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                            {student.no}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">
                              {student.nama}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              NISN: {student.nisn}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Lengkap {student.kelengkapanProfil}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                            {student.mapelPilihanCount}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                            {student.rataRata.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {student.statusRapor === "Tervalidasi Rapor Fisik" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Tervalidasi Rapor Fisik
                              </span>
                            ) : student.statusRapor === "Antrean Cek" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Antrean Cek
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                Perlu Koreksi Fisik
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetailModal(student);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#5F089E] hover:bg-[#4E0782] transition-colors shadow-2xs active:scale-95"
                            >
                              <Eye className="w-3 h-3" />
                              Tinjau Profil
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada siswa yang sesuai dengan kata kunci &quot;{searchQuery}&quot;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Menampilkan {filteredStudents.length} dari {students.length} siswa rombel binaan X-3
              </span>
              <div className="flex items-center gap-1 font-semibold">
                <button
                  type="button"
                  disabled
                  className="px-2.5 py-1 rounded-md text-slate-300 cursor-not-allowed flex items-center gap-1 text-[11px]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-md bg-[#5F089E] text-white flex items-center justify-center text-xs font-bold shadow-2xs"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-700 flex items-center justify-center text-xs transition-colors"
                >
                  2
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-700 flex items-center justify-center text-xs transition-colors"
                >
                  3
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-md text-slate-600 hover:bg-slate-100 flex items-center gap-1 text-[11px] transition-colors"
                >
                  Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Card Validasi Nilai Rapor Fisik (UC-13) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs sticky top-28">
            {/* Header Card */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Validasi Nilai Rapor Fisik
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verifikasi side-by-side legger fisik sekolah vs inputan siswa
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                Antrean: 1 dari {pendingCount || 1}
              </span>
            </div>

            {/* Profile Avatar of Selected Student */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-[#5F089E] to-[#8C3BE2] text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                  {selectedStudent.initial}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {selectedStudent.nama}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    NISN: {selectedStudent.nisn} &bull; Kelas {selectedStudent.kelas}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {selectedStudent.semester}
              </span>
            </div>

            {/* Discrepancy Mapel Details */}
            {selectedStudent.hasDiscrepancy && selectedStudent.mapelDiscrepancy ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                    Mata Pelajaran: {selectedStudent.mapelDiscrepancy.namaMapel}
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    Selisih: {selectedStudent.mapelDiscrepancy.selisih.toFixed(1)} Poin
                  </span>
                </div>

                {/* Dual Comparison Box */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Left: Input Siswa */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Input Mandiri
                    </span>
                    <span className="text-3xl font-extrabold text-[#5F089E] my-1 block">
                      {selectedStudent.mapelDiscrepancy.inputMandiri.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Oleh Siswa ({selectedStudent.mapelDiscrepancy.tanggalInput})
                    </span>
                  </div>

                  {/* Right: Buku Rapor */}
                  <div className="border border-rose-200 rounded-xl p-3 bg-rose-50/30 text-center relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                        Buku Rapor
                      </span>
                      {!isEditingRapor && (
                        <button
                          type="button"
                          onClick={() => {
                            setInputBukuRapor(selectedStudent.mapelDiscrepancy?.bukuRapor.toString() || "90");
                            setIsEditingRapor(true);
                          }}
                          title="Ubah nilai seharusnya sesuai buku rapor fisik"
                          className="text-xs text-[#5F089E] hover:text-[#450474] flex items-center gap-1 font-semibold underline cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Ubah</span>
                        </button>
                      )}
                    </div>

                    {isEditingRapor ? (
                      <div className="my-1.5 space-y-1">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            autoFocus
                            value={inputBukuRapor}
                            onChange={(e) => setInputBukuRapor(e.target.value)}
                            className="w-20 text-center text-xl font-extrabold text-[#BA1A1A] border-2 border-rose-400 rounded-lg bg-white px-1 py-0.5 outline-none focus:ring-2 focus:ring-[#5F089E]"
                          />
                          <button
                            type="button"
                            onClick={handleSaveBukuRapor}
                            className="p-1 rounded-md bg-[#0E6245] text-white hover:bg-[#094732] cursor-pointer"
                            title="Simpan Nilai"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingRapor(false)}
                            className="p-1 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[9px] text-slate-500 block">Ketik angka 0 - 100</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold text-[#BA1A1A] my-1 block">
                          {selectedStudent.mapelDiscrepancy.bukuRapor.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-rose-600 font-semibold block">
                          Sesuai Rapor Fisik
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApproveModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0E6245] hover:bg-[#094732] flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Validasi &amp; Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRevisiModalOpen(true)}
                    className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Minta Revisi
                  </button>
                </div>
              </div>
            ) : (
              /* State when student is already validated or has no discrepancy */
              <div className="text-center py-8 px-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-emerald-800">
                  Semua Nilai Telah Sesuai Rapor Fisik
                </h4>
                <p className="text-[11px] text-emerald-600 mt-1 leading-relaxed">
                  Data nilai digital siswa {selectedStudent.nama} telah tervalidasi dan disahkan oleh Wali Kelas.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenDetailModal(selectedStudent)}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#5F089E] hover:bg-[#4E0782] rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Lihat Detail Profil Siswa
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <WaliKelasB1RevisiModal
        isOpen={isRevisiModalOpen}
        onClose={() => setIsRevisiModalOpen(false)}
        student={selectedStudent}
        onSubmit={handleSendRevision}
      />

      <WaliKelasB1ApproveModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        student={selectedStudent}
        onConfirm={handleApproveDiscrepancy}
      />

      {detailModalStudent && (
        <WaliKelasB1StudentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          student={detailModalStudent}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-[#F5F5F5] py-6 text-center text-xs text-[#737373] bg-white">
        <p>
          &copy; 2026 Eightracer SMAN 8 Malang &bull; Kelompok B1 (Peminatan &amp; Profil Siswa)
        </p>
      </footer>
    </div>
  );
}

