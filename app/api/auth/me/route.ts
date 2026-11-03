import { NextRequest } from "next/server";
import { AuthError, authFailure, authResponse, backendAuth, clearSession, SESSION_COOKIE, userFromBackend } from "@/lib/server/backend-auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return authResponse({ message: "Silakan masuk dengan akun sekolah." }, 401);
  try {
    const user = userFromBackend(await backendAuth("/me", { token }));
    return authResponse({ user });
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      return clearSession(authResponse({ message: error.message, session_expired: true }, 401), request);
    }
    return authFailure(error);
  }
}
