"use client";

import Hero from "@/components/shared/Hero";
import AboutSection from "@/components/shared/AboutSection";
import ServicesSection from "@/components/shared/ServicesSection";
import AlumniMapSection from "@/components/shared/AlumniMapSection";
import AlumniTestimonialsSection from "@/components/shared/AlumniTestimonialsSection";
import CtaSection from "@/components/shared/CtaSection";
import Footer from "@/components/shared/Footer";

export default function LandingContent() {
  return (
    <div className="flex-1 flex flex-col bg-white">
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

