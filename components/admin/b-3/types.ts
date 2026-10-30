export type AdminRole = "admin" | "siswa" | "alumni" | "guru";

export type AdminTab =
  | "Ringkasan"
  | "Direktori Alumni"
  | "AI Strategi Jurusan"
  | "Formulir Pendataan";

export type B3Role = AdminRole;
export type B3Tab = AdminTab;

export interface AlumniItem {
  id: string;
  nisn: string;
  nama: string;
  angkatan: string;
  kampus: string;
  kampusKode: string;
  jurusan: string;
  jalur: "SNBP" | "SNBT" | "Mandiri";
  pilihanKe: string;
  statusPenerimaan: string;
  jenjang: string;
  nilai: number;
  skorUtbk?: number | null;
  sertifikat: string[];
  isKipk: boolean;
}

export interface CertificateItem {
  id: string;
  title: string;
  organizer: string;
}
