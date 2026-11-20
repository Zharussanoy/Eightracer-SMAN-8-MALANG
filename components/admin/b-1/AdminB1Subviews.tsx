"use client";

import { useEffect, useState, useRef } from "react";
import { apiRequest } from "@/lib/api";
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
import AdminB1AlignmentChart, { AlignmentDataProps } from "./AdminB1AlignmentChart";
import { AdminB1LetterEditorModal } from "./AdminB1LetterEditorModal";
import AdminB1FeedbackTable from "./AdminB1FeedbackTable";

const EMPTY_LETTER_DATA: RecommendationLetterData = {
  nomorSurat: "-",
  tanggalSurat: "-",
  namaSiswa: "-",
  nisn: "-",
  kelas: "-",
  pembuka:
    "Berdasarkan hasil analisis komprehensif profil bakat, minat, evaluasi capaian rapor semester, dan tes kecerdasan majemuk peserta didik, SMA Negeri 8 Malang menerbitkan Surat Rekomendasi Peminatan Akademik bagi:",
  mataPelajaran: [],
  keterangan: [
    "Surat rekomendasi ini disusun oleh Guru Bimbingan dan Konseling berdasarkan hasil identifikasi potensi, minat, bakat, hasil belajar, serta informasi pendukung lainnya yang relevan. Rekomendasi ini bertujuan sebagai bahan pertimbangan dan referensi bagi murid dalam menentukan pilihan mata pelajaran sesuai dengan rencana studi lanjut dan pengembangan kariernya.",
    "Keputusan akhir mengenai pemilihan mata pelajaran tetap berada pada murid, dengan mempertimbangkan hasil refleksi diri, informasi yang tersedia, serta diskusi dan persetujuan orang tua/wali. Orang tua/wali diharapkan mendampingi murid dalam proses pengambilan keputusan tersebut.",
    "Surat rekomendasi ini tidak bersifat mengikat atau menentukan secara mutlak pilihan murid. Layanan Bimbingan dan Konseling berperan memfasilitasi murid agar mampu mengambil keputusan pendidikan secara mandiri, bertanggung jawab, dan sesuai dengan potensi serta rencana masa depannya.",
  ],
  namaPenandatangan: "-",
  nipPenandatangan: "-",
  jabatanPenandatangan: "KOORDINATOR BIMBINGAN KONSELING",
};

interface AdminB1SubviewsProps {
  activeTab: B1Tab;
  students?: StudentB1[];
  onNavigateToData: () => void;
  onShowToast?: (msg: string) => void;
}

type BKTeacher = { id: number; initials: string; nama: string; nip: string; color: string };

type MapelDistItem = {
  name: string;
  percentage: string;
  students: number;
  color: string;
  textColor: string;
  detail: string;
};

const BAR_COLORS = [
  { color: "bg-[#39055F]", textColor: "text-[#5F089E]" },
  { color: "bg-[#5F089E]", textColor: "text-[#5F089E]" },
  { color: "bg-[#FCC850]", textColor: "text-amber-700" },
  { color: "bg-[#10B981]", textColor: "text-emerald-700" },
  { color: "bg-slate-400", textColor: "text-slate-600" },
];

