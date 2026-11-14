import "server-only";
import { AuthError } from "./backend-auth";

export function schoolAnalyticsQuery(query: URLSearchParams): URLSearchParams {
  const allowed = ["angkatan", "perguruan_tinggi_id", "program_studi", "prodi", "beasiswa_id", "beasiswa", "periode"];
  for (const [key, value] of query) {
    if (!allowed.includes(key) || query.getAll(key).length !== 1 || !value.trim() || value.length > 100 || ["null", "undefined"].includes(value)) {
      throw new AuthError(422, "Filter analitik tidak valid. Periksa isian lalu coba lagi.");
    }
  }
  if (query.has("angkatan") && !/^\d{4}$/.test(query.get("angkatan")!)) throw new AuthError(422, "Isi tahun lulus dengan 4 digit.");
  const university = query.get("perguruan_tinggi_id");
  if (university !== null && (!/^[1-9]\d*$/.test(university) || !Number.isSafeInteger(Number(university)))) throw new AuthError(422, "ID perguruan tinggi tidak valid.");
  // Nilai beasiswa merupakan kode dari BE dan dapat berupa "kip" atau "program:...".
  return new URLSearchParams(query);
}
