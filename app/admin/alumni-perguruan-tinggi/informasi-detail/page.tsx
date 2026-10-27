import type { Metadata } from "next";
import AlumniDetailPage from "@/components/admin/b-4/AlumniDetailPage";

export const metadata: Metadata = {
  title: "Informasi Detail Alumni | Eightracer",
  description: "Lihat data induk dan kelola riwayat progress perkuliahan alumni.",
};

export default function Page() {
  return <AlumniDetailPage />;
}
