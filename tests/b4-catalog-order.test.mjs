import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../lib/b4-catalog-order.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { loadOrderedCatalog, catalogDisplayPage } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const row = (id, name, active = true) => ({ id, name, active, level: "Kuliah", opens: null, closes: null });
const fixture = (rows, perPage = 2) => async currentPage => ({
  data: rows.slice((currentPage - 1) * perPage, currentPage * perPage),
  currentPage, perPage, total: rows.length, lastPage: Math.max(1, Math.ceil(rows.length / perPage)),
});

test("urut seluruh halaman: aktif A–Z, kemudian arsip A–Z sebelum pagination tampilan", async () => {
  const original = [row(1, "Zebra"), row(2, "Arsip A", false), row(3, "beta"), row(4, "Alfa"), row(5, "Arsip Z", false)];
  const calls = [];
  const source = fixture(original);
  const collection = await loadOrderedCatalog(page => { calls.push(page); return source(page); });
  assert.deepEqual(collection.data.map(item => item.id), [4, 3, 1, 2, 5]);
  assert.deepEqual(catalogDisplayPage(collection, 1).data.map(item => item.id), [4, 3]);
  assert.deepEqual(catalogDisplayPage(collection, 2).data.map(item => item.id), [1, 2]);
  assert.deepEqual(catalogDisplayPage(collection, 3).data.map(item => item.id), [5]);
  assert.deepEqual(calls, [1, 2, 3]);
  assert.deepEqual(original.map(item => item.id), [1, 2, 3, 4, 5]);
});

test("nama sama stabil memakai ID dan pemuatan ulang memindahkan status terbaru", async () => {
  const rows = [row(2, " alfa "), row(1, "ALFA"), row(3, "Beta")];
  assert.deepEqual((await loadOrderedCatalog(fixture(rows))).data.map(item => item.id), [1, 2, 3]);
  rows[1].active = false;
  const archived = await loadOrderedCatalog(fixture(rows));
  assert.deepEqual(archived.data.map(item => item.id), [2, 3, 1]);
  rows[1].active = true;
  assert.deepEqual((await loadOrderedCatalog(fixture(rows))).data.map(item => item.id), [1, 2, 3]);
  assert.equal(catalogDisplayPage(archived, 99).currentPage, 2);
});

test("katalog kosong tetap halaman 1 dengan nol record", async () => {
  const collection = await loadOrderedCatalog(fixture([]));
  assert.deepEqual(catalogDisplayPage(collection, 1).data, []);
  assert.equal(collection.total, 0);
});

test("hasil tidak lengkap, duplikat atau perubahan pagination tidak ditampilkan sebagai katalog lengkap", async () => {
  const source = fixture([row(1, "A"), row(2, "B"), row(3, "C")]);
  for (const change of [
    page => ({ ...page, data: [] }),
    page => ({ ...page, data: [row(1, "A")] }),
    page => ({ ...page, total: 4 }),
    page => ({ ...page, currentPage: 1 }),
  ]) {
    await assert.rejects(loadOrderedCatalog(async number => number === 1 ? source(number) : change(await source(number))));
  }
  await assert.rejects(loadOrderedCatalog(async number => {
    if (number === 2) throw new Error("Layanan gagal");
    return source(number);
  }), /Layanan gagal/);
});

test("batas pembacaan mencegah request katalog berlebihan", async () => {
  let calls = 0;
  await assert.rejects(loadOrderedCatalog(async () => {
    calls++;
    return { data: [], currentPage: 1, total: 1001, perPage: 20, lastPage: 51 };
  }), /terlalu besar/);
  assert.equal(calls, 1);
});
