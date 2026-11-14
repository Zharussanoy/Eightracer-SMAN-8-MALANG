import React from "react";
import Footer from "@/components/shared/Footer"; // Sesuaikan path ini dengan lokasi file Footer.tsx Anda

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}