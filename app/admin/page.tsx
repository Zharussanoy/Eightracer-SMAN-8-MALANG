"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, getHomeRoute } from "@/context/UserContext";

function AdminLandingWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authUser, authReady, isLoggedIn, currentUser } = useUser();

  useEffect(() => {
    if (!authReady) return;

    // Redirect jika ada parameter tab (misal: /admin?tab=direktori) ke /alumni
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const queryString = searchParams.toString();
      router.replace(`/alumni?${queryString}`);
      return;
    }

    if (!authUser && !isLoggedIn) {
      router.replace("/login");
      return;
    }

    // Role protection untuk rute /admin:
    // Administrator / Guru BK -> diarahkan ke /admin/b-1
    // Wali Kelas -> diarahkan ke /guru/b-1
    // Siswa -> diarahkan ke /siswa/b-1
    if (authUser) {
      router.replace(getHomeRoute(authUser));
    } else if (currentUser?.role === "guru") {
      router.replace("/guru/b-1");
    } else if (currentUser?.role === "siswa") {
      router.replace("/siswa/b-1");
    } else {
      router.replace("/admin/b-1");
    }
  }, [searchParams, router, authUser, authReady, isLoggedIn, currentUser]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-purple-200 border-t-[#5F089E] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Mengarahkan ke halaman yang sesuai...</span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminLandingWrapper />
    </Suspense>
  );
}
