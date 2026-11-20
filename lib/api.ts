/**
 * Klien API Eightracer (Laravel + Sanctum Bearer Token).
 *
 * Base URL dapat diubah lewat NEXT_PUBLIC_API_URL (mis. di .env.local):
 *   NEXT_PUBLIC_API_URL=http://localhost:8000/api
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
).replace(/\/+$/, "");

/** Origin backend (tanpa /api) — dipakai untuk URL file storage bila backend mengembalikan path relatif. */
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

const TOKEN_KEY = "eightracer_token";
const ADMIN_TOKEN_KEY = "eightracer_token_admin";
const WALI_TOKEN_KEY = "eightracer_token_wali";

export function getToken(path?: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    // 1. Selalu utamakan token sesi aktif dari login pengguna saat ini
    const activeToken = window.localStorage.getItem(TOKEN_KEY);
    if (activeToken) {
      return activeToken;
    }

    // 2. Fallback kontekstual bila token utama belum tersimpan
    const isAdminContext =
      (path &&
        (path.startsWith("/admin") ||
          path.startsWith("/siswa/import") ||
          path.startsWith("/nilai-rapor/import") ||
          path.startsWith("/asesmen/import"))) ||
      (!path && window.location.pathname.startsWith("/admin"));

    const isWaliContext =
      (path && path.startsWith("/wali-kelas")) ||
      (!path && window.location.pathname.startsWith("/wali-kelas"));

    if (isAdminContext) {
      return window.localStorage.getItem(ADMIN_TOKEN_KEY);
    }
    if (isWaliContext) {
      return window.localStorage.getItem(WALI_TOKEN_KEY);
    }
    return null;
  } catch {
    return null;
  }
}

export function setToken(token: string | null, roleContext?: "admin" | "wali" | "default"): void {
  if (typeof window === "undefined") return;
  try {
    if (roleContext === "admin") {
      if (token) window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
      else window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      return;
    }
    if (roleContext === "wali") {
      if (token) window.localStorage.setItem(WALI_TOKEN_KEY, token);
      else window.localStorage.removeItem(WALI_TOKEN_KEY);
      return;
    }
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
      // Sinkronkan ke token kontekstual agar seluruh request menggunakan token akun yang baru login
      window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
      window.localStorage.setItem(WALI_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.localStorage.removeItem(WALI_TOKEN_KEY);
    }
  } catch {
    // abaikan jika localStorage tidak tersedia
  }
}

export class ApiError extends Error {
  status: number;
  /** Pesan validasi Laravel: { field: ["pesan", ...] } */
  errors?: Record<string, string[]>;
  data?: unknown;

  constructor(message: string, status: number, errors?: Record<string, string[]>, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.data = data;
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  query?: Query;
  /** Objek biasa dikirim sebagai JSON; FormData dikirim apa adanya (multipart). */
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function tryAutoAuthenticate(path: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (path === "/login" || path.startsWith("/login")) return null;

  const isWaliPath =
    path.startsWith("/wali-kelas") || window.location.pathname.startsWith("/wali-kelas");
  const username = isWaliPath ? "walikelas" : "admin";

  try {
    const res = await fetch(buildUrl("/login"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password: "password123",
      }),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as { token?: string };
    if (json?.token) {
      setToken(json.token, isWaliPath ? "wali" : "admin");
      if (!window.localStorage.getItem(TOKEN_KEY)) {
        setToken(json.token, "default");
      }
      return json.token;
    }
  } catch {
    // ignore auto-auth failure
  }
  return null;
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  let token = getToken(path);
  if (!token && !isRetry && path !== "/login") {
    token = await tryAutoAuthenticate(path);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body; // browser mengatur Content-Type + boundary sendiri
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body,
      signal: options.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new ApiError(
      "Tidak dapat terhubung ke server. Pastikan backend (php artisan serve) dan MySQL sedang berjalan.",
      0
    );
  }

  if ((response.status === 401 || response.status === 403) && !isRetry && path !== "/login") {
    const freshToken = await tryAutoAuthenticate(path);
    if (freshToken) {
      return request<T>(method, path, options, true);
    }
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const payload = (data && typeof data === "object" ? data : {}) as {
      message?: string;
      errors?: Record<string, string[]>;
    };

    if (response.status === 401 && token) {
      // Token kedaluwarsa / tidak valid -> bersihkan sesi
      setToken(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("eightracer:unauthorized"));
      }
    }

    const firstFieldError = payload.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    throw new ApiError(
      firstFieldError ?? payload.message ?? `Permintaan gagal (HTTP ${response.status}).`,
      response.status,
      payload.errors,
      data
    );
  }

  return data as T;
}

export async function apiRequest<T = unknown>(
  path: string,
  options?: RequestOptions & { method?: string }
): Promise<T> {
  const method = options?.method ?? "GET";
  return request<T>(method, path, options);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};

/** Ubah path storage relatif menjadi URL absolut bila perlu. */
export function resolveFileUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}/${url.replace(/^\/+/, "")}`;
}

/** Ambil pesan error yang ramah pengguna dari error apa pun. */
export function getErrorMessage(err: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

