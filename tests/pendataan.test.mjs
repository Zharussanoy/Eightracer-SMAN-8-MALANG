import assert from "node:assert/strict";
import test from "node:test";
import { normalizePendataan, validatePendataan, WHATSAPP_PATTERN } from "../lib/pendataan.ts";

const valid = {
  nisn: "0012345678", nama: " ALUMNI ", kelas: "XII 1", nomorWa: "081234567890",
  angkatan: "Alumni 2024", tahunLulus: 2024, kampus: " universitas brawijaya ",
  kampusKode: "UB", jenisKampus: "Negeri", pilihanKe: "Tanpa Pilihan",
  jurusan: " seni ", jenjang: "S1", jalur: "SNBP", statusPenerimaan: "Lolos / Diterima",
  nilaiRapor: 90, skorUtbk: null, isKipk: false, sertifikat: [],
};

test("WhatsApp preserves Indonesian local and international formats", () => {
  const pattern = new RegExp(`^${WHATSAPP_PATTERN}$`);
  for (const phone of ["0812345678", "0812345678901", "+62812345678", "+62812345678901"]) {
    assert.ok(pattern.test(phone), phone);
    assert.equal(validatePendataan({ ...valid, nomorWa: phone }), null);
  }
  for (const phone of ["", "08123", "08123456789012", "+6208123456789", "628123456789", "08123abc890", "0812 3456 7890"]) {
    assert.ok(!pattern.test(phone), phone);
    assert.ok(validatePendataan({ ...valid, nomorWa: phone }));
  }
});

test("uppercase and round-trip storage keep existing data, including short official programs", () => {
  const normalized = normalizePendataan(valid);
  assert.equal(normalized.nama, "ALUMNI");
  assert.equal(normalized.kampus, "UNIVERSITAS BRAWIJAYA");
  assert.equal(normalized.jurusan, "SENI");
  assert.equal(normalized.nisn, "0012345678");
  assert.equal(validatePendataan(normalized), null);
  const restored = JSON.parse(JSON.stringify(normalized));
  assert.deepEqual(restored, normalized);
  assert.equal(validatePendataan(restored), null);
});

test("conditional values are cleared before submission when their controlling choice changes", () => {
  const stale = normalizePendataan({ ...valid, lembagaPenyalur: "Agency", jalurLainnya: "Custom entry", beasiswaLainnya: "Custom scholarship" });
  assert.equal(stale.lembagaPenyalur, "");
  assert.equal(stale.jalurLainnya, "");
  assert.equal(stale.beasiswaLainnya, "");
  const active = normalizePendataan({ ...valid, jenisKampus: "Luar Negeri", lembagaPenyalur: " Agency ", jalur: "Lainnya", jalurLainnya: " Custom entry ", beasiswa: "Lainnya", beasiswaLainnya: " Scholarship " });
  assert.equal(active.lembagaPenyalur, "Agency");
  assert.equal(active.jalurLainnya, "Custom entry");
  assert.equal(active.beasiswaLainnya, "Scholarship");
  assert.equal(validatePendataan(active), null);
});

test("required choices and conditional details are validated without requiring optional fields", () => {
  assert.equal(validatePendataan(valid), null);
  assert.equal(validatePendataan({ ...valid, jenisKampus: "Luar Negeri", lembagaPenyalur: "" }), null);
  for (const field of ["kelas", "nomorWa", "jenisKampus", "pilihanKe"]) {
    assert.ok(validatePendataan({ ...valid, [field]: "" }), field);
  }
  assert.ok(validatePendataan({ ...valid, jalur: "Lainnya", jalurLainnya: "  " }));
  assert.ok(validatePendataan({ ...valid, beasiswa: "Lainnya", beasiswaLainnya: "" }));
  assert.ok(validatePendataan({ ...valid, jenisKampus: "Invalid" }));
  assert.ok(validatePendataan({ ...valid, pilihanKe: "5" }));
});

test("KIP-K applicant and recipient remain independent", () => {
  for (const isKipk of [true, false]) {
    for (const pelamarKipk of ["YA", "TIDAK", ""]) {
      const normalized = normalizePendataan({ ...valid, isKipk, pelamarKipk });
      assert.equal(normalized.isKipk, isKipk);
      assert.equal(normalized.pelamarKipk, pelamarKipk);
      assert.equal(validatePendataan(normalized), null);
    }
  }
});
