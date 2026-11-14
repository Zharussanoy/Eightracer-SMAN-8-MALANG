"use client";

import { scholarshipEvidenceLabel, kipEvidenceLabel, kipStatusLabel } from "@/lib/b4-scholarship-evidence";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { ApiError } from "@/lib/eightracer-api";
import { archiveAlumniProgress, getAlumniDetail, saveAlumniProgress } from "@/lib/b4-alumni-api";
import type { AlumniDetail, AlumniProgressRow } from "@/lib/b4-alumni";
import { blankProgress, newProgressForAlumni, progressScholarshipOptions, educationStatusLabels, formFromProgress, progressPayload, type ProgressForm } from "@/lib/b4-progress";
import B4Shell, { Avatar } from "./B4Shell";
import { displayTitle } from "@/lib/display-copy";

const back = "/admin/alumni-perguruan-tinggi", missing = "-";
const money = (value: number | null) => value === null ? missing : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
type Result = { id: string; data?: AlumniDetail; error?: string };
const explain = (error: unknown) => error instanceof ApiError ? [error.message, ...Object.values(error.errors).flat()].join(" ") : error instanceof Error ? error.message : "Permintaan belum berhasil.";

export default function AdminAlumniDetailPage({ id }: { id?: string }) {
  const { authStatus, currentUser, refreshSession } = useUser();
  const allowed = authStatus === "authenticated" && currentUser.schoolStaff === true;
  const [result, setResult] = useState<Result | null>(null), [retry, setRetry] = useState(0);
  const [form, setForm] = useState<ProgressForm>(blankProgress), [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(""), [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<AlumniProgressRow | null>(null);
  const confirm = useRef<HTMLDialogElement>(null), editor = useRef<HTMLFormElement>(null);
  const current = allowed && result?.id === id ? result : null, alumni = current?.data;
  const validId = typeof id === "string" && /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));

  useEffect(() => {
    if (!allowed || !validId || !id) return;
    const controller = new AbortController();
    void getAlumniDetail(id, controller.signal).then(({ data }) => {
      if (!controller.signal.aborted) { setResult({ id, data }); setForm(newProgressForAlumni(data)); }
    }).catch((error) => {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) void refreshSession();
      setResult({ id, error: explain(error) });
    });
    return () => controller.abort();
  }, [allowed, validId, id, retry, refreshSession]);
  const field = <K extends keyof ProgressForm>(key: K, value: ProgressForm[K]) => setForm((previous) => ({ ...previous, [key]: value }));
  const refresh = () => setRetry((value) => value + 1);
  function failure(error: unknown) { if (error instanceof ApiError && error.status === 401) void refreshSession(); return explain(error); }
  function edit(row: AlumniProgressRow) { setForm(formFromProgress(row)); setFormError(""); setMessage(""); editor.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!id || !alumni || saving) return;
    setFormError(""); setMessage("");
    try {
      const payload = progressPayload(form, alumni.progress.find((row) => row.id === form.id), alumni.admissionPath === "Mandiri");
      setSaving(true); await saveAlumniProgress(id, form.id, payload);
      setMessage(form.id ? "Koreksi progres tersimpan di database; versi sebelumnya tetap dicatat." : "Progres tersimpan di database.");
      refresh();
    } catch (error) { setFormError(failure(error)); } finally { setSaving(false); }
  }
  async function archive() {
    if (!id || !deleting || saving) return;
    setSaving(true);
    try { await archiveAlumniProgress(id, deleting.id); confirm.current?.close(); setDeleting(null); setMessage("Riwayat diarsipkan; jejak perubahan tetap tersimpan."); refresh(); }
    catch (error) { setMessage(failure(error)); } finally { setSaving(false); }
  }

  if (!alumni) return <B4Shell title="Informasi Detail Alumni" active="alumni" description="Kelola progres perkuliahan alumni." parent={{ label: "Alumni di PT", href: back }}>
    <div className="bc4-empty" role={current?.error ? "alert" : "status"}>
      {!allowed ? authStatus === "loading" ? "Memeriksa sesi akun…" : "Data alumni hanya untuk admin atau Guru BK yang berwenang."
        : !validId ? "ID alumni tidak valid." : current?.error ?? "Memuat detail alumni sekolah…"}
      <p><Link href={back}>Kembali ke daftar alumni</Link></p>
      {allowed && validId && current?.error && <button type="button" className="bc4-button" onClick={refresh}>Coba Lagi</button>}
    </div>
  </B4Shell>;

  const records = alumni.progress, latest = records[0], selected = records.find((row) => row.id === form.id);
  const kipk = kipEvidenceLabel(alumni.scholarshipEvidence);
  const nisn = alumni.hasNisn ? "••••••••••" : missing;
  const catalogs = progressScholarshipOptions(alumni);
  const mandiri = alumni.admissionPath === "Mandiri";
  return <B4Shell title="Informasi Detail Alumni" active="alumni" description="Kelola progres alumni selama menempuh pendidikan di Perguruan Tinggi berdasarkan periode." parent={{ label: "Alumni di PT", href: back }}>
    <div className="bc4-detailOuter">
      <div className="bc4-profile" style={{ border: 0, padding: "0 0 24px", background: "transparent" }}><Avatar name={alumni.name} example={false} /><div><h2>{displayTitle(alumni.name)}</h2><p>NISN {nisn}</p></div></div>
      <div className="bc4-grid2" style={{ marginTop: 24 }}>
        <section className="bc4-panel"><h2 className="bc4-underlined">Data Induk Alumni</h2>
          <dl className="bc4-infoList">{[
            ["Nama Lengkap", alumni.name], ["NISN", nisn],
            ["Kelas / Angkatan", `${alumni.classroom ?? missing} / ${alumni.graduationYear ?? missing}`],
            ["Status Penerima KIP-K", kipk], ["Beasiswa / Bantuan Tercatat", scholarshipEvidenceLabel(alumni.scholarshipEvidence)], ["Nama Perguruan Tinggi", alumni.university],
            ["Jenis Perguruan Tinggi", alumni.universityKind ?? missing], ["Program Studi", alumni.studyProgram], ["Jalur Masuk", alumni.admissionPath ?? missing],
          ].map(([label, value]) => <div key={label} style={{ display: "contents" }}><dt>{displayTitle(label)}</dt><dd>{displayTitle(value ?? "-")}</dd></div>)}</dl>
        </section>
        <section className="bc4-panel"><h2 className="bc4-underlined">{form.id ? "Edit Progress Kuliah" : "Update Progress Kuliah"}</h2>
          <form ref={editor} onSubmit={save}>
            <div className="bc4-grid2 bc4-progressFields">
              <label className="bc4-field">Periode *<input required disabled={saving || !!form.id} maxLength={50} placeholder="Contoh format: Ganjil 2026/2027" value={form.period} onChange={(event) => field("period", event.target.value)} /></label>
              <label className="bc4-field">Semester *<input required disabled={saving} type="number" min="1" max="40" step="1" placeholder="Isi semester saat ini" value={form.semester} onChange={(event) => field("semester", event.target.value)} /></label>
              <label className="bc4-field">Status Pendidikan *<select required disabled={saving} value={form.status} onChange={(event) => field("status", event.target.value)}><option value="">Pilih Status</option>{Object.entries(educationStatusLabels).map(([value, label]) => <option key={value} value={value}>{displayTitle(label)}</option>)}</select></label>
              <label className="bc4-field">Tanggal Pembaruan *<input required disabled={saving} type="date" value={form.date} onChange={(event) => field("date", event.target.value)} /></label>
              <fieldset className="bc4-field" disabled={saving}><legend>Status Penerima KIP-K</legend><div className="bc4-radios">{[["", kipStatusLabel(null)], ["1", kipStatusLabel(true)], ["0", kipStatusLabel(false)]].map(([value, label]) => <label key={value}><input type="radio" name="kipk" checked={form.kipk === value} onChange={() => field("kipk", value)} />{displayTitle(label)}</label>)}</div></fieldset>
              <label className="bc4-field">IP-Kumulatif<input disabled={saving} type="number" min="0" max="4" step="0.01" value={form.gpa} placeholder={missing} onChange={(event) => field("gpa", event.target.value)} /></label>
              <fieldset className="bc4-field" disabled={saving || !catalogs.size}><legend>Beasiswa yang Diterima (Jika Ada)</legend><div className="bc4-progressAwards">{[...catalogs].map(([value,name])=><label key={value}><input type="checkbox" checked={form.awardIds.includes(String(value))} onChange={e=>field("awardIds",e.target.checked?[...form.awardIds,String(value)]:form.awardIds.filter(id=>id!==String(value)))}/><span>{displayTitle(name)}</span></label>)}{!catalogs.size&&<span>-</span>}</div><small>Pilihan mengikuti catatan terakhir; sesuaikan untuk periode yang diisi. Boleh lebih dari satu.</small></fieldset>
              {(["ipi", "ukt"] as const).map((key) => <div className="bc4-field" key={key}><label htmlFor={`bc4-${key}`}>{key === "ukt" ? "UKT / Semester" : "IPI (Khusus Mandiri)"}</label>
                <div className="bc4-moneyField"><span aria-hidden="true">Rp</span><input disabled={saving || (key === "ipi" && !mandiri)} id={`bc4-${key}`} type="number" min="0" step="0.01" value={form[key]} placeholder={missing} onChange={(event) => field(key, event.target.value)} /></div>
              </div>)}
            </div>
            {formError && <p className="bc4-status" role="alert">{formError}</p>}
            <div className="bc4-actions" style={{ marginTop: 20 }}><button disabled={saving} className="bc4-button bc4-primary" type="submit">{saving ? "Menyimpan…" : "Simpan"}</button>{form.id && <button type="button" className="bc4-button" onClick={() => { setForm(newProgressForAlumni(alumni)); setFormError(""); }}>Batal Edit</button>}</div>
          </form>
        </section>
      </div>
      {message && <p className="bc4-status" role="status">{message}</p>}
      <section className="bc4-panel" style={{ marginTop: 12 }}><h2 className="bc4-underlined">Riwayat Progres Perkuliahan</h2>
        <div className="b4-tableScroll"><table className="bc4-progressTable"><thead><tr>{["PERIODE SEMESTER", "IPK", "PENERIMA KIP-K", "BEASISWA TERDAFTAR", "UKT", "AKSI"].map((title) => <th key={title}>{displayTitle(title)}</th>)}</tr></thead><tbody>{records.map((row) => <tr key={row.id}>
          <td>{row.period ?? missing} (Semester {row.semester ?? missing})</td><td>{row.gpa ?? missing}</td><td>{kipStatusLabel(row.kipk)}</td>
          <td>{row.scholarships.map((award) => `${award.name ?? missing} (${award.status})`).join(", ") || missing}</td><td>{money(row.ukt)}</td>
          <td><div className="bc4-actions"><button disabled={saving} type="button" aria-label={`Edit semester ${row.semester}`} onClick={() => edit(row)}><Pencil size={18} /></button><button disabled={saving} type="button" aria-label={`Arsipkan semester ${row.semester}`} onClick={() => { setDeleting(row); confirm.current?.showModal(); }}><Trash2 size={18} /></button></div></td>
        </tr>)}</tbody></table>{!records.length && <p className="bc4-empty">-</p>}</div>
      </section>
    </div>
    <dialog ref={confirm} className="bc4-dialog"><div className="bc4-dialogTitle"><h2>Arsipkan Riwayat {deleting?.period}?</h2></div><div className="bc4-dialogBody"><p>Riwayat tidak ditampilkan sebagai progres aktif; jejak datanya tetap disimpan.</p><div className="bc4-actions"><button disabled={saving} type="button" className="bc4-button" onClick={() => confirm.current?.close()}>Batal</button><button disabled={saving} type="button" className="bc4-button bc4-primary" onClick={() => void archive()}>Arsipkan</button></div></div></dialog>
  </B4Shell>;
}
