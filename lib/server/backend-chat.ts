import "server-only";
import { NextRequest } from "next/server";
import { AuthError, backendAuth, SESSION_COOKIE } from "./backend-auth";
import { parseChatAnswer, type ScholarshipChatInput } from "@/lib/b4-chat";

export async function studentChat(request: NextRequest, input: ScholarshipChatInput) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) throw new AuthError(401, "Masuk dengan akun siswa untuk bertanya.");
  const account = await backendAuth("/me", { token }) as Record<string, unknown>;
  const user = (account.user ?? account.data ?? account) as Record<string, unknown>;
  if (user.role !== "siswa") throw new AuthError(403, "Chat ini hanya tersedia untuk akun siswa.");
  let base: URL;
  try { base = new URL(process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""); } catch { throw new AuthError(503, "Alamat layanan chat belum dikonfigurasi."); }
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new AuthError(503, "Alamat layanan chat belum valid.");
  let response: Response;
  try {
    response = await fetch(`${base.href.replace(/\/+$/, "")}/chat-beasiswa`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(30_000) });
  } catch { throw new AuthError(503, "Layanan chat belum dapat dihubungi. Jawaban belum diterima; coba lagi nanti."); }
  if (!response.ok) throw new AuthError(response.status >= 500 ? 503 : response.status,
    response.status === 401 ? "Sesi berakhir. Silakan masuk lagi." : response.status === 403 ? "Akun ini belum diizinkan memakai chat beasiswa." : response.status === 429 ? "Batas pertanyaan tercapai. Tunggu setidaknya satu menit sebelum mencoba lagi." : response.status === 422 ? "Pertanyaan atau konteks beasiswa belum diterima layanan." : "Layanan chat sedang bermasalah. Jawaban belum diterima.");
  const payload: unknown = await response.json().catch(() => null);
  try { return parseChatAnswer(payload); } catch { throw new AuthError(502, "Respons chat belum sesuai kontrak. Jawaban tidak ditampilkan."); }
}
