import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
const reactUrl=new URL("../node_modules/react/index.js",import.meta.url).href;
const jsxUrl=new URL("../node_modules/react/jsx-runtime.js",import.meta.url).href;
async function load(mode,flag){
 const source=fs.readFileSync("components/b4/SampleData.tsx","utf8")
  .replaceAll("process.env.NODE_ENV",JSON.stringify(mode))
  .replaceAll("process.env.NEXT_PUBLIC_B4_SAMPLE_VALUES",JSON.stringify(flag));
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText
 .replace('"react/jsx-runtime"',JSON.stringify(jsxUrl)).replace('"react"',JSON.stringify(reactUrl));
 return import("data:text/javascript;base64,"+Buffer.from(code).toString("base64"));
}
test("dummy only fills missing display values; actual zero and known data stay unchanged",async()=>{
 const {SampleValue}=await load("development","true");
 const render=(value)=>renderToStaticMarkup(React.createElement(SampleValue,{label:"IPK",value}));
 assert.match(render(null),/3,65/);assert.match(render(null),/data-source="local-presentation"/);assert.doesNotMatch(render(null),/Dummy|contoh/);
 assert.equal(render(0),"0");assert.equal(render("3,92"),"3,92");
});
test("production and disabled preview never insert samples",async()=>{
 for(const [mode,flag] of [["production","true"],["development","false"]]){
  const {SampleValue,SampleBlock}=await load(mode,flag);
  assert.equal(renderToStaticMarkup(React.createElement(SampleValue,{label:"IPK",value:"-"})),"-");
  const html=renderToStaticMarkup(React.createElement(SampleBlock,{fallback:"Belum tersedia"},"3,65"));
  assert.equal(html,"Belum tersedia");
 }
});
test("sample progress remains read-only with no form, submit or database identity",async()=>{
 const {SampleCollegeProgress}=await load("development","true");
 const html=renderToStaticMarkup(React.createElement(SampleCollegeProgress));
 assert.match(html,/data-source="local-presentation"/);assert.doesNotMatch(html,/Dummy|contoh/);assert.match(html,/Beasiswa TELADAN/);
 assert.doesNotMatch(html,/<form|<input|type="submit"|study_tracer_id|siswa_id/);
});

test("alumni admission examples match the program context and never assign UTBK to an overseas route",async()=>{
 const {alumniAdmissionSamples}=await load("development","true");
 const fields=alumniAdmissionSamples("Entrepreneurship and Operational Management","Luar Negeri",null,"2024");
 assert.equal(fields["Fakultas"],"Bisnis dan Manajemen");
 assert.equal(fields["Skor UTBK"],"Tidak digunakan");
 assert.equal(fields["Tahun Masuk"],"2024");
 const domestic=alumniAdmissionSamples("Teknik Informatika","SNBT","2025","2024");
 assert.equal(domestic["Fakultas"],"Ilmu Komputer");
 assert.equal(domestic["Skor UTBK"],"685");
 assert.equal(domestic["Tahun Masuk"],"2025");
});
test("alumni admission examples disappear when local previews are disabled",async()=>{
 const {alumniAdmissionSamples}=await load("production","true");
 assert.deepEqual(alumniAdmissionSamples("Teknik Informatika","SNBT",null,null),{});
});
