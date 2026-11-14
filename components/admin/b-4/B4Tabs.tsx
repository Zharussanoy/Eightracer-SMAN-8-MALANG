"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { displayTitle } from "@/lib/display-copy";
import FigmaIcon from "@/components/b4/FigmaIcon";

const tabs = [
  { label: "Alumni di PT", href: "/admin/alumni-perguruan-tinggi" },
  { label: "Ringkasan Pola", href: "/admin/ringkasan-pola" },
  { label: "Analitik Beasiswa", href: "/admin/analitik-beasiswa" },
  { label: "Basis Data Beasiswa", href: "/admin/basis-data-beasiswa" },
  { label: "Rekomendasi Beasiswa", href: "/admin/rekomendasi-beasiswa" },
];

export default function B4Tabs({ active, query }: { query?: string; active: "Alumni di PT" | "Timeline individu" | "Ringkasan Pola" | "Analitik Beasiswa" | "Basis Data Beasiswa" | "Rekomendasi Beasiswa" }) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const revealActiveTab = () => {
      const link = nav.querySelector<HTMLAnchorElement>('[aria-current="page"]');
      if (!link || nav.scrollWidth <= nav.clientWidth) return;
      const navBounds = nav.getBoundingClientRect();
      const linkBounds = link.getBoundingClientRect();
      nav.scrollLeft += linkBounds.left - navBounds.left - (nav.clientWidth - linkBounds.width) / 2;
    };
    revealActiveTab();
    const observer = new ResizeObserver(revealActiveTab);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [active]);

  return (
    <nav ref={navRef} className="b4-tabs" aria-label="Layanan Alumni dan Beasiswa">
      {tabs.map((tab) => tab.href ? (
        <Link key={tab.label} href={`${tab.href}${query && ["Analitik Beasiswa", "Ringkasan Pola"].includes(tab.label) ? `?${query}` : ""}`} className={active === tab.label ? "b4-activeTab" : undefined}
          aria-current={active === tab.label ? "page" : undefined}>{displayTitle(tab.label)}{tab.label === "Rekomendasi Beasiswa" && <FigmaIcon name="sparkle" size={20} />}</Link>
      ) : (
        <button key={tab.label} type="button" disabled title="Halaman ini belum tersedia">
          {displayTitle(tab.label)}<span className="b4-srOnly"> (belum tersedia)</span>
        </button>
      ))}
    </nav>
  );
}
