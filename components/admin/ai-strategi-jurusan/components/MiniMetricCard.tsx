interface MiniMetricCardProps {
  label: string;
  nilai: string;
  sublabel: string;
}

export default function MiniMetricCard({ label, nilai, sublabel }: MiniMetricCardProps) {
  return (
    <div className="flex-1 border border-purple-200 rounded-xl p-3 text-center bg-white">
      <p className="text-xs text-slate-500 font-semibold mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900 leading-none">{nilai}</p>
      <p className="text-xs text-emerald-600 font-semibold mt-1">{sublabel}</p>
    </div>
  );
}
