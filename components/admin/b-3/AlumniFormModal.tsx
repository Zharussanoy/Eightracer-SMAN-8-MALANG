"use client";

import { useState, useEffect } from "react";
import {
  X,
  School,
  TrendingUp,
  Award,
  Check,
  CheckSquare,
  Square,
} from "lucide-react";
import { AlumniItem, CertificateItem } from "@/components/admin/types";
import { AVAILABLE_CERTIFICATES } from "./mockData";

interface AlumniFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alumniData: Omit<AlumniItem, "id">, editId?: string | null) => void;
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
  const [formKampus, setFormKampus] = useState("Universitas Gadjah Mada");
  const [formJurusan, setFormJurusan] = useState("");
  const [formJalur, setFormJalur] = useState<"SNBP" | "SNBT" | "Mandiri">("SNBP");
  const [formPilihanKe, setFormPilihanKe] = useState("Pilihan 1");
  const [formStatusPenerimaan, setFormStatusPenerimaan] = useState("Lolos / Diterima");
  const [formJenjang, setFormJenjang] = useState("S1");
  const [formNilaiRapor, setFormNilaiRapor] = useState("92.80");
  const [formSkorUtbk, setFormSkorUtbk] = useState("");
  const [formSelectedCerts, setFormSelectedCerts] = useState<string[]>([]);
  const [formIsKipk, setFormIsKipk] = useState(false);
  const [customCertInput, setCustomCertInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormNama(initialData.nama);
      setFormNisn(initialData.nisn);
      setFormKampus(initialData.kampus);
      setFormJurusan(initialData.jurusan);
      setFormJalur(initialData.jalur);
      setFormPilihanKe(initialData.pilihanKe || "Pilihan 1");
      setFormStatusPenerimaan(initialData.statusPenerimaan || "Lolos / Diterima");
      setFormJenjang(initialData.jenjang || "S1");
      setFormNilaiRapor(String(initialData.nilai));
      setFormSkorUtbk(initialData.skorUtbk ? String(initialData.skorUtbk) : "");
      setFormSelectedCerts(initialData.sertifikat || []);
      setFormIsKipk(initialData.isKipk || false);
    } else {
      setFormNama("");
      setFormNisn("");
      setFormKampus("Universitas Brawijaya");
      setFormJurusan("Kedokteran");
      setFormJalur("SNBP");
      setFormPilihanKe("Pilihan 1");
      setFormStatusPenerimaan("Lolos / Diterima");
      setFormJenjang("S1");
      setFormNilaiRapor("92.80");
      setFormSkorUtbk("");
      setFormIsKipk(false);
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let kampusKode = "PTN";
    if (formKampus.includes("Brawijaya")) kampusKode = "UB";
    else if (formKampus.includes("Teknologi Bandung")) kampusKode = "ITB";
    else if (formKampus.includes("Gadjah Mada")) kampusKode = "UGM";
    else if (formKampus.includes("Negeri Malang")) kampusKode = "UM";
    else if (formKampus.includes("ITS")) kampusKode = "ITS";
    else if (formKampus.includes("Airlangga")) kampusKode = "UNAIR";
    else if (formKampus.includes("Indonesia")) kampusKode = "UI";
    else if (formKampus.includes("Diponegoro")) kampusKode = "UNDIP";

    const payload: Omit<AlumniItem, "id"> = {
      nama: formNama || "Alumni Smarihasta",
      nisn: formNisn || "005" + Math.floor(1000000 + Math.random() * 9000000),
      angkatan: "Alumni 2024",
      kampus: formKampus,
      kampusKode,
      jurusan: formJurusan || "Program Studi",
      jalur: formJalur,
      pilihanKe: formPilihanKe,
      statusPenerimaan: formStatusPenerimaan,
      jenjang: formJenjang,
      nilai: parseFloat(formNilaiRapor) || 90.0,
      skorUtbk: formSkorUtbk ? parseFloat(formSkorUtbk) : null,
      sertifikat: formSelectedCerts,
      isKipk: formIsKipk,
    };

    onSave(payload, initialData ? initialData.id : null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-[#F8FAFC] rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal Sesuai Gambar 2 */}
        <div className="bg-white px-4 sm:px-8 py-4 sm:py-5 border-b border-slate-200/80">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                <span>Study Tracer</span>
                <span>•</span>
                <span>Data Pendaftaran PTN</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                {initialData ? "Edit Data Alumni" : "Form Study Tracer & Sertifikat"}
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Lengkapi riwayat pendaftaran perguruan tinggi dan sertifikat yang digunakan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                Profil: {formNama || "Data Siswa"}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Data Pendaftaran Perguruan Tinggi
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Informasi tujuan dan hasil seleksi
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                  Langkah 1 dari 2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Siswa / Alumni *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Nama lengkap alumni"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    NISN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    placeholder="Nomor Induk Siswa Nasional"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Perguruan Tinggi *
                  </label>
                  <select
                    value={formKampus}
                    onChange={(e) => setFormKampus(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  >
                    <option value="Universitas Gadjah Mada">Universitas Gadjah Mada</option>
                    <option value="Universitas Brawijaya">Universitas Brawijaya</option>
                    <option value="Institut Teknologi Bandung">Institut Teknologi Bandung</option>
                    <option value="Universitas Negeri Malang">Universitas Negeri Malang</option>
                    <option value="ITS Surabaya">ITS Surabaya</option>
                    <option value="Universitas Airlangga">Universitas Airlangga</option>
                    <option value="Universitas Indonesia">Universitas Indonesia</option>
                    <option value="Universitas Diponegoro">Universitas Diponegoro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Program Studi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formJurusan}
                    onChange={(e) => setFormJurusan(e.target.value)}
                    placeholder="e.g. Kedokteran"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jalur Pendaftaran *
                  </label>
                  <select
                    value={formJalur}
                    onChange={(e) => setFormJalur(e.target.value as "SNBP" | "SNBT" | "Mandiri")}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  >
                    <option value="SNBP">SNBP</option>
                    <option value="SNBT">SNBT</option>
                    <option value="Mandiri">Mandiri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilihan Ke *
                  </label>
                  <select
                    value={formPilihanKe}
                    onChange={(e) => setFormPilihanKe(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  >
                    <option value="Pilihan 1">Pilihan 1</option>
                    <option value="Pilihan 2">Pilihan 2</option>
                    <option value="Pilihan 3">Pilihan 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status Penerimaan *
                  </label>
                  <select
                    value={formStatusPenerimaan}
                    onChange={(e) => setFormStatusPenerimaan(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  >
                    <option value="Lolos / Diterima">Lolos / Diterima</option>
                    <option value="Tidak Lolos">Tidak Lolos</option>
                    <option value="Cadangan">Cadangan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jenjang *
                  </label>
                  <select
                    value={formJenjang}
                    onChange={(e) => setFormJenjang(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  >
                    <option value="S1">S1</option>
                    <option value="D4">D4</option>
                    <option value="D3">D3</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5F089E] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Nilai Pendaftaran
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Isi nilai yang digunakan pada jalur pilihan
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rata-rata Nilai Rapor *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formNilaiRapor}
                    onChange={(e) => setFormNilaiRapor(e.target.value)}
                    placeholder="92.80"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Gunakan skala nilai 0-100
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Skor UTBK (opsional)
                  </label>
                  <input
                    type="number"
                    value={formSkorUtbk}
                    onChange={(e) => setFormSkorUtbk(e.target.value)}
                    placeholder={formJalur === "SNBP" ? "Tidak digunakan pada jalur SNBP" : "Contoh: 685"}
                    disabled={formJalur === "SNBP"}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-50"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Wajib untuk jalur SNBT
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Sertifikat Prestasi
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pilih sertifikat yang digunakan
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {AVAILABLE_CERTIFICATES.map((cert) => {
                  const isChecked = formSelectedCerts.includes(cert.title);
                  return (
                    <div
                      key={cert.id}
                      onClick={() => handleToggleCert(cert.title)}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${isChecked
                        ? "bg-blue-50/70 border-blue-400 text-blue-900 shadow-2xs"
                        : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 text-slate-700"
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
                        <span className="text-xs font-bold block leading-snug">
                          {cert.title}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {cert.organizer}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {formSelectedCerts
                .filter((certTitle) => !AVAILABLE_CERTIFICATES.some((ac) => ac.title === certTitle))
                .map((customTitle, idx) => (
                  <div
                    key={`custom-${idx}`}
                    onClick={() => handleToggleCert(customTitle)}
                    className="p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all bg-blue-50/70 border-blue-400 text-blue-900 shadow-2xs mt-2.5"
                  >
                    <div className="mt-0.5">
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold block leading-snug">{customTitle}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Sertifikat Tambahan</span>
                    </div>
                  </div>
                ))}

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  value={customCertInput}
                  onChange={(e) => setCustomCertInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCustomCert(e);
                  }}
                  placeholder="Ketik sertifikat lain (ex: Juara 1 FLS2N)"
                  className="flex-1 px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCert}
                  disabled={!customCertInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 text-xs font-bold border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Tambah
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label
                  onClick={() => setFormIsKipk(!formIsKipk)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${formIsKipk
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                >
                  {formIsKipk ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <span className="text-xs font-bold block">
                      Penerima Beasiswa KIP-Kuliah (KIP-K)
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Tandai jika siswa mendaftar dengan skema KIP-K
                    </span>
                  </div>
                </label>
              </div>

              <span className="text-[10px] text-slate-400 block leading-relaxed italic">
                Pemilihan sertifikat bersifat opsional. Sertifikat yang dicentang akan ditautkan ke riwayat pendaftaran ini.
              </span>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Simpan Data</span>
              </button>
            </div>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}
