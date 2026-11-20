import { JenjangKelas, StudentB1Account, StatusEvaluasiSiswa } from "./types";

/**
 * Logika Identifikasi Jenjang Kelas Siswa secara otomatis dari data profil/akun siswa.
 * - Kelas 10 ("X")         => Fase E (Fokus Inti Peminatan)
 * - Kelas 11/12 ("XI"/"XII") => Fase F (Ekstensi Longitudinal mulai Semester 3)
 */
export function identifyJenjangKelas(kelas: string): JenjangKelas {
  if (!kelas) return "X";
  const cleaned = kelas.trim().toUpperCase();

  if (cleaned.startsWith("XII") || /\bXII\b/.test(cleaned)) {
    return "XII";
  }
  if (cleaned.startsWith("XI") || /\bXI\b/.test(cleaned)) {
    return "XI";
  }
  if (cleaned.startsWith("X") || /\bX\b/.test(cleaned)) {
    return "X";
  }

  if (cleaned.startsWith("12")) return "XII";
  if (cleaned.startsWith("11")) return "XI";
  if (cleaned.startsWith("10")) return "X";

  return "X";
}

export interface StudentAccessRules {
  jenjang: JenjangKelas;
  faseKurikulum: "Fase E" | "Fase F";
  modeModul: "FOKUS_INTI_PEMINATAN" | "EKSTENSI_LONGITUDINAL_FASE_F";
  canAccessRekomendasi: boolean;
  canViewRekomendasiMapel: boolean;
  canAccessEvaluasi: boolean;
  canAccessProfil: boolean;
  evaluasiStatus: StatusEvaluasiSiswa;
  keteranganAksesEvaluasi: string;
  isSuratValidated: boolean;
  suratValidationMessage?: string;
}

/**
 * Kontrol Akses Berbasis Peran dan Tingkat Kelas (Role & Grade-Based Access Control):
 * 1. Jika Siswa Terdeteksi Kelas 10 (Jenjang "X" / Fase E):
 *    - Mengarahkan antarmuka ke Fokus Inti Peminatan (Profil, Nilai Rapor Smt 1,
 *      Kartu Rekomendasi 4 Mapil Otomatis, dan status validasi/penerbitan SK oleh Guru BK).
 *    - Menu untuk input nilai mandiri berkala DIKUNCI / DISEMBUNYIKAN karena siswa Kelas 10
 *      belum memerlukan rapor semester berjalan untuk ekstensi longitudinal.
 * 2. Jika Siswa Terdeteksi Kelas 11 atau 12 (Jenjang "XI" atau "XII" / Fase F - Ekstensi Berkelanjutan):
 *    - Mengaktifkan Modul Ekstensi Longitudinal (mulai Semester 3 dan seterusnya).
 *    - Membuka akses formulir Input Mandiri Nilai Rapor Berkala khusus hanya untuk
 *      4 mapil pilihan yang tercantum dalam SK mereka (setelah SK divalidasi), serta
 *      mengarahkan status pengajuannya ke panel validasi Wali Kelas.
 */
export function determineStudentAccess(
  student: StudentB1Account,
  overrideSuratValidated?: boolean
): StudentAccessRules {
  const jenjang = identifyJenjangKelas(student.kelas);
  const isKelas10FaseE = jenjang === "X";
  const faseKurikulum = isKelas10FaseE ? "Fase E" : "Fase F";
  const modeModul = isKelas10FaseE
    ? "FOKUS_INTI_PEMINATAN"
    : "EKSTENSI_LONGITUDINAL_FASE_F";

  const isSuratValidated =
    overrideSuratValidated !== undefined
      ? overrideSuratValidated
      : (student.isSuratValidated ?? false);

  // KONDISI 1: Jika Surat Rekomendasi BELUM divalidasi oleh Admin/Guru BK
  if (!isSuratValidated) {
    return {
      jenjang,
      faseKurikulum,
      modeModul,
      canAccessRekomendasi: true,
      canViewRekomendasiMapel: false,
      canAccessEvaluasi: false,
      canAccessProfil: true,
      evaluasiStatus: "BELUM_DIVALIDASI",
      isSuratValidated: false,
      keteranganAksesEvaluasi:
        "Halaman evaluasi nilai belum dapat diakses karena Surat Rekomendasi Peminatan Anda saat ini masih dalam proses peninjauan oleh Tim Guru BK dan belum divalidasi & dikunci permanen.",
      suratValidationMessage:
        "Paket rekomendasi mata pelajaran pilihan Fase F Anda saat ini sedang dalam proses evaluasi oleh Tim Guru Bimbingan dan Konseling SMAN 8 Malang. Kartu rekomendasi mata pelajaran dan Surat Keputusan (SK) resmi akan otomatis ditampilkan di halaman ini setelah Guru BK menyelesaikan validasi dan mengunci keputusan penetapan peminatan.",
    };
  }

  // KONDISI 2: Surat Rekomendasi SUDAH divalidasi & dikunci oleh Admin/Guru BK
  return {
    jenjang,
    faseKurikulum,
    modeModul,
    canAccessRekomendasi: true,
    canViewRekomendasiMapel: true,
    canAccessEvaluasi: true,
    canAccessProfil: true,
    evaluasiStatus: "INPUT_MANDIRI_TERBUKA",
    isSuratValidated: true,
    keteranganAksesEvaluasi:
      "Surat rekomendasi peminatan telah divalidasi & dikunci resmi oleh Guru BK / Admin. Halaman evaluasi nilai telah terbuka khusus untuk 4 mata pelajaran pilihan pada SK Anda.",
  };
}
