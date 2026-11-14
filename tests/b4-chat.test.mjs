import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const compiled = ts.transpileModule(await readFile(new URL("../lib/b4-chat.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { parseChatInput, parseChatAnswer } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
test("chat hanya menerima pertanyaan serta konteks katalog, tanpa history atau pemilik", () => {
  assert.deepEqual(parseChatInput({ message: " Syaratnya? ", beasiswa_id: 101, target_jenjang: "Kuliah" }), { message: "Syaratnya?", beasiswa_id: 101, target_jenjang: "Kuliah" });
  for (const extra of [{ history: [] }, { siswa_id: 41 }, { role: "admin" }, { token: "privat" }, { beasiswa_id: "101" }, { beasiswa_id: 0 }, { target_jenjang: "Keduanya" }]) assert.throws(() => parseChatInput({ message: "Syarat?", ...extra }));
  for (const message of ["", "   ", "a".repeat(1001), null]) assert.throws(() => parseChatInput({ message }));
});
test("respons ringkas dan fallback faktual tetap terbaca tanpa klaim AI", () => {
  assert.deepEqual(parseChatAnswer({ data: { answer: "Katalog belum cukup." } }), { answer: "Katalog belum cukup.", llmUsed: null, context: null, eligibility: null, sources: [] });
  assert.equal(parseChatAnswer({ data: { answer: "Informasi dari katalog", llm_used: false } }).llmUsed, false);
  assert.equal(parseChatAnswer({ data: { answer: "Jawaban layanan", llm_used: true } }).llmUsed, true);
  for (const payload of [{}, { data: { answer: " " } }, { data: { answer: 123 } }]) assert.throws(() => parseChatAnswer(payload));
});
test("whitelist jawaban mempertahankan nol dan teks, membuang rahasia dan tautan berbahaya", () => {
  const result = parseChatAnswer({ data: { answer: "<img src=x onerror=alert(1)>", llm_used: false, token: "privat", eligibility: { skor: 0, lengkap: false, memenuhi: false, siswa_id: 41, checklist: [{ kriteria: "Nilai", status: "belum_dinilai", syarat: 0, nilai_siswa: 90 }] }, historical_evidence: { nama: "privat" }, sources: [{ label: "Katalog", url: null }, { label: "Resmi", url: "https://example.test/beasiswa" }, { label: "Invalid", url: "javascript:alert(1)" }, { label: "Credentials", url: "https://user:pass@example.test/" }] } });
  assert.equal(result.answer, "<img src=x onerror=alert(1)>"); assert.equal(result.eligibility.score, 0); assert.equal(result.eligibility.checklist[0].required, "0");
  assert.equal(result.sources[1].url, "https://example.test/beasiswa"); assert.equal(result.sources[2].url, null); assert.equal(result.sources[3].url, null);
  for (const value of ["siswa_id", "nilai_siswa", "token", "historical_evidence", "privat"]) assert.equal(JSON.stringify(result).includes(value), false);
});
