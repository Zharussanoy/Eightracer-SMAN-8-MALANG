"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import FigmaIcon from "./FigmaIcon";
import B4Tabs from "@/components/admin/b-4/B4Tabs";
import { STUDENTS, updateDemo, useDemoData } from "./demoStore";
import "@/components/admin/b-4/college.css";
import "./complete.css";
import "./repo-b4-additions.css";
import { displayTitle } from "@/lib/display-copy";
import "./capstone.css";

export function Avatar({ name, small = false, example = true }: { name: string; small?: boolean; example?: boolean }) {
  return <span className={`bc4-avatar ${small ? "bc4-avatarSmall" : ""}`} aria-label={`${example ? "Profil contoh" : "Profil"} ${name}`}><UserRound size={small ? 30 : 48} aria-hidden="true" /></span>;
}
export function StudentTabs({ active }: { active: "alumni" | "recommendations" }) {
  return <nav className="b4-tabs bc4-studentTabs" aria-label="Layanan B4 siswa"><Link href="/siswa/jejak-alumni" className={active === "alumni" ? "b4-activeTab" : ""} aria-current={active === "alumni" ? "page" : undefined}>Jejak Alumni</Link><Link href="/siswa/rekomendasi-beasiswa" className={active === "recommendations" ? "b4-activeTab" : ""} aria-current={active === "recommendations" ? "page" : undefined}>Rekomendasi Beasiswa</Link></nav>;
}
export default function B4Shell({ title, description, student = false, active = "recommendations", children, parent, dataNote, showDemoProfile = true, tabQuery }: {
  title: string; description: string; student?: boolean; active?: "alumni" | "recommendations" | "database" | "timeline" | "analytics" | "summary"; children: ReactNode; parent?: { label: string; href: string }; dataNote?: string; showDemoProfile?: boolean; tabQuery?: string;
}) {
  const data = useDemoData();
  return <div className="b4-page bc4-page">
    <main><section className="b4-hero"><div className="b4-container"><nav className="b4-breadcrumb" aria-label="Breadcrumb"><Link href="/#layanan">Layanan</Link><FigmaIcon name="breadcrumb" size={24} /><span>Alumni dan Beasiswa</span><FigmaIcon name="breadcrumb" size={24} />{parent && <><Link href={parent.href}>{displayTitle(parent.label)}</Link><FigmaIcon name="breadcrumb" size={24} /></>}<span aria-current="page">{displayTitle(title)}</span></nav><h1>{displayTitle(title)}</h1><p>{description}</p></div></section>

      <div className="b4-container">{student ? <StudentTabs active={active === "alumni" ? "alumni" : "recommendations"} /> : <B4Tabs query={tabQuery} active={active === "database" ? "Basis Data Beasiswa" : active === "alumni" ? "Alumni di PT" : active === "timeline" ? "Timeline individu" : active === "summary" ? "Ringkasan Pola" : active === "analytics" ? "Analitik Beasiswa" : "Rekomendasi Beasiswa"} />}
        {student && showDemoProfile && <div className="bc4-viewer"><label>Profil Siswa Contoh <select aria-label="Profil siswa contoh" value={data.viewerId} onChange={(event) => updateDemo((current) => ({ ...current, viewerId: event.target.value }))}>{STUDENTS.map((item) => <option key={item.id} value={item.id}>{displayTitle(item.name)}</option>)}</select></label></div>}
        <div className="bc4-content">{children}</div>{dataNote && <p className="bc4-demoNote">{dataNote}</p>}
      </div>
    </main>
  </div>;
}
