"use client";

import { Sparkles } from "lucide-react";
import type { Kampus, ProgramStudi } from "../types";

interface FilterAnalisisCardProps {
  kampusList: Kampus[];
  selectedKampusId: string;
  selectedProdiId: string;
  onKampusChange: (id: string) => void;
  onProdiChange: (id: string) => void;
  onAnalisis: () => void;
  isLoading: boolean;
}

export default function FilterAnalisisCard({
  kampusList,
  selectedKampusId,
  selectedProdiId,
  onKampusChange,
  onProdiChange,
  onAnalisis,
  isLoading,
}: FilterAnalisisCardProps) {
  const kampus = kampusList.find((k) => k.id === selectedKampusId);
  const prodiList: ProgramStudi[] = kampus?.programStudi ?? [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        {/* Perguruan Tinggi */}
        <div className="flex-1 space-y-1.5">
          <label htmlFor="filter-kampus" className="block text-sm font-bold text-slate-700">
            Perguruan Tinggi
          </label>
          <select
            id="filter-kampus"
            value={selectedKampusId}
            onChange={(e) => onKampusChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition cursor-pointer"
          >
            {kampusList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Program Studi */}
        <div className="flex-1 space-y-1.5">
          <label htmlFor="filter-prodi" className="block text-sm font-bold text-slate-700">
            Program Studi
          </label>
          <select
            id="filter-prodi"
            value={selectedProdiId}
            onChange={(e) => onProdiChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition cursor-pointer"
          >
            {prodiList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} - {p.jenjang}
              </option>
            ))}
          </select>
        </div>

        {/* Tombol Analisis */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onAnalisis}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 border border-purple-300 text-purple-700 font-bold text-sm hover:bg-purple-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isLoading ? "Menganalisis..." : "Analisis"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
