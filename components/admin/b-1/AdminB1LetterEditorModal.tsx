import React, { useState, useEffect } from "react";
import {
  X,
  RotateCcw,
  Eye,
  Edit3,
  Save,
  Plus,
  Trash2,
  FileCheck,
  Building2,
} from "lucide-react";
import { RecommendationLetterData } from "./types";

interface AdminB1LetterEditorModalProps {
  isOpen: boolean;
  letterData: RecommendationLetterData;
  defaultData: RecommendationLetterData;
  onClose: () => void;
  onSave: (updatedData: RecommendationLetterData) => void;
  onReset: () => void;
}

export const AdminB1LetterEditorModal: React.FC<AdminB1LetterEditorModalProps> = ({
  isOpen,
  letterData,
  defaultData,
  onClose,
  onSave,
  onReset,
}) => {
  const [formData, setFormData] = useState<RecommendationLetterData>(letterData);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [newMapelInput, setNewMapelInput] = useState("");

  // Keep formData in sync when letterData changes
  useEffect(() => {
    setFormData(letterData);
  }, [letterData, isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (
    field: keyof RecommendationLetterData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleKeteranganChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.keterangan];
      updated[index] = value;
      return { ...prev, keterangan: updated };
    });
  };

  const handleAddKeterangan = () => {
    setFormData((prev) => ({
      ...prev,
      keterangan: [...prev.keterangan, ""],
    }));
  };

  const handleRemoveKeterangan = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keterangan: prev.keterangan.filter((_, i) => i !== index),
    }));
  };

  const handleAddMapel = () => {
    if (!newMapelInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      mataPelajaran: [...prev.mataPelajaran, newMapelInput.trim()],
    }));
    setNewMapelInput("");
  };

  const handleRemoveMapel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mataPelajaran: prev.mataPelajaran.filter((_, i) => i !== index),
    }));
  };

  const handleFormReset = () => {
    setFormData(defaultData);
    onReset();
  };

  const handleFormSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#5F089E] flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Edit Surat Rekomendasi
              </h2>
              <p className="text-xs text-slate-500">
                Sesuaikan isi surat rekomendasi, mata pelajaran pilihan, dan penandatangan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher (Edit vs Preview) for Mobile/Desktop */}
            <div className="flex items-center p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "edit"
                    ? "bg-white text-[#5F089E] shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Formulir</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-white text-[#5F089E] shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Langsung</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view or tabbed view */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30">
          {activeTab === "edit" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Section 1: Administrasi Surat & Identitas */}
              <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5F089E]" />
                    Nomor &amp; Tanggal Surat
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">
                      Nomor Surat
                    </label>
                    <input
                      type="text"
                      value={formData.nomorSurat}
                      onChange={(e) =>
                        handleFieldChange("nomorSurat", e.target.value)
                      }
                      className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#5F089E]"
                      placeholder="421.3/102/SMAN8/2026"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">
                      Tanggal Surat
                    </label>
                    <input
                      type="text"
                      value={formData.tanggalSurat}
                      onChange={(e) =>
                        handleFieldChange("tanggalSurat", e.target.value)
                      }
                      className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#5F089E]"
                      placeholder="12 Mei 2026"
                    />
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-2 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5F089E]" />
                    Identitas Siswa
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">
                      Nama Lengkap Siswa
                    </label>
                    <input
                      type="text"
                      value={formData.namaSiswa}
                      onChange={(e) =>
                        handleFieldChange("namaSiswa", e.target.value)
                      }
                      className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#5F089E]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">
                        NISN
                      </label>
                      <input
                        type="text"
                        value={formData.nisn}
                        onChange={(e) => handleFieldChange("nisn", e.target.value)}
                        className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#5F089E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">
                        Kelas
                      </label>
                      <input
                        type="text"
                        value={formData.kelas}
                        onChange={(e) => handleFieldChange("kelas", e.target.value)}
                        className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#5F089E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-2 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5F089E]" />
                    Mata Pelajaran Pilihan
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.mataPelajaran.map((mapel, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-[#5F089E] text-xs font-semibold border border-purple-100"
                      >
                        <span>{mapel}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMapel(idx)}
                          className="hover:text-rose-600 font-bold ml-1 cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newMapelInput}
                      onChange={(e) => setNewMapelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMapel();
                        }
                      }}
                      placeholder="Tambah mata pelajaran..."
                      className="flex-1 text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#5F089E]"
                    />
                    <button
                      type="button"
                      onClick={handleAddMapel}
                      className="px-3.5 py-2 bg-purple-100 hover:bg-purple-200 text-[#5F089E] rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Section 2: Isi Rekomendasi, Paragraf Keterangan & Penandatangan */}
              <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5F089E]" />
                    Bagian Pembuka Surat
                  </h3>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={formData.pembuka}
                    onChange={(e) =>
                      handleFieldChange("pembuka", e.target.value)
                    }
                    className="w-full text-xs font-normal border border-slate-200 rounded-xl p-3 outline-none focus:border-[#5F089E] leading-relaxed"
                  />
                </div>

                <div className="border-b border-slate-100 pb-2 pt-1 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5F089E]" />
                    Keterangan &amp; Penegasan (Isi &amp; Penutup)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddKeterangan}
                    className="text-xs font-semibold text-[#5F089E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Tambah Paragraf
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.keterangan.map((paragraf, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Paragraf {idx + 1}
                        </span>
                        {formData.keterangan.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveKeterangan(idx)}
                            className="text-slate-400 hover:text-rose-600 text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Hapus
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        value={paragraf}
                        onChange={(e) =>
                          handleKeteranganChange(idx, e.target.value)
                        }
                        className="w-full text-xs font-normal border border-slate-200 rounded-xl p-3 outline-none focus:border-[#5F089E] leading-relaxed"
                      />
                    </div>
                  ))}
                </div>

                <div className="border-b border-slate-100 pb-2 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5F089E]" />
                    Penandatangan (Guru BK / Koordinator)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={formData.jabatanPenandatangan}
                      onChange={(e) =>
                        handleFieldChange("jabatanPenandatangan", e.target.value)
                      }
                      className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#5F089E]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">
                      Nama Lengkap &amp; Gelar
                    </label>
                    <input
                      type="text"
                      value={formData.namaPenandatangan}
                      onChange={(e) =>
                        handleFieldChange("namaPenandatangan", e.target.value)
                      }
                      className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#5F089E]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">
                      NIP
                    </label>
                    <input
                      type="text"
                      value={formData.nipPenandatangan}
                      onChange={(e) =>
                        handleFieldChange("nipPenandatangan", e.target.value)
                      }
                      className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#5F089E]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Live Preview Mode */
            <div className="bg-white border border-purple-100 rounded-2xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-6">
              {/* Kop Surat */}
              <div className="text-center space-y-0.5 pb-2 border-b border-slate-900/10">
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

              {/* Title & Nomor */}
              <div className="text-center space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide underline underline-offset-4">
                  SURAT REKOMENDASI PEMINATAN
                </h3>
                <p className="text-xs text-slate-600 font-mono">
                  Nomor: {formData.nomorSurat}
                </p>
              </div>

              {/* Pembuka */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                {formData.pembuka}
              </p>

              {/* Student Metadata */}
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-900 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-3 sm:col-span-2 text-slate-500">Nama Lengkap</span>
                  <span className="col-span-9 sm:col-span-10 font-semibold">: {formData.namaSiswa}</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-3 sm:col-span-2 text-slate-500">NISN</span>
                  <span className="col-span-9 sm:col-span-10 font-medium font-mono">: {formData.nisn}</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-3 sm:col-span-2 text-slate-500">Kelas</span>
                  <span className="col-span-9 sm:col-span-10 font-semibold">: {formData.kelas}</span>
                </div>
              </div>

              {/* Paket Mata Pelajaran Pilihan */}
              <div className="space-y-2 pt-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Paket Mata Pelajaran Pilihan:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.mataPelajaran.map((mapel, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-50 text-[#5F089E] text-xs font-semibold border border-purple-100"
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
                  {formData.keterangan.map((paragraf, idx) => (
                    <p key={idx}>{paragraf}</p>
                  ))}
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-4 flex flex-col items-end text-xs sm:text-sm text-slate-900">
                <div className="text-left w-64 space-y-1">
                  <p>Malang, {formData.tanggalSurat}</p>
                  <p className="font-semibold">{formData.jabatanPenandatangan}</p>
                  <div className="h-16 flex items-center">
                    <span className="text-xs italic text-slate-400 font-serif">
                      (Telah Ditandatangani Secara Elektronik)
                    </span>
                  </div>
                  <p className="font-bold underline">{formData.namaPenandatangan}</p>
                  <p className="text-xs text-slate-500">NIP: {formData.nipPenandatangan}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <button
            type="button"
            onClick={handleFormReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Asli</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleFormSave}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#5F089E] hover:bg-[#4d0680] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

