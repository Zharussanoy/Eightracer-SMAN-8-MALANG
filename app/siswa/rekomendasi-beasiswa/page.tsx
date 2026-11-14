import StudentRecommendationsPage from "@/components/b4/StudentRecommendationsPage";
import { Suspense } from "react";
export default function Page() { return <Suspense fallback={<p>Memuat rekomendasi…</p>}><StudentRecommendationsPage /></Suspense>; }
