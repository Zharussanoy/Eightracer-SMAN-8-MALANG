"use client";
import {useState, type ReactNode} from "react";
// Local presentation fixtures only. Never pass these values to save requests, exports or AI.
export const sampleValuesEnabled = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_B4_SAMPLE_VALUES === "true";
const examples: Record<string,string> = {
 "Semester":"3","IPK":"3,65","IP-Kumulatif":"3,65","IP Kumulatif":"3,65",
 "Beasiswa":"Beasiswa TELADAN","Beasiswa Diterima":"Beasiswa TELADAN",
 "Status KIP-K":"Tidak","UKT/Semester":"Rp2.000.000","Biaya UKT":"Rp2.000.000","UKT":"Rp2.000.000","IPI":"Rp0",
 "Status Pendidikan":"Aktif","Pendanaan":"Bantuan UKT","Periode":"Ganjil 2026/2027",
 "Waktu yang Disarankan":"Sebelum periode pendaftaran","Penyelenggara":"Tanoto Foundation"
};
export function SampleValue({value,label,sample}:{value:ReactNode;label:string;sample?:ReactNode}){
 const missing=value===null||value===undefined||value===""||value==="-"||(typeof value==="string"&&/^(Belum|Tidak ditampilkan)/i.test(value));
 const example=sample??examples[label];
 if(!sampleValuesEnabled||!missing||example===undefined)return <>{value??"-"}</>;
 return <span className="bc4-sampleValue" data-source="local-presentation">{example}</span>;
}
export function SampleBlock({children,fallback}:{children:ReactNode;fallback:ReactNode}){
 return sampleValuesEnabled?<div className="bc4-sampleBlock" data-source="local-presentation">{children}</div>:<>{fallback}</>;
}
const semesters=[
 {semester:1,period:"Ganjil 2025/2026",gpa:"3,50"},
 {semester:2,period:"Genap 2025/2026",gpa:"3,60"},
 {semester:3,period:"Ganjil 2026/2027",gpa:"3,65"}
];
export function SampleCollegeProgress(){
 const [active,setActive]=useState(3);
 const selected=semesters.find(row=>row.semester===active)??semesters[2];
 return <SampleBlock fallback={<p className="bc4-empty">Belum ada progres kuliah yang tercatat.</p>}>
  <div className="bc4-semesterScroll"><ol className="bc4-semesterTimeline bc4-previewSemesters">{semesters.map(row=><li key={row.semester}>
   <button type="button" aria-label={"Lihat semester "+row.semester} aria-pressed={active===row.semester} onClick={()=>setActive(row.semester)} className={active===row.semester?"bc4-semesterSelected":""}>S{row.semester}</button>
   <h3>Semester {row.semester}</h3><p>{row.period}</p><small>IPK: {row.gpa}</small>
  </li>)}</ol></div>
  <div className="bc4-detailMetrics bc4-previewMetrics">{[["IPK",selected.gpa],["Beasiswa","Beasiswa TELADAN"],["UKT","Rp2.000.000"],["Status KIP-K","Tidak"]].map(([label,value])=><div className="bc4-yellowCard" key={label}><span>{label}</span><strong>{value}</strong>{label==="Beasiswa"&&<small>Tanoto Foundation</small>}</div>)}</div>
 </SampleBlock>;
}


// Local-only fixture identity; the configured ID belongs to the synthetic alumni dataset.
export function sampleAlumniReference(scholarshipName: string) {
 const id=process.env.NEXT_PUBLIC_B4_REFERENCE_ALUMNI_ID;
 const detailHref=id&&/^[1-9]\d*$/.test(id)?"/siswa/jejak-alumni/"+id:null;
 if (!sampleValuesEnabled || !scholarshipName.trim()) return null;
 return {
  detailHref,
  name: "Nadia Putri",
  university: "Universitas Brawijaya",
  program: "Teknik Informatika",
  cohort: "2024",
  admission: "SNBT",
  gpa: "3,65",
  scholarship: scholarshipName,
 };
}

export function alumniAdmissionSamples(program: string | null, admission: string | null, entryYear: string | null, graduationYear: string | null): Record<string,string> {
 if(!sampleValuesEnabled)return {};
 const overseas=/luar negeri/i.test(admission??"");
 const business=/business|management|manajemen|wirausaha|bisnis/i.test(program??"");
 const computing=/informatika|computer|komputer|software/i.test(program??"");
 const year=entryYear??graduationYear??"2024";
 return {
  "Jenis Perguruan Tinggi":overseas?"Perguruan Tinggi Luar Negeri":"Perguruan Tinggi Negeri",
  "Fakultas":business?"Bisnis dan Manajemen":computing?"Ilmu Komputer":"Sains dan Teknologi",
  "Strata Pendidikan":"S1","Pilihan Jurusan":"Pilihan 1","Tahun Masuk":year,"Masuk PT":year,
  "Lulus SMA":graduationYear??year,"Semester tercatat":"3",
  "Nilai Rapor Pendaftaran":"91,43","Skor UTBK":overseas||!/SNBT/i.test(admission??"")?"Tidak digunakan":"685"
 };
}
export function SamplePortfolio({business=false}:{business?:boolean}){
 return <SampleBlock fallback={<p className="bc4-empty">Belum ada prestasi pendukung yang dipublikasikan.</p>}>
  <div className="bc4-grid3">
   <article className="bc4-yellowCard"><span className="bc4-tag">Provinsi</span><h3>{business?"Kompetisi Rencana Bisnis":"Kompetisi Karya Ilmiah"}</h3><p>Juara 2 · Tahun 2023</p></article>
   <article className="bc4-yellowCard"><span className="bc4-tag">Organisasi</span><h3>OSIS</h3><p>Anggota Divisi Kegiatan · 2022/2023</p></article>
  </div>
 </SampleBlock>;
}
export function SampleSchoolJourney({graduationYear,entryYear}:{graduationYear:string|null;entryYear:string|null}){
 const graduation=Number(graduationYear??entryYear??2024);
 return <SampleBlock fallback={<p className="bc4-empty">Belum ada riwayat sekolah yang dipublikasikan.</p>}>
  <ol className="bc4-schoolTimeline">{[["Masuk SMA",String(graduation-3)],["Lulus SMA",String(graduation)],["Masuk Perguruan Tinggi",entryYear??String(graduation)]].map(([label,year])=><li key={label}><span className="bc4-stageIcon">{year}</span><h3>{label}</h3></li>)}</ol>
 </SampleBlock>;
}
