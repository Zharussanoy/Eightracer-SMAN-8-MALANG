import {
  MapelPilihanDetail,
  EvaluasiNilaiRowItem,
  PenghargaanSiswaItem,
  StudentB1Account,
  DirektoriSiswaItem,
} from "./types";

/**
 * 2 Kondisi Simulasi Perjalanan Siswa (Amalia Mayasari):
 * 1. Tahun Ajaran 2024/2025: Amalia masih Kelas X (Kelas X-3)
 *    - Halaman Evaluasi Nilai masih TERKUNCI (Fase E).
 * 2. Tahun Ajaran Selanjutnya 2025/2026: Amalia sudah naik Kelas XI (Kelas XI-F2)
 *    - Halaman Evaluasi Nilai TERBUKA.
 *    - Amalia menginput nilainya sendiri sehingga tampilan awal nilai siswa masih KOSONG ("").
 */
export const MOCK_STUDENT_ACCOUNTS: StudentB1Account[] = [
  {
    studentId: "STD-AMALIA-KLS-10",
    nisn: "0012345678",
    nama: "Amalia Mayasari",
    namaPanggilan: "Amalia",
    email: "amalia.mayasari@siswa.sman8malang.sch.id",
    kelas: "X-3",
    jenjang: "X",
    semester: 2,
    tahunAjaran: "2024/2025",
    targetProdiUtama: "Teknik Informatika / Sains Data",
    targetKampusUtama: "Institut Teknologi Bandung & Universitas Brawijaya",
    riasecDominan: "Investigative - Enterprising",
    kecerdasanMajemuk: "Logis-Matematis & Verbal-Linguistik",
    rataRataRapor: 90.8,
    avatarInitials: "AM",
    isSuratValidated: false, // Surat rekomendasi belum divalidasi oleh admin/BK
    evaluasiStatus: "BELUM_DIIZINKAN_KELAS_X",
    evaluasiMessage:
      "Evaluasi Nilai Mapel Pilihan belum dibuka untuk siswa Kelas X (Fase E). Fitur ini aktif pada tahun ajaran berikutnya saat kamu naik ke Kelas XI.",
    riwayatAkademik: [
      {
        id: "rw-1",
        jenjang: "X",
        kelas: "X-3",
        semester: 1,
        tahunAjaran: "2024/2025 Ganjil",
        rataRataNilai: 89.6,
        statusKeterangan: "Selesai (Fase E Umum)",
      },
      {
        id: "rw-2",
        jenjang: "X",
        kelas: "X-3",
        semester: 2,
        tahunAjaran: "2024/2025 Genap",
        rataRataNilai: 90.8,
        statusKeterangan: "Tahap Eksplorasi & Penerbitan Rekomendasi Peminatan",
      },
    ],
    evaluasiRows: [
      {
        id: "row-1",
        mataPelajaran: "Matematika Tingkat Lanjut",
        semester: 2,
        nilaiInputSiswa: "",
        nilaiRaporSebenarnya: "94.0",
        nilaiTerverifikasi: null,
        statusValidasi: "Belum Diisi",
      },
      {
        id: "row-2",
        mataPelajaran: "Fisika Lanjut",
        semester: 2,
        nilaiInputSiswa: "",
        nilaiRaporSebenarnya: "91.5",
        nilaiTerverifikasi: null,
        statusValidasi: "Belum Diisi",
      },
      {
        id: "row-3",
        mataPelajaran: "Informatika & Data Science",
        semester: 2,
        nilaiInputSiswa: "",
        nilaiRaporSebenarnya: "97.0",
        nilaiTerverifikasi: null,
        statusValidasi: "Belum Diisi",
      },
      {
        id: "row-4",
        mataPelajaran: "Kimia Terapan",
        semester: 2,
        nilaiInputSiswa: "",
        nilaiRaporSebenarnya: "90.0",
        nilaiTerverifikasi: null,
        statusValidasi: "Belum Diisi",
      },
    ],
  },
  {
    studentId: "STD-AMALIA-KLS-11",
    nisn: "0012345678",
    nama: "Amalia Mayasari",
    namaPanggilan: "Amalia",
    email: "amalia.mayasari@siswa.sman8malang.sch.id",
    kelas: "XI-F2",
    jenjang: "XI",
    semester: 3,
    tahunAjaran: "2025/2026 (Tahun Ajaran Selanjutnya)",
    targetProdiUtama: "Teknik Informatika / Sains Data",
    targetKampusUtama: "Institut Teknologi Bandung & Universitas Brawijaya",
    riasecDominan: "Investigative - Enterprising",
    kecerdasanMajemuk: "Logis-Matematis & Verbal-Linguistik",
    rataRataRapor: 91.2,
    avatarInitials: "AM",
    isSuratValidated: true, // Default tervalidasi setelah naik ke kelas 11 (dapat diubah lewat switcher)
    evaluasiStatus: "INPUT_MANDIRI_TERBUKA",
    evaluasiMessage:
      "Halaman evaluasi terbuka. Silakan input nilai 4 mata pelajaran pilihanmu sesuai dengan buku rapor fisik.",
    riwayatAkademik: [
      {
        id: "rw-11",
        jenjang: "X",
        kelas: "X-3",
        semester: 1,
        tahunAjaran: "2024/2025 Ganjil",
        rataRataNilai: 89.6,
        statusKeterangan: "Tuntas Fase E",
      },
      {
        id: "rw-12",
        jenjang: "X",
        kelas: "X-3",
        semester: 2,
        tahunAjaran: "2024/2025 Genap",
        rataRataNilai: 90.8,
        statusKeterangan: "Tuntas Fase E & Peminatan Ditetapkan",
      },
      {
        id: "rw-13",
        jenjang: "XI",
        kelas: "XI-F2",
        semester: 3,
        tahunAjaran: "2025/2026 Ganjil",
        statusKeterangan: "Fase F Berjalan &bull; Menunggu Input Mandiri Siswa",
      },
    ],
    // Tampilan awal nilai siswa masih KOSONG ("") agar siswa menginput sendiri
    evaluasiRows: [
      {
        id: "row-1",
        mataPelajaran: "Matematika Tingkat Lanjut",
        semester: 3,
        nilaiInputSiswa: "",
        nilaiRaporSebenarnya: "94.0",
        nilaiTerverifikasi: null,
        statusValidasi: "Belum Diisi",
      },
      {
        id: "row-2",
        mataPelajaran: "Fisika Lanjut",
        semester: 3,
        nilaiInputSiswa: "",
        nilaiRaporSebenarnya: "91.5",
        nilaiTerverifikasi: null,
        statusValidasi: "Belum Diisi",
      },
      {
        id: "row-3",
        mataPelajaran: "Informatika & Data Science",
        semester: 3,
        nilaiInputSiswa: "",
        nilaiRaporSebenarnya: "97.0",
        nilaiTerverifikasi: null,
        statusValidasi: "Belum Diisi",
      },
      {
        id: "row-4",
        mataPelajaran: "Kimia Terapan",
        semester: 3,
        nilaiInputSiswa: "",
        nilaiRaporSebenarnya: "90.0",
        nilaiTerverifikasi: null,
        statusValidasi: "Belum Diisi",
      },
    ],
  },
];

