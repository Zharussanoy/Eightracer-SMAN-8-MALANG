import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const module={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('components/b4/ChatMessageText.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require});
const render=text=>renderToStaticMarkup(React.createElement(module.exports.default,{text}));
test('chat shows bold section labels and real bullet lists, including Unicode emoji',()=>{
 const html=render('Yuk! 🎓\n\n**Persyaratan:**\n- Rapor\n- Identitas\n\n**Persiapan:**\n1. Cek jadwal');
 assert.match(html,/<strong>Persyaratan:<\/strong>/);assert.match(html,/<ul><li>Rapor<\/li><li>Identitas<\/li><\/ul>/);
 assert.match(html,/🎓/);assert.doesNotMatch(html,/\*\*/);
});
test('provider HTML and Markdown links are inert text, never executable markup',()=>{
 const html=render('<script>alert(1)</script>\n- **<img src=x onerror=alert(1)>**\n[jahat](javascript:alert(1))');
 assert.doesNotMatch(html,/<script|<img|<a\s/);assert.match(html,/&lt;script&gt;/);assert.match(html,/javascript:alert/);
});
test('user wording, unknown values and numbers are preserved, not rewritten',()=>{
 const html=render('**IPK:**\n- Belum diketahui\n- Nilai >= 85\n- Rp2.000.000');
 assert.match(html,/Belum diketahui/);assert.match(html,/85/);assert.match(html,/Rp2.000.000/);
});
