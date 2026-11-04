import { NextRequest } from "next/server";
import { parseAnalytics } from "@/lib/b4-analytics";
import { AuthError, authResponse } from "@/lib/server/backend-auth";
import { analyticsFailure, readBackendAnalytics } from "@/lib/server/backend-analytics";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    if ([...query.keys()].some((key) => !["angkatan", "prodi", "beasiswa_id", "periode"].includes(key) || query.getAll(key).length !== 1)
      || [...query.values()].some((value) => !value.trim() || value.length > 100)
      || (query.has("angkatan") && !/^\d{4}$/.test(query.get("angkatan")!))
      || (query.has("beasiswa_id") && (!/^[1-9]\d*$/.test(query.get("beasiswa_id")!) || !Number.isSafeInteger(Number(query.get("beasiswa_id")))))) throw new AuthError(422, "Filter analitik tidak valid. Angkatan harus 4 digit dan beasiswa harus dipilih dari katalog.");
    const dashboardQuery = new URLSearchParams();
    for (const [key, value] of query) dashboardQuery.set(key === "angkatan" ? "tahun_lulus" : key === "prodi" ? "program_studi" : key, value);
    const [analytics, dashboard] = await Promise.all([
      readBackendAnalytics(request, "/analitik-beasiswa", new URLSearchParams(query)),
      readBackendAnalytics(request, "/dashboard/ukt-ipk", dashboardQuery),
    ]);
    return authResponse(parseAnalytics(analytics, dashboard));
  } catch (error) { return analyticsFailure(error, request); }
}
