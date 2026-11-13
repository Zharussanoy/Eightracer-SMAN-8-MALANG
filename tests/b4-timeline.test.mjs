import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import ts from "typescript";
const compile = async (path) => ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const url = (code) => "data:text/javascript;base64," + Buffer.from(code).toString("base64");
const evidence = url(await compile("../lib/b4-scholarship-evidence.ts"));
const alumni = url((await compile("../lib/b4-alumni.ts")).replace('"./b4-scholarship-evidence"', JSON.stringify(evidence)));
const timeline = url((await compile("../lib/b4-timeline.ts")).replace('"./b4-alumni"', JSON.stringify(alumni)));
const api = await import(timeline);
const progress = { id: 9, revision: 1, tanggal_update: "2024-12-20", is_published: false, publish_financials: false,
  semester: 1, periode: "Ganjil 2024/2025", status_pendidikan: "aktif", ipk_terkini: 0, penerima_kipk: false,
  nominal_ukt: 0, nominal_ipi: null, beasiswa: [] };
const data = { id: 1, siswa_id: 2, nama_lengkap: "Alumni Fixture", tahun_lulus: 2024,
  perguruan_tinggi: { id: 3, nama_pt: "Kampus Fixture", jenis_pt: "Negeri" }, program_studi: "Fisika",
  jalur_masuk: "SNBT", status_penerimaan: "diterima", status_terakhir: "aktif", has_nisn: false,
  kelas_terakhir: null, strata_pendidikan: "S1", sub_jalur_mandiri: null, pilihan_ke: null, tahun_masuk_pt: 2024,
  nilai_rapor_pendaftaran: null, skor_utbk: null, progress: [progress], catalog_options: [], timeline_complete: true,
  education_events: [
    { type:"masuk_sekolah",label:"Masuk SMA",date:"2021-07-12",year:2021 },
    { type:"lulus_sekolah",label:"Lulus SMA",date:null,year:2024 },
    { type:"masuk_pt",label:"Masuk Perguruan Tinggi",date:null,year:2024 },
  ] };
test("timeline memakai progres nyata, termasuk nol dan bukan penerima", () => {
 const result = api.parseAlumniTimeline({data});
 assert.equal(result.progress.length,1);assert.equal(result.progress[0].ukt,0);assert.equal(result.progress[0].kipk,false);
 assert.equal(result.progress[0].gpa,0);assert.equal(result.reportScore,null);
});
test("identitas alumni tetap tersedia ketika progres/tanggal belum ada", () => {
 const result = api.parseAlumniTimeline({data:{...data,timeline_complete:false,progress:[],education_events:[data.education_events[1]]}});
 assert.equal(result.name,"Alumni Fixture");assert.equal(result.university,"Kampus Fixture");
 assert.equal(result.studyProgram,"Fisika");assert.equal(result.admissionPath,"SNBT");
 assert.deepEqual(result.progress,[]);assert.equal(result.educationEvents.length,3);
 assert.equal(api.eventDate(result.educationEvents[0]),"-");assert.equal(api.eventDate(result.educationEvents[1]),"2024");assert.equal(api.eventDate(result.educationEvents[2]),"-");
 for(const key of ["ipk_terkini","penerima_kipk","nominal_ukt"]){
  const partial = api.parseAlumniTimeline({data:{...data,progress:[{...progress,[key]:null}]}});
  assert.equal(partial.progress.length,1);
 }
});
test("tanggal tahun saja tidak diubah menjadi bulan perkiraan; peristiwa rusak ditolak", () => {
 const result=api.parseAlumniTimeline({data});
 assert.equal(api.eventDate(result.educationEvents[1]),"2024");
 assert.match(api.eventDate(result.educationEvents[0]),/12 Juli 2021/);
 assert.throws(()=>api.parseAlumniTimeline({data:{...data,education_events:[{type:"unknown"}]}}));
});
test("hanya keputusan beasiswa diterima dihitung", () => {
 assert.equal(api.acceptedAwards({scholarships:[{name:"Fixture A",status:"proses"},{name:"Fixture B",status:"ditolak"}]}),"-");
 assert.equal(api.acceptedAwards({scholarships:[{name:"Fixture A",status:"proses"},{name:"Fixture B",status:"diterima"}]}),"Fixture B");
});
const reactUrl= new URL("../node_modules/react/index.js",import.meta.url).href;
const jsxUrl=new URL("../node_modules/react/jsx-runtime.js",import.meta.url).href;
const link=url('import React from '+JSON.stringify(reactUrl)+';export default function Link(p){return React.createElement("a",p,p.children)}');
const icons=url('import React from '+JSON.stringify(reactUrl)+';const Icon=(p)=>React.createElement("svg",p);export const School=Icon,GraduationCap=Icon,Building2=Icon;');
const status=url(await compile("../lib/b4-progress.ts"));
const copy=url(await compile("../lib/display-copy.ts"));
const samples=url((await compile("../components/b4/SampleData.tsx")).replace('"react/jsx-runtime"',JSON.stringify(jsxUrl)).replace('"react"',JSON.stringify(reactUrl)));
const component = await import(url((await compile("../components/b4/AlumniAcademicTimeline.tsx"))
 .replace('"react/jsx-runtime"',JSON.stringify(jsxUrl)).replace('"react"',JSON.stringify(reactUrl))
 .replace('"./SampleData"',JSON.stringify(samples)).replace('"next/link"',JSON.stringify(link)).replace('"lucide-react"',JSON.stringify(icons))
 .replace('"@/lib/display-copy"',JSON.stringify(copy)).replace('"@/lib/b4-scholarship-evidence"',JSON.stringify(evidence)).replace('"@/lib/b4-timeline"',JSON.stringify(timeline)).replace('"@/lib/b4-progress"',JSON.stringify(status))));
