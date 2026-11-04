"use client";

import { useUser } from "@/context/UserContext";
import B4Shell from "./B4Shell";
import StudentAlumniApi, { StudentAlumniDetailApi } from "./StudentAlumniApi";
import type { ReactNode } from "react";

function Session({ children }: { children: ReactNode }) {
  const { authStatus, authMessage, refreshSession } = useUser();
  if (authStatus === "loading" || authStatus === "unavailable") return <B4Shell student showDemoProfile={false} dataNote="" active="alumni" title="Jejak Alumni" description="Telusuri perjalanan pendidikan alumni."><p role="status">{authStatus === "loading" ? "Memeriksa sesi akun…" : authMessage}</p>{authStatus === "unavailable" && <button className="bc4-button" onClick={() => void refreshSession()}>Coba lagi</button>}</B4Shell>;
  return children;
}
export default function StudentAlumniPage() {
  return <Session><StudentAlumniApi /></Session>;
}
export function StudentAlumniDetailPage({ id }: { id: string }) {
  return <Session><StudentAlumniDetailApi id={id} /></Session>;
}
