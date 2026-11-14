import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import Navbar from "@/components/shared/Navbar";
import DevRoleSwitcher from "@/components/shared/DevRoleSwitcher";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-eightracer",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Eightracer | Satu Portal untuk Rencana Studi Siswa SMAN 8 Malang",
  description:
    "Pantau Pemetaan Kelas, Kelolosan Seleksi PTN, hingga Perkembangan Studi Alumni SMAN 8 Malang Secara Terpadu & Real-Time di Satu Tempat.",
  keywords: [
    "Eightracer",
    "SMAN 8 Malang",
    "Rencana Studi",
    "SNBP",
    "SNBT",
    "Alumni SMAN 8",
    "Pemetaan Nilai",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-purple-100 selection:text-purple-900">
        <UserProvider>
          {/* Universal Navbar aktif di SEMUA halaman */}
          <Suspense fallback={<div className="h-20 shrink-0" aria-label="Memuat navigasi" />}>
            <Navbar />
          </Suspense>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          {/* Dev Mode Role Switcher */}
          <DevRoleSwitcher />
        </UserProvider>
      </body>
    </html>
  );
}
