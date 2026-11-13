"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Plus, Settings2, Trash2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { ApiError, type ApiValidationErrors } from "@/lib/eightracer-api";
import { archiveScholarship, getScholarship, saveScholarship } from "@/lib/b4-scholarship-api";
import type { ScholarshipInput, ScholarshipCriterion } from "@/lib/b4-scholarships";
import B4Shell from "./B4Shell";
import { displayTitle } from "@/lib/display-copy";

const BACK = "/admin/basis-data-beasiswa";
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const empty = (): ScholarshipInput => ({ nama_beasiswa: "", jenjang: "Keduanya", durasi: 8, satuan_durasi: "semester", periode_apply: "Juli - Agustus", is_active: true, kriteria: [] });
const criterion = (): ScholarshipCriterion => ({ nama_kriteria: "", tipe_kriteria: "", operator: "", nilai_kriteria: "" });

function Field({ name, label, errors, children }: { name: string; label: string; errors: ApiValidationErrors; children: ReactNode }) {
  return <label className="bc4-field">{displayTitle(label)}{children}{errors[name]?.map((message, index) => <span className="bc4-fieldError" key={index}>{message}</span>)}</label>;
}

export default function ScholarshipEditorApi({ id }: { id?: string }) {
  const { currentUser, refreshSession } = useUser();
  const router = useRouter();
  const [loaded, setLoaded] = useState<{ id: string; input?: ScholarshipInput; error?: string } | null>(null);
  const record = loaded?.id === id ? loaded : null;
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!id || !currentUser.schoolStaff) return;
    const controller = new AbortController();
    async function load() {
      if (!/^[1-9]\d*$/.test(id!)) { setLoaded({ id: id!, error: "ID beasiswa tidak valid." }); return; }
      try {
        const row = await getScholarship(Number(id), controller.signal);
        if (!row.input) throw new Error("Kriteria lengkap belum dikirim oleh server. Form tidak dapat dibuka tanpa data tersebut.");
        if (!controller.signal.aborted) setLoaded({ id: id!, input: row.input });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) { void refreshSession(); router.replace("/login"); }
        setLoaded({ id: id!, error: error instanceof Error ? error.message : "Data belum dapat dimuat." });
      }
    }
    void load();
    return () => controller.abort();
  }, [id, retry, currentUser.schoolStaff, refreshSession, router]);
  return <B4Shell title={`${id ? "Edit" : "Tambah"} Basis Data Beasiswa`} description="Kelola informasi program, periode pendaftaran, dan kriteria kelayakan beasiswa." active="database" parent={{ label: "Basis Data Beasiswa", href: BACK }} dataNote="">
    {!currentUser.schoolStaff ? <p role="alert">Akun ini belum memiliki izin mengelola beasiswa.</p>
      : id && !record ? <p role="status">Memuat data beasiswa…</p>
      : record?.error ? <div className="bc4-empty"><p role="alert">{record.error}</p><button className="bc4-button" type="button" onClick={() => setRetry((value) => value + 1)}>Coba Lagi</button> <Link href={BACK}>Kembali ke katalog</Link></div>
      : <Form key={`${currentUser.id}:${id ?? "new"}`} id={id ? Number(id) : undefined} initial={record?.input ?? empty()} />}
  </B4Shell>;
}

