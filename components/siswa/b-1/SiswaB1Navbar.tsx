"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  Compass,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export default function SiswaB1Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F5F5F5] transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
            <div className="w-11 h-11 relative rounded-2xl overflow-hidden shadow-md shadow-purple-900/20 group-hover:scale-105 transition-transform flex items-center justify-center bg-[#5F089E] shrink-0">
              <Image
                src="/images/logo.svg"
                alt="Eightracer Logo"
                width={44}
                height={44}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none gap-1">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#5F089E] transition-colors">
                Eightracer
              </span>
              <span className="text-[10px] font-bold tracking-wider text-[#5F089E] uppercase">
                SMAN 8 MALANG
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-[#1E1E1E]">
            <Link
              href="/"
              className="hover:text-[#5F089E] transition-colors"
            >
              Beranda
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
                    servicesDropdownOpen ? "rotate-180 text-[#5F089E]" : "text-[#999999]"
                  }`}
                />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 w-72 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-white rounded-2xl shadow-xl shadow-purple-950/10 border border-purple-100 p-2 space-y-1">
                    <Link
                      href="/siswa/b-1"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-purple-50/80 text-[#5F089E] text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2.5">
                        <Compass className="w-4 h-4 text-[#5F089E]" />
                        <span>Rekomendasi Mapel Pilihan (B1)</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>

                    <Link
                      href="/alumni?tab=direktori"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span>Direktori &amp; Sebaran Alumni</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>

                    <Link
                      href="/admin/b-1"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#5F089E] text-xs font-semibold transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>Portal Admin BK (B1)</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/#tentang"
              className="hover:text-[#5F089E] transition-colors"
            >
              Tentang Kami
            </Link>

            <Link
              href="/tim-pengembang"
              className="hover:text-[#5F089E] transition-colors"
            >
              Pengembang
            </Link>
          </nav>

          {/* Right Actions: Student Profile Badge */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2.5 py-1.5 pl-3 pr-2 rounded-full bg-[#FAF5FF] border border-[#E9D5FF] hover:border-[#5F089E]/40 transition-all">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#5F089E]/10 text-[#5F089E] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5F089E]" />
                Siswa X-3
              </span>
              <span className="text-xs font-bold text-[#1E1E1E] pr-1">
                Amalia Mayasari
              </span>
              <div className="w-8 h-8 rounded-full bg-[#5F089E] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                AM
              </div>
            </div>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-[#5F089E] hover:bg-purple-50 transition-colors cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white px-4 pt-4 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="p-3 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#5F089E] text-white font-bold text-sm flex items-center justify-center shrink-0">
              AM
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E1E1E]">Amalia Mayasari</p>
              <p className="text-[11px] text-[#5F089E] font-semibold">
                Siswa Kelas X-3 &bull; NISN: 012345678
              </p>
            </div>
          </div>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-sm text-slate-700 hover:bg-purple-50"
          >
            Beranda
          </Link>
          <Link
            href="/siswa/b-1"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-bold text-sm text-[#5F089E] bg-purple-50"
          >
            Rekomendasi Mapel Pilihan (B1)
          </Link>
          <Link
            href="/#tentang"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-sm text-slate-700 hover:bg-purple-50"
          >
            Tentang Kami
          </Link>
          <Link
            href="/tim-pengembang"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-sm text-slate-700 hover:bg-purple-50"
          >
            Pengembang
          </Link>
        </div>
      )}
    </header>
  );
}

