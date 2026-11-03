"use client";

import { useState, useRef } from "react";
import {
  Users,
  ClipboardList,
  BadgeCheck,
  TrendingUp,
  FileEdit,
  Lock,
  CheckCircle2,
  PenLine,
  UserPlus,
  X,
  Upload,
  Trash2,
  Save,
  BookOpen,
  Edit,
  Calendar,
  FileText,
} from "lucide-react";
import { B1Tab, RecommendationLetterData, StudentB1 } from "./types";
import { AdminB1AlignmentChart } from "./AdminB1AlignmentChart";
import { AdminB1LetterEditorModal } from "./AdminB1LetterEditorModal";
import { AdminB1FeedbackTable } from "./AdminB1FeedbackTable";

const INITIAL_LETTER_DATA: RecommendationLetterData = {
  nomorSurat: "421.3/102/SMAN8/2026",
  tanggalSurat: "12 Mei 2026",
  namaSiswa: "Amalia Mayasari",
  nisn: "0012345678",
  kelas: "X-3",
  pembuka:
    "Berdasarkan hasil analisis komprehensif profil bakat, minat, evaluasi capaian rapor semester, dan tes kecerdasan majemuk peserta didik, SMA Negeri 8 Malang menerbitkan Surat Rekomendasi Peminatan Akademik bagi:",
  mataPelajaran: [
    "Matematika Tingkat Lanjut",
    "Fisika Lanjut",
    "Informatika & Data Science",
    "Kimia Terapan",
  ],
  keterangan: [
    "Surat rekomendasi ini disusun oleh Guru Bimbingan dan Konseling berdasarkan hasil identifikasi potensi, minat, bakat, hasil belajar, serta informasi pendukung lainnya yang relevan. Rekomendasi ini bertujuan sebagai bahan pertimbangan dan referensi bagi murid dalam menentukan pilihan mata pelajaran sesuai dengan rencana studi lanjut dan pengembangan kariernya.",
    "Keputusan akhir mengenai pemilihan mata pelajaran tetap berada pada murid, dengan mempertimbangkan hasil refleksi diri, informasi yang tersedia, serta diskusi dan persetujuan orang tua/wali. Orang tua/wali diharapkan mendampingi murid dalam proses pengambilan keputusan tersebut.",
    "Surat rekomendasi ini tidak bersifat mengikat atau menentukan secara mutlak pilihan murid. Layanan Bimbingan dan Konseling berperan memfasilitasi murid agar mampu mengambil keputusan pendidikan secara mandiri, bertanggung jawab, dan sesuai dengan potensi serta rencana masa depannya.",
  ],
  namaPenandatangan: "Dra. Endang Sulastri",
  nipPenandatangan: "196908151994122003",
  jabatanPenandatangan: "KOORDINATOR BIMBINGAN KONSELING",
};

interface AdminB1SubviewsProps {
  activeTab: B1Tab;
  onNavigateToData: () => void;
  onShowToast?: (msg: string) => void;
}

type BKTeacher = { id: number; initials: string; nama: string; nip: string; color: string };

