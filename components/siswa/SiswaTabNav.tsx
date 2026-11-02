"use client";

export type SiswaTab =
  | "Dashboard"
  | "Biodata"
  | "Akademik"
  | "Catatan"
  | "Karakteristik"
  | "Ranking Eligibilitas";

const TABS: SiswaTab[] = [
  "Dashboard",
  "Biodata",
  "Akademik",
  "Catatan",
  "Karakteristik",
  "Ranking Eligibilitas",
];

interface SiswaTabNavProps {
  activeTab: SiswaTab;
  onTabChange: (tab: SiswaTab) => void;
}

export default function SiswaTabNav({
  activeTab,
  onTabChange,
}: SiswaTabNavProps) {
  return (
    <nav className="flex items-center gap-8 sm:gap-10 overflow-x-auto no-scrollbar py-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            id={`tab-siswa-${tab.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => onTabChange(tab)}
            className={`
              shrink-0 cursor-pointer text-sm transition-all pb-1.5
              ${
                isActive
                  ? "border-b-2 border-[#410070] text-[#410070] font-semibold"
                  : "text-[#4C4452] hover:text-[#101828] font-medium border-b-2 border-transparent"
              }
            `}
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {tab}
          </button>
        );
      })}
    </nav>
  );
}
