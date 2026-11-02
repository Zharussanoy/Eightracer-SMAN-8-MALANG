import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { OverviewInsight, Kampus, ProgramStudi } from "../types";

interface InsightBannerProps {
  insight: OverviewInsight;
  kampus: Kampus;
  prodi: ProgramStudi;
}

export default function InsightBanner({ insight, kampus, prodi }: InsightBannerProps) {
  return (
    <div className="relative overflow-visible rounded-3xl bg-gradient-to-r from-[#4A047D] via-[#5F089E] to-[#7B1FA2] text-white p-6 sm:p-8 shadow-lg shadow-purple-950/20 min-h-[160px]">
      {/* Decorative glow */}
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-80 h-80 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Sparkles decorative */}
      <Sparkles className="absolute top-4 left-1/2 w-4 h-4 text-yellow-300/60" aria-hidden="true" />
      <Sparkles className="absolute bottom-6 right-1/3 w-3 h-3 text-purple-200/50" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xl sm:text-2xl font-black leading-tight">
            Peluang penerimaan{" "}
            <span className="text-yellow-300">{prodi.nama}</span> meningkat{" "}
            <span className="text-yellow-300">{insight.peningkatan}</span> dibanding tahun lalu
          </h3>
          <p className="text-sm text-purple-100/90 leading-relaxed max-w-xl">
            Konsistensi nilai dan kesesuaian pilihan menjadi faktor terkuat di{" "}
            <span className="font-semibold text-white">{kampus.nama}</span>. AI menganalisis{" "}
            <span className="font-semibold text-white">{insight.jumlahRiwayat}</span> riwayat penerimaan.
          </p>
        </div>

        {/* Illustration - overflow visible */}
        <div className="hidden lg:flex justify-end items-end h-full">
          <div className="relative w-40 h-40 -mb-8">
            <Image
              src="/images/students-illustration.svg"
              alt="Ilustrasi siswa"
              width={160}
              height={160}
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
