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

test("student filters project real classroom/cohort metadata without exposing NISN",()=>{
 const parse=harness()("lib/b4-students.ts").parseRecommendationStudents;
 const p=parse({data:{data:[{id:11,nama_lengkap:"Siswa Uji",nisn:"PRIVATE_NISN",tahun_lulus:2026,
  riwayat_kelas:[{tanggal_selesai:null,kelas:{id:9,nama_kelas:"XII IPA 1"}}]}],current_page:1,last_page:1,per_page:20,total:1},
  filters:{cohorts:[2025,2026],classrooms:[{id:9,nama_kelas:"XII IPA 1"}]}});
 assert.equal(p.data[0].classroom,"XII IPA 1");assert.equal(p.data[0].hasNisn,true);
 assert.deepEqual(Array.from(p.filters.cohorts),["2025","2026"]);assert.equal(JSON.stringify(p).includes("PRIVATE_NISN"),false);
});
test("FE publication and class filters are translated to the existing protected student API",async()=>{
 let forwarded;const route=harness(async url=>{forwarded=new URL(url);return Response.json({data:{data:[],current_page:1,last_page:1,per_page:20,total:0},filters:{cohorts:[],classrooms:[]}});})("app/api/b4/students/route.ts");
 const r=await route.GET(new NextRequest("http://localhost:3000/api/b4/students?publication=true&kelas_id=9&angkatan=2026",{headers:{Cookie:"eightracer_session=test-only-token"}}));
 assert.equal(r.status,200);assert.equal(forwarded.searchParams.get("rekomendasi_published"),"1");assert.equal(forwarded.searchParams.get("kelas_id"),"9");
 assert.equal(forwarded.searchParams.has("publication"),false);
 const invalid=await route.GET(new NextRequest("http://localhost:3000/api/b4/students?publication=invalid",{headers:{Cookie:"eightracer_session=test-only-token"}}));assert.equal(invalid.status,422);
});

test("editor proxy binds PATCH to the selected student, saved detail and revision",async()=>{
 let forwarded;
 const next={...rawDraft,revision:3,rekomendasi_beasiswa_detail:[{...rawDraft.rekomendasi_beasiswa_detail[0],id:22,is_hidden:false,waktu_disarankan:"Januari 2027",alasan_rekomendasi:"Ditinjau sekolah."}]};
 const route=harness(async(url,init)=>{forwarded={url,method:init.method,body:JSON.parse(init.body)};return Response.json({data:next});})("app/api/b4/recommendations/[id]/items/[detail]/route.ts");
 const context={params:Promise.resolve({id:"11",detail:"22"})};
 const r=await route.PATCH(request("/api/b4/recommendations/11/items/22",{recommendation_id:7,revision:2,reason:" Ditinjau sekolah. ",timing:"Januari 2027"}),context);
 const result=await r.json();assert.equal(r.status,200);assert.equal(result.draft.revision,3);assert.equal(result.draft.candidates[0].detailId,22);assert.equal(result.draft.candidates[0].timing,"Januari 2027");
 assert.equal(forwarded.method,"PATCH");assert.equal(forwarded.body.siswa_id,11);assert.equal(forwarded.body.revision,2);assert.equal(forwarded.body.alasan_rekomendasi,"Ditinjau sekolah.");
 assert.equal(forwarded.url,"https://backend.example/api/rekomendasi-beasiswa/7/detail/22");
 assert.equal(JSON.stringify(result).includes("PRIVATE"),false);
});
test("editor blocks client score changes, foreign student IDs, invalid values and cross-origin writes",async()=>{
 let calls=0;
 const route=harness(async()=>{calls++;return Response.json({data:rawDraft});})("app/api/b4/recommendations/[id]/items/[detail]/route.ts"),context={params:Promise.resolve({id:"11",detail:"22"})};
 const base={recommendation_id:7,revision:2};
 for(const body of [{...base,score:100},{...base,siswa_id:99,hidden:true},{...base,hidden:"true"},{...base,reason:" "},{...base,timing:"x".repeat(181)},{...base,revision:0,hidden:true},base]){
  const r=await route.PATCH(request("/api/b4/recommendations/11/items/22",body),context);assert.equal(r.status,422);
 }
 assert.equal((await route.PATCH(request("/api/b4/recommendations/11/items/22",{...base,hidden:true},"https://untrusted.example"),context)).status,403);
 assert.equal(calls,0);
});
test("delete persists through DELETE and stale edits return a reload instruction without losing scope",async()=>{
 let forwarded;
 const route=harness(async(url,init)=>{forwarded={url,method:init.method,body:JSON.parse(init.body)};return Response.json({data:{...rawDraft,revision:4,rekomendasi_beasiswa_detail:[]}});})("app/api/b4/recommendations/[id]/items/[detail]/route.ts");
 const context={params:Promise.resolve({id:"11",detail:"22"})},body={recommendation_id:7,revision:3};
 const r=await route.DELETE(request("/api/b4/recommendations/11/items/22",body),context);
 assert.equal(r.status,200);assert.equal((await r.json()).draft.candidates.length,0);assert.equal(forwarded.method,"DELETE");assert.equal(forwarded.body.siswa_id,11);assert.equal(forwarded.body.revision,3);
 const stale=harness(async()=>Response.json({message:"Rekomendasi berubah. Muat ulang sebelum menyimpan."},{status:409}))("app/api/b4/recommendations/[id]/items/[detail]/route.ts");
 const conflict=await stale.PATCH(request("/api/b4/recommendations/11/items/22",{...body,hidden:true}),context);
 assert.equal(conflict.status,409);assert.match((await conflict.json()).message,/Muat ulang/);
});
test("published student projection uses the school-edited reason and suggested time",()=>{
 const result=harness()("lib/b4-recommendation-data.ts").parseStudentRecommendations({data:[{id:7,target_jenjang:"SMA",status:"Terpublikasi",beasiswa:[{
  beasiswa_id:4,informasi:info,skor_kecocokan:100,memenuhi_syarat:true,checklist:evaluation.checklist,alasan:"Alasan revisi sekolah.",waktu_disarankan:"Januari 2027",persiapan:[] }]}]});
 assert.equal(result[0].reason,"Alasan revisi sekolah.");assert.equal(result[0].timing,"Januari 2027");
});

