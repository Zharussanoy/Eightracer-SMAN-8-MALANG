export type ScholarshipLevel = "Kuliah" | "SMA" | "Kuliah & SMA";

export interface Scholarship {
  id: string;
  name: string;
  level: ScholarshipLevel;
  duration: string;
  applyPeriod: string;
  archived: boolean;
}

const examples: Omit<Scholarship, "id">[] = [
  { name: "Beasiswa Unggulan", level: "Kuliah", duration: "8 Semester", applyPeriod: "Juli - Agustus", archived: false },
  { name: "Beasiswa Unggulan", level: "Kuliah", duration: "8 Semester", applyPeriod: "Juli - Agustus", archived: false },
  { name: "Tanoto Scholars", level: "Kuliah", duration: "8 Semester", applyPeriod: "Juli - Agustus", archived: false },
  { name: "Beasiswa Prestasi Siswa", level: "SMA", duration: "1 tahun", applyPeriod: "Juli - Agustus", archived: false },
  { name: "Beasiswa Unggulan", level: "Kuliah", duration: "8 Semester", applyPeriod: "Juli - Agustus", archived: false },
  { name: "Djarum Beasiswa Plus", level: "Kuliah", duration: "8 Semester", applyPeriod: "Juli - Agustus", archived: false },
  { name: "KIP-Kuliah Merdeka", level: "Kuliah", duration: "8 Semester", applyPeriod: "Juli - Agustus", archived: false },
  { name: "Beasiswa Pendidikan Lama", level: "Kuliah & SMA", duration: "2 tahun", applyPeriod: "Tidak Tersedia", archived: true },
];

// Data contoh untuk slicing; belum terhubung ke penyimpanan backend.
export const SCHOLARSHIPS: Scholarship[] = Array.from({ length: 30 }, (_, index) => ({
  ...examples[index % examples.length],
  id: `b4-scholarship-${index + 1}`,
}));
