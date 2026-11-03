"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { ApiError } from "@/lib/eightracer-api";
import { getScholarships } from "@/lib/b4-scholarship-api";
import { scholarshipPeriod, type ScholarshipPage, type ScholarshipLevel } from "@/lib/b4-scholarships";
import B4Shell from "./B4Shell";

type Result = { key: string; page?: ScholarshipPage; error?: string };

export default function ScholarshipCatalogApi({ navigation }: { navigation?: ReactNode } = {}) {
  const { currentUser, refreshSession } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<ScholarshipLevel | "">("");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const key = JSON.stringify([search, level, page, retry]);
  const allowed = currentUser.schoolStaff === true;
  const current = result?.key === key ? result : null;

  useEffect(() => {
    if (!allowed) return;
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const response = await getScholarships({ search, level, page });
        if (active) setResult({ key, page: response });
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          void refreshSession();
          router.replace("/login");
          return;
        }
        setResult({ key, error: error instanceof Error ? error.message : "Katalog belum dapat dimuat." });
      }
    }, 300);
    return () => { clearTimeout(timer); active = false; };
  }, [allowed, search, level, page, key, retry, refreshSession, router]);

  const data = current?.page;
  const first = data?.data.length ? (data.currentPage - 1) * data.perPage + 1 : 0;
  const reset = () => { setSearch(""); setLevel(""); setPage(1); };
  return <B4Shell title="Basis Data Beasiswa" description="Kelola informasi beasiswa, jenjang pendidikan, periode pendaftaran, dan status program." active="database"
    dataNote="Katalog dari backend · Tahap ini hanya menampilkan data. Halaman B4 lainnya masih memakai data contoh.">
    {navigation}
    {!allowed ? <p role="alert">Katalog admin hanya tersedia untuk administrator atau guru BK dengan izin aktif dan email terverifikasi.</p> : <>
      <p className="b4-catalogReadNotice">Daftar katalog dibaca dari BE. Draf baru dapat disiapkan di browser; tambah, edit, dan arsip belum dikirim ke BE.</p>
      <div className="b4-scholarshipsToolbar b4-apiCatalogToolbar">
        <label className="b4-searchField"><Search size={22} /><span className="b4-srOnly">Cari nama beasiswa</span><input type="search" maxLength={100} placeholder="Cari nama beasiswa" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
        <label className="b4-selectField"><span className="b4-srOnly">Jenjang pendidikan</span><select aria-label="Jenjang pendidikan" value={level} onChange={(event) => { setLevel(event.target.value as ScholarshipLevel | ""); setPage(1); }}><option value="">Semua Jenjang</option><option>Kuliah</option><option>SMA</option><option value="Keduanya">Kuliah &amp; SMA</option></select><ChevronDown size={18} /></label>
      </div>
      <p className="bc4-localDraftLink"><Link className="bc4-button" href="/admin/basis-data-beasiswa/tambah">Siapkan Draf Beasiswa Lokal</Link></p>
      {(search || level) && <button type="button" className="b4-resetFilters" onClick={reset}>Reset pencarian dan filter</button>}
      <div className="b4-scholarshipsFrame" aria-busy={!current}>
        <div className="b4-tableScroll" role="region" aria-label="Tabel beasiswa" tabIndex={0}><table className="b4-scholarshipsTable b4-apiCatalogTable">
          <thead><tr><th>Nama Beasiswa</th><th>Jenjang</th><th>Periode Pendaftaran</th><th>Status</th></tr></thead>
          <tbody>{!current ? <tr><td colSpan={4} className="b4-scholarshipsEmpty" role="status">Memuat katalog beasiswa…</td></tr>
            : current.error ? <tr><td colSpan={4} className="b4-scholarshipsEmpty"><p role="alert">{current.error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Coba lagi</button></td></tr>
            : data?.data.length ? data.data.map((item) => <tr key={item.id} className={item.active ? undefined : "b4-scholarshipArchived"}><td>{item.name}</td><td>{item.level === "Keduanya" ? "Kuliah & SMA" : item.level}</td><td>{scholarshipPeriod(item)}</td><td>{item.active ? "Aktif" : "Diarsipkan"}</td></tr>)
            : <tr><td colSpan={4} className="b4-scholarshipsEmpty">{search || level ? "Tidak ada beasiswa yang sesuai dengan pencarian dan filter." : "Belum ada beasiswa di katalog."}</td></tr>}</tbody>
        </table></div>
        {data && <div className="b4-tableFooter b4-scholarshipsFooter"><p role="status">Menampilkan {first} - {first ? first + data.data.length - 1 : 0} dari {data.total} Beasiswa</p>
          <nav className="b4-pagination" aria-label="Halaman daftar beasiswa"><button type="button" aria-label="Halaman sebelumnya" disabled={data.currentPage <= 1} onClick={() => setPage(data.currentPage - 1)}><ChevronLeft size={20} /></button><span>Halaman {data.currentPage} dari {data.lastPage}</span><button type="button" aria-label="Halaman selanjutnya" disabled={data.currentPage >= data.lastPage} onClick={() => setPage(data.currentPage + 1)}><ChevronRight size={20} /></button></nav>
        </div>}
      </div>
    </>}
  </B4Shell>;
}