export const DEFAULT_EVALUASI_NILAI_ROWS: EvaluasiNilaiRowItem[] = [
  {
    id: "row-1",
    mataPelajaran: "Matematika Tingkat Lanjut",
    semester: 3,
    nilaiInputSiswa: "",
    nilaiRaporSebenarnya: "94.0",
    nilaiTerverifikasi: null,
    statusValidasi: "Belum Diisi",
  },
  {
    id: "row-2",
    mataPelajaran: "Fisika Lanjut",
    semester: 3,
    nilaiInputSiswa: "",
    nilaiRaporSebenarnya: "91.5",
    nilaiTerverifikasi: null,
    statusValidasi: "Belum Diisi",
  },
  {
    id: "row-3",
    mataPelajaran: "Informatika & Data Science",
    semester: 3,
    nilaiInputSiswa: "",
    nilaiRaporSebenarnya: "97.0",
    nilaiTerverifikasi: null,
    statusValidasi: "Belum Diisi",
  },
  {
    id: "row-4",
    mataPelajaran: "Kimia Terapan",
    semester: 3,
    nilaiInputSiswa: "",
    nilaiRaporSebenarnya: "90.0",
    nilaiTerverifikasi: null,
    statusValidasi: "Belum Diisi",
  },
];

export const EVALUASI_NILAI_ROWS = DEFAULT_EVALUASI_NILAI_ROWS;

