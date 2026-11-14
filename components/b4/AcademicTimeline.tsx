"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, GraduationCap, School } from "lucide-react";
import { type AlumniProfile, progressFor, rupiah, useDemoData } from "./demoStore";
import { displayTitle } from "@/lib/display-copy";

export default function AcademicTimeline({ alumni, student = false }: { alumni: AlumniProfile; student?: boolean }) {
  const data = useDemoData();
  const records = progressFor(data, alumni.id);
  const [semester, setSemester] = useState(2);
  const selected = records.find((record) => record.semester === semester);
  const stages = [{ title: "Masuk SMA", date: "Juli 2021", detail: "SMA Negeri 8 Malang", Icon: School }, { title: "Lulus SMA", date: "Mei 2024", detail: "Rata-rata Rapor: 92.4", Icon: GraduationCap }, { title: "Masuk Perguruan Tinggi", date: "Agustus 2024", detail: alumni.university, Icon: Building2 }];
  return <>
    <section className="bc4-section"><h2 className="bc4-sectionHeading">Perjalanan Pendidikan SMA</h2><ol className="bc4-schoolTimeline">{stages.map(({ title, date, detail, Icon }) => <li key={title}><span className="bc4-stageIcon"><Icon size={39} strokeWidth={1.8} /></span><h3>{displayTitle(title)}</h3><strong>{date}</strong><p>{detail}</p></li>)}</ol></section>
    <section className="bc4-section"><h2 className="bc4-sectionHeading">Perjalanan Pendidikan Perguruan Tinggi</h2><div className="bc4-semesterScroll"><ol className="bc4-semesterTimeline">{Array.from({ length: 8 }, (_, index) => {
      const number = index + 1;
      const record = records.find((item) => item.semester === number);
      return <li key={number} className={!record ? "bc4-unavailable" : ""}><button type="button" aria-label={`Lihat semester ${number}`} aria-pressed={semester === number} onClick={() => setSemester(number)} className={semester === number ? "bc4-semesterSelected" : ""}>S{number}</button><h3>Semester {number}</h3><p>{record?.period ?? `${number % 2 ? "Ganjil" : "Genap"} ${2024 + Math.floor((number - 1) / 2)}/${2025 + Math.floor((number - 1) / 2)}`}</p><span>{record ? (record.scholarship === "-" ? "Seleksi " + alumni.admission : "Beasiswa Aktif") : "Data Belum Tersedia"}</span>{record && <small>IPK: {record.ipk}</small>}</li>;
    })}</ol></div></section>
    <section className="bc4-section"><h2 className="bc4-sectionHeading">Detail Semester {semester}{selected ? ` - ${selected.period}` : ""}</h2><div className="bc4-sectionBody">{selected ? <>
      {student ? <div className="bc4-grid3"><div className="bc4-yellowCard"><h3>Capaian Akademik</h3><dl className="bc4-infoList"><dt>Ip Kumulatif</dt><dd>{selected.ipk}</dd><dt>Semester</dt><dd>{selected.semester}</dd></dl></div><div className="bc4-yellowCard"><h3>Bantuan & Beasiswa</h3><dl className="bc4-infoList"><dt>Program</dt><dd>{displayTitle(selected.scholarship)}</dd><dt>Penerima KIP-K</dt><dd>{selected.kipk}</dd></dl></div><div className="bc4-yellowCard"><h3>Biaya Pendidikan</h3><dl className="bc4-infoList"><dt>UKT</dt><dd>{selected.showUkt ? rupiah(selected.ukt) : "Tidak ditampilkan"}</dd><dt>IPI</dt><dd>{selected.showIpi ? rupiah(selected.ipi) : "Tidak ditampilkan"}</dd></dl></div></div> : <><div className="bc4-detailMetrics">{[["IP-Kumulatif", selected.ipk], ["Beasiswa", selected.scholarship], ["Biaya UKT", rupiah(selected.ukt)], ["Status KIP-K", selected.kipk]].map(([label, value]) => <div className="bc4-yellowCard" key={label}><span>{displayTitle(label)}</span><strong>{value}</strong></div>)}</div><div className="bc4-note" style={{ marginTop: 28 }}><div><strong>Catatan Perubahan Semester {semester}</strong><p>IPK kumulatif pada semester ini adalah <b>{selected.ipk}</b>. {selected.scholarship === "-" ? "Belum ada beasiswa tercatat." : `Beasiswa tercatat: ${selected.scholarship}.`} Biaya UKT {rupiah(selected.ukt)} per semester.</p></div></div></>}
    </> : <div className="bc4-empty">Data semester ini belum tersedia.</div>}{!student && <div className="bc4-actions" style={{ marginTop: 22 }}><Link className="bc4-button bc4-primary" href={`/admin/alumni-perguruan-tinggi/informasi-detail?id=${alumni.id}`}>Lihat & Kelola progres</Link></div>}</div></section>
  </>;
}
