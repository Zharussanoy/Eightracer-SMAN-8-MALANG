"use client";

import { useEffect, useState, useRef } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  GraduationCap,
  Sparkles,
  X,
  Upload,
  Save,
  LogIn,
  School,
  ShieldCheck,
  Check,
  Copy,
} from "lucide-react";
import { WaliKelasItem, KelasTersediaItem } from "./types";

interface AdminB1WaliKelasSectionProps {
  onShowToast?: (message: string) => void;
}

interface ApiResponseWaliKelas {
  judul?: string;
  subjudul?: string;
  ringkasan?: {
    total_wali_kelas?: number;
    total_kelas?: number;
    kelas_terisi?: number;
    kelas_kosong?: number;
  };
  total?: number;
  data?: WaliKelasItem[];
  daftar_kelas_tersedia?: KelasTersediaItem[];
}

export default function AdminB1WaliKelasSection({
  onShowToast,
}: AdminB1WaliKelasSectionProps) {
  const [waliKelasList, setWaliKelasList] = useState<WaliKelasItem[]>([]);
  const [kelasOptions, setKelasOptions] = useState<KelasTersediaItem[]>([]);
  const [ringkasan, setRingkasan] = useState({
    total_wali_kelas: 0,
    total_kelas: 0,
    kelas_terisi: 0,
    kelas_kosong: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingGuruId, setEditingGuruId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalErrorMessage, setModalErrorMessage] = useState<string>("");

  // Delete Confirm Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingWali, setDeletingWali] = useState<WaliKelasItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nip: "",
    kelas_id: "",
    password: "",
  });
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isDeletePhoto, setIsDeletePhoto] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copied username toast
  const [copiedNip, setCopiedNip] = useState<string | null>(null);

  const fetchWaliKelas = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<ApiResponseWaliKelas>("/admin/wali-kelas");
      if (res) {
        setWaliKelasList(res.data || []);
        setKelasOptions(res.daftar_kelas_tersedia || []);
        if (res.ringkasan) {
          setRingkasan({
            total_wali_kelas: res.ringkasan.total_wali_kelas ?? 0,
            total_kelas: res.ringkasan.total_kelas ?? 0,
            kelas_terisi: res.ringkasan.kelas_terisi ?? 0,
            kelas_kosong: res.ringkasan.kelas_kosong ?? 0,
          });
        }
      }
    } catch (err) {
      console.error("Gagal memuat data wali kelas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchWaliKelas();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingGuruId(null);
    setFormData({
      nama_lengkap: "",
      nip: "",
      kelas_id: kelasOptions.length > 0 ? String(kelasOptions[0].id) : "",
      password: "",
    });
    setPreviewPhotoUrl(null);
    setSelectedPhotoFile(null);
    setIsDeletePhoto(false);
    setModalErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: WaliKelasItem) => {
    setIsEditMode(true);
    setEditingGuruId(item.id);
    setFormData({
      nama_lengkap: item.nama_lengkap,
      nip: item.nip,
      kelas_id: item.kelas_id ? String(item.kelas_id) : "",
      password: "",
    });
    setPreviewPhotoUrl(item.foto_profil_url || null);
    setSelectedPhotoFile(null);
    setIsDeletePhoto(false);
    setModalErrorMessage("");
    setIsModalOpen(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setModalErrorMessage("Ukuran berkas foto maksimal 2MB.");
        return;
      }
      setSelectedPhotoFile(file);
      setPreviewPhotoUrl(URL.createObjectURL(file));
      setIsDeletePhoto(false);
      setModalErrorMessage("");
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhotoFile(null);
    setPreviewPhotoUrl(null);
    setIsDeletePhoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrorMessage("");

    if (!formData.nama_lengkap.trim()) {
      setModalErrorMessage("Nama Lengkap Wali Kelas wajib diisi.");
      return;
    }
    if (!formData.nip.trim()) {
      setModalErrorMessage("Nomor Induk Pegawai (NIP) wajib diisi.");
      return;
    }
    if (!formData.kelas_id) {
      setModalErrorMessage("Silakan pilih kelas yang diampu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append("nama_lengkap", formData.nama_lengkap.trim());
      body.append("nip", formData.nip.trim());
      body.append("kelas_id", formData.kelas_id);
      if (formData.password.trim()) {
        body.append("password", formData.password.trim());
      }
      if (selectedPhotoFile) {
        body.append("foto_profil", selectedPhotoFile);
      }
      if (isDeletePhoto) {
        body.append("hapus_foto", "1");
      }

      if (isEditMode && editingGuruId) {
        await apiRequest(`/admin/wali-kelas/${editingGuruId}`, {
          method: "POST", // Laravel accepts POST with _method or standard PUT, using POST for FormData
          body,
        });
        onShowToast?.(`Identitas Wali Kelas ${formData.nama_lengkap} berhasil diperbarui.`);
      } else {
        await apiRequest("/admin/wali-kelas", {
          method: "POST",
          body,
        });
        onShowToast?.(
          `Wali Kelas ${formData.nama_lengkap} berhasil ditambahkan! Username login: ${formData.nip}`
        );
      }

      setIsModalOpen(false);
      await fetchWaliKelas();
    } catch (err) {
      setModalErrorMessage(getErrorMessage(err, "Gagal menyimpan data wali kelas."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (item: WaliKelasItem) => {
    setDeletingWali(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingWali) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/admin/wali-kelas/${deletingWali.id}`, {
        method: "DELETE",
      });
      onShowToast?.(`Wali Kelas ${deletingWali.nama_lengkap} berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setDeletingWali(null);
      await fetchWaliKelas();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus data wali kelas."));
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNip(text);
    setTimeout(() => setCopiedNip(null), 2500);
  };

  const filteredList = waliKelasList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.nama_lengkap.toLowerCase().includes(q) ||
      item.nip.toLowerCase().includes(q) ||
      item.nama_kelas.toLowerCase().includes(q)
    );
  });

  const totalSiswaSemua = waliKelasList.reduce((acc, curr) => acc + (curr.total_siswa || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* 2 Kartu Metrik: Total Wali Kelas & Siswa Terbina */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Wali Kelas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Wali Kelas
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {ringkasan.total_wali_kelas}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Guru tercatat aktif</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5F089E] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Siswa Binaan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Siswa Terbina
              </p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">
                {totalSiswaSemua}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Total siswa terdistribusi</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Kontrol Pencarian & Tombol Tambah */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama wali kelas, NIP, atau kelas binaan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5F089E] focus:ring-1 focus:ring-[#5F089E]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Wali Kelas</span>
        </button>
      </div>

      {/* Tabel Data Wali Kelas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
              <tr>
                <th className="py-3.5 px-4 text-center w-14">No</th>
                <th className="py-3.5 px-4">Nama Lengkap &amp; Identitas</th>
                <th className="py-3.5 px-4">Kelas Binaan</th>
                <th className="py-3.5 px-4 text-center">Jumlah Siswa</th>
                <th className="py-3.5 px-4">Akun Login (Username)</th>
                <th className="py-3.5 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-2 border-purple-200 border-t-[#5F089E] rounded-full animate-spin" />
                      <span className="text-xs">Memuat data wali kelas...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <School className="w-10 h-10 text-slate-300" />
                      <p className="font-semibold text-slate-700">Tidak ada data wali kelas</p>
                      <p className="text-xs text-slate-500">
                        {searchQuery
                          ? `Tidak ditemukan wali kelas yang cocok dengan "${searchQuery}".`
                          : "Belum ada wali kelas yang terdaftar. Klik tombol Tambah Wali Kelas untuk menambahkan."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => {
                  const isCopied = copiedNip === item.nip;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-purple-50/30 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      {/* Identitas Guru */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 text-[#5F089E] font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                            {item.foto_profil_url ? (
                              <img
                                src={item.foto_profil_url}
                                alt={item.nama_lengkap}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{item.inisial || "WK"}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#5F089E] transition-colors">
                              {item.nama_lengkap}
                            </p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              NIP: {item.nip}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kelas yang Diampu */}
                      <td className="py-3.5 px-4">
                        {item.kelas_id ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-[#5F089E] font-bold text-xs">
                            <School className="w-3.5 h-3.5 text-[#5F089E]" />
                            <span>Kelas {item.nama_kelas}</span>
                            <span className="text-[10px] text-purple-700/80 font-normal">
                              ({item.tahun_ajaran})
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            Belum Ditugaskan
                          </span>
                        )}
                      </td>

                      {/* Jumlah Siswa */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                          <Users className="w-3 h-3" />
                          <span>{item.total_siswa} Siswa</span>
                        </span>
                      </td>

                      {/* Akun Login */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-800 border border-slate-200">
                            {item.nip}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.nip)}
                            title="Salin NIP untuk login"
                            className="p-1 rounded-md text-slate-400 hover:text-[#5F089E] hover:bg-purple-50 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            Siap Login
                          </span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit Data & Kelas"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#5F089E] hover:border-purple-300 hover:bg-purple-50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => confirmDelete(item)}
                            title="Hapus Wali Kelas"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit Wali Kelas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 via-white to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#5F089E] flex items-center justify-center font-bold">
                  {isEditMode ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isEditMode ? "Perbarui Identitas Wali Kelas" : "Tambah Wali Kelas Baru"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lengkapi identitas guru dan tentukan kelas yang diampu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalErrorMessage}</span>
                </div>
              )}

              {/* Foto Profil */}
              <div className="flex items-center gap-5 p-4 bg-white border border-purple-100 rounded-2xl">
                <div className="w-20 h-20 rounded-2xl bg-[#F3E8FF] text-[#5F089E] font-bold text-2xl flex items-center justify-center overflow-hidden shrink-0">
                  {previewPhotoUrl ? (
                    <img
                      src={previewPhotoUrl}
                      alt="Foto Profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {formData.nama_lengkap
                        ? formData.nama_lengkap
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((w) => w[0]?.toUpperCase() || "")
                            .join("") || "MT"
                        : "MT"}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900 leading-snug">Foto Profil</p>
                  <p className="text-xs text-slate-500">Format JPG/PNG maksimal 2MB</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5F089E] hover:bg-[#4d0680] text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Foto</span>
                    </button>
                    {previewPhotoUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                  </div>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Nama Lengkap Wali Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  placeholder="Contoh: Drs. H. Subagyo, M.Pd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#5F089E] focus:ring-1 focus:ring-[#5F089E]"
                />
              </div>

              {/* NIP (Username Login) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>
                    Nomor Induk Pegawai (NIP) <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Menjadi Username Login
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  placeholder="Contoh: 196804151994031002"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#5F089E] focus:ring-1 focus:ring-[#5F089E]"
                />
                <p className="text-[11px] text-slate-500">
                  Wali kelas akan menggunakan nomor ini untuk login pada sistem.
                </p>
              </div>

              {/* Kelas yang Diampu */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Kelas yang Diampu <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.kelas_id}
                  onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-[#5F089E] focus:ring-1 focus:ring-[#5F089E]"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelasOptions.map((k) => (
                    <option key={k.id} value={k.id}>
                      Kelas {k.nama_kelas}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Setelah login, wali kelas langsung masuk ke kelas ini untuk memvalidasi siswa.
                </p>
              </div>

              {/* Footer Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isEditMode ? "Simpan Perubahan" : "Simpan & Daftarkan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && deletingWali && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Hapus Data Wali Kelas?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data wali kelas{" "}
                <span className="font-bold text-slate-900">{deletingWali.nama_lengkap}</span> (NIP:{" "}
                <span className="font-semibold">{deletingWali.nip}</span>)?
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2">
                Penugasan rombel binaan <span className="font-bold">{deletingWali.nama_kelas}</span>{" "}
                akan dilepaskan dan akun login terkait akan dinonaktifkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Hapus Wali Kelas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

