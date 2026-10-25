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
  ArrowUpRight,
} from "lucide-react";
import { AdminRole, AdminTab } from "./types";

interface AdminNavbarProps {
  role?: AdminRole;
  onRoleChange?: (newRole: AdminRole) => void;
  onNavigateTab?: (tab: AdminTab) => void;
}

export default function AdminNavbar({
  role = "admin",
  onRoleChange = () => {},
  onNavigateTab = () => {},
}: AdminNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const pathname = usePathname();
  const isAdminHome = pathname === "/admin";

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
                      onClick={() => setServicesDropdownOpen(false)}
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

          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => onRoleChange("siswa")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === "siswa"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => onRoleChange("admin")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === "admin"
                  ? "bg-[#5F089E] text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="w-10 h-10 bg-slate-200 text-slate-700 font-bold rounded-full flex items-center justify-center text-sm shadow-inner shrink-0 border border-slate-300">
                {role === "admin" ? "AS" : "SS"}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold text-slate-900">
                  {role === "admin" ? "Admin" : "Siswa"}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  SMAN 8 Malang
                </span>
              </div>
            </div>
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
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-100">
            <span className="text-xs font-bold text-slate-700">Pilih Mode Tampilan:</span>
            <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onRoleChange("siswa")}
                className={`px-3 py-1 rounded text-xs font-bold ${role === "siswa"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600"
                  }`}
              >
                Siswa
              </button>
              <button
                type="button"
                onClick={() => onRoleChange("admin")}
                className={`px-3 py-1 rounded text-xs font-bold ${role === "admin"
                  ? "bg-[#5F089E] text-white"
                  : "text-slate-600"
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

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <div className="w-10 h-10 bg-slate-200 text-slate-700 font-bold rounded-full flex items-center justify-center text-sm shadow-inner shrink-0">
              {role === "admin" ? "AS" : "SS"}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {role === "admin" ? "Admin Smarihasta" : "Siswa Smarihasta"}
              </span>
              <span className="text-[10px] text-slate-500">
                Mode: {role === "admin" ? "Administrator" : "Siswa (Read-only)"}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
