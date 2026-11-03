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
  ];

  return (
    <div className="w-full border-b border-slate-200 mb-8 sm:mb-10 font-['Montserrat',sans-serif] overflow-x-auto no-scrollbar">
      <nav className="flex items-center gap-8 sm:gap-12 min-w-max pb-0" aria-label="Tabs Peminatan B1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`pb-3 px-1 transition-all cursor-pointer relative text-sm ${
                isActive
                  ? "text-[#5F089E] font-bold"
                  : "text-slate-600 font-medium hover:text-[#5F089E]"
              }`}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5F089E] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
