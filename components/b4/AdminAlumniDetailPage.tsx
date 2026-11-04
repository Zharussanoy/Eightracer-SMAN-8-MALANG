"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EyeOff, Pencil, Trash2, Upload } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { ApiError } from "@/lib/eightracer-api";
import { getAlumniDetail } from "@/lib/b4-alumni-api";
import type { AlumniDetail } from "@/lib/b4-alumni";
import B4Shell, { Avatar } from "./B4Shell";

const back = "/admin/alumni-perguruan-tinggi";
const missing = "Belum tersedia";
const money = (value: number | null) => value === null ? missing : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
type Result = { id: string; data?: AlumniDetail; error?: string };

export default function AdminAlumniDetailPage({ id }: { id?: string }) {
  const { authStatus, currentUser, refreshSession } = useUser();
  const allowed = authStatus === "authenticated" && currentUser.schoolStaff === true;
  const [result, setResult] = useState<Result | null>(null);
  const [retry, setRetry] = useState(0);
  const current = allowed && result?.id === id ? result : null;
  const alumni = current?.data;
  const validId = typeof id === "string" && /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));

  useEffect(() => {
    if (!allowed || !validId || !id) return;
    const controller = new AbortController();
    void getAlumniDetail(id, controller.signal).then(({ data }) => {
      if (!controller.signal.aborted) setResult({ id, data });
    }).catch((error) => {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) void refreshSession();
      setResult({ id, error: error instanceof Error ? error.message : "Detail alumni belum dapat dimuat." });
    });
    return () => controller.abort();
  }, [allowed, validId, id, retry, refreshSession]);

  const note = "Data induk alumni dibaca dari database sekolah. Penyimpanan dan impor progres kuliah belum diaktifkan pada tahap ini.";
  if (!alumni) return <B4Shell title="Informasi Detail Alumni" active="alumni" description="Kelola progress perkuliahan alumni." dataNote={note} parent={{ label: "Alumni di PT", href: back }}>
    <div className="bc4-empty" role={current?.error ? "alert" : "status"}>
      {!allowed ? authStatus === "loading" ? "Memeriksa sesi akun…" : "Data alumni hanya untuk admin atau Guru BK yang berwenang."
        : !validId ? "ID alumni tidak valid." : current?.error ?? "Memuat detail alumni sekolah…"}
      <p><Link href={back}>Kembali ke daftar alumni</Link></p>
      {allowed && validId && current?.error && <button type="button" className="bc4-button" onClick={() => setRetry((value) => value + 1)}>Coba lagi</button>}
    </div>
  </B4Shell>;

  const records = alumni.progress, latest = records[0];
  const kipk = latest?.kipk === true ? "Ya" : latest?.kipk === false ? "Tidak" : "Belum dikonfirmasi";
  const nisn = alumni.hasNisn ? "••••••••••" : missing;
  const scholarships = latest?.scholarships.filter((item) => item.status === "diterima" && item.name).map((item) => item.name).join(", ") || missing;
  return <B4Shell title="Informasi Detail Alumni" active="alumni" description="Kelola progress alumni selama menempuh pendidikan di Perguruan Tinggi berdasarkan periode." dataNote={note} parent={{ label: "Alumni di PT", href: back }}>
    <div className="bc4-detailOuter">
      <div className="bc4-profile" style={{ border: 0, padding: "0 0 24px", background: "transparent" }}>
        <Avatar name={alumni.name} example={false} /><div><h2>{alumni.name}</h2><p>NISN {nisn}</p></div>
      </div>
      <div className="bc4-grid2" style={{ marginTop: 24 }}>
        <section className="bc4-panel"><h2 className="bc4-underlined">Data Induk Alumni</h2>
          <dl className="bc4-infoList">{[
            ["Nama Lengkap", alumni.name], ["NISN", nisn],
            ["Kelas / Angkatan", `${alumni.classroom ?? 'Kelas belum tersedia'} / Lulus ${alumni.graduationYear ?? missing}`],
            ["Status Penerima KIP-K", kipk], ["Nama Perguruan Tinggi", alumni.university],
            ["Jenis Perguruan Tinggi", alumni.universityKind ?? missing], ["Program Studi", alumni.studyProgram],
            ["Jalur Masuk", alumni.admissionPath],
          ].map(([label, value]) => <div key={label} style={{ display: "contents" }}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </section>
        <section className="bc4-panel"><h2 className="bc4-underlined">Update Progress Kuliah</h2>
          <form onSubmit={(event) => event.preventDefault()}>
            <div className="bc4-grid2 bc4-progressFields">
              <label className="bc4-field">Periode / Semester *<select disabled value={latest?.id ?? ""} onChange={() => undefined}><option value="">Belum ada data</option>{records.map((record) => <option value={record.id} key={record.id}>{record.period ?? missing} (Semester {record.semester ?? "—"})</option>)}</select></label>
              <fieldset className="bc4-field" disabled><legend>Status Penerima KIP-K *</legend><div className="bc4-radios">{[true, false].map((value) => <label key={String(value)}><input type="radio" name="kipk" checked={latest?.kipk === value} readOnly />{value ? "Penerima" : "Bukan Penerima"}</label>)}</div></fieldset>
              <label className="bc4-field">IP-Kumulatif *<input disabled type="number" min="0" max="4" step="0.01" value={latest?.gpa ?? ""} placeholder={missing} /></label>
              <label className="bc4-field">Nama Beasiswa (Jika Ada)<select disabled value={scholarships} onChange={() => undefined}><option>{scholarships}</option></select></label>
              {(["ipi", "ukt"] as const).map((field) => <div className="bc4-field" key={field}><label htmlFor={`bc4-${field}`}>{field === "ukt" ? "UKT / Semester *" : "IPI (Khusus Mandiri)"}</label>
                <div className="bc4-moneyField"><button disabled type="button" aria-label="Pengaturan visibilitas belum diaktifkan"><EyeOff size={19} /></button><input disabled id={`bc4-${field}`} type="number" min="0" step="1" value={latest?.[field] ?? ""} placeholder={missing} /></div>
              </div>)}
            </div>
            <div className="bc4-actions" style={{ marginTop: 20 }}><button disabled className="bc4-button" type="button"><Upload size={17} />Sinkronkan Data</button><button disabled className="bc4-button bc4-primary" type="submit">Simpan</button></div>
          </form>
        </section>
      </div>
      <section className="bc4-panel" style={{ marginTop: 12 }}><h2 className="bc4-underlined">Riwayat Progress Perkuliahan</h2>
        <div className="b4-tableScroll"><table className="bc4-progressTable"><thead><tr>{["PERIODE SEMESTER", "IPK", "PENERIMA KIP-K", "BEASISWA TERDAFTAR", "UKT", "AKSI"].map((title) => <th key={title}>{title}</th>)}</tr></thead>
          <tbody>{records.map((record) => <tr key={record.id}>
            <td>{record.period ?? missing} (Semester {record.semester ?? "—"})</td><td>{record.gpa ?? missing}</td>
            <td>{record.kipk === true ? "Ya" : record.kipk === false ? "Tidak" : "Belum dikonfirmasi"}</td>
            <td>{record.scholarships.filter((item) => item.status === "diterima" && item.name).map((item) => item.name).join(", ") || missing}</td>
            <td>{money(record.ukt)}</td><td><div className="bc4-actions"><button disabled type="button" aria-label="Edit progres belum diaktifkan"><Pencil size={18} /></button><button disabled type="button" aria-label="Hapus progres belum diaktifkan"><Trash2 size={18} /></button></div></td>
          </tr>)}</tbody>
        </table>{!records.length && <p className="bc4-empty">Belum ada riwayat progress.</p>}</div>
      </section>
    </div>
  </B4Shell>;
}
