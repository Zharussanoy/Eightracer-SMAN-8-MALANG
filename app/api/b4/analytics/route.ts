import { NextRequest } from "next/server";
import { parseSchoolAnalytics } from "@/lib/b4-analytics";
import { authResponse } from "@/lib/server/backend-auth";
import { analyticsFailure, readBackendAnalytics } from "@/lib/server/backend-analytics";
import { schoolAnalyticsQuery } from "@/lib/server/school-analytics-query";

export async function GET(request: NextRequest) {
  try {
    const query = schoolAnalyticsQuery(request.nextUrl.searchParams);
    const payload = await readBackendAnalytics(request, "/analitik-beasiswa/sekolah", query);
    return authResponse(parseSchoolAnalytics(payload));
  } catch (error) { return analyticsFailure(error, request); }
}
