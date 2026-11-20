"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  ChevronRight,
  ChevronDown,
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
  Users,
  Home,
} from "lucide-react";
import { StudentB1WaliKelas, MapelNilaiValidationItem, StatusRapor } from "./types";
import WaliKelasB1RevisiModal from "./WaliKelasB1RevisiModal";
import WaliKelasB1ApproveModal from "./WaliKelasB1ApproveModal";
import WaliKelasB1StudentDetailModal from "./WaliKelasB1StudentDetailModal";
import { useUser } from "@/context/UserContext";
import { useAuthGuard } from "@/lib/useAuthGuard";
import Footer from "@/components/shared/Footer";

interface AvailableKelasOption {
  id?: number;
  nama_kelas: string;
  tingkat?: string;
  tahun_ajaran?: string;
  wali_kelas?: string;
}

const DEFAULT_AVAILABLE_CLASSES: AvailableKelasOption[] = [
  { nama_kelas: "X-1" },
  { nama_kelas: "X-2" },
  { nama_kelas: "X-3" },
  { nama_kelas: "X-4" },
  { nama_kelas: "X-5" },
  { nama_kelas: "X-6" },
  { nama_kelas: "X-7" },
  { nama_kelas: "X-8" },
  { nama_kelas: "X-9" },
  { nama_kelas: "X-10" },
  { nama_kelas: "X-11" },
  { nama_kelas: "X-12" },
];

