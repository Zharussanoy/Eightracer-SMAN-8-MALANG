export type B1Tab =
  | "Pusat Manajemen Data"
  | "Dashboard Konseling"
  | "Validasi & Surat Rekomendasi"
  | "Feedback Strategi & Direktori BK"
  | "Mengelola Wali Kelas";

export interface WaliKelasItem {
  id: number;
  inisial: string;
  nama_lengkap: string;
  nip: string;
  label_nip: string;
  username: string;
  jabatan: string;
  foto_profil?: string | null;
  foto_profil_url?: string | null;
  kelas_id?: number | null;
  nama_kelas: string;
  tingkat: string;
  tahun_ajaran: string;
  total_siswa: number;
  status_akun: string;
  daftar_kelas?: Array<{
    id: number;
    nama_kelas: string;
    tingkat: string;
    tahun_ajaran: string;
    total_siswa: number;
  }>;
}

export interface KelasTersediaItem {
  id: number;
  nama_kelas: string;
  tingkat: string;
  tahun_ajaran: string;
  wali_kelas_id?: number | null;
  wali_kelas_nama?: string | null;
  wali_kelas_nip?: string | null;
  total_siswa: number;
}

export type RiasecType =
  | "Investigative"
  | "Enterprising"
  | "Artistic"
  | "Realistik"
  | "Social"
  | "Conventional"
  | "-";

export interface StudentB1 {
  id: string;
  nisn: string;
  nama: string;
  namaPanggilan?: string;
  kelas: string;
  nilaiRapor: number;
  riasec: RiasecType;
  riasecScores: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  kecerdasanMajemuk: string;
  minatProdi: string;
  minatProdiAlternatif?: string;
  prospekKarir?: string;
  catatanKonseling?: string;
  statusPemetaan?: "Lengkap" | "Perlu Verifikasi" | "Siap Dipetakan";

  // Monitoring Nilai Mapel Peminatan & Keberhasilan
  semesterAktif?: number;
  daftarSemesterTerisi?: number[];
  mapelPilihanUtama?: string;
  paket4Mapel?: string[];
  nilaiMapelPilihan?: number | null;
  sudahInputNilai?: boolean;
  trenNilaiMapel?: "naik" | "stabil" | "menurun" | null;
  persentaseKeberhasilan?: number | null;
  statusKesesuaian?: "Sesuai" | "Perlu Penyesuaian" | "Perlu Peninjauan" | "Menunggu Input Nilai";
  detailNilai4Mapel?: Array<{
    urutan?: number;
    mataPelajaranId?: number;
    namaMapel: string;
    nilai: number | null;
    nilai_formatted?: string;
    statusValidasi?: string;
    labelValidasi?: string;
    sudahDiinput?: boolean;
  }>;

  // Detailed Biodata from Figma CSS
  bahasaKeseharian?: string;
  citaCita?: string;
  hobi?: string;
  warnaFavorit?: string;
  makananFavorit?: string;
  permainanOnline?: string;
  permainanOffline?: string;

  // Latar Belakang & Bansos from Figma CSS
  kondisiOrtu?: string;
  ayahPekerjaan?: string;
  ibuPekerjaan?: string;
  penghasilanGabungan?: string;
  kontakOrtu?: string;
  bansos?: {
    pip: string;
    pkh: string;
    kisBpjs: string;
    kip: string;
  };
}

export interface UploadedFileState {
  name: string;
  size: string;
  readCount: number;
  status: "Siap Dipetakan" | "Sedang Diproses" | "Tersimpan";
}

export interface B1FilterState {
  search: string;
  kecerdasan: string;
  riasec: string;
  kelas: string;
}

export interface RecommendationLetterData {
  nomorSurat: string;
  tanggalSurat: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  pembuka: string;
  mataPelajaran: string[];
  keterangan: string[];
  namaPenandatangan: string;
  nipPenandatangan: string;
  jabatanPenandatangan: string;
}