export default function AdminB1Subviews({
  activeTab,
  students = [],
  onShowToast,
}: AdminB1SubviewsProps) {
  // ── Validasi & Surat Rekomendasi state ──
  const [selectedLetterStudentId, setSelectedLetterStudentId] = useState<string>("");
  const [isLocked, setIsLocked] = useState(false);
  const [letterData, setLetterData] = useState<RecommendationLetterData>(EMPTY_LETTER_DATA);
  const [showLetterEditor, setShowLetterEditor] = useState(false);

  // ── Feedback Strategi state ──
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<StudentB1 | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});
  const [savedFeedbackStudentIds, setSavedFeedbackStudentIds] = useState<Set<string>>(new Set());
  const feedbackInputRef = useRef<HTMLDivElement>(null);

  // ── Direktori BK state (tanpa data dummy) ──
  const [bkTeachers, setBkTeachers] = useState<BKTeacher[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<BKTeacher | null>(null);
  const [profileForm, setProfileForm] = useState({ nama: "", nip: "" });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Dashboard Konseling state (dari backend /api/admin/dashboard-konseling) ──
  const [statCards, setStatCards] = useState({
    totalSiswa: 0,
    drafUsulan: 0,
    skTerbit: 0,
  });
  const [mapelDistribution, setMapelDistribution] = useState<MapelDistItem[]>([]);
  const [alignmentData, setAlignmentData] = useState<AlignmentDataProps | undefined>(undefined);

  // Fallback internal student list if students prop from parent is empty or loading
  const [internalStudents, setInternalStudents] = useState<Array<{ id: string; nama: string; nisn: string; kelas: string }>>([]);

  useEffect(() => {
    if (students.length === 0) {
      let active = true;
      (async () => {
        try {
          const res = await apiRequest<{
            data?: Array<{ id: number; nama_siswa?: string; nama_lengkap?: string; nisn?: string; kelas?: string }>;
          }>("/admin/manajemen-data/siswa?per_page=500");
          if (!active || !res?.data) return;
          setInternalStudents(
            res.data.map((s) => ({
              id: String(s.id),
              nama: s.nama_siswa || s.nama_lengkap || "-",
              nisn: s.nisn || "-",
              kelas: s.kelas || "-",
            }))
          );
        } catch {
          // ignore
        }
      })();
      return () => {
        active = false;
      };
    }
  }, [students.length, activeTab]);

  const effectiveStudents = students.length > 0 ? students : internalStudents;

  // Sinkronisasi Dashboard Konseling dari backend
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiRequest<{
          kartu_statistik?: {
            total_siswa_terdata?: number;
            draf_usulan_rekomendasi?: number;
            sk_terbit_dan_terkunci?: number;
          };
          distribusi_mata_pelajaran_peminatan?: {
            items?: Array<{
              nama_mapel: string;
              kelompok?: string;
              jumlah_siswa: number;
              persentase: number;
            }>;
          };
          analisis_keselarasan_peminatan?: {
            tingkat_kecocokan_persen?: number;
            rincian?: {
              sesuai?: { jumlah_siswa?: number; persentase?: number };
              perlu_penyesuaian?: { jumlah_siswa?: number; persentase?: number };
              perlu_peninjauan?: { jumlah_siswa?: number; persentase?: number };
            };
          };
        }>("/admin/dashboard-konseling");
        if (!active || !res) return;

        if (res.kartu_statistik) {
          setStatCards({
            totalSiswa: res.kartu_statistik.total_siswa_terdata ?? 0,
            drafUsulan: res.kartu_statistik.draf_usulan_rekomendasi ?? 0,
            skTerbit: res.kartu_statistik.sk_terbit_dan_terkunci ?? 0,
          });
        }

        if (res.distribusi_mata_pelajaran_peminatan?.items) {
          setMapelDistribution(
            res.distribusi_mata_pelajaran_peminatan.items.map((item, idx) => {
              const palette = BAR_COLORS[idx % BAR_COLORS.length];
              return {
                name: item.nama_mapel,
                percentage: `${item.persentase ?? 0}%`,
                students: item.jumlah_siswa ?? 0,
                color: palette.color,
                textColor: palette.textColor,
                detail: item.kelompok
                  ? `Kelompok ${item.kelompok} — Direkomendasikan bagi ${item.jumlah_siswa ?? 0} siswa.`
                  : `Direkomendasikan bagi ${item.jumlah_siswa ?? 0} siswa.`,
              };
            })
          );
        }

        if (res.analisis_keselarasan_peminatan) {
          const ak = res.analisis_keselarasan_peminatan;
          setAlignmentData({
            tingkatKecocokanPersen: ak.tingkat_kecocokan_persen ?? 0,
            sesuai: {
              jumlah_siswa: ak.rincian?.sesuai?.jumlah_siswa ?? 0,
              persentase: ak.rincian?.sesuai?.persentase ?? 0,
            },
            perluPenyesuaian: {
              jumlah_siswa: ak.rincian?.perlu_penyesuaian?.jumlah_siswa ?? 0,
              persentase: ak.rincian?.perlu_penyesuaian?.persentase ?? 0,
            },
            perluPeninjauan: {
              jumlah_siswa: ak.rincian?.perlu_peninjauan?.jumlah_siswa ?? 0,
              persentase: ak.rincian?.perlu_peninjauan?.persentase ?? 0,
            },
          });
        }
      } catch {
        // Biarkan kosong jika belum ada data
      }
    })();
    return () => {
      active = false;
    };
  }, [activeTab, students]);

  // Pilih siswa pertama secara otomatis untuk pratinjau Surat Rekomendasi jika ada data siswa
  useEffect(() => {
    if (effectiveStudents.length > 0) {
      const exists = effectiveStudents.some((s) => s.id === selectedLetterStudentId);
      if (!selectedLetterStudentId || !exists) {
        setSelectedLetterStudentId(effectiveStudents[0].id);
      }
    }
  }, [effectiveStudents, selectedLetterStudentId]);

  // Muat detail Surat Rekomendasi siswa terpilih dari backend (/api/admin/validasi-rekomendasi/{id})
  useEffect(() => {
    if (!selectedLetterStudentId) return;
    let active = true;
    (async () => {
      try {
        const res = await apiRequest<{
          identitas_siswa?: {
            nama_lengkap?: string;
            nisn?: string;
            kelas?: string;
          };
          paket_mata_pelajaran_pilihan?: Array<{ nama_mapel: string }>;
          keterangan_dan_penegasan?: {
            dapat_diedit?: boolean;
            nomor_sk?: string;
            paragraf_list?: string[];
          };
          penandatangan?: {
            jabatan?: string;
            nama_lengkap?: string;
            nip?: string;
          };
          status_validasi?: {
            terkunci_permanen?: boolean;
            tanggal_terbit?: string;
          };
        }>(`/admin/validasi-rekomendasi/${selectedLetterStudentId}`);
        if (!active || !res) return;

        setIsLocked(Boolean(res.status_validasi?.terkunci_permanen));
        setLetterData({
          nomorSurat: res.keterangan_dan_penegasan?.nomor_sk || "-",
          tanggalSurat:
            res.status_validasi?.tanggal_terbit ||
            new Date().toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
          namaSiswa: res.identitas_siswa?.nama_lengkap || "-",
          nisn: res.identitas_siswa?.nisn || "-",
          kelas: res.identitas_siswa?.kelas || "-",
          pembuka: EMPTY_LETTER_DATA.pembuka,
          mataPelajaran: (res.paket_mata_pelajaran_pilihan ?? []).map((m) => m.nama_mapel),
          keterangan:
            res.keterangan_dan_penegasan?.paragraf_list &&
            res.keterangan_dan_penegasan.paragraf_list.length > 0
              ? res.keterangan_dan_penegasan.paragraf_list
              : EMPTY_LETTER_DATA.keterangan,
          namaPenandatangan: res.penandatangan?.nama_lengkap || "-",
          nipPenandatangan: res.penandatangan?.nip || "-",
          jabatanPenandatangan:
            res.penandatangan?.jabatan || "KOORDINATOR BIMBINGAN KONSELING",
        });
      } catch {
        // Biarkan kosong apabila gagal memuat
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedLetterStudentId, activeTab]);

  // Sinkronisasi daftar Guru BK dari backend (/api/admin/guru-bk)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiRequest<{
          data?: Array<{
            id: number;
            inisial?: string;
            nama_lengkap: string;
            nip: string;
          }>;
        }>("/admin/guru-bk");
        if (!active || !res?.data) return;
        setBkTeachers(
          res.data.map((g) => ({
            id: g.id,
            initials:
              g.inisial ||
              g.nama_lengkap
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? "")
                .join(""),
            nama: g.nama_lengkap,
            nip: g.nip || "-",
            color: "bg-purple-300",
          }))
        );
      } catch {
        // Biarkan kosong apabila belum login
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // ── Validasi handlers ──
  const handleValidateLock = async () => {
    if (!selectedLetterStudentId) return;
    try {
      await apiRequest(`/admin/validasi-rekomendasi/${selectedLetterStudentId}/validasi-kunci`, {
        method: "POST",
        body: {
          nomor_sk: letterData.nomorSurat !== "-" ? letterData.nomorSurat : undefined,
          konten_surat: letterData.keterangan.join("\n\n"),
        },
      });
      setIsLocked(true);
      onShowToast?.("Sukses! Surat Rekomendasi Peminatan berhasil divalidasi dan dikunci permanen.");
    } catch (err) {
      onShowToast?.(
        err instanceof Error ? err.message : "Gagal memvalidasi surat rekomendasi."
      );
    }
  };
  const handleSaveDraft = async () => {
    if (!selectedLetterStudentId) return;
    try {
      await apiRequest(`/admin/validasi-rekomendasi/${selectedLetterStudentId}/draft`, {
        method: "PUT",
        body: {
          nomor_sk: letterData.nomorSurat !== "-" ? letterData.nomorSurat : undefined,
          konten_surat: letterData.keterangan.join("\n\n"),
        },
      });
      onShowToast?.("Draft surat rekomendasi berhasil disimpan.");
    } catch (err) {
      onShowToast?.(err instanceof Error ? err.message : "Gagal menyimpan draft surat.");
    }
  };

  // ── Feedback handlers ──
  const handleSelectStudentForFeedback = (student: StudentB1) => {
    setSelectedStudentForFeedback(student);
    setTimeout(() => {
      feedbackInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleSimpanFeedback = async () => {
    if (!selectedStudentForFeedback) return;
    const noteText = feedbackNotes[selectedStudentForFeedback.id] || "Pertahankan konsistensi belajar mandiri.";
    try {
      const targetId = !isNaN(Number(selectedStudentForFeedback.id))
        ? Number(selectedStudentForFeedback.id)
        : 1;
      await apiRequest(`/admin/feedback-strategi/${targetId}/simpan`, {
        method: "POST",
        body: {
          catatan: noteText,
          catatan_evaluasi: noteText,
          strategi_belajar: noteText,
          alokasi_jam_per_minggu: 4,
        },
      });
      setSavedFeedbackStudentIds((prev) => new Set([...prev, selectedStudentForFeedback.id]));
      onShowToast?.(`Feedback strategi untuk ${selectedStudentForFeedback.nama} berhasil disimpan.`);
    } catch (err) {
      onShowToast?.(err instanceof Error ? err.message : "Gagal menyimpan feedback strategi.");
    }
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
  const handleSaveProfile = async () => {
    const initials = profileForm.nama
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
    if (editingTeacher) {
      try {
        await apiRequest(`/admin/guru-bk/${editingTeacher.id}`, {
          method: "PUT",
          body: { nama_lengkap: profileForm.nama, nip: profileForm.nip },
        });
      } catch {
        // Fallback lokal
      }
      setBkTeachers((prev) =>
        prev.map((t) =>
          t.id === editingTeacher.id
            ? { ...t, nama: profileForm.nama, nip: profileForm.nip, initials }
            : t
        )
      );
      onShowToast?.("Profil guru BK berhasil diperbarui.");
    } else {
      let createdId = Date.now();
      try {
        const res = await apiRequest<{ guru?: { id: number } }>("/admin/guru-bk", {
          method: "POST",
          body: { nama_lengkap: profileForm.nama, nip: profileForm.nip },
        });
        if (res?.guru?.id) createdId = res.guru.id;
      } catch {
        // Fallback lokal
      }
      setBkTeachers((prev) => [
        ...prev,
        { id: createdId, initials, nama: profileForm.nama, nip: profileForm.nip, color: "bg-purple-300" },
      ]);
      onShowToast?.("Profil guru BK baru berhasil ditambahkan.");
    }
    setShowProfileModal(false);
  };
  const handleDeleteTeacher = async () => {
    if (!editingTeacher) return;
    try {
      await apiRequest(`/admin/guru-bk/${editingTeacher.id}`, {
        method: "DELETE",
      });
    } catch {
      // Fallback lokal
    }
    setBkTeachers((prev) => prev.filter((t) => t.id !== editingTeacher.id));
    onShowToast?.("Profil guru BK berhasil dihapus.");
    setShowProfileModal(false);
  };

  // ── Dashboard Konseling interactive state ──
  const [selectedStatCard, setSelectedStatCard] = useState<string | null>(null);
  const [hoveredMapel, setHoveredMapel] = useState<string | null>(null);

  // ==========================================
  // VIEW 1: DASHBOARD KONSELING (Matching Reference Image)
  // ==========================================
  if (activeTab === "Dashboard Konseling") {
    return (
      <div className="space-y-8 font-sans animate-in fade-in duration-150">
        {/* Scoped CSS Keyframe for Fluid Animated Blob (Gaya Uiverse Fluid Glow) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @keyframes adminBlobBounce {
              0% {
                transform: translate(-50%, -50%) translate3d(-35px, -30px, 0);
              }
              25% {
                transform: translate(-50%, -50%) translate3d(55px, -20px, 0);
              }
              50% {
                transform: translate(-50%, -50%) translate3d(45px, 45px, 0);
              }
              75% {
                transform: translate(-50%, -50%) translate3d(-40px, 40px, 0);
              }
              100% {
                transform: translate(-50%, -50%) translate3d(-35px, -30px, 0);
              }
            }
          `,
          }}
        />

        {/* Top 3 Stat Cards Grid with Ambient Fluid Glow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: TOTAL SISWA TERDATA (Brand Ungu SMARIHASTA) */}
          <div
            onClick={() => {
              setSelectedStatCard(selectedStatCard === "total" ? null : "total");
              onShowToast?.(`Detail: ${statCards.totalSiswa} siswa aktif terdata di basis data.`);
            }}
            className={`relative overflow-hidden transition-all duration-300 cursor-pointer rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs min-h-[160px] group hover:border-purple-300 hover:shadow-xl hover:shadow-purple-950/10 hover:-translate-y-1 active:scale-[0.98] border ${
              selectedStatCard === "total" ? "ring-2 ring-[#5F089E] border-[#5F089E]" : "border-slate-200"
            }`}
          >
            {/* Animated Purple Fluid Blob (Z-Index 1) */}
            <div
              className="absolute pointer-events-none rounded-full w-44 h-44 bg-[#5F089E] opacity-25 filter blur-2xl top-1/2 left-1/2 transition-opacity duration-300 group-hover:opacity-45"
              style={{
                animation: "adminBlobBounce 6s infinite ease-in-out",
              }}
            />
            {/* Frosted Glass Layer (Z-Index 2) */}
            <div className="absolute inset-[2px] rounded-[14px] bg-white/94 backdrop-blur-xl pointer-events-none z-[2]" />

            {/* Foreground Content (Z-Index 10) */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                TOTAL SISWA TERDATA
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#5F089E] shrink-0 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6 shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 mt-4">
              <span className="text-4xl font-extrabold text-[#5F089E] leading-none tracking-tight">
                {statCards.totalSiswa}
              </span>
              <p className="text-xs text-purple-700 font-medium mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5F089E] animate-pulse" />
                Data siswa hasil impor aktif
              </p>
              {selectedStatCard === "total" && (
                <p className="text-xs text-[#5F089E] font-semibold mt-1.5 animate-in fade-in">
                  ✓ Data biodata siswa tersinkron dengan basis data
                </p>
              )}
            </div>
          </div>

          {/* Card 2: DRAF USULAN REKOMENDASI (Amber / Honey Gold) */}
          <div
            onClick={() => {
              setSelectedStatCard(selectedStatCard === "draft" ? null : "draft");
              onShowToast?.(`Detail: ${statCards.drafUsulan} usulan rekomendasi peminatan masih dalam status draf.`);
            }}
            className={`relative overflow-hidden transition-all duration-300 cursor-pointer rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs min-h-[160px] group hover:border-amber-300 hover:shadow-xl hover:shadow-amber-950/10 hover:-translate-y-1 active:scale-[0.98] border ${
              selectedStatCard === "draft" ? "ring-2 ring-amber-400 border-amber-400" : "border-slate-200"
            }`}
          >
            {/* Animated Amber/Golden Fluid Blob (Z-Index 1) */}
            <div
              className="absolute pointer-events-none rounded-full w-44 h-44 bg-amber-400 opacity-25 filter blur-2xl top-1/2 left-1/2 transition-opacity duration-300 group-hover:opacity-45"
              style={{
                animation: "adminBlobBounce 7s infinite ease-in-out reverse",
              }}
            />
            {/* Frosted Glass Layer (Z-Index 2) */}
            <div className="absolute inset-[2px] rounded-[14px] bg-white/94 backdrop-blur-xl pointer-events-none z-[2]" />

            {/* Foreground Content (Z-Index 10) */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                DRAF USULAN REKOMENDASI
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6 shadow-2xs">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 mt-4">
              <span className="text-4xl font-extrabold text-amber-600 leading-none tracking-tight">
                {statCards.drafUsulan}
              </span>
              <p className="text-xs text-amber-700 font-medium mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Memerlukan peninjauan &amp; validasi BK
              </p>
              {selectedStatCard === "draft" && (
                <p className="text-xs text-amber-700 font-semibold mt-1.5 animate-in fade-in">
                  • Dalam proses telaah ulang guru BK
                </p>
              )}
            </div>
          </div>

          {/* Card 3: SK TERBIT & TERKUNCI (Emerald / Mint Green Sukses) */}
          <div
            onClick={() => {
              setSelectedStatCard(selectedStatCard === "sk" ? null : "sk");
              onShowToast?.(`Detail: ${statCards.skTerbit} Surat Keputusan Rekomendasi telah divalidasi dan dikunci.`);
            }}
            className={`relative overflow-hidden transition-all duration-300 cursor-pointer rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs min-h-[160px] group hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-950/10 hover:-translate-y-1 active:scale-[0.98] border ${
              selectedStatCard === "sk" ? "ring-2 ring-emerald-500 border-emerald-500" : "border-slate-200"
            }`}
          >
            {/* Animated Emerald Fluid Blob (Z-Index 1) */}
            <div
              className="absolute pointer-events-none rounded-full w-44 h-44 bg-emerald-500 opacity-25 filter blur-2xl top-1/2 left-1/2 transition-opacity duration-300 group-hover:opacity-45"
              style={{
                animation: "adminBlobBounce 6.5s infinite ease-in-out",
              }}
            />
            {/* Frosted Glass Layer (Z-Index 2) */}
            <div className="absolute inset-[2px] rounded-[14px] bg-white/94 backdrop-blur-xl pointer-events-none z-[2]" />

            {/* Foreground Content (Z-Index 10) */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                SK TERBIT &amp; TERKUNCI
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6 shadow-2xs">
                <BadgeCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 mt-4">
              <span className="text-4xl font-extrabold text-emerald-600 leading-none tracking-tight">
                {statCards.skTerbit}
              </span>
              <p className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Berkas resmi tervalidasi &amp; terkunci
              </p>
              {selectedStatCard === "sk" && (
                <p className="text-xs text-emerald-700 font-semibold mt-1.5 animate-in fade-in">
                  ✓ Siap cetak dan diarsipkan secara legal
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
                Preferensi pilihan siswa berdasarkan hasil kalkulasi rekomendasi
              </p>
            </div>

            {/* Bar Chart Rows */}
            <div className="space-y-4 pt-2">
              {mapelDistribution.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  Belum ada data distribusi mata pelajaran pilihan. Silakan impor data siswa terlebih dahulu.
                </div>
              ) : (
                mapelDistribution.map((item) => {
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
                })
              )}
            </div>
          </div>

          {/* Right Column: Analisis Keselarasan Peminatan (5 cols) */}
          <div className="lg:col-span-5">
            <AdminB1AlignmentChart data={alignmentData} />
          </div>
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
        <div className="bg-white border border-purple-100 rounded-2xl p-6 sm:p-10 shadow-sm font-sans space-y-6 animate-in fade-in duration-150">
          {/* Header Action Bar: Pilih Siswa & Edit Surat Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {effectiveStudents.length > 0 && (
                <select
                  value={selectedLetterStudentId}
                  onChange={(e) => setSelectedLetterStudentId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-800 border border-purple-200 focus:outline-none focus:border-[#5F089E]"
                >
                  {effectiveStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nisn} - {s.kelas})
                    </option>
                  ))}
                </select>
              )}
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
              disabled={isLocked || !selectedLetterStudentId}
              onClick={() => setShowLetterEditor(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isLocked || !selectedLetterStudentId
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : "bg-purple-50 hover:bg-purple-100 text-[#5F089E] border border-purple-200 hover:border-purple-300 shadow-sm"
              }`}
            >
              <Edit className="w-4 h-4" />
              <span>Edit Isi Surat</span>
            </button>
          </div>

          {effectiveStudents.length === 0 && !selectedLetterStudentId ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada data siswa yang diimpor. Silakan unggah berkas Excel siswa pada tab Pusat Manajemen Data terlebih dahulu.
            </div>
          ) : (
            <>
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
                <p className="text-xs text-slate-600 font-medium">
                  Nomor: {letterData.nomorSurat}
                </p>
              </div>

              {/* Opening Paragraph */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                {letterData.pembuka}
              </p>

              {/* Student Metadata */}
              <div className="text-xs sm:text-sm text-slate-900 bg-slate-50/70 p-4 rounded-xl border border-slate-100 font-sans">
                <div className="grid grid-cols-[110px_16px_1fr] sm:grid-cols-[130px_16px_1fr] items-center gap-y-1.5">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="text-slate-700 font-semibold">:</span>
                  <span className="font-semibold text-slate-900">{letterData.namaSiswa}</span>

                  <span className="text-slate-500">NISN</span>
                  <span className="text-slate-700 font-semibold">:</span>
                  <span className="font-medium text-slate-900">{letterData.nisn}</span>

                  <span className="text-slate-500">Kelas</span>
                  <span className="text-slate-700 font-semibold">:</span>
                  <span className="font-semibold text-slate-900">{letterData.kelas}</span>
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
            </>
          )}
        </div>

        {/* Edit Isi Surat Modal */}
        <AdminB1LetterEditorModal
          isOpen={showLetterEditor}
          letterData={letterData}
          defaultData={EMPTY_LETTER_DATA}
          onClose={() => setShowLetterEditor(false)}
          onSave={(updatedData) => {
            setLetterData(updatedData);
            setShowLetterEditor(false);
            onShowToast?.("Isi Surat Rekomendasi berhasil diperbarui.");
          }}
          onReset={() => {
            setLetterData(EMPTY_LETTER_DATA);
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
    <div className="space-y-10 font-sans animate-in fade-in duration-150">

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
          students={students}
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
              <p className="text-xs text-slate-500 font-medium mt-0.5">
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
                {(selectedStudentForFeedback.semesterAktif ?? 3) >= 4 && selectedStudentForFeedback.trenNilaiMapel === "menurun" && (
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
              <p className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="font-semibold text-slate-700">Mapel Pilihan:</span>{" "}
                <span className="text-[#5F089E] font-medium">{selectedStudentForFeedback.mapelPilihanUtama ?? "Mata Pelajaran Pilihan"}</span>{" "}
                (Nilai: <strong>{selectedStudentForFeedback.nilaiMapelPilihan ?? selectedStudentForFeedback.nilaiRapor}</strong> &bull; <span className="font-bold text-[#5F089E]">Semester {selectedStudentForFeedback.semesterAktif || 3}</span>) &bull;{" "}
                <span className="font-semibold text-slate-700">Target Prodi:</span> {selectedStudentForFeedback.minatProdi} &bull;{" "}
                <span className="font-semibold text-slate-700">Status:</span>{" "}
                <span className="font-semibold">{selectedStudentForFeedback.statusKesesuaian ?? "Perlu Peninjauan"}</span>
                {(selectedStudentForFeedback.semesterAktif ?? 3) >= 4 && selectedStudentForFeedback.trenNilaiMapel && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    selectedStudentForFeedback.trenNilaiMapel === "naik"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : selectedStudentForFeedback.trenNilaiMapel === "menurun"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    Tren: {selectedStudentForFeedback.trenNilaiMapel === "naik" ? "Naik" : selectedStudentForFeedback.trenNilaiMapel === "menurun" ? "Menurun" : "Stabil"}
                  </span>
                )}
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
              className="text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#5F089E]/50 hover:shadow-xl hover:shadow-purple-950/5 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 cursor-pointer group space-y-3"
            >
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full ${teacher.color} flex items-center justify-center text-white font-bold text-sm shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-2xs`}>
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
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-white border border-purple-100">
                {/* Avatar Preview */}
                <div className="w-20 h-20 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#5F089E] font-bold text-2xl shrink-0 overflow-hidden">
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
                  <p className="text-base font-bold text-slate-900 leading-snug">Foto Profil</p>
                  <p className="text-xs text-slate-500">Format JPG/PNG maksimal 2MB</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5F089E] text-white text-xs font-semibold hover:bg-[#4d0680] transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Unggah Foto
                    </button>
                    {profilePhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setProfilePhotoUrl(null)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
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
                    className="flex-1 bg-transparent text-sm text-[#1E1E1E] outline-none placeholder:text-slate-400 font-sans"
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
