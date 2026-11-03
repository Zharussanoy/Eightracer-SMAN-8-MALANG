"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { B1Tab } from "./types";

interface AdminB1BreadcrumbProps {
  activeTab?: B1Tab;
}

export default function AdminB1Breadcrumb({
  activeTab = "Pusat Manajemen Data",
}: AdminB1BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-xs font-['Montserrat',sans-serif] text-slate-500 py-1"
    >
      <Link
        href="/"
        className="flex items-center gap-1.5 hover:text-[#5F089E] transition-colors"
      >
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Beranda</span>
      </Link>

      <span className="text-slate-300 font-normal">/</span>

      <span className="text-slate-500">B1 (Peminatan &amp; Profil Siswa)</span>

      <span className="text-slate-300 font-normal">/</span>

      <span className="text-[#5F089E] font-semibold">{activeTab}</span>
    </nav>
  );
}
