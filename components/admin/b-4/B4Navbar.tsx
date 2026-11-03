"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, CircleUserRound, Menu, X } from "lucide-react";
import "./college.css";

export default function B4Navbar({ role = "admin", name }: { role?: "admin" | "student"; name?: string }) {
  const home = role === "student" ? "/" : "/admin";
  const profileName = name ?? (role === "student" ? "Bagas Wijaya" : "Rina Wijayanti");
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const serviceButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  return (
    <header ref={headerRef} className={"b4-header"} onKeyDown={(event) => {
      if (event.key === "Escape") {
        setServicesOpen(false);
        setMobileOpen(false);
        serviceButtonRef.current?.focus();
      }
    }}>
      <div className={"b4-headerInner"}>
        <Link href={home} className={"b4-brand"} aria-label={`Eightracer, beranda ${role === "student" ? "siswa" : "admin"}`}>
          <span className="b4-brandMark" aria-hidden="true">8</span>
          <span><span className={"b4-brandGold"}>Eight</span>racer</span>
        </Link>

        <button type="button" className={"b4-mobileToggle"} aria-label={mobileOpen ? "Tutup navigasi" : "Buka navigasi"}
          aria-expanded={mobileOpen} aria-controls="b4-main-navigation" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav id="b4-main-navigation" aria-label="Navigasi utama" className={`${"b4-mainNav"} ${mobileOpen ? "b4-mobileNavOpen" : ""}`}>
          <Link href={home}>Beranda</Link>
          <div className={"b4-services"} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setServicesOpen(false);
          }}>
            <button ref={serviceButtonRef} type="button" className={"b4-activeNav"}
              aria-expanded={servicesOpen} aria-controls="b4-services-menu" onClick={() => setServicesOpen(!servicesOpen)}>
              Layanan <ChevronDown size={18} />
            </button>
            {servicesOpen && (
              <div id="b4-services-menu" className={"b4-servicesMenu"}>
                <button type="button" disabled title="Halaman kelompok B1 belum tersedia">Kelompok B1</button>
                <button type="button" disabled title="Halaman kelompok B2 belum tersedia">Kelompok B2</button>
                <Link href="/admin/alumni">Kelompok B3</Link>
                <Link href={role === "student" ? "/siswa/jejak-alumni" : "/admin/alumni-perguruan-tinggi"} className={"b4-selectedService"}
                  onClick={() => { setServicesOpen(false); setMobileOpen(false); }}>Alumni dan Beasiswa</Link>
              </div>
            )}
          </div>
          <Link href={`${home}#tentang`}>Tentang Kami</Link>
          <Link href="/tim-pengembang">Pengembang</Link>
        </nav>

        <div className={"b4-profile"} aria-label={`Profil contoh: ${profileName}, ${role === "student" ? "Siswa" : "Admin"}`}>
          <CircleUserRound size={42} strokeWidth={2} aria-hidden="true" />
          <div><span>{profileName}</span><small>{role === "student" ? "Siswa" : "Admin"}</small></div>
        </div>
      </div>
    </header>
  );
}
