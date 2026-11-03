"use client";

import { useEffect, useSyncExternalStore } from "react";
import { SCHOLARSHIPS, type Scholarship } from "@/components/admin/b-4/scholarshipData";

export interface CatalogItem extends Scholarship {
  criteria: string[];
  provider: string;
  funding: string;
}
export interface Progress {
  semester: number;
  period: string;
  ipk: string;
  kipk: "Ya" | "Tidak";
  scholarship: string;
  ukt: string;
  ipi: string;
  showUkt: boolean;
  showIpi: boolean;
}
export interface Recommendation {
  id: string;
  scholarshipId: string;
  score: number;
  reason: string;
  timing: string;
  hidden: boolean;
}
export const STUDENTS = [
  { id: "bagas", name: "Bagas Wijaya", classroom: "XII MIPA 2", cohort: "2023" },
  { id: "nadia", name: "Nadia Putri Wicaksono", classroom: "XII MIPA 2", cohort: "2023" },
  { id: "rizky", name: "Rizky Pratama", classroom: "XII MIPA 1", cohort: "2022" },
];
export const ALUMNI = [
  { id: "dian", name: "Dian Permata Sari", cohort: "2021", classroom: "XII IPS 2", university: "Universitas Indonesia", program: "S1 Psikologi", admission: "SNBP", scholarship: "KIP-Kuliah", faculty: "Fakultas Psikologi" },
  { id: "rizky", name: "Rizky Pratama", cohort: "2022", classroom: "XII MIPA 1", university: "Universitas Brawijaya", program: "S1 Teknik Informatika", admission: "SNBT", scholarship: "Beasiswa Unggulan", faculty: "Fakultas Ilmu Komputer" },
  { id: "nadia", name: "Nadia Putri", cohort: "2022", classroom: "XII MIPA 1", university: "Universitas Negeri Malang", program: "S1 Pendidikan Biologi", admission: "SNBP", scholarship: "Reguler", faculty: "Fakultas Matematika dan IPA" },
  { id: "bagas", name: "Bagas Wicaksono", cohort: "2021", classroom: "XII IPS 2", university: "Universitas Brawijaya", program: "S1 Ilmu Politik", admission: "SNBT", scholarship: "Tanoto Foundation", faculty: "Fakultas Ilmu Sosial dan Ilmu Politik" },
  { id: "alya", name: "Alya Sabrina", cohort: "2021", classroom: "XII MIPA 4", university: "Institut Teknologi Sepuluh Nopember", program: "S1 Teknik Elektro", admission: "SNBP", scholarship: "Beasiswa Prestasi", faculty: "Fakultas Teknologi Elektro" },
  { id: "fajar", name: "Fajar Ramadhan", cohort: "2022", classroom: "XII MIPA 1", university: "Politeknik Negeri Malang", program: "D4 Jaringan Telekomunikasi", admission: "Mandiri", scholarship: "Reguler", faculty: "Jurusan Teknik Elektro" },
];
export type AlumniProfile = typeof ALUMNI[number];
export const INITIAL_PROGRESS: Progress[] = [
  { semester: 3, period: "Ganjil 2025/2026", ipk: "3.82", kipk: "Tidak", scholarship: "Beasiswa Unggulan", ukt: "5000000", ipi: "0", showUkt: true, showIpi: false },
  { semester: 2, period: "Genap 2024/2025", ipk: "3.78", kipk: "Tidak", scholarship: "Beasiswa Unggulan", ukt: "5000000", ipi: "0", showUkt: true, showIpi: false },
  { semester: 1, period: "Ganjil 2024/2025", ipk: "3.75", kipk: "Tidak", scholarship: "-", ukt: "5000000", ipi: "0", showUkt: true, showIpi: false },
];
const initialCatalog: CatalogItem[] = SCHOLARSHIPS.map((item) => ({ ...item,
  criteria: ["Memiliki prestasi akademik maupun non akademik", "Memenuhi persyaratan akademik sesuai ketentuan program", "Melengkapi dokumen persyaratan dari penyelenggara"],
  provider: item.name.includes("Tanoto") ? "Tanoto Foundation" : "Kemendikbudristek",
  funding: "Penuh (UKT + Tunjangan)",
}));
function initialRecommendations(studentId: string): Recommendation[] {
  return [initialCatalog[0], initialCatalog[2], initialCatalog[3]].map((item, index) => ({
    id: `${studentId}-${index + 1}`, scholarshipId: item.id, score: [86, 82, 79][index],
    reason: ["Profil akademik dan prestasi siswa menunjukkan kesesuaian dengan kriteria program berdasarkan data contoh yang tersedia.", "Minat riset, kepemimpinan, dan keterlibatan organisasi relevan dengan fokus pengembangan program.", "Prestasi dan domisili siswa sesuai dengan cakupan program bantuan pendidikan."][index],
    timing: "SMA Semester 6 / Menjelang Kelulusan", hidden: false,
  }));
}
export interface DemoData {
  version: 1;
  catalog: CatalogItem[];
  students: Record<string, { published: boolean; items: Recommendation[] }>;
  progress: Record<string, Progress[]>;
  viewerId: string;
}
const initialData: DemoData = {
  version: 1, catalog: initialCatalog,
  students: Object.fromEntries(STUDENTS.map((student) => [student.id, { published: student.id === "bagas", items: initialRecommendations(student.id) }])),
  progress: {}, viewerId: "bagas",
};
const STORAGE_KEY = "eightracer-b4-demo-v1";
let snapshot = initialData;
let hydrated = false;
const listeners = new Set<() => void>();
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const cached = raw ? JSON.parse(raw) : null;
    if (cached?.version === 1 && Array.isArray(cached.catalog) && cached.students && cached.progress && STUDENTS.some((student) => student.id === cached.viewerId)) snapshot = cached;
  } catch { /* Data demo yang tidak valid diabaikan. */ }
  listeners.forEach((listener) => listener());
}
export function updateDemo(update: (current: DemoData) => DemoData) {
  hydrate();
  snapshot = update(snapshot);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Pratinjau tetap berfungsi jika penyimpanan browser tidak tersedia. */ }
  listeners.forEach((listener) => listener());
}
export function useDemoData() {
  const data = useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    () => snapshot,
    () => initialData,
  );
  useEffect(hydrate, []);
  return data;
}
export function progressFor(data: DemoData, alumniId: string) { return data.progress[alumniId] ?? INITIAL_PROGRESS; }
export function rupiah(value: string | number) { return `Rp ${Number(value || 0).toLocaleString("id-ID")}`; }
export function publishedFor(data: DemoData, studentId: string) {
  const review = data.students[studentId];
  return review?.published ? review.items.filter((item) => !item.hidden && data.catalog.some((catalog) => catalog.id === item.scholarshipId && !catalog.archived)) : [];
}
export function makeDemoRecommendations(catalog: CatalogItem[], studentId: string): Recommendation[] {
  const unique = catalog.filter((item, index, items) => !item.archived && items.findIndex((other) => !other.archived && other.name === item.name) === index).slice(0, 3);
  return unique.map((item, index) => ({ id: `${studentId}-${crypto.randomUUID()}`, scholarshipId: item.id, score: 86 - index * 4, reason: "Contoh alasan kecocokan berdasarkan profil akademik dan persyaratan katalog. Hasil ini belum berasal dari layanan AI.", timing: "Menjelang kelulusan / sesuai periode pendaftaran", hidden: false }));
}
