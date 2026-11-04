"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import type { RecommendationStudent, RecommendationStudentPage } from "@/lib/b4-students";

export default function RecommendationStudentPicker({ onSelect }: { onSelect: (student: RecommendationStudent) => void }) {
  const { refreshSession } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cohort, setCohort] = useState("");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const query = new URLSearchParams({ page: String(page) });
  if (search.trim()) query.set("search", search.trim());
  if (cohort) query.set("angkatan", cohort);
  const searchParams = query.toString();
  const key = `${searchParams}:${retry}`;
  const invalidYear = !!cohort && !/^\d{4}$/.test(cohort);
  const [result, setResult] = useState<{ key: string; data?: RecommendationStudentPage; error?: string }>();
  useEffect(() => {
    if (invalidYear) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/b4/students?${searchParams}`, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal: abort.signal });
        const payload = await response.json();
        if (abort.signal.aborted) return;
        if (response.status === 401) { void refreshSession(); router.replace("/login"); }
        if (!response.ok) throw new Error(payload.message ?? "Daftar siswa belum dapat dimuat.");
        setResult({ key, data: payload });
      } catch (error) { if (!abort.signal.aborted) setResult({ key, error: error instanceof Error ? error.message : "Aplikasi belum dapat dihubungi." }); }
    }, 300);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [searchParams, key, invalidYear, refreshSession, router]);
  const current = result?.key === key ? result : null;
  const data = current?.data;
  return <section className="bc4-section"><h2 className="bc4-sectionHeading">Pilih Siswa</h2><div className="bc4-sectionBody">
    <div className="bc4-grid2"><label className="b4-searchField"><span className="b4-srOnly">Cari nama siswa</span><input type="search" maxLength={100} placeholder="Cari nama siswa" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></label><label className="b4-searchField"><span className="b4-srOnly">Angkatan siswa</span><input inputMode="numeric" maxLength={4} placeholder="Angkatan (tahun lulus)" value={cohort} onChange={(e) => { setCohort(e.target.value); setPage(1); }} /></label></div>
    {(search || cohort) && <button className="b4-resetFilters" onClick={() => { setSearch(""); setCohort(""); setPage(1); }}>Reset pencarian</button>}
    {invalidYear ? <p role="alert">Angkatan harus 4 digit.</p> : current?.error ? <div className="bc4-empty"><p role="alert">{current.error}</p><button className="bc4-button" onClick={() => setRetry((value) => value + 1)}>Coba lagi</button></div>
      : !data ? <p role="status">Memuat siswa sekolah…</p> : <>
        <div className="b4-tableScroll" tabIndex={0} role="region" aria-label="Pilihan siswa"><table className="b4-table"><thead><tr><th>Nama Siswa</th><th>Angkatan</th><th>Aksi</th></tr></thead><tbody>{data.data.map((student) => <tr key={student.id}><td>{student.name}</td><td>{student.cohort ?? "Belum tercatat"}</td><td><button className="bc4-button" data-preview-student={student.id} onClick={() => onSelect(student)}>Lihat Pratinjau</button></td></tr>)}{!data.data.length && <tr><td colSpan={3}>Tidak ada siswa yang sesuai dengan pencarian.</td></tr>}</tbody></table></div>
        <div className="b4-tableFooter"><p>Menampilkan {data.data.length ? (data.currentPage - 1) * data.perPage + 1 : 0}–{data.data.length ? (data.currentPage - 1) * data.perPage + data.data.length : 0} dari {data.total} siswa</p><nav className="b4-pagination" aria-label="Halaman siswa"><button aria-label="Halaman sebelumnya" disabled={data.currentPage <= 1} onClick={() => setPage(data.currentPage - 1)}>‹</button><span>Halaman {data.currentPage} dari {data.lastPage}</span><button aria-label="Halaman selanjutnya" disabled={data.currentPage >= data.lastPage} onClick={() => setPage(data.currentPage + 1)}>›</button></nav></div>
      </>}
  </div></section>;
}
