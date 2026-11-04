"use client";

import { useState, useEffect } from "react";
import {
  X,
  School,
  Award,
  CheckSquare,
  Square,
  Phone,
} from "lucide-react";
import { AlumniItem, KategoriPerguruanTinggi } from "./types";
import {
  KELAS_OPTIONS, JENIS_KAMPUS_OPTIONS, PILIHAN_OPTIONS,
  JALUR_OPTIONS, BEASISWA_OPTIONS, WHATSAPP_PATTERN,
  normalizePendataan, validatePendataan,
} from "@/lib/pendataan";
import { AVAILABLE_CERTIFICATES } from "./mockData";

interface AlumniFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alumniData: Omit<AlumniItem, "id">, editId?: string | null) => void | Promise<void>;
  initialData?: AlumniItem | null;
}

export default function AlumniFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AlumniFormModalProps) {
  const [formNama, setFormNama] = useState("");
  const [formNisn, setFormNisn] = useState("");
  const [formKelas, setFormKelas] = useState("");
  const [formNomorWa, setFormNomorWa] = useState("");
  const [formKampus, setFormKampus] = useState("Universitas Brawijaya");
  const [formJenisKampus, setFormJenisKampus] =
    useState<KategoriPerguruanTinggi>("Negeri");
  const [formJurusan, setFormJurusan] = useState("");
  const [formJalur, setFormJalur] = useState<string>("SNBP");
  const [formPilihanKe, setFormPilihanKe] = useState("1");
  const [formStatusPdss, setFormStatusPdss] = useState("Eligible");
  const [formStatusPenerimaan, setFormStatusPenerimaan] =
    useState("Lolos / Diterima");
  const [formJenjang, setFormJenjang] = useState("S1");
  const [formNilaiRapor, setFormNilaiRapor] = useState("92.80");
  const [formSkorUtbk, setFormSkorUtbk] = useState("");
  const [formSelectedCerts, setFormSelectedCerts] = useState<string[]>([]);
  const [formIsKipk, setFormIsKipk] = useState(false);
  const [formKampusKode, setFormKampusKode] = useState("");
  const [formJalurLainnya, setFormJalurLainnya] = useState("");
  const [formLembagaPenyalur, setFormLembagaPenyalur] = useState("");
  const [formPelamarKipk, setFormPelamarKipk] = useState<"YA" | "TIDAK" | "">("");
  const [formBeasiswa, setFormBeasiswa] = useState("");
  const [formBeasiswaLainnya, setFormBeasiswaLainnya] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [customCertInput, setCustomCertInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFormError("");
      setFormKampusKode(initialData?.kampusKode || "");
      setFormJalurLainnya(initialData?.jalurLainnya || "");
      setFormLembagaPenyalur(initialData?.lembagaPenyalur || "");
      setFormPelamarKipk(initialData?.pelamarKipk || "");
      setFormBeasiswa(initialData?.beasiswa || "");
      setFormBeasiswaLainnya(initialData?.beasiswaLainnya || "");
      if (initialData) {
        setFormNama((initialData.nama || "").toUpperCase());
        setFormNisn(initialData.nisn || "");
        setFormKelas(initialData.kelas || "XII MIPA 1");
        setFormNomorWa(initialData.nomorWa || "");
        setFormKampus((initialData.kampus || "").toUpperCase());
        setFormJenisKampus(initialData.jenisKampus === "Kedinasan" ? "Ikatan Dinas" : initialData.jenisKampus || "Negeri");
        setFormJurusan((initialData.jurusan || "").toUpperCase());
        setFormJalur(initialData.jalur || "SNBP");
        setFormPilihanKe(
          initialData.pilihanKe === "Tanpa Pilihan" ? "Tanpa Pilihan" : initialData.pilihanKe?.replace(/\D/g, "") || ""
        );
        setFormStatusPdss(initialData.statusPdss || "Eligible");
        setFormStatusPenerimaan(initialData.statusPenerimaan || "Lolos / Diterima");
        setFormJenjang(initialData.jenjang || "S1");
        setFormNilaiRapor(String(initialData.nilai || 90.0));
        setFormSkorUtbk(initialData.skorUtbk ? String(initialData.skorUtbk) : "");
        setFormSelectedCerts(initialData.sertifikat || []);
        setFormIsKipk(initialData.isKipk || false);
      } else {
        setFormNama("");
        setFormNisn("");
        setFormKelas("");
        setFormNomorWa("");
        setFormKampus("Universitas Brawijaya");
        setFormJenisKampus("Negeri");
        setFormJurusan("Teknik Informatika");
        setFormJalur("SNBP");
        setFormPilihanKe("1");
        setFormStatusPdss("Eligible");
        setFormStatusPenerimaan("Lolos / Diterima");
        setFormJenjang("S1");
        setFormNilaiRapor("92.80");
        setFormSkorUtbk("");
        setFormIsKipk(false);
        setFormSelectedCerts([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleToggleCert = (title: string) => {
    setFormSelectedCerts((prev) =>
      prev.includes(title) ? prev.filter((c) => c !== title) : [...prev, title]
    );
  };

  const handleAddCustomCert = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const trimmed = customCertInput.trim();

    if (trimmed !== "" && !formSelectedCerts.includes(trimmed)) {
      setFormSelectedCerts((prev) => [...prev, trimmed]);
      setCustomCertInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const campusName = formKampus.toUpperCase();
    let kampusKode = "PTN";
    if (campusName.includes("BRAWIJAYA")) kampusKode = "UB";
    else if (campusName.includes("TEKNOLOGI BANDUNG")) kampusKode = "ITB";
    else if (campusName.includes("GADJAH MADA")) kampusKode = "UGM";
    else if (campusName.includes("NEGERI MALANG")) kampusKode = "UM";
    else if (campusName.includes("ITS") || campusName.includes("SEPULUH NOPEMBER")) kampusKode = "ITS";
    else if (campusName.includes("AIRLANGGA")) kampusKode = "UNAIR";
    else if (campusName.includes("INDONESIA")) kampusKode = "UI";
    else if (campusName.includes("DIPONEGORO")) kampusKode = "UNDIP";
    else if (campusName.includes("STAN")) kampusKode = "STAN";
    else if (campusName.includes("TELKOM")) kampusKode = "TELKOM";
    else if (campusName.includes("NANYANG") || campusName.includes("NTU")) kampusKode = "NTU";

    const payload: Omit<AlumniItem, "id"> = normalizePendataan({
      ...initialData,
      nama: formNama,
      nisn: formNisn,
      kelas: formKelas,
      angkatan: initialData?.angkatan || "Alumni 2024",
      kampus: formKampus,
      kampusKode: formKampusKode.trim().toUpperCase() || kampusKode,
      jenisKampus: formJenisKampus,
      jurusan: formJurusan,
      jalur: formJalur,
      nomorWa: formNomorWa,
      pilihanKe: formPilihanKe,
      statusPdss: formStatusPdss,
      statusPenerimaan: formStatusPenerimaan,
      jenjang: formJenjang,
      nilai: parseFloat(formNilaiRapor) || 90.0,
      skorUtbk: formSkorUtbk ? parseFloat(formSkorUtbk) : null,
      sertifikat: formSelectedCerts,
      isKipk: formIsKipk,
      jalurLainnya: formJalurLainnya,
      lembagaPenyalur: formLembagaPenyalur,
      pelamarKipk: formPelamarKipk,
      beasiswa: formBeasiswa,
      beasiswaLainnya: formBeasiswaLainnya,
    });
    const error = validatePendataan({
      ...payload,
      kelas: payload.kelas || "",
      nomorWa: payload.nomorWa || "",
      jenisKampus: payload.jenisKampus || "",
      tahunLulus: Number(payload.angkatan.replace(/\D/g, "")),
      nilaiRapor: payload.nilai,
    });
    if (error) { setFormError(error); return; }

    setIsSaving(true);
    setFormError("");
    try {
      await onSave(payload, initialData ? initialData.id : null);
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Data gagal disimpan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-[#F8FAFC] rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="bg-white px-4 sm:px-8 py-4 sm:py-5 border-b border-slate-200/80">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                <span>Direktori Alumni</span>
                <span>•</span>
                <span>Data Kelulusan &amp; Tracer Siswa</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                {initialData ? "Edit Data Alumni" : "Tambah Data Alumni Baru"}
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Lengkapi informasi siswa, kelas, kampus, jalur masuk, serta riwayat sertifikat.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Modal */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* KOLOM KIRI: Data Profil & Pendaftaran PT */}
            <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm sm:text-base">
                <School className="w-5 h-5 text-blue-600" />
                <h3>Data Identitas &amp; Pendaftaran</h3>
              </div>

              {/* Nama Lengkap & NISN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Naysilla Salsa Ardiyati"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NISN Siswa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0054819283"
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>
              </div>

              {/* Kelas & Nomor WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas (KLS)
                  </label>
                  <select
                    required
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  >
                    <option value="">Pilih Kelas</option>
                    {formKelas && !KELAS_OPTIONS.includes(formKelas) && <option value={formKelas}>{formKelas} (data lama, pilih kelas terkini)</option>}
                    {KELAS_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      pattern={WHATSAPP_PATTERN}
                      title="Gunakan format 08xxx atau +628xxx tanpa spasi."
                      placeholder="081234567890"
                      value={formNomorWa}
                      onChange={(e) => setFormNomorWa(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>
                </div>
              </div>

              {/* Perguruan Tinggi & Kategori PT */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Perguruan Tinggi
                  </label>
                  <input type="text" required value={formKampus} onChange={(e) => setFormKampus(e.target.value.toUpperCase())} placeholder="Nama lengkap, contoh: UNIVERSITAS BRAWIJAYA" className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori PT
                  </label>
                  <select
                    value={formJenisKampus}
                    onChange={(e) =>
                      {
                        setFormJenisKampus(e.target.value as KategoriPerguruanTinggi);
                        if (e.target.value !== "Luar Negeri") setFormLembagaPenyalur("");
                      }
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  >
                    {JENIS_KAMPUS_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>
              </div>

              {/* Program Studi & Jenjang */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Program Studi / Jurusan (Nama Lengkap)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap, contoh: TEKNIK INFORMATIKA"
                    value={formJurusan}
                    onChange={(e) => setFormJurusan(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenjang
                  </label>
                  <select
                    value={formJenjang}
                    onChange={(e) => setFormJenjang(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  >
                    <option value="S1">S1</option>
                    <option value="D4">D4</option>
                    <option value="D3">D3</option>
                    <option value="B.Sc">B.Sc</option>
                  </select>
                </div>
              </div>

              {/* Jalur Seleksi, Pilihan Ke, Status PDSS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jalur Masuk
                  </label>
                  <select
                    value={formJalur}
                    onChange={(e) => { setFormJalur(e.target.value); if (e.target.value !== "Lainnya") setFormJalurLainnya(""); }}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  >
                    {JALUR_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilihan Ke- (PIL)
                  </label>
                  <select
                    value={formPilihanKe}
                    onChange={(e) => setFormPilihanKe(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  >
                    <option value="">Pilih Pilihan Ke</option>
                    {PILIHAN_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status PDSS
                  </label>
                  <select
                    value={formStatusPdss}
                    onChange={(e) => setFormStatusPdss(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  >
                    <option value="Eligible">Eligible (Siswa Kuota)</option>
                    <option value="Tidak">Tidak Eligible</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="edit-kampusKode" className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Kampus (Singkatan)
                </label>
                <input
                  id="edit-kampusKode"
                  type="text"

                  value={formKampusKode}
                  onChange={(e) => setFormKampusKode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>
              {formJalur === "Lainnya" && (
              <div>
                <label htmlFor="edit-jalurLainnya" className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Jalur Masuk Lainnya
                </label>
                <input
                  id="edit-jalurLainnya"
                  type="text"
                  required
                  value={formJalurLainnya}
                  onChange={(e) => setFormJalurLainnya(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>
              )}
              {formJenisKampus === "Luar Negeri" && (
              <div>
                <label htmlFor="edit-lembagaPenyalur" className="block text-xs font-bold text-slate-700 mb-1">
                  Lembaga Penyalur
                </label>
                <input
                  id="edit-lembagaPenyalur"
                  type="text"

                  value={formLembagaPenyalur}
                  onChange={(e) => setFormLembagaPenyalur(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>
              )}
              <div>
                <label htmlFor="edit-pelamarKipk" className="block text-xs font-bold text-slate-700 mb-1">Pelamar Bantuan KIP-K</label>
                <select
                  id="edit-pelamarKipk"
                  value={formPelamarKipk}
                  onChange={(e) => setFormPelamarKipk(e.target.value as "YA" | "TIDAK" | "")}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                >
                  <option value="">Pilih Pelamar Bantuan KIP-K</option>
                  <option value="YA">YA</option>
                  <option value="TIDAK">TIDAK</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-beasiswa" className="block text-xs font-bold text-slate-700 mb-1">Beasiswa</label>
                <select
                  id="edit-beasiswa"
                  value={formBeasiswa}
                  onChange={(e) => {
                    setFormBeasiswa(e.target.value);
                    if (e.target.value !== "Lainnya") setFormBeasiswaLainnya("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                >
                  <option value="">Pilih Beasiswa</option>
                  {BEASISWA_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              {formBeasiswa === "Lainnya" && (
              <div>
                <label htmlFor="edit-beasiswaLainnya" className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Beasiswa Lainnya
                </label>
                <input
                  id="edit-beasiswaLainnya"
                  type="text"
                  required
                  value={formBeasiswaLainnya}
                  onChange={(e) => setFormBeasiswaLainnya(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>
              )}
              <p className="text-xs text-slate-500">
                Beasiswa hanya mencatat bantuan yang sudah diterima, bukan yang baru didaftarkan.
              </p>

              {/* Rapor & KIP-K */}
              <div className="pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nilai Rata-Rata Rapor
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="92.80"
                      value={formNilaiRapor}
                      onChange={(e) => setFormNilaiRapor(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>

                  <div className="pt-4 sm:pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsKipk}
                        onChange={(e) => setFormIsKipk(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Penerima KIP-Kuliah (KIPK)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: Manajemen Sertifikat */}
            <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm sm:text-base">
                <Award className="w-5 h-5 text-amber-500" />
                <h3>Berkas Sertifikat Digunakan</h3>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {AVAILABLE_CERTIFICATES.map((cert) => {
                  const isChecked = formSelectedCerts.includes(cert.title);
                  return (
                    <div
                      key={cert.id}
                      onClick={() => handleToggleCert(cert.title)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                        isChecked
                          ? "bg-blue-50/70 border-blue-400 text-blue-900"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{cert.title}</p>
                        <span className="text-[10px] text-slate-500">
                          {cert.organizer}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tambah Sertifikat Kustom
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nama kejuaraan/organisasi..."
                    value={customCertInput}
                    onChange={(e) => setCustomCertInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCustomCert(e);
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCert}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>

          {formError && <p role="alert" className="text-xs text-slate-500">{formError}</p>}
          {/* Footer Modal Actions */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white font-bold text-xs shadow-md shadow-purple-900/15 transition-all cursor-pointer"
            >
              Simpan Data Alumni
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
