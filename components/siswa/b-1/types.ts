export type SiswaB1Tab =
  | "Rekomendasi Mapel Pilihan"
  | "Evaluasi Nilai Mapel Pilihan"
  | "Profil & Portofolio Akademik";

export interface TopikPembelajaranItem {
  nama: string;
  deskripsi: string;
}

export interface MapelPilihanDetail {
  id: string;
  urutan: string; // e.g. "MAPEL PILIHAN 1"
  nama: string; // e.g. "Matematika Tingkat Lanjut"
  kategori: string;
  tingkatKesesuaian: number; // e.g. 92
  labelPenguasaan: string; // e.g. "92% - Tinggi"
  catatanPenjelasan: string; // e.g. "hasil asesmen RIASEC."
  deskripsiFokus: string;
  topikUtama: TopikPembelajaranItem[]; // 4 pill cards
  rekomendasiAlokasiJam: string;
  fokusPenguatanMateri: string;
  catatanEvaluasiAkademik: string;
  nilaiDasar: number;
  iconType: "math" | "physics" | "informatics" | "chemistry";
  iconBg: string;
  iconColor: string;
  labelColor: string;
}

export type StatusValidasiNilai =
  | "Tervalidasi Rapor Fisik"
  | "Perlu Koreksi Fisik"
  | "Menunggu Validasi";

export interface EvaluasiNilaiRowItem {
  id: string;
  mataPelajaran: string;
  semester: number;
  nilaiInputSiswa: string;
  nilaiRaporSebenarnya: string;
  nilaiTerverifikasi: string | null; // null if waiting correction
  statusValidasi: StatusValidasiNilai;
  catatanKoreksi?: string;
}

export interface PenghargaanSiswaItem {
  id: string;
  judul: string;
  penyelenggara: string;
  waktuBulan?: string;
  tahun: string;
  tingkat: "Internasional" | "Nasional" | "Provinsi" | "Kota/Kabupaten" | "Sekolah";
  kategori: "Akademik" | "Riset & Inovasi" | "Non-Akademik" | "Kategori Individu";
  deskripsi?: string;
  isUtama?: boolean;
}

export interface RiwayatPendidikanItem {
  id: string;
  namaSekolah: string;
  keterangan: string;
  tahun: string;
  isCurrent?: boolean;
}
