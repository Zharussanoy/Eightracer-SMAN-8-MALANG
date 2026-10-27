"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Pencil, Trash2, Upload } from "lucide-react";
import B4Navbar from "./B4Navbar";
import B4Tabs from "./B4Tabs";
import "./college.css";

type ProgressRecord = {
  semester: number;
  period: string;
  ipk: string;
  kipk: "Ya" | "Tidak";
  scholarship: string;
  ukt: string;
};

const periodOptions = [
  { value: "4", label: "Genap 2025/2026 (Semester 4)" },
  { value: "3", label: "Ganjil 2025/2026 (Semester 3)" },
  { value: "2", label: "Genap 2024/2025 (Semester 2)" },
  { value: "1", label: "Ganjil 2024/2025 (Semester 1)" },
];

const initialRecords: ProgressRecord[] = [
  { semester: 3, period: "Ganjil 2025/2026", ipk: "3.82", kipk: "Tidak", scholarship: "Beasiswa Unggulan", ukt: "5.000.000" },
  { semester: 2, period: "Genap 2024/2025", ipk: "3.78", kipk: "Tidak", scholarship: "Beasiswa Unggulan", ukt: "5.000.000" },
  { semester: 1, period: "Ganjil 2024/2025", ipk: "3.75", kipk: "Tidak", scholarship: "-", ukt: "5.000.000" },
];

function AlumniPortrait() {
  return <div className="b4-detailPortrait" aria-label="Foto contoh alumni" role="img">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs><linearGradient id="b4-detail-avatar-bg" x2="1" y2="1"><stop stopColor="#f7ebfa" /><stop offset="1" stopColor="#d8c2e8" /></linearGradient></defs>
      <rect width="100" height="100" fill="url(#b4-detail-avatar-bg)" />
      <path d="M15 100V54c0-27 14-42 35-42s35 15 35 42v46" fill="#35233a" />
      <path d="M32 42c0-15 7-23 18-23s18 8 18 23v16c0 15-8 25-18 25S32 73 32 58z" fill="#e9b99d" />
      <path d="M30 45c1-20 9-29 21-29 14 0 22 11 20 31-5-2-8-8-9-15-9 9-20 12-32 13z" fill="#35233a" />
      <path d="M24 100c2-17 12-27 26-27s24 10 26 27" fill="#faf7f2" />
    </svg>
  </div>;
}

