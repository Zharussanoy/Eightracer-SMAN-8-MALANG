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
      {/* Visual Ilustrasi Bagian Atas Box Hasil Simulasi dengan Gradasi Ungu ke Pudar/Putih di Bagian Bawah */}
      <div className="relative h-44 sm:h-52 md:h-56 lg:h-60 w-full overflow-hidden shrink-0 bg-linear-to-b from-[#4A0B7B] via-[#7526B5] to-white">
        {/* Layer 1: Tiga Awan di bagian atas (awan1, awan2, awan3) dengan efek pudar (mask fade) ke arah bawah */}
        <div className="absolute inset-x-0 top-0 h-full flex pointer-events-none z-0 [mask-image:linear-gradient(to_bottom,black_25%,transparent_80%)] [-webkit-mask-image:linear-gradient(to_bottom,black_25%,transparent_80%)]">
          <div className="relative w-1/3 h-full">
            <Image
              src="/images/ai-strategi-jurusan/awan1.svg"
              alt="Awan kiri"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          <div className="relative w-1/3 h-full">
            <Image
              src="/images/ai-strategi-jurusan/awan2.svg"
              alt="Awan tengah"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          <div className="relative w-1/3 h-full">
            <Image
              src="/images/ai-strategi-jurusan/awan3.svg"
              alt="Awan kanan"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

        {/* Layer Transisi Pudar ke Putih (latar belakang di belakang elemen ilustrasi utama) */}
        <div className="absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-linear-to-t from-white via-white/80 to-transparent z-5 pointer-events-none" />

        {/* Layer 2: Kincir Angin di sebelah paling kiri */}
        <div className="absolute -left-2 sm:-left-3 md:left-0 top-[28%] sm:top-[25%] w-28 sm:w-36 md:w-44 lg:w-48 aspect-[205/126] z-10 pointer-events-none">
          <Image
            src="/images/ai-strategi-jurusan/kincirangin.svg"
            alt="Kincir angin"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Layer 3: Anak Buku Terbang di sebelah kiri (tengah-kiri) */}
        <div className="absolute left-[24%] sm:left-[25%] md:left-[26%] top-3 sm:top-5 md:top-6 w-20 sm:w-28 md:w-32 lg:w-36 aspect-[132/114] z-10 pointer-events-none">
          <Image
            src="/images/ai-strategi-jurusan/anakbukuterbang.svg"
            alt="Anak di atas buku terbang"
            fill
            className="object-contain filter drop-shadow-sm"
            priority
          />
        </div>

        {/* Layer 4: Gedung Sekolah di Hasil Simulasi (sekolahdihasilsimulasi.svg) di kanan */}
        <div className="absolute -right-2 sm:right-0 md:right-2 bottom-0 w-48 sm:w-60 md:w-72 lg:w-80 aspect-[300/210] z-10 pointer-events-none">
          <Image
            src="/images/ai-strategi-jurusan/sekolahdihasilsimulasi.svg"
            alt="Gedung sekolah"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>

        {/* Layer 5: Anak di Depan Sekolah (anakdpnsekolah.svg) di depan gedung sekolah */}
        <div className="absolute right-4 sm:right-8 md:right-12 lg:right-16 bottom-0 w-28 sm:w-36 md:w-44 lg:w-48 aspect-[168/118] z-20 pointer-events-none">
          <Image
            src="/images/ai-strategi-jurusan/anakdpnsekolah.svg"
            alt="Siswa di depan sekolah"
            fill
            className="object-contain object-bottom filter drop-shadow-md"
            priority
          />
        </div>
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
