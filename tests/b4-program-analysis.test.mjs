import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(relative,mocks={}){const testModule={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.resolve(relative),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;vm.runInNewContext(code,{module:testModule,exports:testModule.exports,require:id=>mocks[id]??(id==='@/lib/b4-scholarship-api'?{getScholarship:()=>{throw Error('Unexpected detail read');}}:id.startsWith('@/')?load(id.slice(2)+'.ts',mocks):id.startsWith('.')?load(path.join(path.dirname(relative),id)+'.ts',mocks):require(id)),URL,Date,Intl,console,setTimeout});return testModule.exports;}
const api=load('lib/b4-program-analysis.ts');
const candidate=(score=100,complete=true,meets=true,status='terpenuhi')=>({beasiswa_id:4,beasiswa:{nama_beasiswa:'Program Sekolah',jenjang:'SMA'},evaluasi:{skor:score,lengkap:complete,memenuhi:meets,checklist:[{kriteria:'nilai_tka',operator:'>=',syarat:'85',status}],pemeringkatan_ml:{skor_kemiripan:null}}});
const student=(id=1,c=candidate())=>({id,name:'Siswa '+id,classroom:'XII A',fingerprint:'a'.repeat(64),reason:'Ringkasan kriteria',preview:{data:{target_jenjang:'SMA',kandidat:[c]}},note:null,nisn:'PRIVATE'});
test('program analysis projects only student identity and outcomes for the selected program',()=>{const data=api.parseProgramBatch({data:[student()],total:1,next_cursor:null,analysed_at:'2026-11-15T12:00:00+07:00'},4);assert.equal(data.data[0].candidate.id,4);assert.equal(data.data[0].nisn,undefined);assert.equal(data.data[0].note,null);assert.throws(()=>api.parseProgramBatch({data:[student()],total:1,next_cursor:null,analysed_at:'now'},8));});
test('duplicate students, malformed fingerprints and nonadvancing cursor are rejected',()=>{for(const patch of [{data:[student(),student()]},{data:[{...student(),fingerprint:'bad'}]},{next_cursor:2}])assert.throws(()=>api.parseProgramBatch({data:[student()],total:2,next_cursor:null,analysed_at:'now',...patch},4));});
test('fulfilled criteria rank first; incomplete data never becomes eligibility',()=>{const rows=api.parseProgramBatch({data:[student(1,candidate(20,true,false,'belum_terpenuhi')),student(2,candidate(0,false,false,'belum_diketahui')),student(3)],total:3,next_cursor:null,analysed_at:'now'},4).data;assert.deepEqual(Array.from(api.sortProgramStudents(rows),s=>s.id),[3,2,1]);assert.equal(rows[1].candidate.complete,false);});
test('optional annotations do not accept editable ML scores',()=>{const note=api.parseProgramNote({revision:2,reason:'Periksa jadwal',timing:'Juli',score:10});assert.equal(note.revision,2);assert.equal(note.score,undefined);assert.throws(()=>api.parseProgramNote({revision:0}));});
test('staff starts with program catalog and has no automatically selected student',()=>{const View=load('components/b4/AdminProgramRecommendationsApi.tsx',{'@/context/UserContext':{useUser:()=>({currentUser:{schoolStaff:true},refreshSession:()=>{}})},'./B4Shell':{__esModule:true,default:({children})=>React.createElement('main',null,children)},'./NumberPagination':{__esModule:true,default:()=>null},'next/link':{__esModule:true,default:({children,...p})=>React.createElement('a',p,children)}}).default;const html=renderToStaticMarkup(React.createElement(View));assert.match(html,/Pilihan Beasiswa/);assert.doesNotMatch(html,/Cari nama siswa|Bagas|Evaluasi Kriteria|Publikasikan/);});


test('program detail consumes the normalized BFF row once and rejects a mismatched or incomplete program',async()=>{
 let row={id:4,name:'Program Sintetis',registrationStatus:'dibuka',input:{kriteria:[]}};
 const api=load('components/b4/AdminProgramRecommendationsApi.tsx',{'@/context/UserContext':{useUser:()=>({})},'./B4Shell':{__esModule:true,default:()=>null},'./NumberPagination':{__esModule:true,default:()=>null},'next/link':{__esModule:true,default:()=>null},'@/lib/b4-scholarship-api':{getScholarship:async id=>{assert.equal(id,4);return row;}}});
 assert.equal(await api.getScholarshipDetail(4),row);
 row={id:5,input:{kriteria:[]}};await assert.rejects(()=>api.getScholarshipDetail(4));
 row={id:4,input:null};await assert.rejects(()=>api.getScholarshipDetail(4));
});
