import { Bot } from "lucide-react";

interface RekomendasiAiBoxProps {
  teks: string;
}

export default function RekomendasiAiBox({ teks }: RekomendasiAiBoxProps) {
  return (
    <div className="border-2 border-purple-300 bg-purple-50 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-purple-700" />
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          <span className="font-bold text-purple-800">Rekomendasi AI : </span>
          {teks}
        </p>
      </div>
    </div>
  );
}
