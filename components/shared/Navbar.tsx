"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, ArrowUpRight, User, LogOut } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { isLoggedIn, currentUser, logout } = useUser();

  const isHome = pathname === "/";
  const isTeam = pathname === "/tim-pengembang";
  const isProfile = pathname === "/profile";

  // Menutup dropdown profile saat klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi pembantu untuk mengambil inisial nama
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Eightracer */}
          <Link href="/" className="flex items-center gap-4 group">
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

          {/* Navigasi Utama: Beranda, Tentang Kami, Layanan, Tim Pengembang */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className={`transition-colors ${isHome ? "text-[#5F089E] font-semibold" : "hover:text-[#5F089E]"}`}
            >
              Beranda
            </Link>

            <Link
              href={isHome ? "#tentang" : "/#tentang"}
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
                href={isHome ? "#layanan" : "/#layanan"}
                className="flex items-center gap-1.5 hover:text-[#5F089E] py-2 transition-colors cursor-pointer"
                onClick={() => setServicesDropdownOpen(false)}
              >
                <span>Layanan</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${servicesDropdownOpen ? "rotate-180 text-[#5F089E]" : ""}`}
                />
              </Link>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 pt-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="bg-white rounded-2xl shadow-xl shadow-purple-950/10 border border-purple-100 p-2 space-y-1">
                    <Link
                      href={isHome ? "#layanan" : "/#layanan"}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                      onClick={() => setServicesDropdownOpen(false)}
                    >
                      <span>Pemetaan Profil Nilai</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                    <Link
                      href={isHome ? "#layanan" : "/#layanan"}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                      onClick={() => setServicesDropdownOpen(false)}
                    >
                      <span>Kelolosan Seleksi PTN</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                    <Link
                      href="/alumni?tab=direktori"
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                      onClick={() => setServicesDropdownOpen(false)}
                    >
                      <span>Data Kelulusan &amp; Kampus</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                    <Link
                      href={isHome ? "#layanan" : "/#layanan"}
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
              className={`transition-colors ${isTeam ? "text-[#5F089E] font-semibold" : "hover:text-[#5F089E]"}`}
            >
              Tim Pengembang
            </Link>
          </nav>

          {/* Sudut Kanan Atas: Hanya Menampilkan Foto/Inisial Saja */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3 relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`relative w-10 h-10 rounded-full border-2 transition-all cursor-pointer overflow-hidden flex items-center justify-center bg-purple-50 ${isProfile || profileDropdownOpen
                  ? "border-[#5F089E] shadow-sm ring-2 ring-purple-500/20"
                  : "border-slate-200 hover:border-purple-300"
                  }`}
                aria-expanded={profileDropdownOpen}
                title={currentUser.name}
              >
                {/* Tampilkan Foto, jika tidak ada/error tampilkan Inisial */}
                {currentUser.avatar ? (
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-[#5F089E]">
                    {getInitials(currentUser.name)}
                  </span>
                )}
              </button>

              {/* Dropdown Menu Profile & Logout */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 pt-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="bg-white rounded-2xl shadow-xl shadow-purple-950/10 border border-purple-100 p-2 space-y-1">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email || "Akun Terverifikasi"}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-600" />
                      <span>Lihat Profil</span>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (logout) logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-semibold text-white bg-[#5F089E] hover:bg-[#4d0680] active:bg-[#3d0566] px-6 py-2.5 rounded-full shadow-md shadow-purple-900/25 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Masuk
              </Link>
            </div>
          )}

          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          {isLoggedIn && (
            <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-300 shrink-0 flex items-center justify-center bg-white">
                  {currentUser.avatar ? (
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[#5F089E]">
                      {getInitials(currentUser.name)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {currentUser.email || "Akun Terverifikasi"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200/60">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white rounded-xl border border-purple-200 text-xs font-bold text-[#5F089E] shadow-2xs hover:bg-purple-50 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Profil
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (logout) logout();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white rounded-xl border border-red-200 text-xs font-bold text-red-600 shadow-2xs hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-2 font-medium text-slate-700">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors ${isHome ? "text-purple-700 font-semibold bg-purple-50" : "hover:bg-purple-50"
                }`}
            >
              Beranda
            </Link>
            <Link
              href={isHome ? "#tentang" : "/#tentang"}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-purple-50"
            >
              Tentang Kami
            </Link>
            <Link
              href={isHome ? "#layanan" : "/#layanan"}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-purple-50"
            >
              Layanan
            </Link>
            <Link
              href="/tim-pengembang"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors ${isTeam ? "text-purple-700 font-semibold bg-purple-50" : "hover:bg-purple-50"
                }`}
            >
              Tim Pengembang
            </Link>
          </div>

          {!isLoggedIn && (
            <div className="pt-4 border-t border-purple-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full font-semibold text-white bg-[#5F089E] hover:bg-[#4d0680] transition-colors shadow-md shadow-purple-900/20"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}