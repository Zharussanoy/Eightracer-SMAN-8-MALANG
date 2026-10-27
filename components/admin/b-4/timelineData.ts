export interface TimelineStudent {
  name: string;
  university: string;
  studyProgram: string;
  admissionPath: string;
  nisn: string;
  photo?: string;
}

export interface SemesterRecord {
  number: number;
  period: string;
  ipk?: string;
  scholarship?: string;
  ukt?: string;
  kipk?: string;
  note?: string;
}

// Data contoh untuk tampilan; angka dan identitas bukan data dari backend.
export const TIMELINE_STUDENTS: TimelineStudent[] = [
  { name: "Dian Permata Sari", university: "Universitas Indonesia", studyProgram: "Psikologi", admissionPath: "SNBP", nisn: "1234••••••7370" },
  { name: "Arga Pratama", university: "Universitas Brawijaya", studyProgram: "Teknik Informatika", admissionPath: "SNBT", nisn: "1234••••••2871" },
  { name: "Nadia Putri", university: "Universitas Negeri Malang", studyProgram: "Manajemen", admissionPath: "SNBP", nisn: "1234••••••5032" },
];

export const SEMESTERS: SemesterRecord[] = [
  { number: 1, period: "Ganjil 2024/2025", ipk: "3.75", scholarship: "Seleksi SNBP", ukt: "Rp 5.000.000", kipk: "Tidak" },
  { number: 2, period: "Genap 2024/2025", ipk: "3.78", scholarship: "Beasiswa Unggulan", ukt: "Rp 5.000.000", kipk: "Tidak", note: "Pada semester 2, alumni mulai menerima Beasiswa Unggulan. Nilai UKT tetap sama dengan semester sebelumnya (Rp5.000.000), dan capaian IPK meningkat dari 3.75 ke 3.78. Alokasi dana beasiswa meng-cover biaya UKT penuh dan tunjangan biaya hidup." },
  { number: 3, period: "Ganjil 2025/2026", ipk: "3.78", scholarship: "Beasiswa Aktif", ukt: "Rp 5.000.000", kipk: "Tidak" },
  ...[4, 5, 6, 7, 8].map((number) => ({ number, period: number % 2 === 0 ? `Genap ${2023 + Math.ceil(number / 2)}/${2024 + Math.ceil(number / 2)}` : `Ganjil ${2023 + Math.ceil(number / 2)}/${2024 + Math.ceil(number / 2)}` })),
];
