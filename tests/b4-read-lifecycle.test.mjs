import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {setImmediate as tick} from 'node:timers/promises';
const require=createRequire(import.meta.url), React=require('react');
function harness(file,mocks={}){
 const effects=[],updates=[],events=new Map(),intervals=new Map(),timers=[];
 const listeners={addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:(name)=>events.delete(name)};
 const modules={react:{...React,useEffect:fn=>effects.push(fn),useState:initial=>[typeof initial==='function'?initial():initial,value=>updates.push(value)],useRef:()=>({current:null})},
  'next/navigation':{useRouter:()=>({replace:()=>{throw Error('Stale request redirected login');}}),useSearchParams:()=>new URLSearchParams()},
  'next/link':{__esModule:true,default:()=>null},
  '@/context/UserContext':{useUser:()=>({authStatus:'authenticated',currentUser:{id:12,role:'siswa',schoolStaff:true},refreshSession:()=>{throw Error('Stale request refreshed session');}})},
  '@/lib/b4-scholarship-evidence':{},'@/lib/b4-progress':{blankProgress:()=>({})},
  '@/lib/eightracer-api':{ApiError:class extends Error{}},'@/lib/display-copy':{displayTitle:v=>v},
  './B4Shell':{__esModule:true,default:()=>null},'./NumberPagination':{__esModule:true,default:()=>null},'./AlumniAcademicTimeline':{__esModule:true,default:()=>null},...mocks};
 const compiledModule={exports:{}};
 const pending=[];
 const defer=()=>new Promise((resolve,reject)=>pending.push({resolve,reject}));
 modules['@/lib/b4-recommendation-data']={recommendationRequest:defer};
 modules['@/lib/b4-alumni-api']={getAlumniTimeline:defer,getAlumniDetail:defer};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,
  {module:compiledModule,exports:compiledModule.exports,require:id=>modules[id]??require(id),fetch:defer,Error,URLSearchParams,document:{...listeners,visibilityState:'visible'},window:{...listeners,setInterval:fn=>{intervals.set(1,fn);return 1;},clearInterval:id=>intervals.delete(id)},setTimeout:fn=>{timers.push(fn);return 1;},clearTimeout:()=>{}});
 return {module:compiledModule,updates,effects,pending,events,intervals,timers};
}
for(const reject of [false,true])test(`recommendation request ${reject?'failure':'success'} after leaving page cannot update state`,async()=>{
 const h=harness('components/b4/useStudentRecommendations.ts');h.module.exports.useStudentRecommendations();
 const cleanup=h.effects[0]();assert.equal(h.pending.length,1);cleanup();
 if(reject)h.pending[0].reject(Object.assign(new Error('Expired'),{status:401}));else h.pending[0].resolve({data:[{key:'old'}]});
 await tick();assert.equal(h.updates.length,0);assert.equal(h.events.size,0);assert.equal(h.intervals.size,0);
});
test('student alumni response after cleanup does not refresh session or update state',async()=>{
 const h=harness('components/b4/StudentAlumniApi.tsx');h.module.exports.default();const cleanup=h.effects[0]();cleanup();
 h.pending[0].resolve(Response.json({message:'Expired'},{status:401}));await tick();assert.equal(h.updates.length,0);assert.equal(h.intervals.size,0);
});
test('admin detail and timeline ignore late responses after navigating away',async()=>{
 const h=harness('components/b4/AdminAlumniDetailPage.tsx');h.module.exports.default({id:'591'});
 const cleanups=h.effects.map(fn=>fn());assert.equal(h.pending.length,2);cleanups.forEach(fn=>fn());
 h.pending[0].resolve({data:{id:591}});h.pending[1].resolve({data:{id:591}});
 await tick();assert.equal(h.updates.length,0);
});
