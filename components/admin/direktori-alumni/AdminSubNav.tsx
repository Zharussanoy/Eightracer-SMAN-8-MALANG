"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, Users } from "lucide-react";
import { useUser, PresetKey } from "@/context/UserContext";

export default function AdminSubNav() {
  const pathname = usePathname();
  const { currentPreset, switchRole } = useUser();

  const isAdminDashboard = pathname === "/admin";
  const isAlumniManagement = pathname.startsWith("/admin/direktori-alumni");

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PORTAL ADMIN</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/admin"
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                isAdminDashboard
                  ? "bg-white/15 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard Admin</span>
            </Link>

            <Link
              href="/admin/direktori-alumni"
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                isAlumniManagement
                  ? "bg-white/15 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kelola Data Alumni</span>
            </Link>
          </div>
        </div>

        {/* Quick Role Switcher for Developer Testing */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-slate-400 text-[11px]">Simulasi Role:</span>
          {(
            [
              { key: "admin", label: "Admin" },
              { key: "siswa_aktif", label: "Siswa" },
              { key: "siswa_alumni", label: "Alumni" },
              { key: "guru", label: "Guru" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => switchRole(item.key as PresetKey)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                currentPreset === item.key
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

