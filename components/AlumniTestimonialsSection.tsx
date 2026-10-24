"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialItem {
  id: string;
  name: string;
  angkatan: string;
  kampus: string;
  jurusan: string;
  quote: string;
  avatarText: string;
  highlight: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: "testimoni-1",
    name: "Aura Nabila Salsabila",
    angkatan: "Alumni Angkatan 2023",
    kampus: "Universitas Brawijaya (UB)",
    jurusan: "Teknik Informatika",
    quote:
      "Berkat pemetaan profil dan data historis kelolosan di Eightracer, saya jadi jauh lebih mantap memilih jurusan Teknik Informatika di UB. Rekomendasinya sangat presisi dengan rekam jejak nilai rapor saya sejak semester awal!",
    avatarText: "AN",
    highlight: "Lolos SNBP Pilihan 1",
  },
  {
    id: "testimoni-2",
    name: "Fadhil Arya Pratama",
    angkatan: "Alumni Angkatan 2022",
    kampus: "Institut Teknologi Bandung (ITB)",
    jurusan: "Sekolah Teknik Elektro & Informatika",
    quote:
      "Fitur sebaran kampus dan direktori alumni sangat membantu saya saat persiapan SNBT. Bisa berdiskusi langsung dengan kakak tingkat yang sudah lolos di ITB memberikan insight strategi belajar yang luar biasa berharga.",
    avatarText: "FA",
    highlight: "Skor UTBK 720+",
  },
  {
    id: "testimoni-3",
    name: "Clarissa Putri Kirana",
    angkatan: "Alumni Angkatan 2024",
    kampus: "Universitas Indonesia (UI)",
    jurusan: "Pendidikan Dokter",
    quote:
      "Eightracer membuka mata saya tentang peluang lintas jurusan dan strategi seleksi PTN. Transparansi data alumni bikin kami angkatan baru tidak lagi bingung ataupun salah langkah dalam menentukan jurusan impian.",
    avatarText: "CP",
    highlight: "Lolos Jalur SNBP Kedokteran",
  },
  {
    id: "testimoni-4",
    name: "Bagas Satria Wibowo",
    angkatan: "Alumni Angkatan 2023",
    kampus: "Institut Teknologi Sepuluh Nopember (ITS)",
    jurusan: "Sistem Informasi",
    quote:
      "Sistem analitik Eightracer membantu membedah tingkat persaingan antar sekolah secara realistis. Saya bisa menyusun portofolio prestasi pendukung yang tepat sasaran hingga tembus di ITS Surabaya.",
    avatarText: "BS",
    highlight: "Juara Olimpiade Informatika",
  },
  {
    id: "testimoni-5",
    name: "Dinda Rahmadhani",
    angkatan: "Alumni Angkatan 2024",
    kampus: "Universitas Gadjah Mada (UGM)",
    jurusan: "Hubungan Internasional",
    quote:
      "Panduan konsultasi dari alumni lintas fakultas di Eightracer memberikan gambaran nyata kehidupan perkuliahan di UGM. Sangat memotivasi saya selama berjuang di bangku kelas 12!",
    avatarText: "DR",
    highlight: "Alumni Aktif Organisasi",
  },
];

export default function AlumniTestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const total = testimonials.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer yang halus
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlay, handleNext]);

  return (
    <section
      id="cerita-alumni"
      className="py-20 sm:py-28 bg-gradient-to-b from-white via-[#FCF9FE] to-white relative overflow-hidden select-none"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Decorative Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-200/30 via-[#5F089E]/10 to-amber-200/25 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 text-center sm:text-left">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#5F089E] uppercase block mb-2">
            CERITA & KESAN ALUMNI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Inspirasi Nyata Lulusan SMAN 8 Malang
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Dengarkan langsung pengalaman dan strategi alumni Eightracer yang sukses menembus perguruan tinggi negeri impian di seluruh Indonesia.
          </p>
        </div>

        {/* 3D COVERFLOW ROTARY CAROUSEL STAGE */}
        <div
          className="relative w-full h-[540px] sm:h-[500px] flex items-center justify-center"
          style={{ perspective: "1200px" }}
        >
          <div className="relative w-full max-w-[920px] h-full flex items-center justify-center">
            {testimonials.map((item, idx) => {
              // Hitung jarak rotasi melingkar (-2, -1, 0, 1, 2)
              let offset = idx - currentIndex;
              if (offset > total / 2) offset -= total;
              if (offset < -total / 2) offset += total;

              const isCenter = offset === 0;
              const isPrev = offset === -1;
              const isNext = offset === 1;
              const isVisible = Math.abs(offset) <= 2;

              if (!isVisible) return null;

              // Transformasi 3D Coverflow
              const xPos = offset * 260; // Geser horizontal
              const zPos = isCenter ? 80 : -Math.abs(offset) * 160; // Kedalaman 3D
              const rotateY = offset * -32; // Sudut putar 3D coverflow
              const scale = isCenter ? 1 : 0.85 - Math.abs(offset) * 0.05;
              const opacity = isCenter ? 1 : Math.max(0.25, 0.75 - Math.abs(offset) * 0.35);
              const zIndex = 30 - Math.abs(offset) * 10;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    if (isPrev) handlePrev();
                    if (isNext) handleNext();
                  }}
                  animate={{
                    x: xPos,
                    z: zPos,
                    rotateY: rotateY,
                    scale: scale,
                    opacity: opacity,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 24,
                    mass: 0.8,
                  }}
                  style={{
                    zIndex,
                    transformStyle: "preserve-3d",
                  }}
                  className={`absolute w-[330px] sm:w-[420px] rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-xl border-2 transition-shadow duration-300 cursor-pointer ${isCenter
                      ? "border-[#5F089E] shadow-2xl shadow-purple-900/15"
                      : "border-purple-200/80 hover:border-purple-400 shadow-md"
                    }`}
                >
                  {/* Badge Status Kelolosan Bersih Tanpa Sparkling */}
                  <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-purple-100/70">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFE6F5] text-[#5F089E] font-bold text-xs border border-[#5F089E]/20">
                      {item.highlight}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-400">
                      Verifikasi Tracer
                    </span>
                  </div>

                  {/* Kutipan Alumni dengan Spacing yang Lega dan Teratur */}
                  <div className="relative mb-6 min-h-[110px] sm:min-h-[120px] flex items-start">
                    <Quote className="w-6 h-6 text-[#5F089E]/30 shrink-0 mt-0.5 mr-2" />
                    <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed font-normal italic flex-1">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="w-full h-px bg-purple-100/80 mb-5" />

                  {/* Identitas Alumni */}
                  <div className="flex items-center gap-3.5 pt-1">
                    <div className="w-12 h-12 rounded-2xl bg-[#5F089E] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-purple-300">
                      {item.avatarText}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#5F089E] shrink-0" />
                        <span className="truncate">{item.kampus}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#5F089E] block truncate mt-0.5">
                        {item.jurusan} &bull; {item.angkatan}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tombol Navigasi Kiri / Kanan */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Testimoni Sebelumnya"
            className="absolute left-1 sm:left-4 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/90 hover:bg-[#5F089E] text-[#5F089E] hover:text-white border border-purple-200/80 shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Testimoni Berikutnya"
            className="absolute right-1 sm:right-4 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/90 hover:bg-[#5F089E] text-[#5F089E] hover:text-white border border-purple-200/80 shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Indikator Dot Navigasi */}
        <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ke slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex
                  ? "w-8 bg-[#5F089E] shadow-xs"
                  : "w-2.5 bg-purple-200 hover:bg-purple-300"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
