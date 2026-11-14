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
});
