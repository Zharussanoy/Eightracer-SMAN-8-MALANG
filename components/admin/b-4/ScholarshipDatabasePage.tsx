"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import B4Navbar from "./B4Navbar";
import B4Tabs from "./B4Tabs";
import { SCHOLARSHIPS, type Scholarship, type ScholarshipLevel } from "./scholarshipData";
import "./college.css";
import "./scholarships.css";

const PAGE_SIZE = 8;
const emptyDraft = { name: "", level: "Kuliah" as ScholarshipLevel, duration: "", applyPeriod: "" };

export default function ScholarshipDatabasePage() {
  const [scholarships, setScholarships] = useState(SCHOLARSHIPS);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const filtered = scholarships.filter((item) =>
    item.name.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")) &&
    (!level || item.level === level || (level !== "Kuliah & SMA" && item.level === "Kuliah & SMA"))
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = filtered.slice(start, start + PAGE_SIZE);
  const pageNumbers = [...new Set([1, currentPage, pageCount])].sort((a, b) => a - b);

  const openEditor = (item?: Scholarship) => {
    setEditingId(item?.id ?? null);
    setDraft(item ? { name: item.name, level: item.level, duration: item.duration, applyPeriod: item.applyPeriod } : { ...emptyDraft });
    dialogRef.current?.showModal();
  };

  const saveScholarship = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = { ...draft, name: draft.name.trim(), duration: draft.duration.trim(), applyPeriod: draft.applyPeriod.trim() };
    if (!values.name || !values.duration || !values.applyPeriod) return;
    if (editingId) {
      setScholarships((items) => items.map((item) => item.id === editingId ? { ...item, ...values } : item));
      setMessage(`Perubahan ${values.name} tersimpan di pratinjau.`);
    } else {
      setScholarships((items) => [{ ...values, id: crypto.randomUUID(), archived: false }, ...items]);
      setQuery(""); setLevel(""); setPage(1);
      setMessage(`${values.name} ditambahkan di pratinjau.`);
    }
    dialogRef.current?.close();
  };

  const toggleArchive = (item: Scholarship) => {
    setScholarships((items) => items.map((record) => record.id === item.id ? { ...record, archived: !record.archived } : record));
    setMessage(`${item.name} ${item.archived ? "diaktifkan kembali" : "diarsipkan"} di pratinjau.`);
  };

  const resetFilters = () => { setQuery(""); setLevel(""); setPage(1); };

  return <div className="b4-page">
    <B4Navbar />
    <main>
      <section className="b4-hero" aria-labelledby="b4-scholarships-title">
        <div className="b4-container">
          <nav className="b4-breadcrumb" aria-label="Breadcrumb">
            <Link href="/admin#layanan">Layanan</Link><ChevronRight size={14} aria-hidden="true" />
            <Link href="/admin/alumni-perguruan-tinggi">Alumni dan Beasiswa</Link><ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">Basis Data Beasiswa</span>
          </nav>
          <h1 id="b4-scholarships-title">Basis Data Beasiswa</h1>
          <p>Kelola informasi beasiswa, jenjang pendidikan, periode pendaftaran, dan status program.</p>
        </div>
      </section>
      <div className="b4-container">
        <B4Tabs active="Basis Data Beasiswa" />
        <section className="b4-scholarshipsDirectory" aria-label="Daftar program beasiswa">
          <div className="b4-scholarshipsToolbar">
            <label className="b4-searchField"><Search size={22} aria-hidden="true" /><span className="b4-srOnly">Cari nama beasiswa</span>
              <input type="search" placeholder="Cari nama beasiswa" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
            </label>
            <label className="b4-selectField"><span className="b4-srOnly">Jenjang pendidikan</span>
              <select aria-label="Jenjang pendidikan" value={level} onChange={(event) => { setLevel(event.target.value); setPage(1); }}>
                <option value="">Semua Jenjang</option><option>Kuliah</option><option>SMA</option><option>Kuliah &amp; SMA</option>
              </select><ChevronDown size={18} aria-hidden="true" />
            </label>
            <button className="b4-addScholarship" type="button" onClick={() => openEditor()}><Plus size={23} aria-hidden="true" />Tambah Beasiswa</button>
          </div>
          {(query || level) && <button type="button" className="b4-resetFilters" onClick={resetFilters}>Reset pencarian dan filter <X size={14} aria-hidden="true" /></button>}
          <div className="b4-scholarshipsFrame">
            <div className="b4-tableScroll" role="region" aria-label="Tabel beasiswa, geser ke samping pada layar kecil" tabIndex={0}>
              <table className="b4-scholarshipsTable">
                <caption className="b4-srOnly">Data contoh program beasiswa</caption>
                <thead><tr><th scope="col">Nama Beasiswa</th><th scope="col">Jenjang</th><th scope="col">Durasi</th><th scope="col">Periode Apply</th><th scope="col">Status</th><th scope="col"><span className="b4-srOnly">Aksi</span></th></tr></thead>
                <tbody>{visibleRows.map((item) => <tr key={item.id} className={item.archived ? "b4-scholarshipArchived" : undefined}>
                  <td>{item.name}</td><td>{item.level}</td><td>{item.duration}</td><td>{item.applyPeriod}</td><td>{item.archived ? "Diarsipkan" : "Aktif"}</td>
                  <td><div className="b4-scholarshipActions"><button type="button" className="b4-editScholarship" aria-label={`Edit ${item.name}`} onClick={() => openEditor(item)}>Edit</button><button type="button" aria-label={`${item.archived ? "Aktifkan kembali" : "Arsipkan"} ${item.name}`} onClick={() => toggleArchive(item)}>{item.archived ? "Aktifkan" : "Arsipkan"}</button></div></td>
                </tr>)}
                {!visibleRows.length && <tr><td colSpan={6} className="b4-scholarshipsEmpty">Tidak ada beasiswa yang cocok dengan pencarian.<button type="button" onClick={resetFilters}>Reset filter</button></td></tr>}</tbody>
              </table>
            </div>
            <div className="b4-tableFooter b4-scholarshipsFooter">
              <p role="status">Menampilkan {filtered.length ? start + 1 : 0} - {Math.min(start + PAGE_SIZE, filtered.length)} dari {filtered.length} Beasiswa</p>
              <nav className="b4-pagination" aria-label="Halaman daftar beasiswa">
                <button type="button" aria-label="Halaman sebelumnya" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={20} /></button>
                {pageNumbers.map((number, index) => <span className="b4-pageNumberGroup" key={number}>{index > 0 && number - pageNumbers[index - 1] > 1 && <span aria-hidden="true">…</span>}<button type="button" aria-label={`Halaman ${number}`} aria-current={currentPage === number ? "page" : undefined} onClick={() => setPage(number)}>{number}</button></span>)}
                <button type="button" aria-label="Halaman selanjutnya" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={20} /></button>
              </nav>
            </div>
          </div>
          <p className="b4-scholarshipsNotice" role="status">{message}</p>
          <p className="b4-demoNote">Pratinjau B4 · Data contoh. Perubahan hanya tersimpan selama halaman dibuka.</p>
        </section>
      </div>
    </main>

    <dialog ref={dialogRef} className="b4-detailDialog b4-scholarshipDialog" aria-labelledby="b4-scholarship-editor-title">
      <form className="b4-dialogContent b4-scholarshipForm" onSubmit={saveScholarship}>
        <div className="b4-dialogHeading"><h2 id="b4-scholarship-editor-title">{editingId ? "Edit Beasiswa" : "Tambah Beasiswa"}</h2><button type="button" aria-label="Tutup formulir" onClick={() => dialogRef.current?.close()}><X size={22} /></button></div>
        <p className="b4-dialogNote">Isi informasi program beasiswa untuk pratinjau.</p>
        <label>Nama beasiswa<input name="name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required maxLength={120} autoFocus /></label>
        <label>Jenjang pendidikan<select name="level" value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value as ScholarshipLevel })}><option>Kuliah</option><option>SMA</option><option>Kuliah &amp; SMA</option></select></label>
        <label>Durasi<input name="duration" placeholder="Contoh: 8 Semester" value={draft.duration} onChange={(event) => setDraft({ ...draft, duration: event.target.value })} required maxLength={60} /></label>
        <label>Periode pendaftaran<input name="applyPeriod" placeholder="Contoh: Juli - Agustus" value={draft.applyPeriod} onChange={(event) => setDraft({ ...draft, applyPeriod: event.target.value })} required maxLength={100} /></label>
        <div className="b4-scholarshipFormActions"><button type="button" onClick={() => dialogRef.current?.close()}>Batal</button><button type="submit">Simpan</button></div>
      </form>
    </dialog>
  </div>;
}
