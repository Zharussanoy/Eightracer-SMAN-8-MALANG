import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import AlumniMapSection from "@/components/AlumniMapSection";
import AlumniTestimonialsSection from "@/components/AlumniTestimonialsSection";
import AboutSection from "@/components/AboutSection";
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

        {/* Tentang Eightracer & Statistik */}
        <AboutSection />

        {/* 4 Layanan Utama Berbasis Data */}
        <ServicesSection />

        {/* Peta Sebaran Alumni Interaktif */}
        <AlumniMapSection />

        {/* Cerita & Kesan Alumni */}
        <AlumniTestimonialsSection />

        {/* Call to Action Banner */}
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
