import Link from "next/link";

const tabs = [
  { label: "Alumni di PT", href: "/admin/alumni-perguruan-tinggi" },
  { label: "Timeline individu", href: "/admin/timeline-individu" },
  { label: "Analitik Beasiswa" },
  { label: "Basis Data Beasiswa" },
  { label: "Rekomendasi Beasiswa" },
];

export default function B4Tabs({ active }: { active: "Alumni di PT" | "Timeline individu" }) {
  return (
    <nav className="b4-tabs" aria-label="Layanan Alumni dan Beasiswa">
      {tabs.map((tab) => tab.href ? (
        <Link key={tab.label} href={tab.href} className={active === tab.label ? "b4-activeTab" : undefined}
          aria-current={active === tab.label ? "page" : undefined}>{tab.label}</Link>
      ) : (
        <button key={tab.label} type="button" disabled title="Halaman ini belum tersedia">
          {tab.label}<span className="b4-srOnly"> (belum tersedia)</span>
        </button>
      ))}
    </nav>
  );
}
