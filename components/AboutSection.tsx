import Image from "next/image";
import { GraduationCap, UserGroup, ChartNoAxesColumnIncreasing, Image as ImageIcon } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="tentang" className="py-20 sm:py-24 bg-[#FAF7FC] relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-purple-700 uppercase block">
              TENTANG EIGHTRACER
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
              Mendukung Setiap Langkah
              <br className="hidden sm:inline" /> Perjalanan Studi
            </h2>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
              Sistem manajemen data siswa dan alumni SMAN 8 Malang yang dirancang
              untuk membantu sekolah dan siswa dalam  mengelola rencana studi siswa
              dan rekam jejak kelulusan alumni di perguruan tinggi.
            </p>

            {/* 3 Metrics Items */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 border-t border-purple-200/70 divide-y sm:divide-y-0 sm:divide-x divide-purple-400/70">
              <div className="flex flex-col items-center text-center gap-3 py-5 sm:py-0 sm:px-6 first:sm:pl-0">
                <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-sm">
                  <GraduationCap className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-extrabold text-slate-900">
                    100+
                  </span>
                  <span className="text-xs font-semibold text-slate-600 leading-tight block mt-0.5">
                    Mitra Kampus & PTN
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 py-5 sm:py-0 sm:px-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-sm">
                  <UserGroup className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-extrabold text-slate-900">
                    10.000+
                  </span>
                  <span className="text-xs font-semibold text-slate-600 leading-tight block mt-0.5">
                    Alumni Terdaftar
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 py-5 sm:py-0 sm:px-6 last:sm:pr-0">
                <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-sm">
                  <ChartNoAxesColumnIncreasing className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-extrabold text-slate-900">
                    95%
                  </span>
                  <span className="text-xs font-semibold text-slate-600 leading-tight block mt-0.5">
                    Akurasi Rekomendasi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/*Gambar*/}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] flex items-center justify-center">
              <Image
                src="/images/students-illustration.svg"
                alt="Ilustrasi Siswa SMAN 8 Malang Belajar Bersama"
                width={560}
                height={420}
                priority
                className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
