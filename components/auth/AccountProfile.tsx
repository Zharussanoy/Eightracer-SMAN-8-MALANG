"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { loginDestination } from "@/lib/auth";

export default function AccountProfile() {
  const { currentUser, isLoggedIn, authStatus, authMessage, refreshSession, logout, getDisplayRole } = useUser();
  const [leaving, setLeaving] = useState(false);
  const router = useRouter();

  if (authStatus === "loading") return <main className="max-w-3xl mx-auto w-full p-8"><p role="status">Memeriksa sesi akun…</p></main>;
  if (authStatus === "unavailable") return <main className="max-w-3xl mx-auto w-full p-8 space-y-4"><h1 className="text-2xl font-bold">Sesi belum dapat diperiksa</h1><p role="alert">{authMessage}</p><button type="button" className="px-4 py-2 rounded-xl bg-purple-700 text-white" onClick={() => void refreshSession()}>Coba lagi</button><Link className="block underline" href="/login">Ke halaman login</Link></main>;
  if (!isLoggedIn) return null;

  return <main className="max-w-3xl mx-auto w-full p-6 sm:p-10 space-y-6">
    <h1 className="text-3xl font-bold">Profil Akun</h1>
    {authMessage && <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3">{authMessage}</p>}
    <section className="rounded-2xl border border-purple-200 p-6 space-y-5 bg-white">
      <div className="flex items-center gap-4"><UserRound className="text-purple-700" size={48} aria-hidden="true" /><div><h2 className="text-xl font-bold">{currentUser.name}</h2><p>{getDisplayRole().label}</p></div></div>
      <dl className="space-y-3"><div><dt className="text-sm text-slate-500">Email</dt><dd>{currentUser.email}</dd></div><div><dt className="text-sm text-slate-500">Verifikasi email</dt><dd>{currentUser.emailVerified ? "Terverifikasi" : "Belum terverifikasi"}</dd></div><div><dt className="text-sm text-slate-500">Akses staff B4</dt><dd>{currentUser.schoolStaff ? "Diizinkan oleh backend" : "Tidak diberikan"}</dd></div></dl>
      <p className="text-sm text-slate-600">Identitas dan akses di atas berasal dari akun backend. Data akademik dan fitur B4 masih dalam proses integrasi.</p>
      <div className="flex flex-wrap gap-3">
        {loginDestination(currentUser) !== "/profile" && <Link href={loginDestination(currentUser)} className="px-4 py-2 rounded-xl bg-purple-700 text-white">Buka layanan B4</Link>}
        <button type="button" disabled={leaving} className="px-4 py-2 rounded-xl border border-purple-500 disabled:opacity-60" onClick={async () => { setLeaving(true); const cleared = await logout(); if (cleared) router.replace("/login"); else setLeaving(false); }}>{leaving ? "Keluar…" : "Keluar dari akun"}</button>
      </div>
    </section>
  </main>;
}
