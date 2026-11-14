import { parseScholarshipEvidence, type ScholarshipEvidence } from "./b4-scholarship-evidence";
// Proyeksi endpoint publikasi siswa. Jangan memakai DTO direktori staff di sini.
type Obj = Record<string, unknown>;
function obj(value: unknown): Obj { return value && typeof value === "object" && !Array.isArray(value) ? value as Obj : {}; }
function required(value: unknown): Obj {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  return value as Obj;
}
const text = (value: unknown): string | null => typeof value === "string" && value.trim() ? value : null;
function number(value: unknown): number | null {
  if (typeof value !== "number" && !(typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value))) return null;
  const n = Number(value); return Number.isFinite(n) && n >= 0 ? n : null;
}
function positive(value: unknown): number { const n = number(value); if (!n || !Number.isSafeInteger(n)) throw new Error("ID atau pagination Jejak Alumni tidak valid."); return n; }
const year = (value: unknown) => /^\d{4}$/.test(String(value)) ? String(value) : null;
const date = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) ? value.slice(0, 10) : null;
function campus(value: unknown) { const row = obj(value); return text(value) ?? text(row.nama_pt) ?? text(row.nama_perguruan_tinggi) ?? text(row.nama); }
export interface StudentAchievement { id: number | null; name: string | null; type: string | null; field: string | null; level: string | null; rank: string | null; provider: string | null; year: string | null }
function achievements(value: unknown): StudentAchievement[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("Daftar prestasi Jejak Alumni tidak valid.");
  return value.map((value) => { const row = required(value); return { id: number(row.id), name: text(row.nama_kompetisi), type: text(row.jenis_prestasi), field: text(row.bidang), level: text(row.tingkat), rank: text(row.peringkat) ?? (typeof row.peringkat === "number" ? String(row.peringkat) : null), provider: text(row.penyelenggara), year: year(row.tahun) }; });
}
export interface StudentAlumni {
  id: number; name: string; university: string | null; program: string | null; admission: string | null;
  entryYear: string | null; graduationYear: string | null; status: string | null; achievements: StudentAchievement[];
}
function admission(value: Obj) { return obj(value.masuk_pt); }
function identity(row: Obj): StudentAlumni {
  const entry = admission(row), student = obj(row.alumni ?? row.siswa);
  const name = text(row.nama_lengkap) ?? text(entry.nama_lengkap) ?? text(student.nama_lengkap);
  if (!name) throw new Error("Nama alumni belum tersedia pada respons publikasi.");
  return { id: positive(row.id), name, university: campus(entry.perguruan_tinggi ?? row.perguruan_tinggi) ?? text(entry.nama_perguruan_tinggi ?? row.nama_perguruan_tinggi),
    program: text(entry.program_studi ?? row.program_studi), admission: text(entry.jalur_masuk ?? row.jalur_masuk), entryYear: year(entry.tahun_masuk_pt ?? row.tahun_masuk_pt), graduationYear: year(student.tahun_lulus ?? row.tahun_lulus ?? entry.tahun_lulus), status: text(entry.status_penerimaan ?? row.status_penerimaan), achievements: achievements(entry.prestasi ?? row.prestasi) };
}
export interface StudentAlumniPage { preview?:boolean; data: StudentAlumni[]; currentPage: number; lastPage: number; perPage: number; total: number }
export function parseStudentAlumniPage(payload: unknown): StudentAlumniPage {
  const outer = required(payload), root = Array.isArray(outer.data) ? outer : required(outer.data), meta = root.meta === undefined ? root : required(root.meta);
  if (!Array.isArray(root.data)) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  const total = number(meta.total);
  if (total === null || !Number.isSafeInteger(total) || total < root.data.length) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  const result = { preview:outer.preview===true, data: root.data.map((value) => identity(required(value))), currentPage: positive(meta.current_page), lastPage: positive(meta.last_page), perPage: positive(meta.per_page), total };
  if (result.currentPage > result.lastPage && result.data.length) throw new Error("Pagination Jejak Alumni tidak valid.");
  return result;
}
export interface StudentAlumniEvent {
  key: string; label: string; kind: string | null; date: string | null; year: string | null; semester: number | null; period: string | null;
  ipk: number | null; ukt: number | null; ipi: number | null; kipk: boolean | null; status: string | null; scholarships: { name: string; status: string | null }[];
}
function event(value: unknown, index: number): StudentAlumniEvent {
  const source = required(value), row = { ...source, ...obj(source.data) };
  const financial = row.publish_financials !== false;
  const semester = number(row.semester);
  const ipk = number(row.ipk_terkini);
  const programs = row.beasiswa;
  if (programs !== undefined && !Array.isArray(programs)) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  return { key: `${index}`, label: text(source.label) ?? text(source.title) ?? text(row.periode) ?? "Perkembangan pendidikan", kind: text(source.type),
    date: source.granularity === "year" ? null : date(source.date ?? row.tanggal_update), year: year(source.year ?? row.tahun),
    semester: semester !== null && Number.isSafeInteger(semester) && semester > 0 ? semester : null,
    period: text(row.periode), ipk: ipk !== null && ipk <= 4 ? ipk : null, ukt: financial ? number(row.nominal_ukt) : null, ipi: financial ? number(row.nominal_ipi) : null,
    kipk: typeof row.penerima_kipk === "boolean" ? row.penerima_kipk : null, status: text(row.status_pendidikan),
    scholarships: (programs as unknown[] | undefined ?? []).map((value) => { const program = required(value); return { name: text(program.nama_beasiswa) ?? text(obj(program.beasiswa).nama_beasiswa), status: text(program.status_beasiswa ?? program.status) }; }).filter((item): item is { name: string; status: string | null } => item.name !== null) };
}
export interface StudentAlumniDetail { preview?:boolean; scholarshipEvidence: ScholarshipEvidence;
  alumni: StudentAlumni; faculty: string | null; universityType: string | null; degree: string | null; admissionGrade: number | null; utbk: number | null;
  admissionChoice: string | null; events: StudentAlumniEvent[];
}
export function parseStudentAlumniDetail(payload: unknown, requestedId: number): StudentAlumniDetail {
  const root = required(required(payload).data), entry = required(root.masuk_pt);
  if (entry.id !== undefined && positive(entry.id) !== requestedId) throw new Error("Detail Jejak Alumni tidak sesuai pilihan.");
  if (root.id !== undefined && positive(root.id) !== requestedId) throw new Error("Detail Jejak Alumni tidak sesuai pilihan.");
  const alumni = identity({ ...root, id: requestedId });
  const timeline = root.timeline;
  if (timeline !== undefined && !Array.isArray(timeline)) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  return { preview:required(payload).preview===true, scholarshipEvidence: parseScholarshipEvidence(root.scholarship_summary), alumni, faculty: text(entry.fakultas), universityType: text(entry.jenis_pt) ?? text(obj(entry.perguruan_tinggi).jenis_pt), degree: text(entry.strata_pendidikan),
    admissionGrade: number(entry.nilai_rapor_pendaftaran), utbk: number(entry.skor_utbk), admissionChoice: text(entry.pilihan_jurusan) ?? (number(entry.pilihan_ke) === null ? null : `Pilihan ${number(entry.pilihan_ke)}`), events: (timeline as unknown[] | undefined ?? []).map(event) };
}
