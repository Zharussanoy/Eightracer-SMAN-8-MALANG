import type { Metadata } from "next";
import AlumniCollegePage from "@/components/admin/b-4/AlumniCollegePage";

export const metadata: Metadata = {
  title: "Alumni di Perguruan Tinggi | Eightracer",
  description: "Kelola progres pendidikan alumni SMAN 8 Malang di perguruan tinggi.",
};

export default function Page() {
  return <AlumniCollegePage />;
}
