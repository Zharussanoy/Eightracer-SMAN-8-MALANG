"use client";

import { useState } from "react";
import { useUser, PresetKey } from "@/context/UserContext";
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  Users,
  GraduationCap,
  BookOpen,
} from "lucide-react";

interface RoleOption {
  preset: PresetKey;
  label: string;
  roleType: string;
  badge: string;
  description: string;
  colorClass: {
    activeBorder: string;
    activeBg: string;
    badgeBg: string;
    badgeText: string;
    dot: string;
  };
  icon: React.ReactNode;
}

const ROLES: RoleOption[] = [
  {
    preset: "admin",
    label: "Admin",
    roleType: "admin",
    badge: "Superadmin",
    description: "Akses Semua Fitur",
    colorClass: {
      activeBorder: "border-red-400 ring-2 ring-red-400/20",
      activeBg: "bg-red-50/60",
      badgeBg: "bg-red-100",
      badgeText: "text-red-700",
      dot: "bg-red-500",
    },
    icon: <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />,
  },
  {
    preset: "siswa_alumni",
    label: "Alumni",
    roleType: "alumni",
    badge: "Siswa Lulus",
    description: "Akses Alumni",
    colorClass: {
      activeBorder: "border-emerald-400 ring-2 ring-emerald-400/20",
      activeBg: "bg-emerald-50/60",
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    icon: <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />,
  },
  {
    preset: "guru",
    label: "Guru",
    roleType: "guru",
    badge: "Wali Kelas",
    description: "Akses Wali Kelas",
    colorClass: {
      activeBorder: "border-blue-400 ring-2 ring-blue-400/20",
      activeBg: "bg-blue-50/60",
      badgeBg: "bg-blue-100",
      badgeText: "text-blue-700",
      dot: "bg-blue-500",
    },
    icon: <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />,
  },
  {
    preset: "siswa_aktif",
    label: "Siswa",
    roleType: "siswa",
    badge: "Kelas XII",
    description: "Akses Siswa",
    colorClass: {
      activeBorder: "border-purple-400 ring-2 ring-purple-400/20",
      activeBg: "bg-purple-50/60",
      badgeBg: "bg-purple-100",
      badgeText: "text-purple-700",
      dot: "bg-purple-500",
    },
    icon: <Users className="w-4 h-4 text-purple-600 shrink-0" />,
  },
];

export default function DevRoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentPreset, switchRole, getDisplayRole } = useUser();
  const displayRole = getDisplayRole();

  const activeOption =
    ROLES.find((r) => r.preset === currentPreset) || ROLES[3];

  return (
    <aside
      aria-label="Development Role Switcher"
      className="fixed bottom-4 right-4 z-50 font-sans print:hidden"
    >
      {/* Minimized Pill Toggle */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white shadow-xl shadow-slate-950/20 border border-slate-700 backdrop-blur-md transition-all hover:scale-105 cursor-pointer text-xs font-semibold"
          title="Klik untuk membuka Pengalih Role Simulasi Dev"
        >
          <span className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px] tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Role Dev:
          </span>

          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-white text-[11px] font-bold border border-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${activeOption.colorClass.dot}`}
            />
            {displayRole.label}
          </span>

          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}

      {/* Expanded Modal / Card */}
      {isOpen && (
        <div className="w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-purple-950 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/10 text-amber-300">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold tracking-tight">
                  Simulasi Role (Dev Mode)
                </h4>
                <p className="text-[10px] text-slate-300">
                  Uji antarmuka tiap peran tanpa login
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Tutup Switcher"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Body: List Roles */}
          <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
            {ROLES.map((roleOpt) => {
              const isCurrent = currentPreset === roleOpt.preset;

              return (
                <button
                  key={roleOpt.preset}
                  type="button"
                  onClick={() => {
                    switchRole(roleOpt.preset);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${isCurrent
                    ? `${roleOpt.colorClass.activeBorder} ${roleOpt.colorClass.activeBg}`
                    : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 bg-white"
                    }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5">{roleOpt.icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {roleOpt.label}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleOpt.colorClass.badgeBg} ${roleOpt.colorClass.badgeText}`}
                        >
                          {roleOpt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-1 line-clamp-2">
                        {roleOpt.description}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <div className="shrink-0 p-1 rounded-full bg-purple-600 text-white shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>
              Role aktif:{" "}
              <strong className="text-slate-800">{displayRole.label}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#5F089E] font-bold hover:underline cursor-pointer"
            >
              Sembunyikan
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

