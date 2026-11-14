"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  School,
  Building2,
  Award,
  Briefcase,
  CheckCircle2,
  Save,
} from "lucide-react";
import { AdminRole, B3Role } from "./types";
import { FormDataPendataan } from "@/types/user";
import { useUser } from "@/context/UserContext";
import {
  KELAS_OPTIONS, JENIS_KAMPUS_OPTIONS, PILIHAN_OPTIONS,
  JALUR_OPTIONS, BEASISWA_OPTIONS, WHATSAPP_PATTERN,
  normalizePendataan, validatePendataan, pendataanStorageKey,
} from "@/lib/pendataan";

interface AdminFormSectionProps {
  role?: AdminRole | B3Role;
  onSaveSuccess?: (data: FormDataPendataan) => void | Promise<void>;
}

const DEFAULT_B3_FORM: FormDataPendataan = {
  nisn: "0054819283",
  nama: "NAYSILLA SALSA ARDIYATI",
  kelas: "",
  nomorWa: "",
  jenisKampus: "",
  pilihanKe: "",
  lembagaPenyalur: "",
  jalurLainnya: "",
  pelamarKipk: "",
  beasiswa: "",
  beasiswaLainnya: "",
  angkatan: "Alumni 2024",
  tahunLulus: 2024,
  kampus: "UNIVERSITAS BRAWIJAYA",
  kampusKode: "UB",
  jurusan: "TEKNIK INFORMATIKA",
  jenjang: "S1",
  jalur: "SNBP",
  statusPenerimaan: "Lolos / Diterima",
  nilaiRapor: 94.5,
  skorUtbk: null,
  pekerjaan: "Mahasiswa Aktif & Praktisi IT",
  isKipk: true,
  sertifikat: [
    "Juara 1 Olimpiade Sains & Informatika Tingkat Provinsi",
    "Finalis National Logic & Programming Competition",
  ],
};

