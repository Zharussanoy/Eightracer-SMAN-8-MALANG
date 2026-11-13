import { JenjangKelas, StudentB1Account, StatusEvaluasiSiswa } from "./types";

/**
 * Logika Identifikasi Jenjang Kelas Siswa secara otomatis dari data profil siswa.
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
 * Logika Penentuan Hak Akses & Status Evaluasi:
 * 1. Jika Surat Rekomendasi BELUM divalidasi oleh admin/BK:
 *    - Kartu rekomendasi mapel pilihan BELUM MUNCUL.
 *    - Siswa BELUM BISA mengakses halaman evaluasi nilai (terkunci).
 * 2. Jika Surat Rekomendasi SUDAH divalidasi oleh admin/BK:
 *    - Kartu rekomendasi mapel pilihan MUNCUL lengkap.
 *    - Siswa SUDAH BISA mengakses halaman evaluasi untuk menginput nilai secara mandiri.
 */
export function determineStudentAccess(
  student: StudentB1Account,
  overrideSuratValidated?: boolean
): StudentAccessRules {
  const jenjang = identifyJenjangKelas(student.kelas);
  const isSuratValidated =
    overrideSuratValidated !== undefined
      ? overrideSuratValidated
      : (student.isSuratValidated ?? true);

  // KONDISI 1: Jika Surat Rekomendasi belum divalidasi oleh admin/BK
  if (!isSuratValidated) {
    return {
      jenjang,
      canAccessRekomendasi: true,
      canViewRekomendasiMapel: false, // Belum muncul rekomendasi mapel pilihannya
      canAccessEvaluasi: false, // Belum bisa mengakses halaman evaluasi
      canAccessProfil: true,
      evaluasiStatus: "BELUM_DIVALIDASI",
      isSuratValidated: false,
      keteranganAksesEvaluasi:
        "Halaman evaluasi nilai belum dapat diakses karena Surat Rekomendasi Peminatan Anda saat ini masih dalam proses peninjauan oleh Tim Guru BK dan belum divalidasi & dikunci permanen.",
      suratValidationMessage:
        "Paket rekomendasi mata pelajaran pilihan Fase F Anda saat ini sedang dalam proses evaluasi oleh Tim Guru Bimbingan dan Konseling SMAN 8 Malang. Kartu rekomendasi mata pelajaran dan Surat Keputusan (SK) resmi akan otomatis ditampilkan di halaman ini setelah Guru BK menyelesaikan validasi dan mengunci keputusan penetapan peminatan.",
    };
  }

  // KONDISI 2: Surat Rekomendasi SUDAH divalidasi oleh admin/BK
  return {
    jenjang,
    canAccessRekomendasi: true,
    canViewRekomendasiMapel: true, // Rekomendasi mapel pilihan muncul
    canAccessEvaluasi: true, // Siswa sudah bisa mengakses evaluasi nilai
    canAccessProfil: true,
    evaluasiStatus: "INPUT_MANDIRI_TERBUKA",
    isSuratValidated: true,
    keteranganAksesEvaluasi:
      "Surat rekomendasi peminatan telah divalidasi & dikunci resmi oleh Guru BK / Admin. Halaman evaluasi nilai telah terbuka untuk penginputan nilai mandiri.",
  };
}
