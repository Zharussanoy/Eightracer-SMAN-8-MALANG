"use client";

import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, CircleAlert, Eye, EyeOff, GraduationCap, RefreshCw, Search, Send, Sparkles, X } from "lucide-react";
import B4Shell, { Avatar } from "./B4Shell";
import { STUDENTS, makeDemoRecommendations, updateDemo, useDemoData, type Recommendation } from "./demoStore";
import { RecommendationEvaluation } from "./RecommendationParts";
import { useUser } from "@/context/UserContext";
import AdminRecommendationsApi from "./AdminRecommendationsApi";
import { displayTitle } from "@/lib/display-copy";

export default function AdminRecommendationsPage() {
  const { authStatus, authMessage, refreshSession } = useUser();
  if (authStatus === "authenticated") return <AdminRecommendationsApi />;
  if (authStatus !== "anonymous") return <B4Shell title="Rekomendasi Beasiswa" description="Pelajari pratinjau rekomendasi siswa." dataNote=""><p role="status">{authStatus === "loading" ? "Memeriksa sesi akun…" : authMessage}</p>{authStatus === "unavailable" && <button onClick={() => void refreshSession()}>Coba Lagi</button>}</B4Shell>;
  return <AdminRecommendationsDemo />;
}
function AdminRecommendationsDemo() {
  const data = useDemoData();
  const [query, setQuery] = useState("Nadia Putri Wicaksono");
  const [classroom, setClassroom] = useState("");
  const [cohort, setCohort] = useState("");
  const [publication, setPublication] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Recommendation | null>(null);
  const [reason, setReason] = useState("");
  const [timing, setTiming] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const editor = useRef<HTMLDialogElement>(null), confirmation = useRef<HTMLDialogElement>(null);
  const student = STUDENTS.find((item) => item.name.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")) && (!classroom || item.classroom === classroom) && (!cohort || item.cohort === cohort) && (!publication || String(data.students[item.id]?.published) === publication));
  const review = student ? data.students[student.id] : undefined;
  const items = review?.items ?? [];
  const editedCatalog = data.catalog.find((item) => item.id === editing?.scholarshipId);
  const validItems = items.filter((item) => !item.hidden && data.catalog.some((catalog) => catalog.id === item.scholarshipId && !catalog.archived));

  const changeItems = (update: (items: Recommendation[]) => Recommendation[]) => {
    if (!student) return;
    updateDemo((current) => ({ ...current, students: { ...current.students, [student.id]: { published: false, items: update(current.students[student.id]?.items ?? []) } } }));
  };
  const edit = (item: Recommendation) => { setEditing(item); setReason(item.reason); setTiming(item.timing); editor.current?.showModal(); };
  const save = (event: FormEvent) => { event.preventDefault(); if (!editing || !reason.trim() || !timing.trim()) return; changeItems((records) => records.map((item) => item.id === editing.id ? { ...item, reason: reason.trim(), timing: timing.trim() } : item)); editor.current?.close(); setStatus("Perubahan disimpan sebagai draft. Tinjau dan publikasikan kembali agar terlihat oleh siswa."); };

  return <B4Shell title="Rekomendasi Beasiswa" description="Tinjau rekomendasi beasiswa dan publikasikan hasil yang sesuai kepada siswa.">
    <div className="bc4-filterRow"><label className="b4-searchField"><Search size={22} /><span className="b4-srOnly">Cari nama siswa</span><input aria-label="Cari nama siswa" type="search" list="bc4-students" value={query} placeholder="Cari nama siswa" onChange={(event) => { setQuery(event.target.value); setStatus(""); }} /><datalist id="bc4-students">{STUDENTS.map((item) => <option key={item.id} value={item.name} />)}</datalist></label>
      <label className="b4-selectField"><select aria-label="Kelas siswa" value={classroom} onChange={(event) => setClassroom(event.target.value)}><option value="">Semua Kelas</option>{[...new Set(STUDENTS.map((item) => item.classroom))].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="b4-selectField"><select aria-label="Angkatan siswa" value={cohort} onChange={(event) => setCohort(event.target.value)}><option value="">Semua Angkatan</option><option>2023</option><option>2022</option></select></label>
      <label className="b4-selectField"><select aria-label="Status publikasi" value={publication} onChange={(event) => setPublication(event.target.value)}><option value="">Semua Status</option><option value="false">Rekomendasi Belum Dirilis</option><option value="true">Sudah Dipublikasikan</option></select></label>
    </div>
    {!student || !review ? <div className="bc4-empty">Tidak ada siswa yang sesuai.<button className="bc4-button" onClick={() => { setQuery(""); setClassroom(""); setCohort(""); setPublication(""); }}>Reset Filter</button></div> : <>
      <div className="bc4-profileRow"><div className="bc4-profile"><Avatar name={student.name} /><div><h2>{displayTitle(student.name)}</h2><p>{student.classroom} · Angkatan {student.cohort}</p><p>NISN ••••••••••</p></div></div><section className="bc4-current"><h3>Status Rekomendasi</h3><dl className="bc4-metrics"><div><dt>Status</dt><dd>{review.published ? "Ditinjau" : "Draft"}</dd></div><div><dt>Jumlah</dt><dd>{validItems.length} Beasiswa</dd></div><div><dt>Publikasi</dt><dd>{review.published ? "Sudah Rilis" : "Belum Rilis"}</dd></div></dl></section></div>
      <section className="bc4-section"><h2 className="bc4-sectionHeading">Kelengkapan Data Siswa</h2><div className="bc4-sectionBody"><div className="bc4-grid3">{[
        ["Kelengkapan Data Siswa", "Rapor semester 1–5 tersedia. Piagam prestasi contoh tercatat pada profil siswa."],
        ["Asesmen RIASEC", "Dominan Investigative (84) & Artistic (72). Relevan untuk sains, komputasi, dan rekayasa data."],
        ["Latar Belakang Ekonomi", "Dokumen finansial belum tersedia. Parameter ini memerlukan verifikasi lebih lanjut."],
      ].map(([title, text], index) => <article className="bc4-yellowCard" key={title}><div className="bc4-splitTitle"><h3>{displayTitle(title)}</h3><span className={`bc4-badge ${index === 2 ? "bc4-badgeWarning" : ""}`}>{index < 2 && <CheckCircle2 size={12} />}{index === 2 ? "Belum Lengkap" : "Tersedia"}</span></div><p>{text}</p></article>)}</div><aside className="bc4-note" style={{ marginTop: 20 }}><Sparkles size={22} /><div><h3>Prinsip AI Eightracer</h3><p>Kriteria ditinjau berdasarkan data yang tersedia. Dokumen pendukung yang belum tersedia perlu diverifikasi dan tidak otomatis menggagalkan peluang siswa.</p></div></aside></div></section>
      <section className="bc4-section"><h2 className="bc4-sectionHeading">Hasil Rekomendasi Beasiswa<button className="bc4-button" type="button" onClick={() => { changeItems(() => makeDemoRecommendations(data.catalog, student.id)); setStatus("Contoh rekomendasi disusun ulang menjadi draft. Proses ini belum memakai layanan AI."); }}><RefreshCw size={16} />Generate Ulang</button></h2><div className="bc4-sectionBody">
        {items.map((item) => { const catalog = data.catalog.find((entry) => entry.id === item.scholarshipId); if (!catalog) return null; return <article key={item.id} className={`bc4-recommendation ${item.hidden || catalog.archived ? "bc4-recommendationHidden" : ""}`}>
          <header className="bc4-recommendationHeader"><div><h3>{displayTitle(catalog.name)}</h3><p>{displayTitle(catalog.provider)}{catalog.archived ? " · Program diarsipkan" : ""}</p></div><div className="bc4-score"><span>Skor Kecocokan AI (contoh)</span><strong>{item.score}/100</strong></div></header>
          <div className="bc4-recBody"><div><h4>Alasan Kecocokan AI</h4><p>{item.reason}</p><div className="bc4-evaluation"><GraduationCap size={30} /><span>Data contoh jejak alumni digunakan sebagai referensi perjalanan pendidikan.</span></div><div className="bc4-pair"><div className="bc4-yellowCard"><p>Periode Pendaftaran</p><strong>{catalog.applyPeriod}</strong></div><div className="bc4-yellowCard"><p>Tipe Pendanaan</p><strong>{catalog.funding}</strong></div></div></div><div><h4>Evaluasi Kriteria Siswa</h4><RecommendationEvaluation /></div></div>
          <footer className="bc4-recFooter"><span>{item.hidden ? "Disembunyikan dari publikasi" : catalog.archived ? "Program tidak aktif" : "● Sesuai dengan kriteria yang tersedia (contoh)"}</span><div className="bc4-actions"><button type="button" className="bc4-button" onClick={() => { changeItems((records) => records.map((record) => record.id === item.id ? { ...record, hidden: !record.hidden } : record)); setStatus("Visibilitas diperbarui. Publikasikan kembali untuk memperbarui tampilan siswa."); }}>{item.hidden ? <Eye size={16} /> : <EyeOff size={16} />}{item.hidden ? "Tampilkan" : "Sembunyikan"}</button><button className="bc4-button" type="button" onClick={() => edit(item)}>Edit</button><button className="bc4-button bc4-danger" type="button" onClick={() => { setDeleting(item.id); confirmation.current?.showModal(); }}>Hapus</button></div></footer>
        </article>; })}
        {!items.length && <div className="bc4-empty">Belum ada rekomendasi. Gunakan Generate Ulang untuk memuat contoh dari katalog aktif.</div>}
        <aside className="bc4-note"><CircleAlert size={25} /><div><h3>Catatan Sistem</h3><p>Tinjau seluruh rekomendasi sebelum dipublikasikan. Draft dan rekomendasi tersembunyi tidak ditampilkan pada portal siswa.</p></div><button type="button" disabled={!validItems.length} className="bc4-button bc4-primary" onClick={() => { updateDemo((current) => ({ ...current, students: { ...current.students, [student.id]: { ...current.students[student.id], published: true } } })); setStatus(`Rekomendasi ${displayTitle(student.name)} telah dipublikasikan pada pratinjau siswa.`); }}><Send size={18} />Publikasikan ke Siswa</button></aside>
      </div></section>
    </>}
    <p className="bc4-status" role="status">{status}</p>

    <dialog ref={editor} className="bc4-dialog" aria-labelledby="bc4-edit-recommendation-title"><header className="bc4-dialogTitle"><h2 id="bc4-edit-recommendation-title">Edit Rekomendasi Beasiswa</h2><button className="bc4-iconButton" type="button" aria-label="Tutup edit rekomendasi" onClick={() => editor.current?.close()}><X /></button></header><form className="bc4-dialogBody bc4-fields" onSubmit={save}>
      <section className="bc4-readonly"><h3>Informasi Referensi · Read Only</h3><div className="bc4-pair"><div className="bc4-yellowCard"><p>Nama Beasiswa</p><strong>{displayTitle(editedCatalog?.name)}</strong></div><div className="bc4-yellowCard"><p>Skor Kecocokan AI (contoh)</p><strong>{editing?.score}/100</strong></div></div><h3>Evaluasi Kriteria Beasiswa</h3><RecommendationEvaluation /><p>Data master dikelola melalui Basis Data Beasiswa. Skor tidak dapat diubah dari formulir ini.</p></section>
      <label className="bc4-field">Alasan Kecocokan<textarea required value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1500} /></label><label className="bc4-field">Waktu yang Disarankan untuk Mendaftar<input required value={timing} onChange={(event) => setTiming(event.target.value)} maxLength={180} /></label><div className="bc4-actions"><button type="button" className="bc4-button" onClick={() => editor.current?.close()}>Batal</button><button type="submit" className="bc4-button bc4-primary">Simpan</button></div>
    </form></dialog>
    <dialog ref={confirmation} className="bc4-dialog" style={{ maxWidth: 480 }} aria-labelledby="bc4-delete-title"><div className="bc4-dialogBody"><h2 id="bc4-delete-title" style={{ fontWeight: 700, fontSize: 23 }}>Hapus Rekomendasi?</h2><p style={{ margin: "16px 0" }}>Rekomendasi ini akan dihapus dari daftar pratinjau siswa tersebut.</p><div className="bc4-actions"><button type="button" className="bc4-button" onClick={() => confirmation.current?.close()}>Batal</button><button type="button" className="bc4-button bc4-primary" onClick={() => { changeItems((records) => records.filter((item) => item.id !== deleting)); confirmation.current?.close(); setStatus("Rekomendasi dihapus dari draft."); }}>Hapus Rekomendasi</button></div></div></dialog>
  </B4Shell>;
}
