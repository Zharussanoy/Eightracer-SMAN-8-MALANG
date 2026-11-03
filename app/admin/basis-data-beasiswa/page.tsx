import type { Metadata } from "next";
import ScholarshipDatabaseConnected from "@/components/b4/ScholarshipDatabaseConnected";

export const metadata: Metadata = {
  title: "Basis Data Beasiswa | Eightracer",
  description: "Kelola informasi program beasiswa, jenjang, periode pendaftaran, dan statusnya.",
};

export default function Page() {
  return <ScholarshipDatabaseConnected />;
}
