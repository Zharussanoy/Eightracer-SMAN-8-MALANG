"use client";

import { useState, useCallback } from "react";
import type { SiswaProfil, TargetKampus, HasilSimulasi } from "./types";
import { fetchHasilSimulasi } from "./services/aiStrategiService";
import { MOCK_SISWA, MOCK_TARGET_KAMPUS, MOCK_HASIL_SIMULASI } from "./data/mock";
import SimulatorProfilCard from "./components/SimulatorProfilCard";
import HasilSimulasiCard from "./components/HasilSimulasiCard";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-slate-200 animate-pulse rounded-xl ${className ?? ""}`} />;
}

export default function SimulatorTab() {
  const [siswaList] = useState<SiswaProfil[]>(MOCK_SISWA);
  const [targetList] = useState<TargetKampus[]>(MOCK_TARGET_KAMPUS);
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>("s1");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("tk1");
  const [hasil, setHasil] = useState<HasilSimulasi | null>(
    MOCK_HASIL_SIMULASI["s1-tk1"] ?? null
  );
  const [isLoadingSimulasi, setIsLoadingSimulasi] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasAnalised, setHasAnalised] = useState(true);

  const runSimulasi = useCallback(async () => {
    if (!selectedSiswaId || !selectedTargetId) return;
    setIsLoadingSimulasi(true);
    setIsError(false);
    setHasAnalised(true);
    try {
      const result = await fetchHasilSimulasi(selectedSiswaId, selectedTargetId);
      setHasil(result);
    } catch {
      setIsError(true);
      setHasil(null);
    } finally {
      setIsLoadingSimulasi(false);
    }
  }, [selectedSiswaId, selectedTargetId]);

  const handleSiswaSelect = (id: string) => {
    setSelectedSiswaId(id);
  };

  const handleTargetSelect = (id: string) => {
    setSelectedTargetId(id);
  };

  const selectedTarget = targetList.find((t) => t.id === selectedTargetId) ?? targetList[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left: Profil Siswa + Target Kampus */}
      <SimulatorProfilCard
        siswaList={siswaList}
        selectedSiswaId={selectedSiswaId}
        onSiswaSelect={handleSiswaSelect}
        targetList={targetList}
        selectedTargetId={selectedTargetId}
        onTargetSelect={handleTargetSelect}
        onAnalisis={runSimulasi}
        isLoading={isLoadingSimulasi}
      />

      {/* Right: Hasil Simulasi */}
      <div>
        {isLoadingSimulasi && (
          <div className="space-y-4">
            <SkeletonBlock className="h-36 rounded-2xl" />
            <SkeletonBlock className="h-64 rounded-2xl" />
          </div>
        )}

        {isError && !isLoadingSimulasi && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-red-700">Gagal memuat hasil simulasi. Silakan coba lagi.</p>
            <button
              type="button"
              onClick={() => void runSimulasi()}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {hasil && selectedTarget && !isLoadingSimulasi && (
          <HasilSimulasiCard hasil={hasil} target={selectedTarget} />
        )}

        {!hasil && !isLoadingSimulasi && !isError && hasAnalised && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-600">Data simulasi tidak tersedia untuk kombinasi ini.</p>
            <p className="text-xs text-slate-400">Coba pilih siswa atau target kampus yang berbeda.</p>
          </div>
        )}

        {!hasil && !isLoadingSimulasi && !isError && !hasAnalised && (
          <div className="bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-100 rounded-2xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-700">Pilih siswa dan target kampus</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Tekan tombol <span className="font-semibold text-purple-700">Analisis</span> untuk melihat hasil simulasi peluang penerimaan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
