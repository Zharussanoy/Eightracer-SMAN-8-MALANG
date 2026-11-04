import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../lib/b4-analytics.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const emptyStats = () => ({ jumlah_diketahui: 0, jumlah_belum_tercatat: 12, minimum: null, maksimum: null, rata_rata: null });
const analytics = () => ({ data: { as_of: "2026-11-04", jumlah_alumni_tercatat: 12, jumlah_penerima_kipk: 2, distribusi_beasiswa: [], per_angkatan: [], tren_periode: [], catatan: "contoh" } });
const dashboard = () => ({ data: { jumlah_alumni: 12, ukt: emptyStats(), ipk: emptyStats(), per_kampus_prodi: [], tren_ipk: [] } });

test("struktur terisi BE dengan universitas dan jumlah tidak merusak halaman atau menghilangkan hitungan", () => {
  const a = analytics(), d = dashboard();
  a.data.distribusi_beasiswa = [{ beasiswa_id: 1, nama_beasiswa: "Program Sintetis", jumlah: 2 }];
  a.data.per_angkatan = [{ angkatan: 2024, jumlah_alumni: 3, penerima_kipk: 0 }];
  a.data.tren_periode = [{ periode: "Periode Sintetis", jumlah_alumni: 3, penerima_kipk: 0, beasiswa: [{ beasiswa_id: 1, nama_beasiswa: "Program Sintetis", jumlah_alumni: 2, status: { proses: 1, diterima: 1, ditolak: 0 } }] }];
  d.data.per_kampus_prodi = [{ perguruan_tinggi_id: 5, universitas: "Universitas Sintetis", program_studi: "Psikologi", jumlah_alumni: 3, ukt: { jumlah_diketahui: 3, jumlah_belum_tercatat: 0, minimum: 0, maksimum: 1000000, rata_rata: 500000 }, ipk: emptyStats(), jumlah_penerima_kipk: 0 }];
  d.data.tren_ipk = [{ perguruan_tinggi_id: 5, universitas: "Universitas Sintetis", program_studi: "Psikologi", semester: 2, jumlah_alumni: 3, ipk: { jumlah_diketahui: 3, jumlah_belum_tercatat: 0, minimum: 3, maksimum: 4, rata_rata: 3.5 } }];
  const result = api.parseAnalytics(a, d);
  assert.equal(result.distribution[0].count, 2);
  assert.equal(result.ranges[0].university, "Universitas Sintetis");
  assert.equal(result.ranges[0].stats.minimum, 0);
  assert.equal(result.cohorts[0].count, 0);
  assert.equal(result.periods[0].scholarships[0].rejected, 0);
  assert.equal(result.ipkTrend[0].stats.mean, 3.5);
  assert.equal(result.recipients, null);
  a.data.distribusi_beasiswa[0].jumlah = 0;
  assert.equal(api.parseAnalytics(a, d).distribution[0].count, 0);
});

test("analitik membedakan nol, null, angka desimal teks dan nilai invalid", () => {
  assert.equal(api.analyticNumber(0), 0);
  assert.equal(api.analyticNumber("0.00"), 0);
  assert.equal(api.analyticNumber("3.75"), 3.75);
  for (const value of [null, undefined, "", " ", false, true, [], {}, -1, "Rp5.000", Infinity]) assert.equal(api.analyticNumber(value), null);
});
test("struktur kosong BE asli tidak diisi grafik, IPK/UKT nol atau angka contoh", () => {
  const result = api.parseAnalytics(analytics(), dashboard());
  assert.equal(result.total, 12);
  assert.equal(result.recipients, null);
  assert.equal(result.ukt.minimum, null);
  assert.equal(result.ukt.known, 0);
  assert.equal(result.ipk.mean, null);
  assert.deepEqual(result.ranges, []);
  assert.deepEqual(result.periods, []);
  assert.deepEqual(result.distribution, []);
});
test("jumlah distribusi tidak dijadikan penerima unik; status tren tetap terpisah", () => {
  const source = analytics();
  source.data.distribusi_beasiswa = [{ beasiswa_id: 1, nama_beasiswa: "Program A", jumlah_alumni: 8 }, { beasiswa_id: 2, nama_beasiswa: "Program B", jumlah_alumni: 7 }];
  source.data.tren_periode = [{ periode: "Semester 1 - 2026", jumlah_alumni: 2, penerima_kipk: 0, beasiswa: [{ beasiswa_id: 1, nama_beasiswa: "Program A", jumlah_alumni: 2, status: { proses: 0, diterima: 1, ditolak: 1 }, siswa_id: [99], nominal_beasiswa: 12345 }] }];
  const result = api.parseAnalytics(source, dashboard());
  assert.equal(result.recipients, null);
  assert.equal(result.periods[0].scholarships[0].accepted, 1);
  assert.equal(result.periods[0].scholarships[0].rejected, 1);
  assert.equal(result.periods[0].scholarships[0].processing, 0);
  assert.equal(JSON.stringify(result).includes("siswa_id"), false);
  assert.equal(JSON.stringify(result).includes("12345"), false);
});
test("statistik UKT dan IPK numerik diproyeksikan tanpa atribut tambahan", () => {
  const source = dashboard();
  source.data.ukt = { jumlah_diketahui: 2, jumlah_belum_tercatat: 10, minimum: "0.00", maksimum: "1000000.00", rata_rata: "500000.00" };
  source.data.ipk = { jumlah_diketahui: 2, jumlah_belum_tercatat: 10, minimum: "3.50", maksimum: "4.00", rata_rata: "3.75" };
  source.data.per_kampus_prodi = [{ nama_pt: "Kampus Sintetis", program_studi: "Prodi Sintetis", jumlah_alumni: 2, ukt: source.data.ukt, private_note: "tidak diteruskan" }];
  const result = api.parseAnalytics(analytics(), source);
  assert.equal(result.ukt.minimum, 0);
  assert.equal(result.ipk.mean, 3.75);
  assert.equal(result.ranges[0].stats.maximum, 1000000);
  assert.equal(JSON.stringify(result).includes("private_note"), false);
  assert.throws(() => api.parseAnalytics({ data: {} }, source));
});