export const SISWA_B1_PROFILE = {
  nama: "Amalia Mayasari",
  nisn: "0012345678",
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

export const MOCK_DIREKTORI_SISWA: DirektoriSiswaItem[] = [
  {
    id: "dir-1",
    nama: "Achmad Fauzan Pratama",
    nisn: "0072819201",
    kelas: "Kelas XI MIPA 4",
    fase: "Fase F (Kelas XI MIPA 4)",
    angkatan: "Angkatan 2023 (Fase F - Kelas XI)",
    tahunMasuk: "2023",
    peranEkskul: "Ketua Ekstrakurikuler Robotika SMARIHASTA • Peserta OSN Informatika",
    rumpunPeminatan: "Peminatan Sains & Teknologi",
    targetStudi: "Teknik Informatika & Sistem Informasi",
    fokusPilihan: "Matematika Tingkat Lanjut, Fisika Terapan, Pemrograman Python, dan IoT Automation",
    email: "fauzan.pratama@smarihasta.sch.id",
    rekomendasiPtn: "Universitas Brawijaya / ITS",
    avatarInitials: "AFP",
    biografi: "Siswa yang berdedikasi dalam bidang teknologi kecerdasan buatan, otomasi robotika, dan komputasi awan. Berpengalaman memimpin tim riset robotika SMARIHASTA dan berkompetisi di kejuaraan sains nasional.",
    prestasi: [
      "Juara 1 Lomba Robotika Nasional 2024",
      "Peserta OSN Tingkat Kota Malang Bidang Informatika 2024",
      "Juara 2 Hackathon Pelajar Jawa Timur 2023",
    ],
    keahlian: [
      "Pemrograman Python & C++",
      "Internet of Things (IoT)",
      "Robotika & Otomasi",
      "Computer Vision",
    ],
    mapelPilihanList: [
      "Matematika Tingkat Lanjut",
      "Fisika Terapan",
      "Informatika & Data Science",
      "Bahasa Inggris Lanjut",
    ],
  },
  {
    id: "dir-2",
    nama: "Amalia Mayasari",
    nisn: "0073940112",
    kelas: "Kelas XI MIPA 4",
    fase: "Fase F (Kelas XI MIPA 4)",
    angkatan: "Angkatan 2023 (Fase F - Kelas XI)",
    tahunMasuk: "2023",
    peranEkskul: "Staf MPK Komisi Akademik • Duta Literasi SMARIHASTA 2024",
    rumpunPeminatan: "Peminatan Kedokteran & Ilmu Hayati",
    targetStudi: "Pendidikan Dokter",
    fokusPilihan: "Biologi Molekuler, Kimia Organik, Riset Biomedik Sederhana, dan Bahasa Inggris Akademik",
    email: "amalia.mayasari@smarihasta.sch.id",
    rekomendasiPtn: "Universitas Airlangga / FK UB",
    avatarInitials: "AM",
    biografi: "Memiliki minat mendalam di bidang kedokteran klinis dan sains biomedik. Aktif dalam riset karya ilmiah remaja dan kegiatan literasi sekolah, dengan komitmen mengabdi pada kesehatan masyarakat.",
    prestasi: [
      "Juara 2 Karya Tulis Ilmiah Kedokteran Remaja se-Jawa Timur 2024",
      "Duta Literasi SMARIHASTA 2024",
      "Delegasi Jambore Kesehatan Remaja Nasional 2023",
    ],
    keahlian: [
      "Biologi Molekuler Dasar",
      "Kimia Analisis Organik",
      "Metodologi Riset Ilmiah",
      "Public Speaking & Literasi",
    ],
    mapelPilihanList: [
      "Biologi Tingkat Lanjut",
      "Kimia Terapan",
      "Matematika Tingkat Lanjut",
      "Bahasa Inggris Akademik",
    ],
  },
  {
    id: "dir-3",
    nama: "Clarissa Putri Kirana",
    nisn: "0071192844",
    kelas: "Kelas XI IPS 2",
    fase: "Fase F (Kelas XI IPS 2)",
    angkatan: "Angkatan 2023 (Fase F - Kelas XI)",
    tahunMasuk: "2023",
    peranEkskul: "Koordinator English Debating Society • Juara 1 Debat Bahasa Inggris Kota Malang",
    rumpunPeminatan: "Peminatan Sosial Humaniora",
    targetStudi: "Hubungan Internasional & Ilmu Komunikasi",
    fokusPilihan: "Sosiologi Global, Ekonomi Makro, Public Speaking, Penulisan Argumentatif Kritis",
    email: "clarissa.kirana@smarihasta.sch.id",
    rekomendasiPtn: "Universitas Gadjah Mada / UI",
    avatarInitials: "CPK",
    biografi: "Tertarik pada diplomasi internasional, resolusi konflik global, dan komunikasi strategis lintas budaya. Aktif sebagai ketua klub debat dan sering menjadi pembicara dalam forum remaja.",
    prestasi: [
      "Juara 1 English Debate Championship Kota Malang 2024",
      "Best Speaker SMARIHASTA Model United Nations 2023",
      "Juara 3 Lomba Esai Sosial Humaniora Nasional 2024",
    ],
    keahlian: [
      "Parliamentary English Debate",
      "Diplomatic Negotiation",
      "Critical & Argumentative Writing",
      "Public Communication",
    ],
    mapelPilihanList: [
      "Sosiologi Global",
      "Ekonomi Makro Terapan",
      "Bahasa Inggris Tingkat Lanjut",
      "Geografi Wilayah Dunia",
    ],
  },
  {
    id: "dir-4",
    nama: "Danendra Arya Wicaksono",
    nisn: "0075549021",
    kelas: "Kelas XI IPS 1",
    fase: "Fase F (Kelas XI IPS 1)",
    angkatan: "Angkatan 2023 (Fase F - Kelas XI)",
    tahunMasuk: "2023",
    peranEkskul: "Anggota Tim Desain Grafis Bhaskara Cyber Media • Desainer Majalah Sekolah",
    rumpunPeminatan: "Peminatan Desain Komunikasi Visual & Multimedia",
    targetStudi: "DKV FSRD",
    fokusPilihan: "Seni Rupa 2D/3D Terapan, Tipografi, Fotografi Jurnalistik, Sejarah Kebudayaan",
    email: "danendra.arya@smarihasta.sch.id",
    rekomendasiPtn: "Institut Teknologi Bandung / ISI Jogja",
    avatarInitials: "DAW",
    biografi: "Penggiat desain komunikasi visual, ilustrasi digital, dan branding identitas sekolah. Kerap menghasilkan karya visual untuk majalah sekolah dan kampanye kreatif digital.",
    prestasi: [
      "Juara 1 Lomba Poster Digital Pelajar Nasional 2024",
      "Desainer Grafis Terbaik Majalah Bhaskara Edisi 2023",
      "Finalis Festival Seni & Desain Pelajar Jawa Timur 2024",
    ],
    keahlian: [
      "Adobe Illustrator & Photoshop",
      "UI/UX Design & Wireframing",
      "Fotografi Jurnalistik",
      "Tipografi & Visual Layouting",
    ],
    mapelPilihanList: [
      "Seni Rupa 2D/3D Terapan",
      "Informatika Multimedia",
      "Desain Komunikasi Visual",
      "Sosiologi Kebudayaan",
    ],
  },
  {
    id: "dir-5",
    nama: "Bintang Ramadhan Putra",
    nisn: "0076214590",
    kelas: "Kelas XI MIPA 2",
    fase: "Fase F (Kelas XI MIPA 2)",
    angkatan: "Angkatan 2023 (Fase F - Kelas XI)",
    tahunMasuk: "2023",
    peranEkskul: "Ketua KIR (Karya Ilmiah Remaja) • Finalis OPSI Nasional",
    rumpunPeminatan: "Peminatan Sains & Teknologi",
    targetStudi: "Teknik Elektro & Energi Terbarukan",
    fokusPilihan: "Fisika Terapan, Matematika Tingkat Lanjut, Kimia Material, Energi Terbarukan",
    email: "bintang.ramadhan@smarihasta.sch.id",
    rekomendasiPtn: "Institut Teknologi Bandung / UGM",
    avatarInitials: "BRP",
    biografi: "Antusias terhadap riset konversi energi dan semikonduktor masa depan. Memiliki fokus pada pemanfaatan sel surya generasi ketiga ramah lingkungan.",
    prestasi: [
      "Finalis Olimpiade Penelitian Siswa Indonesia (OPSI) 2024",
      "Juara 1 Lomba Karya Ilmiah Bidang Energi Terbarukan 2023",
    ],
    keahlian: [
      "Analisis Fisika Gelombang",
      "Rancang Bangun Prototipe Energi",
      "Pengolahan Data Eksperimental",
    ],
    mapelPilihanList: [
      "Fisika Terapan",
      "Matematika Tingkat Lanjut",
      "Kimia Material",
      "Informatika Pemodelan",
    ],
  },
  {
    id: "dir-6",
    nama: "Farah Nabilah Putri",
    nisn: "0074891230",
    kelas: "Kelas XI MIPA 1",
    fase: "Fase F (Kelas XI MIPA 1)",
    angkatan: "Angkatan 2023 (Fase F - Kelas XI)",
    tahunMasuk: "2023",
    peranEkskul: "Anggota PMR Wira SMARIHASTA • Duta Kesehatan Remaja Kota Malang",
    rumpunPeminatan: "Peminatan Kedokteran & Ilmu Hayati",
    targetStudi: "Farmasi Klinis & Komunitas",
    fokusPilihan: "Kimia Organik Lanjut, Biologi Molekuler, Farmakologi Dasar, Matematika Terapan",
    email: "farah.nabilah@smarihasta.sch.id",
    rekomendasiPtn: "Universitas Airlangga / UGM",
    avatarInitials: "FNP",
    biografi: "Bersemangat meneliti formulasi bahan alam Indonesia untuk obat herbal terstandar dan sintesis senyawa aktif.",
    prestasi: [
      "Juara 1 Olimpiade Farmasi Pelajar Jawa Timur 2024",
      "Pemenang Duta Kesehatan Remaja Kota Malang 2023",
    ],
    keahlian: [
      "Sintesis Organik",
      "Standardisasi Ekstrak Bahan Alam",
      "Pertolongan Pertama PMR Wira",
    ],
    mapelPilihanList: [
      "Kimia Terapan",
      "Biologi Molekuler",
      "Matematika Terapan",
      "Bahasa Inggris Farmasi",
    ],
  },
];
