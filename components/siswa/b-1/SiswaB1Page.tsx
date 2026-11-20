"use client";

import {
  ArrowRight,
  Atom,
  BookOpen,
  Calculator,
  CheckCircle2,
  CircleUserRound,
  Clock,
  Download,
  FlaskConical,
  Home,
  Hourglass,
  Lock,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useAuthGuard } from "@/lib/useAuthGuard";
import Footer from "@/components/shared/Footer";
import { SiswaB1DirektoriSection } from "./SiswaB1DirektoriSection";
import { SiswaB1EvaluasiLockedState } from "./SiswaB1EvaluasiLockedState";
import { SiswaB1EvaluasiSection } from "./SiswaB1EvaluasiSection";
import { SiswaB1PdfPreviewModal, SuratRekomendasiInfo } from "./SiswaB1PdfPreviewModal";
import { SiswaB1ProfilSection } from "./SiswaB1ProfilSection";
import { SiswaB1SubjectDetailModal } from "./SiswaB1SubjectDetailModal";
import { SiswaB1SuratPendingModal } from "./SiswaB1SuratPendingModal";
import { determineStudentAccess } from "./studentAccessPolicy";
import {
  JenjangKelas,
  MapelPilihanDetail,
  SiswaB1Tab,
  StudentB1Account,
} from "./types";

function parseJenjang(tingkat?: string | null, kelas?: string | null): JenjangKelas {
  const raw = (tingkat || kelas || "X").toUpperCase();
  if (raw.startsWith("XII") || raw.includes("12")) return "XII";
  if (raw.startsWith("XI") || raw.includes("11")) return "XI";
  return "X";
}

function defaultSemesterForJenjang(jenjang: JenjangKelas): 1 | 2 | 3 | 4 | 5 | 6 {
  if (jenjang === "XII") return 5;
  if (jenjang === "XI") return 3;
  return 1;
}

export interface FeedbackStrategiItem {
  id: number;
  guru_bk: string;
  nip_guru_bk?: string;
  foto_guru_bk?: string | null;
  mata_pelajaran_id?: number | null;
  nama_mapel?: string | null;
  konten?: string | null;
  strategi_belajar?: string | null;
  alokasi_jam_per_minggu?: number | null;
  status?: string;
  tanggal?: string;
  tanggal_relatif?: string | null;
}

