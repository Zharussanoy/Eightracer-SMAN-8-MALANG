import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function view(){
 const code=ts.transpileModule(fs.readFileSync('components/b4/RecommendationAdminView.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(code,{module,exports:module.exports,require:id=>id==='./B4Shell'?{__esModule:true,default:({children})=>React.createElement('main',null,children),Avatar:()=>null}:id==='@/lib/display-copy'?{displayTitle:v=>v}:id==='@/lib/b4-recommendations'?{recommendationCriterionLabel:v=>v,recommendationEligibility:()=>''}:require(id)});
 return module.exports.default;
}
const base={filters:{query:'',classroom:'',cohort:''},page:{data:[],filters:{classrooms:[],cohorts:[]}},loading:false,candidates:[],draft:null,targetLevel:'SMA',busy:false,canGenerate:false,message:''};
test('admin initially asks for student selection and does not show a placeholder profile',()=>{
 const html=renderToStaticMarkup(React.createElement(view(),base));
 assert.match(html,/Cari dan pilih nama siswa/);
 assert.doesNotMatch(html,/Status Rekomendasi|Kelengkapan Data Siswa|Publikasikan/);
});
test('selected student gets optional Save, separate regeneration, and no publication gate',()=>{
 const html=renderToStaticMarkup(React.createElement(view(),{...base,student:{id:1,name:'Siswa Terpilih',classroom:'XII',cohort:'2026'},canGenerate:true,onSave:()=>{},onGenerate:()=>{}}));
 assert.match(html,/Siswa Terpilih/);assert.match(html,/>Simpan<\/button>/);assert.match(html,/Generate Ulang/);
 assert.match(html,/bersifat opsional/);assert.doesNotMatch(html,/Publikasikan ke Siswa|Read Only/);
});
