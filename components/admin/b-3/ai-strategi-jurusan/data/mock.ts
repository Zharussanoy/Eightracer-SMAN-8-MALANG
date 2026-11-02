import type { Kampus, OverviewInsight, SiswaProfil, TargetKampus, HasilSimulasi } from "../types";

export const MOCK_KAMPUS: Kampus[] = [
  {
    id: "ub",
    nama: "Universitas Brawijaya",
    singkatan: "UB",
    programStudi: [
      { id: "ub-si", nama: "Sistem Informasi", jenjang: "S1" },
      { id: "ub-ti", nama: "Teknik Informatika", jenjang: "S1" },
      { id: "ub-hk", nama: "Hukum", jenjang: "S1" },
    ],
  },
  {
    id: "ugm",
    nama: "Universitas Gadjah Mada",
    singkatan: "UGM",
    programStudi: [
      { id: "ugm-ked", nama: "Kedokteran", jenjang: "S1" },
      { id: "ugm-psi", nama: "Psikologi", jenjang: "S1" },
      { id: "ugm-ti", nama: "Teknik Informatika", jenjang: "S1" },
    ],
  },
  {
    id: "its",
    nama: "Institut Teknologi Sepuluh Nopember",
    singkatan: "ITS",
    programStudi: [
      { id: "its-ti", nama: "Teknik Informatika", jenjang: "S1" },
      { id: "its-te", nama: "Teknik Elektro", jenjang: "S1" },
      { id: "its-ds", nama: "Sains Data", jenjang: "S1" },
    ],
  },
];

