import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as XLSX from 'xlsx';
function compile(file,deps={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require:id=>deps[id],URL,Date});return module.exports;}
const csv=compile('../lib/b4-catalog-csv.ts'),excel=compile('../lib/b4-catalog-excel.ts',{'./b4-catalog-csv':csv});
const program={'Nama Beasiswa':'Program Sekolah',Jenjang:'SMA',Durasi:'','Satuan Durasi':'','Periode Pendaftaran':''};
const criterion={'Nama Beasiswa':'Program Sekolah',Jenjang:'SMA','Nama Syarat':'Rapor minimum','Jenis Kriteria':'Rata-rata Rapor',Operator:'>=','Nilai Syarat':'85',Bobot:''};
test('downloaded XLSX has separate named tables, blank inputs and teacher-facing columns',()=>{const book=XLSX.read(fs.readFileSync(new URL('../public/templates/template-katalog-beasiswa.xlsx',import.meta.url)),{type:'buffer',cellFormula:true});assert.deepEqual(book.SheetNames,['Beasiswa','Kriteria','Panduan']);assert.deepEqual(XLSX.utils.sheet_to_json(book.Sheets.Beasiswa,{header:1})[0],Array.from(excel.PROGRAM_COLUMNS));assert.equal(XLSX.utils.sheet_to_json(book.Sheets.Beasiswa).length,0);});
test('teacher criteria rows become the existing validated API payload without JSON input',()=>{const row=excel.parseCatalogExcelRows([program,{}],[criterion,{}])[0];assert.equal(row.errors.length,0);assert.equal(row.input.kriteria[0].tipe_kriteria,'rata_rapor');assert.equal(row.input.kriteria[0].nilai_kriteria,'85');assert.equal(row.input.durasi,null);assert.equal(row.input.periode_apply,null);});
test('unmatched criteria, invalid weights, unknown fields and missing rules do not silently import',()=>{assert.throws(()=>excel.parseCatalogExcelRows([program],[{...criterion,'Nama Beasiswa':'Lain'}]));assert.throws(()=>excel.parseCatalogExcelRows([{...program,nisn:'123'}],[criterion]));for(const rules of [[],[{...criterion,Bobot:'0'}],[{...criterion,Operator:'contains'}],[{...criterion,'Jenis Kriteria':'toString'}],[{...criterion,'Nilai Syarat':'=1+1'}]])assert.ok(excel.parseCatalogExcelRows([program],rules)[0].errors.length);});
test('Excel input preserves its row number and validates duplicate programs and invalid dates',()=>{const p={...program,__rowNum__:8};assert.equal(excel.parseCatalogExcelRows([p],[criterion])[0].line,9);assert.ok(excel.parseCatalogExcelRows([program,program],[criterion])[1].errors.length);assert.ok(excel.parseCatalogExcelRows([{...program,'Tanggal Buka':'2026-02-30'}],[criterion])[0].errors.length);});
