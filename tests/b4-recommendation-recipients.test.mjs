import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(path.join(process.cwd(),'package.json'));
const ts=require('typescript'),runtime=require('react/jsx-runtime');
const sourceRoot=process.env.RECIPIENTS_PATCH_ROOT??path.join(process.cwd(),'components/b4');
const source=fs.readFileSync(path.join(sourceRoot,'StudentRecommendationAlumniReferences.tsx'),'utf8');

function render(state,scholarshipId=7){
 let requested,retried=false;
 const modules={
  'react/jsx-runtime':runtime,'next/link':{default:'a'},
  '@/lib/display-copy':{displayTitle:value=>value},'./B4Shell':{Avatar:'avatar'},
  './useStudentScholarshipCatalog':{useStudentScholarshipCatalog:path=>{requested=path;return {...state,retry:()=>{retried=true}}}}
 };
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const mod={exports:{}};vm.runInNewContext(compiled,{module:mod,exports:mod.exports,require:id=>modules[id],Number});
 const tree=mod.exports.default({scholarshipId}),nodes=[],words=[];
 function walk(node){if(typeof node==='string'||typeof node==='number'){words.push(String(node));return}if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(walk);return}nodes.push(node);walk(node.props?.children)}
 walk(tree);return {nodes,text:words.join(' '),requested,retried:()=>retried};
}
const program=(data=[])=>({data:{id:7,name:'Program Tercatat',recipients:{total:data.length,data}}});
const recipient={admissionId:83,name:'Penerima Terverifikasi',university:'Kampus Tercatat',program:'Prodi Tercatat',cohort:'2025',evidence:'school_record'};

test('personal detail displays actual recipients of the requested scholarship with direct alumni links',()=>{
 const result=render({data:program([recipient])});
 assert.equal(result.requested,'/api/b4/student-scholarships/7');
 for(const label of ['Penerima Terverifikasi','Kampus Tercatat','Prodi Tercatat','Program Tercatat'])assert.ok(result.text.includes(label));
 assert.equal(result.nodes.find(n=>n.type==='a').props.href,'/siswa/jejak-alumni/83');
 assert.equal(result.nodes.find(n=>n.type==='avatar').props.example,false);
});
test('a manually added program without recipients never receives a substitute alumni reference',()=>{
 const result=render({data:program()});assert.match(result.text,/Belum ada referensi alumni/);
 assert.equal(result.nodes.filter(n=>n.type==='a'||n.type==='avatar').length,0);
 assert.ok(!result.text.includes('Nadia Putri'));
});
test('a response for another scholarship cannot display its recipient',()=>{
 const value=program([recipient]);value.data.id=8;
 const result=render({data:value});assert.match(result.text,/belum dapat dimuat/);assert.ok(!result.text.includes(recipient.name));
});
test('loading, errors, and invalid IDs do not produce fictitious references',()=>{
 assert.match(render({}).text,/Memuat referensi/);
 const error=render({error:'Unavailable'});assert.match(error.text,/belum dapat dimuat/);
 error.nodes.find(n=>n.type==='button').props.onClick();assert.equal(error.retried(),true);
 const invalid=render({},0);assert.equal(invalid.requested,null);assert.match(invalid.text,/belum dapat dimuat/);
});
test('personal recommendation page no longer imports the sample reference and passes scholarship ID',()=>{
 const text=fs.readFileSync(path.join(sourceRoot,'StudentRecommendationsApi.tsx'),'utf8');
 assert.ok(!text.includes('sampleAlumniReference'));assert.ok(!text.includes('local-presentation'));
 assert.match(text,/<StudentRecommendationAlumniReferences key=\{item.scholarshipId\} scholarshipId=\{item.scholarshipId\}/);
});
