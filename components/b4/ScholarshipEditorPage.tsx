"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Plus, Trash2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { isScholarshipDraft, newScholarshipDraft, scholarshipDraftErrors, type ScholarshipDraft } from "@/lib/b4-scholarship-draft";
import { scholarshipPeriod } from "@/lib/b4-scholarships";
import B4Shell from "./B4Shell";
import { updateDemo, useDemoData, type CatalogItem } from "./demoStore";
import ScholarshipEditorApi from "./ScholarshipEditorApi";

const BACK = "/admin/basis-data-beasiswa";

function draftFromItem(item?: CatalogItem): ScholarshipDraft {
  if (isScholarshipDraft(item?.draft)) return { ...item.draft, active: !item.archived };
  return { ...newScholarshipDraft(), name: item?.name ?? "", provider: item?.provider ?? "", active: !item?.archived,
    level: item?.level === "Kuliah & SMA" ? "Keduanya" : item?.level ?? "Keduanya",
    criteria: item?.criteria.length ? item.criteria.map((name, index) => ({ key: `criterion-${index}`, name, value: "", weight: "" })) : newScholarshipDraft().criteria };
}

function ScholarshipForm({ item, accountId }: { item?: CatalogItem; accountId?: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => draftFromItem(item));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [saved, setSaved] = useState(false);
  const [durationCount, setDurationCount] = useState(item?.duration.match(/\d+/)?.[0] ?? "8");
  const [durationUnit, setDurationUnit] = useState(item?.duration.toLowerCase().includes("tahun") ? "tahun" : "Semester");
  const storageKey = `eightracer-b4-scholarship-draft-v1:${accountId}`;
  const set = <K extends keyof ScholarshipDraft>(field: K, value: ScholarshipDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value })); setSaved(false); setStatus("");
  };
  const error = (field: string) => errors[field] ? <span className="bc4-fieldError" id={`scholarship-${field}-error`}>{errors[field]}</span> : null;
  const attrs = (field: string) => ({ "aria-invalid": !!errors[field], "aria-describedby": errors[field] ? `scholarship-${field}-error` : undefined });

  const save = (event: FormEvent) => {
    event.preventDefault();
    const validation = scholarshipDraftErrors(draft);
    setErrors(validation);
    if (Object.keys(validation).length) { setStatus("Periksa kolom yang ditandai. Draf belum disimpan."); return; }
    if (accountId) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ version: 1, draft }));
        setSaved(true); setStatus("Draf tersimpan di perangkat ini dan belum diterbitkan ke katalog sekolah.");
      } catch { setStatus("Browser tidak dapat menyimpan draf. Isian tetap tersedia selama halaman ini terbuka."); }
      return;
    }
    const applyPeriod = draft.opens || draft.closes ? scholarshipPeriod({ id: 1, name: draft.name, level: draft.level, active: draft.active, opens: draft.opens || null, closes: draft.closes || null }) : item?.applyPeriod ?? "Belum tercatat";
    const record: CatalogItem = { id: item?.id ?? crypto.randomUUID(), name: draft.name.trim(),
      level: draft.level === "Keduanya" ? "Kuliah & SMA" : draft.level,
      duration: `${durationCount} ${durationUnit}`, applyPeriod, archived: !draft.active,
      criteria: draft.criteria.map((criterion) => criterion.name.trim()), provider: draft.provider.trim(),
      funding: item?.funding ?? "Sesuai ketentuan program", draft };
    updateDemo((current) => ({ ...current, catalog: item ? current.catalog.map((entry) => entry.id === item.id ? record : entry) : [record, ...current.catalog] }));
    router.push(BACK);
  };

  const restore = () => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (value?.version !== 1 || !isScholarshipDraft(value.draft)) { setStatus("Belum ada draf tersimpan untuk akun ini pada browser ini."); return; }
      setDraft(value.draft); setErrors({}); setSaved(true); setStatus("Draf dipulihkan. Katalog sekolah belum berubah.");
    } catch { setStatus("Draf lokal tidak dapat dibaca. Isian saat ini tetap dipertahankan."); }
  };

  return <form onSubmit={save} className="bc4-section" noValidate>
    <h2 className="bc4-sectionHeading">{item ? "Edit" : "Tambah"} Basis Data Beasiswa</h2>
    <div className="bc4-sectionBody">
      <p className="bc4-formIntro">{accountId ? "Siapkan draf program di browser ini. Draf belum mengubah katalog sekolah." : "Mode contoh: perubahan disimpan di browser ini."} Kolom bertanda * diperlukan untuk menyimpan draf.</p>
      {accountId && <button type="button" className="bc4-button bc4-restoreDraft" onClick={restore}>Pulihkan Draf Lokal Tersimpan</button>}
      <div className="bc4-formGrid bc4-scholarshipDraftGrid">
        <section className="bc4-panel"><h3 className="bc4-underlined">Informasi Beasiswa</h3><div className="bc4-fields">
          <label className="bc4-field">Nama Beasiswa *<input {...attrs("name")} required maxLength={120} value={draft.name} onChange={(event) => set("name", event.target.value)} />{error("name")}</label>
          <label className="bc4-field">Penyelenggara *<input {...attrs("provider")} required value={draft.provider} onChange={(event) => set("provider", event.target.value)} />{error("provider")}</label>
          <label className="bc4-field">Deskripsi Beasiswa *<textarea {...attrs("description")} required rows={4} value={draft.description} onChange={(event) => set("description", event.target.value)} />{error("description")}</label>
          <fieldset className="bc4-radioGroup"><legend>Jenjang Berlaku *</legend>{(["SMA", "Kuliah", "Keduanya"] as const).map((value) => <label key={value}><input type="radio" name="level" checked={draft.level === value} onChange={() => set("level", value)} />{value === "Keduanya" ? "SMA & Kuliah" : value}</label>)}</fieldset>
          <label className="bc4-field">Link Pendaftaran<input {...attrs("registrationUrl")} type="url" inputMode="url" placeholder="https://" value={draft.registrationUrl} onChange={(event) => set("registrationUrl", event.target.value)} />{error("registrationUrl")}</label>
          <div className="bc4-pair"><label className="bc4-field">Tanggal Buka<input {...attrs("opens")} type="date" value={draft.opens} onChange={(event) => set("opens", event.target.value)} />{error("opens")}</label><label className="bc4-field">Tanggal Tutup<input {...attrs("closes")} type="date" value={draft.closes} onChange={(event) => set("closes", event.target.value)} />{error("closes")}</label></div>
          {item && !draft.opens && !draft.closes && <p className="bc4-fieldHint">Periode contoh sebelumnya: {item.applyPeriod}. Tanggal lengkap belum tersedia.</p>}
          <label className="bc4-draftCheckbox"><input type="checkbox" checked={draft.active} onChange={(event) => set("active", event.target.checked)} />Program Aktif pada Draf</label>
          {!accountId && <div className="bc4-field">Durasi Pemberian (data contoh)<div className="bc4-pair"><select aria-label="Jumlah durasi" value={durationCount} onChange={(event) => setDurationCount(event.target.value)}>{Array.from({ length: 16 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select><select aria-label="Satuan durasi" value={durationUnit} onChange={(event) => setDurationUnit(event.target.value)}><option>Semester</option><option value="tahun">Tahun</option></select></div><span className="bc4-fieldHint">Durasi belum tersedia untuk draf ini.</span></div>}
        </div></section>
        <section className="bc4-panel"><h3 className="bc4-underlined">Kriteria Kelayakan</h3>
          <p className="bc4-fieldHint">Tulis persyaratan program. Bobot boleh dikosongkan dan belum digunakan untuk penilaian pada draf ini.</p>
          <div className="bc4-draftCriteria">{draft.criteria.map((criterion, index) => <fieldset className="bc4-draftCriterion" key={criterion.key}>
            <legend>Kriteria {index + 1}</legend>
            <label className="bc4-field">Nama Kriteria *<input {...attrs(`criteria.${index}.name`)} value={criterion.name} maxLength={300} onChange={(event) => set("criteria", draft.criteria.map((value) => value.key === criterion.key ? { ...value, name: event.target.value } : value))} />{error(`criteria.${index}.name`)}</label>
            <div className="bc4-pair"><label className="bc4-field">Tipe Penilaian<select disabled><option>Belum Tersedia</option></select></label><label className="bc4-field">Aturan Pembanding<select disabled><option>Belum Tersedia</option></select></label></div>
            <div className="bc4-pair"><label className="bc4-field">Nilai Persyaratan (Draf)<input value={criterion.value} onChange={(event) => set("criteria", draft.criteria.map((value) => value.key === criterion.key ? { ...value, value: event.target.value } : value))} /></label><label className="bc4-field">Bobot (Opsional)<input {...attrs(`criteria.${index}.weight`)} inputMode="decimal" value={criterion.weight} onChange={(event) => set("criteria", draft.criteria.map((value) => value.key === criterion.key ? { ...value, weight: event.target.value } : value))} />{error(`criteria.${index}.weight`)}</label></div>
            <button type="button" className="bc4-removeCriterion" disabled={draft.criteria.length === 1} aria-label={`Hapus kriteria ${index + 1}`} onClick={() => set("criteria", draft.criteria.filter((value) => value.key !== criterion.key))}><Trash2 size={16} />Hapus Kriteria</button>
          </fieldset>)}</div>
          <button type="button" className="bc4-button bc4-addCriterion" disabled={draft.criteria.length >= 100} onClick={() => set("criteria", [...draft.criteria, { key: crypto.randomUUID(), name: "", value: "", weight: "" }])}><Plus size={17} />Tambah Kriteria</button>
          {error("criteria")}
        </section>
      </div>
      <p role={Object.keys(errors).length ? "alert" : "status"} className={`bc4-draftStatus ${saved ? "bc4-draftSaved" : ""}`}>{status}</p>
      <aside className="bc4-note bc4-formNote"><CircleAlert size={25} /><div><h3>Catatan Penyimpanan</h3><p>Draf belum diterbitkan. Lengkapi dan periksa persyaratan sebelum menyimpannya ke katalog sekolah.</p></div><div className="bc4-actions"><Link href={BACK} className="bc4-button">Kembali</Link><button className="bc4-button bc4-primary" type="submit">{accountId ? "Simpan Draf Lokal" : "Simpan di Browser"}</button></div></aside>
    </div>
  </form>;
}

export default function ScholarshipEditorPage({ id }: { id?: string }) {
  const data = useDemoData();
  const { authStatus, currentUser, authMessage, refreshSession } = useUser();
  const item = data.catalog.find((entry) => entry.id === id);
  const authenticated = authStatus === "authenticated";
  if (authenticated) return <ScholarshipEditorApi id={id} />;
  return <B4Shell title={`${id ? "Edit" : "Tambah"} Basis Data Beasiswa`} description="Kelola informasi program, periode pendaftaran, dan kriteria kelayakan beasiswa." active="database" parent={{ label: "Basis Data Beasiswa", href: BACK }}
    dataNote={authenticated ? "Perubahan belum disimpan." : undefined}>
    {authStatus === "loading" ? <p role="status">Memeriksa sesi akun…</p>
      : authStatus === "unavailable" ? <><p role="alert">{authMessage}</p><button type="button" className="bc4-button" onClick={() => void refreshSession()}>Coba Periksa Sesi Lagi</button></>
      : authenticated && !currentUser.schoolStaff ? <p role="alert">Formulir admin hanya tersedia untuk administrator atau guru BK dengan izin aktif dan email terverifikasi.</p>
      : authenticated && id ? <div className="bc4-empty">Detail beasiswa belum dapat dimuat. Kembali ke katalog dan coba lagi. <Link href={BACK}>Kembali ke daftar beasiswa</Link></div>
      : !authenticated && id && !item ? <div className="bc4-empty">Beasiswa tidak ditemukan. <Link href={BACK}>Kembali ke daftar beasiswa</Link></div>
      : <ScholarshipForm key={authenticated ? `account:${currentUser.id}` : JSON.stringify(item ?? "new")} item={authenticated ? undefined : item} accountId={authenticated ? currentUser.id : undefined} />}
  </B4Shell>;
}
