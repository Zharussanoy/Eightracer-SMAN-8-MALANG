import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import {setImmediate as tick} from "node:timers/promises";

test("student views refresh on focus and while visible, withdraw old data, and clean up polling",async()=>{
 const events=new Map(),state={value:undefined},intervals=new Map();let effect,calls=0;
 const listeners={addEventListener:(event,fn)=>events.set(event,fn),removeEventListener:(event,fn)=>{if(events.get(event)===fn)events.delete(event);}};
 const document={...listeners,visibilityState:"visible"},window={...listeners,setInterval:fn=>{intervals.set(1,fn);return 1;},clearInterval:id=>intervals.delete(id)};
 const values=[{data:[{key:"7-4",reason:"Versi sekolah"}]},{data:[]},new Error("Koneksi terputus")];
 const modules={
  react:{useState:()=>[state.value,v=>{state.value=v;}],useEffect:fn=>{effect=fn;}},
  "next/navigation":{useRouter:()=>({replace:()=>{}})},
  "@/context/UserContext":{useUser:()=>({currentUser:{id:12,role:"siswa"},refreshSession:()=>{}})},
  "@/lib/b4-recommendation-data":{recommendationRequest:async path=>{assert.equal(path,"/api/b4/rekomendasi?role=siswa");calls++;const value=values.shift();if(value instanceof Error)throw value;return value;}}
 };
 const compiled=ts.transpileModule(fs.readFileSync("components/b4/useStudentRecommendations.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};vm.runInNewContext(compiled,{module,exports:module.exports,require:id=>modules[id],AbortController,Error,document,window});
 module.exports.useStudentRecommendations();const cleanup=effect();await tick();
 assert.equal(state.value.data[0].key,"7-4");
 await events.get("focus")();await tick();assert.equal(state.value.data.length,0);
 document.visibilityState="hidden";intervals.get(1)();await tick();assert.equal(calls,2);
 document.visibilityState="visible";intervals.get(1)();await tick();assert.equal(state.value.data,undefined);assert.equal(state.value.error,"Koneksi terputus");
 cleanup();assert.equal(intervals.size,0);assert.equal(events.size,0);
});

test("alumni list reloads the school-published data on focus and drops data withdrawn by school",async()=>{
 const {createRequire}=await import("node:module"),require=createRequire(import.meta.url);
 const React=require("react"),events=new Map(),states=[],intervals=new Map();let effect,stateIndex=0,calls=0;
 const copyModule={exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/display-copy.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:copyModule,exports:copyModule.exports});
 const listeners={addEventListener:(event,fn)=>events.set(event,fn),removeEventListener:(event,fn)=>{if(events.get(event)===fn)events.delete(event);}};
 const document={...listeners,visibilityState:"visible"},window={...listeners,setInterval:fn=>{intervals.set(1,fn);return 1;},clearInterval:id=>intervals.delete(id)};
 const modules={
  react:{...React,useState:initial=>{const index=stateIndex++;states[index]=initial;return[initial,v=>{states[index]=v;}];},useEffect:fn=>{effect=fn;}},
  "next/link":{__esModule:true,default:()=>null},
  "@/context/UserContext":{useUser:()=>({currentUser:{id:12,role:"siswa"},authStatus:"authenticated",refreshSession:()=>{}})},
  "@/lib/b4-scholarship-evidence":{},
  "@/lib/display-copy":copyModule.exports,
  "./B4Shell":{__esModule:true,default:()=>null},"./NumberPagination":{__esModule:true,default:()=>null}
 };
 const compiled=ts.transpileModule(fs.readFileSync("components/b4/StudentAlumniApi.tsx","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const module={exports:{}},fetch=async path=>{assert.match(path,/^\/api\/b4\/student-alumni/);calls++;return calls===1?Response.json({data:[{id:1}],total:1}):Response.json({message:"Alumni tidak dipublikasikan."},{status:404});};
 vm.runInNewContext(compiled,{module,exports:module.exports,require:id=>modules[id]??require(id),AbortController,Error,document,window,fetch,console});
 module.exports.default();const cleanup=effect();await tick();
 assert.equal(states[4].data.total,1);
 await events.get("focus")();await tick();
 assert.equal(states[4].data,undefined);assert.equal(states[4].error,"Alumni tidak dipublikasikan.");
 cleanup();assert.equal(events.size,0);assert.equal(intervals.size,0);
});
