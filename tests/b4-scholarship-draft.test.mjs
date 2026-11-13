import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../lib/b4-scholarship-draft.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { newScholarshipDraft, scholarshipDraftErrors, isScholarshipDraft } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const valid = () => ({ ...newScholarshipDraft(), name: "Program Sintetis", provider: "Penyelenggara Sintetis", description: "Draf pengujian lokal.", criteria: [{ key: "one", name: "Syarat contoh", value: "80", weight: "" }] });

test("draf membedakan informasi kosong dari bobot opsional tanpa nilai default", () => {
  assert.deepEqual(scholarshipDraftErrors(valid()), {});
  const errors = scholarshipDraftErrors(newScholarshipDraft());
  for (const field of ["name", "provider", "description", "criteria.0.name"]) assert.ok(errors[field]);
  assert.equal(valid().criteria[0].weight, "");
  assert.ok(scholarshipDraftErrors({ ...valid(), criteria: [{ ...valid().criteria[0], weight: "abc" }] })["criteria.0.weight"]);
});

test("alamat dan tanggal draf menolak skema berbahaya, kredensial dan urutan terbalik", () => {
  for (const registrationUrl of ["javascript:alert(1)", "https://user:password@example.test", "bukan-url"]) {
    assert.ok(scholarshipDraftErrors({ ...valid(), registrationUrl }).registrationUrl);
  }
  assert.equal(scholarshipDraftErrors({ ...valid(), registrationUrl: "https://example.test/daftar" }).registrationUrl, undefined);
  assert.ok(scholarshipDraftErrors({ ...valid(), opens: "2026-08-01", closes: "2026-07-01" }).closes);
  assert.ok(scholarshipDraftErrors({ ...valid(), opens: "2026-02-31" }).opens);
  assert.deepEqual(scholarshipDraftErrors({ ...valid(), opens: "2026-08-01", closes: "2026-08-01" }), {});
});

test("pemulihan menolak draf rusak dan identitas kriteria ganda", () => {
  assert.equal(isScholarshipDraft(valid()), true);
  assert.equal(isScholarshipDraft({ ...valid(), criteria: "rusak" }), false);
  assert.equal(isScholarshipDraft({ ...valid(), level: "Kuliah & SMA" }), false);
  assert.equal(isScholarshipDraft({ ...valid(), criteria: [valid().criteria[0], valid().criteria[0]] }), false);
});
