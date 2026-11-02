export type TabAiStrategi = "Overview" | "Simulator";

export type KategoriPeluang = "Sangat Potensial" | "Potensial" | "Kompetitif" | "Berisiko";

export interface ProgramStudi {
  id: string;
  nama: string;
  jenjang: string;
}

export interface Kampus {
  id: string;
  nama: string;
  singkatan: string;
  programStudi: ProgramStudi[];
}

export interface FaktorKelulusan {
  label: string;
  nilai: number;        // 0-100 for percentage, raw for ratio
  nilaiTampil: string;  // "92.8%", "1:18"
  kualitas: string;     // "Sangat kuat", "Kuat", "Menengah"
  warnBar: string;      // tailwind color class e.g. "bg-purple-600"
  persenBar: number;    // 0-100 for bar width
}

export interface OverviewInsight {
  kampusId: string;
  prodiId: string;
  peningkatan: string;      // "12,4%"
  jumlahRiwayat: number;    // 500
  prediksiLolos: string;    // "82,6%"
  akurasiRekomendasi: string; // "87,2%"
  pilihan1Berhasil: string; // "64,8%"
  faktorKelulusan: FaktorKelulusan[];
}

export interface SiswaProfil {
  id: string;
  nama: string;
  nilaiRapor: number;
  riwayatSekolah: number;
}

export interface TargetKampus {
  id: string;
  nama: string;
  prodi: string;
  jenjang: string;
  estimasiPersen: number; // 0-100
}

export interface HasilSimulasi {
  siswaId: string;
  targetKampusId: string;
  peluangLolos: number;       // 0-100
  kategori: KategoriPeluang;
  nilaiRapor: string;         // "92,8"
  labelNilaiRapor: string;    // "Di atas rerata"
  riwayatSekolah: string;     // "97,2"
  labelRiwayat: string;       // "Sangat baik"
  persaingan: string;         // "1:18"
  labelPersaingan: string;    // "Per kursi"
  rekomendasiAi: string;
}
