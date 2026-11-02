"use client";

import { useState, useCallback } from "react";
import { Building2, Sparkles, Route } from "lucide-react";
import type { Kampus, OverviewInsight } from "./types";
import { fetchOverviewInsight } from "./services/aiStrategiService";
import { MOCK_OVERVIEW } from "./data/mock";
import FilterAnalisisCard from "./components/FilterAnalisisCard";
import InsightBanner from "./components/InsightBanner";
import StatInsightCard from "./components/StatInsightCard";
import FaktorKelulusanCard from "./components/FaktorKelulusanCard";

interface OverviewTabProps {
  kampusList: Kampus[];
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-slate-200 animate-pulse rounded-xl ${className ?? ""}`} />;
}

export default function OverviewTab({ kampusList }: OverviewTabProps) {
  const defaultKampus = kampusList[0];
  const defaultProdi = defaultKampus?.programStudi[0];

  const [selectedKampusId, setSelectedKampusId] = useState(defaultKampus?.id ?? "ub");
  const [selectedProdiId, setSelectedProdiId] = useState(defaultProdi?.id ?? "ub-si");
  const [insight, setInsight] = useState<OverviewInsight | null>(() => {
    return (
      MOCK_OVERVIEW.find(
        (item) => item.kampusId === "ub" && item.prodiId === "ub-si"
      ) ?? MOCK_OVERVIEW[0] ?? null
    );
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleKampusChange = (id: string) => {
    setSelectedKampusId(id);
    const k = kampusList.find((item) => item.id === id);
    if (k && k.programStudi.length > 0) {
      setSelectedProdiId(k.programStudi[0].id);
    }
  };

  const runAnalisis = useCallback(async () => {
    if (!selectedKampusId || !selectedProdiId) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await fetchOverviewInsight(selectedKampusId, selectedProdiId);
      setInsight(result);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedKampusId, selectedProdiId]);

  const kampus = kampusList.find((k) => k.id === selectedKampusId) ?? defaultKampus;
  const prodi = kampus?.programStudi.find((p) => p.id === selectedProdiId) ?? defaultProdi;

  return (
    <div className="space-y-6">
      {/* Filter */}
      <FilterAnalisisCard
        kampusList={kampusList}
        selectedKampusId={selectedKampusId}
        selectedProdiId={selectedProdiId}
        onKampusChange={handleKampusChange}
        onProdiChange={setSelectedProdiId}
        onAnalisis={runAnalisis}
        isLoading={isLoading}
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-6">
          <SkeletonBlock className="h-40 rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </div>
          <SkeletonBlock className="h-72" />
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-red-700">Gagal memuat data analisis. Silakan coba lagi.</p>
          <button
            type="button"
            onClick={() => void runAnalisis()}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Data */}
      {insight && kampus && prodi && !isLoading && (
        <>
          {/* Insight Banner */}
          <InsightBanner insight={insight} kampus={kampus} prodi={prodi} />

          {/* 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatInsightCard
              label="Prediksi Lolos PTN"
              nilai={insight.prediksiLolos}
              footer={`${insight.peningkatan} tahun ini`}
              icon={<Building2 className="w-5 h-5" />}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatInsightCard
              label="Akurasi Rekomendasi"
              nilai={insight.akurasiRekomendasi}
              footer="Berdasarkan data historis"
              icon={<Sparkles className="w-5 h-5" />}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
            />
            <StatInsightCard
              label="Pilihan 1 Berhasil"
              nilai={insight.pilihan1Berhasil}
              footer="Dari seluruh pendaftar"
              icon={<Route className="w-5 h-5" />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
          </div>

          {/* Faktor Kelulusan */}
          <FaktorKelulusanCard faktorList={insight.faktorKelulusan} />
        </>
      )}

      {/* Empty state (no insight found for combination) */}
      {!insight && !isLoading && !isError && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-600">Data analisis tidak tersedia untuk kombinasi ini.</p>
          <p className="text-xs text-slate-400">Coba pilih perguruan tinggi atau program studi lain.</p>
        </div>
      )}
    </div>
  );
}
