export interface KpiHeaderItem {
  id: string;
  label: string;
  value: string;
  subtext: string;
  iconType: "users" | "pin" | "chart" | "shield";
  colorTheme: "blue" | "purple" | "cyan" | "green";
}

export const KPI_HEADER_ITEMS: KpiHeaderItem[] = [
  {
    id: "total-siswa",
    label: "Total Siswa Angkatan",
    value: "248",
    subtext: "72% MIPA & IPS",
    iconType: "users",
    colorTheme: "blue",
  },
  {
    id: "kuota-eligible",
    label: "Kuota Eligible SNBP",
    value: "72 Siswa",
    subtext: "15 MIPA, 15 IPS",
    iconType: "pin",
    colorTheme: "purple",
  },
  {
    id: "rata-tka",
    label: "Rata-rata Nilai TKA",
    value: "87.4",
    subtext: "Baru 1 - 5 Terdata",
    iconType: "chart",
    colorTheme: "cyan",
  },
  {
    id: "validasi-berkas",
    label: "Tingkat Validasi Berkas",
    value: "98.2%",
    subtext: "244 Terverifikasi",
    iconType: "shield",
    colorTheme: "green",
  },
];

export interface JurusanSebaran {
  nama: string;
  jumlah: number;
  persen: number;
  warna: string;
}

export const DATA_SEBARAN_JURUSAN: JurusanSebaran[] = [
  { nama: "XII MIPA (1 - 6)", jumlah: 144, persen: 58.1, warna: "#226CE0" },
  { nama: "XII IPS (1 - 3)", jumlah: 104, persen: 41.9, warna: "#7F56D9" },
];

export interface RiasecItem {
  kategori: string;
  siswa: number;
  persen: number;
}

export const DATA_MINAT_RIASEC: RiasecItem[] = [
  { kategori: "Investigatif / Riset (MIPA)", siswa: 94, persen: 39 },
  { kategori: "Realistis / Teknik", siswa: 62, persen: 26 },
  { kategori: "Konvensional / Keuangan", siswa: 43, persen: 18 },
  { kategori: "Sosial & Humaniora", siswa: 30, persen: 13 },
  { kategori: "Artistik & Wirausaha", siswa: 19, persen: 8 },
];

export interface SemesterAvg {
  semester: string;
  nilai: number;
}

export const DATA_SEMESTER_AVG: SemesterAvg[] = [
  { semester: "Semester 1", nilai: 84.2 },
  { semester: "Semester 2", nilai: 85.0 },
  { semester: "Semester 3", nilai: 86.9 },
  { semester: "Semester 4", nilai: 87.5 },
  { semester: "Semester 5", nilai: 88.1 },
];

export interface KuotaEligibelStats {
  totalKuota: number;
  totalSiswa: number;
  mipaKuota: number;
  mipaPersen: number;
  ipsKuota: number;
  ipsPersen: number;
  siswaEligible: number;
  tidakEligible: number;
}

export const STATS_KUOTA_ELIGIBEL: KuotaEligibelStats = {
  totalKuota: 168,
  totalSiswa: 420,
  mipaKuota: 96,
  mipaPersen: 57,
  ipsKuota: 72,
  ipsPersen: 43,
  siswaEligible: 168,
  tidakEligible: 224,
};

export interface RankingEligibilitasSiswa {
  rank: number;
  nama: string;
  nisn: string;
  nilaiRataRata: number;
  skor: number;
  status: "Eligible" | "Evaluasi" | "Tidak Eligible";
}

export const DATA_RANKING_ELIGIBILITAS: RankingEligibilitasSiswa[] = [
  { rank: 1, nama: "Nadia Putri Ramadhani", nisn: "0061284731", nilaiRataRata: 94.20, skor: 98.4, status: "Eligible" },
  { rank: 2, nama: "Rizky Aditya Pratama", nisn: "0061284718", nilaiRataRata: 93.85, skor: 97.9, status: "Eligible" },
  { rank: 3, nama: "Salsabila Nur Aini", nisn: "0061284792", nilaiRataRata: 92.70, skor: 96.8, status: "Eligible" },
  { rank: 4, nama: "Muhammad Farhan", nisn: "0061284706", nilaiRataRata: 91.45, skor: 95.2, status: "Eligible" },
  { rank: 5, nama: "Alya Safitri", nisn: "0061284765", nilaiRataRata: 90.80, skor: 93.7, status: "Evaluasi" },
];

