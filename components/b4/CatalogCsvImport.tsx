"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { ApiError } from "@/lib/eightracer-api";
import { saveScholarship } from "@/lib/b4-scholarship-api";
import { parseCatalogCsvRows, type CatalogCsvRow } from "@/lib/b4-catalog-csv";
import { parseCatalogExcelRows, PROGRAM_COLUMNS, CRITERIA_COLUMNS } from "@/lib/b4-catalog-excel";
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
    const link = document.createElement("a");
    link.href = "/templates/template-katalog-beasiswa.xlsx";
    link.download = "template-katalog-beasiswa.xlsx";
    link.click();
  };
  async function read(file?: File) {
    setRows([]); setStates({}); setConfirmed(false); setFinished(false); setMessage(""); setName(file?.name ?? "");
    if (!file) return;
    if (!/\.(csv|xlsx)$/i.test(file.name) || file.size > 5 * 1024 * 1024 || !file.size) { setMessage("Pilih file Excel (.xlsx) atau CSV berukuran maksimal 5 MB."); return; }
    lock.current = true; setBusy(true);
    try {
      const XLSX = await import("xlsx");
      if (/\.xlsx$/i.test(file.name)) {
        const book = XLSX.read(await file.arrayBuffer(), { type: "array", cellFormula: true, cellDates: false, sheetRows: 603 });
        if (!book.Sheets.Beasiswa || !book.Sheets.Kriteria) throw new Error("Gunakan template Excel dengan tab Beasiswa dan Kriteria.");
        for (const [sheetName, columns, maxRows] of [["Beasiswa", PROGRAM_COLUMNS, 21], ["Kriteria", CRITERIA_COLUMNS, 601]] as const) {
          const sheet = book.Sheets[sheetName];
          const range = XLSX.utils.decode_range(sheet["!fullref"] ?? sheet["!ref"] ?? "A1");
          if (range.e.r >= maxRows) throw new Error(`Terlalu banyak baris pada tab ${sheetName}. Gunakan maksimal 20 beasiswa dan 600 kriteria.`);
          const header = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, range: 0, blankrows: false })[0] ?? [];
          if (header.length !== columns.length || columns.some((value, index) => header[index] !== value)) throw new Error(`Judul kolom tab ${sheetName} tidak sesuai template.`);
          if (Object.entries(sheet).some(([address, cell]) => !address.startsWith("!") && cell && typeof cell === "object" && "f" in cell)) throw new Error(`Hapus rumus dari tab ${sheetName}; isi nilai biasa.`);
        }
        const values = (sheet: string) => XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[sheet], { defval: "", raw: false, dateNF: "yyyy-mm-dd" });
        setRows(parseCatalogExcelRows(values("Beasiswa"), values("Kriteria")));
      } else {
        const book = XLSX.read(await file.text(), { type: "string", raw: true, cellFormula: false, sheetRows: 22 });
        const values = XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[book.SheetNames[0]], { defval: "", raw: true });
        setRows(parseCatalogCsvRows(values));
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "File belum dapat dibaca. Gunakan template Excel."); }
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
    <button type="button" className="bc4-button" onClick={() => dialog.current?.showModal()}>Impor Beasiswa</button>
    <dialog className="bc4-dialog" ref={dialog} aria-labelledby="bc4-csv-title" onCancel={(e) => { if (busy) e.preventDefault(); }}>
      <div className="bc4-dialogTitle"><h2 id="bc4-csv-title">Impor Informasi Beasiswa</h2></div><div className="bc4-dialogBody bc4-fields">
        <p>Unduh template Excel, isi tabel Beasiswa dan Kriteria, lalu unggah kembali. Maksimal 20 beasiswa per file; periksa pratinjau sebelum menyimpan.</p>
        <button className="bc4-button bc4-downloadTemplate" type="button" disabled={busy} onClick={downloadTemplate}>Unduh Template Excel</button>
        <details className="bc4-templateGuide"><summary>Panduan Pengisian</summary><p>Isi satu beasiswa per baris pada tab Beasiswa. Pada tab Kriteria, isi satu syarat per baris dengan nama beasiswa dan jenjang yang sama. Pilih jenis kriteria dari daftar; tidak perlu menulis JSON.</p><p>Data yang belum diketahui boleh dikosongkan. Setiap beasiswa membutuhkan minimal satu syarat yang sesuai ketentuan penyelenggara. Petunjuk lengkap tersedia pada tab Panduan.</p></details>
        <label className="bc4-field">File Excel atau CSV<input type="file" accept=".xlsx,.csv" disabled={busy} onChange={(e) => void read(e.target.files?.[0])} /></label>
        {name && <p>{displayTitle(name)}</p>}{busy && <p role="status">Sedang memproses…</p>}
        {!!rows.length && <div className="b4-tableScroll"><table className="bc4-progressTable"><thead><tr><th>Baris</th><th>Nama Beasiswa</th><th>Jenjang</th><th>Durasi</th><th>Hasil Pemeriksaan</th></tr></thead><tbody>{rows.map((row) => <tr key={row.line}><td>{row.line}</td><td>{row.input?.nama_beasiswa ?? "Periksa Isian"}</td><td>{row.input?.jenjang ?? "–"}</td><td>{row.input ? (row.input.durasi ? `${row.input.durasi} ${row.input.satuan_durasi}` : "–") : "–"}</td><td>{states[row.line] ?? (row.errors.length ? row.errors.join(" ") : "Siap ditambahkan")}</td></tr>)}</tbody></table></div>}
        {!!rows.length && !finished && <label><input type="checkbox" checked={confirmed} disabled={busy || rows.some((row) => row.errors.length)} onChange={(e) => setConfirmed(e.target.checked)} /> Saya sudah memeriksa seluruh baris dan menyetujui penambahan beasiswa baru berstatus aktif.</label>}
        {message && <p role="status" className="bc4-status">{message}</p>}
        <p className="bc4-demoNote">Jika impor terhenti, periksa baris yang sudah tersimpan sebelum melanjutkan agar tidak terjadi duplikasi.</p>
        <div className="bc4-actions"><button className="bc4-button" disabled={busy} onClick={() => dialog.current?.close()}>Tutup</button><button type="button" className="bc4-button bc4-primary" disabled={busy || finished || !confirmed || !rows.length || rows.some((row) => row.errors.length)} onClick={() => void save()}>Tambah {rows.length || ""} Beasiswa</button></div>
      </div>
    </dialog>
  </>;
}
