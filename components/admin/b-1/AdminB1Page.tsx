"use client";

import { useEffect, useState } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";
import AdminB1Breadcrumb from "./AdminB1Breadcrumb";
import AdminB1Header from "./AdminB1Header";
import AdminB1Tabs from "./AdminB1Tabs";
import AdminB1UploadSection, { ImportCategory } from "./AdminB1UploadSection";
import AdminB1TableSection from "./AdminB1TableSection";
import AdminB1StudentDetailModal from "./AdminB1StudentDetailModal";
import AdminB1Subviews from "./AdminB1Subviews";
import AdminB1WaliKelasSection from "./AdminB1WaliKelasSection";
import { B1Tab, RiasecType, StudentB1, UploadedFileState } from "./types";
import { CheckCircle2, X } from "lucide-react";
import Footer from "@/components/shared/Footer";

function mapRiasecType(raw?: string | null): RiasecType {
  const val = (raw || "").trim().toLowerCase();
  if (!val || val === "-") return "-";
  if (val.startsWith("real")) return "Realistik";
  if (val.startsWith("inv")) return "Investigative";
  if (val.startsWith("art")) return "Artistic";
  if (val.startsWith("soc") || val.startsWith("sos")) return "Social";
  if (val.startsWith("ent")) return "Enterprising";
  if (val.startsWith("con") || val.startsWith("kon")) return "Conventional";
  return "-";
}

