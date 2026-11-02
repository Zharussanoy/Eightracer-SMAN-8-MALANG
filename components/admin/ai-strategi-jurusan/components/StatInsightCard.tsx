import { TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface StatInsightCardProps {
  label: string;
  nilai: string;
  footer: string;
  icon: ReactNode;
  iconBg: string;   // tailwind classes e.g. "bg-blue-50"
  iconColor: string; // tailwind classes e.g. "text-blue-600"
}

export default function StatInsightCard({ label, nilai, footer, icon, iconBg, iconColor }: StatInsightCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{nilai}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center border border-current/20 shrink-0`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1 text-emerald-600">
        <TrendingUp className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">{footer}</span>
      </div>
    </div>
  );
}