export default function AdminB1Subviews({
  activeTab,
  onShowToast,
}: AdminB1SubviewsProps) {
  // ── Validasi & Surat Rekomendasi state ──
  const [isLocked, setIsLocked] = useState(false);
  const [letterData, setLetterData] = useState<RecommendationLetterData>(INITIAL_LETTER_DATA);
  const [showLetterEditor, setShowLetterEditor] = useState(false);


  // ── Feedback Strategi state ──
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<StudentB1 | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});
  const [savedFeedbackStudentIds, setSavedFeedbackStudentIds] = useState<Set<string>>(new Set());
  const feedbackInputRef = useRef<HTMLDivElement>(null);

  // ── Direktori BK state ──
  const [bkTeachers, setBkTeachers] = useState<BKTeacher[]>([
    { id: 1, initials: "FK", nama: "Fitri Kusrini, S.Psi.", nip: "012345678", color: "bg-purple-300" },
    { id: 2, initials: "FK", nama: "Fitri Kusrini, S.Psi.", nip: "012345678", color: "bg-purple-300" },
    { id: 3, initials: "FK", nama: "Fitri Kusrini, S.Psi.", nip: "012345678", color: "bg-purple-300" },
    { id: 4, initials: "FK", nama: "Fitri Kusrini, S.Psi.", nip: "012345678", color: "bg-purple-300" },
  ]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<BKTeacher | null>(null);
  const [profileForm, setProfileForm] = useState({ nama: "", nip: "" });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Validasi handlers ──
  const handleValidateLock = () => {
    setIsLocked(true);
    onShowToast?.("Sukses! Surat Rekomendasi Peminatan berhasil divalidasi dan dikunci permanen.");
  };
  const handleSaveDraft = () => {
    onShowToast?.("Draft surat rekomendasi berhasil disimpan.");
  };

  // ── Feedback handlers ──
  const handleSelectStudentForFeedback = (student: StudentB1) => {
    setSelectedStudentForFeedback(student);
    setTimeout(() => {
      feedbackInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleSimpanFeedback = () => {
    if (!selectedStudentForFeedback) return;
    setSavedFeedbackStudentIds((prev) => new Set([...prev, selectedStudentForFeedback.id]));
    onShowToast?.(`Feedback strategi untuk ${selectedStudentForFeedback.nama} berhasil disimpan.`);
  };

  const handleTutupFeedbackForm = () => {
    setSelectedStudentForFeedback(null);
  };

  // ── BK Profile modal handlers ──
  const openAddModal = () => {
    setEditingTeacher(null);
    setProfileForm({ nama: "", nip: "" });
    setProfilePhotoUrl(null);
    setShowProfileModal(true);
  };
  const openEditModal = (teacher: BKTeacher) => {
    setEditingTeacher(teacher);
    setProfileForm({ nama: teacher.nama, nip: teacher.nip });
    setProfilePhotoUrl(null);
    setShowProfileModal(true);
  };
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhotoUrl(URL.createObjectURL(file));
  };
  const handleSaveProfile = () => {
    const initials = profileForm.nama
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
    if (editingTeacher) {
      setBkTeachers((prev) =>
        prev.map((t) =>
          t.id === editingTeacher.id
            ? { ...t, nama: profileForm.nama, nip: profileForm.nip, initials }
            : t
        )
      );
      onShowToast?.("Profil guru BK berhasil diperbarui.");
    } else {
      setBkTeachers((prev) => [
        ...prev,
        { id: Date.now(), initials, nama: profileForm.nama, nip: profileForm.nip, color: "bg-purple-300" },
      ]);
      onShowToast?.("Profil guru BK baru berhasil ditambahkan.");
    }
    setShowProfileModal(false);
  };
  const handleDeleteTeacher = () => {
    if (!editingTeacher) return;
    setBkTeachers((prev) => prev.filter((t) => t.id !== editingTeacher.id));
    onShowToast?.("Profil guru BK berhasil dihapus.");
    setShowProfileModal(false);
  };

  // ── Dashboard Konseling interactive state ──
  const [selectedStatCard, setSelectedStatCard] = useState<string | null>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<string | null>(null);
  const [hoveredMapel, setHoveredMapel] = useState<string | null>(null);

  // Mapel distribution data
  const mapelDistribution = [
    {
      name: "Matematika Tingkat Lanjut",
      percentage: "62.5%",
      students: 240,
      color: "bg-[#39055F]",
      textColor: "text-[#5F089E]",
      detail: "Mata pelajaran peminatan rumpun MIPA paling banyak diminati siswa."
    },
    {
      name: "Fisika Lanjut",
      percentage: "54.6%",
      students: 210,
      color: "bg-[#5F089E]",
      textColor: "text-[#5F089E]",
      detail: "Dominan dipilih oleh siswa dengan target studi Teknik dan MIPA."
    },
    {
      name: "Informatika & Data Science",
      percentage: "50.7%",
      students: 195,
      color: "bg-[#FCC850]",
      textColor: "text-amber-700",
      detail: "Kombinasi algoritma, logika pemrograman, dan statistika data."
    },
    {
      name: "Kimia Terapan",
      percentage: "48.1%",
      students: 185,
      color: "bg-[#10B981]",
      textColor: "text-emerald-700",
      detail: "Diminati calon mahasiswa Farmasi, Kedokteran, dan Teknik Kimia."
    },
    {
      name: "Sosiologi Lanjut & Antropologi",
      percentage: "20.8%",
      students: 80,
      color: "bg-slate-300",
      textColor: "text-slate-600",
      detail: "Pilihan peminatan rumpun Sosial Humaniora dan Hubungan Internasional."
    },
  ];

  // ==========================================
  // VIEW 1: DASHBOARD KONSELING (Matching Reference Image)
  // ==========================================
  if (activeTab === "Dashboard Konseling") {
    return (
      <div className="space-y-8 font-['Montserrat',sans-serif] animate-in fade-in duration-150">
        {/* Top 3 Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: TOTAL SISWA TERDATA */}
          <div
            onClick={() => {
              setSelectedStatCard(selectedStatCard === "total" ? null : "total");
              onShowToast?.("Detail: 384 siswa aktif terdata dari 10 rombel angkatan 2026/2027.");
            }}
            className={`bg-white border transition-all duration-200 cursor-pointer rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm min-h-[160px] group hover:border-[#5F089E]/40 hover:shadow-md ${
              selectedStatCard === "total" ? "ring-2 ring-[#5F089E] border-[#5F089E]" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                TOTAL SISWA TERDATA
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#5F089E] shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-slate-900 leading-none tracking-tight">
                384
              </span>
              {selectedStatCard === "total" && (
                <p className="text-xs text-[#5F089E] font-medium mt-2 animate-in fade-in">
                  ✓ 100% data biodata siswa telah tersinkron
                </p>
              )}
            </div>
          </div>

          {/* Card 2: DRAF USULAN REKOMENDASI */}
          <div
            onClick={() => {
              setSelectedStatCard(selectedStatCard === "draft" ? null : "draft");
              onShowToast?.("Detail: 14 usulan rekomendasi peminatan masih dalam status tinjauan konseling BK.");
            }}
            className={`bg-white border transition-all duration-200 cursor-pointer rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm min-h-[160px] group hover:border-amber-400/50 hover:shadow-md ${
              selectedStatCard === "draft" ? "ring-2 ring-amber-400 border-amber-400" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                DRAF USULAN REKOMENDASI
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-slate-900 leading-none tracking-tight">
                14
              </span>
              {selectedStatCard === "draft" && (
                <p className="text-xs text-amber-700 font-medium mt-2 animate-in fade-in">
                  • Memerlukan penyesuaian asesmen BK
                </p>
              )}
            </div>
          </div>

          {/* Card 3: SK TERBIT & TERKUNCI */}
          <div
            onClick={() => {
              setSelectedStatCard(selectedStatCard === "sk" ? null : "sk");
              onShowToast?.("Detail: 312 Surat Keputusan Rekomendasi telah divalidasi dan dikunci.");
            }}
            className={`bg-white border transition-all duration-200 cursor-pointer rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm min-h-[160px] group hover:border-[#5F089E]/40 hover:shadow-md ${
              selectedStatCard === "sk" ? "ring-2 ring-[#5F089E] border-[#5F089E]" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                SK TERBIT &amp; TERKUNCI
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#5F089E] shrink-0 group-hover:scale-105 transition-transform">
                <BadgeCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-[#5F089E] leading-none tracking-tight">
                312
              </span>
              {selectedStatCard === "sk" && (
                <p className="text-xs text-[#5F089E] font-medium mt-2 animate-in fade-in">
                  ✓ Berkas resmi siap cetak dan diarsipkan
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Distribusi Mata Pelajaran Peminatan (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Distribusi Mata Pelajaran Peminatan
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Preferensi pilihan siswa angkatan 2026/2027
              </p>
            </div>

            {/* Bar Chart Rows */}
            <div className="space-y-4 pt-2">
              {mapelDistribution.map((item) => {
                const isHovered = hoveredMapel === item.name;
                return (
                  <div
                    key={item.name}
                    className="space-y-1.5 group cursor-pointer"
                    onMouseEnter={() => setHoveredMapel(item.name)}
                    onMouseLeave={() => setHoveredMapel(null)}
                    onClick={() => {
                      onShowToast?.(`${item.name}: ${item.percentage} (${item.students} Siswa) - ${item.detail}`);
                    }}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-slate-800 group-hover:text-[#5F089E] transition-colors">
                        {item.name}
                      </span>
                      <span className={`font-bold ${item.textColor}`}>
                        {item.percentage} ({item.students} Siswa)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500 group-hover:opacity-90`}
                        style={{ width: item.percentage }}
                      />
                    </div>
                    {isHovered && (
                      <p className="text-[11px] text-slate-500 italic pt-0.5 animate-in fade-in">
                        {item.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Analisis Keselarasan Peminatan (5 cols) */}
          <AdminB1AlignmentChart onShowToast={onShowToast} />
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: VALIDASI & SURAT REKOMENDASI (Matching Image 3)
  // ==========================================
  if (activeTab === "Validasi & Surat Rekomendasi") {
    return (
      <>
        <div className="bg-white border border-purple-100 rounded-2xl p-6 sm:p-10 shadow-sm font-['Montserrat',sans-serif] space-y-6 animate-in fade-in duration-150">
          {/* Header Action Bar: Edit Surat Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#5F089E] border border-purple-100">
                <FileText className="w-3.5 h-3.5" />
                Nomor: {letterData.nomorSurat}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {letterData.tanggalSurat}
              </span>
            </div>

            <button
              type="button"
              disabled={isLocked}
              onClick={() => setShowLetterEditor(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isLocked
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : "bg-purple-50 hover:bg-purple-100 text-[#5F089E] border border-purple-200 hover:border-purple-300 shadow-sm"
              }`}
            >
              <Edit className="w-4 h-4" />
              <span>Edit Isi Surat</span>
            </button>
          </div>

          {/* Official Letterhead (Kop Surat) */}
          <div className="text-center space-y-0.5 pb-2">
            <p className="text-xs sm:text-[13px] font-bold text-slate-900 uppercase tracking-wider">
              PEMERINTAH PROVINSI JAWA TIMUR
            </p>
            <p className="text-xs sm:text-[13px] font-bold text-slate-900 uppercase tracking-wider">
              DINAS PENDIDIKAN
            </p>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
              SEKOLAH MENENGAH ATAS NEGERI 8 MALANG
            </p>
            <p className="text-[11px] text-slate-500">
              Jl. Veteran 37 Telp. (0341) 551096 FAX (0341) 575795 MALANG
            </p>
            <p className="text-[11px] text-slate-500">
              website: www.sman8malang.sch.id &bull; E-mail: sman8malang@gmail.com
            </p>
            <p className="text-[11px] text-slate-500">
              NPSN : 20533640 Kode Pos : 65145
            </p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              KOTA MALANG
            </p>
          </div>

          {/* Divider Line */}
          <hr className="border-slate-200" />

          {/* Letter Title */}
          <div className="text-center space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide underline underline-offset-4">
              SURAT REKOMENDASI PEMINATAN
            </h3>
            <p className="text-xs text-slate-600 font-mono">
              Nomor: {letterData.nomorSurat}
            </p>
          </div>

          {/* Opening Paragraph */}
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
            {letterData.pembuka}
          </p>

          {/* Student Metadata */}
          <div className="space-y-1.5 text-xs sm:text-sm text-slate-900 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 sm:col-span-2 text-slate-500">Nama Lengkap</span>
              <span className="col-span-9 sm:col-span-10 font-semibold">: {letterData.namaSiswa}</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 sm:col-span-2 text-slate-500">NISN</span>
              <span className="col-span-9 sm:col-span-10 font-medium font-mono">: {letterData.nisn}</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 sm:col-span-2 text-slate-500">Kelas</span>
              <span className="col-span-9 sm:col-span-10 font-semibold">: {letterData.kelas}</span>
            </div>
          </div>

          {/* Paket Mata Pelajaran Pilihan */}
          <div className="space-y-2 pt-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              Paket Mata Pelajaran Pilihan:
            </span>

            {/* Interactive Chips of Selected Mapel */}
            <div className="flex flex-wrap gap-2 pt-1">
              {letterData.mataPelajaran.map((mapel, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-[#5F089E] text-xs font-semibold border border-purple-100"
                >
                  {mapel}
                </span>
              ))}
            </div>
          </div>

          {/* Keterangan dan Penegasan Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <h4 className="text-center font-bold text-xs uppercase tracking-wider text-slate-900">
              KETERANGAN DAN PENEGASAN
            </h4>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
              {letterData.keterangan.map((paragraf, idx) => (
                <p key={idx}>{paragraf}</p>
              ))}
            </div>
          </div>

          {/* Sign-off Row & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-purple-100">
            {/* Counselor Sign Info */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#5F089E] flex items-center justify-center text-white shrink-0 shadow-sm">
                <PenLine className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {letterData.jabatanPenandatangan}
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {letterData.namaPenandatangan}
                </p>
                <p className="text-[11px] text-slate-500">
                  NIP: {letterData.nipPenandatangan}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Simpan Draft
              </button>

              <button
                type="button"
                disabled={isLocked}
                onClick={handleValidateLock}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md ${
                  isLocked
                    ? "bg-emerald-600 shadow-emerald-900/20 cursor-default"
                    : "bg-[#5F089E] hover:bg-[#4d0680] active:bg-[#3d0566] shadow-purple-900/25"
                }`}
              >
                {isLocked ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Tervalidasi &amp; Terkunci</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white" />
                    <span>Validasi &amp; Kunci Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Edit Isi Surat Modal */}
        <AdminB1LetterEditorModal
          isOpen={showLetterEditor}
          letterData={letterData}
          defaultData={INITIAL_LETTER_DATA}
          onClose={() => setShowLetterEditor(false)}
          onSave={(updatedData) => {
            setLetterData(updatedData);
            setShowLetterEditor(false);
            onShowToast?.("Isi Surat Rekomendasi berhasil diperbarui.");
          }}
          onReset={() => {
            setLetterData(INITIAL_LETTER_DATA);
            onShowToast?.("Isi Surat Rekomendasi direset ke konfigurasi awal.");
          }}
        />
      </>
    );
  }

  // ==========================================
  // VIEW 3: FEEDBACK STRATEGI & DIREKTORI BK
  // ==========================================

  return (
    <div className="space-y-10 font-['Montserrat',sans-serif] animate-in fade-in duration-150">

      {/* ─────── SECTION 1: Tabel Daftar Siswa Strategi Belajar ─────── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1E1E1E]">Feedback Strategi Belajar</h2>
          <p className="text-sm text-[#737373] mt-1.5 max-w-2xl">
            Menyediakan catatan evaluasi atau saran strategi belajar tambahan secara khusus apabila diperlukan
            berdasarkan perkembangan nilai belajar dan profil peminatan siswa.
          </p>
        </div>

        {/* Tabel Siswa Berformat Sama Dengan Pusat Manajemen Data */}
        <AdminB1FeedbackTable
          savedFeedbackStudentIds={savedFeedbackStudentIds}
          onSelectStudentFeedback={handleSelectStudentForFeedback}
        />
      </div>

      {/* ─────── SECTION 1.5: Formulir Feedback Siswa Terpilih (Muncul jika siswa di klik) ─────── */}
      {selectedStudentForFeedback && (
        <div
          ref={feedbackInputRef}
          className="bg-white border-2 border-purple-200 rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex items-start justify-between gap-4 border-b border-purple-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#5F089E] uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                FORMULIR FEEDBACK STRATEGI BELAJAR
              </span>
              <h3 className="text-lg font-bold text-[#1E1E1E] mt-2">
                Evaluasi Belajar untuk {selectedStudentForFeedback.nama}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                NISN: {selectedStudentForFeedback.nisn} &bull; Kelas: {selectedStudentForFeedback.kelas} &bull; Nilai Rapor: {selectedStudentForFeedback.nilaiRapor}
              </p>
            </div>
            <button
              type="button"
              onClick={handleTutupFeedbackForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Info Card */}
          <div className="flex flex-wrap items-center gap-4 py-3 bg-purple-50/50 p-4 rounded-xl border border-purple-100/70">
            <div className="w-12 h-12 rounded-xl bg-[#5F089E] text-white flex items-center justify-center shrink-0 font-bold text-base shadow-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#1E1E1E]">{selectedStudentForFeedback.nama}</p>
                {selectedStudentForFeedback.trenNilaiMapel === "menurun" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                    Nilai Mapel Menurun
                  </span>
                )}
                {selectedStudentForFeedback.persentaseKeberhasilan && (
                  <span className="text-xs font-semibold text-slate-500">
                    (Keberhasilan: <strong className="text-[#5F089E]">{selectedStudentForFeedback.persentaseKeberhasilan}%</strong>)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Mapel Pilihan:</span>{" "}
                <span className="text-[#5F089E] font-medium">{selectedStudentForFeedback.mapelPilihanUtama ?? "Mata Pelajaran Pilihan"}</span>{" "}
                (Nilai: <strong>{selectedStudentForFeedback.nilaiMapelPilihan ?? selectedStudentForFeedback.nilaiRapor}</strong>) &bull;{" "}
                <span className="font-semibold text-slate-700">Target Prodi:</span> {selectedStudentForFeedback.minatProdi} &bull;{" "}
                <span className="font-semibold text-slate-700">Status:</span>{" "}
                <span className="font-semibold">{selectedStudentForFeedback.statusKesesuaian ?? "Perlu Peninjauan"}</span>
              </p>
            </div>
            {savedFeedbackStudentIds.has(selectedStudentForFeedback.id) && (
              <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Feedback Tersimpan
              </span>
            )}
          </div>

          {/* Notes textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              CATATAN STRATEGI BELAJAR (OPSIONAL)
            </label>
            <textarea
              rows={4}
              value={feedbackNotes[selectedStudentForFeedback.id] ?? ""}
              onChange={(e) =>
                setFeedbackNotes((prev) => ({
                  ...prev,
                  [selectedStudentForFeedback.id]: e.target.value,
                }))
              }
              placeholder="Tuliskan catatan evaluasi belajar, penguatan materi peminatan, saran pemilihan bimbel/olimpiade, atau strategi belajar terarah bagi siswa..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-[#1E1E1E] outline-none focus:border-[#5F089E] focus:bg-white transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-purple-100">
            <button
              type="button"
              onClick={handleTutupFeedbackForm}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Tutup / Lewati
            </button>
            <button
              type="button"
              onClick={handleSimpanFeedback}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Feedback</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────── SECTION 2: Direktori Guru BK ─────── */}
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1E1E1E]">Direktori Guru BK</h2>
            <p className="text-sm text-[#737373] mt-1.5 max-w-lg">
              Menyediakan catatan evaluasi atau saran strategi belajar tambahan secara khusus apabila diperlukan
              berdasarkan perkembangan nilai belajar siswa
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-sm font-semibold transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Profil</span>
          </button>
        </div>

        {/* BK Teacher Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bkTeachers.map((teacher) => (
            <button
              key={teacher.id}
              type="button"
              onClick={() => openEditModal(teacher)}
              className="text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer group space-y-3"
            >
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full ${teacher.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                {teacher.initials}
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1E1E1E] group-hover:text-[#5F089E] transition-colors">{teacher.nama}</p>
                <p className="text-xs text-[#737373] mt-0.5">NIP: {teacher.nip}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─────── MODAL: Kelola Profil Guru BK ─────── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1E1E1E]">
                  Kelola Profil Guru Bimbingan dan Konseling
                </h3>
                <p className="text-sm text-[#737373] mt-0.5">Tambahkan atau perbarui identitas diri</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer mt-0.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {/* Photo Upload Area */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-purple-50 border border-purple-100">
                {/* Avatar Preview */}
                <div className="w-20 h-20 rounded-xl bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-2xl shrink-0 overflow-hidden">
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    <span>
                      {profileForm.nama
                        ? profileForm.nama.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")
                        : editingTeacher
                        ? editingTeacher.initials
                        : "MT"}
                    </span>
                  )}
                </div>
                {/* Photo Actions */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#1E1E1E]">Foto Profil</p>
                  <p className="text-xs text-[#737373]">Format JPG/PNG maksimal 2MB</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5F089E] text-white text-xs font-semibold hover:bg-[#4d0680] transition-colors cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      Unggah Foto
                    </button>
                    {profilePhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setProfilePhotoUrl(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus Foto
                      </button>
                    )}
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleProfilePhotoChange}
                    />
                  </div>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1E1E1E]">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-purple-50 focus-within:border-[#5F089E] transition-colors">
                  <PenLine className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={profileForm.nama}
                    onChange={(e) => setProfileForm((p) => ({ ...p, nama: e.target.value }))}
                    placeholder="Maria Tri Indah Mustika Sari, S.Pd."
                    className="flex-1 bg-transparent text-sm text-[#1E1E1E] outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* NIP */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1E1E1E]">
                  Nomor Induk Pegawai (NIP) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-purple-50 focus-within:border-[#5F089E] transition-colors">
                  <ClipboardList className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={profileForm.nip}
                    onChange={(e) => setProfileForm((p) => ({ ...p, nip: e.target.value }))}
                    placeholder="198507142010012024"
                    className="flex-1 bg-transparent text-sm text-[#1E1E1E] outline-none placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {editingTeacher ? (
                  <button
                    type="button"
                    onClick={handleDeleteTeacher}
                    className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Guru BK
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={!profileForm.nama.trim() || !profileForm.nip.trim()}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Profil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
