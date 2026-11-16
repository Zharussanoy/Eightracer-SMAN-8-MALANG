import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {NextRequest}=require('next/server');
function load(file,mocks={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:id=>mocks[id]??require(id),URLSearchParams});return module.exports;}
const AuthError=class extends Error{};
const query=load('lib/server/school-analytics-query.ts',{'./backend-auth':{AuthError}}).schoolAnalyticsQuery;
test('dashboard and PDF normalize the same selected scholarship, cohort and period filters',()=>{
 const params=new URLSearchParams({angkatan:'2026',prodi:'Teknik & Sains',beasiswa_id:'kip',periode:'Ganjil 2026/2027'});
 const req=new NextRequest('http://localhost:3000/api/b4/analytics?'+params);
 assert.equal(query(req).toString(),query(params).toString());
 assert.throws(()=>query(new URLSearchParams('siswa_id=99')));
 assert.throws(()=>query(new URLSearchParams('angkatan=2025&angkatan=2026')));
});
test('analytics filters stay in tabs and timeline is embedded in alumni detail',()=>{
 const Tab=load('components/admin/b-4/B4Tabs.tsx',{'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},'@/lib/display-copy':{displayTitle:v=>v},'@/components/b4/FigmaIcon':{__esModule:true,default:()=>null}}).default;
 const html=renderToStaticMarkup(React.createElement(Tab,{active:'Analitik Beasiswa',query:'angkatan=2026&beasiswa_id=kip'}));
 assert.match(html,/href="\/admin\/ringkasan-pola\?angkatan=2026&amp;beasiswa_id=kip"/);
 assert.match(html,/href="\/admin\/analitik-beasiswa\?angkatan=2026&amp;beasiswa_id=kip"/);
 assert.doesNotMatch(html,/href="\/admin\/timeline-individu"/);
 const detail=fs.readFileSync('components/b4/AdminAlumniDetailPage.tsx','utf8');
 assert.match(detail,/aria-label="Timeline individu alumni"/);
 assert.match(detail,/<AlumniAcademicTimeline/);
 assert.match(detail,/periodLocked\(editingRow\)/);
 assert.doesNotMatch(detail,/disabled=\{saving \|\| !!form\.id\}/);
 assert.doesNotMatch(detail,/Sinkronkan Data|type="file"|previewAlumniProgress|commitAlumniProgress|downloadProgressTemplate/);
});

// Guard the video revisions against regressions when teammate updates are merged.
function studentAlumniView(data,path){
 const modules={react:{...React,useEffect:()=>{},useState:initial=>[initial===undefined?{key:path+':0:12:authenticated',data}:typeof initial==='function'?initial():initial,()=>{}]},
  'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},
  '@/context/UserContext':{useUser:()=>({authStatus:'authenticated',currentUser:{id:12,role:'siswa'}})},
  '@/lib/b4-scholarship-evidence':{scholarshipEvidenceLabel:()=>'-',kipEvidenceLabel:()=>'-',kipStatusLabel:()=>'-'},
  '@/lib/display-copy':{displayTitle:v=>v},'./FigmaIcon':{__esModule:true,default:()=>null},
  './B4Shell':{__esModule:true,default:({children})=>React.createElement('main',null,children)},'./NumberPagination':{__esModule:true,default:()=>null}};
 return load('components/b4/StudentAlumniApi.tsx',modules);
}
test('published student alumni use table columns and the selected alumnus detail link',()=>{
 const data={data:[{id:31,name:'Alumni Sintetis',university:'Kampus Sintetis',program:'Fisika',admission:'SNBT',status:null}],currentPage:1,lastPage:1,total:1};
 const View=studentAlumniView(data,'/api/b4/student-alumni?page=1').default;
 const html=renderToStaticMarkup(React.createElement(View));
 assert.match(html,/<table/);assert.match(html,/<th[^>]*>Nama Alumni<\/th>/);
 assert.match(html,/href="\/siswa\/jejak-alumni\/31"/);assert.doesNotMatch(html,/bc4-alumniCard/);
});
test('student detail places admission and progress choices after its content',()=>{
 const data={alumni:{id:31,name:'Alumni Sintetis',university:'Kampus Sintetis',program:'Fisika',admission:'SNBT',achievements:[]},events:[]};
 const View=studentAlumniView(data,'/api/b4/student-alumni/31').StudentAlumniDetailApi;
 const html=renderToStaticMarkup(React.createElement(View,{id:'31'}));
 assert.ok(html.indexOf('aria-label="Informasi alumni"')>html.indexOf('Prestasi &amp; Portofolio Pendukung'));
 assert.match(html,/aria-pressed="true"[^>]*>Data Masuk PT/);
});
