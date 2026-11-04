"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { KategoriPeluang } from "../types";

interface PeluangRingProps {
  persen: number;
  kategori: KategoriPeluang;
}

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CategoryTheme {
  gradientId: string;
  startColor: string;
  endColor: string;
  glowColor: string;
}

function getCategoryTheme(kategori: KategoriPeluang): CategoryTheme {
  switch (kategori) {
    case "Sangat Potensial":
      return {
        gradientId: "grad-sangat-potensial",
        startColor: "#34D399", // emerald-400
        endColor: "#059669",   // emerald-600
        glowColor: "rgba(16, 185, 129, 0.45)",
      };
    case "Potensial":
      return {
        gradientId: "grad-potensial",
        startColor: "#60A5FA", // blue-400
        endColor: "#2563EB",   // blue-600
        glowColor: "rgba(59, 130, 246, 0.45)",
      };
    case "Kompetitif":
      return {
        gradientId: "grad-kompetitif",
        startColor: "#FBBF24", // amber-400
        endColor: "#D97706",   // amber-600
        glowColor: "rgba(245, 158, 11, 0.45)",
      };
    case "Berisiko":
      return {
        gradientId: "grad-berisiko",
        startColor: "#F87171", // red-400
        endColor: "#DC2626",   // red-600
        glowColor: "rgba(239, 68, 68, 0.45)",
      };
  }
}

export default function PeluangRing({ persen, kategori }: PeluangRingProps) {
  const [displayNumber, setDisplayNumber] = useState(0);
  const theme = getCategoryTheme(kategori);

  // Animasi angka count-up fluid (0 -> persen)
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1200; // 1.2 detik

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out exponential untuk akselerasi awal dan perlambatan halus di akhir
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(persen * easeProgress);
      setDisplayNumber(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [persen]);

  const offset = CIRCUMFERENCE - (persen / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-52 h-52 flex items-center justify-center"
      >
        {/* Glow ambient lembut di belakang lingkaran */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-4 rounded-full blur-xl pointer-events-none"
          style={{ backgroundColor: theme.glowColor }}
        />

        {/* SVG Progress Ring */}
        <svg
          width="208"
          height="208"
          viewBox="0 0 208 208"
          className="absolute inset-0 -rotate-90 pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            {/* Gradasi warna progress ring berdasarkan kategori */}
            <linearGradient id={theme.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.startColor} />
              <stop offset="100%" stopColor={theme.endColor} />
            </linearGradient>

            {/* Filter glow lembut pada progress ring */}
            <filter id={`glow-${theme.gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={theme.startColor} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Track Latar Belakang (Lingkaran Rel) */}
          <circle
            cx="104"
            cy="104"
            r={RADIUS}
            fill="none"
            stroke="#2D0D5E"
            strokeWidth="12"
            strokeOpacity="0.25"
          />

          {/* Progress Bar Lingkaran dengan Animasi Smooth Framer Motion */}
          <motion.circle
            cx="104"
            cy="104"
            r={RADIUS}
            fill="none"
            stroke={`url(#${theme.gradientId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            filter={`url(#glow-${theme.gradientId})`}
          />
        </svg>

        {/* Lingkaran Bagian Dalam: Gradasi Radial dari Bagian Dalam Pudar ke Luar Makin Pekat */}
        <div
          className="relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl overflow-hidden border border-purple-300/20"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #B768FC 0%, #8D32DF 32%, #5D14A4 65%, #350862 86%, #1E033A 100%)",
            boxShadow:
              "inset 0 2px 12px rgba(255, 255, 255, 0.25), inset 0 -4px 12px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(30, 3, 58, 0.35)",
          }}
        >
          {/* Kilau Halus di Bagian Atas Lingkaran */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/20 to-transparent rounded-t-full pointer-events-none" />

          {/* Teks Persentase dengan Animasi Angka Count-Up */}
          <span
            className="text-4xl font-black text-white leading-none tracking-tight drop-shadow-md"
            role="progressbar"
            aria-valuenow={persen}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Peluang lolos ${persen}%`}
          >
            {displayNumber}%
          </span>
          <span className="text-xs text-purple-200 mt-1 font-semibold tracking-wide drop-shadow-xs">
            Peluang lolos
          </span>
        </div>
      </motion.div>
    </div>
  );
}