export const MOCK_OVERVIEW: OverviewInsight[] = [
  {
    kampusId: "ub",
    prodiId: "ub-si",
    peningkatan: "12,4%",
    jumlahRiwayat: 500,
    prediksiLolos: "82,6%",
    akurasiRekomendasi: "87,2%",
    pilihan1Berhasil: "64,8%",
    faktorKelulusan: [
      { label: "Konsistensi nilai rapor", nilai: 92.8, nilaiTampil: "92.8%", kualitas: "Sangat kuat", warnBar: "bg-purple-600", persenBar: 92.8 },
      { label: "Rekam jejak sekolah", nilai: 87.2, nilaiTampil: "87.2%", kualitas: "Kuat", warnBar: "bg-emerald-500", persenBar: 87.2 },
      { label: "Kesesuaian pilihan prodi", nilai: 64.8, nilaiTampil: "64.8%", kualitas: "Kuat", warnBar: "bg-blue-500", persenBar: 64.8 },
      { label: "Tingkat persaingan", nilai: 55, nilaiTampil: "1:18", kualitas: "Menengah", warnBar: "bg-amber-400", persenBar: 55 },
    ],
  },
  {
    kampusId: "ub",
    prodiId: "ub-ti",
    peningkatan: "9,2%",
    jumlahRiwayat: 430,
    prediksiLolos: "78,3%",
    akurasiRekomendasi: "84,1%",
    pilihan1Berhasil: "59,7%",
    faktorKelulusan: [
      { label: "Konsistensi nilai rapor", nilai: 88.5, nilaiTampil: "88.5%", kualitas: "Sangat kuat", warnBar: "bg-purple-600", persenBar: 88.5 },
      { label: "Rekam jejak sekolah", nilai: 83.0, nilaiTampil: "83.0%", kualitas: "Kuat", warnBar: "bg-emerald-500", persenBar: 83.0 },
      { label: "Kesesuaian pilihan prodi", nilai: 59.7, nilaiTampil: "59.7%", kualitas: "Kuat", warnBar: "bg-blue-500", persenBar: 59.7 },
      { label: "Tingkat persaingan", nilai: 65, nilaiTampil: "1:22", kualitas: "Kompetitif", warnBar: "bg-amber-400", persenBar: 65 },
    ],
  },
  {
    kampusId: "ub",
    prodiId: "ub-hk",
    peningkatan: "7,8%",
    jumlahRiwayat: 320,
    prediksiLolos: "71,4%",
    akurasiRekomendasi: "80,6%",
    pilihan1Berhasil: "55,2%",
    faktorKelulusan: [
      { label: "Konsistensi nilai rapor", nilai: 80.0, nilaiTampil: "80.0%", kualitas: "Kuat", warnBar: "bg-purple-600", persenBar: 80.0 },
      { label: "Rekam jejak sekolah", nilai: 75.5, nilaiTampil: "75.5%", kualitas: "Kuat", warnBar: "bg-emerald-500", persenBar: 75.5 },
      { label: "Kesesuaian pilihan prodi", nilai: 55.2, nilaiTampil: "55.2%", kualitas: "Menengah", warnBar: "bg-blue-500", persenBar: 55.2 },
      { label: "Tingkat persaingan", nilai: 45, nilaiTampil: "1:14", kualitas: "Menengah", warnBar: "bg-amber-400", persenBar: 45 },
    ],
  },
  {
    kampusId: "ugm",
    prodiId: "ugm-ked",
    peningkatan: "5,1%",
    jumlahRiwayat: 620,
    prediksiLolos: "61,2%",
    akurasiRekomendasi: "89,4%",
    pilihan1Berhasil: "42,5%",
    faktorKelulusan: [
      { label: "Konsistensi nilai rapor", nilai: 95.0, nilaiTampil: "95.0%", kualitas: "Sangat kuat", warnBar: "bg-purple-600", persenBar: 95.0 },
      { label: "Rekam jejak sekolah", nilai: 91.3, nilaiTampil: "91.3%", kualitas: "Sangat kuat", warnBar: "bg-emerald-500", persenBar: 91.3 },
      { label: "Kesesuaian pilihan prodi", nilai: 42.5, nilaiTampil: "42.5%", kualitas: "Menengah", warnBar: "bg-blue-500", persenBar: 42.5 },
      { label: "Tingkat persaingan", nilai: 82, nilaiTampil: "1:38", kualitas: "Kompetitif", warnBar: "bg-amber-400", persenBar: 82 },
    ],
  },
  {
    kampusId: "ugm",
    prodiId: "ugm-psi",
    peningkatan: "14,7%",
    jumlahRiwayat: 410,
    prediksiLolos: "76,8%",
    akurasiRekomendasi: "85,3%",
    pilihan1Berhasil: "61,0%",
    faktorKelulusan: [
      { label: "Konsistensi nilai rapor", nilai: 85.4, nilaiTampil: "85.4%", kualitas: "Sangat kuat", warnBar: "bg-purple-600", persenBar: 85.4 },
      { label: "Rekam jejak sekolah", nilai: 80.1, nilaiTampil: "80.1%", kualitas: "Kuat", warnBar: "bg-emerald-500", persenBar: 80.1 },
      { label: "Kesesuaian pilihan prodi", nilai: 61.0, nilaiTampil: "61.0%", kualitas: "Kuat", warnBar: "bg-blue-500", persenBar: 61.0 },
      { label: "Tingkat persaingan", nilai: 52, nilaiTampil: "1:16", kualitas: "Menengah", warnBar: "bg-amber-400", persenBar: 52 },
    ],
  },
  {
    kampusId: "ugm",
    prodiId: "ugm-ti",
    peningkatan: "18,3%",
    jumlahRiwayat: 390,
    prediksiLolos: "80,4%",
    akurasiRekomendasi: "86,7%",
    pilihan1Berhasil: "66,2%",
    faktorKelulusan: [
      { label: "Konsistensi nilai rapor", nilai: 90.1, nilaiTampil: "90.1%", kualitas: "Sangat kuat", warnBar: "bg-purple-600", persenBar: 90.1 },
      { label: "Rekam jejak sekolah", nilai: 86.5, nilaiTampil: "86.5%", kualitas: "Kuat", warnBar: "bg-emerald-500", persenBar: 86.5 },
      { label: "Kesesuaian pilihan prodi", nilai: 66.2, nilaiTampil: "66.2%", kualitas: "Kuat", warnBar: "bg-blue-500", persenBar: 66.2 },
      { label: "Tingkat persaingan", nilai: 60, nilaiTampil: "1:20", kualitas: "Kompetitif", warnBar: "bg-amber-400", persenBar: 60 },
    ],
  },
  {
    kampusId: "its",
    prodiId: "its-ti",
    peningkatan: "16,5%",
    jumlahRiwayat: 480,
    prediksiLolos: "79,1%",
    akurasiRekomendasi: "88,0%",
    pilihan1Berhasil: "63,4%",
    faktorKelulusan: [
      { label: "Konsistensi nilai rapor", nilai: 89.7, nilaiTampil: "89.7%", kualitas: "Sangat kuat", warnBar: "bg-purple-600", persenBar: 89.7 },
      { label: "Rekam jejak sekolah", nilai: 85.2, nilaiTampil: "85.2%", kualitas: "Kuat", warnBar: "bg-emerald-500", persenBar: 85.2 },
      { label: "Kesesuaian pilihan prodi", nilai: 63.4, nilaiTampil: "63.4%", kualitas: "Kuat", warnBar: "bg-blue-500", persenBar: 63.4 },
      { label: "Tingkat persaingan", nilai: 58, nilaiTampil: "1:19", kualitas: "Menengah", warnBar: "bg-amber-400", persenBar: 58 },
    ],
  },
  {
    kampusId: "its",
    prodiId: "its-te",
    peningkatan: "11,2%",
    jumlahRiwayat: 350,
    prediksiLolos: "74,5%",
    akurasiRekomendasi: "82,9%",
    pilihan1Berhasil: "58,6%",
    faktorKelulusan: [
      { label: "Konsistensi nilai rapor", nilai: 84.3, nilaiTampil: "84.3%", kualitas: "Kuat", warnBar: "bg-purple-600", persenBar: 84.3 },
      { label: "Rekam jejak sekolah", nilai: 78.9, nilaiTampil: "78.9%", kualitas: "Kuat", warnBar: "bg-emerald-500", persenBar: 78.9 },
      { label: "Kesesuaian pilihan prodi", nilai: 58.6, nilaiTampil: "58.6%", kualitas: "Kuat", warnBar: "bg-blue-500", persenBar: 58.6 },
      { label: "Tingkat persaingan", nilai: 50, nilaiTampil: "1:15", kualitas: "Menengah", warnBar: "bg-amber-400", persenBar: 50 },
    ],
  },
  {
    kampusId: "its",
    prodiId: "its-ds",
    peningkatan: "21,0%",
    jumlahRiwayat: 280,
    prediksiLolos: "83,7%",
    akurasiRekomendasi: "90,1%",
    pilihan1Berhasil: "68,9%",
    faktorKelulusan: [
      { label: "Konsistensi nilai rapor", nilai: 93.2, nilaiTampil: "93.2%", kualitas: "Sangat kuat", warnBar: "bg-purple-600", persenBar: 93.2 },
      { label: "Rekam jejak sekolah", nilai: 88.7, nilaiTampil: "88.7%", kualitas: "Sangat kuat", warnBar: "bg-emerald-500", persenBar: 88.7 },
      { label: "Kesesuaian pilihan prodi", nilai: 68.9, nilaiTampil: "68.9%", kualitas: "Kuat", warnBar: "bg-blue-500", persenBar: 68.9 },
      { label: "Tingkat persaingan", nilai: 40, nilaiTampil: "1:12", kualitas: "Menengah", warnBar: "bg-amber-400", persenBar: 40 },
    ],
  },
];