export default function SiswaB1Page() {
  const { ready } = useAuthGuard(["siswa"]);
  const { authUser } = useUser();

  const [currentStudent, setCurrentStudent] = useState<StudentB1Account>(() => {
    const jenjang = parseJenjang(authUser?.profil?.tingkat_kelas, authUser?.profil?.kelas);
    return {
      studentId: authUser?.profil?.id ? String(authUser.profil.id) : "",
      nama: authUser?.nama_lengkap || "Siswa",
      namaPanggilan: authUser?.profil?.nama_panggilan || authUser?.nama_lengkap?.split(" ")[0] || "Siswa",
      nisn: authUser?.profil?.nisn || "",
      kelas: authUser?.profil?.kelas || "-",
      jenjang,
      semester: defaultSemesterForJenjang(jenjang),
      tahunAjaran: "2026/2027",
      targetProdiUtama: "-",
      targetKampusUtama: "-",
      riasecDominan: "-",
      kecerdasanMajemuk: "-",
      rataRataRapor: 0,
      email: authUser?.profil?.email || "",
      avatarInitials: authUser?.profil?.inisial || "SW",
      isSuratValidated: false,
      evaluasiStatus: jenjang === "X" ? "BELUM_DIIZINKAN_KELAS_X" : "INPUT_MANDIRI_TERBUKA",
      riwayatAkademik: [],
    };
  });

  const [isSuratValidated, setIsSuratValidated] = useState<boolean>(false);
  const [selectedNisn, setSelectedNisn] = useState<string>(authUser?.profil?.nisn || "");
  const [importedStudentsList, setImportedStudentsList] = useState<
    Array<{ id: number; nisn: string; nama: string; kelas: string }>
  >([]);
  const [suratInfo, setSuratInfo] = useState<SuratRekomendasiInfo>({
    nomorSk: "-",
    tanggalTerbit: "Dalam Proses Peninjauan",
    dikirimOleh: undefined,
  });
  const [activeTab, setActiveTab] = useState<SiswaB1Tab>(
    "Rekomendasi Mapel Pilihan"
  );
  const [selectedSubject, setSelectedSubject] =
    useState<MapelPilihanDetail | null>(null);
  const [recommendedSubjects, setRecommendedSubjects] =
    useState<MapelPilihanDetail[]>([]);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [feedbackStrategi, setFeedbackStrategi] = useState<{
    tersedia: boolean;
    item_terbaru?: FeedbackStrategiItem | null;
    daftar_feedback?: FeedbackStrategiItem[];
  } | null>(null);

  // Sinkronkan selectedNisn ketika akun yang login berubah (mis. login menggunakan NISN siswa hasil impor)
  useEffect(() => {
    if (authUser?.profil?.nisn) {
      setSelectedNisn(authUser.profil.nisn);
    }
  }, [authUser?.profil?.nisn]);

  // Muat daftar siswa hasil impor (agar bisa berpindah/mengecek siswa lain yang sudah diimpor)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiRequest<{
          daftar_siswa?: Array<{
            id: number;
            nisn: string;
            nama_lengkap: string;
            kelas: string;
          }>;
        }>("/auth/daftar-siswa");
        if (!active || !res?.daftar_siswa) return;
        const list = res.daftar_siswa.map((s) => ({
          id: s.id,
          nisn: s.nisn || "",
          nama: s.nama_lengkap,
          kelas: s.kelas || "-",
        }));
        setImportedStudentsList(list);
      } catch {
        // Ignore if empty
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Sinkronisasi data akun & rekomendasi mapel pilihan dari backend Laravel (/api/siswa/rekomendasi-mapel)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const targetNisn = selectedNisn || authUser?.profil?.nisn || "";
        const query = targetNisn
          ? `?nisn=${encodeURIComponent(targetNisn)}`
          : "";
        const res = await apiRequest<{
          header_portal?: {
            siswa_id?: number;
            nama_lengkap?: string;
            nama_panggilan?: string;
            nisn?: string;
            email?: string;
            kelas?: string;
            tingkat_kelas?: string;
            tahun_ajaran?: string;
            rata_rata_rapor?: number;
            target_prodi_utama?: string;
            target_kampus_utama?: string;
          };
          surat_rekomendasi?: {
            nomor_sk?: string;
            tanggal_diterbitkan?: string;
            dikirim_oleh?: string;
            status_sk?: string;
            pratinjau_pdf?: {
              keterangan_dan_penegasan?: string;
              pengesahan?: {
                nama_pejabat?: string;
                nip_pejabat?: string;
              };
            };
          };
          kartu_mapel_pilihan?: Array<{
            id: number;
            label_pilihan: string;
            nama_mapel: string;
            kelompok?: string;
            probabilitas_penguasaan: number;
            label_probabilitas: string;
            detail_drawer?: {
              estimasi_tingkat_penguasaan_materi?: { catatan_penjelasan?: string };
              deskripsi_pembelajaran?: string;
              topik_utama?: string[];
              strategi_belajar_mandiri?: {
                rekomendasi_alokasi_jam_mandiri?: string;
                fokus_penguatan_materi?: string;
              };
              catatan_evaluasi_akademik?: string;
            };
          }>;
          feedback_strategi_belajar?: {
            tersedia: boolean;
            item_terbaru?: FeedbackStrategiItem | null;
            daftar_feedback?: FeedbackStrategiItem[];
          };
        }>(`/siswa/rekomendasi-mapel${query}`);

        if (!active || !res) return;

        if (res.feedback_strategi_belajar) {
          setFeedbackStrategi(res.feedback_strategi_belajar);
        }

        if (res.header_portal) {
          const hp = res.header_portal;
          const jenjang = parseJenjang(hp.tingkat_kelas, hp.kelas);
          const nama = hp.nama_lengkap || authUser?.nama_lengkap || "Siswa";
          const initials = nama
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() || "")
            .join("") || "SW";
          const skStatus = res.surat_rekomendasi?.status_sk;
          const validated = skStatus === "diterbitkan" || skStatus === "dikunci";

          setIsSuratValidated(validated);
          setCurrentStudent((prev) => ({
            ...prev,
            studentId: hp.siswa_id ? String(hp.siswa_id) : prev.studentId,
            nama,
            namaPanggilan: hp.nama_panggilan || nama.split(" ")[0] || nama,
            nisn: hp.nisn || prev.nisn,
            email: hp.email || "",
            kelas: hp.kelas || prev.kelas,
            jenjang,
            semester: defaultSemesterForJenjang(jenjang),
            tahunAjaran: hp.tahun_ajaran || prev.tahunAjaran,
            rataRataRapor: hp.rata_rata_rapor ?? prev.rataRataRapor,
            targetProdiUtama: hp.target_prodi_utama || "-",
            targetKampusUtama: hp.target_kampus_utama || "-",
            avatarInitials: initials,
            isSuratValidated: validated,
          }));
        }

        if (res.surat_rekomendasi) {
          const rawKet = res.surat_rekomendasi.pratinjau_pdf?.keterangan_dan_penegasan;
          const ketArr = rawKet
            ? rawKet
                .split(/\n{2,}/)
                .map((p) => p.trim())
                .filter(Boolean)
            : undefined;

          const skStatus = res.surat_rekomendasi?.status_sk;
          const validated = skStatus === "diterbitkan" || skStatus === "dikunci";
          const senderName = validated
            ? (res.surat_rekomendasi?.dikirim_oleh ||
               res.surat_rekomendasi?.pratinjau_pdf?.pengesahan?.nama_pejabat ||
               "Koordinator BK")
            : undefined;

          setSuratInfo((prev) => ({
            ...prev,
            nomorSk: res.surat_rekomendasi?.nomor_sk || prev.nomorSk,
            tanggalTerbit: res.surat_rekomendasi?.tanggal_diterbitkan || prev.tanggalTerbit,
            dikirimOleh: senderName,
            nipGuruBk: validated
              ? res.surat_rekomendasi?.pratinjau_pdf?.pengesahan?.nip_pejabat || prev.nipGuruBk
              : undefined,
            keterangan: ketArr && ketArr.length > 0 ? ketArr : prev.keterangan,
          }));
        }

        const iconCycle: Array<{
          iconType: MapelPilihanDetail["iconType"];
          iconBg: string;
          iconColor: string;
          labelColor: string;
        }> = [
          { iconType: "math", iconBg: "#F3E8FF", iconColor: "#5F089E", labelColor: "#6B21A8" },
          { iconType: "physics", iconBg: "#FEF3C7", iconColor: "#B45309", labelColor: "#92400E" },
          { iconType: "informatics", iconBg: "#DCFCE7", iconColor: "#15803D", labelColor: "#166534" },
          { iconType: "chemistry", iconBg: "#F1F5F9", iconColor: "#334155", labelColor: "#334155" },
        ];

        const mapped: MapelPilihanDetail[] = (res.kartu_mapel_pilihan || [])
          .slice(0, 4)
          .map((item, idx) => {
            const style = iconCycle[idx % iconCycle.length];
            const topics = (item.detail_drawer?.topik_utama || []).map((t) => ({
              nama: t,
              deskripsi: `Kompetensi inti pembelajaran ${item.nama_mapel} pada topik ${t}.`,
            }));
            return {
              id: String(item.id),
              urutan: item.label_pilihan || `MAPEL PILIHAN ${idx + 1}`,
              nama: item.nama_mapel,
              kategori: item.kelompok ? `Rumpun ${item.kelompok} • Fase F` : "Mata Pelajaran Pilihan Fase F",
              tingkatKesesuaian: item.probabilitas_penguasaan,
              labelPenguasaan: item.label_probabilitas,
              catatanPenjelasan:
                item.detail_drawer?.estimasi_tingkat_penguasaan_materi?.catatan_penjelasan ||
                "Berdasarkan evaluasi multi-kriteria Nilai Rapor Smt 1, RIASEC, Kecerdasan Majemuk, dan Minat Prodi.",
              deskripsiFokus:
                item.detail_drawer?.deskripsi_pembelajaran ||
                "Fokus pembelajaran mencakup penguatan nalar analitis dan pemecahan masalah terstruktur.",
              topikUtama: topics,
              rekomendasiAlokasiJam:
                item.detail_drawer?.strategi_belajar_mandiri?.rekomendasi_alokasi_jam_mandiri ||
                "Minimal 4 jam per minggu untuk latihan terstruktur.",
              fokusPenguatanMateri:
                item.detail_drawer?.strategi_belajar_mandiri?.fokus_penguatan_materi ||
                "Perkuat pemahaman konsep dasar dan perbanyak latihan soal terarah.",
              catatanEvaluasiAkademik:
                item.detail_drawer?.catatan_evaluasi_akademik ||
                "Direkomendasikan sebagai mata pelajaran pilihan utama sesuai target program studi.",
              nilaiDasar: item.probabilitas_penguasaan,
              ...style,
            };
          });

        setRecommendedSubjects(mapped);
        setCurrentStudent((prev) => ({
          ...prev,
          evaluasiRows: mapped.map((m) => ({
            id: m.id,
            mataPelajaranId: !isNaN(Number(m.id)) ? Number(m.id) : undefined,
            mataPelajaran: m.nama,
            semester: prev.semester >= 3 && prev.semester <= 6 ? prev.semester : 3,
            nilaiInputSiswa: "",
            nilaiTerverifikasi: null,
            nilaiRaporSebenarnya: "0.0",
            statusValidasi: "Belum Diisi" as const,
          })),
        }));
      } catch {
        setRecommendedSubjects([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [authUser, selectedNisn]);

  const accessRules = determineStudentAccess(currentStudent, isSuratValidated);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
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

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-purple-200 border-t-[#5F089E] rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Memverifikasi hak akses Siswa...</span>
        </div>
      </div>
    );
  }

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

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 font-sans">
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Evaluasi Nilai Mapel Pilihan
            </h1>
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

            <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1 text-sm border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <p className="text-slate-500 font-normal text-xs sm:text-sm">
                NISN: <span className="font-semibold text-slate-800">{currentStudent.nisn || "-"}</span>
              </p>
              <p className="text-slate-800 font-medium text-xs sm:text-sm">
                Kelas: <span className="font-bold text-[#5F089E]">{currentStudent.kelas}</span>
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
                            {isSuratValidated
                              ? suratInfo.tanggalTerbit || "-"
                              : "Dalam Proses Peninjauan"}
                          </span>
                        </p>
                        <p>
                          <span className="font-bold">Dikirim oleh:</span>{" "}
                          <span className="font-medium">
                            {isSuratValidated && suratInfo.dikirimOleh
                              ? suratInfo.dikirimOleh
                              : "Koordinator Guru BK"}
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
                /* KONDISI BELUM DIVALIDASI: Kartu rekomendasi mapel pilihan BELUM MUNCUL (Masih Ditinjau) */
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
              ) : recommendedSubjects.length === 0 ? (
                <div className="w-full rounded-[24px] border-2 border-dashed border-amber-200/90 bg-[#FFFDF5] p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-5 shadow-2xs">
                  <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] text-[#5F089E] flex items-center justify-center mx-auto shadow-xs">
                    <Hourglass className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#854D0E] border border-amber-300">
                      <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse" />
                      STATUS: BELUM ADA DATA REKOMENDASI
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Rekomendasi Mapel Pilihan Belum Tersedia
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                      Paket 4 rekomendasi mata pelajaran pilihan Fase F akan muncul secara otomatis setelah data siswa, nilai rapor Semester 1, dan asesmen diimpor ke dalam sistem.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                    {recommendedSubjects.map((subj) => (
                      <div
                        key={subj.id}
                        onClick={() => setSelectedSubject(subj)}
                        className="group relative rounded-[24px] border-2 border-slate-200/90 bg-white p-6 sm:p-7 flex flex-col justify-between min-h-[300px] transition-all duration-300 hover:border-[#5F089E] hover:shadow-2xl hover:shadow-purple-950/10 hover:-translate-y-2 active:scale-[0.98] cursor-pointer overflow-hidden font-sans"
                      >
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

                  {/* Feedback & Strategi Belajar dari Guru BK / Admin */}
                  <div className="w-full rounded-[24px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#5F089E] flex items-center justify-center shrink-0 shadow-xs">
                          <MessageSquareQuote className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                              Feedback & Rekomendasi Strategi Belajar
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-[#5F089E] border border-purple-200/80">
                              <Sparkles className="w-3 h-3" />
                              Guru BK / Admin
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Catatan evaluasi bimbingan dan rekomendasi strategi belajar untuk pilihan mapelmu
                          </p>
                        </div>
                      </div>

                      {feedbackStrategi?.tersedia && feedbackStrategi.item_terbaru?.tanggal && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 self-start sm:self-auto">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Diperbarui: {feedbackStrategi.item_terbaru.tanggal}</span>
                        </div>
                      )}
                    </div>

                    {feedbackStrategi?.tersedia && feedbackStrategi.item_terbaru ? (
                      <div className="space-y-5">
                        {/* Identitas Pengirim Feedback */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#5F089E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                              {(feedbackStrategi.item_terbaru.guru_bk || "BK")
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((w) => w[0]?.toUpperCase() || "")
                                .join("") || "BK"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">
                                  {feedbackStrategi.item_terbaru.guru_bk || "Guru Bimbingan dan Konseling"}
                                </span>
                                <span className="text-[11px] font-medium text-[#5F089E] bg-purple-100/80 px-2 py-0.5 rounded-md">
                                  Guru BK / Admin
                                </span>
                              </div>
                              <span className="text-xs text-slate-500">
                                NIP: {feedbackStrategi.item_terbaru.nip_guru_bk || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Catatan Strategi Belajar (Satu kolom murni dari Guru BK) */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Catatan Strategi Belajar
                          </h4>
                          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                              {feedbackStrategi.item_terbaru.konten || feedbackStrategi.item_terbaru.strategi_belajar || "Pertahankan konsistensi belajar mandiri dan koordinasi berkala dengan Guru BK."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Kondisi jika belum ada feedback yang dikirim */
                      <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-700">
                          Belum Ada Catatan Khusus dari Guru BK
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          Guru Bimbingan dan Konseling belum mengirimkan catatan strategi belajar tambahan. Silakan konsultasikan perkembangan belajarmu secara langsung ke ruang BK jika membutuhkan arahan khusus.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: EVALUASI NILAI MAPEL PILIHAN (DENGAN PEMBATASAN KELAS X & VALIDASI SURAT) */}
        {activeTab === "Evaluasi Nilai Mapel Pilihan" && (
          <>
            {!accessRules.canAccessEvaluasi ? (
              <SiswaB1EvaluasiLockedState
                student={currentStudent}
                accessRules={accessRules}
                onGoToRekomendasi={() => setActiveTab("Rekomendasi Mapel Pilihan")}
                onGoToProfil={() => setActiveTab("Profil & Portofolio Akademik")}
              />
            ) : (
              <SiswaB1EvaluasiSection
                student={currentStudent}
                onShowToast={triggerToast}
              />
            )}
          </>
        )}

        {/* TAB 3: PROFIL & PORTOFOLIO AKADEMIK */}
        {activeTab === "Profil & Portofolio Akademik" && (
          <SiswaB1ProfilSection
            student={currentStudent}
            onShowToast={triggerToast}
          />
        )}

        {/* TAB 4: DIREKTORI SISWA */}
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
        suratInfo={suratInfo}
        recommendedSubjects={recommendedSubjects}
        onClose={() => setShowPdfPreview(false)}
        onDownload={handleDownloadPdf}
      />

      <SiswaB1SubjectDetailModal
        subject={selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
