"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import B4Navbar from "./B4Navbar";
import B4Tabs from "./B4Tabs";
import { COLLEGE_ALUMNI } from "./mockData";
import "./college.css";

const PAGE_SIZE = 8;
const universities = [...new Set(COLLEGE_ALUMNI.map((item) => item.university))];
const studyPrograms = [...new Set(COLLEGE_ALUMNI.map((item) => item.studyProgram))];
const admissionPaths = ["SNBP", "SNBT", "Mandiri"];

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (value: string) => void;
}) {
  return (
    <label className={"b4-selectField"}>
      <span className={"b4-srOnly"}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{label}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
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
  const filtered = COLLEGE_ALUMNI.filter((item) =>
    item.name.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")) &&
    (!university || item.university === university) &&
    (!program || item.studyProgram === program) &&
    (!admission || item.admissionPath === admission)
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = filtered.slice(start, start + PAGE_SIZE);
  const pageNumbers = [...new Set([1, currentPage, pageCount])].sort((a, b) => a - b);
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
      <B4Navbar />
      <main>
        <section className={"b4-hero"} aria-labelledby="b4-page-title">
          <div className={"b4-container"}>
            <nav aria-label="Breadcrumb" className={"b4-breadcrumb"}>
              <Link href="/admin#layanan">Layanan</Link><ChevronRight size={14} aria-hidden="true" />
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
                  <caption className={"b4-srOnly"}>Data contoh alumni di perguruan tinggi</caption>
                  <thead><tr>
                    <th scope="col">Nama Alumni</th><th scope="col">Perguruan Tinggi</th>
                    <th scope="col">Program Studi</th><th scope="col">Jalur Masuk</th>
                    <th scope="col">Status Terakhir</th><th scope="col"><span className={"b4-srOnly"}>Aksi</span></th>
                  </tr></thead>
                  <tbody>
                    {visibleRows.map((alumni) => (
                      <tr key={alumni.id}>
                        <td>{alumni.name}</td><td>{alumni.university}</td><td>{alumni.studyProgram}</td>
                        <td>{alumni.admissionPath}</td><td>{alumni.latestStatus}</td>
                        <td><Link href="/admin/alumni-perguruan-tinggi/informasi-detail" className={"b4-detailButton"}
                          aria-label={`Lihat detail ${alumni.name}`}>Lihat Detail</Link></td>
                      </tr>
                    ))}
                    {visibleRows.length === 0 && <tr><td colSpan={6} className={"b4-emptyState"}>Tidak ada alumni yang cocok dengan pencarian dan filter.<button type="button" onClick={resetFilters}>Reset filter</button></td></tr>}
                  </tbody>
                </table>
              </div>
              <div className={"b4-tableFooter"}>
                <p role="status">Menampilkan {filtered.length ? start + 1 : 0} - {Math.min(start + PAGE_SIZE, filtered.length)} dari {filtered.length} alumni</p>
                <nav className={"b4-pagination"} aria-label="Halaman daftar alumni">
                  <button type="button" aria-label="Halaman sebelumnya" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={20} /></button>
                  {pageNumbers.map((number, index) => <span key={number} className={"b4-pageNumberGroup"}>
                    {index > 0 && number - pageNumbers[index - 1] > 1 && <span aria-hidden="true">…</span>}
                    <button type="button" aria-label={`Halaman ${number}`} aria-current={currentPage === number ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>
                  </span>)}
                  <button type="button" aria-label="Halaman selanjutnya" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={20} /></button>
                </nav>
              </div>
            </div>
            <p className={"b4-demoNote"}>Pratinjau B4 · Data alumni dan profil admin masih berupa contoh.</p>
          </section>
        </div>
      </main>


    </div>
  );
}
