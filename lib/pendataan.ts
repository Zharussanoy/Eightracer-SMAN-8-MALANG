import type { FormDataPendataan } from "@/types/user";
import type { AlumniItem } from "@/components/admin/direktori-alumni/types";

export const KELAS_OPTIONS = Array.from({ length: 9 }, (_, i) => `XII ${i + 1}`);
export const JENIS_KAMPUS_OPTIONS = ["Negeri", "Swasta", "Ikatan Dinas", "Luar Negeri"];
export const PILIHAN_OPTIONS = ["1", "2", "3", "4", "Tanpa Pilihan"];
export const BEASISWA_OPTIONS = ["TIDAK", "BEASISWA TELADAN", "BEASISWA UNGGULAN", "BEASISWA IFL", "Lainnya"];
export const JALUR_OPTIONS = [
  ["SNBP", "SNBP (Jalur Prestasi)"],
  ["SNBT", "SNBT"],
  ["Tes Kedinasan", "Tes Kedinasan"],
  ["Mandiri Prestasi", "Mandiri Prestasi"],
  ["Mandiri Nilai Rapor", "Mandiri Nilai Rapor"],
  ["Mandiri Skor UTBK", "Mandiri Skor UTBK"],
  ["Mandiri Tes Tulis", "Mandiri Tes Tulis"],
  ["Seleksi Masuk Bersama Tes CBT (SIMAMA) Poltekkes Malang", "Seleksi Masuk Bersama Tes CBT (SIMAMA) Poltekkes Malang"],
  ["Seleksi Masuk Mandiri Poltekkes Malang (SIMAMI)", "Seleksi Masuk Mandiri Poltekkes Malang (SIMAMI)"],
  ["Mandiri", "Mandiri"],
  ["Kedinasan", "Kedinasan"],
  ["SPAN-PTKIN", "SPAN-PTKIN"],
  ["UM-PTKIN", "UM-PTKIN"],
  ["Luar Negeri", "Luar Negeri"],
  ["Lainnya", "Lainnya"],
] as const;

// Keep phone numbers as strings, including their leading zero or country prefix.
export const WHATSAPP_PATTERN = "(?:08|\\+628)[0-9]{8,11}";

export function pendataanStorageKey(userId: string): string {
  return `eightracer_pendataan_b3:${userId}`;
}

export function mapPendataanToItem(data: FormDataPendataan, id: string): AlumniItem {
  return {
    ...data,
    id,
    jenisKampus: data.jenisKampus as AlumniItem["jenisKampus"],
    nilai: data.nilaiRapor,
  };
}

export function normalizePendataan<T extends {
  nama: string; kampus: string; jurusan: string; jenisKampus?: string;
  nomorWa?: string; jalur: string; jalurLainnya?: string;
  lembagaPenyalur?: string; beasiswa?: string; beasiswaLainnya?: string;
}>(data: T): T {
  return {
    ...data,
    nama: data.nama.trim().toUpperCase(),
    kampus: data.kampus.trim().toUpperCase(),
    jurusan: data.jurusan.trim().toUpperCase(),
    nomorWa: data.nomorWa?.trim(),
    lembagaPenyalur: data.jenisKampus === "Luar Negeri" ? data.lembagaPenyalur?.trim() || "" : "",
    jalurLainnya: data.jalur === "Lainnya" ? data.jalurLainnya?.trim() || "" : "",
    beasiswaLainnya: data.beasiswa === "Lainnya" ? data.beasiswaLainnya?.trim() || "" : "",
  };
}

export function validatePendataan(data: FormDataPendataan): string | null {
  if (!data.nisn.trim() || !data.nama.trim() || !data.kampus.trim() || !data.jurusan.trim()) {
    return "Lengkapi NISN, nama lengkap, nama perguruan tinggi, dan program studi.";
  }
  if (!KELAS_OPTIONS.includes(data.kelas)) return "Pilih kelas XII 1 sampai XII 9.";
  if (!new RegExp(`^${WHATSAPP_PATTERN}$`).test(data.nomorWa)) return "Nomor WhatsApp harus menggunakan format 08xxx atau +628xxx (10–13 digit lokal).";
  if (!JENIS_KAMPUS_OPTIONS.includes(data.jenisKampus)) return "Pilih jenis perguruan tinggi.";
  if (!PILIHAN_OPTIONS.includes(data.pilihanKe)) return "Pilih pilihan ke.";
  if (!JALUR_OPTIONS.some(([value]) => value === data.jalur)) return "Pilih jalur masuk yang tersedia.";
  if (data.jalur === "Lainnya" && !data.jalurLainnya?.trim()) return "Isi nama jalur masuk lainnya.";
  if (data.pelamarKipk && !["YA", "TIDAK"].includes(data.pelamarKipk)) return "Pilihan pelamar KIP-K tidak valid.";
  if (data.beasiswa && !BEASISWA_OPTIONS.includes(data.beasiswa)) return "Pilihan beasiswa tidak valid.";
  if (data.beasiswa === "Lainnya" && !data.beasiswaLainnya?.trim()) return "Isi nama beasiswa yang sudah diterima.";
  return null;
}
