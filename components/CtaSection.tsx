import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="relative py-20 bg-gradient-to-r from-[#240b36] via-[#3b0764] to-[#4c1d95] text-white overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-5 leading-tight">
          Lets get started on something great
        </h2>

        <p className="text-base sm:text-lg text-purple-200/90 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-purple-900 font-bold text-sm sm:text-base shadow-xl shadow-black/20 hover:bg-purple-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#bantuan"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-all flex items-center justify-center"
          >
            Hubungi Konselor BK
          </Link>
        </div>
      </div>
    </section>
  );
}
