"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface UserNavProfileDropdownProps {
  /** Override role tag jika disediakan dari parent navbar (e.g. "Admin B1", "Wali Kelas X-2", "Siswa X-4") */
  customRoleTag?: string;
  /** Override nama jika disediakan */
  customNama?: string;
  /** Override initials jika disediakan */
  customInitials?: string;
}

export default function UserNavProfileDropdown({
  customRoleTag,
  customNama,
  customInitials,
}: UserNavProfileDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authUser, currentUser, signOut, logout, isLoggedIn } = useUser();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isProfile = pathname === "/profile";
  const userLoggedIn = Boolean(isLoggedIn || authUser);

  // Deteksi roleType berdasarkan authUser / customRoleTag / currentUser
  const isGuruBk =
    authUser?.profil?.sub_peran === "guru_bk" ||
    Boolean(customRoleTag && (customRoleTag.toLowerCase().includes("bk") || customRoleTag.toLowerCase().includes("admin")));

  const isAdmin =
    isGuruBk ||
    authUser?.role === "administrator" ||
    Boolean(customRoleTag && customRoleTag.toLowerCase().includes("admin")) ||
    currentUser.role === "admin";

  const isGuru =
    !isAdmin &&
    (authUser?.role === "guru" ||
      Boolean(customRoleTag && (customRoleTag.toLowerCase().includes("wali") || customRoleTag.toLowerCase().includes("guru"))) ||
      currentUser.role === "guru");

  // Hitung display info
  const nama =
    customNama ||
    authUser?.profil?.nama_lengkap ||
    authUser?.nama_lengkap ||
    currentUser.name ||
    "Pengguna";

  const initials =
    customInitials ||
    authUser?.profil?.inisial ||
    (nama
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("") ||
      "U");

  const roleTag =
    customRoleTag ||
    (authUser?.role === "administrator"
      ? "Admin B1"
      : authUser?.role === "guru"
      ? authUser.profil?.sub_peran === "guru_bk"
        ? "Guru BK"
        : `Wali Kelas ${authUser.profil?.kelas_binaan?.nama_kelas || ""}`.trim()
      : authUser?.role === "siswa"
      ? `Siswa ${authUser.profil?.kelas || ""}`.trim()
      : currentUser.role === "admin"
      ? "Admin"
      : currentUser.role === "guru"
      ? "Wali Kelas"
      : currentUser.email || "Akun Terverifikasi");

  const avatarSrc =
    authUser?.profil?.foto_profil_url ||
    currentUser?.avatar ||
    (isAdmin ? "/team/b3-hafiidz.png" : isGuru ? "/team/b2-yan-hasby.png" : "/team/b3-ismail.png");

  // Menutup dropdown profile saat klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileDropdownOpen(false);
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileDropdownOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      if (logout) logout();
      if (signOut) await signOut();
    } finally {
      setProfileDropdownOpen(false);
      setIsLoggingOut(false);
      router.push("/login");
    }
  };

  if (!userLoggedIn) {
    return (
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full font-semibold text-sm text-white bg-[#5F089E] hover:bg-[#4d0680] shadow-md shadow-purple-900/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          Masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3 relative" ref={dropdownRef}>
      {/* Tombol Avatar Bundar Sesuai Desain Main */}
      <button
        type="button"
        onClick={() => setProfileDropdownOpen((prev) => !prev)}
        className={`relative w-10 h-10 rounded-full border-2 transition-all cursor-pointer overflow-hidden flex items-center justify-center bg-purple-50 ${
          isProfile || profileDropdownOpen
            ? "border-[#5F089E] shadow-sm ring-2 ring-purple-500/20"
            : "border-slate-200 hover:border-purple-300"
        }`}
        aria-expanded={profileDropdownOpen}
        title={nama}
      >
        {avatarSrc && !imageError ? (
          <Image
            src={avatarSrc}
            alt={nama}
            fill
            unoptimized
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-sm font-bold text-[#5F089E]">
            {initials}
          </span>
        )}
      </button>

      {/* Dropdown Menu Profile & Logout Sesuai Desain Main */}
      {profileDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 pt-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
          <div className="bg-white rounded-2xl shadow-xl shadow-purple-950/10 border border-purple-100 p-2 space-y-1">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-xs font-bold text-slate-900 truncate">{nama}</p>
              <p className="text-[11px] text-slate-500 truncate">{roleTag}</p>
            </div>

            <Link
              href="/profile"
              onClick={() => setProfileDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
            >
              <User className="w-4 h-4 text-purple-600" />
              <span>Profil Saya</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors text-left cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