export default function AlumniDetailPage() {
  const [selectedSemester, setSelectedSemester] = useState("4");
  const [ipk, setIpk] = useState("3.84");
  const [kipk, setKipk] = useState<"Ya" | "Tidak">("Tidak");
  const [scholarship, setScholarship] = useState("Beasiswa Unggulan Kemendikbud");
  const [ipi, setIpi] = useState("-");
  const [ukt, setUkt] = useState("5.000.000");
  const [records, setRecords] = useState(initialRecords);
  const [status, setStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const loadRecord = (semester: string) => {
    setSelectedSemester(semester);
    const existing = records.find((record) => record.semester === Number(semester));
    setIpk(existing?.ipk ?? (semester === "4" ? "3.84" : ""));
    setKipk(existing?.kipk ?? "Tidak");
    setScholarship(existing?.scholarship === "-" ? "-" : existing?.scholarship ?? "Beasiswa Unggulan Kemendikbud");
    setUkt(existing?.ukt ?? "5.000.000");
    setIpi("-");
    setStatus("");
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const option = periodOptions.find((item) => item.value === selectedSemester);
    if (!option || !ipk.trim() || !ukt.trim()) return;
    const record: ProgressRecord = {
      semester: Number(selectedSemester),
      period: option.label.replace(/ \(Semester \d+\)$/, ""),
      ipk: ipk.trim(),
      kipk,
      scholarship: scholarship || "-",
      ukt: ukt.trim(),
    };
    setRecords((current) => [record, ...current.filter((item) => item.semester !== record.semester)].sort((a, b) => b.semester - a.semester));
    setStatus(`Progress semester ${selectedSemester} tersimpan pada pratinjau.`);
  };

  const editRecord = (record: ProgressRecord) => {
    loadRecord(String(record.semester));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const deleteRecord = (record: ProgressRecord) => {
    setRecords((current) => current.filter((item) => item.semester !== record.semester));
    setStatus(`Riwayat semester ${record.semester} dihapus dari pratinjau.`);
  };

  return <div className="b4-page">
    <B4Navbar />
    <main>
      <section className="b4-hero" aria-labelledby="b4-detail-page-title">
        <div className="b4-container">
          <nav aria-label="Breadcrumb" className="b4-breadcrumb">
            <Link href="/admin#layanan">Layanan</Link><ChevronRight size={14} aria-hidden="true" />
            <Link href="/admin/alumni-perguruan-tinggi">Alumni dan Beasiswa</Link><ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">Informasi Detail Alumni</span>
          </nav>
          <h1 id="b4-detail-page-title">Informasi Detail Alumni</h1>
          <p>Kelola progress alumni selama menempuh pendidikan di Perguruan Tinggi berdasarkan periode</p>
        </div>
      </section>

      <div className="b4-container">
        <B4Tabs active="Alumni di PT" />
        <section className="b4-alumniDetail" aria-label="Informasi dan progress kuliah alumni">
          <header className="b4-detailProfile">
            <AlumniPortrait />
            <div><h2>Dian Permata Sari</h2><p>NISN 1234••••••7370</p></div>
          </header>

          <div className="b4-detailTopGrid">
            <section className="b4-detailPanel b4-alumniInfo" aria-labelledby="b4-alumni-info-title">
              <h2 id="b4-alumni-info-title">Data Induk Alumni</h2>
              <dl>
                {[
                  ["Nama Lengkap", "Dian Permata Sari"],
                  ["NISN", "1234••••••7370"],
                  ["Kelas / Angkatan", "XII IPA 3 / 2021"],
                  ["Status Penerima KIP-K", "Ya"],
                  ["Nama Perguruan Tinggi", "Universitas Indonesia"],
                  ["Jenis Perguruan Tinggi", "Perguruan Tinggi Negeri (PTN)"],
                  ["Program Studi", "Psikologi"],
                  ["Jalur Masuk", "SNBP"],
                ].map(([label, value]) => <div className="b4-infoRow" key={label}><dt>{label}</dt><span aria-hidden="true">:</span><dd>{value}</dd></div>)}
              </dl>
            </section>

            <form ref={formRef} className="b4-detailPanel b4-progressForm" onSubmit={handleSave} aria-labelledby="b4-progress-title">
              <h2 id="b4-progress-title">Update Progress Kuliah</h2>
              <div className="b4-progressFields">
                <label className="b4-formField"><span>Periode / Semester<span className="b4-required">*</span></span>
                  <span className="b4-inputWrap"><select value={selectedSemester} onChange={(event) => loadRecord(event.target.value)} required>
                    {periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select><ChevronDown size={18} aria-hidden="true" /></span>
                </label>
                <fieldset className="b4-formField b4-kipkField"><legend>Status Penerima KIP-K<span className="b4-required">*</span></legend>
                  <div className="b4-radioChoices">
                    {[{ value: "Ya", label: "Penerima" }, { value: "Tidak", label: "Bukan Penerima" }].map((choice) => <label className={kipk === choice.value ? "b4-radioChoice b4-radioSelected" : "b4-radioChoice"} key={choice.value}>
                      <input type="radio" name="kipk" value={choice.value} checked={kipk === choice.value} onChange={() => setKipk(choice.value as "Ya" | "Tidak")} />{choice.label}
                    </label>)}
                  </div>
                </fieldset>
                <label className="b4-formField"><span>IP-Kumulatif<span className="b4-required">*</span></span><input value={ipk} onChange={(event) => setIpk(event.target.value)} required inputMode="decimal" /></label>
                <label className="b4-formField"><span>Nama Beasiswa (Jika Ada)</span>
                  <span className="b4-inputWrap"><select value={scholarship} onChange={(event) => setScholarship(event.target.value)}>
                    <option>Beasiswa Unggulan Kemendikbud</option><option>Beasiswa Unggulan</option><option>Beasiswa Prestasi</option><option value="-">Tidak ada</option>
                  </select><ChevronDown size={18} aria-hidden="true" /></span>
                </label>
                <label className="b4-formField"><span>IPI (Khusus Mandiri)</span><input value={ipi} onChange={(event) => setIpi(event.target.value)} /></label>
                <label className="b4-formField"><span>UKT / Semester<span className="b4-required">*</span></span>
                  <span className="b4-currencyField"><span>Rp</span><input value={ukt} onChange={(event) => setUkt(event.target.value)} required inputMode="numeric" /><small>/ Semester</small></span>
                </label>
              </div>
              <div className="b4-formActions"><p role="status">{status || ""}</p><div>
                <button type="submit" className="b4-saveProgress">Simpan</button>
                <button type="button" className="b4-syncProgress" onClick={() => setStatus("Sinkronisasi backend belum tersedia pada pratinjau ini.")}><Upload size={17} fill="currentColor" />Sinkronkan Data</button>
              </div></div>
            </form>
          </div>

          <section className="b4-detailPanel b4-historyPanel" aria-labelledby="b4-history-title">
            <h2 id="b4-history-title">Riwayat Progress Perkuliahan</h2>
            <div className="b4-historyTableWrap" role="region" aria-label="Riwayat progress perkuliahan" tabIndex={0}>
              <table className="b4-historyTable">
                <thead><tr><th scope="col">Periode Semester</th><th scope="col">IPK</th><th scope="col">Penerima KIP-K</th><th scope="col">Beasiswa Terdaftar</th><th scope="col">UKT</th><th scope="col"><span className="b4-srOnly">Aksi</span></th></tr></thead>
                <tbody>{records.length ? records.map((record) => <tr key={record.semester}>
                  <td>{record.period} (Semester {record.semester})</td><td>{record.ipk}</td><td>{record.kipk === "Ya" ? "Ya" : "Tidak"}</td><td>{record.scholarship}</td><td>Rp {record.ukt}</td>
                  <td className="b4-historyActions"><button type="button" aria-label={`Edit progress semester ${record.semester}`} onClick={() => editRecord(record)}><Pencil size={18} fill="currentColor" /></button><button type="button" aria-label={`Hapus progress semester ${record.semester}`} onClick={() => deleteRecord(record)}><Trash2 size={18} fill="currentColor" /></button></td>
                </tr>) : <tr><td colSpan={6} className="b4-historyEmpty">Belum ada riwayat progress tersimpan.</td></tr>}</tbody>
              </table>
            </div>
            <p className="b4-detailDemoNote">Pratinjau B4 · Data contoh. Perubahan hanya tersimpan selama halaman dibuka.</p>
          </section>
        </section>
      </div>
    </main>
  </div>;
}
