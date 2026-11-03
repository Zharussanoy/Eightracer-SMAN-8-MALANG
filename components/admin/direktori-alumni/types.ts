export type AdminRole = "admin" | "siswa" | "alumni" | "guru";

export type AdminTab =
  | "Ringkasan"
  | "Direktori Alumni"
  | "AI Strategi Jurusan"
  | "Formulir Pendataan";

export type B3Role = AdminRole;
export type B3Tab = AdminTab;

export type KategoriPerguruanTinggi =
  | "Negeri"
  | "Swasta"
  | "Kedinasan"
  | "Luar Negeri";

export type JalurMasuk =
  | "SNBP"
  | "SNBT"
  | "Mandiri"
  | "Kedinasan"
  | "SPAN-PTKIN"
  | "UM-PTKIN"
  | "Luar Negeri";

export interface AlumniItem {
  id: string;
  nisn: string;
  nama: string;
  kelas?: string; // KLS: misal "XII MIPA 1"
  angkatan: string;
  kampus: string; // PERGURUAN TINGGI
  kampusKode: string;
  jenisKampus?: KategoriPerguruanTinggi; // Kategori PT: Negeri, Swasta, Kedinasan, Luar Negeri
  jurusan: string; // PROGRAM STUDI
  jalur: JalurMasuk | string; // JALUR MASUK
  nomorWa?: string; // NOMOR WA
  pilihanKe: string; // PIL (Pilihan 1 / 2)
  statusPdss?: string; // PDSS ("Eligible", "Ya", "Tidak")
  statusPenerimaan: string;
  jenjang: string;
  nilai: number;
  skorUtbk?: number | null;
  sertifikat: string[]; // SERTIF
  isKipk: boolean; // KIPK (true = KIP-K / Ya, false = Reguler / Tidak)
}

export interface CertificateItem {
  id: string;
  title: string;
  organizer: string;
}
