import { Suspense } from "react";
import { StudentRecommendationDetail } from "@/components/b4/StudentRecommendationsPage";
async function Detail({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <StudentRecommendationDetail id={id} />; }
export default function Page(props: { params: Promise<{ id: string }> }) { return <Suspense fallback={<p>Memuat rekomendasi…</p>}><Detail {...props} /></Suspense>; }
