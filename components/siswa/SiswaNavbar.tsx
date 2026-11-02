"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";

export default function SiswaNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Layanan", href: "/#layanan", hasDropdown: true },
    { label: "Tentang Kami", href: "/#tentang" },
    { label: "Pengembang", href: "/tim-pengembang" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#EAECF0] h-[72px]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between">

        <div className="flex items-center gap-10">

          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/images/logo-untitled.png"
                alt="Logo"
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
                priority
              />
            </div>
            <span
              className="font-bold text-lg text-[#101828] tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Untitled UI
            </span>
          </Link>


          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-1.5 font-semibold text-sm text-[#344054] hover:text-[#5F089E] transition-colors"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {link.label}
                {link.hasDropdown && (
                  <ChevronDown className="w-4 h-4 text-[#667085]" />
                )}
              </Link>
            ))}
          </nav>
        </div>


        <div className="hidden md:flex items-center gap-6">
          <button
            type="button"
            className="font-semibold text-sm text-[#344054] hover:text-[#101828] transition-colors cursor-pointer"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Masuk
          </button>

          <Link
            href="/siswa"
            className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-[#5F089E] hover:bg-[#4E0682] transition-colors cursor-pointer shadow-xs"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Daftar
          </Link>
        </div>


        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-[#5F089E] transition-colors cursor-pointer"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>


      {mobileOpen && (
        <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white border-b border-[#EAECF0] px-6 py-4 space-y-3 shadow-lg z-50">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 font-semibold text-sm text-[#344054] hover:text-[#5F089E]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              type="button"
              className="font-semibold text-sm text-[#344054]"
            >
              Masuk
            </button>
            <Link
              href="/siswa"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#5F089E]"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
