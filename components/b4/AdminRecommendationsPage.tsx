"use client";

import Link from "next/link";
import B4Shell from "./B4Shell";
import { useUser } from "@/context/UserContext";
import AdminRecommendationsApi from "./AdminRecommendationsApi";

export default function AdminRecommendationsPage() {
  const { authStatus, authMessage, refreshSession } = useUser();
  if (authStatus === "authenticated") return <AdminRecommendationsApi />;
  return <B4Shell title="Rekomendasi Beasiswa" description="Lihat rekomendasi berdasarkan profil dan kriteria beasiswa." dataNote="">
    {authStatus === "anonymous" ? <div className="bc4-empty"><p>Masuk dengan akun admin atau Guru BK untuk mengelola rekomendasi.</p><Link className="bc4-button bc4-primary" href="/login">Masuk</Link></div>
      : <><p role="status">{authStatus === "loading" ? "Memeriksa sesi akun…" : authMessage}</p>{authStatus === "unavailable" && <button className="bc4-button" onClick={() => void refreshSession()}>Coba Lagi</button>}</>}
  </B4Shell>;
}