test("local catalog preview never invents a personal score or publication",()=>{
 const result=harness()("lib/b4-recommendation-data.ts").parseStudentRecommendations({preview:true,data:[],catalog_preview:[{id:4,...info}]});
 assert.equal(result.length,1);assert.equal(result[0].preview,true);
 assert.equal(result[0].batchId,0);assert.equal(result[0].score,null);
 assert.match(result[0].reason,/Belum dinilai/);assert.equal(result[0].timing,null);
});

test("chat rate limiting preserves retry timing without exposing backend diagnostics",async()=>{
 const route=harness(async()=>Response.json({message:"PRIVATE database or provider detail"},{status:429,headers:{"Retry-After":"17"}}))("app/api/b4/recommendations/chat/route.ts");
 const response=await route.POST(request("/api/b4/recommendations/chat",{message:"Apa yang perlu aku persiapkan?"}));
 const payload=await response.json();
 assert.equal(response.status,429);assert.equal(response.headers.get("retry-after"),"17");
 assert.equal(payload.retry_after,17);assert.match(payload.message,/17 detik/);assert.equal(payload.message.includes("PRIVATE"),false);
});
test("client retry errors retain bounded cooldown metadata",async()=>{
 const api=harness(async()=>Response.json({message:"Tunggu sebentar.",retry_after:12},{status:429}))("lib/b4-recommendation-data.ts");
 await assert.rejects(api.recommendationRequest("/api/b4/recommendations/chat",{method:"POST",body:{message:"Pertanyaan"}}),error=>error.status===429&&error.retryAfter===12);
});

test("automatic student results retain unknown and unmet criteria without a publication gate",()=>{
 const api=harness()("lib/b4-recommendation-data.ts");
 const unknown={...evaluation,lengkap:false,memenuhi:false,checklist:[{...evaluation.checklist[0],status:"belum_diketahui"}]};
 const input={automatic:true,data:{target_jenjang:"SMA",llm_used:false,PRIVATE_NOTE:"not for UI",kandidat:[
  {beasiswa_id:4,beasiswa:info,evaluasi:evaluation,alasan:"Hasil kriteria.",persiapan:[]},
  {beasiswa_id:5,beasiswa:info,evaluasi:unknown,alasan:"Data belum lengkap.",persiapan:["Lengkapi profil."]}
 ]}};
 const result=api.parseStudentRecommendations(input);
 assert.equal(result.length,2);assert.equal(result[0].automatic,true);assert.equal(result[0].key,"auto-SMA-4");
 assert.equal(result[1].complete,false);assert.equal(result[1].meets,false);assert.equal(result[1].checklist[0].status,"belum_diketahui");
 assert.equal(result[1].llmUsed,false);assert.equal(JSON.stringify(result).includes("PRIVATE_NOTE"),false);
 assert.equal(result[0].registrationUrl,null);
});

test("student proxy reads automatic calculations from the authenticated own-profile endpoint",async()=>{
 let forwarded;
 const automatic={automatic:true,data:{target_jenjang:"SMA",llm_used:true,kandidat:[{beasiswa_id:4,beasiswa:info,evaluasi:evaluation,alasan:"Penjelasan sesuai kriteria.",persiapan:[]}]}};
 const route=harness(async(url,init)=>{forwarded={url,init};return Response.json(automatic);})("app/api/b4/rekomendasi/route.ts");
 const r=await route.GET(new NextRequest("http://localhost:3000/api/b4/rekomendasi?role=siswa",{headers:{Cookie:"eightracer_session=test-only-token"}}));
 assert.equal(r.status,200);const p=await r.json();assert.equal(p.data[0].key,"auto-SMA-4");assert.equal(p.data[0].llmUsed,true);
 assert.equal(forwarded.url,"https://backend.example/api/rekomendasi-beasiswa/saya");assert.equal(forwarded.init.method,"GET");
});
