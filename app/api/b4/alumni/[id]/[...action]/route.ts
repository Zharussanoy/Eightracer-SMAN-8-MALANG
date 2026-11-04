import { NextRequest } from "next/server";
import { alumniBackend } from "@/lib/server/alumni-backend";
import { AuthError, authFailure, authResponse, checkMutation, SESSION_COOKIE } from "@/lib/server/backend-auth";

type Context = { params: Promise<{ id: string; action: string[] }> };
const integer = (value: string) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
const uuid = (value: string) => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
async function bytes(request: NextRequest, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new AuthError(413, "Ukuran unggahan terlalu besar.");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = []; let total = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    total += value.byteLength;
    if (total > limit) { await reader.cancel(); throw new AuthError(413, "Ukuran unggahan terlalu besar."); }
    chunks.push(value);
  }
  const body = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}
async function handle(request: NextRequest, context: Context) {
  try {
    if (!request.cookies.get(SESSION_COOKIE)?.value) throw new AuthError(401, "Silakan masuk.");
    const { id, action } = await context.params;
    if (!integer(id) || request.nextUrl.search) throw new AuthError(422, "ID alumni tidak valid.");
    const method = request.method;
    const template = method === "GET" && action.length === 1 && action[0] === "progress-template";
    const create = method === "POST" && action.length === 1 && action[0] === "college-progress";
    const edit = ["PUT", "DELETE"].includes(method) && action.length === 2 && action[0] === "college-progress" && integer(action[1]);
    const preview = method === "POST" && action.length === 1 && action[0] === "progress-imports";
    const commit = method === "POST" && action.length === 3 && action[0] === "progress-imports" && uuid(action[1]) && action[2] === "commit";
    if (!template && !create && !edit && !preview && !commit) throw new AuthError(404, "Operasi alumni tidak ditemukan.");
    let body: BodyInit | undefined;
    if (preview) {
      const origin = request.headers.get("origin");
      const expected = `${request.nextUrl.protocol}//${request.headers.get("host") ?? request.nextUrl.host}`;
      if ((origin !== null && origin !== expected) || request.headers.get("sec-fetch-site") === "cross-site") throw new AuthError(403, "Permintaan harus berasal dari aplikasi ini.");
      const contentType = request.headers.get("content-type") ?? "";
      if (!contentType.startsWith("multipart/form-data;")) throw new AuthError(415, "Gunakan unggahan spreadsheet.");
      const form = await new Response(await bytes(request, 6 * 1024 * 1024), { headers: { "Content-Type": contentType } }).formData();
      if ([...form.keys()].some((key) => !["file", "number_format"].includes(key) || form.getAll(key).length !== 1)) throw new AuthError(422, "Field unggahan tidak valid.");
      const file = form.get("file"), format = form.get("number_format") ?? "canonical";
      if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || file.size === 0 || !/\.(xlsx|csv)$/i.test(file.name) || !["canonical", "id"].includes(String(format))) throw new AuthError(422, "Pilih XLSX atau CSV maksimal 5 MB dan format angka yang sesuai.");
      const upstream = new FormData(); upstream.set("file", file); upstream.set("number_format", String(format)); body = upstream;
    } else if (!template) {
      checkMutation(request);
      let value: unknown;
      try { value = JSON.parse(new TextDecoder().decode(await bytes(request, 64 * 1024))); } catch (error) { if (error instanceof AuthError) throw error; throw new AuthError(400, "JSON tidak valid."); }
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new AuthError(422, "Isian progres tidak valid.");
      const keys = commit ? ["commit_digest"] : method === "DELETE" ? [] : ["periode", "semester", "status_pendidikan", "tanggal_update", "ipk_terkini", "penerima_kipk", "nominal_ukt", "nominal_ipi", "beasiswa"];
      if (Object.keys(value).some((key) => !keys.includes(key))) throw new AuthError(422, "Isian progres tidak sesuai kontrak.");
      body = JSON.stringify(value);
    }
    const result = await alumniBackend(request, `/${id}/${action.join("/")}`, { method, body, raw: template });
    if (result.response) return result.response;
    if (result.download) return new Response(await result.download.arrayBuffer(), { headers: {
      "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="template-progres-alumni-${id}.csv"`,
      "Cache-Control": "no-store, private", Vary: "Cookie",
    } });
    return authResponse(result.payload);
  } catch (error) { return authFailure(error); }
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
