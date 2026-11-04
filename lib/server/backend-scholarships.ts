import "server-only";
import { NextRequest } from "next/server";
import { AuthError, authResponse, clearSession } from "./backend-auth";

export async function backendScholarships(path: string, token: string, method = "GET", body?: unknown) {
  const configured = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  let base: URL;
  try { base = new URL(configured ?? ""); } catch { throw new AuthError(503, "Alamat API backend belum valid."); }
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new AuthError(503, "Alamat API backend belum valid.");
  let response: Response;
  try {
    response = await fetch(`${base.href.replace(/\/+$/, "")}/beasiswa${path}`, {
      method, headers: { Accept: "application/json", Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000),
    });
  } catch { throw new AuthError(503, method === "GET" ? "Katalog belum dapat dihubungi. Periksa Tailscale dan server BE." : "Respons penyimpanan belum diterima. Periksa katalog sebelum mencoba lagi agar tidak membuat data ganda."); }
  const payload: unknown = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const errors: Record<string, string[]> = {};
    if (response.status === 422 && data.errors && typeof data.errors === "object") {
      for (const [field, value] of Object.entries(data.errors)) {
        if (/^(nama_beasiswa|jenjang|durasi|satuan_durasi|periode_apply|is_active|penyelenggara|deskripsi|link_pendaftaran|tanggal_buka|tanggal_tutup|program_eligibilitas_id|kriteria(?:\.\d+(?:\.(?:nama_kriteria|tipe_kriteria|operator|nilai_kriteria|bobot))?)?)$/.test(field) && Array.isArray(value)) {
          errors[field] = value.filter((message): message is string => typeof message === "string");
        }
      }
    }
    const message = response.status === 401 ? "Sesi telah berakhir. Silakan masuk lagi."
      : response.status === 403 ? "Akun ini belum memiliki izin mengelola katalog."
      : response.status === 404 ? "Beasiswa tidak ditemukan. Muat ulang katalog."
      : response.status === 409 ? "Data telah berubah. Muat ulang sebelum menyimpan."
      : response.status === 422 ? "Periksa isian yang ditandai sesuai ketentuan beasiswa."
      : response.status === 429 ? "Terlalu banyak permintaan. Tunggu sebelum mencoba lagi."
      : "Layanan katalog belum tersedia. Silakan coba lagi nanti.";
    throw new AuthError(response.status >= 500 ? 503 : response.status, message, errors);
  }
  return payload;
}

export function scholarshipFailure(error: unknown, request: NextRequest) {
  if (error instanceof AuthError) {
    const response = authResponse({ message: error.message, errors: error.errors, ...(error.status === 401 ? { session_expired: true } : {}) }, error.status);
    return error.status === 401 ? clearSession(response, request) : response;
  }
  return authResponse({ message: "Permintaan katalog belum dapat diproses." }, 500);
}

export function scholarshipInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new AuthError(422, "Isi data beasiswa dengan benar.");
  const data = value as Record<string, unknown>;
  const fields = ["nama_beasiswa", "jenjang", "durasi", "satuan_durasi", "periode_apply", "is_active", "penyelenggara", "deskripsi", "link_pendaftaran", "tanggal_buka", "tanggal_tutup", "program_eligibilitas_id", "kriteria"];
  if (Object.keys(data).some((key) => !fields.includes(key)) || typeof data.nama_beasiswa !== "string" || !data.nama_beasiswa.trim()
    || !["SMA", "Kuliah", "Keduanya"].includes(String(data.jenjang)) || typeof data.is_active !== "boolean"
    || !Array.isArray(data.kriteria) || data.kriteria.length > 100) throw new AuthError(422, "Isi nama, jenjang, status, dan kriteria beasiswa dengan benar.");
  for (const criterion of data.kriteria) {
    if (!criterion || typeof criterion !== "object" || Array.isArray(criterion)
      || Object.keys(criterion).some((key) => !["nama_kriteria", "tipe_kriteria", "operator", "nilai_kriteria", "bobot"].includes(key))
      || !["nama_kriteria", "tipe_kriteria", "operator", "nilai_kriteria"].every((key) => typeof criterion[key] === "string" && criterion[key].trim())
      || (criterion.bobot !== undefined && (typeof criterion.bobot !== "number" || !Number.isFinite(criterion.bobot)))) {
      throw new AuthError(422, "Lengkapi nama dan pengaturan penilaian pada setiap kriteria.");
    }
  }
  return data;
}
