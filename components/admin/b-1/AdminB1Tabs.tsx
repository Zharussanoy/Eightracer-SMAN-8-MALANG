"use client";

import { B1Tab } from "./types";

interface AdminB1TabsProps {
  activeTab: B1Tab;
  onTabChange: (tab: B1Tab) => void;
}

export default function AdminB1Tabs({
  activeTab,
  onTabChange,
}: AdminB1TabsProps) {
  const tabs: B1Tab[] = [
    "Pusat Manajemen Data",
    "Dashboard Konseling",
    "Validasi & Surat Rekomendasi",
    "Feedback Strategi & Direktori BK",
    "Mengelola Wali Kelas",
  ];

  return (
    <div className="w-full border-b border-slate-200 mb-8 sm:mb-9 font-sans overflow-x-auto no-scrollbar">
      <nav
        className="flex items-center justify-between max-w-6xl mx-auto px-2 sm:px-6 min-w-max gap-6"
        aria-label="Tabs Peminatan B1"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`py-3.5 px-2 text-sm transition-all duration-200 relative cursor-pointer flex items-center gap-2 active:scale-95 whitespace-nowrap ${
                isActive
                  ? "text-[#5F089E] font-bold"
                  : "text-slate-600 font-medium hover:text-[#5F089E] hover:-translate-y-0.5"
              }`}
            >
              <span>{tab}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5F089E] rounded-full animate-in fade-in zoom-in-95 duration-200" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
