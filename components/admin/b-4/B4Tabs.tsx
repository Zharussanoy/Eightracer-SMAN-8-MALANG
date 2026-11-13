"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { displayTitle } from "@/lib/display-copy";

const tabs = [
  { label: "Alumni di PT", href: "/admin/alumni-perguruan-tinggi" },
  { label: "Timeline individu", href: "/admin/timeline-individu" },
  { label: "Analitik Beasiswa", href: "/admin/analitik-beasiswa" },
  { label: "Basis Data Beasiswa", href: "/admin/basis-data-beasiswa" },
  { label: "Rekomendasi Beasiswa", href: "/admin/rekomendasi-beasiswa" },
];

export default function B4Tabs({ active }: { active: "Alumni di PT" | "Timeline individu" | "Analitik Beasiswa" | "Basis Data Beasiswa" | "Rekomendasi Beasiswa" }) {
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
        <Link key={tab.label} href={tab.href} className={active === tab.label ? "b4-activeTab" : undefined}
          aria-current={active === tab.label ? "page" : undefined}>{displayTitle(tab.label)}</Link>
      ) : (
        <button key={tab.label} type="button" disabled title="Halaman ini belum tersedia">
          {displayTitle(tab.label)}<span className="b4-srOnly"> (belum tersedia)</span>
        </button>
      ))}
    </nav>
  );
}
