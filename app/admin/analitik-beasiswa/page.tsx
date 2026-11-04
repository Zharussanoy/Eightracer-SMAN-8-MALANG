import type { Metadata } from "next";
import ScholarshipAnalyticsPage from "@/components/admin/b-4/ScholarshipAnalyticsPage";

export const metadata: Metadata = {
  title: "Analitik Beasiswa & Ringkasan Pola Per-Angkatan | Eightracer",
  description: "Ringkasan analitik beasiswa, KIP-K, UKT, dan IPK alumni.",
};

export default function Page() {
  return <ScholarshipAnalyticsPage />;
}