function Form({ initial, id }: { initial: ScholarshipInput; id?: number }) {
  const router = useRouter();
  const { refreshSession } = useUser();
  const [input, setInput] = useState(initial);
  const [criteria, setCriteria] = useState(() => (initial.kriteria.length ? initial.kriteria : [criterion()]).map((value, key) => ({ key, value })));
  const nextKey = useRef(criteria.length);
  const [errors, setErrors] = useState<ApiValidationErrors>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const periodParts = String(input.periode_apply ?? "").split(/\s*[-–]\s*/);
  const monthPeriod = periodParts.length === 2 && periodParts.every((value) => MONTHS.includes(value));
  const set = (field: keyof ScholarshipInput, value: unknown) => setInput((current) => ({ ...current, [field]: value }));
  const updateCriterion = (key: number, field: keyof ScholarshipCriterion, value: string) => setCriteria((current) => current.map((row) => row.key === key ? { ...row, value: { ...row.value, [field]: field === "bobot" ? (value === "" ? undefined : Number(value)) : value } } : row));
  const field = (name: string) => ({ "aria-invalid": !!errors[name], "aria-label": undefined });
  const failure = (error: unknown) => {
    if (error instanceof ApiError) {
      setErrors(error.errors);
      if (error.status === 401) { void refreshSession(); router.replace("/login"); }
    }
    setMessage(error instanceof Error ? error.message : "Perubahan belum dapat disimpan.");
  };

  async function save(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    const validation: ApiValidationErrors = {};
    if (!input.nama_beasiswa.trim()) validation.nama_beasiswa = ["Isi nama beasiswa."];
    if (!Number.isInteger(input.durasi) || Number(input.durasi) < 1) validation.durasi = ["Pilih durasi pemberian."];
    if (!input.satuan_durasi) validation.satuan_durasi = ["Pilih satuan durasi pemberian."];
    if (!input.periode_apply?.trim()) validation.periode_apply = ["Isi periode pendaftaran."];
    if (input.tanggal_buka && input.tanggal_tutup && input.tanggal_tutup < input.tanggal_buka) {
      validation.tanggal_tutup = ["Tanggal tutup harus sama atau setelah tanggal buka."];
    }
    const rows = criteria.some((row) => row.value.nama_kriteria.trim() || row.value.tipe_kriteria || row.value.nilai_kriteria.trim()) ? criteria : [];
    rows.forEach((row, index) => {
      for (const key of ["nama_kriteria", "tipe_kriteria", "operator", "nilai_kriteria"] as const) {
        if (!row.value[key].trim()) validation[`kriteria.${index}.${key}`] = [key === "nama_kriteria" ? "Isi nama kriteria." : "Lengkapi pengaturan penilaian kriteria ini."];
      }
    });
    setErrors(validation); setMessage("");
    if (Object.keys(validation).length) { setMessage("Periksa isian yang ditandai sebelum menyimpan."); return; }
    submitting.current = true; setSaving(true);
    let finished = false;
    try {
      await saveScholarship({ ...input, nama_beasiswa: input.nama_beasiswa.trim(), kriteria: rows.map((row) => row.value) }, id);
      finished = true;
      router.push(BACK); router.refresh();
    } catch (error) { failure(error); }
    finally { if (!finished) { submitting.current = false; setSaving(false); } }
  }

  async function archive() {
    if (!id || submitting.current || !window.confirm(`Arsipkan ${input.nama_beasiswa}?`)) return;
    submitting.current = true; setSaving(true);
    let finished = false;
    try { await archiveScholarship(id); finished = true; router.push(BACK); router.refresh(); }
    catch (error) { failure(error); }
    finally { if (!finished) { submitting.current = false; setSaving(false); } }
  }

  return <form className="bc4-section" onSubmit={save} noValidate>
    <h2 className="bc4-sectionHeading">{id ? "Edit" : "Tambah"} Basis Data Beasiswa</h2>
    <div className="bc4-sectionBody"><div className="bc4-formGrid">
      <section className="bc4-panel"><h3 className="bc4-underlined">Informasi Beasiswa</h3><div className="bc4-fields">
        <Field name="nama_beasiswa" label="Nama Beasiswa *" errors={errors}><input {...field("nama_beasiswa")} disabled={saving} value={input.nama_beasiswa} onChange={(event) => set("nama_beasiswa", event.target.value)} /></Field>
        <div className="bc4-field">Durasi Pemberian *<div className="bc4-pair"><select aria-label="Jumlah durasi" disabled={saving} value={input.durasi ?? ""} onChange={(event) => set("durasi", Number(event.target.value))}><option value="" disabled>Pilih Durasi</option>{Array.from({ length: 16 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}{Number(input.durasi) > 16 && <option>{input.durasi}</option>}</select><select aria-label="Satuan durasi" disabled={saving} value={input.satuan_durasi ?? ""} onChange={(event) => set("satuan_durasi", event.target.value)}><option value="" disabled>Pilih Satuan</option><option value="semester">Semester</option><option value="tahun">Tahun</option>{input.satuan_durasi && !["semester", "tahun"].includes(input.satuan_durasi) && <option>{input.satuan_durasi}</option>}</select></div>{errors.durasi?.map((value) => <span className="bc4-fieldError" key={value}>{value}</span>)}</div>
        <fieldset className="bc4-radioGroup" disabled={saving}><legend>Jenjang Berlaku *</legend>{(["SMA", "Kuliah", "Keduanya"] as const).map((level) => <label key={level}><input type="radio" name="jenjang" checked={input.jenjang === level} onChange={() => set("jenjang", level)} />{level === "Keduanya" ? "SMA & Kuliah" : level}</label>)}</fieldset>
        <Field name="periode_apply" label="Periode Pendaftaran *" errors={errors}>{monthPeriod ? <div className="bc4-pair"><select aria-label="Bulan pembukaan" disabled={saving} value={periodParts[0]} onChange={(event) => set("periode_apply", `${event.target.value} - ${periodParts[1]}`)}>{MONTHS.map((month) => <option key={month}>{month}</option>)}</select><select aria-label="Bulan penutupan" disabled={saving} value={periodParts[1]} onChange={(event) => set("periode_apply", `${periodParts[0]} - ${event.target.value}`)}>{MONTHS.map((month) => <option key={month}>{month}</option>)}</select></div> : <input disabled={saving} value={input.periode_apply ?? ""} onChange={(event) => set("periode_apply", event.target.value)} />}</Field>
        <details className="bc4-extraInformation" open={Object.keys(errors).some((key) => ["penyelenggara", "deskripsi", "link_pendaftaran", "tanggal_buka", "tanggal_tutup"].includes(key)) ? true : undefined}><summary>Informasi tambahan</summary><div className="bc4-fields">
          <Field name="penyelenggara" label="Penyelenggara" errors={errors}><input disabled={saving} value={input.penyelenggara ?? ""} onChange={(event) => set("penyelenggara", event.target.value)} /></Field>
          <Field name="deskripsi" label="Deskripsi" errors={errors}><textarea disabled={saving} value={input.deskripsi ?? ""} onChange={(event) => set("deskripsi", event.target.value)} /></Field>
          <Field name="link_pendaftaran" label="Link Pendaftaran" errors={errors}><input type="url" disabled={saving} value={input.link_pendaftaran ?? ""} onChange={(event) => set("link_pendaftaran", event.target.value)} /></Field>
          <p>Tanggal pasti menentukan jadwal pendaftaran. Nama bulan saja tidak menentukan tahun atau status Dibuka.</p>
          <Field name="tanggal_buka" label="Tanggal Buka" errors={errors}><input type="date" disabled={saving} value={input.tanggal_buka ?? ""} onChange={(event) => set("tanggal_buka", event.target.value || null)} /></Field>
          <Field name="tanggal_tutup" label="Tanggal Tutup" errors={errors}><input type="date" disabled={saving} value={input.tanggal_tutup ?? ""} onChange={(event) => set("tanggal_tutup", event.target.value || null)} /></Field>
        </div></details>
      </div></section>
      <section className="bc4-panel"><h3 className="bc4-underlined">Kriteria Kelayakan</h3><div className="bc4-criteriaList">{criteria.map((row, index) => <div key={row.key}>
        <div className="bc4-criterionInput"><span>{index + 1}</span><input disabled={saving} aria-label={`Kriteria ${index + 1}`} placeholder="Contoh: Memiliki prestasi akademik maupun non akademik" value={row.value.nama_kriteria} onChange={(event) => updateCriterion(row.key, "nama_kriteria", event.target.value)} /><button className="bc4-iconButton" type="button" disabled={saving || criteria.length >= 100} aria-label={`Tambah kriteria setelah ${index + 1}`} onClick={() => setCriteria((current) => [...current.slice(0, index + 1), { key: nextKey.current++, value: criterion() }, ...current.slice(index + 1)])}><Plus size={19} /></button><button className="bc4-iconButton" type="button" disabled={saving || criteria.length === 1} aria-label={`Hapus kriteria ${index + 1}`} onClick={() => setCriteria((current) => current.filter((value) => value.key !== row.key))}><Trash2 size={18} /></button></div>
        <details className="bc4-criterionSettings" open={Object.keys(errors).some((key) => key.startsWith(`kriteria.${index}.`)) ? true : undefined}><summary><Settings2 size={14} />Atur penilaian kriteria {index + 1}</summary><div className="bc4-fields">
          <Field name={`kriteria.${index}.tipe_kriteria`} label="Komponen Penilaian" errors={errors}><select disabled={saving} value={row.value.tipe_kriteria} onChange={(event) => updateCriterion(row.key, "tipe_kriteria", event.target.value)}><option value="">Pilih Komponen</option><option value="nilai_tka">Nilai TKA</option>{row.value.tipe_kriteria && row.value.tipe_kriteria !== "nilai_tka" && <option value={row.value.tipe_kriteria}>{row.value.tipe_kriteria.replaceAll("_", " ")}</option>}</select></Field>
          <Field name={`kriteria.${index}.operator`} label="Aturan Pembanding" errors={errors}><select disabled={saving} value={row.value.operator} onChange={(event) => updateCriterion(row.key, "operator", event.target.value)}><option value="">Pilih Aturan</option><option value=">=">Minimal (≥)</option>{row.value.operator && row.value.operator !== ">=" && <option>{row.value.operator}</option>}</select></Field>
          <Field name={`kriteria.${index}.nilai_kriteria`} label="Nilai Persyaratan" errors={errors}><input disabled={saving} value={row.value.nilai_kriteria} onChange={(event) => updateCriterion(row.key, "nilai_kriteria", event.target.value)} /></Field>
          <Field name={`kriteria.${index}.bobot`} label="Bobot (opsional)" errors={errors}><input type="number" disabled={saving} value={row.value.bobot ?? ""} onChange={(event) => updateCriterion(row.key, "bobot", event.target.value)} /></Field>
        </div></details>
      </div>)}</div></section>
    </div>
    {message && <div role="alert" className="bc4-status"><p>{message}</p>{Object.entries(errors).map(([key, values]) => <p key={key}>{values.join(" ")}</p>)}</div>}
    <aside className="bc4-note bc4-formNote"><CircleAlert size={25} /><div><h3>Catatan Sistem</h3><p>{id ? `Beasiswa ini ${input.is_active ? "Aktif dan dapat dirujuk oleh rekomendasi siswa" : "diarsipkan"}.` : "Beasiswa yang baru disimpan akan otomatis berstatus Aktif dan dapat dirujuk oleh Sistem Rekomendasi Siswa."}</p></div><div className="bc4-actions">{id && input.is_active && <button type="button" className="bc4-button" disabled={saving} onClick={() => void archive()}>Arsipkan</button>}<Link href={BACK} className="bc4-button" aria-disabled={saving} onClick={(event) => { if (saving) event.preventDefault(); }}>Batal</Link><button className="bc4-button bc4-primary" type="submit" disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button></div></aside>
    </div>
  </form>;
}
