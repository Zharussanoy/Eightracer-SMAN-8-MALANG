"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  UserCheck,
  Shield,
  GraduationCap,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { AdminRole, AdminTab } from "./b-3/types";
import { useUser } from "@/context/UserContext";

interface AdminNavbarProps {
  role?: AdminRole;
  onRoleChange?: (newRole: AdminRole) => void;
  onNavigateTab?: (tab: AdminTab) => void;
}

export default function AdminNavbar({
  role = "admin",
  onRoleChange = () => {},
  onNavigateTab,
}: AdminNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const pathname = usePathname();
  const isAdminHome = pathname === "/admin";
  const { currentUser, switchRole } = useUser();

  const handleRoleSelect = (r: AdminRole) => {
    onRoleChange(r);
    if (r === "siswa") switchRole("siswa_aktif");
    else if (r === "alumni") switchRole("siswa_alumni");
    else if (r === "guru") switchRole("guru");
    else if (r === "admin") switchRole("admin");
  };

  const getRoleLabel = (r: AdminRole) => {
    switch (r) {
      case "admin":
        return "Admin";
      case "alumni":
        return "Alumni";
      case "guru":
        return "Guru";
      case "siswa":
      default:
        return "Siswa";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-3 sm:gap-4 group">
              <div className="w-12 h-12 relative rounded-2xl overflow-hidden shadow-md shadow-purple-900/20 group-hover:scale-105 transition-transform flex items-center justify-center bg-[#5F089E] shrink-0">
                <Image
                  src="/images/logo.svg"
                  alt="Eightracer Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col leading-none gap-1">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#5F089E] transition-colors">
                  Eightracer
                </span>
                <span className="text-[10px] font-bold tracking-wider text-[#5F089E] uppercase">
                  SMAN 8 MALANG
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              href="/admin"
              className="hover:text-[#5F089E] transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/admin#tentang"
              className="hover:text-[#5F089E] transition-colors"
            >
              Tentang Kami
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <Link
                href={isAdminHome ? "#layanan" : "/admin#layanan"}
                className="flex items-center gap-1.5 hover:text-[#5F089E] py-2 transition-colors cursor-pointer"
                onClick={() => setServicesDropdownOpen(false)}
              >
                <span>Layanan</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    servicesDropdownOpen ? "rotate-180 text-[#5F089E]" : ""
                  }`}
                />
              </Link>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 pt-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="bg-white rounded-2xl shadow-xl shadow-purple-950/10 border border-purple-100 p-2 space-y-1">
                    <Link
                      href={isAdminHome ? "#layanan" : "/admin#layanan"}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                      onClick={() => setServicesDropdownOpen(false)}
                    >
                      <span>Pemetaan Profil Nilai</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                    <Link
                      href={isAdminHome ? "#layanan" : "/admin#layanan"}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                      onClick={() => setServicesDropdownOpen(false)}
                    >
                      <span>Kelolosan Seleksi PTN</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                    <Link
                      href="/admin/alumni?tab=direktori"
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                      onClick={() => {
                        setServicesDropdownOpen(false);
                        if (onNavigateTab) onNavigateTab("Direktori Alumni");
                      }}
                    >
                      <span>Data Kelulusan &amp; Kampus</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                    <Link
                      href={isAdminHome ? "#layanan" : "/admin#layanan"}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                      onClick={() => setServicesDropdownOpen(false)}
                    >
                      <span>Perkembangan &amp; Karir Alumni</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/tim-pengembang"
              className="hover:text-[#5F089E] transition-colors"
            >
              Tim Pengembang
            </Link>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            {/* Simulator Role (4 Kategori: Siswa, Alumni, Guru, Admin) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleRoleSelect("siswa")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === "siswa"
                    ? "bg-white text-purple-700 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("alumni")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === "alumni"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Alumni</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("guru")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === "guru"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Guru</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("admin")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === "admin"
                    ? "bg-[#5F089E] text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Tombol Profil Clickable */}
            <Link
              href="/profile"
              className="flex items-center gap-2.5 p-1 pl-2.5 pr-1.5 rounded-full border border-slate-200/90 hover:border-purple-300 hover:bg-purple-50/70 transition-all cursor-pointer group"
              title="Buka Halaman Profil Pengguna"
            >
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#5F089E] transition-colors">
                  {currentUser.name.split(" ")[0]}
                </span>
                <span className="text-[9px] font-extrabold text-[#5F089E] uppercase">
                  {getRoleLabel(role)}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-2xs relative shrink-0">
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#5F089E] hover:bg-purple-50 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-purple-100 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
          {/* Card Profil di Mobile */}
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 bg-purple-50/70 hover:bg-purple-100/70 rounded-2xl border border-purple-100 flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-300 shrink-0">
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.name}
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block mt-0.5 bg-purple-100 text-purple-800">
                  {getRoleLabel(role)}
                </span>
              </div>
            </div>

            <span className="text-xs font-bold text-[#5F089E] flex items-center gap-1">
              Profil
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Simulator Role di Mobile */}
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Pilih Role Fitur B3:
            </span>
            <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleRoleSelect("siswa")}
                className={`py-1.5 rounded text-xs font-bold text-center ${
                  role === "siswa" ? "bg-purple-600 text-white" : "text-slate-600"
                }`}
              >
                Siswa
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("alumni")}
                className={`py-1.5 rounded text-xs font-bold text-center ${
                  role === "alumni" ? "bg-emerald-600 text-white" : "text-slate-600"
                }`}
              >
                Alumni
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("guru")}
                className={`py-1.5 rounded text-xs font-bold text-center ${
                  role === "guru" ? "bg-blue-600 text-white" : "text-slate-600"
                }`}
              >
                Guru
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("admin")}
                className={`py-1.5 rounded text-xs font-bold text-center ${
                  role === "admin" ? "bg-[#5F089E] text-white" : "text-slate-600"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 rounded-lg"
            >
              Beranda
            </Link>
            <Link
              href={isAdminHome ? "#tentang" : "/admin#tentang"}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 rounded-lg"
            >
              Tentang Kami
            </Link>
            <Link
              href={isAdminHome ? "#layanan" : "/admin#layanan"}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 rounded-lg"
            >
              Layanan
            </Link>
            <Link
              href="/tim-pengembang"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 rounded-lg"
            >
              Tim Pengembang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
