"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, X, ArrowUpRight, User, LogOut } from "lucide-react";
import { useUser } from "@/context/UserContext";
import UserNavProfileDropdown from "@/components/shared/UserNavProfileDropdown";

interface AdminB1NavbarProps {
  namaAdmin?: string;
  roleLabel?: string;
}

export default function AdminB1Navbar({
  namaAdmin: propNamaAdmin,
  roleLabel: propRoleLabel,
}: AdminB1NavbarProps = {}) {
  const router = useRouter();
  const { authUser, currentUser, signOut, logout, isLoggedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  // Pastikan akun yang digunakan adalah akun admin atau guru BK, BUKAN siswa
  const isRealAdmin =
    Boolean(
      authUser &&
      (authUser.role === "administrator" ||
       (authUser.role === "guru" && authUser.profil?.sub_peran === "guru_bk"))
    );

  const nama =
    propNamaAdmin ||
    (isRealAdmin ? (authUser?.nama_lengkap || authUser?.username) : null) ||
    currentUser?.name ||
    "Admin B1";

  const roleTag =
    propRoleLabel ||
    (isRealAdmin && authUser?.profil?.sub_peran === "guru_bk"
      ? "Guru BK"
      : "Admin B1");

  const initials =
    nama === "Admin B1"
      ? "AD"
      : nama
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() || "")
          .join("") || "AD";

  const avatarSrc =
    authUser?.profil?.foto_profil_url ||
    currentUser?.avatar ||
    "/team/b3-hafiidz.png";

  const userLoggedIn = Boolean(isLoggedIn || authUser);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 transition-all font-sans">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className="hover:text-[#5F089E] transition-colors"
            >
              Beranda
            </Link>

            <Link
              href="/#tentang"
              className="hover:text-[#5F089E] transition-colors"
            >
              Tentang Kami
            </Link>

            {/* Layanan Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className="flex items-center gap-1.5 text-[#5F089E] py-2 transition-colors cursor-pointer"
              >
                <span>Layanan</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    servicesDropdownOpen ? "rotate-180 text-[#5F089E]" : "text-[#5F089E]"
                  }`}
                />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-white rounded-2xl shadow-xl shadow-purple-950/10 border border-purple-100 p-2 space-y-1">
                    <Link
                      href="/admin/b-1"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-purple-50/70 text-[#5F089E] text-xs font-semibold"
                    >
                      <span>Pemetaan Profil Nilai</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>

                    <Link
                      href="/#layanan"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                    >
                      <span>Kelolosan Seleksi PTN</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>

                    <Link
                      href="/admin/alumni"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                    >
                      <span>Data Kelulusan &amp; Kampus</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>

                    <Link
                      href="/#layanan"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                    >
                      <span>Perkembangan &amp; Karir Alumni</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
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

          {/* Right Actions: Admin Profile Dropdown matching main */}
          <div className="hidden md:flex items-center gap-3">
            <UserNavProfileDropdown
              customRoleTag={roleTag}
              customNama={nama}
              customInitials={initials}
            />
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          {userLoggedIn && (
            <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-300 shrink-0 flex items-center justify-center bg-white">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={nama}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[#5F089E]">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {nama}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {roleTag}
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
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    if (logout) logout();
                    if (signOut) await signOut();
                    router.push("/login");
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white rounded-xl border border-red-200 text-xs font-bold text-red-600 shadow-2xs hover:bg-red-50 transition-colors cursor-pointer"
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
              className="px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/#tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Tentang Kami
            </Link>
            <Link
              href="/admin/b-1"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-purple-700 font-semibold bg-purple-50 transition-colors"
            >
              Pemetaan Profil Nilai
            </Link>
            <Link
              href="/tim-pengembang"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Tim Pengembang
            </Link>
          </div>

          {!userLoggedIn && (
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
