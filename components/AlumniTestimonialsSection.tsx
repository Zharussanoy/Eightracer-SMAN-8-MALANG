import { Quote, Star, GraduationCap } from "lucide-react";

interface TestimonialItem {
  id: string;
  name: string;
  angkatan: string;
  kampus: string;
  jurusan: string;
  quote: string;
  avatarText: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: "testimoni-1",
    name: "Aura Nabila Salsabila",
    angkatan: "Alumni Angkatan 2023",
    kampus: "Universitas Brawijaya",
    jurusan: "Teknik Informatika",
    quote:
      "Berkat pemetaan profil dan data historis kelolosan di Eightracer, saya jadi jauh lebih mantap memilih jurusan Teknik Informatika di UB. Rekomendasinya sangat presisi dengan rekam jejak nilai rapor saya sejak semester awal!",
    avatarText: "AN",
  },
  {
    id: "testimoni-2",
    name: "Fadhil Arya Pratama",
    angkatan: "Alumni Angkatan 2022",
    kampus: "Institut Teknologi Bandung",
    jurusan: "Sekolah Teknik Elektro & Informatika",
    quote:
      "Fitur sebaran kampus dan direktori alumni sangat membantu saya saat persiapan SNBT. Bisa berdiskusi langsung dengan kakak tingkat yang sudah lolos di ITB memberikan insight strategi belajar yang luar biasa berharga.",
    avatarText: "FA",
  },
  {
    id: "testimoni-3",
    name: "Clarissa Putri Kirana",
    angkatan: "Alumni Angkatan 2024",
    kampus: "Universitas Indonesia",
    jurusan: "Pendidikan Dokter",
    quote:
      "Eightracer membuka mata saya tentang peluang lintas jurusan dan strategi seleksi PTN. Transparansi data alumni bikin kami angkatan baru tidak lagi bingung ataupun salah langkah dalam menentukan jurusan impian.",
    avatarText: "CP",
  },
];

export default function AlumniTestimonialsSection() {
  return (
    <section id="cerita-alumni" className="py-20 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 text-left">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#5F089E] uppercase block mb-2">
            CERITA & KESAN
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Cerita & Kesan Alumni
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Dengarkan langsung pengalaman lulusan SMAN 8 Malang yang telah terbantu dalam merencanakan masa depan studinya.
          </p>
        </div>

        {/* 3 Cards Grid: 1 Kolom Mobile, 3 Kolom Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#EFE6F5] border-2 border-[#5F089E]/50 hover:border-[#5F089E] shadow-sm hover:shadow-xl hover:shadow-purple-900/10 transition-all duration-300 transform hover:-translate-y-1.5"
            >
              {/* Icon Kutipan / Avatar */}
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white border border-[#5F089E]/20 flex items-center justify-center mb-5 text-[#5F089E] group-hover:scale-105 transition-all duration-300 shadow-xs relative">
                <Quote className="w-8 h-8 fill-[#5F089E]/15 stroke-[#5F089E] stroke-[1.8]" />
              </div>

              {/* Rating Bintang */}
              <div className="flex items-center gap-1 mb-4 text-[#FCC850]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FCC850] stroke-[#FCC850]" />
                ))}
              </div>

              {/* Kutipan Alumni */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 flex-1 italic">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Divider Pemisah */}
              <div className="w-full h-px bg-[#5F089E]/20 mb-5" />

              {/* Identitas Alumni: Nama, Angkatan, Kampus */}
              <div className="w-full flex flex-col items-center">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-[#5F089E] transition-colors">
                  {item.name}
                </h3>
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#5F089E] text-white font-bold text-[11px] tracking-wide mb-1.5 shadow-xs">
                  {item.angkatan}
                </span>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-[#5F089E] shrink-0" />
                  <span>
                    {item.kampus} &bull; {item.jurusan}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
