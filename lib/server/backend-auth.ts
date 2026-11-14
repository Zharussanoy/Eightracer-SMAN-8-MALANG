import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { isApiUser, type ApiUser } from "@/lib/auth";

export const SESSION_COOKIE = "eightracer_session";

export class AuthError extends Error {
  constructor(public status: number, message: string, public errors: Record<string, string[]> = {}) {
    super(message);
  }
}

export function authResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status, headers: { "Cache-Control": "no-store, private", Pragma: "no-cache", Vary: "Cookie" },
  });
}

export function cookieOptions(request: NextRequest) {
  const hostname = new URL(`${request.nextUrl.protocol}//${request.headers.get("host") ?? request.nextUrl.host}`).hostname;
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
  return {
    httpOnly: true, sameSite: "lax" as const, path: "/",
    secure: request.nextUrl.protocol === "https:" || (process.env.NODE_ENV === "production" && !local),
  };
}

export function clearSession(response: NextResponse, request: NextRequest) {
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(request), maxAge: 0 });
  return response;
}

export function checkMutation(request: NextRequest) {
  const origin = request.headers.get("origin");
  // NextURL menormalkan 127.0.0.1 menjadi localhost; browser tetap mengirim Host aslinya.
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const expectedOrigin = `${request.nextUrl.protocol}//${host}`;
  if ((origin !== null && origin !== expectedOrigin) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new AuthError(403, "Permintaan login harus berasal dari aplikasi ini.");
  }
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    throw new AuthError(415, "Permintaan harus menggunakan JSON.");
  }
}

export function userFromBackend(payload: unknown): ApiUser {
  if (!isApiUser(payload)) throw new AuthError(502, "Informasi akun belum dapat dimuat. Silakan coba lagi.");
  // Hanya proyeksi akun yang diperlukan UI; jangan teruskan token atau data tambahan.
  return {
    id: payload.id, full_name: payload.full_name, email: payload.email,
    role: payload.role, email_verified: payload.email_verified,
    school_staff: payload.school_staff, school_role: payload.school_role,
    account_active: payload.account_active, school_provisioned: payload.school_provisioned,
    password_change_recommended: payload.password_change_recommended,
  };
}

export async function backendAuth(path: "/login" | "/me" | "/logout", options: { body?: unknown; token?: string } = {}) {
  const configured = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) throw new AuthError(503, "Layanan belum tersedia. Silakan coba beberapa saat lagi.");
  let base: URL;
  try { base = new URL(configured); } catch { throw new AuthError(503, "Layanan belum tersedia. Silakan coba beberapa saat lagi."); }
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    throw new AuthError(503, "Layanan belum tersedia. Silakan coba beberapa saat lagi.");
  }
  const headers = new Headers({ Accept: "application/json" });
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`${base.href.replace(/\/+$/, "")}${path}`, {
      method: path === "/me" ? "GET" : "POST", headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new AuthError(503, "Layanan belum dapat dihubungi. Silakan coba beberapa saat lagi.");
  }
  const payload: unknown = await response.json().catch(() => null);
  if (response.ok && (payload === null || typeof payload !== "object" || Array.isArray(payload))) {
    throw new AuthError(502, "Server akun belum mengirim respons JSON yang sesuai. Coba lagi setelah layanan BE siap.");
  }
  if (!response.ok) {
    const object = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const errors: Record<string, string[]> = {};
    if (object.errors && typeof object.errors === "object") {
      for (const [field, value] of Object.entries(object.errors)) {
        if (["email", "nisn", "password"].includes(field) && Array.isArray(value)) {
          errors[field] = value.filter((item): item is string => typeof item === "string");
        }
      }
    }
    const fallback = response.status === 429
      ? "Terlalu banyak percobaan. Tunggu sebelum mencoba kembali."
      : response.status >= 500
        ? "Layanan akun sedang bermasalah. Coba lagi setelah layanan BE siap."
        : path === "/me"
          ? response.status === 401
            ? "Sesi telah berakhir. Silakan masuk lagi."
            : "Akun belum dapat diverifikasi oleh layanan BE."
          : "Permintaan login tidak dapat diproses.";
    throw new AuthError(response.status >= 500 ? 503 : response.status,
      response.status < 500 && typeof object.message === "string" ? object.message : fallback, errors);
  }
  return payload;
}

export function authFailure(error: unknown) {
  if (error instanceof AuthError) return authResponse({ message: error.message, errors: error.errors }, error.status);
  return authResponse({ message: "Permintaan autentikasi tidak dapat diproses. Silakan coba lagi." }, 500);
}
