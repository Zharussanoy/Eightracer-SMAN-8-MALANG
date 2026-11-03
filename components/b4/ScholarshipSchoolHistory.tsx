"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { schoolSourceKinds, type SchoolScholarshipPage, type SchoolScholarshipSummary, type SchoolSourceKind } from "@/lib/b4-school-scholarships";
import B4Shell from "./B4Shell";
import "@/components/admin/b-4/scholarships.css";

type Payload = SchoolScholarshipPage & { summary: SchoolScholarshipSummary };
type Result = { key: string; data?: Payload; error?: string };

export default function ScholarshipSchoolHistory({ navigation }: { navigation: ReactNode }) {
  const { currentUser, refreshSession } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [kind, setKind] = useState<SchoolSourceKind | "">("");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const allowed = currentUser.schoolStaff === true;
  const key = JSON.stringify([currentUser.id, search, year, kind, page, retry]);
  const current = result?.key === key ? result : null;

  useEffect(() => {
    if (!allowed) return;
    let active = true;
    const timer = setTimeout(async () => {
      const query = new URLSearchParams({ page: String(page) });
      if (search.trim()) query.set("search", search.trim());
      if (year) query.set("tahun_lulus", year);
      if (kind) query.set("jenis_keterangan", kind);
      try {
        const response = await fetch(`/api/b4/riwayat-beasiswa?${query}`, { cache: "no-store" });
        if (!active) return;
        if (response.status === 401) {
          void refreshSession();
          router.replace("/login");
          return;
        }
        const payload = await response.json();
        if (!response.ok) throw new Error(typeof payload.message === "string" ? payload.message : "Data sekolah belum dapat dimuat.");
        if (active) setResult({ key, data: payload as Payload });
      } catch (error) {
        if (active) setResult({ key, error: error instanceof Error ? error.message : "Data sekolah belum dapat dimuat." });
      }
    }, 300);
    return () => { clearTimeout(timer); active = false; };
  }, [allowed, search, year, kind, page, key, retry, refreshSession, router]);

  const data = current?.data;
  const first = data?.data.length ? (data.currentPage - 1) * data.perPage + 1 : 0;
  const reset = () => { setSearch(""); setYear(""); setKind(""); setPage(1); };
  return <B4Shell title="Basis Data Beasiswa" description="Telusuri catatan beasiswa dan KIP alumni dari arsip sekolah." active="database"
    dataNote="Riwayat ini berasal dari isian sekolah. Keputusan penerimaan beasiswa, UKT, dan IPK ditampilkan setelah datanya tersedia.">
    {navigation}
    {!allowed ? <p role="alert">Riwayat sekolah hanya tersedia untuk administrator atau Guru BK dengan izin aktif dan email terverifikasi.</p> : <>
      <p className="b4-catalogReadNotice">Catatan asli dari sekolah, terhubung ke alumni, kampus, dan program studi. Isian KIP atau nama beasiswa belum menyatakan keputusan penerimaan beasiswa.</p>
      {data && <div className="b4-schoolSummary" aria-label="Ringkasan seluruh data sekolah">
        <div><strong>{data.summary.total.toLocaleString("id-ID")}</strong><span>Catatan sekolah</span></div>
        <div><strong>{data.summary.linkedStudents.toLocaleString("id-ID")}</strong><span>Terhubung ke alumni</span></div>
        <div><strong>{data.summary.linkedAdmissions.toLocaleString("id-ID")}</strong><span>Terhubung ke penerimaan PT</span></div>
      </div>}
      <div className="b4-scholarshipsToolbar b4-schoolToolbar">
        <label className="b4-searchField"><Search size={22} /><span className="b4-srOnly">Cari beasiswa, alumni, kampus, atau prodi</span><input type="search" maxLength={100} placeholder="Cari beasiswa, alumni, kampus, atau prodi" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
        <label className="b4-selectField"><span className="b4-srOnly">Tahun lulus</span><select aria-label="Tahun lulus" value={year} onChange={(event) => { setYear(event.target.value); setPage(1); }}><option value="">Semua Tahun</option>{[2024, 2025, 2026].map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={18} /></label>
        <label className="b4-selectField"><span className="b4-srOnly">Jenis catatan</span><select aria-label="Jenis catatan" value={kind} onChange={(event) => { setKind(event.target.value as SchoolSourceKind | ""); setPage(1); }}><option value="">Semua Catatan</option>{Object.entries(schoolSourceKinds).map(([value, name]) => <option value={value} key={value}>{name}</option>)}</select><ChevronDown size={18} /></label>
      </div>
      {(search || year || kind) && <button type="button" className="b4-resetFilters" onClick={reset}>Reset pencarian dan filter</button>}
      <div className="b4-scholarshipsFrame" aria-busy={!current}>
        <div className="b4-tableScroll" role="region" aria-label="Riwayat beasiswa sekolah" tabIndex={0}><table className="b4-scholarshipsTable b4-schoolTable">
          <thead><tr><th>Catatan Beasiswa / KIP</th><th>Alumni</th><th>Tahun Lulus</th><th>Kampus &amp; Prodi</th><th>Sumber Sekolah</th><th>Kelengkapan</th></tr></thead>
          <tbody>{!current ? <tr><td colSpan={6} className="b4-scholarshipsEmpty" role="status">Memuat riwayat sekolah…</td></tr>
            : current.error ? <tr><td colSpan={6} className="b4-scholarshipsEmpty"><p role="alert">{current.error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Coba lagi</button></td></tr>
            : data?.data.length ? data.data.map((item) => <tr key={item.id}>
              <td><strong className="b4-schoolPrimary">{item.value === "-" || item.value === "--" ? "Belum ada keterangan" : item.value}</strong><span className="b4-schoolSecondary">{schoolSourceKinds[item.kind]}</span></td>
              <td>{item.studentName ?? "Identitas perlu dicocokkan"}</td><td>{item.year}</td>
              <td><span className="b4-schoolPrimary">{item.university ?? "Kampus belum tercatat"}</span><span className="b4-schoolSecondary">{item.major ?? "Prodi belum tercatat"}{item.admissionPath ? ` · ${item.admissionPath}` : ""}</span></td>
              <td><a className="b4-schoolSourceLink" href={item.source.url} target="_blank" rel="noopener noreferrer">{item.source.sheet}<span className="b4-schoolSecondary">Sel {item.source.cell}</span></a></td>
              <td><span className={`b4-schoolBadge ${item.linkedAdmission ? "" : "b4-schoolBadgePending"}`}>{item.linkedAdmission ? "Data PT terhubung" : "Data PT belum lengkap"}</span><span className="b4-schoolSecondary">Status beasiswa belum dikonfirmasi</span></td>
            </tr>) : <tr><td colSpan={6} className="b4-scholarshipsEmpty">{search || year || kind ? "Tidak ada catatan yang sesuai dengan pencarian dan filter." : "Belum ada riwayat beasiswa sekolah yang tersimpan."}</td></tr>}</tbody>
        </table></div>
        {data && <div className="b4-tableFooter b4-scholarshipsFooter"><p role="status">Menampilkan {first} - {first ? first + data.data.length - 1 : 0} dari {data.total.toLocaleString("id-ID")} catatan sekolah</p>
          <nav className="b4-pagination" aria-label="Halaman riwayat sekolah"><button type="button" aria-label="Halaman sebelumnya" disabled={data.currentPage <= 1} onClick={() => setPage(data.currentPage - 1)}><ChevronLeft size={20} /></button><span>Halaman {data.currentPage} dari {data.lastPage}</span><button type="button" aria-label="Halaman selanjutnya" disabled={data.currentPage >= data.lastPage} onClick={() => setPage(data.currentPage + 1)}><ChevronRight size={20} /></button></nav>
        </div>}
      </div>
    </>}
  </B4Shell>;
}
