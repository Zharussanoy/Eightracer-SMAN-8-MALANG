import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import TeamSection from "@/components/TeamSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Tim Pengembang - Eightracer SMAN 8 Malang",
  description:
    "Profil tim pengembang Eightracer SMAN 8 Malang dari kelompok B1 hingga B4, mahasiswa Pendidikan Teknologi Informasi Universitas Brawijaya.",
};

export default function TimPengembangPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation Bar */}
      <Navbar />

      <main className="flex-1">
        <TeamSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
