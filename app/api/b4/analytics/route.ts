import { NextRequest } from "next/server";
import { parseSchoolAnalytics } from "@/lib/b4-school-data";
import { alumniBackend } from "@/lib/server/alumni-backend";
import { alumniFailure } from "@/lib/server/backend-alumni";
import { authResponse } from "@/lib/server/backend-auth";
import { schoolAnalyticsQuery } from "@/lib/server/school-analytics-query";
export async function GET(request: NextRequest) {
  try {
    const query = schoolAnalyticsQuery(request);
    const result = await alumniBackend(request, "?" + query, { resource: "analitik-beasiswa/sekolah" });
    if (result.response) return result.response;
    return authResponse(parseSchoolAnalytics(result.payload));
  } catch (error) { return alumniFailure(error, request); }
}
