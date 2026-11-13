import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-gate.svg"
          alt="Gerbang Depan SMAN 8 Malang"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/90 via-purple-950/75 to-purple-900/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b082e] via-transparent to-black/30" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center sm:text-left w-full">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-white tracking-tight leading-[1.2]">
            Satu Portal untuk <span className="text-[#FCC850] font-extrabold">Rencana</span>
            <br />
            <span className="text-[#FCC850] font-extrabold">Studi</span> Siswa
          </h1>

          <p className="text-base sm:text-lg text-purple-100/90 font-normal leading-relaxed max-w-2xl drop-shadow-sm">
            Pantau Pemetaan Kelas, Kelolosan Seleksi PTN, hingga Perkembangan
            Studi Alumni SMAN 8 Malang Secara Terpadu & Real-Time di Satu Tempat.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Link
              href="#layanan"
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white text-[#5F089E] font-bold text-sm sm:text-base shadow-xl shadow-purple-950/30 hover:bg-purple-50 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group"
            >
              <span>Lihat Selengkapnya</span>
              <div className="w-7 h-7 rounded-full bg-[#5F089E]/10 flex items-center justify-center text-[#5F089E] group-hover:bg-[#5F089E] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
}
