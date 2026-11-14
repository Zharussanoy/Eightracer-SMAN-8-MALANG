const ADMIN_HOME = "/admin/alumni-perguruan-tinggi";
const STUDENT_HOME = "/siswa/jejak-alumni";

const b4Routes = [
  ADMIN_HOME,
  "/admin/timeline-individu",
  "/admin/analitik-beasiswa",
  "/admin/ringkasan-pola",
  "/admin/basis-data-beasiswa",
  "/admin/rekomendasi-beasiswa",
  STUDENT_HOME,
  "/siswa/rekomendasi-beasiswa",
];

export function isB4Page(pathname: string) {
  return b4Routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

// Pemilihan tujuan menu saja; izin akses tetap harus diperiksa oleh backend.
export function getB4HomeHref(pathname: string, role: string, schoolStaff?: boolean) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return ADMIN_HOME;
  if (pathname === "/siswa" || pathname.startsWith("/siswa/")) return STUDENT_HOME;
  if (role === "guru" && schoolStaff === false) return "/profile";
  return role === "admin" || role === "administrator" || (role === "guru" && schoolStaff) ? ADMIN_HOME : STUDENT_HOME;
}
