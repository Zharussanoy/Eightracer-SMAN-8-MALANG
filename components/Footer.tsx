import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#24033e] text-purple-200/90 pt-16 pb-12 border-t border-purple-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-purple-900/60">
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3.5">
              <div className="w-11 h-11 relative rounded-xl overflow-hidden bg-purple-700 flex items-center justify-center text-white shadow-md shrink-0">
                <Image
                  src="/images/logo.svg"
                  alt="Eightracer Logo"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight gap-0.5">
                <span className="text-xl font-bold tracking-tight text-white">
                  Eightracer
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-purple-400 uppercase">
                  SMAN 8 MALANG
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-purple-300/80 leading-relaxed max-w-sm">
              Satu portal terpadu pemantauan studi, seleksi perguruan tinggi
              negeri, dan pelacakan karir alumni SMAN 8 Malang berbasis analitik data akurat.
            </p>
            <div className="pt-2 space-y-2 text-xs text-purple-300/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Jl. Veteran No. 19, Penanggungan, Kec. Klojen, Kota Malang, Jawa Timur 65145</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span>info@sman8malang.sch.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                <span>(0341) 551096</span>
              </div>
            </div>
          </div>

          {/*Layanan*/}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Layanan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#layanan" className="hover:text-white transition-colors">
                  Pemetaan Nilai
                </Link>
              </li>
              <li>
                <Link href="#layanan" className="hover:text-white transition-colors">
                  Kelolosan PTN
                </Link>
              </li>
              <li>
                <Link href="#layanan" className="hover:text-white transition-colors">
                  Persebaran Kampus
                </Link>
              </li>
              <li>
                <Link href="#layanan" className="hover:text-white transition-colors">
                  Karir Alumni
                </Link>
              </li>
              <li>
                <Link href="#layanan" className="hover:text-white transition-colors">
                  Rekomendasi Jurusan
                </Link>
              </li>
            </ul>
          </div>

          {/*Navigasi*/}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Navigasi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/#tentang" className="hover:text-white transition-colors">
                  Tentang Eightracer
                </Link>
              </li>
              <li>
                <Link href="/#layanan" className="hover:text-white transition-colors">
                  Layanan
                </Link>
              </li>
              <li>
                <Link href="/tim-pengembang" className="hover:text-white transition-colors">
                  Tim Pengembang
                </Link>
              </li>
              <li>
                <Link href="#profil" className="hover:text-white transition-colors">
                  Profil SMAN 8
                </Link>
              </li>
            </ul>
          </div>

          {/*Jalur Seleksi*/}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Jalur PTN
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#snbp" className="hover:text-white transition-colors">
                  SNBP (Prestasi)
                </Link>
              </li>
              <li>
                <Link href="#snbt" className="hover:text-white transition-colors">
                  SNBT (UTBK)
                </Link>
              </li>
              <li>
                <Link href="#mandiri" className="hover:text-white transition-colors">
                  Seleksi Mandiri
                </Link>
              </li>
              <li>
                <Link href="#kedinasan" className="hover:text-white transition-colors">
                  Sekolah Kedinasan
                </Link>
              </li>
              <li>
                <Link href="#beasiswa" className="hover:text-white transition-colors">
                  Beasiswa Kuliah
                </Link>
              </li>
            </ul>
          </div>

          {/*Sumber Daya*/}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Sumber Daya
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#panduan" className="hover:text-white transition-colors">
                  Panduan Siswa
                </Link>
              </li>
              <li>
                <Link href="#kebijakan" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="#syarat" className="hover:text-white transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-white transition-colors">
                  FAQ Pertanyaan
                </Link>
              </li>
              <li>
                <Link href="#alumni" className="hover:text-white transition-colors">
                  Database Alumni
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-300/70">
          <div className="flex items-center gap-2"></div>
          <div>
            &copy; 2025 Eightracer - SMAN 8 MALANG. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
