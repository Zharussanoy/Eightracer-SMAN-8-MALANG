import { NextRequest } from "next/server";
import { AuthError, authFailure, authResponse, backendAuth, checkMutation, clearSession, SESSION_COOKIE } from "@/lib/server/backend-auth";

export async function POST(request: NextRequest) {
  try { checkMutation(request); } catch (error) { return authFailure(error); }
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  try {
    if (token) await backendAuth("/logout", { token });
    return clearSession(authResponse({ message: "Kamu sudah keluar." }), request);
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) return clearSession(authResponse({ message: "Sesi sudah berakhir." }), request);
    return clearSession(authResponse({ message: "Sesi di browser sudah ditutup, tetapi token belum dapat dicabut di backend. Periksa koneksi ke BE.", local_session_cleared: true }, 503), request);
  }
}
