"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, GraduationCap, School } from "lucide-react";
import { acceptedAwards, eventDate, timelineMoney, type AlumniTimelineDetail } from "@/lib/b4-timeline";
import { educationStatus } from "@/lib/b4-progress";

export default function AlumniAcademicTimeline({ alumni }: { alumni: AlumniTimelineDetail }) {
  const records = alumni.progress;
  const [selectedId, setSelectedId] = useState(records[0]?.id);
  const selected = records.find((row) => row.id === selectedId) ?? records[0];
  const chronological = [...records].sort((a, b) => (a.semester ?? 0) - (b.semester ?? 0) || (a.updatedAt ?? "").localeCompare(b.updatedAt ?? "") || a.id - b.id);
  const icons = { masuk_sekolah: School, lulus_sekolah: GraduationCap, masuk_pt: Building2 };
  return <>
    <section className="bc4-section"><h2 className="bc4-sectionHeading">Perjalanan Pendidikan SMA</h2>
      <ol className="bc4-schoolTimeline">{alumni.educationEvents.map((event) => {
        const Icon = icons[event.type];
        return <li key={event.type}><span className="bc4-stageIcon"><Icon size={39} strokeWidth={1.8} /></span><h3>{event.label}</h3><strong>{eventDate(event)}</strong>
          <p>{event.type === "masuk_sekolah" ? "SMA Negeri 8 Malang" : event.type === "masuk_pt" ? alumni.university + " · " + (alumni.admissionPath ?? "-") : "Tahun lulus " + event.year}</p>
        </li>;
      })}</ol>
    </section>
    <section className="bc4-section"><h2 className="bc4-sectionHeading">Perjalanan Pendidikan Perguruan Tinggi</h2>
      <div className="bc4-semesterScroll"><ol className="bc4-semesterTimeline" style={{ gridTemplateColumns: "repeat(" + chronological.length + ", minmax(120px, 1fr))", minWidth: chronological.length * 120 }}>{chronological.map((row) => <li key={row.id}>
        <button type="button" aria-label={"Lihat semester " + row.semester + ", " + row.period} aria-pressed={selected?.id === row.id} onClick={() => setSelectedId(row.id)} className={selected?.id === row.id ? "bc4-semesterSelected" : ""}>S{row.semester}</button>
        <h3>Semester {row.semester}</h3><p>{row.period ?? "-"}</p><span>{educationStatus(row.status)}</span><small>IPK: {row.gpa ?? "-"}</small>
      </li>)}</ol></div>
    </section>
    {selected && <section className="bc4-section"><h2 className="bc4-sectionHeading">Detail Semester {selected.semester} - {selected.period}</h2>
      <div className="bc4-sectionBody"><div className="bc4-detailMetrics">{[
        ["IP-Kumulatif", selected.gpa ?? "-"], ["Beasiswa Diterima", acceptedAwards(selected)],
        ["Biaya UKT", timelineMoney(selected.ukt)], ["Status KIP-K", selected.kipk === true ? "Ya" : selected.kipk === false ? "Tidak" : "-"],
      ].map(([label, value]) => <div className="bc4-yellowCard" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        <div className="bc4-note" style={{ marginTop: 28 }}><div><strong>Pembaruan {selected.updatedAt ?? "-"}</strong><p>Status pendidikan: {educationStatus(selected.status)}. Periode: {selected.period ?? "-"}.</p></div></div>
        <div className="bc4-actions" style={{ marginTop: 22 }}><Link className="bc4-button bc4-primary" href={"/admin/alumni-perguruan-tinggi/informasi-detail?id=" + alumni.id}>Lihat &amp; Kelola Progress</Link></div>
      </div>
    </section>}
  </>;
}
