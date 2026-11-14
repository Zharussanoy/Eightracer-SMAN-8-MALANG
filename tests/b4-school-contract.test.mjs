import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function load(path) {
 let code=ts.transpileModule(await readFile(new URL("../"+path,import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 if (path === "lib/b4-student-alumni.ts") {
  const dependency = ts.transpileModule(await readFile(new URL("../lib/b4-scholarship-evidence.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  code=code.replace('"./b4-scholarship-evidence"',JSON.stringify("data:text/javascript;base64,"+Buffer.from(dependency).toString("base64")));
 }
 return import("data:text/javascript;base64,"+Buffer.from(code).toString("base64"));
}
const catalog=await load("lib/b4-scholarships.ts");
const analytics=await load("lib/b4-school-data.ts");
const alumni=await load("lib/b4-student-alumni.ts");
const missing={known:0,unknown:2,minimum:null,maximum:null,mean:null};
const report={data:{as_of:"2026-11-04T10:00:00+07:00",summary:{alumni:2,all_aid:1,kip:1},
 scholarships:[{label:"KIP/KIP-K",count:1}],kip_by_cohort:[{label:"2026",count:1}],notes:["Catatan sekolah"],
 financial:{measured_alumni:0,ukt:missing,ipk:missing,ranges:[{university:"Kampus Uji",program:"Prodi Uji",count:2,stats:missing}],ipk_trend:[]},periods:[],
 filters:{scholarships:[{value:"kip",label:"KIP/KIP-K"}]}}};
test("catalog detail preserves BE criteria, duration decimals and unknown dates for editing",()=>{
 const result=catalog.parseScholarshipRow({id:8,nama_beasiswa:"Program Uji",jenjang:"Kuliah",is_active:true,
 durasi:"2.50",satuan_durasi:"tahun",periode_apply:"September - Oktober",tanggal_buka:null,tanggal_tutup:null,
 kriteria:[{nama_kriteria:"Rapor",tipe_kriteria:"rata_rata_rapor",operator:">=",nilai_kriteria:"85",bobot:"1.50"}]});
 assert.equal(result.duration,2.5);
 assert.equal(result.registrationStatus,"belum_ditentukan");
 assert.deepEqual(result.input.kriteria,[{nama_kriteria:"Rapor",tipe_kriteria:"rata_rata_rapor",operator:">=",nilai_kriteria:"85",bobot:1.5}]);
 assert.equal(result.input.tanggal_buka,null);
});
test("school-source response fits the friend FE contract without turning missing finance into zero",()=>{
 const result=analytics.parseSchoolAnalytics(report);
 assert.equal(result.total,2);assert.equal(result.recipients,1);assert.equal(result.kipk,1);
 assert.equal(result.ukt.minimum,null);assert.equal(result.ukt.unknown,2);
 assert.equal(result.ranges[0].university,"Kampus Uji");assert.equal(result.ranges[0].stats.mean,null);
 assert.equal(result.ipkTrend.length,0);
});
test("real zero fees and GPA values stay numeric, malformed counts are rejected",()=>{
 const input=structuredClone(report);input.data.financial.ukt={known:1,unknown:1,minimum:0,maximum:0,mean:0};
 assert.equal(analytics.parseSchoolAnalytics(input).ukt.minimum,0);
 input.data.summary.all_aid="invalid";assert.throws(()=>analytics.parseSchoolAnalytics(input));
});
test("school scholarship options retain source identifiers instead of inventing catalog IDs",()=>{
 assert.deepEqual(analytics.schoolScholarshipOptions(report),[{id:"kip",name:"KIP/KIP-K"}]);
 const bad=structuredClone(report);bad.data.filters.scholarships[0].value="https://invalid.example";
 assert.throws(()=>analytics.schoolScholarshipOptions(bad));
});
test("student detail uses the selected published admission and does not invent private financial data",()=>{
 const payload={data:{masuk_pt:{id:15,nama_lengkap:"Alumni Uji",tahun_lulus:2026,perguruan_tinggi:{nama_pt:"Kampus Uji",jenis_pt:"Negeri"},program_studi:"Fisika",jalur_masuk:"SNBT"},timeline:[
 {type:"progress_semester",label:"Semester 1",data:{semester:1,beasiswa:[{nama_beasiswa:"Program Uji",status:"diterima"}]}}]}};
 const result=alumni.parseStudentAlumniDetail(payload,15);
 assert.equal(result.alumni.name,"Alumni Uji");assert.equal(result.alumni.graduationYear,"2026");
 assert.equal(result.events[0].ukt,null);assert.equal(result.events[0].scholarships[0].status,"diterima");
 assert.equal(JSON.stringify(result).includes("nisn"),false);
});


test("student detail rejects another admission even when the URL is valid",()=>{
 assert.throws(()=>alumni.parseStudentAlumniDetail({data:{masuk_pt:{id:16,nama_lengkap:"Alumni Lain"}}},15));
});


test("status KIP tidak dan kosong tetap berbeda tanpa mengganti nama beasiswa",async()=>{
 const evidence=await load("lib/b4-scholarship-evidence.ts");
 assert.equal(evidence.kipEvidenceLabel(evidence.parseScholarshipEvidence(null)),"Belum diketahui");
 assert.equal(evidence.kipEvidenceLabel(evidence.parseScholarshipEvidence({penerima_kipk:false,needs_review:false,beasiswa:[]})),"Bukan penerima");
 const item=evidence.parseScholarshipEvidence({penerima_kipk:null,needs_review:false,beasiswa:[{nama_beasiswa:"Bebas IPI",status:"diterima",source:"progress"}]});
 assert.equal(evidence.scholarshipEvidenceLabel(item),"Bebas IPI");
 assert.equal(evidence.scholarshipEvidenceLabel(evidence.parseScholarshipEvidence(null)),"-");
});


test("label KIP konsisten: kosong bukan berarti bukan penerima", async()=>{
 const evidence=await load("lib/b4-scholarship-evidence.ts");
 assert.equal(evidence.kipStatusLabel(true),"Penerima");
 assert.equal(evidence.kipStatusLabel(false),"Bukan penerima");
 assert.equal(evidence.kipStatusLabel(null),"Belum diketahui");
 assert.equal(evidence.kipStatusLabel(undefined),"Belum diketahui");
 assert.equal(evidence.kipEvidenceLabel({kipk:true,needsReview:false,programs:[]}),"Penerima");
 assert.equal(evidence.kipEvidenceLabel({kipk:true,needsReview:true,programs:[]}),"Perlu verifikasi");
});


test("rentang UKT kampus dan prodi menggunakan kelompok masing-masing tanpa angka contoh",()=>{
 const input=structuredClone(report);
 input.data.financial.tuition_ranges={by_university:[{university:"Kampus Uji",program:null,count:2,stats:missing}],by_program:[{university:null,program:"Fisika",count:1,stats:missing},{university:null,program:"Kimia",count:1,stats:missing}]};
 const parsed=analytics.parseSchoolAnalytics(input);
 assert.equal(parsed.tuitionRanges.university.length,1);
 assert.equal(parsed.tuitionRanges.university[0].count,2);
 assert.equal(parsed.tuitionRanges.program.length,2);
 assert.equal(parsed.tuitionRanges.program[1].program,"Kimia");
 assert.equal(parsed.tuitionRanges.university[0].stats.minimum,null);
 assert.deepEqual(parsed.periods,[]);
});