export const MOCK_SISWA: SiswaProfil[] = [
  { id: "s1", nama: "Naysilla Salsa Ardiyati", nilaiRapor: 94.5, riwayatSekolah: 97.2 },
  { id: "s2", nama: "Amalia Mayasari", nilaiRapor: 91.3, riwayatSekolah: 95.8 },
  { id: "s3", nama: "Hafiidz Maulana", nilaiRapor: 88.7, riwayatSekolah: 93.1 },
  { id: "s4", nama: "Ismail Kurniawan", nilaiRapor: 85.2, riwayatSekolah: 90.4 },
  { id: "s5", nama: "Rashya Putra Pratama", nilaiRapor: 92.8, riwayatSekolah: 96.5 },
];

export const MOCK_TARGET_KAMPUS: TargetKampus[] = [
  { id: "tk1", nama: "Universitas Gadjah Mada", prodi: "Kedokteran", jenjang: "S1", estimasiPersen: 84 },
  { id: "tk2", nama: "Universitas Brawijaya", prodi: "Sistem Informasi", jenjang: "S1", estimasiPersen: 91 },
  { id: "tk3", nama: "Institut Teknologi Sepuluh Nopember", prodi: "Sains Data", jenjang: "S1", estimasiPersen: 76 },
];

export const MOCK_HASIL_SIMULASI: Record<string, HasilSimulasi> = {
  "s1-tk1": { siswaId: "s1", targetKampusId: "tk1", peluangLolos: 84, kategori: "Sangat Potensial", nilaiRapor: "92,8", labelNilaiRapor: "Di atas rerata", riwayatSekolah: "97,2", labelRiwayat: "Sangat baik", persaingan: "1:18", labelPersaingan: "Per kursi", rekomendasiAi: "Pertahankan Universitas Gadjah Mada sebagai pilihan utama. Peluang dihitung dari nilai, rekam jejak sekolah, dan data penerimaan historis." },
  "s1-tk2": { siswaId: "s1", targetKampusId: "tk2", peluangLolos: 91, kategori: "Sangat Potensial", nilaiRapor: "92,8", labelNilaiRapor: "Di atas rerata", riwayatSekolah: "97,2", labelRiwayat: "Sangat baik", persaingan: "1:12", labelPersaingan: "Per kursi", rekomendasiAi: "Universitas Brawijaya merupakan pilihan sangat kuat. Konsistensi nilai rapor Anda berada jauh di atas rata-rata pendaftar program ini." },
  "s1-tk3": { siswaId: "s1", targetKampusId: "tk3", peluangLolos: 76, kategori: "Potensial", nilaiRapor: "92,8", labelNilaiRapor: "Di atas rerata", riwayatSekolah: "97,2", labelRiwayat: "Sangat baik", persaingan: "1:15", labelPersaingan: "Per kursi", rekomendasiAi: "ITS Sains Data memiliki peluang baik. Tingkatkan skor UTBK pada bidang sains dan matematika untuk memperkuat posisi Anda." },
  "s2-tk1": { siswaId: "s2", targetKampusId: "tk1", peluangLolos: 72, kategori: "Potensial", nilaiRapor: "91,3", labelNilaiRapor: "Di atas rerata", riwayatSekolah: "95,8", labelRiwayat: "Sangat baik", persaingan: "1:18", labelPersaingan: "Per kursi", rekomendasiAi: "Peluang masuk UGM Kedokteran cukup baik. Fokus pada persiapan UTBK dan pertimbangkan pilihan cadangan yang kuat." },
  "s2-tk2": { siswaId: "s2", targetKampusId: "tk2", peluangLolos: 88, kategori: "Sangat Potensial", nilaiRapor: "91,3", labelNilaiRapor: "Di atas rerata", riwayatSekolah: "95,8", labelRiwayat: "Sangat baik", persaingan: "1:12", labelPersaingan: "Per kursi", rekomendasiAi: "Universitas Brawijaya Sistem Informasi adalah pilihan sangat tepat berdasarkan profil akademik Anda saat ini." },
  "s2-tk3": { siswaId: "s2", targetKampusId: "tk3", peluangLolos: 68, kategori: "Potensial", nilaiRapor: "91,3", labelNilaiRapor: "Di atas rerata", riwayatSekolah: "95,8", labelRiwayat: "Sangat baik", persaingan: "1:15", labelPersaingan: "Per kursi", rekomendasiAi: "ITS Sains Data dapat dijangkau. Pastikan nilai UTBK sains dan matematika berada di atas rata-rata." },
  "s3-tk1": { siswaId: "s3", targetKampusId: "tk1", peluangLolos: 58, kategori: "Kompetitif", nilaiRapor: "88,7", labelNilaiRapor: "Sesuai rerata", riwayatSekolah: "93,1", labelRiwayat: "Baik", persaingan: "1:18", labelPersaingan: "Per kursi", rekomendasiAi: "UGM Kedokteran tergolong sangat kompetitif untuk profil ini. Pertimbangkan pilihan alternatif sambil terus meningkatkan persiapan." },
  "s3-tk2": { siswaId: "s3", targetKampusId: "tk2", peluangLolos: 81, kategori: "Sangat Potensial", nilaiRapor: "88,7", labelNilaiRapor: "Sesuai rerata", riwayatSekolah: "93,1", labelRiwayat: "Baik", persaingan: "1:12", labelPersaingan: "Per kursi", rekomendasiAi: "UB Sistem Informasi sangat sesuai dengan profil akademik Anda. Rekam jejak sekolah yang baik memberikan keunggulan kompetitif." },
  "s3-tk3": { siswaId: "s3", targetKampusId: "tk3", peluangLolos: 64, kategori: "Potensial", nilaiRapor: "88,7", labelNilaiRapor: "Sesuai rerata", riwayatSekolah: "93,1", labelRiwayat: "Baik", persaingan: "1:15", labelPersaingan: "Per kursi", rekomendasiAi: "ITS Sains Data cukup dapat dijangkau. Tingkatkan nilai UTBK untuk memperkuat peluang." },
  "s4-tk1": { siswaId: "s4", targetKampusId: "tk1", peluangLolos: 42, kategori: "Berisiko", nilaiRapor: "85,2", labelNilaiRapor: "Di bawah rerata", riwayatSekolah: "90,4", labelRiwayat: "Baik", persaingan: "1:18", labelPersaingan: "Per kursi", rekomendasiAi: "Peluang UGM Kedokteran sangat ketat untuk profil ini. Sangat disarankan untuk mempertimbangkan kampus atau prodi alternatif yang lebih sesuai." },
  "s4-tk2": { siswaId: "s4", targetKampusId: "tk2", peluangLolos: 74, kategori: "Potensial", nilaiRapor: "85,2", labelNilaiRapor: "Di bawah rerata", riwayatSekolah: "90,4", labelRiwayat: "Baik", persaingan: "1:12", labelPersaingan: "Per kursi", rekomendasiAi: "UB Sistem Informasi merupakan pilihan yang realistis. Fokus pada nilai semester akhir untuk memperkuat posisi di jalur SNBP." },
  "s4-tk3": { siswaId: "s4", targetKampusId: "tk3", peluangLolos: 55, kategori: "Kompetitif", nilaiRapor: "85,2", labelNilaiRapor: "Di bawah rerata", riwayatSekolah: "90,4", labelRiwayat: "Baik", persaingan: "1:15", labelPersaingan: "Per kursi", rekomendasiAi: "ITS Sains Data cukup kompetitif untuk profil ini. Perlu peningkatan nilai pada bidang eksakta." },
  "s5-tk1": { siswaId: "s5", targetKampusId: "tk1", peluangLolos: 78, kategori: "Potensial", nilaiRapor: "92,8", labelNilaiRapor: "Di atas rerata", riwayatSekolah: "96,5", labelRiwayat: "Sangat baik", persaingan: "1:18", labelPersaingan: "Per kursi", rekomendasiAi: "Profil Anda sangat kompetitif untuk UGM Kedokteran. Persiapkan UTBK secara intensif khususnya bidang sains." },
  "s5-tk2": { siswaId: "s5", targetKampusId: "tk2", peluangLolos: 93, kategori: "Sangat Potensial", nilaiRapor: "92,8", labelNilaiRapor: "Di atas rerata", riwayatSekolah: "96,5", labelRiwayat: "Sangat baik", persaingan: "1:12", labelPersaingan: "Per kursi", rekomendasiAi: "Peluang masuk UB Sistem Informasi sangat tinggi. Rekam jejak sekolah dan nilai rapor Anda sangat unggul dibanding rata-rata pendaftar." },
  "s5-tk3": { siswaId: "s5", targetKampusId: "tk3", peluangLolos: 87, kategori: "Sangat Potensial", nilaiRapor: "92,8", labelNilaiRapor: "Di atas rerata", riwayatSekolah: "96,5", labelRiwayat: "Sangat baik", persaingan: "1:15", labelPersaingan: "Per kursi", rekomendasiAi: "ITS Sains Data adalah pilihan sangat kuat. Nilai rapor dan rekam jejak sekolah Anda berada jauh di atas ambang batas kompetisi." },
};