export default function AdminFormSection({
  role = "alumni",
  onSaveSuccess,
}: AdminFormSectionProps) {
  // Hooks MUST be declared unconditionally at top level
  const [formState, setFormState] = useState<FormDataPendataan>(DEFAULT_B3_FORM);
  const [toastSuccess, setToastSuccess] = useState(false);

  const { currentUser } = useUser();
  const storageKey = pendataanStorageKey(currentUser.id);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(false);
      setToastSuccess(false);
      setFormError("");
      try {
        const saved = localStorage.getItem(storageKey);
        const parsed = saved ? JSON.parse(saved) : null;
        setFormState(normalizePendataan({ ...DEFAULT_B3_FORM, ...parsed }));
      } catch {
        setFormState(DEFAULT_B3_FORM);
        setFormError("Data lokal tidak dapat dimuat. Periksa izin penyimpanan browser.");
      }
      setIsReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [storageKey]);

  // Jika bukan role alumni atau admin, jangan tampilkan formulir
  if (role !== "alumni" && role !== "admin") {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
        <p className="text-slate-500 text-sm">
          Formulir Pendataan hanya dapat diakses oleh Alumni atau Admin.
        </p>
      </div>
    );
  }

  const handleFieldChange = (
    field: keyof FormDataPendataan,
    val: string | number | boolean | null
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: typeof val === "string" && ["nama", "kampus", "jurusan"].includes(field) ? val.toUpperCase() : val,
      ...(field === "jenisKampus" && val !== "Luar Negeri" ? { lembagaPenyalur: "" } : {}),
      ...(field === "jalur" && val !== "Lainnya" ? { jalurLainnya: "" } : {}),
      ...(field === "beasiswa" && val !== "Lainnya" ? { beasiswaLainnya: "" } : {}),
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastSuccess(false);
    const payload = normalizePendataan(formState);
    const error = validatePendataan(payload);
    if (error) { setFormError(error); return; }
    setIsSaving(true);
    setFormError("");
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      if (onSaveSuccess) await onSaveSuccess(payload);
      setFormState(payload);
      setToastSuccess(true);
      setTimeout(() => setToastSuccess(false), 3000);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Data gagal disimpan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-9 shadow-sm border border-slate-200/80 space-y-6">
      {/* Header Form */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#5F089E] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Formulir Pendataan Alumni
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pendataan terpadu riwayat kelolosan perguruan tinggi, nilai rapor, dan jenjang studi alumni SMAN 8 Malang (Fitur B3).
          </p>
        </div>
      </div>

      {/* Alert Toast Sukses Simpan */}
      {toastSuccess && (
        <div className="p-4 rounded-2xl bg-purple-700 text-white flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>Data pendataan alumni berhasil disimpan di browser ini!</span>
          </div>
        </div>
      )}

      {formError && <p role="alert" className="text-xs text-slate-500">{formError}</p>}

      {/* ================= FORM BODY ================= */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Bagian 1: Identitas Alumni */}
        <div>
          <h3 className="text-xs font-black uppercase text-purple-800 tracking-wider mb-3 flex items-center gap-1.5">
            <School className="w-4 h-4" />
            1. Data Identitas &amp; Kelulusan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                NISN
              </label>
              <input
                type="text"
                required
                value={formState.nisn}
                onChange={(e) => handleFieldChange("nisn", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap Siswa / Alumni
              </label>
              <input
                type="text"
                required
                value={formState.nama}
                onChange={(e) => handleFieldChange("nama", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Angkatan Kelulusan
              </label>
              <select
                value={formState.angkatan}
                onChange={(e) => {
                  const angk = e.target.value;
                  handleFieldChange("angkatan", angk);
                  const yr = parseInt(angk.replace(/\D/g, "")) || 2024;
                  handleFieldChange("tahunLulus", yr);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              >
                <option value="Alumni 2024">Alumni 2024</option>
                <option value="Alumni 2023">Alumni 2023</option>
                <option value="Alumni 2022">Alumni 2022</option>
                <option value="Alumni 2021">Alumni 2021</option>
              </select>
            </div>
            <div>
              <label htmlFor="b3-kelas" className="block text-xs font-bold text-slate-700 mb-1.5">Kelas</label>
              <select id="b3-kelas"
                value={formState.kelas || ""}
                onChange={(e) => handleFieldChange("kelas", e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15">
                <option value="">Pilih Kelas</option>
                {KELAS_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="b3-nomorWa" className="block text-xs font-bold text-slate-700 mb-1.5">Nomor WhatsApp Aktif</label>
              <input id="b3-nomorWa"
                value={formState.nomorWa || ""}
                onChange={(e) => handleFieldChange("nomorWa", e.target.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                pattern={WHATSAPP_PATTERN}
                placeholder="08xxx atau +628xxx"
                title="Gunakan 08 atau +628 diikuti 8-11 digit, tanpa spasi atau tanda hubung."
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15" />
            </div>
          </div>
        </div>

        {/* Bagian 2: Perguruan Tinggi & Kelolosan */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase text-purple-800 tracking-wider mb-3 flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            2. Data Perguruan Tinggi &amp; Kelolosan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Perguruan Tinggi (Nama Lengkap)
              </label>
              <input
                type="text"
                required
                placeholder="Nama lengkap, contoh: UNIVERSITAS BRAWIJAYA"
                value={formState.kampus}
                onChange={(e) => handleFieldChange("kampus", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kode Kampus (Singkatan)
              </label>
              <input
                type="text"
                value={formState.kampusKode}
                onChange={(e) => handleFieldChange("kampusKode", e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jenjang Studi
              </label>
              <select
                value={formState.jenjang}
                onChange={(e) => handleFieldChange("jenjang", e.target.value as "S1" | "D4" | "D3")}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              >
                <option value="S1">S1 (Sarjana)</option>
                <option value="D4">D4 (Sarjana Terapan)</option>
                <option value="D3">D3 (Diploma Tiga)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Program Studi / Jurusan (Nama Lengkap)
              </label>
              <input
                type="text"
                required
                placeholder="Nama lengkap, contoh: TEKNIK INFORMATIKA"
                value={formState.jurusan}
                onChange={(e) => handleFieldChange("jurusan", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jalur Masuk
              </label>
              <select
                value={formState.jalur}
                onChange={(e) => handleFieldChange("jalur", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              >
                {JALUR_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status Penerimaan
              </label>
              <input
                type="text"
                value={formState.statusPenerimaan}
                onChange={(e) => handleFieldChange("statusPenerimaan", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>
            <div>
              <label htmlFor="b3-jenisKampus" className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Perguruan Tinggi</label>
              <select id="b3-jenisKampus"
                value={formState.jenisKampus || ""}
                onChange={(e) => handleFieldChange("jenisKampus", e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15">
                <option value="">Pilih Jenis Perguruan Tinggi</option>
                {JENIS_KAMPUS_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="b3-pilihanKe" className="block text-xs font-bold text-slate-700 mb-1.5">Pilihan Ke</label>
              <select id="b3-pilihanKe"
                value={formState.pilihanKe || ""}
                onChange={(e) => handleFieldChange("pilihanKe", e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15">
                <option value="">Pilih Pilihan Ke</option>
                {PILIHAN_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            {formState.jalur === "Lainnya" && (
              <div>
              <label htmlFor="b3-jalurLainnya" className="block text-xs font-bold text-slate-700 mb-1.5">Nama Jalur Masuk Lainnya</label>
              <input id="b3-jalurLainnya"
                value={formState.jalurLainnya || ""}
                onChange={(e) => handleFieldChange("jalurLainnya", e.target.value)}
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15" />
            </div>
            )}
            {formState.jenisKampus === "Luar Negeri" && (
              <div>
              <label htmlFor="b3-lembagaPenyalur" className="block text-xs font-bold text-slate-700 mb-1.5">Lembaga Penyalur</label>
              <input id="b3-lembagaPenyalur"
                value={formState.lembagaPenyalur || ""}
                onChange={(e) => handleFieldChange("lembagaPenyalur", e.target.value)}
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15" />
            </div>
            )}
          </div>
        </div>

        {/* Bagian 3: Nilai Akademik & Prestasi */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase text-purple-800 tracking-wider mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            3. Nilai Rapor &amp; Skor UTBK
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rata-rata Nilai Rapor (Sem 1 - 5)
              </label>
              <input
                type="number"
                step="0.1"
                value={formState.nilaiRapor}
                onChange={(e) => handleFieldChange("nilaiRapor", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Skor UTBK (Jika Ada / SNBT)
              </label>
              <input
                type="number"
                placeholder="Kosongkan jika SNBP"
                value={formState.skorUtbk ?? ""}
                onChange={(e) =>
                  handleFieldChange(
                    "skorUtbk",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Penerima KIP-Kuliah
              </label>
              <select
                value={formState.isKipk ? "ya" : "tidak"}
                onChange={(e) => handleFieldChange("isKipk", e.target.value === "ya")}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
              >
                <option value="ya">Ya (Penerima KIP-Kuliah)</option>
                <option value="tidak">Tidak</option>
              </select>
            </div>
            <div>
              <label htmlFor="b3-pelamarKipk" className="block text-xs font-bold text-slate-700 mb-1.5">Pelamar Bantuan KIP-K</label>
              <select id="b3-pelamarKipk"
                value={formState.pelamarKipk || ""}
                onChange={(e) => handleFieldChange("pelamarKipk", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15">
                <option value="">Pilih Pelamar Bantuan KIP-K</option>
                {["YA", "TIDAK"].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="b3-beasiswa" className="block text-xs font-bold text-slate-700 mb-1.5">Beasiswa</label>
              <select id="b3-beasiswa"
                value={formState.beasiswa || ""}
                onChange={(e) => handleFieldChange("beasiswa", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15">
                <option value="">Pilih Beasiswa</option>
                {BEASISWA_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            {formState.beasiswa === "Lainnya" && (
              <div>
              <label htmlFor="b3-beasiswaLainnya" className="block text-xs font-bold text-slate-700 mb-1.5">Nama Beasiswa Lainnya</label>
              <input id="b3-beasiswaLainnya"
                value={formState.beasiswaLainnya || ""}
                onChange={(e) => handleFieldChange("beasiswaLainnya", e.target.value)}
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15" />
            </div>
            )}
            <p className="text-xs text-slate-500">Beasiswa hanya mencatat bantuan yang sudah diterima, bukan yang baru didaftarkan.</p>
          </div>
        </div>

        {/* Bagian 4: Karir / Pekerjaan Terkini */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase text-purple-800 tracking-wider mb-3 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            4. Perkembangan Karir &amp; Pekerjaan Saat Ini
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Aktivitas / Karir Terkini (Khusus Alumni)
            </label>
            <input
              type="text"
              placeholder="Contoh: Mahasiswa Aktif, Software Engineer, Data Scientist, dll"
              value={formState.pekerjaan || ""}
              onChange={(e) => handleFieldChange("pekerjaan", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15"
            />
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving || !isReady}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#5F089E] hover:bg-[#4d0680] text-white transition-all shadow-md shadow-purple-950/15 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Data Pendataan</span>
          </button>
        </div>
      </form>
    </section>
  );
}