export interface SiswaDataItem {
  id: string;
  initials: string;
  initialsBg: string;
  nama: string;
  nisn: string;
  kelas: string;
  gender: "Laki-laki" | "Perempuan";
  statusKelengkapan: "Lengkap" | "Verifikasi Berkas" | "Belum Lengkap";
  kelengkapanDetail: string;
  rataRapor: number;
  rekomendasiMinat: string;
}

export const DATA_MANAJEMEN_SISWA: SiswaDataItem[] = [
  {
    id: "1",
    initials: "AN",
    initialsBg: "#E0D7F5",
    nama: "Aisha Nurul Fathih",
    nisn: "0054381290",
    kelas: "XII MIPA 1",
    gender: "Perempuan",
    statusKelengkapan: "Lengkap",
    kelengkapanDetail: "(100%)",
    rataRapor: 94.80,
    rekomendasiMinat: "Farmasi, Biologi",
  },
  {
    id: "2",
    initials: "MR",
    initialsBg: "#DCEBFB",
    nama: "Muhammad Rifqi Pratama",
    nisn: "0053912834",
    kelas: "XII MIPA 2",
    gender: "Laki-laki",
    statusKelengkapan: "Lengkap",
    kelengkapanDetail: "(100%)",
    rataRapor: 93.60,
    rekomendasiMinat: "Teknik Informatika",
  },
  {
    id: "3",
    initials: "CA",
    initialsBg: "#FDE8E8",
    nama: "Clarissa Amanda",
    nisn: "0054019231",
    kelas: "XII IPS 1",
    gender: "Perempuan",
    statusKelengkapan: "Lengkap",
    kelengkapanDetail: "(100%)",
    rataRapor: 93.50,
    rekomendasiMinat: "Hub. Internasional",
  },
  {
    id: "4",
    initials: "DA",
    initialsBg: "#FEF3C7",
    nama: "Dimas Arya Sena",
    nisn: "0051431182",
    kelas: "XII MIPA 1",
    gender: "Laki-laki",
    statusKelengkapan: "Verifikasi Berkas",
    kelengkapanDetail: "",
    rataRapor: 92.70,
    rekomendasiMinat: "Ilmu Komputer",
  },
  {
    id: "5",
    initials: "NP",
    initialsBg: "#E0D7F5",
    nama: "Nabila Putri Zahrani",
    nisn: "0054361492",
    kelas: "XII IPS 2",
    gender: "Perempuan",
    statusKelengkapan: "Lengkap",
    kelengkapanDetail: "(100%)",
    rataRapor: 91.60,
    rekomendasiMinat: "Desain Komunikasi Visual",
  },
  {
    id: "6",
    initials: "FR",
    initialsBg: "#FDE8E8",
    nama: "Fajar Ramadhan",
    nisn: "0054192341",
    kelas: "XII MIPA 3",
    gender: "Laki-laki",
    statusKelengkapan: "Belum Lengkap",
    kelengkapanDetail: "(Rapor 5 Belum Diunggah)",
    rataRapor: 89.40,
    rekomendasiMinat: "Statistika Terapan",
  },
  {
    id: "7",
    initials: "TS",
    initialsBg: "#E0D7F5",
    nama: "Tiara Sekar Ayu",
    nisn: "0054394832",
    kelas: "XII IPS 3",
    gender: "Perempuan",
    statusKelengkapan: "Lengkap",
    kelengkapanDetail: "(100%)",
    rataRapor: 90.15,
    rekomendasiMinat: "Psikologi, Sosiologi",
  },
  {
    id: "8",
    initials: "RB",
    initialsBg: "#FEF3C7",
    nama: "Raditya Bagus Pratama",
    nisn: "0054098754",
    kelas: "XII MIPA 4",
    gender: "Laki-laki",
    statusKelengkapan: "Verifikasi Berkas",
    kelengkapanDetail: "",
    rataRapor: 88.80,
    rekomendasiMinat: "Teknik Elektro, Mesin",
  },
];

