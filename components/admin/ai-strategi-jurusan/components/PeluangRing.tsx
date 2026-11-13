"use client";

import { useEffect, useState } from "react";
import type { KategoriPeluang } from "../types";

interface PeluangRingProps {
  persen: number;
  kategori: KategoriPeluang;
}

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getRingColor(kategori: KategoriPeluang): string {
  switch (kategori) {
    case "Sangat Potensial": return "#22c55e"; // green-500
    case "Potensial": return "#3b82f6";         // blue-500
    case "Kompetitif": return "#f59e0b";        // amber-500
    case "Berisiko": return "#ef4444";          // red-500
  }
}

export default function PeluangRing({ persen, kategori }: PeluangRingProps) {
  const [animatedPersen, setAnimatedPersen] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedPersen(persen), 100);
    return () => clearTimeout(timeout);
  }, [persen]);

  const offset = CIRCUMFERENCE - (animatedPersen / 100) * CIRCUMFERENCE;
  const ringColor = getRingColor(kategori);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg
          width="192"
          height="192"
          viewBox="0 0 192 192"
          className="absolute inset-0 -rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx="96"
            cy="96"
            r={RADIUS}
            fill="none"
            stroke="#3b1a6e"
            strokeWidth="12"
          />
          {/* Progress */}
          <circle
            cx="96"
            cy="96"
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-in-out, stroke 0.5s ease" }}
          />
        </svg>
        {/* Center content */}
        <div
          className="relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center"
          style={{ backgroundColor: "#2d0d5e" }}
        >
          <span
            className="text-4xl font-black text-white leading-none"
            role="progressbar"
            aria-valuenow={persen}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Peluang lolos ${persen}%`}
          >
            {persen}%
          </span>
          <span className="text-xs text-purple-200 mt-1 font-medium">Peluang lolos</span>
        </div>
      </div>
    </div>
  );
}
