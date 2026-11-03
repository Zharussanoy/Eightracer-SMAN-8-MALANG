export const schoolSourceKinds = {
  indikator_kip: "Isian KIP",
  referensi_kip: "Catatan KIP",
  referensi_beasiswa: "Catatan beasiswa",
  pembebasan_biaya: "Pembebasan biaya",
  kode_sumber: "Kode dari sekolah",
  keterangan_belum_jelas: "Perlu penjelasan",
  tanpa_keterangan: "Belum ada keterangan",
} as const;

export type SchoolSourceKind = keyof typeof schoolSourceKinds;
export interface SchoolScholarshipRow {
  id: number;
  value: string;
  kind: SchoolSourceKind;
  studentName: string | null;
  year: number;
  university: string | null;
  major: string | null;
  admissionPath: string | null;
  linkedAdmission: boolean;
  source: { url: string; sheet: string; cell: string };
}
export interface SchoolScholarshipPage {
  data: SchoolScholarshipRow[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}
export interface SchoolScholarshipSummary {
  total: number;
  linkedStudents: number;
  linkedAdmissions: number;
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Respons data sekolah tidak valid.");
  return value as Record<string, unknown>;
}
function integer(value: unknown, minimum = 0): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) throw new Error("Jumlah data sekolah tidak valid.");
  return value;
}
function label(value: unknown, max = 500): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error("Isi data sekolah tidak valid.");
  return value;
}
function nullableLabel(value: unknown): string | null {
  return value === null || value === undefined ? null : label(value);
}

export function parseSchoolScholarshipPage(payload: unknown): SchoolScholarshipPage {
  const root = object(payload);
  if (!Array.isArray(root.data)) throw new Error("Daftar data sekolah tidak valid.");
  const page: SchoolScholarshipPage = {
    data: root.data.map((value) => {
      const row = object(value);
      const kind = label(row.jenis_keterangan);
      if (!Object.prototype.hasOwnProperty.call(schoolSourceKinds, kind)) throw new Error("Jenis catatan sekolah tidak dikenal.");
      const student = row.siswa == null ? null : object(row.siswa);
      const admission = row.study_tracer == null ? null : object(row.study_tracer);
      const university = admission?.perguruan_tinggi == null ? null : object(admission.perguruan_tinggi);
      const source = object(row.sumber);
      const file = label(row.source_file_id, 64);
      if (!/^[A-Za-z0-9_-]{20,64}$/.test(file)) throw new Error("Sumber sekolah tidak valid.");
      const cell = label(source.cell, 12);
      if (!/^[A-Z]{1,4}[1-9]\d{0,6}$/.test(cell)) throw new Error("Lokasi sumber tidak valid.");
      const year = integer(row.tahun_lulus, 2024);
      if (year > 2026) throw new Error("Tahun sumber tidak valid.");
      return {
        id: integer(row.id, 1), value: label(row.nilai_sumber), kind: kind as SchoolSourceKind,
        studentName: student ? nullableLabel(student.nama_lengkap) : null, year,
        university: nullableLabel(university?.nama_pt) ?? nullableLabel(row.kampus_sumber),
        major: nullableLabel(admission?.program_studi) ?? nullableLabel(row.prodi_sumber),
        admissionPath: nullableLabel(admission?.jalur_masuk), linkedAdmission: admission !== null,
        source: { url: `https://docs.google.com/spreadsheets/d/${file}/edit`, sheet: label(source.sheet, 100), cell },
      };
    }),
    currentPage: integer(root.current_page, 1), lastPage: integer(root.last_page, 1),
    perPage: integer(root.per_page, 1), total: integer(root.total),
  };
  if (page.data.length > page.perPage || page.data.length > page.total || page.perPage > 100) throw new Error("Paginasi data sekolah tidak valid.");
  return page;
}

export function parseSchoolScholarshipSummary(payload: unknown): SchoolScholarshipSummary {
  const data = object(object(payload).data);
  const summary = { total: integer(data.jumlah_catatan), linkedStudents: integer(data.terhubung_siswa), linkedAdmissions: integer(data.terhubung_penerimaan_pt) };
  if (summary.linkedStudents > summary.total || summary.linkedAdmissions > summary.linkedStudents) throw new Error("Ringkasan data sekolah tidak valid.");
  return summary;
}
