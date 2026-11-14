import { NextRequest } from "next/server";
import { parseChatInput } from "@/lib/b4-chat";
import { AuthError, authResponse, checkMutation, clearSession } from "@/lib/server/backend-auth";
import { studentChat } from "@/lib/server/backend-chat";

export async function POST(request: NextRequest) {
  try {
    checkMutation(request);
    if ([...request.nextUrl.searchParams.keys()].length) throw new AuthError(422, "Konteks chat harus berada pada isian permintaan, bukan URL API.");
    const raw: unknown = await request.json().catch(() => null);
    let input;
    try { input = parseChatInput(raw); } catch (error) { throw new AuthError(422, error instanceof Error ? error.message : "Pertanyaan tidak valid."); }
    return authResponse(await studentChat(request, input));
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 503;
    const response = authResponse({ message: error instanceof AuthError ? error.message : "Layanan chat belum dapat memproses permintaan.", ...(status === 401 ? { session_expired: true } : {}) }, status);
    return status === 401 ? clearSession(response, request) : response;
  }
}
