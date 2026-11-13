import {
  MapelPilihanDetail,
  EvaluasiNilaiRowItem,
  PenghargaanSiswaItem,
} from "./types";

export const SISWA_B1_PROFILE = {
  nama: "Amalia Mayasari",
  nisn: "012345678",
  kelas: "X-3",
  sapaan: "Selamat datang di portal rekomendasi mapel pilihan",
  targetProdiUtama: "Teknik Informatika / Sains Data",
  targetKampusUtama: "Institut Teknologi Bandung & Universitas Brawijaya",
  riasecDominan: "Investigative - Enterprising",
  kecerdasanMajemuk: "Logis-Matematis & Verbal-Linguistik",
  rataRataRapor: 90.8,
  suratRekomendasi: {
    nomorSurat: "421.3/102/SMAN8/2026",
    tanggalTerbit: "12 Mei 2026",
    pengirim: "Dra. Endang Sulastri",
    jabatanPengirim: "KOORDINATOR BIMBINGAN KONSELING",
    nipPengirim: "196908151994122003",
    pembuka:
      "Berdasarkan hasil analisis komprehensif profil bakat, minat, evaluasi capaian rapor semester, dan tes kecerdasan majemuk peserta didik, SMA Negeri 8 Malang menerbitkan Surat Rekomendasi Peminatan Akademik bagi:",
    keterangan: [
      "Surat rekomendasi ini disusun oleh Guru Bimbingan dan Konseling berdasarkan hasil identifikasi potensi, minat, bakat, hasil belajar, serta informasi pendukung lainnya yang relevan. Rekomendasi ini bertujuan sebagai bahan pertimbangan dan referensi bagi murid dalam menentukan pilihan mata pelajaran sesuai dengan rencana studi lanjut dan pengembangan kariernya.",
      "Keputusan akhir mengenai pemilihan mata pelajaran tetap berada pada murid, dengan mempertimbangkan hasil refleksi diri, informasi yang tersedia, serta diskusi dan persetujuan orang tua/wali. Orang tua/wali diharapkan mendampingi murid dalam proses pengambilan keputusan tersebut.",
      "Surat rekomendasi ini tidak bersifat mengikat atau menentukan secara mutlak pilihan murid. Layanan Bimbingan dan Konseling berperan memfasilitasi murid agar mampu mengambil keputusan pendidikan secara mandiri, bertanggung jawab, dan sesuai dengan potensi serta rencana masa depannya.",
    ],
  },
};

