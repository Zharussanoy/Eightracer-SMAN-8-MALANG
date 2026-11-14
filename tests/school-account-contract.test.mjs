import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../lib/auth.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const auth = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("siswa yang diaktifkan sekolah dapat memakai kontrak email kosong dan menuju halaman siswa", () => {
  const user = { id: 12, full_name: "Akun Uji", email: null, role: "siswa", email_verified: false,
    account_active: true, school_provisioned: true, password_change_recommended: true };
  assert.equal(auth.isApiUser(user), true);
  const profile = auth.toUserProfile(user);
  assert.equal(profile.email, "");
  assert.equal(profile.emailVerified, false);
  assert.equal(profile.schoolStaff, false);
  assert.equal(auth.loginDestination(profile), "/siswa/jejak-alumni");
});

test("akun belum aktif tetap diarahkan ke profil dan tidak memperoleh akses staf", () => {
  const user = { id: 1, full_name: "Akun Uji", email: null, role: "siswa", email_verified: false, account_active: false };
  assert.equal(auth.loginDestination(auth.toUserProfile(user)), "/profile");
  assert.equal(auth.toUserProfile({ ...user, school_staff: true }).schoolStaff, false);
  for (const key of ["account_active", "school_provisioned", "password_change_recommended"]) {
    assert.equal(auth.isApiUser({ ...user, [key]: "true" }), false);
  }
});

test("kontrak akun lama terverifikasi tetap kompatibel dan NISN mempertahankan nol di awal", () => {
  const user = { id: 3, full_name: "Admin Uji", email: "admin@example.test", role: "administrator", email_verified: true };
  assert.equal(auth.isApiUser(user), true);
  assert.equal(auth.loginDestination(auth.toUserProfile(user)), "/admin/alumni-perguruan-tinggi");
  assert.deepEqual(auth.loginIdentifier("0012345678"), { nisn: "0012345678" });
});
