"use client";

import { useEffect, useState } from "react";
import type { FaktorKelulusan } from "../types";

interface FaktorProgressItemProps {
  faktor: FaktorKelulusan;
}

export default function FaktorProgressItem({ faktor }: FaktorProgressItemProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(faktor.persenBar), 150);
    return () => clearTimeout(timeout);
  }, [faktor.persenBar]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{faktor.label}</span>
        <span className="text-sm font-bold text-slate-900">{faktor.nilaiTampil}</span>
      </div>
      <div
        className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={faktor.persenBar}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${faktor.label}: ${faktor.nilaiTampil}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${faktor.warnBar}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="flex justify-end">
        <span className="text-xs text-slate-500 font-medium">{faktor.kualitas}</span>
      </div>
    </div>
  );
}
