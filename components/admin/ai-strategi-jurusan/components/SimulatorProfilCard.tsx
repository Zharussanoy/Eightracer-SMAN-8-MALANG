"use client";

import { Search, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { SiswaProfil, TargetKampus } from "../types";
import TargetKampusItem from "./TargetKampusItem";

interface SimulatorProfilCardProps {
  siswaList: SiswaProfil[];
  selectedSiswaId: string;
  onSiswaSelect: (id: string) => void;
  targetList: TargetKampus[];
  selectedTargetId: string;
  onTargetSelect: (id: string) => void;
  onAnalisis: () => void;
  isLoading: boolean;
}

export default function SimulatorProfilCard({
  siswaList,
  selectedSiswaId,
  onSiswaSelect,
  targetList,
  selectedTargetId,
  onTargetSelect,
  onAnalisis,
  isLoading,
}: SimulatorProfilCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSiswa = siswaList.filter((s) =>
    s.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSiswa = siswaList.find((s) => s.id === selectedSiswaId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-5 h-full">
      <div>
        <h3 className="text-base font-black text-slate-900">Simulator</h3>
        <p className="text-xs text-slate-500 mt-0.5">Pilih profil siswa dan target kampus</p>
      </div>

      {/* Profil Siswa */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profil Siswa</p>
        <div className="relative" ref={containerRef}>
          <label htmlFor="siswa-search" className="sr-only">Cari nama siswa</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="siswa-search"
              type="text"
              placeholder="Cari nama siswa"
              value={showDropdown ? searchQuery : (selectedSiswa?.nama ?? "")}
              onFocus={() => {
                setSearchQuery("");
                setShowDropdown(true);
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
            />
          </div>
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
              {filteredSiswa.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-500">Tidak ditemukan</p>
              ) : (
                filteredSiswa.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSiswaSelect(s.id);
                      setShowDropdown(false);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition hover:bg-purple-50 ${
                      s.id === selectedSiswaId ? "text-purple-700 bg-purple-50/50" : "text-slate-700"
                    }`}
                  >
                    {s.nama}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Target Kampus */}
      <div className="space-y-2 flex-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Kampus</p>
        <div className="space-y-2">
          {targetList.map((target) => (
            <TargetKampusItem
              key={target.id}
              target={target}
              isSelected={target.id === selectedTargetId}
              onSelect={onTargetSelect}
            />
          ))}
        </div>
      </div>

      {/* Tombol Analisis */}
      <button
        type="button"
        onClick={onAnalisis}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-50 border border-purple-300 text-purple-700 font-bold text-sm hover:bg-purple-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        <span>{isLoading ? "Menganalisis..." : "Analisis"}</span>
      </button>
    </div>
  );
}
