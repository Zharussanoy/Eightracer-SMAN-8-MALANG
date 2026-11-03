import type { ApiUser, AuthSession, LoginCredentials } from "./auth";
export type { ApiUser, AuthSession, LoginCredentials } from "./auth";

export type ApiValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors: ApiValidationErrors = {},
    public readonly localSessionCleared = false,
    public readonly sessionExpired = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

function apiUrl(path: string) {
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL belum diatur.");
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    throw new Error("Path API harus relatif, misalnya /faq.");
  }
  return `${baseUrl}${path}`;
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    if (typeof FormData !== "undefined" && options.body instanceof FormData) {
      body = options.body;
    } else {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(apiUrl(path), {
    method: options.method ?? "GET",
    headers,
    body,
    credentials: "omit",
    signal: options.signal,
  });
  const payload: unknown = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const object = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const errors = object.errors && typeof object.errors === "object" ? object.errors as ApiValidationErrors : {};
    const message = typeof object.message === "string" ? object.message : `Permintaan API gagal (${response.status}).`;
    throw new ApiError(response.status, message, errors);
  }

  return payload as T;
}

async function sessionRequest<T>(path: "login" | "me" | "logout", options: { body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: path === "me" ? "GET" : "POST",
      headers: { Accept: "application/json", ...(path === "me" ? {} : { "Content-Type": "application/json" }) },
      body: path === "me" ? undefined : JSON.stringify(options.body ?? {}),
      credentials: "same-origin", cache: "no-store", signal: options.signal,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError(0, "Aplikasi belum dapat dihubungi. Periksa koneksi dan coba lagi.");
  }
  const payload: unknown = await response.json().catch(() => null);
  const object = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  if (!response.ok) {
    throw new ApiError(response.status, typeof object.message === "string" ? object.message : "Permintaan autentikasi gagal.",
      object.errors && typeof object.errors === "object" ? object.errors as ApiValidationErrors : {},
      object.local_session_cleared === true, object.session_expired === true);
  }
  return payload as T;
}

export const api = {
  faq: () => apiRequest<ApiEnvelope<FaqItem[]>>("/faq"),
  login: (credentials: LoginCredentials) => sessionRequest<AuthSession>("login", { body: credentials }),
  me: (signal?: AbortSignal) => sessionRequest<{ user: ApiUser }>("me", { signal }),
  logout: () => sessionRequest<{ message: string }>("logout"),
};