test("panel SMA, PT dan detail semester tetap dirender walaupun semua progres kosong", () => {
 const parsed=api.parseAlumniTimeline({data:{...data,progress:[],education_events:[data.education_events[1]]}});
 const html=renderToStaticMarkup(React.createElement(component.default,{alumni:parsed}));
 for(const text of ["Perjalanan Pendidikan SMA","Perjalanan Pendidikan Perguruan Tinggi","Detail Semester","Kampus Fixture","IPK Kumulatif","Biaya UKT","Status KIP-K"])assert.ok(html.includes(text),text);
 assert.equal((html.match(/disabled=""/g)||[]).length,8);
 assert.ok(html.includes("2024"));assert.ok(!html.includes("Juli 2021"));assert.ok(!html.includes("92.4"));assert.ok(!html.includes("Beasiswa TELADAN"));assert.ok(!html.includes("3,65"));
});
test("permintaan timeline memakai daftar alumni biasa, tanpa menyembunyikan yang belum lengkap", async () => {
 const error=url('export class ApiError extends Error{}');
 const client = await import(url((await compile("../lib/b4-alumni-api.ts")).replace('"./eightracer-api"',JSON.stringify(error)).replace('"./b4-alumni"',JSON.stringify(alumni))));
 const old=globalThis.fetch,paths=[];
 globalThis.fetch=async (path)=>{paths.push(path);return new Response("{}",{headers:{"Content-Type":"application/json"}})};
 try {await client.getTimelineAlumniPage("","","","",1);await client.getAlumniTimeline(1);}
 finally{globalThis.fetch=old;}
 assert.equal(new URL(paths[0],"http://localhost").searchParams.has("timeline_complete"),false);
 assert.equal(paths[1],"/api/b4/alumni/1");
});


test("status KIP pada detail semester memakai istilah yang sama dengan formulir", () => {
 for (const [value,label] of [[true,"Penerima"],[false,"Bukan penerima"],[null,"Belum diketahui"]]) {
  const parsed=api.parseAlumniTimeline({data:{...data,progress:[{...progress,penerima_kipk:value}]}});
  const html=renderToStaticMarkup(React.createElement(component.default,{alumni:parsed}));
  assert.ok(html.includes(`<span>Status KIP-K</span><strong>${label}</strong>`));
 }
});