export default function AdminB1Page() {
  const { ready } = useAuthGuard(["administrator", "guru"], ["guru_bk"]);
  const [activeTab, setActiveTab] = useState<B1Tab>("Pusat Manajemen Data");
  const [students, setStudents] = useState<StudentB1[]>([]);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);
  const [rawExcelFile, setRawExcelFile] = useState<File | null>(null);
  const [importCategory, setImportCategory] = useState<ImportCategory>("auto");
  const [selectedStudent, setSelectedStudent] = useState<StudentB1 | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchStudentsFromBackend = async (): Promise<StudentB1[]> => {
    try {
      const res = await apiRequest<{
        data?: Array<{
          id: number;
          nisn: string;
          nis?: string;
          nama_siswa: string;
          kelas: string;
          nilai_rapor?: number | null;
          riasec?: string;
          kecerdasan_majemuk?: string;
          minat_prodi?: string;
          minat_prodi_list?: Array<{
            prioritas: number;
            nama_prodi: string;
            perguruan_tinggi?: string;
          }>;
        }>;
      }>("/admin/manajemen-data/siswa?per_page=500");

      const list = res?.data || [];
      const mapped: StudentB1[] = list.map((s) => {
        const alt = s.minat_prodi_list?.find((p) => p.prioritas === 2);
        return {
          id: String(s.id),
          nisn: s.nisn || "-",
          nama: s.nama_siswa || "-",
          namaPanggilan: s.nama_siswa?.split(" ")[0] || "-",
          kelas: s.kelas || "-",
          nilaiRapor: s.nilai_rapor ?? 0,
          riasec: mapRiasecType(s.riasec),
          riasecScores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
          kecerdasanMajemuk: s.kecerdasan_majemuk || "-",
          minatProdi: s.minat_prodi || "-",
          minatProdiAlternatif: alt
            ? `${alt.nama_prodi}${alt.perguruan_tinggi ? ` - ${alt.perguruan_tinggi}` : ""}`
            : "-",
          hobi: "-",
          citaCita: "-",
          warnaFavorit: "-",
          makananFavorit: "-",
          bahasaKeseharian: "-",
          permainanOnline: "-",
          permainanOffline: "-",
          kondisiOrtu: "-",
          ayahPekerjaan: "-",
          ibuPekerjaan: "-",
          penghasilanGabungan: "Terenkripsi (UU PDP)",
          kontakOrtu: "-",
          bansos: {
            kip: "Tidak Terdaftar",
            pip: "Tidak Terdaftar",
            pkh: "Tidak Terdaftar",
            kisBpjs: "Tidak Terdaftar",
          },
        };
      });
      setStudents(mapped);
      return mapped;
    } catch {
      setStudents([]);
      return [];
    }
  };

  useEffect(() => {
    if (!ready) return;
    void fetchStudentsFromBackend();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    if (students.length === 0) {
      void fetchStudentsFromBackend();
    }
  }, [activeTab, ready]);

  const handleSelectStudentDetail = async (student: StudentB1) => {
    setSelectedStudent(student);
    if (!isNaN(Number(student.id))) {
      try {
        const res = await apiRequest<{
          biodata_murid?: {
            nama_panggilan?: string;
            hobi?: { ringkasan?: string };
            cita_cita?: { ringkasan?: string };
            profil_murid?: {
              warna_favorit?: string;
              makanan_favorit?: string;
              bahasa_keseharian?: string;
              permainan_online?: string;
              permainan_offline?: string;
              permainan_favorit_badges?: string[];
            };
          };
          latar_belakang_ekonomi?: {
            kondisi_orang_tua_wali?: string;
            ayah_dan_pekerjaan?: string;
            ibu_dan_pekerjaan?: string;
            total_penghasilan_formatted?: string;
            kontak_orang_tua?: string;
            ringkasan_orang_tua?: {
              ayah_dan_pekerjaan?: string;
              ibu_dan_pekerjaan?: string;
              penghasilan_gabungan?: string;
              kontak_wa_orang_tua?: string;
            };
            penerima_bantuan?: {
              kip?: string;
              pip?: string;
              pkh?: string;
              kis_bpjs_kesehatan?: string;
            };
            kepemilikan_bantuan?: {
              kip?: boolean;
              pip?: boolean;
              kps_pkh?: boolean;
            };
          };
        }>(`/admin/manajemen-data/siswa/${student.id}`);

        if (res) {
          const bio = res.biodata_murid;
          const eko = res.latar_belakang_ekonomi;
          const games = bio?.profil_murid?.permainan_favorit_badges || [];
          const ortu = eko?.ringkasan_orang_tua;
          const bantuan = eko?.penerima_bantuan;

          setSelectedStudent((prev) =>
            prev && prev.id === student.id
              ? {
                  ...prev,
                  namaPanggilan: bio?.nama_panggilan || prev.namaPanggilan,
                  hobi: bio?.hobi?.ringkasan || prev.hobi,
                  citaCita: bio?.cita_cita?.ringkasan || prev.citaCita,
                  warnaFavorit: bio?.profil_murid?.warna_favorit || prev.warnaFavorit,
                  makananFavorit: bio?.profil_murid?.makanan_favorit || prev.makananFavorit,
                  bahasaKeseharian: bio?.profil_murid?.bahasa_keseharian || prev.bahasaKeseharian,
                  permainanOnline:
                    bio?.profil_murid?.permainan_online || games[0] || prev.permainanOnline,
                  permainanOffline:
                    bio?.profil_murid?.permainan_offline ||
                    games.slice(1).join(", ") ||
                    prev.permainanOffline,
                  kondisiOrtu: eko?.kondisi_orang_tua_wali || prev.kondisiOrtu,
                  ayahPekerjaan:
                    ortu?.ayah_dan_pekerjaan || eko?.ayah_dan_pekerjaan || prev.ayahPekerjaan,
                  ibuPekerjaan:
                    ortu?.ibu_dan_pekerjaan || eko?.ibu_dan_pekerjaan || prev.ibuPekerjaan,
                  penghasilanGabungan:
                    ortu?.penghasilan_gabungan ||
                    eko?.total_penghasilan_formatted ||
                    prev.penghasilanGabungan,
                  kontakOrtu:
                    ortu?.kontak_wa_orang_tua || eko?.kontak_orang_tua || prev.kontakOrtu,
                  bansos: {
                    kip:
                      bantuan?.kip ||
                      (eko?.kepemilikan_bantuan?.kip ? "Terdaftar" : "Tidak Terdaftar"),
                    pip:
                      bantuan?.pip ||
                      (eko?.kepemilikan_bantuan?.pip ? "Terdaftar" : "Tidak Terdaftar"),
                    pkh:
                      bantuan?.pkh ||
                      (eko?.kepemilikan_bantuan?.kps_pkh ? "Terdaftar" : "Tidak Terdaftar"),
                    kisBpjs:
                      bantuan?.kis_bpjs_kesehatan || prev.bansos?.kisBpjs || "Tidak Terdaftar",
                  },
                }
              : prev
          );
        }
      } catch {
        // Keep basic row info
      }
    }
  };

  const handleSaveData = async () => {
    if (!uploadedFile || !rawExcelFile) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", rawExcelFile);
      formData.append("jenis_import", importCategory);

      const importRes = await apiRequest<{
        message?: string;
        jenis_import?: string;
        berhasil_baru?: number;
        diperbarui?: number;
        berhasil?: number;
        gagal?: number;
      }>("/siswa/import", {
        method: "POST",
        body: formData,
      });

      const updatedList = await fetchStudentsFromBackend();
      const importedCount =
        (importRes?.berhasil_baru ?? 0) + (importRes?.diperbarui ?? 0) ||
        importRes?.berhasil ||
        updatedList.length;

      setUploadedFile((prev) =>
        prev
          ? {
              ...prev,
              readCount: importedCount,
              status: "Tersimpan",
            }
          : null
      );
      const jenisLabel =
        importRes?.jenis_import === "nilai_rapor"
          ? "Nilai Rapor"
          : importRes?.jenis_import === "asesmen"
          ? "Asesmen RIASEC & MI"
          : "Biodata Siswa";
      setToastMessage(
        `Sukses! Berkas ${jenisLabel} (${uploadedFile.name} — ${importedCount} baris) berhasil diimpor & diproses oleh RecommendationEngine.`
      );
    } catch (err) {
      setToastMessage(
        getErrorMessage(
          err,
          `Gagal mengimpor berkas ${uploadedFile.name}. Pastikan format kolom Excel sesuai.`
        )
      );
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-purple-200 border-t-[#5F089E] rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Memverifikasi hak akses Admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="b1-root min-h-screen bg-white flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900 text-[#1E1E1E]"
    >
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

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AdminB1Breadcrumb activeTab={activeTab} />
        <AdminB1Header activeTab={activeTab} />
        <AdminB1Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "Pusat Manajemen Data" ? (
          <>
            <AdminB1UploadSection
              uploadedFile={uploadedFile}
              onFileChange={setUploadedFile}
              onRawFileSelect={setRawExcelFile}
              importCategory={importCategory}
              onImportCategoryChange={setImportCategory}
              onSaveData={handleSaveData}
              isSaving={isSaving}
            />

            <AdminB1TableSection
              students={students}
              onSelectStudent={(s) => void handleSelectStudentDetail(s)}
            />
          </>
        ) : activeTab === "Mengelola Wali Kelas" ? (
          <AdminB1WaliKelasSection
            onShowToast={(msg) => {
              setToastMessage(msg);
              setTimeout(() => setToastMessage(null), 5000);
            }}
          />
        ) : (
          <AdminB1Subviews
            activeTab={activeTab}
            students={students}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
