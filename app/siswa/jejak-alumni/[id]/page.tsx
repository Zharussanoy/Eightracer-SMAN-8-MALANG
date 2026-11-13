import { Suspense } from "react";
import { StudentAlumniDetailPage } from "@/components/b4/StudentAlumniPage";
async function Detail({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <StudentAlumniDetailPage id={id} />; }
export default function Page(props: { params: Promise<{ id: string }> }) { return <Suspense fallback={<p>Memuat jejak alumni…</p>}><Detail {...props} /></Suspense>; }
