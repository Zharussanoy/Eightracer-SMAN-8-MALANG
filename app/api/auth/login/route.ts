import { NextRequest } from "next/server";
import { loginIdentifier } from "@/lib/auth";
import { AuthError, authFailure, authResponse, backendAuth, checkMutation, cookieOptions, SESSION_COOKIE, userFromBackend } from "@/lib/server/backend-auth";

export async function POST(request: NextRequest) {
  try {
    checkMutation(request);
    const payload: unknown = await request.json().catch(() => { throw new AuthError(400, "JSON tidak valid."); });
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new AuthError(422, "Isi email atau NISN dan kata sandi.");
    const input = payload as Record<string, unknown>;
    if (Object.keys(input).some((key) => !["email", "nisn", "password"].includes(key)) || ("email" in input) === ("nisn" in input)) {
      throw new AuthError(422, "Gunakan salah satu identifier: email atau NISN. Jangan mengirim role.");
    }
    const value = input.email ?? input.nisn;
    const identifier = typeof value === "string" ? loginIdentifier(value) : null;
    if (!identifier || ("nisn" in input && !("nisn" in identifier)) || ("email" in input && !("email" in identifier))) {
      throw new AuthError(422, "Masukkan alamat email yang valid atau NISN 10 digit.");
    }
    if (typeof input.password !== "string" || input.password.length === 0 || input.password.length > 256) {
      throw new AuthError(422, "Isi kata sandi akun.", { password: ["Isi kata sandi akun."] });
    }
    const result = await backendAuth("/login", { body: { ...identifier, password: input.password } });
    if (!result || typeof result !== "object") throw new AuthError(502, "Respons login backend belum sesuai kontrak.");
    const session = result as Record<string, unknown>;
    const expiry = typeof session.expires_at === "string" ? new Date(session.expires_at) : new Date(NaN);
    if (typeof session.token !== "string" || !session.token || !Number.isFinite(expiry.getTime()) || expiry.getTime() <= Date.now()) {
      throw new AuthError(502, "Token atau masa berlaku sesi backend belum sesuai kontrak.");
    }
    // Identitas dan grant selalu berasal dari /me, bukan input atau preset role FE.
    let user;
    try { user = userFromBackend(await backendAuth("/me", { token: session.token })); }
    catch (error) {
      await backendAuth("/logout", { token: session.token }).catch(() => undefined);
      throw error;
    }
    const response = authResponse({ message: "Login berhasil.", user, expires_at: session.expires_at });
    response.cookies.set(SESSION_COOKIE, session.token, { ...cookieOptions(request), expires: expiry });
    return response;
  } catch (error) { return authFailure(error); }
}
