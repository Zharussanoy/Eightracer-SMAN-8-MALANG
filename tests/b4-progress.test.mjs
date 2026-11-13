import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const code = ts.transpileModule(await readFile(new URL("../lib/b4-progress.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = await import("data:text/javascript;base64,"+Buffer.from(code).toString("base64"));
const row = { id: 1, period: "Ganjil 2026/2027", semester: 1, status: "aktif", updatedAt: "2026-11-04",
 gpa: null, ukt: 0, ipi: null, kipk: false, scholarships: [], revision: 1, published: false, publishFinancials: false };
test("form kosong tidak mengisi status aktif, semester, biaya, KIP atau IPK contoh", () => {
 const form = api.blankProgress();
 for(const key of ["period","semester","status","gpa","kipk","ukt","ipi"]) assert.equal(form[key], "");
 assert.match(form.date, /^\d{4}-\d{2}-\d{2}$/);
 assert.equal(api.educationStatus(null), "-");
 assert.equal(api.educationStatus("aktif"), "Aktif");
});
test("edit mempertahankan nol dan bukan penerima; nilai belum diketahui tetap null", () => {
 const form = api.formFromProgress(row);
 assert.equal(form.gpa, ""); assert.equal(form.ukt, "0"); assert.equal(form.kipk, "0");
 const result = api.progressPayload(form, row, false);
 assert.equal(result.ipk_terkini, null); assert.equal(result.nominal_ukt, 0);
 assert.equal(result.penerima_kipk, false); assert.equal(result.nominal_ipi, null);
});
test("koreksi manual tidak menghapus keputusan beasiswa lain yang sedang proses", () => {
 const previous = {...row, scholarships: [{id:1,name:"Fixture A",status:"proses",amount:null},{id:2,name:"Fixture B",status:"diterima",amount:500000}]};
 const form = api.formFromProgress(previous);
 assert.deepEqual(form.awardIds, ["2"]);
 const payload = api.progressPayload(form, previous, true);
 assert.deepEqual(payload.beasiswa, [
  {beasiswa_id:1,status_beasiswa:"proses",nominal_beasiswa:null},
  {beasiswa_id:2,status_beasiswa:"diterima",nominal_beasiswa:500000},
 ]);
});
test("nilai di luar batas tidak lolos dan IPI hanya dikirim untuk Mandiri", () => {
 const form = api.formFromProgress(row);
 for(const change of [{semester:"0"},{semester:"41"},{status:""},{gpa:"4.1"},{ukt:"-1"},{gpa:"NaN"}]) assert.throws(()=>api.progressPayload({...form,...change}, row, true));
 assert.equal(api.progressPayload({...form,ipi:"1000000"}, row, false).nominal_ipi, null);
 assert.equal(api.progressPayload({...form,ipi:"1000000"}, row, true).nominal_ipi, 1000000);
});


test("TELADAN yang sudah diterima tetap menjadi opsi dan tercentang meskipun tidak ada dalam katalog aktif", () => {
 const alumni={catalogOptions:[{id:4,name:"KIP-K"},{id:6,name:"Bebas IPI"}],progress:[{...row,scholarships:[{id:5,name:"Beasiswa TELADAN",status:"diterima",amount:null}]}],scholarshipEvidence:{kipk:null,needsReview:false,programs:[]}};
 const form=api.newProgressForAlumni(alumni);
 assert.deepEqual(form.awardIds,["5"]);
 assert.equal(api.progressScholarshipOptions(alumni).get(5),"Beasiswa TELADAN");
 for(const field of ["period","semester","status","gpa","ukt","ipi","kipk"])assert.equal(form[field],"");
});

test("pergantian alumni tidak membawa beasiswa orang sebelumnya dan status KIP tetap mengikuti data", () => {
 const alumni={catalogOptions:[],progress:[],scholarshipEvidence:{kipk:true,needsReview:false,programs:[]}};
 assert.equal(api.newProgressForAlumni(alumni).kipk,"1");
 assert.deepEqual(api.newProgressForAlumni(alumni).awardIds,[]);
 assert.equal(api.newProgressForAlumni({...alumni,scholarshipEvidence:{kipk:null,needsReview:false,programs:[]}}).kipk,"");
 assert.equal(api.newProgressForAlumni({...alumni,scholarshipEvidence:{kipk:false,needsReview:true,programs:[]}}).kipk,"");
});

test("keputusan terbaru menolak/proses tidak dicentang dari riwayat lama; mode edit tetap memakai periode yang dipilih", () => {
 const recent={...row,id:2,scholarships:[{id:5,name:"TELADAN",status:"ditolak",amount:null}]};
 const older={...row,id:1,scholarships:[{id:5,name:"TELADAN",status:"diterima",amount:null}]};
 const alumni={catalogOptions:[],progress:[recent,older],scholarshipEvidence:{kipk:null,needsReview:false,programs:[]}};
 assert.deepEqual(api.newProgressForAlumni(alumni).awardIds,[]);
 assert.deepEqual(api.formFromProgress(older).awardIds,["5"]);
});
