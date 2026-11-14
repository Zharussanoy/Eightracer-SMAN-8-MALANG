import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../lib/display-copy.ts',import.meta.url),'utf8');
const module={exports:{}};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports});
const {displayTitle}=module.exports;
test('school identities display consistently without changing source filter values',()=>{
 const raw={name:'PANJI SAUMA A.',campus:'UNIVERSITAS NEGERI MALANG',program:'S1 PSIKOLOGI',award:'PRESTASI BASKET'};
 assert.equal(displayTitle(raw.name),'Panji Sauma A.');
 assert.equal(displayTitle(raw.campus),'Universitas Negeri Malang');
 assert.equal(displayTitle(raw.program),'S1 Psikologi');
 assert.equal(displayTitle(raw.award),'Prestasi Basket');
 assert.equal(raw.program,'S1 PSIKOLOGI');
 assert.equal(new URLSearchParams({program_studi:raw.program}).get('program_studi'),'S1 PSIKOLOGI');
});
test('academic acronyms, personal initials and intentional spelling are preserved',()=>{
 assert.equal(displayTitle('penerima kip-k dan beasiswa teladan'),'Penerima KIP-K dan Beasiswa TELADAN');
 assert.equal(displayTitle('NILAI TKA / IPK / UKT / RIASEC'),'Nilai TKA / IPK / UKT / RIASEC');
 assert.equal(displayTitle('S1 DI UIN MAULANA MALIK IBRAHIM MALANG'),'S1 di UIN Maulana Malik Ibrahim Malang');
 assert.equal(displayTitle('Persyaratan LoA dan TOEFL iBT'),'Persyaratan LoA dan TOEFL iBT');
 assert.equal(displayTitle('IP-Kumulatif'),'IPK Kumulatif');
});
test('missing and numeric values keep their meaning',()=>{
 assert.equal(displayTitle(null),'-'); assert.equal(displayTitle(0),'0');
 assert.equal(displayTitle('3,78'),'3,78'); assert.equal(displayTitle('Rp2.000.000'),'Rp2.000.000');
 assert.equal(displayTitle('belum_diketahui'),'Belum Diketahui');
});
