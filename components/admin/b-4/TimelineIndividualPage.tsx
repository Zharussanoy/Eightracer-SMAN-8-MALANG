"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Building2, ChevronDown, ChevronRight, FileText, GraduationCap, School, Search } from "lucide-react";
import B4Navbar from "./B4Navbar";
import B4Tabs from "./B4Tabs";
import { SEMESTERS, TIMELINE_STUDENTS } from "./timelineData";
import "./college.css";

function SelectField({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return <label className="b4-selectField">
    <span className="b4-srOnly">{label}</span>
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option || label}</option>)}
    </select>
    <ChevronDown size={18} aria-hidden="true" />
  </label>;
}

export default function TimelineIndividualPage() {
  const [search, setSearch] = useState(TIMELINE_STUDENTS[0].name);
  const [university, setUniversity] = useState(TIMELINE_STUDENTS[0].university);
  const [program, setProgram] = useState(TIMELINE_STUDENTS[0].studyProgram);
  const [admission, setAdmission] = useState(TIMELINE_STUDENTS[0].admissionPath);
  const [selectedSemester, setSelectedSemester] = useState(2);
  const [semesterRecords, setSemesterRecords] = useState(SEMESTERS);
  const [manageOpen, setManageOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const filteredStudents = useMemo(() => TIMELINE_STUDENTS.filter((student) =>
    student.name.toLocaleLowerCase("id").includes(search.trim().toLocaleLowerCase("id")) &&
    (!university || student.university === university) &&
    (!program || student.studyProgram === program) &&
    (!admission || student.admissionPath === admission)
  ), [search, university, program, admission]);
  const student = filteredStudents[0] ?? TIMELINE_STUDENTS[0];
  const semester = semesterRecords.find((item) => item.number === selectedSemester) ?? semesterRecords[1];

  useEffect(() => {
    if (manageOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [manageOpen]);

  const updateSemester = (field: "ipk" | "scholarship" | "ukt" | "kipk", value: string) => {
    setSemesterRecords((records) => records.map((item) => item.number === selectedSemester ? { ...item, [field]: value } : item));
  };

  return <div className="b4-page">
    <B4Navbar />
    <main>
      <section className="b4-hero" aria-labelledby="b4-page-title">
        <div className="b4-container">
          <nav aria-label="Breadcrumb" className="b4-breadcrumb">
            <Link href="/admin#layanan">Layanan</Link><ChevronRight size={14} aria-hidden="true" />
            <span>Alumni dan Beasiswa</span><ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">Timeline Individu</span>
          </nav>
          <h1 id="b4-page-title">Timeline Individu</h1>
          <p>Lihat perjalanan pendidikan dan perkembangan kuliah alumni dari masa sekolah hingga kondisi terkini.</p>
        </div>
      </section>

      <div className="b4-container">
        <B4Tabs active="Timeline individu" />
        <section className="b4-timelinePage" aria-label="Timeline pendidikan alumni">
          <div className="b4-timelineFilters">
            <label className="b4-searchField">
              <Search size={22} aria-hidden="true" /><span className="b4-srOnly">Cari nama alumni</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Cari nama alumni" />
            </label>
            <SelectField label="Perguruan Tinggi" value={university} options={["", ...new Set(TIMELINE_STUDENTS.map((item) => item.university))]} onChange={setUniversity} />
            <SelectField label="Program Studi" value={program} options={["", ...new Set(TIMELINE_STUDENTS.map((item) => item.studyProgram))]} onChange={setProgram} />
            <SelectField label="Jalur Masuk" value={admission} options={["", ...new Set(TIMELINE_STUDENTS.map((item) => item.admissionPath))]} onChange={setAdmission} />
          </div>
          {filteredStudents.length === 0 && <p className="b4-timelineStatus" role="status">Tidak ada hasil. Profil contoh ditampilkan; ubah pencarian atau filter untuk menemukan alumni.</p>}

          <section className="b4-studentSummary" aria-label={`Ringkasan ${student.name}`}>
            <div className="b4-studentIdentity">
              <div className="b4-studentAvatar" aria-hidden="true">
                <svg viewBox="0 0 100 100" role="presentation">
                  <defs><linearGradient id="b4-avatar-bg" x2="1" y2="1"><stop stopColor="#f7ebfa" /><stop offset="1" stopColor="#d8c2e8" /></linearGradient></defs>
                  <rect width="100" height="100" fill="url(#b4-avatar-bg)" />
                  <path d="M19 100V57c0-24 10-40 31-40s31 16 31 40v43" fill="#38223d" />
                  <path d="M32 43c0-15 7-23 18-23s18 8 18 23v15c0 15-8 25-18 25S32 73 32 58z" fill="#e9b99d" />
                  <path d="M31 45c1-20 9-29 21-29 14 0 22 11 20 31-5-2-8-8-9-15-9 9-20 12-32 13z" fill="#38223d" />
                  <path d="M26 100c2-17 12-27 24-27s22 10 24 27" fill="#6d26a3" />
                  <path d="M43 70h13l-6 11z" fill="#fff" />
                </svg>
              </div>
              <div><h2>{student.name}</h2><p>{student.university}<span aria-hidden="true"> • </span>{student.studyProgram === "Psikologi" ? "S1 Psikologi" : student.studyProgram}</p><p>NISN {student.nisn}</p></div>
            </div>
            <div className="b4-currentStatus">
              <h3>Status Terkini</h3>
              <div className="b4-statusLabels" aria-hidden="true"><span>Semester</span><span>IPK</span><span>Beasiswa</span><span>Status KIP-K</span><span>UKT/Semester</span></div>
              <div className="b4-statusValues"><strong>3</strong><strong>3.82</strong><strong>Beasiswa<br />Unggulan</strong><strong>Tidak</strong><strong>Rp 5.000.000</strong></div>
            </div>
          </section>

          <section className="b4-timelineCard" aria-labelledby="b4-highschool-title">
            <h2 id="b4-highschool-title" className="b4-timelineCardTitle">Perjalanan Pendidikan SMA</h2>
            <ol className="b4-schoolTimeline">
              <li><span className="b4-timelineIcon"><School size={44} strokeWidth={2.1} aria-hidden="true" /></span><h3>Masuk SMA</h3><time>Juli 2021</time><p>SMA Negeri 8 Malang</p></li>
              <li><span className="b4-timelineIcon"><GraduationCap size={48} strokeWidth={2.1} aria-hidden="true" /></span><h3>Lulus SMA</h3><time>Mei 2024</time><p>Rata-rata Rapor: 92.4</p></li>
              <li><span className="b4-timelineIcon"><Building2 size={44} strokeWidth={2.1} aria-hidden="true" /></span><h3>Masuk Perguruan Tinggi</h3><time>Agustus 2024</time><p>{student.university}</p></li>
            </ol>
          </section>

          <section className="b4-timelineCard" aria-labelledby="b4-college-title">
            <h2 id="b4-college-title" className="b4-timelineCardTitle">Perjalanan Pendidikan Perguruan Tinggi</h2>
            <ol className="b4-semesterTimeline">
              {semesterRecords.map((item) => {
                const available = Boolean(item.ipk);
                return <li key={item.number} className={`${available ? "b4-semesterAvailable" : "b4-semesterPending"} ${selectedSemester === item.number ? "b4-semesterSelected" : ""}`}>
                  <button type="button" disabled={!available} aria-pressed={selectedSemester === item.number} aria-label={`Semester ${item.number}${available ? `, ${item.period}` : ", data belum tersedia"}`} onClick={() => { setSelectedSemester(item.number); setSaved(false); }}>
                    <span className="b4-semesterCircle">S{item.number}</span>
                    <strong>Semester {item.number}</strong><span className="b4-semesterPeriod">{item.period}</span>
                    {available ? <><span className="b4-semesterTag">{item.number === 1 ? "Seleksi SNBP" : item.number === 2 ? "Dapat Beasiswa" : "Beasiswa Aktif"}</span><small>IPK: {item.ipk}</small></> : <span className="b4-semesterTag b4-pendingTag">Data Belum Tersedia</span>}
                  </button>
                </li>;
              })}
            </ol>
          </section>

          <section className="b4-timelineCard b4-semesterDetail" aria-labelledby="b4-detail-semester-title">
            <h2 id="b4-detail-semester-title" className="b4-timelineCardTitle">Detail Semester {semester.number} - {semester.period}</h2>
            <div className="b4-semesterMetrics">
              <article><span>IP-Kumulatif</span><strong>{semester.ipk ?? "—"}</strong></article>
              <article><span>Beasiswa</span><strong>{semester.scholarship ?? "Belum tersedia"}</strong></article>
              <article><span>Biaya UKT</span><strong>{semester.ukt ?? "—"}</strong></article>
              <article><span>Status KIPK</span><strong>{semester.kipk ?? "—"}</strong></article>
            </div>
            {semester.note && <aside className="b4-semesterNote"><FileText size={28} aria-hidden="true" /><div><strong>Catatan Perubahan Semester {semester.number}</strong><p>{semester.note}</p></div></aside>}
            <div className="b4-manageActions"><p role="status">{saved ? "Perubahan tersimpan pada pratinjau ini." : "Data contoh · perubahan hanya tersimpan selama halaman dibuka."}</p><button type="button" onClick={() => { setSaved(false); setManageOpen(true); }}>Lihat &amp; Kelola Progress</button></div>
          </section>
          <p className="b4-demoNote">Pratinjau B4 · Data alumni dan riwayat semester adalah contoh untuk tampilan.</p>
        </section>
      </div>
    </main>

    <dialog ref={dialogRef} className="b4-detailDialog" aria-labelledby="b4-manage-title" onClose={() => setManageOpen(false)}>
      <form className="b4-dialogContent b4-manageForm" onSubmit={(event) => { event.preventDefault(); setManageOpen(false); setSaved(true); }}>
        <div className="b4-dialogHeading"><h2 id="b4-manage-title">Kelola Progress Semester {semester.number}</h2><button type="button" aria-label="Tutup" onClick={() => setManageOpen(false)}>×</button></div>
        <p className="b4-dialogNote">Perubahan pratinjau ini tidak dikirim ke server.</p>
        <label>IP Kumulatif<input inputMode="decimal" value={semester.ipk ?? ""} onChange={(event) => updateSemester("ipk", event.target.value)} /></label>
        <label>Beasiswa<input value={semester.scholarship ?? ""} onChange={(event) => updateSemester("scholarship", event.target.value)} /></label>
        <label>Biaya UKT<input value={semester.ukt ?? ""} onChange={(event) => updateSemester("ukt", event.target.value)} /></label>
        <label>Status KIP-K<select value={semester.kipk ?? "Tidak"} onChange={(event) => updateSemester("kipk", event.target.value)}><option>Tidak</option><option>Aktif</option></select></label>
        <button type="submit" className="b4-closeDialog">Simpan pratinjau</button>
      </form>
    </dialog>
  </div>;
}
