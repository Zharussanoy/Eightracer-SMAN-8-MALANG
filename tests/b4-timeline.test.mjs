import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const compile = async (path) => ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const url = (code) => "data:text/javascript;base64," + Buffer.from(code).toString("base64");
const alumni = url(await compile("../lib/b4-alumni.ts"));
const api = await import(url((await compile("../lib/b4-timeline.ts")).replace('"./b4-alumni"', JSON.stringify(alumni))));
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
test("timeline lengkap memakai progres nyata, termasuk nol dan bukan penerima", () => {
 const result = api.parseAlumniTimeline({data});
 assert.equal(result.progress.length,1);assert.equal(result.progress[0].ukt,0);assert.equal(result.progress[0].kipk,false);
 assert.equal(result.progress[0].gpa,0);assert.equal(result.reportScore,null);assert.equal(result.hasNisn,false);
});
test("timeline dengan data inti hilang ditolak, tidak diisi contoh", () => {
 assert.throws(()=>api.parseAlumniTimeline({data:{...data,timeline_complete:false}}));
 assert.throws(()=>api.parseAlumniTimeline({data:{...data,progress:[]}}));
 for(const key of ["ipk_terkini","penerima_kipk","nominal_ukt"])assert.throws(()=>api.parseAlumniTimeline({data:{...data,progress:[{...progress,[key]:null}]}}));
 assert.throws(()=>api.parseAlumniTimeline({data:{...data,education_events:data.education_events.slice(1)}}));
});
test("tanggal tahun saja tidak diubah menjadi bulan perkiraan", () => {
 const result=api.parseAlumniTimeline({data});
 assert.equal(api.eventDate(result.educationEvents[1]),"2024");
 assert.match(api.eventDate(result.educationEvents[0]),/12 Juli 2021/);
 assert.equal(result.educationEvents[2].date,null);
});
test("hanya keputusan beasiswa diterima dihitung, proses tidak dinyatakan penerima", () => {
 assert.equal(api.acceptedAwards({scholarships:[{name:"Fixture A",status:"proses"},{name:"Fixture B",status:"ditolak"}]}),"-");
 assert.equal(api.acceptedAwards({scholarships:[{name:"Fixture A",status:"proses"},{name:"Fixture B",status:"diterima"}]}),"Fixture B");
});
