"use client";

import { LayoutDashboard, Users, Bot, Sparkles } from "lucide-react";
import { AdminTab } from "./types";

interface AdminTabNavProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  alumniCount: number;
}

export default function AdminTabNav({
  activeTab,
  onTabChange,
  alumniCount,
}: AdminTabNavProps) {
  return (
    <nav className="mb-6 flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto no-scrollbar sm:flex-wrap">
      <button
        type="button"
        onClick={() => onTabChange("Ringkasan")}
        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === "Ringkasan"
          ? "bg-[#5F089E] text-white shadow-md shadow-purple-900/15"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
          }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Ringkasan</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("Direktori Alumni")}
        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === "Direktori Alumni"
          ? "bg-[#5F089E] text-white shadow-md shadow-purple-900/15"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
          }`}
      >
        <Users className="w-4 h-4" />
        <span>Direktori Alumni</span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${activeTab === "Direktori Alumni"
            ? "bg-purple-900/50 text-white"
            : "bg-slate-200 text-slate-700"
            }`}
        >
          {alumniCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("AI Strategi Jurusan")}
        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === "AI Strategi Jurusan"
          ? "bg-[#5F089E] text-white shadow-md shadow-purple-900/15"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
          }`}
      >
        <Bot className="w-4 h-4 text-amber-500" />
        <span>AI Strategi Jurusan</span>
      </button>
    </nav>
  );
}
