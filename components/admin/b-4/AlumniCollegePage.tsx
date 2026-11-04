"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { ApiError } from "@/lib/eightracer-api";
import { getAlumniPage } from "@/lib/b4-alumni-api";
import type { AlumniPage, AlumniFilters } from "@/lib/b4-alumni";
import { educationStatus } from "@/lib/b4-progress";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import B4Tabs from "./B4Tabs";
import "./college.css";

const PAGE_SIZE = 8;
type Result = { key: string; page?: AlumniPage; error?: string };

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: (string | { value: string; label: string })[]; onChange: (value: string) => void;
}) {
  return (
    <label className={"b4-selectField"}>
      <span className={"b4-srOnly"}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{label}</option>
        {options.map((option) => typeof option === "string" ? <option key={option} value={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown size={18} aria-hidden="true" />
    </label>
  );
}

export default function AlumniCollegePage() {
  const [query, setQuery] = useState("");
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [admission, setAdmission] = useState("");
  const [page, setPage] = useState(1);
  const { authStatus, currentUser, refreshSession } = useUser();
  const router = useRouter();
  const allowed = authStatus === "authenticated" && currentUser.schoolStaff === true;
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [options, setOptions] = useState<AlumniFilters>({ universities: [], studyPrograms: [], admissionPaths: [] });
  const key = JSON.stringify([query, university, program, admission, page, retry]);
  const current = allowed && result?.key === key ? result : null;
  const data = current?.page;
  const visibleRows = data?.data ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.lastPage ?? 1;
  const currentPage = data?.currentPage ?? page;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageNumbers = [...new Set([1, currentPage, pageCount])].sort((a, b) => a - b);
  const universities = options.universities, studyPrograms = options.studyPrograms, admissionPaths = options.admissionPaths;

  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const pageData = await getAlumniPage(query, university, program, admission, page, controller.signal);
        if (!controller.signal.aborted) { setResult({ key, page: pageData }); setOptions(pageData.filters); }
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) { void refreshSession(); router.replace("/login"); }
        setResult({ key, error: error instanceof Error ? error.message : "Data alumni belum dapat dimuat." });
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [allowed, query, university, program, admission, page, key, refreshSession, router]);
  const hasFilters = Boolean(query || university || program || admission);

  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };
  const resetFilters = () => {
    setQuery(""); setUniversity(""); setProgram(""); setAdmission(""); setPage(1);
  };

  return (
    <div className={"b4-page"}>
      <main>
        <section className={"b4-hero"} aria-labelledby="b4-page-title">
          <div className={"b4-container"}>
            <nav aria-label="Breadcrumb" className={"b4-breadcrumb"}>
              <Link href="/#layanan">Layanan</Link><ChevronRight size={14} aria-hidden="true" />
              <span>Alumni dan Beasiswa</span><ChevronRight size={14} aria-hidden="true" />
              <span aria-current="page">Alumni di PT</span>
            </nav>
            <h1 id="b4-page-title">Alumni di Perguruan Tinggi</h1>
            <p>Kelola progress alumni selama menempuh pendidikan di Perguruan Tinggi berdasarkan periode</p>
          </div>
        </section>

        <div className={"b4-container"}>
          <B4Tabs active="Alumni di PT" />

          <section className={"b4-directory"} aria-label="Daftar alumni di perguruan tinggi">
            <div className={"b4-filters"}>
              <label className={"b4-searchField"}>
                <Search size={22} aria-hidden="true" />
                <span className={"b4-srOnly"}>Cari nama alumni</span>
                <input type="search" value={query} placeholder="Cari nama alumni" onChange={(event) => changeFilter(setQuery)(event.target.value)} />
              </label>
              <FilterSelect label="Perguruan Tinggi" value={university} options={universities} onChange={changeFilter(setUniversity)} />
              <FilterSelect label="Program Studi" value={program} options={studyPrograms} onChange={changeFilter(setProgram)} />
              <FilterSelect label="Jalur Masuk" value={admission} options={admissionPaths} onChange={changeFilter(setAdmission)} />
            </div>
            {hasFilters && <button type="button" className={"b4-resetFilters"} onClick={resetFilters}>Reset pencarian dan filter <X size={14} /></button>}

            <div className={"b4-tableFrame"}>
              <div className={"b4-tableScroll"} tabIndex={0} role="region" aria-label="Tabel alumni, geser ke samping pada layar kecil">
                <table className={"b4-table"}>
                  <caption className={"b4-srOnly"}>Data penerimaan alumni dari sekolah</caption>
                  <thead><tr>
                    <th scope="col">Nama Alumni</th><th scope="col">Perguruan Tinggi</th>
                    <th scope="col">Program Studi</th><th scope="col">Jalur Masuk</th>
                    <th scope="col">Status Terakhir</th><th scope="col"><span className={"b4-srOnly"}>Aksi</span></th>
                  </tr></thead>
                  <tbody>
                    {visibleRows.map((alumni) => (
                      <tr key={alumni.id}>
                        <td>{alumni.name}</td><td>{alumni.university}</td><td>{alumni.studyProgram}</td>
                        <td>{alumni.admissionPath ?? "-"}</td><td>{educationStatus(alumni.latestStatus)}</td>
                        <td><Link href={`/admin/alumni-perguruan-tinggi/informasi-detail?id=${encodeURIComponent(String(alumni.id))}`} className={"b4-detailButton"}
                          aria-label={`Lihat detail ${alumni.name}`}>Lihat Detail</Link></td>
                      </tr>
                    ))}
                    {!allowed ? <tr><td colSpan={6} className="b4-emptyState">{authStatus === "loading" ? "Memeriksa sesi akun…" : <>Data alumni sekolah hanya tersedia untuk admin atau Guru BK yang berwenang. <Link href="/login">Masuk</Link></>}</td></tr>
                      : !current ? <tr><td colSpan={6} className="b4-emptyState" role="status">Memuat data alumni sekolah…</td></tr>
                      : current.error ? <tr><td colSpan={6} className="b4-emptyState"><p role="alert">{current.error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Coba lagi</button></td></tr>
                      : visibleRows.length === 0 && <tr><td colSpan={6} className="b4-emptyState">Tidak ada data penerimaan yang cocok dengan pencarian dan filter.<button type="button" onClick={resetFilters}>Reset filter</button></td></tr>}
                  </tbody>
                </table>
              </div>
              <div className={"b4-tableFooter"}>
                <p role="status">Menampilkan {visibleRows.length ? start + 1 : 0} - {visibleRows.length ? start + visibleRows.length : 0} dari {total} catatan penerimaan alumni</p>
                <nav className={"b4-pagination"} aria-label="Halaman daftar alumni">
                  <button type="button" aria-label="Halaman sebelumnya" disabled={!data || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={20} /></button>
                  {pageNumbers.map((number, index) => <span key={number} className={"b4-pageNumberGroup"}>
                    {index > 0 && number - pageNumbers[index - 1] > 1 && <span aria-hidden="true">…</span>}
                    <button type="button" aria-label={`Halaman ${number}`} aria-current={currentPage === number ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>
                  </span>)}
                  <button type="button" aria-label="Halaman selanjutnya" disabled={!data || currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={20} /></button>
                </nav>
              </div>
            </div>
            <p className={"b4-demoNote"}>Data sekolah dari backend. Satu alumni dapat memiliki beberapa catatan penerimaan PT; status progres kuliah ditampilkan hanya jika datanya tersedia.</p>
          </section>
        </div>
      </main>


    </div>
  );
}
