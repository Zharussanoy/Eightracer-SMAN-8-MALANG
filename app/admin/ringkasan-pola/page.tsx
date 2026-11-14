import type { Metadata } from "next";
import ScholarshipAnalyticsApi from "@/components/b4/ScholarshipAnalyticsApi";
export const metadata: Metadata = { title: "Ringkasan Pola Per-Angkatan | Eightracer", description: "Jumlah alumni dan pola catatan beasiswa menurut angkatan dan periode." };
export default function Page() { return <ScholarshipAnalyticsApi view="summary" />; }
