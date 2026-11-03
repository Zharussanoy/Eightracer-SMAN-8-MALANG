"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Plus, Trash2 } from "lucide-react";
import B4Shell from "./B4Shell";
import { updateDemo, useDemoData, type CatalogItem } from "./demoStore";
import type { ScholarshipLevel } from "@/components/admin/b-4/scholarshipData";

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const BACK = "/admin/basis-data-beasiswa";

function ScholarshipForm({ item }: { item?: CatalogItem }) {
  const router = useRouter();
  const [name, setName] = useState(item?.name ?? "");
  const [count, setCount] = useState(item?.duration.match(/\d+/)?.[0] ?? "8");
  const [unit, setUnit] = useState(item?.duration.toLowerCase().includes("tahun") ? "tahun" : "Semester");
  const [level, setLevel] = useState<ScholarshipLevel>(item?.level ?? "Kuliah & SMA");
  const [start, setStart] = useState(months.find((month) => item?.applyPeriod.startsWith(month)) ?? "Juli");
  const [end, setEnd] = useState(months.find((month) => item?.applyPeriod.endsWith(month)) ?? "Agustus");
  const [criteria, setCriteria] = useState(item?.criteria.length ? item.criteria : [""]);
  const [error, setError] = useState("");

  const save = (event: FormEvent) => {
    event.preventDefault();
    const validCriteria = criteria.map((criterion) => criterion.trim()).filter(Boolean);
    if (!name.trim() || !validCriteria.length) { setError("Isi nama beasiswa dan minimal satu kriteria kelayakan."); return; }
    const record: CatalogItem = { id: item?.id ?? crypto.randomUUID(), name: name.trim(), level, duration: `${count} ${unit}`, applyPeriod: `${start} - ${end}`, archived: item?.archived ?? false, criteria: validCriteria, provider: item?.provider ?? "Penyelenggara belum dicantumkan", funding: item?.funding ?? "Sesuai ketentuan program" };
    updateDemo((current) => ({ ...current, catalog: item ? current.catalog.map((entry) => entry.id === item.id ? record : entry) : [record, ...current.catalog] }));
    router.push(BACK);
  };

  return <form onSubmit={save} className="bc4-section">
    <h2 className="bc4-sectionHeading">{item ? "Edit" : "Tambah"} Basis Data Beasiswa</h2>
    <div className="bc4-sectionBody"><div className="bc4-formGrid">
      <section className="bc4-panel"><h3 className="bc4-underlined">Informasi Beasiswa</h3><div className="bc4-fields">
        <label className="bc4-field">Nama Beasiswa *<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <div className="bc4-field">Durasi Pemberian *<div className="bc4-pair"><select aria-label="Jumlah durasi" value={count} onChange={(event) => setCount(event.target.value)}>{Array.from({ length: 16 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select><select aria-label="Satuan durasi" value={unit} onChange={(event) => setUnit(event.target.value)}><option>Semester</option><option value="tahun">Tahun</option></select></div></div>
        <fieldset className="bc4-radioGroup"><legend>Jenjang Berlaku *</legend>{(["SMA", "Kuliah", "Kuliah & SMA"] as ScholarshipLevel[]).map((value) => <label key={value}><input type="radio" name="level" value={value} checked={level === value} onChange={() => setLevel(value)} />{value === "Kuliah & SMA" ? "SMA & Kuliah" : value}</label>)}</fieldset>
        <div className="bc4-field">Periode Apply *<div className="bc4-pair"><select aria-label="Bulan pembukaan" value={start} onChange={(event) => setStart(event.target.value)}>{months.map((month) => <option key={month}>{month}</option>)}</select><select aria-label="Bulan penutupan" value={end} onChange={(event) => setEnd(event.target.value)}>{months.map((month) => <option key={month}>{month}</option>)}</select></div></div>
      </div></section>
      <section className="bc4-panel"><h3 className="bc4-underlined">Kriteria Kelayakan</h3><div className="bc4-criteriaList">{criteria.map((criterion, index) => <div className="bc4-criterionInput" key={index}>
        <span>{index + 1}</span><input aria-label={`Kriteria ${index + 1}`} value={criterion} maxLength={300} placeholder="Contoh: Memiliki prestasi akademik maupun non akademik" onChange={(event) => setCriteria(criteria.map((value, i) => i === index ? event.target.value : value))} />
        <button type="button" className="bc4-iconButton" aria-label={`Tambah kriteria setelah ${index + 1}`} onClick={() => setCriteria([...criteria.slice(0, index + 1), "", ...criteria.slice(index + 1)])}><Plus size={19} /></button>
        <button type="button" className="bc4-iconButton" disabled={criteria.length === 1} aria-label={`Hapus kriteria ${index + 1}`} onClick={() => setCriteria(criteria.filter((_, i) => i !== index))}><Trash2 size={18} /></button>
      </div>)}</div></section>
    </div>
    {error && <p role="alert" className="bc4-status">{error}</p>}
    <aside className="bc4-note bc4-formNote"><CircleAlert size={25} /><div><h3>Catatan Sistem</h3><p>{item ? `Beasiswa ini ${item.archived ? "diarsipkan" : "Aktif"}. Program aktif dapat dirujuk oleh rekomendasi siswa.` : "Beasiswa baru disimpan dengan status Aktif dan dapat dirujuk dalam rekomendasi siswa."}</p></div><div className="bc4-actions">{item && <button type="button" className="bc4-button" onClick={() => { updateDemo((current) => ({ ...current, catalog: current.catalog.map((entry) => entry.id === item.id ? { ...entry, archived: !entry.archived } : entry) })); router.push(BACK); }}>{item.archived ? "Aktifkan" : "Arsipkan"}</button>}<Link href={BACK} className="bc4-button">Batal</Link><button className="bc4-button bc4-primary" type="submit">Simpan</button></div></aside>
    </div>
  </form>;
}

export default function ScholarshipEditorPage({ id }: { id?: string }) {
  const data = useDemoData();
  const item = data.catalog.find((entry) => entry.id === id);
  return <B4Shell title={`${id ? "Edit" : "Tambah"} Basis Data Beasiswa`} description="Kelola informasi program, periode pendaftaran, dan kriteria kelayakan beasiswa." active="database" parent={{ label: "Basis Data Beasiswa", href: BACK }}>
    {id && !item ? <div className="bc4-empty">Beasiswa tidak ditemukan. <Link href={BACK}>Kembali ke daftar beasiswa</Link></div> : <ScholarshipForm key={JSON.stringify(item ?? "new")} item={item} />}
  </B4Shell>;
}
