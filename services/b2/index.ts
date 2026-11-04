import { apiFetch, API_BASE_URL } from "@/lib/api";

// ==========================================
// 1. AUTH SERVICE
// ==========================================
export const authService = {
  login: async (credentials: { email?: string; username?: string; password: string }) => {
    const res = await apiFetch<{ token: string; user: any; message?: string }>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (res?.token && typeof window !== "undefined") {
      localStorage.setItem("eightracer_token", res.token);
      localStorage.setItem("eightracer_user", JSON.stringify(res.user));
    }
    return res;
  },
  logout: async () => {
    try {
      await apiFetch("/logout", { method: "POST" });
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("eightracer_token");
        localStorage.removeItem("eightracer_user");
      }
    }
  },
  getMe: () => apiFetch("/me"),
};

// ==========================================
// 2. BOBOT ADMIN SERVICE (B2)
// Controller: BobotAdminController
// ==========================================
export const bobotService = {
  // GET /v1/admin/bobot
  getBobot: () => apiFetch<{ success: boolean; data: any }>("/v1/admin/bobot"),
  // PUT /v1/admin/bobot
  updateBobot: (data: any) =>
    apiFetch<{ success: boolean; message: string; data?: any }>("/v1/admin/bobot", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ==========================================
// 3. ELIGIBILITAS & RANKING SERVICE (B2)
// Controller: EligibilitasEngineController, RankingController, LaporanEligibilitasController
// ==========================================
export const eligibilitasService = {
  // POST /v1/admin/engine/kalkulasi-eligibilitas
  kalkulasiOtomatis: () =>
    apiFetch<{ success: boolean; message: string; data?: any }>(
      "/v1/admin/engine/kalkulasi-eligibilitas",
      { method: "POST" }
    ),

  // GET /v1/ranking
  getRankingList: (params?: {
    page?: number;
    per_page?: number;
    jurusan?: string;
    status?: string;
    search?: string;
  }) =>
    apiFetch<{ status: string; message?: string; data: any }>("/v1/ranking", { params }),

  // GET /v1/siswa/ranking/detail (untuk siswa aktif)
  getDetailSkorSiswaSaya: () =>
    apiFetch<{ success: boolean; data: any }>("/v1/siswa/ranking/detail"),

  // GET /v1/admin/ranking/{siswaId}/detail (untuk admin inspect siswa)
  getDetailSkorSiswaAdmin: (siswaId: string | number) =>
    apiFetch<{ success: boolean; data: any }>(`/v1/admin/ranking/${siswaId}/detail`),

  getExportPdfUrl: () => `${API_BASE_URL}/v1/admin/ranking/export/pdf`,
  getExportExcelUrl: () => `${API_BASE_URL}/v1/admin/ranking/export/excel`,

  // GET /v1/admin/ranking/export/pdf
  getExportPdfData: (params?: { kelas?: string; jurusan_id?: number | string }) =>
    apiFetch<{
      status: string;
      message?: string;
      data: {
        metadata: {
          judul: string;
          tanggal_unduh: string;
          total_siswa: number;
        };
        daftar_peringkat: Array<{
          peringkat: number;
          total_skor_akhir: number;
          status_eligible: string;
          siswa: {
            id: number | null;
            nisn: string | null;
            nis: string | null;
            nama_lengkap: string | null;
            kelas: string | null;
          };
          rincian_skor: {
            rapor: number;
            tka: number;
            prestasi: number;
            presensi: number;
            karakter: number;
            organisasi: number;
          };
        }>;
      };
    }>("/v1/admin/ranking/export/pdf", { params }),

  // Streamed CSV download with Bearer token
  downloadExportExcel: async (params?: { kelas?: string; jurusan_id?: number | string }) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("eightracer_token") || localStorage.getItem("auth_token")
        : null;

    let url = `${API_BASE_URL}/v1/admin/ranking/export/excel`;
    if (params) {
      const sp = new URLSearchParams();
      if (params.kelas) sp.append("kelas", params.kelas);
      if (params.jurusan_id) sp.append("jurusan_id", String(params.jurusan_id));
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }

    const response = await fetch(url, {
      headers: {
        Accept: "text/csv, application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || `Gagal mengunduh file Excel (HTTP ${response.status})`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `laporan-eligibilitas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// ==========================================
// 4. BENCHMARK ALUMNI SERVICE (B2)
// Controller: BenchmarkAlumniController
// ==========================================
export const benchmarkService = {
  // GET /v1/siswa/benchmark-alumni
  compareWithAlumni: (params?: { nama_prodi?: string; ptn?: string; siswa_id?: string | number }) =>
    apiFetch<{ status: string; message: string; data: any }>("/v1/siswa/benchmark-alumni", { params }),
};

// ==========================================
// 5. AKADEMIK & RAPOR SERVICE (B2)
// Controller: AkademikController
// ==========================================
export const akademikService = {
  // GET /v1/siswa/akademik
  getAkademik: (params?: { siswa_id?: string | number }) =>
    apiFetch<{ status: string; message: string; data: any }>("/v1/siswa/akademik", { params }),

  // POST /v1/siswa/akademik/rapor
  storeOrUpdateNilaiRapor: (payload: {
    siswa_id?: string | number;
    nilai_tka?: number;
    nilai_rapor: Array<{
      mata_pelajaran_id: number;
      semester: number;
      nilai_akhir: number;
    }>;
  }) =>
    apiFetch<{ status: string; message: string; data?: any }>("/v1/siswa/akademik/rapor", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // POST /v1/siswa/akademik/prestasi
  storePrestasi: (payload: {
    siswa_id?: string | number;
    jenis_prestasi: string;
    nama_kompetisi: string;
    bidang?: string;
    tingkat: string;
    peringkat: string;
    bobot_persentase?: number;
    status_verifikasi?: "menunggu" | "diverifikasi" | "ditolak";
    penyelenggara?: string;
    tahun: number;
    file_bukti_url?: string;
  }) =>
    apiFetch<{ status: string; message: string; data?: any }>("/v1/siswa/akademik/prestasi", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // POST /v1/siswa/akademik/presensi-karakter
  storePresensiKarakter: (payload: {
    siswa_id?: string | number;
    presensi?: Array<{
      semester: number;
      jumlah_hadir: number;
      jumlah_sakit?: number;
      jumlah_izin?: number;
      jumlah_alpa?: number;
      persentase_kehadiran?: number;
    }>;
    catatan_karakter?: Array<{
      semester: number;
      jenis_catatan?: string;
      poin_disiplin?: number;
      deskripsi: string;
      tanggal_pencatatan?: string;
    }>;
    organisasi?: Array<{
      jenis_organisasi?: string;
      nama_organisasi: string;
      jabatan: string;
      bobot_jabatan?: number;
      periode_jabatan?: string;
    }>;
  }) =>
    apiFetch<{ status: string; message: string; data?: any }>(
      "/v1/siswa/akademik/presensi-karakter",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
};

// ==========================================
// 6. ASESMEN & MINAT RIASEC (B2)
// Controller: AsesmenController
// ==========================================
export interface AsesmenData {
  siswa: {
    id: number;
    nama_lengkap: string;
    nisn: string;
  };
  karakteristik: {
    tipe_kepribadian?: string | null;
    kecerdasan_majemuk_dominan?: string | null;
    kode_riasec?: string | null;
    tanggal_asesmen?: string | null;
  } | null;
  riasec: {
    realistic_score?: number | null;
    investigative_score?: number | null;
    artistic_score?: number | null;
    social_score?: number | null;
    enterprising_score?: number | null;
    conventional_score?: number | null;
    kode_hasil?: string | null;
    tanggal_asesmen?: string | null;
  } | null;
  multiple_intelligence: Array<{
    id?: number;
    jenis_kecerdasan: string;
    skor: number;
    tanggal_asesmen?: string | null;
  }>;
  rekomendasi_prodi?: Array<{
    id?: number;
    nama_prodi?: string;
    skor_kesesuaian?: number;
    persentase?: number;
    prodi?: {
      nama_prodi: string;
      jenjang?: string;
    };
  }>;
}

export interface SaveAsesmenPayload {
  siswa_id?: string | number;
  tipe_kepribadian?: string;
  kecerdasan_majemuk_dominan?: string;
  kode_riasec?: string;
  tanggal_asesmen?: string;
  realistic_score?: number;
  investigative_score?: number;
  artistic_score?: number;
  social_score?: number;
  enterprising_score?: number;
  conventional_score?: number;
  multiple_intelligence?: Array<{
    jenis_kecerdasan: string;
    skor: number;
  }>;
}

export const asesmenService = {
  // GET /v1/siswa/asesmen
  getAsesmen: (params?: { siswa_id?: string | number }) =>
    apiFetch<{ status: string; message?: string; data: AsesmenData }>("/v1/siswa/asesmen", { params }),

  // POST /v1/siswa/asesmen
  saveAsesmen: (payload: SaveAsesmenPayload) =>
    apiFetch<{ status: string; message: string; data?: AsesmenData }>("/v1/siswa/asesmen", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ==========================================
// 7. SISWA ADMIN CRUD (B2)
// Controller: SiswaAdminController
// ==========================================
export const siswaAdminService = {
  // GET /v1/admin/siswa
  getAll: (params?: { nama_lengkap?: string; nisn?: string; kelas?: string; page?: number }) =>
    apiFetch<{ status: string; message: string; data: any }>("/v1/admin/siswa", { params }),

  // GET /v1/admin/siswa/{id}
  getById: (id: string | number) =>
    apiFetch<{ status: string; message: string; data: any }>(`/v1/admin/siswa/${id}`),

  // POST /v1/admin/siswa
  create: (payload: any) =>
    apiFetch<{ success: boolean; message: string; data?: any }>("/v1/admin/siswa", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // PUT /v1/admin/siswa/{id}
  update: (id: string | number, payload: any) =>
    apiFetch<{ success: boolean; message: string; data?: any }>(`/v1/admin/siswa/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // DELETE /v1/admin/siswa/{id}
  delete: (id: string | number) =>
    apiFetch<{ success: boolean; message: string }>(`/v1/admin/siswa/${id}`, {
      method: "DELETE",
    }),
};

// ==========================================
// 8. PRODI ADMIN SERVICE (B2)
// Controller: ProdiAdminController
// ==========================================
export const prodiAdminService = {
  // GET /v1/admin/prodi
  getAll: () => apiFetch<{ success: boolean; data: any[] }>("/v1/admin/prodi"),
};

// ==========================================
// 9. IMPORT EXCEL SERVICE (B2)
// Controller: ImportExcelController
// ==========================================
export interface ImportExcelResult {
  total_baris_diproses: number;
  berhasil: number;
  gagal: number;
  rincian_gagal?: Array<{
    baris: number;
    nisn?: string;
    alasan: string;
  }>;
}

export const importExcelService = {
  // POST /v1/admin/import/excel
  importExcel: async (file: File) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("eightracer_token") || localStorage.getItem("auth_token")
        : null;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/v1/admin/import/excel`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const resJson = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        resJson?.message || `Gagal mengimpor berkas Excel (HTTP ${response.status})`
      );
    }

    return resJson as {
      status: string;
      message: string;
      data: ImportExcelResult;
    };
  },
};
