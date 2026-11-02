"use client";

import type { TabAiStrategi } from "./types";

interface AiStrategiHeaderProps {
  activeTab: TabAiStrategi;
  onTabChange: (tab: TabAiStrategi) => void;
}

const TABS: TabAiStrategi[] = ["Overview", "Simulator"];

export default function AiStrategiHeader({
  activeTab,
  onTabChange,
}: AiStrategiHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      {/* Title & subtitle */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          AI Strategi Jurusan
        </h2>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
          Analisis pola penerimaan dan rekomendasi strategi pilihan kampus berbasis data alumni
        </p>
      </div>

      {/* Tab switcher */}
      <div
        className="inline-flex items-center gap-1 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-1.5 w-full sm:w-auto shrink-0"
        role="tablist"
        aria-label="Navigasi AI Strategi Jurusan"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.toLowerCase()}`}
              id={`tab-${tab.toLowerCase()}`}
              onClick={() => onTabChange(tab)}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                isActive
                  ? "bg-[#5F089E] text-white shadow-sm shadow-purple-900/20"
                  : "text-[#5F089E] hover:bg-purple-50/70"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}

