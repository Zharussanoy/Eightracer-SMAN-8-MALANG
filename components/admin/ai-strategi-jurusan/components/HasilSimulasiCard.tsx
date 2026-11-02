import Image from "next/image";
import type { HasilSimulasi, TargetKampus, KategoriPeluang } from "../types";
import PeluangRing from "./PeluangRing";
import MiniMetricCard from "./MiniMetricCard";
import RekomendasiAiBox from "./RekomendasiAiBox";

interface HasilSimulasiCardProps {
  hasil: HasilSimulasi;
  target: TargetKampus;
}

function getBadgeStyle(kategori: KategoriPeluang): { container: string; text: string } {
  switch (kategori) {
    case "Sangat Potensial": return { container: "bg-emerald-100", text: "text-emerald-700" };
    case "Potensial": return { container: "bg-blue-100", text: "text-blue-700" };
    case "Kompetitif": return { container: "bg-amber-100", text: "text-amber-700" };
    case "Berisiko": return { container: "bg-red-100", text: "text-red-700" };
  }
}

export default function HasilSimulasiCard({ hasil, target }: HasilSimulasiCardProps) {
  const badge = getBadgeStyle(hasil.kategori);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Banner image */}
      <div className="relative h-36 w-full overflow-hidden shrink-0">
        <Image
          src="/images/hero-gate.svg"
          alt="Banner kampus"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d0d5e]/70 to-transparent" />
      </div>

      <div className="p-5 sm:p-6 flex flex-col gap-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900">Hasil Simulasi</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {target.nama} · {target.jenjang} {target.prodi}
            </p>
          </div>
          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${badge.container} ${badge.text}`}>
            {hasil.kategori}
          </span>
        </div>

        {/* Ring */}
        <div className="flex justify-center">
          <PeluangRing persen={hasil.peluangLolos} kategori={hasil.kategori} />
        </div>

        {/* Mini metric cards */}
        <div className="flex gap-2 sm:gap-3">
          <MiniMetricCard label="Nilai Rapor" nilai={hasil.nilaiRapor} sublabel={hasil.labelNilaiRapor} />
          <MiniMetricCard label="Riwayat Sekolah" nilai={hasil.riwayatSekolah} sublabel={hasil.labelRiwayat} />
          <MiniMetricCard label="Persaingan" nilai={hasil.persaingan} sublabel={hasil.labelPersaingan} />
        </div>

        {/* Rekomendasi AI */}
        <RekomendasiAiBox teks={hasil.rekomendasiAi} />
      </div>
    </div>
  );
}
