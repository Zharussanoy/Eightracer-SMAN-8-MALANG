import type { Metadata } from "next";
import ScholarshipDatabasePage from "@/components/admin/b-4/ScholarshipDatabasePage";

export const metadata: Metadata = {
  title: "Basis Data Beasiswa | Eightracer",
  description: "Kelola informasi program beasiswa, jenjang, periode pendaftaran, dan statusnya.",
};

export default function Page() {
  return <ScholarshipDatabasePage />;
}
