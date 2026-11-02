"use client";

import { CheckCircle2 } from "lucide-react";
import type { TargetKampus } from "../types";

interface TargetKampusItemProps {
  target: TargetKampus;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function TargetKampusItem({ target, isSelected, onSelect }: TargetKampusItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(target.id)}
      className={`w-full text-left rounded-xl border-2 p-3 sm:p-4 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
        isSelected
          ? "border-purple-500 bg-purple-50"
          : "border-slate-200 bg-slate-50/50 hover:border-purple-200 hover:bg-purple-50/30"
      }`}
      aria-pressed={isSelected}
      aria-label={`${target.nama} - ${target.prodi}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">{target.nama}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {target.prodi} · {target.jenjang} · Estimasi {target.estimasiPersen}%
          </p>
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}
