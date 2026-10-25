import Link from "next/link";
import {
  UserCircle2,
  ChartPie,
  ChartNoAxesCombined,
  Laptop2,
  ArrowRight,
} from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const services: ServiceItem[] = [
  {
    id: "pemetaan-profil",
    title: "Pemetaan Nilai Profil Siswa",
    description:
      "Analisis komprehensif nilai siswa dengan visualisasi grafik untuk memetakan minat dan potensi akademik secara akurat.",
    icon: <UserCircle2 className="w-12 h-12 text-slate-700 stroke-[1.6]" />,
    link: "#pemetaan-profil",
  },
  {
    id: "kelolosan-ptn",
    title: "Kelolosan Masuk dan Seleksi PTN",
    description:
      "Pantau peluang lolos seleksi PTN berdasarkan riwayat data historis kelolosan dan tren nilai dari tahun ke tahun.",
    icon: <ChartPie className="w-12 h-12 text-slate-700 stroke-[1.6]" />,
    link: "#kelolosan-ptn",
  },
  {
    id: "persebaran-kampus",
    title: "Data Kelulusan dan Persebaran Kampus",
    description:
      "Akses direktori alumni dan susun strategi pilihan jurusan berdasarkan riwayat penerimaan PTN tahun sebelumnya.",
    icon: <ChartNoAxesCombined className="w-12 h-12 text-slate-700 stroke-[1.6]" />,
    link: "/admin?tab=direktori&role=siswa",
  },
  {
    id: "karir-alumni",
    title: "Pantau Perkembangan dan Karir Alumni",
    description:
      "Jalin koneksi dengan alumni dan pantau prospek karir serta perkembangan studi lulusan di dunia profesional.",
    icon: <Laptop2 className="w-12 h-12 text-slate-700 stroke-[1.6]" />,
    link: "#karir-alumni",
  },
];

export default function ServicesSection() {
  return (
    <section id="layanan" className="py-20 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 text-left">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#5F089E] uppercase block mb-2">
            LAYANAN KAMI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            4 Layanan Utama Berbasis Data
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Akses berbagai keunggulan fitur yang disesuaikan untuk perguruan tinggi
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#EFE6F5] border-2 border-[#5F089E]/50 hover:border-[#5F089E] shadow-sm hover:shadow-xl hover:shadow-purple-900/10 transition-all duration-300 transform hover:-translate-y-1.5"
            >
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white border border-[#5F089E]/20 flex items-center justify-center mb-5 text-slate-800 group-hover:scale-105 transition-all duration-300 shadow-xs">
                {service.icon}
              </div>

              {/* Judul */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2.5 group-hover:text-[#5F089E] transition-colors line-clamp-2 min-h-[48px] flex items-center justify-center">
                {service.title}
              </h3>

              {/* Deskripsi */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 flex-1">
                {service.description}
              </p>

              {/* Tombol Aksi */}
              <Link
                href={service.link}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] active:bg-[#3d0566] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 transition-all group-hover:gap-2"
              >
                <span>Lihat Layanan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
