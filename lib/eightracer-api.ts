export type ApiValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors: ApiValidationErrors = {},
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

export interface ApiUser {
  id: number;
  full_name: string;
  email: string;
  role: "administrator" | "siswa" | "guru";
  email_verified: boolean;
  photo_url: string | null;
}

export interface LoginResponse {
  user: ApiUser;
  token: string;
  expires_at: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
let accessToken = "";

function apiUrl(path: string) {
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL belum diatur.");
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    throw new Error("Path API harus relatif, misalnya /faq.");
  }
  return `${baseUrl}${path}`;
}

export function setApiToken(token: string) {
  accessToken = token;
}

export function clearApiToken() {
  accessToken = "";
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
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
    if (response.status === 401) clearApiToken();
    const object = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const errors = object.errors && typeof object.errors === "object" ? object.errors as ApiValidationErrors : {};
    const message = typeof object.message === "string" ? object.message : `Permintaan API gagal (${response.status}).`;
    throw new ApiError(response.status, message, errors);
  }

  return payload as T;
}

export const api = {
  faq: () => apiRequest<ApiEnvelope<FaqItem[]>>("/faq"),
  login: async (credentials: { email: string; password: string }) => {
    const result = await apiRequest<LoginResponse>("/login", { method: "POST", body: credentials });
    setApiToken(result.token);
    return result;
  },
  me: () => apiRequest<ApiEnvelope<ApiUser>>("/me"),
  logout: async () => {
    try { await apiRequest<unknown>("/logout", { method: "POST" }); }
    finally { clearApiToken(); }
  },
};
