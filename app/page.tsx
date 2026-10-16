import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import TeamSection from "@/components/TeamSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation Bar */}
      <Navbar />
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <Hero />

        {/* 4 Layanan Utama Berbasis Data */}
        <ServicesSection />

        {/* Tentang Eightracer & Statistik */}
        <AboutSection />

        {/* Tim Pengembang (4 Kelompok) */}
        <TeamSection />

        {/* Call to Action Banner */}
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
