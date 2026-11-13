import { ALUMNI } from "@/components/b4/demoStore";
export interface CollegeAlumni { id: string; name: string; university: string; studyProgram: string; admissionPath: string; latestStatus: string; }
// Profil contoh yang sama dipakai pada daftar, detail, dan portal siswa.
export const COLLEGE_ALUMNI: CollegeAlumni[] = ALUMNI.map((item) => ({ id: item.id, name: item.name, university: item.university, studyProgram: item.program, admissionPath: item.admission, latestStatus: "Aktif" }));
