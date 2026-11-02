"use client";

import { LayoutDashboard, Users, Bot, FileText } from "lucide-react";
import { AdminTab, AdminRole, B3Tab, B3Role } from "./types";

interface AdminTabNavProps {
  activeTab: AdminTab | B3Tab;
  onTabChange: (tab: AdminTab) => void;
  alumniCount: number;
  role?: AdminRole | B3Role;
}

export default function AdminTabNav({
  activeTab,
  onTabChange,
  alumniCount,
  role = "admin",
}: AdminTabNavProps) {
  // Tab Formulir Pendataan hanya muncul jika role pengguna adalah Alumni atau Admin
  const canViewFormTab = role === "alumni" || role === "admin";

  return (
    <nav className="mb-6 flex items-center gap-6 sm:gap-8 border-b border-slate-200 overflow-x-auto no-scrollbar">
      {/* 1. Ringkasan */}
      <button
        type="button"
        onClick={() => onTabChange("Ringkasan")}
        className={`shrink-0 flex items-center gap-2 pb-3.5 pt-1 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
          activeTab === "Ringkasan"
            ? "border-[#5F089E] text-[#5F089E]"
            : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Ringkasan</span>
      </button>

      {/* 2. Direktori Alumni */}
      <button
        type="button"
        onClick={() => onTabChange("Direktori Alumni")}
        className={`shrink-0 flex items-center gap-2 pb-3.5 pt-1 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
          activeTab === "Direktori Alumni"
            ? "border-[#5F089E] text-[#5F089E]"
            : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Direktori Alumni</span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
            activeTab === "Direktori Alumni"
              ? "bg-purple-100 text-[#5F089E]"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {alumniCount}
        </span>
      </button>

      {/* 3. AI Strategi Jurusan */}
      <button
        type="button"
        onClick={() => onTabChange("AI Strategi Jurusan")}
        className={`shrink-0 flex items-center gap-2 pb-3.5 pt-1 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
          activeTab === "AI Strategi Jurusan"
            ? "border-[#5F089E] text-[#5F089E]"
            : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
        }`}
      >
        <Bot className="w-4 h-4 text-amber-500" />
        <span>AI Strategi Jurusan</span>
      </button>

      {/* 4. Formulir Pendataan - Hanya muncul sesuai role (Alumni & Admin) */}
      {canViewFormTab && (
        <button
          type="button"
          onClick={() => onTabChange("Formulir Pendataan")}
          className={`shrink-0 flex items-center gap-2 pb-3.5 pt-1 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "Formulir Pendataan"
              ? "border-[#5F089E] text-[#5F089E]"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <FileText className="w-4 h-4 text-purple-600" />
          <span>Formulir Pendataan</span>
        </button>
      )}
    </nav>
  );
}
