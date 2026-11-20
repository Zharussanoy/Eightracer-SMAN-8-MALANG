"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, getHomeRoute, useUser } from "@/context/UserContext";

/**
 * Penjaga halaman berbasis peran (role) pengguna.
 * - Belum login            -> diarahkan ke /login
 * - Role tidak diizinkan   -> diarahkan ke beranda role-nya yang sesuai
 *
 * `ready` bernilai true hanya jika sesi valid dan role diizinkan,
 * sehingga komponen dapat menunda pemanggilan API sampai `ready`.
 */
export function useAuthGuard(
  allowedRoles: Array<AuthUser["role"]>,
  subPeran?: Array<"wali_kelas" | "guru_bk">
) {
  const router = useRouter();
  const { authUser, authReady, isLoggedIn, currentUser } = useUser();

  // Tentukan role efektif (dari backend authUser atau fallback mock jika login lokal)
  const effectiveRole: AuthUser["role"] | undefined =
    authUser?.role ??
    (isLoggedIn && currentUser
      ? currentUser.role === "admin"
        ? "administrator"
        : currentUser.role === "guru"
        ? "guru"
        : "siswa"
      : undefined);

  const effectiveSubPeran: "wali_kelas" | "guru_bk" | undefined =
    authUser?.profil?.sub_peran ??
    (isLoggedIn && currentUser?.role === "guru"
      ? (currentUser as { waliKelas?: string })?.waliKelas
        ? "wali_kelas"
        : "guru_bk"
      : undefined);

  const roleOk = !!effectiveRole && allowedRoles.includes(effectiveRole);
  const subPeranOk =
    !effectiveRole ||
    effectiveRole !== "guru" ||
    !subPeran ||
    (effectiveSubPeran ? subPeran.includes(effectiveSubPeran) : true);

  const allowed = roleOk && subPeranOk;

  useEffect(() => {
    if (!authReady) return;

    if (!effectiveRole) {
      router.replace("/login");
    } else if (!allowed) {
      if (authUser) {
        router.replace(getHomeRoute(authUser));
      } else if (effectiveRole === "guru") {
        router.replace(effectiveSubPeran === "guru_bk" ? "/admin/b-1" : "/guru/b-1");
      } else if (effectiveRole === "siswa") {
        router.replace("/siswa/b-1");
      } else {
        router.replace("/admin/b-1");
      }
    }
  }, [authReady, effectiveRole, allowed, authUser, effectiveSubPeran, router]);

  return { authUser, currentUser, ready: authReady && !!effectiveRole && allowed };
}
