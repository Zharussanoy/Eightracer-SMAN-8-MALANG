"use client";

import { useState } from "react";
import { Building2, GraduationCap, School, UserRound } from "lucide-react";
import type { AlumniProfile, AlumniEvent, AlumniTimeline } from "@/lib/b4-alumni-legacy";

const known = (value: string | number | null | undefined) => value ?? "Belum tercatat";
const money = (value: number | null | undefined) => value == null ? "Belum tercatat" : `Rp${value.toLocaleString("id-ID")}`;
const kipk = (value: boolean | null | undefined) => value == null ? "Belum tercatat" : value ? "Ya" : "Tidak";
function scholarships(event?: AlumniEvent) { return event?.scholarships.length ? event.scholarships.map((item) => `${item.name}${item.status ? ` (${item.status})` : ""}`).join(", ") : "Belum tercatat"; }

export default function AdminTimelineView({ data, profile }: { data: AlumniTimeline; profile?: AlumniProfile }) {
  const events = profile?.id != null && data.events.some((item) => /^\d+:/.test(item.id)) ? data.events.filter((item) => item.id.startsWith(`${profile.id}:`)) : data.events;
  const school = events.filter((item) => item.semester === null);
  const progress = events.filter((item) => item.semester !== null);
  const current = progress.filter((item) => item.current !== false);
  const latest = [...current].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || (b.semester ?? 0) - (a.semester ?? 0))[0];
  const [selected, setSelected] = useState<string | null>(null);
  const event = progress.find((item) => item.id === selected) ?? latest ?? progress[0];
  const name = data.name ?? profile?.name ?? "Riwayat Alumni";
  const campus = profile?.university ?? latest?.university ?? school.find((item) => item.university)?.university;
  const program = profile?.program ?? latest?.program ?? school.find((item) => item.program)?.program;
  // Semester yang belum dikirim BE hanya berupa tempat kosong; tahun/periode tidak dibuat.
  const semesters = [...new Set([...Array.from({ length: 8 }, (_, index) => index + 1), ...progress.flatMap((item) => item.semester === null ? [] : [item.semester])])].sort((a, b) => a - b);
  return <div className="bc4-adminTimelineLive">
    <div className="bc4-profileRow"><div className="bc4-profile"><span className="bc4-avatar" aria-label={`Profil ${name}`}><UserRound size={48} aria-hidden="true" /></span><div><h2>{name}</h2><p>{known(campus)} · {known(program)}</p>{profile?.admission && <span className="bc4-tag">{profile.admission}</span>}</div></div>
      <div className="bc4-current"><h3>Progres Terakhir Tercatat</h3><dl className="bc4-metrics">{[["Semester", latest?.semester], ["IPK", latest?.ipk], ["Beasiswa", scholarships(latest)], ["Status KIP-K", kipk(latest?.kipk)], ["UKT/Semester", money(latest?.ukt)]].map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{known(value)}</dd></div>)}</dl></div></div>
    <section className="bc4-section"><h2 className="bc4-sectionHeading">Perjalanan Pendidikan SMA</h2>{school.length ? <ol className="bc4-schoolTimeline">{school.map((item) => {
      const Icon = /masuk.*sma/i.test(item.kind) ? School : /perguruan|masuk.*pt/i.test(item.kind) ? Building2 : GraduationCap;
      return <li key={item.id}><span className="bc4-stageIcon"><Icon size={39} aria-hidden="true" /></span><h3>{item.kind.replaceAll("_", " ")}</h3><strong>{item.date ?? item.year ?? "Waktu belum tercatat"}</strong>{item.university && <p>{item.university}</p>}</li>;
    })}</ol> : <p className="bc4-empty">Belum ada riwayat sekolah yang dikirim BE.</p>}</section>
    <section className="bc4-section"><h2 className="bc4-sectionHeading">Perjalanan Pendidikan Perguruan Tinggi</h2><div className="bc4-semesterScroll"><ol className="bc4-semesterTimeline">{semesters.map((semester) => {
      const records = progress.filter((item) => item.semester === semester);
      const record = records.find((item) => item.id === event?.id) ?? records.find((item) => item.current !== false) ?? records[0];
      return <li key={semester} className={!record ? "bc4-unavailable" : undefined}><button type="button" disabled={!record} aria-label={`Lihat semester ${semester}`} aria-pressed={!!record && event?.id === record.id} className={record && event?.id === record.id ? "bc4-semesterSelected" : undefined} onClick={() => record && setSelected(record.id)}>S{semester}</button><h3>Semester {semester}</h3><p>{record?.period ?? "Periode belum tercatat"}</p><span>{record ? record.status ?? "Progres tercatat" : "Data Belum Tersedia"}</span>{record && <small>IPK: {known(record.ipk)}</small>}</li>;
    })}</ol></div></section>
    {event ? <section className="bc4-section"><h2 className="bc4-sectionHeading">Detail Semester {event.semester}{event.period ? ` - ${event.period}` : ""}</h2><div className="bc4-sectionBody">
      {progress.filter((item) => item.semester === event.semester).length > 1 && <label className="bc4-field">Catatan semester<select value={event.id} onChange={(e) => setSelected(e.target.value)}>{progress.filter((item) => item.semester === event.semester).map((item, index) => <option value={item.id} key={item.id}>{item.period ?? `Catatan ${index + 1}`} · {item.date ?? item.year ?? "Waktu belum tercatat"}{item.current === false ? " · Revisi terdahulu" : ""}</option>)}</select></label>}
      <div className="bc4-detailMetrics">{[["IP-Kumulatif", known(event.ipk)], ["Beasiswa", scholarships(event)], ["Biaya UKT", money(event.ukt)], ["Status KIP-K", kipk(event.kipk)]].map(([label, value]) => <div className="bc4-yellowCard" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <aside className="bc4-note"><div><h3>Catatan Semester {event.semester}</h3><p>Periode: {known(event.period)}. Status pendidikan: {known(event.status)}. Waktu pencatatan: {event.date ?? event.year ?? "Belum tercatat"}.{event.current === false && " Catatan ini merupakan revisi terdahulu."}</p></div></aside>
    </div></section> : <p className="bc4-empty">Belum ada progres semester yang dikirim BE.</p>}
  </div>;
}
