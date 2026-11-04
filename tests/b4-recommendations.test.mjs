import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {createRequire} from "node:module";
import ts from "typescript";
const require=createRequire(import.meta.url),root=path.resolve(".");
const {NextRequest}=require("next/server");
const info={nama_beasiswa:"Program Uji",jenjang:"SMA",tanggal_buka:null,tanggal_tutup:null,periode_apply:null,durasi:"2.50",link_pendaftaran:"javascript:alert(1)"};
const evaluation={skor:100,lengkap:true,memenuhi:true,checklist:[{kriteria:"nilai_tka",operator:">=",syarat:"80",status:"terpenuhi"}]};
const rawDraft={id:7,siswa_id:11,status_review:"pending",target_jenjang:"SMA",source_fingerprint:"PRIVATE_HASH",catatan_admin:"PRIVATE_NOTE",
 rekomendasi_beasiswa_detail:[{beasiswa_id:4,beasiswa_snapshot:info,evaluasi_kriteria:evaluation,alasan_rekomendasi:"Sesuai kriteria.",persiapan:["Periksa jadwal."]}]};
function harness(fetcher=async()=>Response.json({data:rawDraft})){
 const cache=new Map();
 function load(relative){
  const file=path.resolve(root,relative);
  if(cache.has(file))return cache.get(file).exports;
  const module={exports:{}};cache.set(file,module);
  const code=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const customRequire=(id)=>{
   if(id==="server-only")return {};
   if(id.startsWith("@/"))return load(id.slice(2)+".ts");
   if(id.startsWith("."))return load(path.relative(root,path.resolve(path.dirname(file),id+".ts")));
   return require(id);
  };
  vm.runInNewContext(code,{exports:module.exports,module,require:customRequire,URL,URLSearchParams,Request,Response,Headers,AbortSignal,
   process:{env:{API_BASE_URL:"https://backend.example/api"}},fetch:fetcher,console},{filename:file});
  return module.exports;
 }
 return load;
}
function request(url,body,origin="http://localhost:3000"){
 return new NextRequest("http://localhost:3000"+url,{method:"POST",headers:{Cookie:"eightracer_session=test-only-token",Origin:origin,"Content-Type":"application/json"},body:JSON.stringify(body)});
}
test("draft projection removes source hashes and admin notes while retaining decimal duration",()=>{
 const api=harness()("lib/b4-recommendation-data.ts"),d=api.parseRecommendationDraft({data:rawDraft});
 assert.equal(d.id,7);assert.equal(d.studentId,11);assert.equal(d.candidates[0].duration,2.5);
 assert.equal(JSON.stringify(d).includes("PRIVATE"),false);
});
test("student projection only selects approved eligible results and keeps unknown period empty",()=>{
 const api=harness()("lib/b4-recommendation-data.ts"),detail={beasiswa_id:4,informasi:info,skor_kecocokan:"100.0000",memenuhi_syarat:true,checklist:evaluation.checklist,alasan:"Alasan asli",persiapan:[]};
 const data={data:[{id:7,target_jenjang:"SMA",status:"Terpublikasi",beasiswa:[detail,{...detail,beasiswa_id:5,memenuhi_syarat:false}]},
  {id:6,target_jenjang:"SMA",status:"Terpublikasi",beasiswa:[detail]}]};
 const result=api.parseStudentRecommendations(data);
 assert.equal(result.length,1);assert.equal(result[0].key,"7-4");assert.equal(result[0].period,null);assert.equal(result[0].registrationUrl,null);
 assert.throws(()=>api.parseStudentRecommendations({data:[{...data.data[0],status:"pending"}]}));
});
test("unknown checklist is retained as unknown and out-of-range scores fail the contract",()=>{
 const api=harness()("lib/b4-recommendation-data.ts"),d=structuredClone(rawDraft);
 d.rekomendasi_beasiswa_detail[0].evaluasi_kriteria={...evaluation,lengkap:false,memenuhi:false,checklist:[{...evaluation.checklist[0],status:"belum_diketahui"}]};
 assert.equal(api.parseRecommendationDraft({data:d}).candidates[0].complete,false);
 d.rekomendasi_beasiswa_detail[0].evaluasi_kriteria.skor=101;
 assert.throws(()=>api.parseRecommendationDraft({data:d}));
});
test("generate proxy forwards the selected student and strips private BE fields",async()=>{
 const calls=[],load=harness(async(url,init)=>{calls.push({url,init});return Response.json({data:rawDraft},{status:201});});
 const route=load("app/api/b4/recommendations/[id]/generate/route.ts");
 const r=await route.POST(request("/api/b4/recommendations/11/generate",{target_jenjang:"SMA"}),{params:Promise.resolve({id:"11"})});
 assert.equal(r.status,201);const p=await r.json();assert.equal(p.draft.id,7);
 assert.equal(calls[0].url,"https://backend.example/api/siswa/11/rekomendasi-beasiswa/generate");
 assert.equal(calls[0].init.method,"POST");assert.equal(JSON.stringify(p).includes("PRIVATE"),false);
});
test("generate rejects cross-origin calls and extra student identifiers before reaching BE",async()=>{
 let calls=0;const route=harness(async()=>{calls++;return Response.json({data:rawDraft});})("app/api/b4/recommendations/[id]/generate/route.ts");
 const context={params:Promise.resolve({id:"11"})};
 assert.equal((await route.POST(request("/api/b4/recommendations/11/generate",{target_jenjang:"SMA"},"https://invalid.example"),context)).status,403);
 assert.equal((await route.POST(request("/api/b4/recommendations/11/generate",{target_jenjang:"SMA",siswa_id:99}),context)).status,422);
 assert.equal(calls,0);
});
test("review proxy binds publication to the selected student's ID",async()=>{
 let forwarded;const route=harness(async(url,init)=>{forwarded=JSON.parse(init.body);return Response.json({data:{...rawDraft,status_review:"disetujui"}});})("app/api/b4/recommendations/[id]/review/route.ts");
 const r=await route.POST(request("/api/b4/recommendations/11/review",{recommendation_id:7,status_review:"disetujui"}),{params:Promise.resolve({id:"11"})});
 assert.equal(r.status,200);assert.equal(forwarded.siswa_id,11);assert.equal(forwarded.status_review,"disetujui");
});
test("provider server errors stay generic and never reach the browser as internal diagnostics",async()=>{
 const route=harness(async()=>Response.json({message:"SQL PRIVATE_KEY database diagnostics"},{status:500}))("app/api/b4/recommendations/[id]/generate/route.ts");
 const r=await route.POST(request("/api/b4/recommendations/11/generate",{target_jenjang:"SMA"}),{params:Promise.resolve({id:"11"})});
 assert.equal(r.status,503);assert.equal((await r.text()).includes("PRIVATE_KEY"),false);
});
test("chat rejects an injected student ID and handles a factual answer without claiming Gemini was used",async()=>{
 let calls=0;const route=harness(async()=>{calls++;return Response.json({data:{answer:"Pilih program yang terdaftar.",llm_used:false,status:"selection_required",suggestions:[{id:4,nama_beasiswa:"Program Uji"}]}});})("app/api/b4/recommendations/chat/route.ts");
 const bad=await route.POST(request("/api/b4/recommendations/chat",{message:"Periksa beasiswa",siswa_id:99}));
 assert.equal(bad.status,422);assert.equal(calls,0);
 const good=await route.POST(request("/api/b4/recommendations/chat",{message:"Periksa beasiswa"}));
 const result=await good.json();assert.equal(good.status,200);assert.equal(result.llmUsed,false);assert.equal(result.suggestions[0].name,"Program Uji");
});
