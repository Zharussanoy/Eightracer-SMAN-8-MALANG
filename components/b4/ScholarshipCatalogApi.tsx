"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { ApiError } from "@/lib/eightracer-api";
import { archiveScholarship, getScholarship, getScholarships, saveScholarship } from "@/lib/b4-scholarship-api";
import { scholarshipDuration, scholarshipPeriod, scholarshipQuery, scholarshipRegistrationLabel, type ScholarshipPage, type ScholarshipLevel, type ScholarshipRow } from "@/lib/b4-scholarships";
import B4Shell from "./B4Shell";
import CatalogCsvImport from "./CatalogCsvImport";
import { displayTitle } from "@/lib/display-copy";

type Result = { key: string; page?: ScholarshipPage; error?: string };

export default function ScholarshipCatalogApi() {
  const { currentUser, refreshSession } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<ScholarshipLevel | "">("");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [action, setAction] = useState<ScholarshipRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const submitting = useRef(false);
  const confirmation = useRef<HTMLDialogElement>(null);
  const key = JSON.stringify([search, level, page, retry]);
  const allowed = currentUser.schoolStaff === true;
  const current = result?.key === key ? result : null;

  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await getScholarships({ search, level, page, signal: controller.signal });
        if (!controller.signal.aborted) setResult({ key, page: response });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          void refreshSession();
          router.replace("/login");
          return;
        }
        setResult({ key, error: error instanceof Error ? error.message : "Katalog belum dapat dimuat." });
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [allowed, search, level, page, key, retry, refreshSession, router]);

  const data = current?.page;
  const first = data?.data.length ? (data.currentPage - 1) * data.perPage + 1 : 0;
  const reset = () => { setSearch(""); setLevel(""); setPage(1); };
  async function confirmAction() {
    if (!action || submitting.current) return;
    submitting.current = true; setBusy(true); setStatus("");
    try {
      if (action.active) await archiveScholarship(action.id);
      else {
        const detail = await getScholarship(action.id);
        if (!detail.input) throw new Error("Informasi lengkap beasiswa belum tersedia untuk diaktifkan. Muat ulang katalog.");
        await saveScholarship({ ...detail.input, is_active: true }, action.id);
      }
      confirmation.current?.close();
      setStatus(`${displayTitle(action.name)} berhasil ${action.active ? "diarsipkan" : "diaktifkan"}.`);
      setRetry((value) => value + 1);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) { void refreshSession(); router.replace("/login"); }
      setStatus(error instanceof Error ? error.message : "Perubahan belum dapat disimpan.");
    } finally { submitting.current = false; setBusy(false); }
  }
  return <B4Shell title="Basis Data Beasiswa" description="Kelola informasi beasiswa, jenjang pendidikan, periode pendaftaran, dan status program." active="database"
    dataNote="">
    {!allowed ? <p role="alert">Katalog admin hanya tersedia untuk administrator atau guru BK dengan izin aktif dan email terverifikasi.</p> : <>
      <div className="b4-scholarshipsToolbar">
        <label className="b4-searchField"><Search size={22} /><span className="b4-srOnly">Cari nama beasiswa</span><input type="search" maxLength={100} placeholder="Cari nama beasiswa" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
        <label className="b4-selectField"><span className="b4-srOnly">Jenjang pendidikan</span><select aria-label="Jenjang pendidikan" value={level} onChange={(event) => { setLevel(event.target.value as ScholarshipLevel | ""); setPage(1); }}><option value="">Semua Jenjang</option><option>Kuliah</option><option>SMA</option><option value="Keduanya">Kuliah &amp; SMA</option></select><ChevronDown size={18} /></label>
        <div className="bc4-catalogActions"><CatalogCsvImport onSaved={() => setRetry((value) => value + 1)} /><Link className="b4-addScholarship" href="/admin/basis-data-beasiswa/tambah"><Plus size={23} />Tambah Beasiswa</Link></div>
      </div>
      {(search || level) && <button type="button" className="b4-resetFilters" onClick={reset}>Reset Pencarian dan Filter</button>}
      <div className="b4-scholarshipsFrame" aria-busy={!current}>
        <div className="b4-tableScroll" role="region" aria-label="Tabel beasiswa" tabIndex={0}><table className="b4-scholarshipsTable">
          <thead><tr><th>Nama Beasiswa</th><th>Jenjang</th><th>Durasi</th><th>Periode Pendaftaran</th><th>Status Program</th><th>Status Pendaftaran</th><th><span className="b4-srOnly">Aksi</span></th></tr></thead>
          <tbody>{!current ? <tr><td colSpan={7} className="b4-scholarshipsEmpty" role="status">Memuat katalog beasiswa…</td></tr>
            : current.error ? <tr><td colSpan={7} className="b4-scholarshipsEmpty"><p role="alert">{current.error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Coba Lagi</button></td></tr>
            : data?.data.length ? data.data.map((item) => <tr key={item.id} className={item.active ? undefined : "b4-scholarshipArchived"}><td>{displayTitle(item.name)}</td><td>{item.level === "Keduanya" ? "Kuliah & SMA" : item.level}</td><td>{scholarshipDuration(item)}</td><td>{item.applyPeriod || scholarshipPeriod(item)}{item.applyPeriod && <small style={{ display: "block" }}>{item.opens || item.closes ? scholarshipPeriod(item) : "Tanggal pasti belum tercatat"}</small>}</td><td>{(item.programStatus ?? (item.active ? "aktif" : "diarsipkan")) === "aktif" ? "Aktif" : "Diarsipkan"}</td><td>{scholarshipRegistrationLabel(item)}</td><td><div className="b4-scholarshipActions"><Link className="b4-editScholarship" aria-label={`Edit ${displayTitle(item.name)}`} href={`/admin/basis-data-beasiswa/edit?id=${item.id}&${scholarshipQuery(search, level, data.currentPage)}`}>Edit</Link><button type="button" aria-label={`${item.active ? "Arsipkan" : "Aktifkan kembali"} ${displayTitle(item.name)}`} onClick={() => { setAction(item); setStatus(""); confirmation.current?.showModal(); }}>{item.active ? "Arsipkan" : "Aktifkan"}</button></div></td></tr>)
            : <tr><td colSpan={7} className="b4-scholarshipsEmpty">{search || level ? "Tidak ada beasiswa yang sesuai dengan pencarian dan filter." : "Belum ada beasiswa di katalog."}</td></tr>}</tbody>
        </table></div>
        {data && <div className="b4-tableFooter b4-scholarshipsFooter"><p role="status">Menampilkan {first} - {first ? first + data.data.length - 1 : 0} dari {data.total} Beasiswa</p>
          <nav className="b4-pagination" aria-label="Halaman daftar beasiswa"><button type="button" aria-label="Halaman sebelumnya" disabled={data.currentPage <= 1} onClick={() => setPage(data.currentPage - 1)}><ChevronLeft size={20} /></button><span>Halaman {data.currentPage} dari {data.lastPage}</span><button type="button" aria-label="Halaman selanjutnya" disabled={data.currentPage >= data.lastPage} onClick={() => setPage(data.currentPage + 1)}><ChevronRight size={20} /></button></nav>
        </div>}
      </div>
      <p role="status" className="bc4-status">{status}</p>
      <dialog ref={confirmation} className="bc4-dialog" onCancel={(event) => { if (busy) event.preventDefault(); }}><div className="bc4-dialogTitle"><h2>{action?.active ? "Arsipkan" : "Aktifkan"} Beasiswa</h2></div><div className="bc4-dialogBody"><p>{action?.active ? "Arsipkan" : "Aktifkan kembali"} <strong>{displayTitle(action?.name)}</strong>?</p><p>Perubahan akan disimpan ke katalog sekolah.</p><p role="alert">{status}</p><div className="bc4-actions"><button className="bc4-button" type="button" disabled={busy} onClick={() => confirmation.current?.close()}>Batal</button><button className="bc4-button bc4-primary" type="button" disabled={busy} onClick={() => void confirmAction()}>{busy ? "Menyimpan…" : action?.active ? "Arsipkan" : "Aktifkan"}</button></div></div></dialog>
    </>}
  </B4Shell>;
}
