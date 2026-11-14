"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { ApiError } from "@/lib/eightracer-api";
import { saveScholarship } from "@/lib/b4-scholarship-api";
import { catalogCsvTemplate, parseCatalogCsvRows, type CatalogCsvRow } from "@/lib/b4-catalog-csv";
import { displayTitle } from "@/lib/display-copy";

export default function CatalogCsvImport({ onSaved }: { onSaved: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);
  const { refreshSession } = useUser();
  const router = useRouter();
  const [rows, setRows] = useState<CatalogCsvRow[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [states, setStates] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([catalogCsvTemplate()], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "template-katalog-beasiswa.csv"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  async function read(file?: File) {
    setRows([]); setStates({}); setConfirmed(false); setFinished(false); setMessage(""); setName(file?.name ?? "");
    if (!file) return;
    if (!/\.csv$/i.test(file.name) || file.size > 5 * 1024 * 1024 || !file.size) { setMessage("Pilih file CSV berukuran maksimal 5 MB."); return; }
    lock.current = true; setBusy(true);
    try {
      const XLSX = await import("xlsx");
      const book = XLSX.read(await file.text(), { type: "string", raw: true, cellFormula: false });
      const values = XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[book.SheetNames[0]], { defval: "", raw: true });
      setRows(parseCatalogCsvRows(values));
    } catch (error) { setMessage(error instanceof Error ? error.message : "CSV belum dapat dibaca. Gunakan template."); }
    finally { lock.current = false; setBusy(false); }
  }
  async function save() {
    if (lock.current || finished || !confirmed || !rows.length || rows.some((row) => row.errors.length || !row.input)) return;
    lock.current = true; setBusy(true); setMessage("");
    let saved = 0;
    try {
      for (const row of rows) {
        setStates((current) => ({ ...current, [row.line]: "Menyimpan…" }));
        try { await saveScholarship(row.input!); saved++; setStates((current) => ({ ...current, [row.line]: "Tersimpan" })); }
        catch (error) {
          setStates((current) => ({ ...current, [row.line]: "Perlu diperiksa" }));
          if (error instanceof ApiError && error.status === 401) { void refreshSession(); router.replace("/login"); }
          throw error;
        }
      }
      setMessage(`${saved} beasiswa berhasil ditambahkan ke katalog.`);
    } catch (error) { setMessage(`${saved} baris telah berhasil disimpan. Proses dihentikan: ${error instanceof Error ? error.message : "Penyimpanan belum dapat dipastikan."} Periksa katalog sebelum mengunggah ulang agar tidak ganda.`); }
    finally { if (saved) onSaved(); setFinished(true); setConfirmed(false); lock.current = false; setBusy(false); }
  }
  return <>
    <button type="button" className="bc4-button" onClick={() => dialog.current?.showModal()}>Impor CSV</button>
    <dialog className="bc4-dialog" ref={dialog} aria-labelledby="bc4-csv-title" onCancel={(e) => { if (busy) e.preventDefault(); }}>
      <div className="bc4-dialogTitle"><h2 id="bc4-csv-title">Impor Informasi Beasiswa</h2></div><div className="bc4-dialogBody bc4-fields">
        <p>CSV ini hanya menambah informasi katalog beasiswa baru. Data siswa dan alumni tidak diubah. Unduh template, isi maksimal 20 baris, lalu periksa pratinjau sebelum menyimpan.</p>
        <button className="bc4-button bc4-downloadTemplate" type="button" disabled={busy} onClick={downloadTemplate}>Unduh template CSV</button>
        <details className="bc4-templateGuide"><summary>Panduan kolom dan contoh pengisian</summary><p>Gunakan baris judul dari CSV. Satu baris berikutnya mewakili satu beasiswa baru; jangan mengubah nama kolom.</p><table className="bc4-progressTable"><thead><tr><th>Kolom</th><th>Contoh / aturan</th></tr></thead><tbody>{[["nama_beasiswa", "Beasiswa Prestasi"], ["jenjang", "SMA, Kuliah, atau Keduanya"], ["durasi / satuan_durasi", "8 / semester"], ["periode_apply", "Juli - Agustus"], ["penyelenggara / deskripsi", "Nama penyelenggara / penjelasan program"], ["tanggal_buka / tanggal_tutup", "2026-07-01 / 2026-08-31; boleh kosong bila belum pasti"], ["link_pendaftaran", "URL HTTPS resmi; boleh kosong"], ["kriteria_json", "Ikuti contoh kriteria lengkap dalam CSV"]].map(([name, rule]) => <tr key={name}><td>{name}</td><td>{rule}</td></tr>)}</tbody></table><p>Impor ini menambah katalog, bukan memperbarui siswa/alumni atau menimpa beasiswa lama.</p></details>
        <label className="bc4-field">File CSV katalog<input type="file" accept=".csv" disabled={busy} onChange={(e) => void read(e.target.files?.[0])} /></label>
        {name && <p>{displayTitle(name)}</p>}{busy && <p role="status">Sedang memproses…</p>}
        {!!rows.length && <div className="b4-tableScroll"><table className="bc4-progressTable"><thead><tr><th>Baris</th><th>Nama Beasiswa</th><th>Jenjang</th><th>Durasi</th><th>Hasil Pemeriksaan</th></tr></thead><tbody>{rows.map((row) => <tr key={row.line}><td>{row.line}</td><td>{row.input?.nama_beasiswa ?? "Periksa CSV"}</td><td>{row.input?.jenjang ?? "–"}</td><td>{row.input ? `${row.input.durasi} ${row.input.satuan_durasi}` : "–"}</td><td>{states[row.line] ?? (row.errors.length ? row.errors.join(" ") : "Siap ditambahkan")}</td></tr>)}</tbody></table></div>}
        {!!rows.length && !finished && <label><input type="checkbox" checked={confirmed} disabled={busy || rows.some((row) => row.errors.length)} onChange={(e) => setConfirmed(e.target.checked)} /> Saya Sudah Memeriksa Seluruh Baris. Tambahkan Sebagai Beasiswa Baru Berstatus Aktif.</label>}
        {message && <p role="status" className="bc4-status">{message}</p>}
        <p className="bc4-demoNote">Jika impor terhenti, periksa baris yang sudah tersimpan sebelum melanjutkan agar tidak terjadi duplikasi.</p>
        <div className="bc4-actions"><button className="bc4-button" disabled={busy} onClick={() => dialog.current?.close()}>Tutup</button><button type="button" className="bc4-button bc4-primary" disabled={busy || finished || !confirmed || !rows.length || rows.some((row) => row.errors.length)} onClick={() => void save()}>Tambah {rows.length || ""} Beasiswa</button></div>
      </div>
    </dialog>
  </>;
}
