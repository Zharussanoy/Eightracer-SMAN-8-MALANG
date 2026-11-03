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
import { AlumniItem } from "./types";
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
    const timer = setTimeout(() => {
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
        {/* Header Modal */}
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
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Modal 2 Kolom Sesuai Desain */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* KOLOM KIRI: Data Pendaftaran PTN */}
            <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm sm:text-base">
                <School className="w-5 h-5 text-blue-600" />
                <h3>Data Pendaftaran PTN</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap Siswa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Kevin"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Perguruan Tinggi (PTN)
                </label>
                <select
                  value={formKampus}
                  onChange={(e) => setFormKampus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                >
                  <option value="Universitas Brawijaya">Universitas Brawijaya (UB)</option>
                  <option value="Institut Teknologi Sepuluh Nopember">Institut Teknologi Sepuluh Nopember (ITS)</option>
                  <option value="Universitas Gadjah Mada">Universitas Gadjah Mada (UGM)</option>
                  <option value="Institut Teknologi Bandung">Institut Teknologi Bandung (ITB)</option>
                  <option value="Universitas Negeri Malang">Universitas Negeri Malang (UM)</option>
                  <option value="Universitas Airlangga">Universitas Airlangga (UNAIR)</option>
                  <option value="Universitas Indonesia">Universitas Indonesia (UI)</option>
                  <option value="Universitas Diponegoro">Universitas Diponegoro (UNDIP)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Program Studi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Teknik Elektro"
                    value={formJurusan}
                    onChange={(e) => setFormJurusan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jalur Seleksi
                  </label>
                  <select
                    value={formJalur}
                    onChange={(e) => setFormJalur(e.target.value as "SNBP" | "SNBT" | "Mandiri")}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  >
                    <option value="SNBP">SNBP</option>
                    <option value="SNBT">SNBT</option>
                    <option value="Mandiri">Mandiri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilihan Ke-
                  </label>
                  <select
                    value={formPilihanKe}
                    onChange={(e) => setFormPilihanKe(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  >
                    <option value="Pilihan 1">Pilihan 1</option>
                    <option value="Pilihan 2">Pilihan 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status Penerimaan
                  </label>
                  <select
                    value={formStatusPenerimaan}
                    onChange={(e) => setFormStatusPenerimaan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  >
                    <option value="Lolos / Diterima">Lolos / Diterima</option>
                    <option value="Tidak Lolos">Tidak Lolos</option>
                  </select>
                </div>
              </div>

              {/* Rapor & Skor UTBK */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 pb-3 text-slate-900 font-bold text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h4>Nilai Akademik Penunjang</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Rata-Rata Nilai Rapor
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="92.80"
                      value={formNilaiRapor}
                      onChange={(e) => setFormNilaiRapor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Rata-rata semester 1 sampai 5
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Skor UTBK (Jika Ada)
                    </label>
                    <input
                      type="number"
                      placeholder="Kosongkan jika SNBP"
                      value={formSkorUtbk}
                      onChange={(e) => setFormSkorUtbk(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Opsional khusus pendaftar jalur SNBT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: Sertifikat Penunjang */}
            <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3>Sertifikat Penunjang</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {formSelectedCerts.length} Dipilih
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Pilih portofolio kejuaraan yang dilampirkan siswa saat mendaftar SNBP/Prestasi:
              </p>

              {/* Daftar Pilihan Sertifikat Checklist */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {AVAILABLE_CERTIFICATES.map((cert) => {
                  const isChecked = formSelectedCerts.includes(cert.title);
                  return (
                    <div
                      key={cert.id}
                      onClick={() => handleToggleCert(cert.title)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? "bg-blue-50/70 border-blue-300 text-blue-950"
                          : "bg-slate-50/60 hover:bg-slate-100/70 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="text-xs min-w-0">
                        <span className="font-bold block leading-snug">
                          {cert.title}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
                          {cert.organizer}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Certificates */}
                {formSelectedCerts
                  .filter(
                    (title) =>
                      !AVAILABLE_CERTIFICATES.some((c) => c.title === title)
                  )
                  .map((customTitle, idx) => (
                    <div
                      key={`custom-${idx}`}
                      onClick={() => handleToggleCert(customTitle)}
                      className="p-3 rounded-xl border bg-purple-50 border-purple-200 text-purple-900 text-left cursor-pointer transition-all flex items-start gap-3"
                    >
                      <div className="mt-0.5 shrink-0">
                        <CheckSquare className="w-4 h-4 text-[#5F089E]" />
                      </div>
                      <div className="text-xs min-w-0">
                        <span className="font-bold block leading-snug">
                          {customTitle}
                        </span>
                        <span className="text-[10px] text-purple-600 mt-0.5 block">
                          Sertifikat Tambahan (Kustom)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Input Tambah Sertifikat Baru */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik nama sertifikat lain..."
                  value={customCertInput}
                  onChange={(e) => setCustomCertInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCustomCert(e);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
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
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    formIsKipk
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
        </form>
      </div>
    </div>
  );
}
