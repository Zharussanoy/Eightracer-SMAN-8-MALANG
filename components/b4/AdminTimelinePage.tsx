"use client";

import { useState } from "react";
import B4Shell, { Avatar } from "./B4Shell";
import AcademicTimeline from "./AcademicTimeline";
import { ALUMNI, progressFor, rupiah, useDemoData } from "./demoStore";

export default function AdminTimelinePage() {
  const data = useDemoData();
  const [query, setQuery] = useState("Dian Permata Sari");
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [admission, setAdmission] = useState("");
  const alumni = ALUMNI.find((item) => item.name.toLowerCase().includes(query.toLowerCase()) && (!university || item.university === university) && (!program || item.program === program) && (!admission || item.admission === admission));
  const latest = alumni ? progressFor(data, alumni.id)[0] : undefined;
  return <B4Shell title="Timeline Individu" active="timeline" description="Lihat perjalanan pendidikan dan perkembangan kuliah alumni dari masa sekolah hingga kondisi terkini."><div className="bc4-filterRow"><label className="bc4-field"><span className="b4-srOnly">Cari alumni</span><input aria-label="Cari alumni" list="bc4-timeline-alumni" value={query} onChange={(event) => setQuery(event.target.value)} /><datalist id="bc4-timeline-alumni">{ALUMNI.map((item) => <option key={item.id}>{item.name}</option>)}</datalist></label>{[{ label: "Perguruan Tinggi", key: "university", value: university, set: setUniversity }, { label: "Program Studi", key: "program", value: program, set: setProgram }, { label: "Jalur Masuk", key: "admission", value: admission, set: setAdmission }].map(({ label, key, value, set }) => <label className="bc4-field" key={key}><span className="b4-srOnly">{label}</span><select aria-label={label} value={value} onChange={(event) => set(event.target.value)}><option value="">{label}</option>{[...new Set(ALUMNI.map((item) => item[key as "university" | "program" | "admission"]))].map((option) => <option key={option}>{option}</option>)}</select></label>)}</div>{alumni ? <><div className="bc4-profileRow"><div className="bc4-profile"><Avatar name={alumni.name} /><div><h2>{alumni.name}</h2><p>{alumni.university} · {alumni.program}</p><p>NISN ••••••••••</p></div></div><div className="bc4-current"><h3>Status Terkini</h3><dl className="bc4-metrics">{[["Semester", latest?.semester ?? "–"], ["IPK", latest?.ipk ?? "–"], ["Beasiswa", latest?.scholarship ?? "–"], ["Status KIP-K", latest?.kipk ?? "–"], ["UKT/Semester", latest ? rupiah(latest.ukt) : "–"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></div><AcademicTimeline key={alumni.id} alumni={alumni} /></> : <div className="bc4-empty">Alumni tidak ditemukan. Ubah pencarian atau filter.</div>}</B4Shell>;
}
