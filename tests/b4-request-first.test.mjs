import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {setImmediate as tick} from 'node:timers/promises';
const require=createRequire(import.meta.url), React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{NextRequest}=require('next/server');
const generated={automatic:true,state:'ready',generated_at:'2026-11-15T00:00:00+07:00',data:{target_jenjang:'SMA',llm_used:false,kandidat:[{beasiswa_id:4,beasiswa:{nama_beasiswa:'Program Akademik',jenjang:'SMA'},evaluasi:{skor:100,lengkap:true,memenuhi:true,checklist:[{kriteria:'nilai_tka',operator:'>=',syarat:'80',status:'terpenuhi'}]},alasan:'Nilai memenuhi kriteria yang tercatat.',persiapan:[]}]}};
function harness(result={data:[],state:'not_started'},fetcher=async()=>Response.json(generated),extras={}){
 const cache=new Map(),mocks={
  './B4Shell':{__esModule:true,default:({children})=>React.createElement('main',null,children),Avatar:()=>null},
  './SampleData':{SampleValue:({value})=>value??'-',sampleAlumniReference:()=>null},
  './useStudentRecommendations':{useStudentRecommendations:()=>({result,allowed:true})},
  '@/context/UserContext':{useUser:()=>({authStatus:'authenticated',currentUser:{id:'12',role:'siswa',name:'Siswa Terpilih'}})},
  'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},...extras};
 function load(relative){
  if(cache.has(relative))return cache.get(relative).exports;
  let target=path.resolve(relative);if(!fs.existsSync(target)&&target.endsWith('.ts'))target+='x';
  const compiledModule={exports:{}};cache.set(relative,compiledModule);
  const code=ts.transpileModule(fs.readFileSync(target,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const localRequire=id=>id==='server-only'?{}:mocks[id]??(id.startsWith('@/')?load(id.slice(2)+'.ts'):id.startsWith('.')?load(path.join(path.dirname(relative),id)+'.ts'):require(id));
  vm.runInNewContext(code,{module:compiledModule,exports:compiledModule.exports,require:localRequire,fetch:fetcher,process:{env:{API_BASE_URL:'https://backend.example/api',NODE_ENV:'production'}},URL,URLSearchParams,Request,Response,Headers,AbortSignal,Date,Intl,console});
  return compiledModule.exports;
 }return load;
}
test('information questions do not request calculations; explicit personalized requests do',()=>{
 const {isRecommendationRequest}=harness()('lib/b4-recommendation-copy.ts');
 for(const q of ['Beasiswa apa yang cocok buat aku?','Aku cocok beasiswa apa?','Hitung rekomendasi saya','Tolong carikan beasiswa','Rekomendasi beasiswa'])assert.equal(isRecommendationRequest(q),true,q);
 for(const q of ['Apa saja persyaratannya?','Apa yang perlu aku persiapkan?','Apa itu rekomendasi beasiswa?','Kenapa beasiswa ini direkomendasikan?','Apa bedanya KIP dengan beasiswa?'])assert.equal(isRecommendationRequest(q),false,q);
});
test('first visit shows an invitation without scores, cards, or example recommendations',()=>{
 const load=harness(),View=load('components/b4/StudentRecommendationsApi.tsx').default;
 const html=renderToStaticMarkup(React.createElement(View));
 assert.match(html,/Mulai Rekomendasi AI/);assert.doesNotMatch(html,/Skor Kecocokan|bc4-scholarCard|86\/100|Beasiswa Unggulan|Dian Permata/);
});
test('stored detail shows evaluation and information before reasoning, with a clear discussion link',()=>{
 const load=harness();const items=load('lib/b4-recommendation-data.ts').parseStudentRecommendations(generated);
 const render=harness({data:items,state:'ready'}),View=render('components/b4/StudentRecommendationsApi.tsx').StudentRecommendationDetailApi;
 const html=renderToStaticMarkup(React.createElement(View,{id:items[0].key}));
 assert.ok(html.indexOf('Alasan Rekomendasi')>html.indexOf('Informasi Beasiswa'));
 assert.ok(html.indexOf('Alasan Rekomendasi')>html.indexOf('Referensi dari Jejak Alumni'));
 assert.match(html,/Bahas Beasiswa Ini/);assert.doesNotMatch(html,/percakapan demo|Skor Kecocokan \(contoh\)/);
});
test('GET reads existing state while explicit POST is self-scoped and validates origin and identity',async()=>{
 const calls=[],load=harness(undefined,async(url,init)=>{calls.push({url,init});return Response.json(generated);});
 const get=load('app/api/b4/rekomendasi/route.ts').GET;
 const response=await get(new NextRequest('http://localhost:3000/api/b4/rekomendasi?role=siswa',{headers:{Cookie:'eightracer_session=test-only'}}));
 assert.equal(response.status,200);assert.equal((await response.json()).state,'ready');assert.equal(calls[0].url,'https://backend.example/api/rekomendasi-beasiswa/saya');assert.equal(calls[0].init.method,'GET');
 const post=load('app/api/b4/recommendations/generate/route.ts').POST;
 const request=(body,origin='http://localhost:3000')=>new NextRequest('http://localhost:3000/api/b4/recommendations/generate',{method:'POST',headers:{Cookie:'eightracer_session=test-only',Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await post(request({target_jenjang:'SMA'}))).status,200);
 assert.equal(calls[1].url,'https://backend.example/api/rekomendasi-beasiswa/saya/generate');assert.equal(calls[1].init.method,'POST');
 assert.equal((await post(request({siswa_id:99}))).status,422);assert.equal((await post(request({},'https://other.example'))).status,403);assert.equal(calls.length,2);
});
for(const overview of [true,false])test(`chat ${overview?'calculates on explicit request':'answers preparation questions without generating results'}`,async()=>{
 const calls=[],updates=[];
 const mockReact={...React,useState:initial=>[initial,value=>updates.push(value)],useEffect:()=>{},useRef:initial=>({current:initial})};
 const load=harness(undefined,undefined,{react:mockReact,'@/lib/b4-recommendation-data':{recommendationRequest:async(url,init)=>{calls.push({url,init});return overview?{data:[],state:'ready'}:{answer:'Siapkan dokumen.',llmUsed:false,scholarshipId:null,suggestions:[]};}}});
 const tree=load('components/b4/ScholarshipChatApi.tsx').default({});
 function nodes(value){return Array.isArray(value)?value.flatMap(nodes):value&&typeof value==='object'&&value.props?[value,...nodes(value.props.children)]:[];}
 const question=overview?'Beasiswa apa yang cocok buat aku?':'Apa yang perlu aku persiapkan?';
 const button=nodes(tree).find(n=>n.type==='button'&&n.props.children===question);assert.ok(button);assert.equal(calls.length,0);
 button.props.onClick();await tick();assert.equal(calls.length,1);assert.equal(calls[0].url,overview?'/api/b4/recommendations/generate':'/api/b4/recommendations/chat');
 assert.equal(calls[0].init.body.siswa_id,undefined);assert.ok(updates.length>0);
});
const general={id:4,name:'Program Akademik',provider:'Penyelenggara Resmi',description:'Informasi umum program sekolah.',level:'Kuliah',opens:null,closes:null,period:null,duration:8,durationUnit:'semester',registrationUrl:'https://example.org/beasiswa',criteria:[{name:'Nilai Rapor Minimum',operator:'>=',required:'80'}],recipients:{total:1,data:[{admissionId:591,name:'Alumni Terdaftar',university:'Universitas Terdaftar',program:'Program Studi',cohort:'2026',evidence:'school_record'}]}};
test('default student page lists general scholarships and keeps the general AI entry below the cards',()=>{
 const load=harness(undefined,undefined,{'next/navigation':{useSearchParams:()=>new URLSearchParams('')},'./useStudentScholarshipCatalog':{useStudentScholarshipCatalog:()=>({data:{data:[general],currentPage:1,lastPage:1,total:1}})}});
 const Page=load('components/b4/StudentRecommendationsPage.tsx').default,html=renderToStaticMarkup(React.createElement(Page));
 assert.match(html,/Program Akademik/);assert.match(html,/catalog-4/);assert.match(html,/Lihat Detail Beasiswa/);
 assert.ok(html.indexOf('>Tanya Eightracer AI<')>html.indexOf('Lihat Detail Beasiswa'));
 assert.doesNotMatch(html,/Skor Kecocokan|Alasan Rekomendasi|Paling Sesuai|86\/100/);
});
test('general detail displays the actual program, provider and recipient without assessing the student',()=>{
 const load=harness(undefined,undefined,{'./useStudentScholarshipCatalog':{useStudentScholarshipCatalog:()=>({data:{data:general}})}});
 const Page=load('components/b4/StudentRecommendationsPage.tsx').StudentRecommendationDetail,html=renderToStaticMarkup(React.createElement(Page,{id:'catalog-4'}));
 for(const text of ['Penyelenggara Resmi','Alumni Terdaftar','Persyaratan Umum','chat?beasiswa=4','/siswa/jejak-alumni/591'])assert.match(html,new RegExp(text.replace(/[?]/g,'\\?')));
 assert.doesNotMatch(html,/Skor Kecocokan|Alasan Rekomendasi|Evaluasi Kriteria Siswa|Dian Permata/);
});
test('general scholarship projection strips private fields and rejects unsafe recipient identifiers',()=>{
 const parse=harness()('lib/b4-general-scholarships.ts').parseGeneralScholarship;
 const item=parse({...general,student_profile:'PRIVATE',registrationUrl:'javascript:alert(1)'},true);
 assert.equal(item.registrationUrl,null);assert.equal('student_profile' in item,false);
 assert.throws(()=>parse({...general,recipients:{total:1,data:[{...general.recipients.data[0],admissionId:-1}]}},true));
});
test('AI opened from a general detail keeps the selected program before personal results exist',async()=>{
 const calls=[],mockReact={...React,useState:initial=>[initial,()=>{}],useEffect:()=>{},useRef:initial=>({current:initial})};
 const load=harness(undefined,undefined,{react:mockReact,'./useStudentScholarshipCatalog':{useStudentScholarshipCatalog:()=>({data:{data:general}})},'@/lib/b4-recommendation-data':{recommendationRequest:async(url,init)=>{calls.push({url,init});return{answer:'Penerima tercatat pada sekolah.',llmUsed:false,scholarshipId:4,suggestions:[]};}}});
 const tree=load('components/b4/ScholarshipChatApi.tsx').default({recommendationId:'4'});
 function nodes(v){return Array.isArray(v)?v.flatMap(nodes):v&&typeof v==='object'&&v.props?[v,...nodes(v.props.children)]:[];}
 const all=nodes(tree);assert.ok(all.some(n=>n.type==='strong'&&n.props.children==='Program Akademik'));
 all.find(n=>n.type==='button'&&n.props.children==='Siapa saja penerima beasiswa ini?').props.onClick();await tick();
 assert.equal(calls.length,1);assert.equal(calls[0].url,'/api/b4/recommendations/chat');assert.equal(calls[0].init.body.beasiswa_id,4);assert.equal(calls[0].init.body.siswa_id,undefined);
});
