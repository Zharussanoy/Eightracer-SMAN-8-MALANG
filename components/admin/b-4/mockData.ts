export interface CollegeAlumni {
  id: string;
  name: string;
  university: string;
  studyProgram: string;
  admissionPath: string;
  latestStatus: string;
}

const examples: Omit<CollegeAlumni, "id">[] = [
  { name: "Dian Permata Sari", university: "Universitas Indonesia", studyProgram: "Psikologi", admissionPath: "Mandiri", latestStatus: "Aktif" },
  { name: "Arga Pratama", university: "Universitas Brawijaya", studyProgram: "Teknik Informatika", admissionPath: "SNBT", latestStatus: "Aktif" },
  { name: "Nadia Putri", university: "Universitas Negeri Malang", studyProgram: "Manajemen", admissionPath: "SNBP", latestStatus: "Lulus" },
  { name: "Fajar Ramadhan", university: "Universitas Indonesia", studyProgram: "Manajemen", admissionPath: "SNBT", latestStatus: "Aktif" },
  { name: "Alya Maharani", university: "Universitas Brawijaya", studyProgram: "Psikologi", admissionPath: "SNBP", latestStatus: "Cuti" },
];

// Data demonstrasi untuk slicing, bukan data alumni dari backend.
// Delapan baris awal mengikuti contoh pada screenshot desain.
export const COLLEGE_ALUMNI: CollegeAlumni[] = Array.from({ length: 300 }, (_, index) => ({
  ...examples[index < 8 ? 0 : (index - 8) % examples.length],
  id: `b4-demo-${index + 1}`,
}));
