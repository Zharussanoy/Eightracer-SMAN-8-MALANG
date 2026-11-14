"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  Search,
  Plus,
  RotateCcw,
  Pencil,
  Trash2,
  KeyRound,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shield,
  User
} from "lucide-react";
import { userAdminService, UserItem } from "@/services/b2";

export default function ManajemenUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("SEMUA");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    lastPage: 1,
    perPage: 10,
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form States
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"administrator" | "guru" | "siswa">("siswa");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchUsers = async (page = 1, search = searchQuery, role = roleFilter) => {
    setIsLoading(true);
    setNotification(null);
    try {
      const res = await userAdminService.getAll({
        page,
        username: search.trim() || undefined,
        role: role !== "SEMUA" ? role : undefined,
      });

      if (res?.data?.data) {
        setUsers(res.data.data);
        setPaginationInfo({
          total: res.data.total ?? res.data.data.length,
          lastPage: res.data.last_page ?? 1,
          perPage: res.data.per_page ?? 10,
        });
        setCurrentPage(page);
      }
    } catch (err: any) {
      console.warn("Gagal memuat pengguna dari API:", err);
      setNotification({
        type: "error",
        message: err?.message || "Gagal memuat data pengguna dari backend.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, "", "SEMUA");
  }, []);

  // Filtered client view jika paginasi single-page
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === "SEMUA" || u.role.toLowerCase() === roleFilter.toLowerCase();
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Statistik Role
  const stats = useMemo(() => {
    const total = paginationInfo.total || users.length;
    const adminCount = users.filter((u) => u.role === "administrator" || u.role === "admin").length;
    const guruCount = users.filter((u) => u.role === "guru").length;
    const siswaCount = users.filter((u) => u.role === "siswa").length;
    return { total, adminCount, guruCount, siswaCount };
  }, [users, paginationInfo.total]);

  // Open Handlers
  const handleOpenAdd = () => {
    setFormUsername("");
    setFormPassword("");
    setFormRole("siswa");
    setModalError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setFormUsername(user.username);
    setFormPassword("");
    setFormRole((user.role === "admin" ? "administrator" : user.role) as any);
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (user: UserItem) => {
    setSelectedUser(user);
    setModalError(null);
    setIsDeleteModalOpen(true);
  };

  // Submit Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) {
      setModalError("Username wajib diisi.");
      return;
    }
    if (!formPassword || formPassword.length < 6) {
      setModalError("Password minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      await userAdminService.create({
        username: formUsername.trim(),
        password: formPassword,
        role: formRole,
      });

      setIsAddModalOpen(false);
      setNotification({
        type: "success",
        message: `Pengguna "${formUsername}" berhasil ditambahkan!`,
      });
      fetchUsers(1, searchQuery, roleFilter);
    } catch (err: any) {
      setModalError(err?.message || "Gagal membuat pengguna baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!formUsername.trim()) {
      setModalError("Username wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      await userAdminService.update(selectedUser.id, {
        username: formUsername.trim(),
        role: formRole,
        password: formPassword.trim() ? formPassword : undefined,
      });

      setIsEditModalOpen(false);
      setNotification({
        type: "success",
        message: `Data pengguna "${formUsername}" berhasil diperbarui!`,
      });
      fetchUsers(currentPage, searchQuery, roleFilter);
    } catch (err: any) {
      setModalError(err?.message || "Gagal memperbarui pengguna.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      await userAdminService.delete(selectedUser.id);
      setIsDeleteModalOpen(false);
      setNotification({
        type: "success",
        message: `Pengguna "${selectedUser.username}" berhasil dihapus.`,
      });
      fetchUsers(currentPage, searchQuery, roleFilter);
    } catch (err: any) {
      setModalError(err?.message || "Gagal menghapus pengguna.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r === "administrator" || r === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#5F089E] font-bold text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Administrator</span>
        </span>
      );
    }
    if (r === "guru") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px]">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Guru / Pendidik</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
        <UserCheck className="w-3.5 h-3.5" />
        <span>Siswa</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/admin/b2" className="hover:text-[#5F089E] flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard Admin</span>
              </Link>
              <span>/</span>
              <span className="text-[#5F089E] font-bold">Manajemen Pengguna</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manajemen Pengguna &amp; Hak Akses
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola kredensial akun, peranan hak akses (Administrator, Guru, Siswa), dan reset kata sandi sistem Eightracer.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              type="button"
              onClick={() => fetchUsers(currentPage, searchQuery, roleFilter)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5F089E] hover:bg-[#4D0680] text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna Baru</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-xs transition-all ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : notification.type === "error"
                ? "bg-rose-50 text-rose-900 border border-rose-200"
                : "bg-purple-50 text-purple-900 border border-purple-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Akun
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {stats.total}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Terdaftar di database</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">
                Administrator
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[#5F089E] mt-1">
                {stats.adminCount}
              </p>
              <p className="text-[10px] text-purple-400 mt-0.5">Akses penuh sistem</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#5F089E] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                Guru &amp; Pendidik
              </p>
              <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
                {stats.guruCount}
              </p>
              <p className="text-[10px] text-blue-400 mt-0.5">Wali kelas &amp; BK</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                Siswa
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                {stats.siswaCount}
              </p>
              <p className="text-[10px] text-emerald-500 mt-0.5">Pengguna terverifikasi</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari berdasarkan username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchUsers(1, e.target.value, roleFilter);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#5F089E] outline-none text-xs text-slate-800 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  fetchUsers(1, searchQuery, e.target.value);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="SEMUA">Semua Role</option>
                <option value="administrator">Administrator</option>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 self-end sm:self-center">
            Menampilkan <strong>{filteredUsers.length}</strong> pengguna
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Pengguna / Username</th>
                  <th className="px-5 py-3.5">Peranan (Role)</th>
                  <th className="px-5 py-3.5">Waktu Registrasi</th>
                  <th className="px-5 py-3.5">Status Akun</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#5F089E]" />
                        <span className="text-xs font-medium text-slate-500">
                          Memuat data pengguna dari server...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Tidak ada pengguna yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">
                        #{u.id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-50 text-[#5F089E] font-bold flex items-center justify-center shrink-0 border border-purple-100">
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {u.username}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              SMAN 8 Malang
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-[11px]">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Aktif</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            title="Edit Role / Reset Password"
                            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-600 hover:text-[#5F089E] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={u.username === "admin"}
                            onClick={() => handleOpenDelete(u)}
                            title={u.username === "admin" ? "Akun default tidak dapat dihapus" : "Hapus Pengguna"}
                            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {paginationInfo.lastPage > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Halaman {currentPage} dari {paginationInfo.lastPage}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => fetchUsers(currentPage - 1, searchQuery, roleFilter)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <button
                  type="button"
                  disabled={currentPage >= paginationInfo.lastPage}
                  onClick={() => fetchUsers(currentPage + 1, searchQuery, roleFilter)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL TAMBAH PENGGUNA ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5F089E] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Tambah Pengguna Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: guru_math_01 atau siswa_0061"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#5F089E] outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Kata Sandi (Password) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#5F089E] outline-none text-xs"
                />
                <span className="text-[10px] text-slate-400 block">
                  Password akan dienkripsi dengan algoritma bcrypt aman oleh Laravel backend.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Peranan (Role) *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#5F089E] outline-none text-xs font-semibold"
                >
                  <option value="siswa">Siswa (Akses Dashboard Siswa &amp; Perbandingan)</option>
                  <option value="guru">Guru (Wali Kelas &amp; Input Catatan Karakter)</option>
                  <option value="administrator">Administrator (Akses Penuh Seluruh Sistem)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4D0680] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Pengguna</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL EDIT PENGGUNA ================= */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Perbarui Akun Pengguna #{selectedUser.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Username *</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Peranan (Role) *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none text-xs font-semibold"
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  Reset Kata Sandi (Opsional)
                </label>
                <input
                  type="password"
                  minLength={6}
                  placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-blue-600 outline-none text-xs mt-1"
                />
                <span className="text-[10px] text-slate-400 block">
                  Isi kolom di atas hanya jika Anda ingin menetapkan kata sandi baru untuk pengguna ini.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Perbarui Akun</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-5 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Hapus Akun Pengguna?</h3>
              <p className="text-xs text-slate-500">
                Anda yakin ingin menghapus akun <strong>&quot;{selectedUser.username}&quot;</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {modalError}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
