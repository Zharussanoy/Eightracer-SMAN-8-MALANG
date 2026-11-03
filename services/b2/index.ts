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
  getRankingList: (params?: { jurusan?: string; status?: string; search?: string }) =>
    apiFetch<{ success: boolean; data: any[] }>("/v1/ranking", { params }),

  // GET /v1/siswa/ranking/detail (untuk siswa aktif)
  getDetailSkorSiswaSaya: () =>
    apiFetch<{ success: boolean; data: any }>("/v1/siswa/ranking/detail"),

  // GET /v1/admin/ranking/{siswaId}/detail (untuk admin inspect siswa)
  getDetailSkorSiswaAdmin: (siswaId: string | number) =>
    apiFetch<{ success: boolean; data: any }>(`/v1/admin/ranking/${siswaId}/detail`),

  getExportPdfUrl: () => `${API_BASE_URL}/v1/admin/ranking/export/pdf`,
  getExportExcelUrl: () => `${API_BASE_URL}/v1/admin/ranking/export/excel`,
};

// ==========================================
// 4. BENCHMARK ALUMNI SERVICE (B2)
// Controller: BenchmarkAlumniController
// ==========================================
export const benchmarkService = {
  // GET /v1/siswa/benchmark-alumni
  compareWithAlumni: () =>
    apiFetch<{ success: boolean; data: any }>("/v1/siswa/benchmark-alumni"),
};

// ==========================================
// 5. AKADEMIK & RAPOR SERVICE (B2)
// Controller: AkademikController
// ==========================================
export const akademikService = {
  // GET /v1/siswa/akademik
  getAkademik: () => apiFetch<{ success: boolean; data: any }>("/v1/siswa/akademik"),

  // POST /v1/siswa/akademik/rapor
  storeOrUpdateNilaiRapor: (payload: any) =>
    apiFetch<{ success: boolean; message: string; data?: any }>("/v1/siswa/akademik/rapor", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // POST /v1/siswa/akademik/prestasi
  storePrestasi: (payload: any) =>
    apiFetch<{ success: boolean; message: string; data?: any }>("/v1/siswa/akademik/prestasi", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // POST /v1/siswa/akademik/presensi-karakter
  storePresensiKarakter: (payload: any) =>
    apiFetch<{ success: boolean; message: string; data?: any }>(
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
export const asesmenService = {
  // GET /v1/siswa/asesmen
  getAsesmen: () => apiFetch<{ success: boolean; data: any }>("/v1/siswa/asesmen"),

  // POST /v1/siswa/asesmen
  saveAsesmen: (payload: any) =>
    apiFetch<{ success: boolean; message: string; data?: any }>("/v1/siswa/asesmen", {
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
  getAll: (params?: { search?: string; kelas?: string; jurusan?: string }) =>
    apiFetch<{ success: boolean; data: any[] }>("/v1/admin/siswa", { params }),

  // GET /v1/admin/siswa/{id}
  getById: (id: string | number) =>
    apiFetch<{ success: boolean; data: any }>(`/v1/admin/siswa/${id}`),

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
