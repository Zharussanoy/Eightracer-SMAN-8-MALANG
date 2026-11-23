"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { ApiError } from "@/lib/eightracer-api";
import { saveScholarshipsBulk } from "@/lib/b4-scholarship-api";
import { catalogCsvTemplate, parseCatalogCsvRows, type CatalogCsvRow } from "@/lib/b4-catalog-csv";
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

  const downloadCsvTemplate = () => {
    const blob = new Blob([catalogCsvTemplate()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-katalog-beasiswa.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcelTemplate = () => {
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
        if (book.Sheets.Beasiswa && book.Sheets.Kriteria) {
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
          const sheet = book.Sheets[book.SheetNames[0]];
          const values = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false, dateNF: "yyyy-mm-dd" });
          setRows(parseCatalogCsvRows(values));
        }
      } else {
        const book = XLSX.read(await file.text(), { type: "string", raw: true, cellFormula: false, sheetRows: 22 });
        const values = XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[book.SheetNames[0]], { defval: "", raw: true });
        setRows(parseCatalogCsvRows(values));
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "File belum dapat dibaca. Gunakan template CSV atau Excel."); }
    finally { lock.current = false; setBusy(false); }
  }

  async function save() {
    if (lock.current || finished || !confirmed || !rows.length || rows.some((row) => row.errors.length || !row.input)) return;
    lock.current = true; setBusy(true); setMessage("");
    let saved = 0;
    try {
      setStates(Object.fromEntries(rows.map((row) => [row.line, "Menyimpan…"])));
      await saveScholarshipsBulk(rows.map((row) => row.input!));
      saved = rows.length;
      setStates(Object.fromEntries(rows.map((row) => [row.line, "Tersimpan"])));
      setMessage(`${saved} beasiswa berhasil ditambahkan ke katalog.`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) { void refreshSession(); router.replace("/login"); }
      const failures = error instanceof ApiError ? error.errors : {};
      const next: Record<number, string> = {};
      rows.forEach((row, index) => {
        const prefix = `rows.${index}`;
        next[row.line] = Object.keys(failures).some((key) => key === prefix || key.startsWith(`${prefix}.`)) ? "Perlu diperiksa" : "Tidak tersimpan";
      });
      setStates(next);
      const detail = Object.entries(failures).map(([field, messages]) => {
        const match = /^rows\.(\d+)/.exec(field);
        const row = match ? rows[Number(match[1])] : undefined;
        return row ? `Baris ${row.line}: ${messages.join(" ")}` : messages.join(" ");
      }).join(" ");
      const fallback = error instanceof Error ? error.message : "Penyimpanan belum dapat dipastikan.";
      setMessage(`Tidak ada baris yang disimpan karena impor bersifat all-or-nothing. ${detail || fallback}`);
    }
    finally { if (saved) onSaved(); setFinished(true); setConfirmed(false); lock.current = false; setBusy(false); }
  }

  return <>
    <button type="button" className="bc4-button" onClick={() => dialog.current?.showModal()}>Impor Beasiswa</button>
    <dialog className="bc4-dialog" ref={dialog} aria-labelledby="bc4-csv-title" onCancel={(e) => { if (busy) e.preventDefault(); }}>
      <div className="bc4-dialogTitle"><h2 id="bc4-csv-title">Impor Informasi Beasiswa</h2></div><div className="bc4-dialogBody bc4-fields">
        <p>Unduh template CSV atau Excel, isi data beasiswa dan kriteria yang telah digabung dalam satu tabel, lalu unggah kembali. Maksimal 20 beasiswa per file; data yang disimpan langsung masuk ke database.</p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          <button className="bc4-button bc4-downloadTemplate" type="button" disabled={busy} onClick={downloadCsvTemplate}>Unduh Template CSV</button>
          <button className="bc4-button" type="button" disabled={busy} onClick={downloadExcelTemplate}>Unduh Template Excel</button>
        </div>
        <details className="bc4-templateGuide">
          <summary>Panduan Pengisian CSV / Excel</summary>
          <p>Isi satu beasiswa per baris. Kolom informasi beasiswa dan syarat kriteria kini telah <strong>digabung dalam satu tabel</strong> tanpa perlu berpindah tab atau menulis format JSON.</p>
          <p>Pilihan Jenis Kriteria: Nilai TKA, Rata-rata Rapor, Rapor Kelas 12, Penghasilan Orang Tua, Kehadiran (%), Jumlah Prestasi, Jumlah Organisasi, Poin Karakter, IPK, Semester Kuliah.</p>
          <p>Operator yang didukung: &gt;=, &lt;=, =, !=, &gt;, &lt;. Kolom syarat tambahan (nama_kriteria_2, tipe_kriteria_2, dsb) dapat ditambahkan langsung pada baris yang sama bila beasiswa memiliki lebih dari satu kriteria.</p>
        </details>
        <label className="bc4-field">File Excel atau CSV<input type="file" accept=".xlsx,.csv" disabled={busy} onChange={(e) => void read(e.target.files?.[0])} /></label>
        {name && <p>{displayTitle(name)}</p>}{busy && <p role="status">Sedang memproses…</p>}
        {!!rows.length && <div className="b4-tableScroll"><table className="bc4-progressTable"><thead><tr><th>Baris</th><th>Nama Beasiswa</th><th>Jenjang</th><th>Durasi</th><th>Hasil Pemeriksaan</th></tr></thead><tbody>{rows.map((row) => <tr key={row.line}><td>{row.line}</td><td>{row.input?.nama_beasiswa ?? "Periksa Isian"}</td><td>{row.input?.jenjang ?? "–"}</td><td>{row.input ? (row.input.durasi ? `${row.input.durasi} ${row.input.satuan_durasi}` : "–") : "–"}</td><td>{states[row.line] ?? (row.errors.length ? row.errors.join(" ") : "Siap ditambahkan")}</td></tr>)}</tbody></table></div>}
        {!!rows.length && !finished && <label><input type="checkbox" checked={confirmed} disabled={busy || rows.some((row) => row.errors.length)} onChange={(e) => setConfirmed(e.target.checked)} /> Saya sudah memeriksa seluruh baris dan menyetujui penambahan beasiswa baru berstatus aktif ke database.</label>}
        {message && <p role="status" className="bc4-status">{message}</p>}
        <p className="bc4-demoNote">Impor bersifat all-or-nothing: bila satu baris ditolak, tidak ada baris yang disimpan. Nama dan jenjang yang sudah ada di katalog juga ditolak agar data tidak ganda.</p>
        <div className="bc4-actions"><button className="bc4-button" disabled={busy} onClick={() => dialog.current?.close()}>Tutup</button><button type="button" className="bc4-button bc4-primary" disabled={busy || finished || !confirmed || !rows.length || rows.some((row) => row.errors.length)} onClick={() => void save()}>Tambah {rows.length || ""} Beasiswa ke Database</button></div>
      </div>
    </dialog>
  </>;
}
