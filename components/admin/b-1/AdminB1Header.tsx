"use client";

import { B1Tab } from "./types";

interface AdminB1HeaderProps {
  activeTab?: B1Tab;
}

export default function AdminB1Header({
  activeTab = "Pusat Manajemen Data",
}: AdminB1HeaderProps) {
  let title = "Pusat Manajemen Data";
  let description =
    "Pantau kelengkapan data siswa SMAN 8 Malang secara berkala. Unggah data akademik dan tes RIASEC dengan mudah secara otomatis.";

  if (activeTab === "Dashboard Konseling") {
    title = "Dashboard Konseling";
    description =
      "Analisis keselarasan nilai akademik dengan rekomendasi mapel pilihan dan hasil asesmen minat bakat siswa.";
  } else if (activeTab === "Validasi & Surat Rekomendasi") {
    title = "Validasi dan Penerbitan Surat Rekomendasi";
    description =
      "Validasi dan terbitkan surat rekomendasi resmi peminatan mata pelajaran pilihan bagi siswa.";
  } else if (activeTab === "Feedback Strategi & Direktori BK") {
    title = "Feedback Strategi & Direktori BK";
    description =
      "Evaluasi tren capaian nilai mapel peminatan dan direktori kontak guru BK pembimbing.";
  } else if (activeTab === "Mengelola Wali Kelas") {
    title = "Mengelola Wali Kelas";
    description =
      "Kelola identitas, penugasan kelas yang diampu, serta akun login wali kelas untuk memvalidasi nilai rapor dan profil siswa.";
  }

  return (
    <div className="pt-2 pb-6 space-y-1.5 font-sans">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
        {title}
      </h1>
      <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-3xl">
        {description}
      </p>
    </div>
  );
}
