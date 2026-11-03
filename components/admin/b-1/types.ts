export type B1Tab =
  | "Pusat Manajemen Data"
  | "Dashboard Konseling"
  | "Validasi & Surat Rekomendasi"
  | "Feedback Strategi & Direktori BK";

export type RiasecType =
  | "Investigative"
  | "Enterprising"
  | "Artistic"
  | "Realistik"
  | "Social"
  | "Conventional";

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
  mapelPilihanUtama?: string;
  nilaiMapelPilihan?: number;
  trenNilaiMapel?: "naik" | "stabil" | "menurun";
  persentaseKeberhasilan?: number;
  statusKesesuaian?: "Sesuai" | "Perlu Penyesuaian" | "Perlu Peninjauan";

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

