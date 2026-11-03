import type { Metadata } from "next";
import TeamSection from "@/components/shared/TeamSection";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Tim Pengembang - Eightracer SMAN 8 Malang",
  description:
    "Profil tim pengembang Eightracer SMAN 8 Malang dari kelompok B1 hingga B4, mahasiswa Pendidikan Teknologi Informasi Universitas Brawijaya.",
};

export default function TimPengembangPage() {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <main className="flex-1">
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}