export const RECOMMENDED_SUBJECTS: MapelPilihanDetail[] = [
  {
    id: "mapel-1",
    urutan: "MAPEL PILIHAN 1",
    nama: "Matematika Tingkat Lanjut",
    kategori: "Rumpun MIPA & Komputasi",
    tingkatKesesuaian: 92,
    labelPenguasaan: "92% - Tinggi",
    catatanPenjelasan: "hasil asesmen RIASEC.",
    deskripsiFokus:
      "Fokus pembelajaran mencakup penguasaan komputasi tingkat lanjut dan pemecahan masalah secara terstruktur. Didukung oleh fondasi logika matematika dan literasi digital.",
    topikUtama: [
      {
        nama: "Algoritma Lanjut",
        deskripsi:
          "Pendalaman logika matematika diskrit, rekursi, dan efisiensi struktur pemecahan masalah kuantitatif.",
      },
      {
        nama: "RPL",
        deskripsi:
          "Pemodelan matematis terstruktur untuk perancangan arsitektur sistem dan optimasi fungsi.",
      },
      {
        nama: "Sistem Basis Data",
        deskripsi:
          "Penguasaan aljabar relasional, himpunan, dan matriks untuk pengelolaan data berskala besar.",
      },
      {
        nama: "Jaringan Komputer",
        deskripsi:
          "Analisis teori graf, topologi jaringan, dan probabilitas transmisi paket data.",
      },
    ],
    rekomendasiAlokasiJam:
      "Minimal 4 jam per minggu untuk latihan implementasi kode pemrograman mandiri dan eksplorasi modul praktikum di lab komputer.",
    fokusPenguatanMateri:
      "Perkuat pemahaman konsep dasar dan perbanyak latihan soal terarah minimal 4 jam per minggu",
    catatanEvaluasiAkademik:
      "Berdasarkan rekapitulasi nilai rapor dan asesmen diagnostik BK, penguasaan logika kuantitatif kamu sangat stabil dan siap mengikuti akselerasi materi Fase F.",
    nilaiDasar: 93.5,
    iconType: "math",
    iconBg: "#F1DBFF",
    iconColor: "#410070",
    labelColor: "#410070",
  },
  {
    id: "mapel-2",
    urutan: "MAPEL PILIHAN 2",
    nama: "Fisika Lanjut",
    kategori: "Rumpun Sains & Rekayasa",
    tingkatKesesuaian: 89,
    labelPenguasaan: "89% - Tinggi",
    catatanPenjelasan: "hasil asesmen RIASEC & bakat mekanik-spasial.",
    deskripsiFokus:
      "Fokus pembelajaran mencakup analisis fenomena fisis, mekanika sistem, kelistrikan, serta pemodelan eksperimental yang mendukung rekayasa teknologi.",
    topikUtama: [
      {
        nama: "Mekanika Lanjut",
        deskripsi:
          "Analisis vektor gaya, dinamika rotasi, keseimbangan benda tegar, dan fluida dinamis.",
      },
      {
        nama: "Elektromagnetik",
        deskripsi:
          "Konsep rangkaian arus searah/bolak-balik, induksi magnetik, dan semikonduktor dasar.",
      },
      {
        nama: "Termodinamika",
        deskripsi:
          "Hukum kekekalan energi termal, kalor, entropi, dan prinsip kerja mesin kalor.",
      },
      {
        nama: "Fisika Modern",
        deskripsi:
          "Pengantar gelombang elektromagnetik, efek fotolistrik, dan teknologi kuantum terapan.",
      },
    ],
    rekomendasiAlokasiJam:
      "Minimal 4 jam per minggu untuk latihan penyelesaian studi kasus fisika analitik dan simulasi eksperimen laboratorium.",
    fokusPenguatanMateri:
      "Perkuat pemahaman konsep dasar analisis vektor dan perbanyak latihan soal terarah minimal 4 jam per minggu",
    catatanEvaluasiAkademik:
      "Nilai praktikum dan pemahaman konsep mekanika berada di atas rata-rata kelas. Sangat direkomendasikan untuk menunjang rumpun keteknikan.",
    nilaiDasar: 90.0,
    iconType: "physics",
    iconBg: "#FFDF9E",
    iconColor: "#261A00",
    labelColor: "#795900",
  },
  {
    id: "mapel-3",
    urutan: "MAPEL PILIHAN 3",
    nama: "Informatika & Data Science",
    kategori: "Rumpun Teknologi Digital",
    tingkatKesesuaian: 95,
    labelPenguasaan: "95% - Tinggi",
    catatanPenjelasan: "hasil asesmen RIASEC & portofolio digital.",
    deskripsiFokus:
      "Fokus pembelajaran mencakup penguasaan komputasi tingkat lanjut dan pemecahan masalah secara terstruktur. Didukung oleh fondasi logika matematika dan literasi digital.",
    topikUtama: [
      {
        nama: "Algoritma Lanjut",
        deskripsi:
          "Implementasi struktur data, pencarian, pengurutan, dan pemrograman berorientasi objek.",
      },
      {
        nama: "RPL",
        deskripsi:
          "Siklus pengembangan perangkat lunak, desain antarmuka UI/UX, dan pengujian aplikasi.",
      },
      {
        nama: "Sistem Basis Data",
        deskripsi:
          "Perancangan skema ERD, normalisasi data, dan kueri SQL untuk aplikasi modern.",
      },
      {
        nama: "Jaringan Komputer",
        deskripsi:
          "Arsitektur protokol internet, keamanan siber dasar, dan komputasi awan (Cloud).",
      },
    ],
    rekomendasiAlokasiJam:
      "Minimal 4 jam per minggu untuk latihan implementasi kode pemrograman mandiri dan eksplorasi modul praktikum di lab komputer.",
    fokusPenguatanMateri:
      "Perkuat pemahaman konsep dasar dan perbanyak latihan soal terarah minimal 4 jam per minggu",
    catatanEvaluasiAkademik:
      "Merupakan mata pelajaran unggulan utama dengan skor keselarasan tertinggi terhadap target program studi Teknik Informatika.",
    nilaiDasar: 95.0,
    iconType: "informatics",
    iconBg: "#70FDA7",
    iconColor: "#00210E",
    labelColor: "#004A27",
  },
  {
    id: "mapel-4",
    urutan: "MAPEL PILIHAN 4",
    nama: "Kimia Terapan",
    kategori: "Rumpun Sains Eksakta",
    tingkatKesesuaian: 86,
    labelPenguasaan: "86% - Tinggi",
    catatanPenjelasan: "hasil asesmen RIASEC & analisis laboratorium.",
    deskripsiFokus:
      "Fokus pembelajaran mencakup struktur materi, stoikiometri reaksi, energetika kimia, serta analisis senyawa organik dan material industri.",
    topikUtama: [
      {
        nama: "Stoikiometri",
        deskripsi:
          "Perhitungan kuantitatif reaksi kimia, konsentrasi larutan, dan kesetimbangan fase.",
      },
      {
        nama: "Termokimia",
        deskripsi:
          "Analisis perubahan entalpi, laju reaksi, dan katalisator dalam proses sintesis.",
      },
      {
        nama: "Kimia Organik",
        deskripsi:
          "Gugus fungsi senyawa karbon, biomolekul, dan rekayasa polimer ramah lingkungan.",
      },
      {
        nama: "Elektrokimia",
        deskripsi:
          "Reaksi redoks, sel volta, elektrolisis, dan teknologi penyimpanan energi baterai.",
      },
    ],
    rekomendasiAlokasiJam:
      "Minimal 3–4 jam per minggu untuk latihan penyetaraan reaksi, perhitungan stoikiometri, dan telaah modul praktikum kimia.",
    fokusPenguatanMateri:
      "Perkuat pemahaman konsep dasar kesetimbangan larutan dan perbanyak latihan soal terarah minimal 4 jam per minggu",
    catatanEvaluasiAkademik:
      "Melengkapi syarat mata pelajaran pendukung lintas rumpun sains dan rekayasa di seleksi SNBP.",
    nilaiDasar: 87.5,
    iconType: "chemistry",
    iconBg: "#E6E8EB",
    iconColor: "#4C4452",
    labelColor: "#4C4452",
  },
];

