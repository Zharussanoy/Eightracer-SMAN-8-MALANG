import "server-only";
import { NextRequest } from "next/server";
import { AuthError } from "./backend-auth";
import { readBackendAlumni } from "./backend-alumni";

// Endpoint siswa tetap terpisah dari direktori staff; tidak pernah memakai fallback admin.
export async function readStudentAlumni(request: NextRequest, path: string) {
  if (!/^\/jejak-alumni(?:\?[a-zA-Z0-9%_=&+.-]*|\/[1-9]\d*)?$/.test(path)) throw new AuthError(422, "Alamat jejak alumni tidak valid.");
  return readBackendAlumni(request, path);
}
