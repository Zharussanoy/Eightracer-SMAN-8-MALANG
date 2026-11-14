/**
 * API Client Eightracer - Pure Frontend Mode (Mock Data)
 * 
 * Mode ini 100% berjalan di sisi client/browser tanpa memerlukan Backend Laravel aktif.
 * Tidak ada network request ke http://127.0.0.1:8000 sehingga tidak ada error ERR_CONNECTION_REFUSED.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export interface ApiFetchOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

// ─── DATA DUMMY MOCK UNTUK SELURUH ENDPOINT ────────────────────────────────────

const MOCK_PRODI_LIST = [
  {
    id: 1,
    nama_prodi: "Kedokteran",
    kelompok_rumpun: "SAINTEK",
    kode_riasec: "I",
    kecerdasan_dominan: "Logis-Matematis",
    deskripsi: "Pendidikan dokter umum dengan fokus kurikulum klinis berbasis bukti.",
    daya_tampung: 120,
    kuota_snbp: 36,
    jumlah_peminat: 1420,
    kekuatan_alumni: "Sangat Tinggi",
    universitas: "Universitas Brawijaya",
    kota: "Malang",
    akreditasi: "Unggul",
  },
  {
    id: 2,
    nama_prodi: "Teknik Informatika",
    kelompok_rumpun: "SAINTEK",
    kode_riasec: "I",
    kecerdasan_dominan: "Logis-Matematis",
    deskripsi: "Rekayasa perangkat lunak, kecerdasan buatan, dan keamanan siber.",
    daya_tampung: 150,
    kuota_snbp: 45,
    jumlah_peminat: 1890,
    kekuatan_alumni: "Sangat Tinggi",
    universitas: "Universitas Brawijaya",
    kota: "Malang",
    akreditasi: "Unggul",
  },
  {
    id: 3,
    nama_prodi: "Farmasi Klinis",
    kelompok_rumpun: "SAINTEK",
    kode_riasec: "I",
    kecerdasan_dominan: "Logis-Matematis",
    deskripsi: "Farmakologi terapeutik, bioteknologi farmasi, dan formulasi obat.",
    daya_tampung: 90,
    kuota_snbp: 27,
    jumlah_peminat: 980,
    kekuatan_alumni: "Tinggi",
    universitas: "Institut Teknologi Bandung",
    kota: "Bandung",
    akreditasi: "Unggul",
  },
  {
    id: 4,
    nama_prodi: "Manajemen & Bisnis",
    kelompok_rumpun: "SOSHUM",
    kode_riasec: "E",
    kecerdasan_dominan: "Interpersonal",
    deskripsi: "Tata kelola korporasi, strategi pemasaran digital, dan kepemimpinan bisnis.",
    daya_tampung: 200,
    kuota_snbp: 60,
    jumlah_peminat: 2100,
    kekuatan_alumni: "Sangat Tinggi",
    universitas: "Universitas Negeri Malang",
    kota: "Malang",
    akreditasi: "Unggul",
  },
  {
    id: 5,
    nama_prodi: "Ilmu Komunikasi",
    kelompok_rumpun: "SOSHUM",
    kode_riasec: "A",
    kecerdasan_dominan: "Linguistik-Verbal",
    deskripsi: "Jurnalisme penyiaran, hubungan masyarakat digital, dan periklanan kreatif.",
    daya_tampung: 130,
    kuota_snbp: 39,
    jumlah_peminat: 1350,
    kekuatan_alumni: "Tinggi",
    universitas: "Universitas Brawijaya",
    kota: "Malang",
    akreditasi: "Unggul",
  },
  {
    id: 6,
    nama_prodi: "Teknik Sipil",
    kelompok_rumpun: "SAINTEK",
    kode_riasec: "R",
    kecerdasan_dominan: "Visual-Spasial",
    deskripsi: "Struktur beton tahan gempa, rekayasa transportasi, dan hidrologi bendungan.",
    daya_tampung: 110,
    kuota_snbp: 33,
    jumlah_peminat: 890,
    kekuatan_alumni: "Tinggi",
    universitas: "Institut Teknologi Sepuluh Nopember",
    kota: "Surabaya",
    akreditasi: "Unggul",
  },
  {
    id: 7,
    nama_prodi: "Psikologi",
    kelompok_rumpun: "SOSHUM",
    kode_riasec: "S",
    kecerdasan_dominan: "Interpersonal",
    deskripsi: "Dinamika perilaku kognitif, psikometri klinis, dan konseling sosial.",
    daya_tampung: 140,
    kuota_snbp: 42,
    jumlah_peminat: 1650,
    kekuatan_alumni: "Tinggi",
    universitas: "Universitas Airlangga",
    kota: "Surabaya",
    akreditasi: "Unggul",
  },
];

const MOCK_USERS_LIST = [
  {
    id: 1,
    username: "admin_b2",
    role: "administrator",
    nama_lengkap: "Administrator B2 SMAN 8",
    email: "admin.b2@sman8malang.sch.id",
    created_at: "2026-08-01T08:00:00Z",
  },
  {
    id: 2,
    username: "wali_kelas_xii_mipa1",
    role: "guru",
    nama_lengkap: "Dra. Sri Wahyuni, M.Pd.",
    email: "sri.wahyuni@sman8malang.sch.id",
    created_at: "2026-08-05T09:30:00Z",
  },
  {
    id: 3,
    username: "tegar_putra",
    role: "siswa",
    nama_lengkap: "Tegar Putra Pratama",
    email: "tegar.putra@siswa.sman8malang.sch.id",
    created_at: "2026-08-10T10:15:00Z",
  },
  {
    id: 4,
    username: "aisha_nurul",
    role: "siswa",
    nama_lengkap: "Aisha Nurul Fathih",
    email: "aisha.nurul@siswa.sman8malang.sch.id",
    created_at: "2026-08-10T10:20:00Z",
  },
  {
    id: 5,
    username: "dimas_arya",
    role: "siswa",
    nama_lengkap: "Dimas Arya Sena",
    email: "dimas.arya@siswa.sman8malang.sch.id",
    created_at: "2026-08-10T10:25:00Z",
  },
];

const MOCK_PTN_LIST = [
  {
    id: 1,
    nama_ptn: "Universitas Brawijaya",
    singkatan: "UB",
    kota: "Malang",
    provinsi: "Jawa Timur",
    akreditasi: "Unggul",
    total_prodi: 82,
    kuota_snbp_total: 5495,
  },
  {
    id: 2,
    nama_ptn: "Universitas Negeri Malang",
    singkatan: "UM",
    kota: "Malang",
    provinsi: "Jawa Timur",
    akreditasi: "Unggul",
    total_prodi: 68,
    kuota_snbp_total: 3200,
  },
  {
    id: 3,
    nama_ptn: "Universitas Airlangga",
    singkatan: "UNAIR",
    kota: "Surabaya",
    provinsi: "Jawa Timur",
    akreditasi: "Unggul",
    total_prodi: 54,
    kuota_snbp_total: 2830,
  },
  {
    id: 4,
    nama_ptn: "Institut Teknologi Sepuluh Nopember",
    singkatan: "ITS",
    kota: "Surabaya",
    provinsi: "Jawa Timur",
    akreditasi: "Unggul",
    total_prodi: 43,
    kuota_snbp_total: 1890,
  },
  {
    id: 5,
    nama_ptn: "Universitas Gadjah Mada",
    singkatan: "UGM",
    kota: "Yogyakarta",
    provinsi: "D.I. Yogyakarta",
    akreditasi: "Unggul",
    total_prodi: 91,
    kuota_snbp_total: 2821,
  },
  {
    id: 6,
    nama_ptn: "Institut Teknologi Bandung",
    singkatan: "ITB",
    kota: "Bandung",
    provinsi: "Jawa Barat",
    akreditasi: "Unggul",
    total_prodi: 50,
    kuota_snbp_total: 2093,
  },
  {
    id: 7,
    nama_ptn: "Universitas Indonesia",
    singkatan: "UI",
    kota: "Depok",
    provinsi: "Jawa Barat",
    akreditasi: "Unggul",
    total_prodi: 64,
    kuota_snbp_total: 2105,
  },
];

// Helper mock resolver tanpa melakukan fetch jaringan ke localhost:8000
export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Simulasi latency asinkron halus (60ms) agar terasa natural tanpa delay berlebih
  await new Promise((r) => setTimeout(r, 60));

  // 1. Endpoint Otentikasi
  if (cleanEndpoint === "/login") {
    let bodyObj: any = {};
    try {
      if (typeof options.body === "string") bodyObj = JSON.parse(options.body);
    } catch {}

    const uname = String(bodyObj.username || bodyObj.email || "Pengguna").toLowerCase();
    const isAdmin = uname.includes("admin");
    const isGuru = uname.includes("guru") || uname.includes("wali");
    const isAlumni = uname.includes("alumni");

    const role = isAdmin ? "administrator" : isGuru ? "guru" : isAlumni ? "alumni" : "siswa";
    const name = isAdmin
      ? "Administrator B2"
      : isGuru
      ? "Wali Kelas XII MIPA"
      : isAlumni
      ? "Alumni SMAN 8"
      : "Tegar Putra Pratama";

    const mockUser = {
      id: 1,
      name,
      username: uname,
      email: `${uname}@sman8malang.sch.id`,
      role,
      avatar: "/images/alumni/alumni-1.png",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("eightracer_token", "mock-jwt-token-b2");
      localStorage.setItem("eightracer_user", JSON.stringify(mockUser));
    }

    return {
      status: "success",
      token: "mock-jwt-token-b2",
      user: mockUser,
      message: "Login berhasil (Mode Frontend Lokal)",
    } as any;
  }

  if (cleanEndpoint === "/logout") {
    if (typeof window !== "undefined") {
      localStorage.removeItem("eightracer_token");
      localStorage.removeItem("eightracer_user");
    }
    return { status: "success", message: "Logout berhasil" } as any;
  }

  if (cleanEndpoint === "/me") {
    let user = {
      id: 1,
      name: "Tegar Putra Pratama",
      username: "tegar_putra",
      email: "tegar.putra@siswa.sman8malang.sch.id",
      role: "siswa",
      avatar: "/images/alumni/alumni-1.png",
    };
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("eightracer_user");
      if (stored) {
        try {
          user = JSON.parse(stored);
        } catch {}
      }
    }
    return { status: "success", data: user } as any;
  }

  // 2. Endpoint Master Prodi Admin
  if (cleanEndpoint.startsWith("/v1/admin/prodi")) {
    if (options.method === "POST") {
      return { status: "success", message: "Program studi berhasil ditambahkan!", data: { id: Date.now() } } as any;
    }
    if (options.method === "PUT") {
      return { status: "success", message: "Program studi berhasil diperbarui!" } as any;
    }
    if (options.method === "DELETE") {
      return { status: "success", message: "Program studi berhasil dihapus!" } as any;
    }
    return {
      status: "success",
      data: {
        data: MOCK_PRODI_LIST,
        total: MOCK_PRODI_LIST.length,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      },
    } as any;
  }

  // 3. Endpoint Perguruan Tinggi
  if (cleanEndpoint.startsWith("/perguruan-tinggi")) {
    return {
      status: "success",
      data: MOCK_PTN_LIST,
    } as any;
  }

  // 4. Endpoint Manajemen User Admin
  if (cleanEndpoint.startsWith("/v1/admin/users")) {
    if (options.method === "POST") {
      return { status: "success", message: "User baru berhasil dibuat!", data: { id: Date.now() } } as any;
    }
    if (options.method === "PUT") {
      return { status: "success", message: "Data user berhasil diperbarui!" } as any;
    }
    if (options.method === "DELETE") {
      return { status: "success", message: "User berhasil dihapus!" } as any;
    }
    return {
      status: "success",
      data: {
        data: MOCK_USERS_LIST,
        total: MOCK_USERS_LIST.length,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      },
    } as any;
  }

  // 5. Endpoint Bobot Kriteria
  if (cleanEndpoint.startsWith("/v1/admin/bobot")) {
    return {
      success: true,
      data: [
        { id: 1, nama_kriteria: "Rata-rata Rapor Semester 1-5", bobot: 40, deskripsi: "Nilai kumulatif semester 1 s.d. 5" },
        { id: 2, nama_kriteria: "Prestasi Akademik & Portofolio", bobot: 25, deskripsi: "Capaian kejuaraan tingkat kota s.d. internasional" },
        { id: 3, nama_kriteria: "Tes Kemampuan Akademik (TKA)", bobot: 20, deskripsi: "Skor asesmen TKA SMARIHASTA" },
        { id: 4, nama_kriteria: "Catatan Karakter & Kedisiplinan", bobot: 15, deskripsi: "Rekam jejak kepribadian P5 & presensi" },
      ],
      message: "Data bobot berhasil diambil",
    } as any;
  }

  // 6. Endpoint Engine Kalkulasi
  if (cleanEndpoint.includes("/kalkulasi-eligibilitas")) {
    return {
      success: true,
      message: "Kalkulasi eligibilitas otomatis berhasil diperbarui!",
    } as any;
  }

  // 7. Endpoint Ranking Eligibilitas & Detail
  if (cleanEndpoint.startsWith("/v1/ranking") || cleanEndpoint.includes("/ranking/detail")) {
    return {
      status: "success",
      success: true,
      data: {
        skor_kca: 95.32,
        peringkat: 1,
        total_siswa: 420,
        status_eligible: "ELIGIBLE KUOTA",
        komponen: [
          { nama: "Rata Rapor Sem 1-5", skor: 47.4, max: 50, nilai_asli: 94.8, bobot: "50%", validasi: "Valid Dapodik" },
          { nama: "TKA & Minat RIASEC KCA", skor: 14.48, max: 15, nilai_asli: 96.5, bobot: "15%", validasi: "Investigative & Social" },
          { nama: "Prestasi & Portofolio", skor: 19.0, max: 20, nilai_asli: 95.0, bobot: "20%", validasi: "Juara 1 OSN Biologi Nas" },
          { nama: "Rekam Jejak Alumni di PTN", skor: 9.2, max: 10, nilai_asli: 92.0, bobot: "10%", validasi: "FK UI & ITB Track" },
          { nama: "Karakter & Kedisiplinan P5", skor: 4.7, max: 5, nilai_asli: 94.0, bobot: "5%", validasi: "Predikat Sangat Baik" },
        ],
        rekomendasi_prodi: [
          { prodi: "Kedokteran", ptn: "Universitas Indonesia (UI)", pilihan: "Pil 1" },
          { prodi: "Farmasi Klinis", ptn: "Institut Teknologi Bandung (ITB)", pilihan: "Pil 2" },
        ],
      },
    } as any;
  }

  // 8. Default Success Fallback untuk Endpoint Lainnya (Akademik, Asesmen, Profil, dll.)
  return {
    status: "success",
    success: true,
    message: "Operasi berhasil (Mode Frontend Lokal)",
    data: {},
  } as any;
}
