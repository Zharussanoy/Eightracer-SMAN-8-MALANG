export type UserRole = "siswa" | "guru" | "admin" | "alumni";

export type UserStatus = "aktif" | "lulus" | "Aktif" | "Lulus";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "siswa" | "guru" | "admin" | "alumni";
  statusSiswa?: "aktif" | "lulus";
  statusPenanda?: UserStatus | null;
  nisn?: string;
  kelas?: string;
  nip?: string;
  mataPelajaran?: string;
  waliKelas?: string;
  totalSiswaBinaan?: number;
  adminLevel?: string;
  nilaiRataRata?: number;
  targetPtn?: string;
  targetProdi?: string;
  targetPtnAlt?: string;
  targetProdiAlt?: string;
  jalurTarget?: string;
  tahunLulus?: number;
  angkatan?: string;
  ptnKampus?: string;
  prodiKampus?: string;
  jalurDiterima?: string;
  pekerjaan?: string;
  linkedinUrl?: string;
}

export interface FormDataPendataan {
  nisn: string;
  nama: string;
  angkatan: string;
  tahunLulus: number;
  kampus: string;
  kampusKode: string;
  jurusan: string;
  jenjang: "S1" | "D4" | "D3" | string;
  jalur: "SNBP" | "SNBT" | "Mandiri" | string;
  statusPenerimaan: string;
  nilaiRapor: number;
  skorUtbk?: number | null;
  pekerjaan?: string;
  isKipk: boolean;
  sertifikat: string[];
}
