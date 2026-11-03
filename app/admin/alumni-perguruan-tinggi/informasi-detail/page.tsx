import type { Metadata } from "next";
import { Suspense } from "react";
import AlumniDetailPage from "@/components/b4/AdminAlumniDetailPage";

export const metadata: Metadata = {
  title: "Informasi Detail Alumni | Eightracer",
  description: "Lihat data induk dan kelola riwayat progress perkuliahan alumni.",
};

async function Detail({ searchParams }: { searchParams: Promise<{ id?: string }> }) { const { id } = await searchParams; return <AlumniDetailPage key={id} id={id} />; }
export default function Page(props: { searchParams: Promise<{ id?: string }> }) { return <Suspense fallback={<p>Memuat informasi alumni…</p>}><Detail {...props} /></Suspense>; }
