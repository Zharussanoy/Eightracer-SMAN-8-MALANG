export type JenjangKelas = "X" | "XI" | "XII";

export interface RiwayatAkademikSemester {
  id: string;
  jenjang: JenjangKelas;
  kelas: string; // e.g. "X-3"
  semester: number; // e.g. 1, 2, 3, 4, 5
  tahunAjaran: string; // e.g. "2024/2025"
  rataRataNilai?: number;
  statusKeterangan: string;
}

export type StatusEvaluasiSiswa =
  | "BELUM_DIIZINKAN_KELAS_X"
  | "INPUT_MANDIRI_TERBUKA"
  | "TERSEDIA_TERVALIDASI"
  | "BELUM_ADA_NILAI"
  | "BELUM_DIVALIDASI";

export interface StudentB1Account {
  studentId: string;
  nisn: string;
  nama: string;
  namaPanggilan: string;
  email: string;
  kelas: string; // e.g. "X-3", "XI-F2", "XII-A1"
  jenjang: JenjangKelas; // Derived / stored level
  semester: number; // e.g. 2, 3, 5
  tahunAjaran: string; // e.g. "2025/2026"
  targetProdiUtama: string;
  targetKampusUtama: string;
  riasecDominan: string;
  kecerdasanMajemuk: string;
  rataRataRapor: number;
  avatarInitials: string;
  riwayatAkademik: RiwayatAkademikSemester[];
  // Status Validasi Surat Rekomendasi oleh Admin/Guru BK
  isSuratValidated?: boolean;
  // Status Evaluasi Nilai Mapel Pilihan
  evaluasiStatus: StatusEvaluasiSiswa;
  evaluasiMessage?: string;
  evaluasiRows?: EvaluasiNilaiRowItem[];
}

export type SiswaB1Tab =
  | "Rekomendasi Mapel Pilihan"
  | "Evaluasi Nilai Mapel Pilihan"
  | "Profil & Portofolio Akademik"
  | "Direktori Siswa";

export interface DirektoriSiswaItem {
  id: string;
  nama: string;
  nisn: string;
  kelas: string;
  fase: string; // e.g. "Fase F (Kelas XI MIPA 4)"
  angkatan: string; // e.g. "Angkatan 2023 (Fase F - Kelas XI)"
  tahunMasuk: string; // e.g. "2023"
  peranEkskul: string;
  rumpunPeminatan: string; // e.g. "Peminatan Sains & Teknologi"
  targetStudi: string; // e.g. "Teknik Informatika & Sistem Informasi"
  fokusPilihan: string;
  email: string;
  rekomendasiPtn: string;
  avatarUrl?: string;
  avatarInitials: string;
  biografi?: string;
  prestasi?: string[];
  keahlian?: string[];
  mapelPilihanList?: string[];
}

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
  | "Menunggu Validasi"
  | "Belum Diisi"
  | "Belum Ada Nilai";

export interface EvaluasiNilaiRowItem {
  id: string;
  mataPelajaranId?: number;
  mataPelajaran: string;
  semester: number;
  nilaiInputSiswa: string;
  nilaiRaporSebenarnya: string;
  nilaiTerverifikasi: string | null;
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
