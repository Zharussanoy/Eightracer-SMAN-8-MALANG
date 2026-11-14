"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import FigmaIcon from "./FigmaIcon";
import NumberPagination from "./NumberPagination";
import B4Shell from "./B4Shell";
import { updateDemo, useDemoData, type CatalogItem } from "./demoStore";
import "@/components/admin/b-4/scholarships.css";
import { useUser } from "@/context/UserContext";
import ScholarshipCatalogApi from "./ScholarshipCatalogApi";
import { displayTitle } from "@/lib/display-copy";

export default function ScholarshipCatalog() {
  const { authStatus, refreshSession, authMessage } = useUser();
  if (authStatus === "authenticated") return <ScholarshipCatalogApi />;
  if (authStatus !== "anonymous") return <B4Shell title="Basis Data Beasiswa" description="Kelola informasi program beasiswa." active="database">
    <p role="status">{authStatus === "loading" ? "Memeriksa sesi akun…" : authMessage}</p>
    {authStatus === "unavailable" && <button type="button" onClick={() => void refreshSession()}>Coba Periksa Sesi Lagi</button>}
  </B4Shell>;
  return <ScholarshipCatalogDemo />;
}

function ScholarshipCatalogDemo() {
  const data = useDemoData();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const filtered = [...data.catalog].sort((a,b) => Number(a.archived)-Number(b.archived) || a.name.localeCompare(b.name,"id")).filter((item) => item.name.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")) && (!level || item.level === level || (level !== "Kuliah & SMA" && item.level === "Kuliah & SMA")));
  const count = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, count), start = (current - 1) * 8;
  const toggle = (item: CatalogItem) => { updateDemo((state) => ({ ...state, catalog: state.catalog.map((entry) => entry.id === item.id ? { ...entry, archived: !entry.archived } : entry) })); setStatus(`${displayTitle(item.name)} ${item.archived ? "diaktifkan kembali" : "diarsipkan"}.`); };
  return <B4Shell title="Basis Data Beasiswa" description="Kelola informasi beasiswa, jenjang pendidikan, periode pendaftaran, dan status program." active="database">
    <div className="b4-scholarshipsToolbar"><label className="b4-searchField"><Search size={22} /><span className="b4-srOnly">Cari nama beasiswa</span><input type="search" placeholder="Cari nama beasiswa" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></label><label className="b4-selectField"><span className="b4-srOnly">Jenjang pendidikan</span><select aria-label="Jenjang pendidikan" value={level} onChange={(event) => { setLevel(event.target.value); setPage(1); }}><option value="">Semua Jenjang</option><option>Kuliah</option><option>SMA</option><option>Kuliah &amp; SMA</option></select><ChevronDown size={18} /></label><Link className="b4-addScholarship" href="/admin/basis-data-beasiswa/tambah"><Plus size={23} />Tambah Beasiswa</Link></div>
    {(query || level) && <button type="button" className="b4-resetFilters" onClick={() => { setQuery(""); setLevel(""); setPage(1); }}>Reset Pencarian dan Filter</button>}
    <div className="b4-scholarshipsFrame"><div className="b4-tableScroll" role="region" aria-label="Tabel beasiswa" tabIndex={0}><table className="b4-scholarshipsTable"><thead><tr><th>Nama Beasiswa</th><th>Jenjang</th><th>Durasi</th><th>Periode Pendaftaran</th><th>Status</th><th><span className="b4-srOnly">Aksi</span></th></tr></thead><tbody>{filtered.slice(start, start + 8).map((item) => <tr key={item.id} className={item.archived ? "b4-scholarshipArchived" : undefined}><td>{displayTitle(item.name)}</td><td>{item.level}</td><td>{item.duration}</td><td>{item.applyPeriod}</td><td>{item.archived ? "Diarsipkan" : "Aktif"}</td><td><div className="b4-scholarshipActions"><Link href={`/admin/basis-data-beasiswa/edit?id=${encodeURIComponent(item.id)}`} className="b4-editScholarship" aria-label={`Edit ${displayTitle(item.name)}`}>Edit</Link><button type="button" aria-label={`${item.archived ? "Aktifkan kembali" : "Arsipkan"} ${displayTitle(item.name)}`} onClick={() => toggle(item)}>{item.archived ? "Aktifkan" : "Arsipkan"}</button></div></td></tr>)}{!filtered.length && <tr><td colSpan={6} className="b4-scholarshipsEmpty">Tidak ada beasiswa yang sesuai.</td></tr>}</tbody></table></div>
      <div className="b4-tableFooter b4-scholarshipsFooter"><p role="status">Menampilkan {filtered.length ? start + 1 : 0} - {Math.min(start + 8, filtered.length)} dari {filtered.length} Beasiswa</p><nav className="b4-pagination" aria-label="Halaman daftar beasiswa"><button type="button" aria-label="Halaman sebelumnya" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft size={20} /></button>{Array.from({ length: count }, (_, index) => index + 1).map((number) => <button key={number} type="button" aria-label={`Halaman ${number}`} aria-current={number === current ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>)}<button type="button" aria-label="Halaman selanjutnya" disabled={current === count} onClick={() => setPage(current + 1)}><ChevronRight size={20} /></button></nav></div>
    </div><p className="bc4-status" role="status">{status}</p>
  </B4Shell>;
}