export default function WaliKelasB1Page() {
  const { authUser, currentUser, ready } = useAuthGuard(["guru"], ["wali_kelas"]);
  const [students, setStudents] = useState<StudentB1WaliKelas[]>([]);
  const [availableClasses, setAvailableClasses] = useState<AvailableKelasOption[]>(DEFAULT_AVAILABLE_CLASSES);

  const isRealGuru = authUser?.role === "guru" || currentUser?.role === "guru";
  const [kelasBinaanLabel, setKelasBinaanLabel] = useState<string>(
    isRealGuru ? (authUser?.profil?.kelas_binaan?.nama_kelas || currentUser?.waliKelas || "X-3") : "X-3"
  );
  const [namaWaliLabel, setNamaWaliLabel] = useState<string>(
    isRealGuru ? (authUser?.profil?.nama_lengkap || authUser?.nama_lengkap || currentUser?.name || "Wali Kelas") : "Wali Kelas"
  );
  const [nipWaliLabel, setNipWaliLabel] = useState<string>(
    isRealGuru ? (authUser?.profil?.nip || (currentUser as { nip?: string })?.nip || "") : ""
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingKelas, setIsLoadingKelas] = useState<boolean>(false);

  // Modals state
  const [isRevisiModalOpen, setIsRevisiModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalStudent, setDetailModalStudent] =
    useState<StudentB1WaliKelas | null>(null);

  // State untuk edit nilai buku rapor fisik per mata pelajaran secara langsung
  const [editingMapelId, setEditingMapelId] = useState<string | number | null>(null);
  const [inputBukuRaporMapel, setInputBukuRaporMapel] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<number>(3);

  // Success alert toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fungsi muat data kelas binaan & antrean validasi dari backend (/api/wali-kelas/pemantauan-kelas)
  const loadDataForKelas = async (targetKelas?: string, targetSem?: number) => {
    setIsLoadingKelas(true);
    try {
      const kelasToFetch =
        targetKelas ||
        authUser?.profil?.kelas_binaan?.nama_kelas;
      const semToFetch = targetSem !== undefined ? targetSem : selectedSemester;

      const url = kelasToFetch
        ? `/wali-kelas/pemantauan-kelas?kelas=${encodeURIComponent(kelasToFetch)}&semester=${semToFetch}&per_page=100`
        : `/wali-kelas/pemantauan-kelas?semester=${semToFetch}&per_page=100`;

      const res = await apiRequest<{
        header_halaman?: {
          kelas_binaan?: { nama_kelas?: string };
          wali_kelas?: { nama_lengkap?: string; nip?: string };
          daftar_kelas_tersedia?: Array<{
            id: number;
            nama_kelas: string;
            tingkat?: string;
            tahun_ajaran?: string;
            wali_kelas?: string;
          }>;
        };
        daftar_siswa?: {
          items?: Array<{
            no?: string;
            siswa_id: number;
            nama_lengkap: string;
            inisial?: string;
            nisn: string;
            kelas?: string;
            semester?: number;
            label_semester?: string;
            daftar_semester_terisi?: number[];
            kelengkapan_profil?: { persentase?: number };
            mapel_pilihan?: { label?: string; daftar_mapel?: string[] };
            rata_rata?: number;
            status_rapor?: { label?: string; kode?: string };
            nilai_rapor_aktif_id?: number | null;
          }>;
        };
        validasi_nilai_rapor_fisik?: {
          daftar_antrean?: Array<{
            nilai_rapor_id: number;
            siswa_id: number;
            nama_mapel: string;
            semester?: number;
            label_semester?: string;
            komparasi_nilai?: {
              input_mandiri?: { nilai?: number; tanggal_input?: string };
              buku_rapor?: { nilai?: number };
              selisih_poin?: number;
            };
          }>;
        };
      }>(url);

      if (!res) return;

      if (res.header_halaman?.kelas_binaan?.nama_kelas) {
        setKelasBinaanLabel(res.header_halaman.kelas_binaan.nama_kelas);
      } else if (targetKelas) {
        setKelasBinaanLabel(targetKelas);
      }

      if (res.header_halaman?.wali_kelas?.nama_lengkap) {
        setNamaWaliLabel(res.header_halaman.wali_kelas.nama_lengkap);
      }
      if (res.header_halaman?.wali_kelas?.nip) {
        setNipWaliLabel(res.header_halaman.wali_kelas.nip);
      }

      if (res.header_halaman?.daftar_kelas_tersedia && res.header_halaman.daftar_kelas_tersedia.length > 0) {
        setAvailableClasses(res.header_halaman.daftar_kelas_tersedia);
      }

      type AntreanItem = {
        nilai_rapor_id: number;
        siswa_id: number;
        nama_mapel: string;
        label_semester?: string;
        komparasi_nilai?: {
          input_mandiri?: { nilai?: number; tanggal_input?: string };
          buku_rapor?: { nilai?: number };
          selisih_poin?: number;
        };
      };

      const antreanMap = new Map<number, AntreanItem>();
      for (const item of res.validasi_nilai_rapor_fisik?.daftar_antrean || []) {
        if (!antreanMap.has(item.siswa_id)) {
          antreanMap.set(item.siswa_id, item);
        }
      }

      const activeKelasName = targetKelas || res.header_halaman?.kelas_binaan?.nama_kelas || "X-3";
      const apiRows = res.daftar_siswa?.items || [];
      const mapped: StudentB1WaliKelas[] = apiRows.map((item, idx) => {
        const antrean = antreanMap.get(item.siswa_id);
        const isQueue =
          item.status_rapor?.kode === "antrean_cek" ||
          item.status_rapor?.label === "Antrean Cek";
        const mapelNames = item.mapel_pilihan?.daftar_mapel || [];

        const rawDaftarNilai = (item as unknown as {
          daftar_nilai_pilihan?: Array<{
            id?: number;
            mata_pelajaran_id?: number;
            nama_mapel: string;
            input_mandiri: number;
            buku_rapor: number;
            selisih: number;
            ada_selisih: boolean;
            status_validasi: string;
            tanggal_input?: string;
            catatan_wali_kelas?: string;
          }>;
        }).daftar_nilai_pilihan || [];

        const default4MapelNames = mapelNames.length >= 4
          ? mapelNames.slice(0, 4)
          : [...mapelNames, "Matematika Tingkat Lanjut", "Fisika", "Kimia", "Biologi"].slice(0, 4);

        const daftarNilaiPilihan: MapelNilaiValidationItem[] = rawDaftarNilai.length > 0
          ? rawDaftarNilai.map((dp) => ({
              id: dp.id,
              mataPelajaranId: dp.mata_pelajaran_id,
              namaMapel: dp.nama_mapel,
              inputMandiri: dp.input_mandiri,
              bukuRapor: dp.buku_rapor,
              selisih: dp.selisih,
              adaSelisih: dp.ada_selisih,
              statusValidasi: dp.status_validasi,
              tanggalInput: dp.tanggal_input || "-",
              catatanWaliKelas: dp.catatan_wali_kelas || null,
            }))
          : default4MapelNames.map((mName, mIdx) => {
              const baseScore = item.rata_rata && Number(item.rata_rata) > 0 ? Number(item.rata_rata) : 0;
              return {
                id: mIdx + 1,
                namaMapel: mName,
                inputMandiri: baseScore,
                bukuRapor: baseScore,
                selisih: 0,
                adaSelisih: false,
                statusValidasi: "belum_diinput",
                tanggalInput: "-",
              };
            });

        const hasInput =
          (item.rata_rata !== null && item.rata_rata !== undefined && Number(item.rata_rata) > 0) ||
          rawDaftarNilai.some((d) => Boolean(d.input_mandiri && Number(d.input_mandiri) > 0)) ||
          Boolean(antrean);

        const isBelumDiisi =
          item.status_rapor?.kode === "belum_diisi" ||
          item.status_rapor?.label === "Belum Diisi" ||
          (!hasInput && rawDaftarNilai.length === 0);

        const hasAnyDiscrepancy = !isBelumDiisi && daftarNilaiPilihan.some(
          (d) => d.adaSelisih || d.statusValidasi === "perlu_koreksi"
        );
        const activeDiscrepancy = antrean
          ? {
              id: antrean.nilai_rapor_id,
              namaMapel: antrean.nama_mapel || (mapelNames[0] ?? "Mata Pelajaran"),
              inputMandiri: antrean.komparasi_nilai?.input_mandiri?.nilai ?? 0,
              tanggalInput: antrean.komparasi_nilai?.input_mandiri?.tanggal_input || "-",
              bukuRapor: antrean.komparasi_nilai?.buku_rapor?.nilai ?? 0,
              selisih: antrean.komparasi_nilai?.selisih_poin ?? 0,
              adaSelisih: Math.abs(antrean.komparasi_nilai?.selisih_poin ?? 0) >= 0.1,
            }
          : (daftarNilaiPilihan.find((d) => d.adaSelisih) || daftarNilaiPilihan[0]);

        let statusRapor: StatusRapor = "Belum Diisi";
        if (isBelumDiisi) {
          statusRapor = "Belum Diisi";
        } else if (isQueue || hasAnyDiscrepancy) {
          statusRapor = "Antrean Cek";
        } else if (
          item.status_rapor?.kode === "tervalidasi" ||
          item.status_rapor?.label === "Tervalidasi Rapor Fisik"
        ) {
          statusRapor = "Tervalidasi Rapor Fisik";
        } else {
          statusRapor = "Belum Diisi";
        }

        return {
          id: String(item.siswa_id),
          no: item.no || String(idx + 1).padStart(2, "0"),
          nama: item.nama_lengkap,
          initial:
            item.inisial ||
            item.nama_lengkap
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() || "")
              .join("") ||
            "SW",
          nisn: item.nisn,
          kelas: item.kelas || activeKelasName,
          semester: item.label_semester || antrean?.label_semester || `Semester ${semToFetch}`,
          daftarSemesterTerisi: item.daftar_semester_terisi || [],
          kelengkapanProfil: item.kelengkapan_profil?.persentase ?? 100,
          mapelPilihanCount: item.mapel_pilihan?.label || `${mapelNames.length}/4 Mapel`,
          rataRata: isBelumDiisi ? 0 : (item.rata_rata ?? 0),
          statusRapor: statusRapor,
          hasDiscrepancy: !isBelumDiisi && (isQueue || hasAnyDiscrepancy),
          mapelDiscrepancy: activeDiscrepancy,
          daftarNilaiPilihan: daftarNilaiPilihan,
          profilDetail: {
            mapelPilihan: mapelNames,
            riasec: {
              kode: "-",
              label: "-",
              deskripsi: "Profil minat karier berdasarkan asesmen RIASEC.",
            },
            kecerdasanMajemuk: {
              tipe: "-",
              deskripsi: "Profil kecerdasan dominan siswa.",
            },
            prestasi: [],
          },
        };
      });

      setStudents(mapped);
      setCurrentPage(1);

      // Prioritaskan memilih siswa yang berada di antrean validasi terlebih dahulu
      const studentInQueue = mapped.find((s) => s.statusRapor === "Antrean Cek");
      if (studentInQueue) {
        setSelectedStudentId(studentInQueue.id);
      } else if (mapped.length > 0) {
        setSelectedStudentId(mapped[0].id);
      } else {
        setSelectedStudentId("");
      }
    } catch {
      setStudents([]);
      setSelectedStudentId("");
    } finally {
      setIsLoadingKelas(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    if (authUser?.profil?.nama_lengkap) {
      setNamaWaliLabel(authUser.profil.nama_lengkap);
    }
    if (authUser?.profil?.nip) {
      setNipWaliLabel(authUser.profil.nip);
    }
    if (authUser?.profil?.kelas_binaan?.nama_kelas) {
      setKelasBinaanLabel(authUser.profil.kelas_binaan.nama_kelas);
    }
    const target = authUser?.profil?.kelas_binaan?.nama_kelas;
    void loadDataForKelas(target);
  }, [ready, authUser?.profil?.nama_lengkap, authUser?.profil?.nip, authUser?.profil?.kelas_binaan?.nama_kelas]);

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0] || null;

  const handleOpenDetailModal = async (student: StudentB1WaliKelas) => {
    setDetailModalStudent(student);
    setIsDetailModalOpen(true);

    if (!isNaN(Number(student.id))) {
      try {
        const res = await apiRequest<{
          mapel_pilihan?: Array<{ urutan: number; nama_mapel: string }>;
          minat_dan_bakat?: {
            riasec?: { label?: string };
            kecerdasan_majemuk?: { daftar_label?: string[] };
          };
          prestasi_siswa?: Array<{
            judul: string;
            label_penyelenggara?: string;
            penyelenggara?: string;
          }>;
        }>(`/wali-kelas/siswa/${student.id}/profil-detail`);

        if (res) {
          setDetailModalStudent((prev) =>
            prev && prev.id === student.id
              ? {
                  ...prev,
                  profilDetail: {
                    mapelPilihan:
                      res.mapel_pilihan?.map((m) => m.nama_mapel) ||
                      prev.profilDetail?.mapelPilihan ||
                      [],
                    riasec: {
                      kode: res.minat_dan_bakat?.riasec?.label?.split(" ")[0] || "-",
                      label:
                        res.minat_dan_bakat?.riasec?.label ||
                        prev.profilDetail?.riasec.label ||
                        "-",
                      deskripsi:
                        prev.profilDetail?.riasec.deskripsi ||
                        "Profil minat karier berdasarkan asesmen RIASEC.",
                    },
                    kecerdasanMajemuk: {
                      tipe:
                        res.minat_dan_bakat?.kecerdasan_majemuk?.daftar_label?.join(", ") ||
                        prev.profilDetail?.kecerdasanMajemuk.tipe ||
                        "-",
                      deskripsi:
                        prev.profilDetail?.kecerdasanMajemuk.deskripsi ||
                        "Profil kecerdasan dominan siswa.",
                    },
                    prestasi:
                      res.prestasi_siswa?.map((p, idx) => ({
                        id: String(idx + 1),
                        judul: p.judul,
                        penyelenggara: p.label_penyelenggara || p.penyelenggara || "-",
                        tahun: "-",
                        tingkat: "-",
                      })) ||
                      prev.profilDetail?.prestasi ||
                      [],
                  },
                }
              : prev
          );
        }
      } catch {
        // Biarkan data ringkas yang sudah ada
      }
    }
  };

  const handleStartEditMapel = (mapel: MapelNilaiValidationItem) => {
    setEditingMapelId(mapel.id ?? mapel.namaMapel);
    setInputBukuRaporMapel(mapel.bukuRapor.toString());
  };

  const handleCancelEditMapel = () => {
    setEditingMapelId(null);
    setInputBukuRaporMapel("");
  };

  const handleSaveMapelBukuRapor = async (mapelItem: MapelNilaiValidationItem) => {
    if (!selectedStudent) return;
    const parsed = parseFloat(inputBukuRaporMapel);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      showToast("Harap masukkan nilai rapor yang valid antara 0 - 100.");
      return;
    }

    const selisihBaru = Math.round((mapelItem.inputMandiri - parsed) * 10) / 10;
    const adaSelisih = Math.abs(selisihBaru) >= 0.1;

    if (mapelItem.id && !isNaN(Number(mapelItem.id))) {
      try {
        await apiRequest(`/wali-kelas/validasi-nilai/${mapelItem.id}/update-buku-rapor`, {
          method: "POST",
          body: { buku_rapor: parsed },
        });
      } catch {
        // Fallback optimis
      }
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudent.id) {
          const updatedList = (s.daftarNilaiPilihan || []).map((m) => {
            if ((m.id && m.id === mapelItem.id) || m.namaMapel === mapelItem.namaMapel) {
              return {
                ...m,
                bukuRapor: parsed,
                selisih: selisihBaru,
                adaSelisih: adaSelisih,
                statusValidasi: adaSelisih ? "perlu_koreksi" : "tervalidasi",
              };
            }
            return m;
          });

          const hasAny = updatedList.some((d) => d.adaSelisih || d.statusValidasi === "perlu_koreksi");

          return {
            ...s,
            daftarNilaiPilihan: updatedList,
            hasDiscrepancy: hasAny,
            mapelDiscrepancy: updatedList.find((d) => d.adaSelisih) || updatedList[0],
            statusRapor: hasAny ? "Perlu Koreksi Fisik" : "Tervalidasi Rapor Fisik",
          };
        }
        return s;
      })
    );

    setEditingMapelId(null);
    showToast(
      `Nilai rapor fisik untuk ${mapelItem.namaMapel} (${selectedStudent.nama}) berhasil diperbarui menjadi ${parsed.toFixed(1)}!`
    );
  };

  const handleApproveDiscrepancy = async () => {
    if (!selectedStudent) return;
    try {
      if (!isNaN(Number(selectedStudent.id))) {
        await apiRequest(`/wali-kelas/siswa/${selectedStudent.id}/validasi-semua`, {
          method: "POST",
          body: { semester: selectedSemester },
        });
      }
    } catch {
      // Ignore
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudent.id) {
          const approvedList = (s.daftarNilaiPilihan || []).map((m) => ({
            ...m,
            statusValidasi: "tervalidasi",
            adaSelisih: false,
            selisih: 0,
            bukuRapor: m.bukuRapor,
          }));

          return {
            ...s,
            statusRapor: "Tervalidasi Rapor Fisik",
            hasDiscrepancy: false,
            daftarNilaiPilihan: approvedList,
            mapelDiscrepancy: approvedList[0],
          };
        }
        return s;
      })
    );
    showToast(
      `Seluruh 4 nilai rapor fisik siswa ${selectedStudent.nama} berhasil disahkan dan divalidasi!`
    );
  };

  const handleSendRevision = async (note: string, updatedBukuRapor?: number) => {
    if (!selectedStudent) return;
    try {
      // Cari semua mapel yang memiliki selisih nilai
      const discrepancyMapels = (selectedStudent.daftarNilaiPilihan || []).filter(
        (m) => m.adaSelisih || Math.abs(m.selisih) >= 0.1
      );
      const targets =
        discrepancyMapels.length > 0
          ? discrepancyMapels
          : [selectedStudent.mapelDiscrepancy].filter(Boolean);

      for (const targetMapel of targets) {
        const nilaiRaporId =
          targetMapel?.id && !isNaN(Number(targetMapel.id))
            ? Number(targetMapel.id)
            : null;

        if (nilaiRaporId) {
          await apiRequest(`/wali-kelas/validasi-nilai/${nilaiRaporId}/minta-revisi`, {
            method: "POST",
            body: {
              nilai_sesuai_rapor: updatedBukuRapor ?? targetMapel?.bukuRapor ?? 0,
              catatan_wali_kelas: note,
            },
          });
        }
      }
    } catch {
      // Ignore
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudent.id) {
          const updatedList = (s.daftarNilaiPilihan || []).map((m) => {
            if (m.adaSelisih || m.namaMapel === selectedStudent.mapelDiscrepancy?.namaMapel) {
              return {
                ...m,
                statusValidasi: "perlu_koreksi",
                bukuRapor: updatedBukuRapor ?? m.bukuRapor,
                catatanWaliKelas: note,
              };
            }
            return m;
          });

          return {
            ...s,
            statusRapor: "Perlu Koreksi Fisik",
            hasDiscrepancy: true,
            daftarNilaiPilihan: updatedList,
          };
        }
        return s;
      })
    );
    showToast(
      `Permintaan perbaikan nilai telah dikirimkan ke siswa ${selectedStudent.nama}. Catatan: "${note}"`
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const pendingCount = students.filter(
    (s) => s.statusRapor === "Antrean Cek"
  ).length;

  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      student.nama.toLowerCase().includes(q) ||
      student.nisn.toLowerCase().includes(q) ||
      student.statusRapor.toLowerCase().includes(q)
    );
  });

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const currentActualPage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice(
    (currentActualPage - 1) * pageSize,
    currentActualPage * pageSize
  );

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-purple-200 border-t-[#5F089E] rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Memverifikasi hak akses Wali Kelas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="wali-kelas-b1-root min-h-screen bg-white font-sans flex flex-col selection:bg-purple-100 selection:text-purple-900 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 max-w-md bg-white border border-purple-100 shadow-xl rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-8 h-8 rounded-full bg-purple-50 text-[#5F089E] flex items-center justify-center shrink-0">
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
          <span className="text-[#5F089E] font-semibold">
            Pemantauan Kelas Binaan
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 space-y-1.5 font-sans animate-in fade-in duration-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Pemantauan Kelas Binaan
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-3xl mt-1.5">
            Pantau perkembangan data akademik, profil, dan capaian belajar siswa di kelasmu.
          </p>
          {/* Info Kelas yang Diampu & Info Wali Kelas (Langsung Kelas Binaan) */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-semibold text-slate-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#5F089E]" />
              <span className="text-slate-500 font-medium">Kelas yang Diampu:</span>
              <span className="font-extrabold text-xs sm:text-sm text-[#5F089E]">Kelas {kelasBinaanLabel}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-2xs">
              <span className="text-slate-400 font-normal">Wali Kelas:</span>
              <span className="font-bold text-slate-800">{namaWaliLabel}</span>
              {nipWaliLabel ? (
                <span className="text-slate-400 font-medium text-[11px]">(NIP: {nipWaliLabel})</span>
              ) : null}
            </div>

            {isLoadingKelas && (
              <span className="text-xs text-purple-600 font-medium animate-pulse">
                Memuat data kelas...
              </span>
            )}
          </div>
        </div>

        {/* Two-Column Grid: Left Student Table, Right Validation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Tabel Daftar Siswa */}
          <div className="lg:col-span-8 bg-white border border-purple-100 rounded-2xl shadow-sm overflow-hidden font-sans">
            {/* Table Header & Search Bar */}
            <div className="p-5 sm:p-6 pb-4 border-b border-purple-100 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Daftar Siswa
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pantau kelengkapan profil, pemilihan mata pelajaran, dan validasi nilai rapor siswa.
                  </p>
                </div>

                {/* Semester Switcher for Wali Kelas */}
                <div className="flex items-center gap-1.5 bg-[#FAF5FF] p-1.5 rounded-xl border border-purple-200/90 shadow-2xs self-start sm:self-auto">
                  <span className="text-[11px] font-bold text-slate-500 px-2 hidden md:inline">
                    Pilih Semester:
                  </span>
                  {[3, 4, 5, 6].map((sem) => (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => {
                        setSelectedSemester(sem);
                        loadDataForKelas(kelasBinaanLabel, sem);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedSemester === sem
                          ? "bg-[#5F089E] text-white shadow-xs scale-102"
                          : "text-slate-600 hover:text-[#5F089E] hover:bg-purple-100/60"
                      }`}
                    >
                      Semester {sem}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama atau NISN..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F089E]/20 focus:border-[#5F089E] transition-all font-sans"
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

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    Menampilkan data: <strong className="text-[#5F089E]">Semester {selectedSemester}</strong>
                  </span>
                  <span className="text-xs font-bold text-[#5F089E] bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 shrink-0">
                    Total: {students.length} Siswa
                  </span>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-purple-50/30 border-b border-purple-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student) => {
                      const isSelected = student.id === selectedStudentId;
                      return (
                        <tr
                          key={student.id}
                          onClick={() => setSelectedStudentId(student.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-purple-50/60 border-l-4 border-l-[#5F089E]"
                              : "hover:bg-purple-50/20"
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                            {student.no}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">
                              {student.nama}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                              NISN: {student.nisn}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Lengkap {student.kelengkapanProfil}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                            {student.mapelPilihanCount || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {student.statusRapor === "Belum Diisi" || !student.rataRata || student.rataRata <= 0
                              ? "-"
                              : student.rataRata.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {student.statusRapor === "Tervalidasi Rapor Fisik" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Tervalidasi Rapor Fisik
                              </span>
                            ) : student.statusRapor === "Antrean Cek" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Antrean Cek
                              </span>
                            ) : student.statusRapor === "Belum Diisi" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <Clock className="w-3 h-3 text-slate-400" />
                                Belum Diisi
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
                                void handleOpenDetailModal(student);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#5F089E] hover:bg-[#4d0680] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer shadow-xs group/btn"
                            >
                              <Eye className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                              <span>Tinjau Profil</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        {students.length === 0
                          ? "Belum ada data siswa di rombel binaan ini. Data akan muncul setelah diimpor oleh Admin / Guru BK."
                          : `Tidak ada siswa yang sesuai dengan kata kunci "${searchQuery}"`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Menampilkan {paginatedStudents.length} dari {filteredStudents.length} siswa rombel binaan {kelasBinaanLabel}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1 font-semibold">
                  <button
                    type="button"
                    disabled={currentActualPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-[11px] cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                  </button>

                  {(() => {
                    const pages: (number | "ellipsis")[] = [];
                    if (totalPages <= 5) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else if (currentActualPage <= 3) {
                      pages.push(1, 2, 3, "ellipsis", totalPages);
                    } else if (currentActualPage >= totalPages - 2) {
                      pages.push(1, "ellipsis", totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, "ellipsis", currentActualPage - 1, currentActualPage, currentActualPage + 1, "ellipsis", totalPages);
                    }

                    return pages.map((item, idx) => {
                      if (item === "ellipsis") {
                        return (
                          <span key={`ell-${idx}`} className="px-1 text-slate-400">
                            &hellip;
                          </span>
                        );
                      }
                      const isActive = currentActualPage === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCurrentPage(item)}
                          className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#5F089E] text-white shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    });
                  })()}

                  <button
                    type="button"
                    disabled={currentActualPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-[11px] cursor-pointer transition-colors"
                  >
                    Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Card Validasi Nilai Rapor Fisik (UC-13) */}
          <div className="lg:col-span-4 bg-white border border-purple-100 rounded-2xl p-5 sm:p-6 shadow-sm sticky top-24 font-sans">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Validasi Nilai Rapor Fisik
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verifikasi side-by-side legger fisik sekolah vs inputan siswa
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                Antrean: {pendingCount > 0 ? 1 : 0} dari {pendingCount}
              </span>
            </div>

            {!selectedStudent ? (
              <div className="text-center py-10 px-4 bg-purple-50/30 rounded-xl border border-dashed border-purple-200">
                <Users className="w-9 h-9 text-purple-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">
                  Belum Ada Antrean Validasi
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Pilih siswa pada tabel di sebelah kiri setelah data siswa diimpor ke dalam sistem.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#5F089E] text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                      {selectedStudent.initial}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {selectedStudent.nama}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        NISN: {selectedStudent.nisn} &bull; Kelas {selectedStudent.kelas}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#5F089E] bg-purple-100/70 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {selectedStudent.semester}
                  </span>
                </div>

                {/* Subtitle & Status Ringkasan 4 Mapel */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    4 Nilai Mapel Pilihan
                  </span>
                  {selectedStudent.statusRapor === "Belum Diisi" ? (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Belum Diisi Siswa
                    </span>
                  ) : selectedStudent.hasDiscrepancy ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      Perlu Pengecekan
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      4/4 Sesuai Fisik
                    </span>
                  )}
                </div>

                {/* Daftar 4 Nilai Mata Pelajaran Pilihan */}
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {(selectedStudent.daftarNilaiPilihan && selectedStudent.daftarNilaiPilihan.length > 0
                    ? selectedStudent.daftarNilaiPilihan
                    : [selectedStudent.mapelDiscrepancy || { namaMapel: "Mata Pelajaran Pilihan", inputMandiri: 0, bukuRapor: 0, selisih: 0, tanggalInput: "-" }]
                  ).map((mapel, mIdx) => {
                    const isEditing = editingMapelId === (mapel.id ?? mIdx);
                    const hasDiff = mapel.adaSelisih || Math.abs(mapel.selisih) >= 0.1;
                    const diffSign = mapel.selisih > 0 ? "+" : "";

                    return (
                      <div
                        key={mapel.id ?? mIdx}
                        className={`p-3 rounded-xl border transition-all ${
                          selectedStudent.statusRapor === "Belum Diisi" || mapel.statusValidasi === "belum_diinput"
                            ? "border-slate-200 bg-slate-50/50"
                            : hasDiff
                            ? "border-rose-200 bg-rose-50/20"
                            : mapel.statusValidasi === "tervalidasi"
                            ? "border-emerald-200/70 bg-emerald-50/15"
                            : "border-slate-200 bg-slate-50/40"
                        }`}
                      >
                        {/* Mapel Title & Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-800 truncate max-w-[200px]" title={mapel.namaMapel}>
                            {mIdx + 1}. {mapel.namaMapel}
                          </span>
                          {selectedStudent.statusRapor === "Belum Diisi" || mapel.statusValidasi === "belum_diinput" ? (
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5 text-slate-400" /> Belum Diinput
                            </span>
                          ) : hasDiff ? (
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-100/80 px-1.5 py-0.5 rounded border border-rose-200">
                              Selisih: {diffSign}{mapel.selisih.toFixed(1)} Poin
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Sesuai
                            </span>
                          )}
                        </div>

                        {/* 2-Column Grid: Input Mandiri vs Buku Rapor */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Input Siswa */}
                          <div className="p-2 rounded-lg bg-white border border-slate-200/80 text-center">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Input Siswa
                            </span>
                            <span className={`text-xl font-extrabold my-0.5 block ${mapel.inputMandiri > 0 ? "text-[#5F089E]" : "text-slate-400"}`}>
                              {mapel.inputMandiri > 0 ? mapel.inputMandiri.toFixed(1) : "-"}
                            </span>
                            <span className="text-[9px] text-slate-400 block truncate">
                              {mapel.inputMandiri > 0 ? (mapel.tanggalInput || "Mandiri") : "Belum diinput"}
                            </span>
                          </div>

                          {/* Buku Rapor Fisik */}
                          <div className={`p-2 rounded-lg bg-white text-center border relative ${
                            hasDiff ? "border-rose-300" : "border-slate-200/80"
                          }`}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`text-[9px] font-semibold uppercase tracking-wider block ${
                                hasDiff ? "text-rose-600" : "text-slate-400"
                              }`}>
                                Buku Rapor
                              </span>
                              {!isEditing && selectedStudent.statusRapor !== "Belum Diisi" && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditMapel(mapel)}
                                  title="Ubah nilai buku rapor fisik"
                                  className="text-[10px] text-[#5F089E] hover:text-[#450474] flex items-center gap-0.5 font-bold cursor-pointer hover:underline"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                  <span>Ubah</span>
                                </button>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="my-1 space-y-1">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    autoFocus
                                    value={inputBukuRaporMapel}
                                    onChange={(e) => setInputBukuRaporMapel(e.target.value)}
                                    className="w-14 text-center text-sm font-extrabold text-[#BA1A1A] border-2 border-rose-400 rounded-md bg-white px-1 py-0.5 outline-none focus:ring-1 focus:ring-[#5F089E]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveMapelBukuRapor(mapel)}
                                    className="p-1 rounded-md bg-[#0E6245] text-white hover:bg-[#094732] cursor-pointer"
                                    title="Simpan Nilai"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEditMapel}
                                    className="p-1 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                                    title="Batal"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="text-[8px] text-slate-400 block">0 - 100</span>
                              </div>
                            ) : (
                              <>
                                <span className={`text-xl font-extrabold my-0.5 block ${
                                  hasDiff ? "text-[#BA1A1A]" : mapel.bukuRapor > 0 ? "text-slate-800" : "text-slate-400"
                                }`}>
                                  {mapel.bukuRapor > 0 ? mapel.bukuRapor.toFixed(1) : "-"}
                                </span>
                                <span className={`text-[9px] font-medium block truncate ${
                                  hasDiff ? "text-rose-600" : mapel.bukuRapor > 0 ? "text-emerald-600" : "text-slate-400"
                                }`}>
                                  {hasDiff ? "Perlu Dicek" : mapel.bukuRapor > 0 ? "Fisik Sekolah" : "Menunggu Siswa"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-3 border-t border-purple-100">
                  <button
                    type="button"
                    disabled={selectedStudent.statusRapor === "Belum Diisi"}
                    onClick={() => setIsApproveModalOpen(true)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 ${
                      selectedStudent.statusRapor === "Belum Diisi"
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                        : "bg-[#5F089E] hover:bg-[#4d0680] shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {selectedStudent.statusRapor === "Belum Diisi"
                        ? "Menunggu Input Siswa"
                        : "Validasi & Setujui (4 Mapel)"}
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={selectedStudent.statusRapor === "Belum Diisi"}
                      onClick={() => setIsRevisiModalOpen(true)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                        selectedStudent.statusRapor === "Belum Diisi"
                          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                          : "text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Minta Revisi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleOpenDetailModal(selectedStudent)}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-[#5F089E] bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail Profil</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedStudent && (
        <>
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
            waliName={namaWaliLabel}
            waliNip={nipWaliLabel}
          />
        </>
      )}

      {detailModalStudent && (
        <WaliKelasB1StudentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          student={detailModalStudent}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
