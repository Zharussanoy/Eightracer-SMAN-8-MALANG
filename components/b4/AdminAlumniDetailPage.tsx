"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Eye, EyeOff, Pencil, Trash2, Upload, X } from "lucide-react";
import B4Shell, { Avatar } from "./B4Shell";
import { ALUMNI, progressFor, rupiah, updateDemo, useDemoData, type Progress } from "./demoStore";
import { COLLEGE_ALUMNI } from "@/components/admin/b-4/mockData";
import { useUser } from "@/context/UserContext";
import AdminAlumniApi from "./AdminAlumniApi";

function period(semester: number) { return `${semester % 2 ? "Ganjil" : "Genap"} ${2024 + Math.floor((semester - 1) / 2)}/${2025 + Math.floor((semester - 1) / 2)}`; }
const blank = (semester = 4): Progress => ({ semester, period: period(semester), ipk: "", kipk: "Tidak", scholarship: "-", ukt: "", ipi: "0", showUkt: true, showIpi: false });
export default function AdminAlumniDetailPage({ id }: { id?: string }) {
  const { authStatus, authMessage, refreshSession } = useUser();
  if (authStatus === "authenticated") return <AdminAlumniApi timeline studentId={id} />;
  if (authStatus !== "anonymous") return <B4Shell title="Informasi Detail Alumni" active="alumni" description="Lihat riwayat pendidikan alumni." dataNote=""><p role="status">{authStatus === "loading" ? "Memeriksa sesi akun…" : authMessage}</p>{authStatus === "unavailable" && <button onClick={() => void refreshSession()}>Coba lagi</button>}</B4Shell>;
  return <AdminAlumniDetailDemo id={id} />;
}
function AdminAlumniDetailDemo({ id = "dian" }: { id?: string }) {
  const data = useDemoData();
  const row = COLLEGE_ALUMNI.find((item) => item.id === id);
  const alumni = ALUMNI.find((item) => item.id === id || item.name === row?.name);
  const [form, setForm] = useState<Progress>(blank());
  const [message, setMessage] = useState("");
  const [imported, setImported] = useState<Progress[]>([]);
  const [importError, setImportError] = useState("");
  const [filename, setFilename] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const upload = useRef<HTMLDialogElement>(null), confirmation = useRef<HTMLDialogElement>(null);
  const editor = useRef<HTMLFormElement>(null);
  if (!alumni) return <B4Shell title="Informasi Detail Alumni" active="alumni" description="Kelola progress perkuliahan alumni."><div className="bc4-empty">Alumni tidak ditemukan.</div></B4Shell>;
  const records = progressFor(data, alumni.id);
  const put = (updates: Progress[]) => updateDemo((current) => ({ ...current, progress: { ...current.progress, [alumni.id]: [...updates, ...progressFor(current, alumni.id).filter((item) => !updates.some((next) => next.semester === item.semester))].sort((a, b) => b.semester - a.semester) } }));
  const field = <K extends keyof Progress>(key: K, value: Progress[K]) => setForm((current) => ({ ...current, [key]: value }));
  async function parseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImported([]); setImportError(""); setFilename(file?.name ?? "");
    if (!file) return;
    if (!/\.xlsx?$/i.test(file.name) || file.size > 5 * 1024 * 1024) { setImportError("Pilih file .xlsx atau .xls berukuran maksimal 5 MB."); return; }
    setBusy(true);
    try {
      const XLSX = await import("xlsx");
      const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[book.SheetNames[0]], { defval: "" });
      if (!rows.length || rows.length > 8) throw new Error("Isi 1–8 baris progres untuk satu alumni pada lembar pertama.");
      const parsed = rows.map((raw, index) => {
        const row = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key.trim().toLowerCase(), String(value).trim()]));
        const semester = Number(row.semester), ipk = Number((row.ipk ?? "").replace(",", "."));
        const ukt = Number(row.ukt), ipi = Number(row.ipi || 0);
        if (!Number.isInteger(semester) || semester < 1 || semester > 8 || !row.ipk || !Number.isFinite(ipk) || ipk < 0 || ipk > 4 || !row.ukt || !Number.isFinite(ukt) || ukt < 0 || !Number.isFinite(ipi) || ipi < 0 || !["ya", "tidak"].includes((row.kipk ?? "").toLowerCase())) throw new Error(`Baris ${index + 2}: periksa semester (1–8), ipk (0–4), kipk (Ya/Tidak), serta nominal UKT/IPI tanpa titik pemisah.`);
        return { ...blank(semester), ipk: ipk.toFixed(2), kipk: row.kipk.toLowerCase() === "ya" ? "Ya" as const : "Tidak" as const, scholarship: row.beasiswa || "-", ukt: String(ukt), ipi: String(ipi), showUkt: false, showIpi: false };
      });
      if (new Set(parsed.map((item) => item.semester)).size !== parsed.length) throw new Error("Semester tidak boleh duplikat dalam satu file.");
      setImported(parsed);
    } catch (error) { setImportError(error instanceof Error ? error.message : "File tidak dapat dibaca. Gunakan template yang disediakan."); }
    finally { setBusy(false); }
  }
  async function template() {
    const XLSX = await import("xlsx");
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet([{ semester: 4, ipk: 3.84, kipk: "Tidak", beasiswa: "Beasiswa Unggulan", ukt: 5000000, ipi: 0 }]), "Progres");
    XLSX.writeFile(book, "template-progres-alumni.xlsx");
  }
  return <B4Shell title="Informasi Detail Alumni" active="alumni" description="Kelola progress alumni selama menempuh pendidikan di Perguruan Tinggi berdasarkan periode." parent={{ label: "Alumni di PT", href: "/admin/alumni-perguruan-tinggi" }}><div className="bc4-detailOuter"><div className="bc4-profile" style={{ border: 0, padding: "0 0 24px", background: "transparent" }}><Avatar name={alumni.name} /><div><h2>{alumni.name}</h2><p>NISN ••••••••••</p></div></div><div className="bc4-grid2" style={{ marginTop: 24 }}><section className="bc4-panel"><h2 className="bc4-underlined">Data Induk Alumni</h2><dl className="bc4-infoList">{[["Nama Lengkap", alumni.name], ["NISN", "••••••••••"], ["Kelas / Angkatan", `${alumni.classroom} / ${alumni.cohort}`], ["Status Penerima KIP-K", alumni.scholarship === "KIP-Kuliah" ? "Ya" : "Tidak"], ["Nama Perguruan Tinggi", alumni.university], ["Jenis Perguruan Tinggi", "Perguruan Tinggi Negeri (PTN)"], ["Program Studi", alumni.program], ["Jalur Masuk", alumni.admission]].map(([label, value]) => <div key={label} style={{ display: "contents" }}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section><section className="bc4-panel"><h2 className="bc4-underlined">Update Progress Kuliah</h2><form ref={editor} onSubmit={(event) => { event.preventDefault(); put([form]); setMessage(`Progress semester ${form.semester} tersimpan di browser.`); }}><div className="bc4-grid2 bc4-progressFields"><label className="bc4-field">Periode / Semester *<select value={form.semester} onChange={(event) => { const semester = Number(event.target.value); setForm(records.find((item) => item.semester === semester) ?? blank(semester)); }}>{Array.from({ length: 8 }, (_, index) => index + 1).map((number) => <option value={number} key={number}>{period(number)} (Semester {number})</option>)}</select></label><fieldset className="bc4-field"><legend>Status Penerima KIP-K *</legend><div className="bc4-radios">{(["Ya", "Tidak"] as const).map((value) => <label key={value}><input type="radio" name="kipk" checked={form.kipk === value} onChange={() => field("kipk", value)} />{value === "Ya" ? "Penerima" : "Bukan Penerima"}</label>)}</div></fieldset><label className="bc4-field">IP-Kumulatif *<input required type="number" min="0" max="4" step="0.01" value={form.ipk} onChange={(event) => field("ipk", event.target.value)} /></label><label className="bc4-field">Nama Beasiswa (Jika Ada)<select value={form.scholarship} onChange={(event) => field("scholarship", event.target.value)}><option value="-">Tidak ada</option>{[...new Set([...data.catalog.filter((item) => !item.archived).map((item) => item.name), ...(form.scholarship !== "-" ? [form.scholarship] : [])])].map((name) => <option key={name}>{name}</option>)}</select></label>{(["ipi", "ukt"] as const).map((key) => {
    const visibility = key === "ukt" ? "showUkt" : "showIpi";
    return <div className="bc4-field" key={key}><label htmlFor={`bc4-${key}`}>{key === "ukt" ? "UKT / Semester *" : "IPI (Khusus Mandiri)"}</label><div className="bc4-moneyField"><button type="button" aria-label={`${form[visibility] ? "Sembunyikan" : "Tampilkan"} ${key.toUpperCase()} dari siswa`} aria-pressed={form[visibility]} onClick={() => field(visibility, !form[visibility])}>{form[visibility] ? <Eye size={19} /> : <EyeOff size={19} />}</button><input id={`bc4-${key}`} type="number" required={key === "ukt"} min="0" step="1" value={form[key]} onChange={(event) => field(key, event.target.value)} /></div><small>{form[visibility] ? "Ditampilkan kepada siswa" : "Disembunyikan dari siswa"}</small></div>;
  })}</div><div className="bc4-actions" style={{ marginTop: 20 }}><button className="bc4-button" type="button" onClick={() => { setImported([]); setImportError(""); setFilename(""); upload.current?.showModal(); }}><Upload size={17} />Sinkronkan Data</button><button className="bc4-button bc4-primary" type="submit">Simpan</button></div></form></section></div>{message && <p className="bc4-status" role="status">{message}</p>}<section className="bc4-panel" style={{ marginTop: 12 }}><h2 className="bc4-underlined">Riwayat Progress Perkuliahan</h2><div className="b4-tableScroll"><table className="bc4-progressTable"><thead><tr>{["PERIODE SEMESTER", "IPK", "PENERIMA KIP-K", "BEASISWA TERDAFTAR", "UKT", "AKSI"].map((title) => <th key={title}>{title}</th>)}</tr></thead><tbody>{records.map((record) => <tr key={record.semester}><td>{record.period} (Semester {record.semester})</td><td>{record.ipk}</td><td>{record.kipk}</td><td>{record.scholarship}</td><td>{rupiah(record.ukt)}</td><td><div className="bc4-actions"><button type="button" aria-label={`Edit semester ${record.semester}`} onClick={() => { setForm(record); editor.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><Pencil size={18} /></button><button type="button" aria-label={`Hapus semester ${record.semester}`} onClick={() => { setDeleting(record.semester); confirmation.current?.showModal(); }}><Trash2 size={18} /></button></div></td></tr>)}</tbody></table>{!records.length && <p className="bc4-empty">Belum ada riwayat progress.</p>}</div></section></div>
    <dialog className="bc4-dialog" ref={upload}><div className="bc4-dialogTitle"><h2>Sinkronkan Data Progress Kuliah</h2><button type="button" aria-label="Tutup unggah" onClick={() => upload.current?.close()}><X /></button></div><div className="bc4-dialogBody"><p style={{ marginBottom: 18 }}>Unggah spreadsheet untuk <strong>{alumni.name}</strong>. Data semester yang sama akan diperbarui. Nominal dari impor disembunyikan dari siswa sampai kamu mengaktifkannya.</p><label className="bc4-dropzone"><Upload size={50} /><strong>Pilih File Spreadsheet</strong><span>.xlsx / .xls · maksimal 5 MB</span><input aria-label="File spreadsheet progres" key={filename ? "selected" : "empty"} type="file" accept=".xlsx,.xls" onChange={parseFile} /></label><button type="button" className="bc4-button" style={{ marginTop: 15 }} onClick={template}>Unduh template Excel</button>{busy && <p role="status">Membaca file…</p>}{importError && <p className="bc4-status" role="alert">{importError}</p>}{imported.length > 0 && <div className="bc4-importPreview"><h3>{filename} · {imported.length} baris siap disimpan</h3>{imported.map((record) => <p key={record.semester}>Semester {record.semester} · IPK {record.ipk} · {record.scholarship} · {rupiah(record.ukt)}</p>)}</div>}<div className="bc4-actions" style={{ marginTop: 20 }}><button type="button" className="bc4-button" onClick={() => upload.current?.close()}>Batal</button><button type="button" className="bc4-button bc4-primary" disabled={!imported.length || busy} onClick={() => { put(imported); setForm(imported[0]); setMessage(`${imported.length} baris progress dari ${filename} tersimpan di browser.`); upload.current?.close(); }}>Simpan</button></div></div></dialog>
    <dialog ref={confirmation} className="bc4-dialog"><div className="bc4-dialogTitle"><h2>Hapus riwayat semester {deleting}?</h2></div><div className="bc4-dialogBody"><p>Riwayat ini akan dihapus dari pratinjau lokal.</p><div className="bc4-actions"><button className="bc4-button" onClick={() => confirmation.current?.close()}>Batal</button><button className="bc4-button bc4-primary" onClick={() => { updateDemo((current) => ({ ...current, progress: { ...current.progress, [alumni.id]: progressFor(current, alumni.id).filter((item) => item.semester !== deleting) } })); setMessage(`Riwayat semester ${deleting} dihapus.`); confirmation.current?.close(); }}>Hapus</button></div></div></dialog>
  </B4Shell>;
}
