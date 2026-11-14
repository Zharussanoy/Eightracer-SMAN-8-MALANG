import { NextRequest } from "next/server";
import { AuthError } from "./backend-auth";
export function schoolAnalyticsQuery(request: NextRequest | URLSearchParams) {
  const query = request instanceof URLSearchParams ? request : request.nextUrl.searchParams;
  if ([...query.keys()].some(key => !["angkatan","prodi","beasiswa_id","periode"].includes(key) || query.getAll(key).length !== 1)
    || [...query.values()].some(value => !value.trim() || value.length > 100)
    || (query.has("angkatan") && !/^\d{4}$/.test(query.get("angkatan")!))
    || (query.has("periode") && query.get("periode")!.length > 50)
    || (query.has("beasiswa_id") && !/^([1-9]\d*|kip|program:[a-f0-9]{20})$/.test(query.get("beasiswa_id")!)))
    throw new AuthError(422,"Filter analitik tidak valid.");
  return query;
}