export const EVALUASI_NILAI_ROWS: EvaluasiNilaiRowItem[] = [
  {
    id: "row-1",
    mataPelajaran: "Matematika Tingkat Lanjut",
    semester: 3,
    nilaiInputSiswa: "94.0",
    nilaiRaporSebenarnya: "94.0",
    nilaiTerverifikasi: "94.0",
    statusValidasi: "Tervalidasi Rapor Fisik",
  },
  {
    id: "row-2",
    mataPelajaran: "Fisika",
    semester: 3,
    nilaiInputSiswa: "91.5",
    nilaiRaporSebenarnya: "91.5",
    nilaiTerverifikasi: "91.5",
    statusValidasi: "Tervalidasi Rapor Fisik",
  },
  {
    id: "row-3",
    mataPelajaran: "Informatika",
    semester: 3,
    nilaiInputSiswa: "97.0",
    nilaiRaporSebenarnya: "97.0",
    nilaiTerverifikasi: "97.0",
    statusValidasi: "Tervalidasi Rapor Fisik",
  },
  {
    id: "row-4",
    mataPelajaran: "Kimia",
    semester: 3,
    nilaiInputSiswa: "86.0",
    nilaiRaporSebenarnya: "90.0",
    nilaiTerverifikasi: null,
    statusValidasi: "Perlu Koreksi Fisik",
    catatanKoreksi:
      "Terdapat perbedaan data (fisik rapor: 90.0, sistem: 86.0). Wali Kelas akan memverifikasi",
  },
  {
    id: "row-5",
    mataPelajaran: "Fisika",
    semester: 3,
    nilaiInputSiswa: "92.0",
    nilaiRaporSebenarnya: "92.0",
    nilaiTerverifikasi: "92.0",
    statusValidasi: "Tervalidasi Rapor Fisik",
  },
];

export const INITIAL_AWARDS: PenghargaanSiswaItem[] = [
  {
    id: "awd-1",
    judul: "Juara 2 OSN Informatika Kota Malang 2024",
    penyelenggara: "Puspresnas Kemendikbudristek • Kategori Individu",
    waktuBulan: "November",
    tahun: "2024",
    tingkat: "Kota/Kabupaten",
    kategori: "Kategori Individu",
    deskripsi:
      "Kompetisi pemrograman algoritma dan penalaran logika tingkat SMA se-Kota Malang.",
    isUtama: true,
  },
  {
    id: "awd-2",
    judul: "Medali Perak Lomba Karya Ilmiah Remaja (LKIR) 2023",
    penyelenggara: "Tingkat Provinsi Jawa Timur • Divisi Rekayasa Teknologi",
    waktuBulan: "September",
    tahun: "2023",
    tingkat: "Provinsi",
    kategori: "Riset & Inovasi",
    deskripsi:
      "Penelitian prototipe otomasi sistem peringatan lingkungan berbasis micro-controller.",
    isUtama: false,
  },
];

export const INITIAL_SKILLS: string[] = [
  "Pemrograman Python",
  "Rekayasa Perangkat Lunak",
  "Kecerdasan Buatan (AI)",
  "Pengembangan Web",
];

export const SUGGESTED_SKILLS: string[] = [
  "Pemrograman Python",
  "Rekayasa Perangkat Lunak",
  "Basis Data SQL",
  "Kecerdasan Buatan (AI)",
  "Pengembangan Web",
  "UI/UX Design",
  "Algoritma & Struktur Data",
];

export const INITIAL_EDUCATION: {
  id: string;
  namaSekolah: string;
  keterangan: string;
  tahun: string;
  isCurrent?: boolean;
}[] = [
  {
    id: "edu-1",
    namaSekolah: "SMP Negeri 4 Kepanjen",
    keterangan: "Pendidikan Menengah Pertama • Lulus 2021",
    tahun: "2020 - 2023",
    isCurrent: false,
  },
  {
    id: "edu-2",
    namaSekolah: "SMA Negeri 8 Malang (SMARIHASTA)",
    keterangan: "Siswa Aktif",
    tahun: "2023 - Sekarang",
    isCurrent: true,
  },
];
