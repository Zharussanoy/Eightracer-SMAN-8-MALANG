import Image from "next/image";
import type { OverviewInsight, Kampus, ProgramStudi } from "../types";

interface InsightBannerProps {
  insight: OverviewInsight;
  kampus: Kampus;
  prodi: ProgramStudi;
}

export default function InsightBanner({
  insight,
  kampus,
  prodi,
}: InsightBannerProps) {
  return (
    <div className="relative mt-8 sm:mt-12 mr-10 sm:mr-16 md:mr-20 lg:mr-24">
      {/* Box Utama Banner dengan Gradasi Ungu Tua di Kiri ke Ungu Pudar di Kanan */}
      <div className="relative overflow-visible rounded-3xl bg-linear-to-r from-[#5F089E] via-[#8543B6] to-[#C7A9DD] text-white p-6 sm:p-8 lg:p-10 shadow-lg shadow-purple-950/15 min-h-[170px] sm:min-h-[190px] lg:min-h-[220px] flex items-center">
        {/* Glow lembut dekoratif di background */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-80 h-80 bg-purple-300/10 rounded-full blur-2xl pointer-events-none" />

        {/* Konten Teks di Sisi Kiri */}
        <div className="relative z-10 max-w-[50%] sm:max-w-[54%] md:max-w-[58%] lg:max-w-[60%] space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight">
            Peluang penerimaan {prodi.nama} meningkat {insight.peningkatan} dibanding tahun lalu
          </h3>
          <p className="text-xs sm:text-sm text-purple-100/95 leading-relaxed font-normal">
            Konsistensi nilai dan kesesuaian pilihan menjadi faktor terkuat di {kampus.nama}. AI menganalisis {insight.jumlahRiwayat} riwayat penerimaan
          </p>
        </div>

        {/* Gambar Buku Melayang (sampingguru.svg) dibuat besar & digeser lebih ke kanan */}
        <div className="absolute right-0 translate-x-[10%] top-1/2 -translate-y-1/2 w-52 sm:w-72 md:w-88 lg:w-[460px] h-52 sm:h-72 md:h-88 lg:h-[460px] z-10 pointer-events-none flex items-center justify-center">
          <Image
            src="/images/ai-strategi-jurusan/sampingguru.svg"
            alt="Ilustrasi buku-buku berterbangan"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Guru (Guru.svg) lebih proporsional & lebih ke kanan, mengintip dari luar box sambil memegang sudut box */}
        <div className="absolute right-0 translate-x-[87%] -top-3 sm:-top-5 md:-top-7 lg:-top-8 w-16 sm:w-20 md:w-24 lg:w-28 h-[140px] sm:h-[180px] md:h-[210px] lg:h-[240px] z-20 pointer-events-none">
          <Image
            src="/images/ai-strategi-jurusan/Guru.svg"
            alt="Ilustrasi Guru mengintip box"
            fill
            className="object-contain object-bottom filter drop-shadow-md"
            priority
          />
        </div>
      </div>
    </div>
  );
}
