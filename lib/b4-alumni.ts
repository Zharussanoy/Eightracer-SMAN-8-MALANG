import { parseScholarshipEvidence, type ScholarshipEvidence } from "./b4-scholarship-evidence";
export interface AlumniRow {
  id: number; studentId: number; name: string; graduationYear: number | null;
  university: string; universityId: number; universityKind: string | null;
  studyProgram: string; admissionPath: string | null; admissionStatus: string;
  latestStatus: string | null;
}
export interface AlumniFilters {
  universities: { value: string; label: string }[]; studyPrograms: string[]; admissionPaths: string[];
}
export interface AlumniPage {
  data: AlumniRow[]; currentPage: number; lastPage: number; perPage: number; total: number; filters: AlumniFilters;
}
export interface AlumniProgressRow {
  id: number; semester: number | null; period: string | null; status: string | null;
  gpa: number | null; kipk: boolean | null; ukt: number | null; ipi: number | null;
  revision: number | null; updatedAt: string | null; published: boolean; publishFinancials: boolean;
  scholarships: { id: number; name: string | null; status: string; amount: number | null }[];
}
export interface AlumniDetail extends AlumniRow {
  scholarshipEvidence: ScholarshipEvidence; hasNisn: boolean; classroom: string | null; degree: string | null; admissionSubpath: string | null;
  choice: number | null; admissionYear: number | null; reportScore: number | null;
  utbkScore: number | null; progress: AlumniProgressRow[]; catalogOptions: { id: number; name: string }[];
}
function obj(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 2000) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  return value;
}
function maybeText(value: unknown): string | null { return value == null ? null : text(value); }
function integer(value: unknown, min = 1): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  return value;
}
function maybeInteger(value: unknown): number | null { return value == null ? null : integer(value); }
function decimal(value: unknown): number | null {
  if (value == null) return null;
  if ((typeof value !== "number" && typeof value !== "string") || (typeof value === "string" && value.trim() === "") || !Number.isFinite(Number(value)) || Number(value) < 0) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  return Number(value);
}
function row(payload: unknown): AlumniRow {
  const data = obj(payload), university = obj(data.perguruan_tinggi);
  return {
    id: integer(data.id), studentId: integer(data.siswa_id), name: text(data.nama_lengkap),
    graduationYear: maybeInteger(data.tahun_lulus), university: text(university.nama_pt),
    universityId: integer(university.id), universityKind: maybeText(university.jenis_pt),
    studyProgram: text(data.program_studi), admissionPath: maybeText(data.jalur_masuk),
    admissionStatus: text(data.status_penerimaan), latestStatus: maybeText(data.status_terakhir),
  };
}
export function parseAlumniPage(payload: unknown): AlumniPage {
  const data = obj(payload), filters = obj(data.filters);
  if (!Array.isArray(data.data) || !Array.isArray(filters.universities) || !Array.isArray(filters.study_programs) || !Array.isArray(filters.admission_paths)) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  const page: AlumniPage = {
    data: data.data.map(row), currentPage: integer(data.current_page), lastPage: integer(data.last_page),
    perPage: integer(data.per_page), total: integer(data.total, 0),
    filters: {
      universities: filters.universities.map((value) => { const item = obj(value); return { value: String(integer(item.id)), label: text(item.nama_pt) }; }),
      studyPrograms: filters.study_programs.map(text), admissionPaths: filters.admission_paths.map(text),
    },
  };
  if (page.data.length > page.perPage || page.data.length > page.total) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  return page;
}
export function parseAlumniDetail(payload: unknown): AlumniDetail {
  const data = obj(obj(payload).data);
  if (typeof data.has_nisn !== "boolean" || !Array.isArray(data.progress)) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
  return { ...row(data), scholarshipEvidence: parseScholarshipEvidence(data.scholarship_summary), hasNisn: data.has_nisn, classroom: maybeText(data.kelas_terakhir), degree: maybeText(data.strata_pendidikan),
    admissionSubpath: maybeText(data.sub_jalur_mandiri), choice: maybeInteger(data.pilihan_ke),
    admissionYear: maybeInteger(data.tahun_masuk_pt), reportScore: decimal(data.nilai_rapor_pendaftaran),
    utbkScore: decimal(data.skor_utbk),
    catalogOptions: (Array.isArray(data.catalog_options) ? data.catalog_options : []).map((value) => { const item = obj(value); return { id: integer(item.id), name: text(item.nama_beasiswa) }; }),
    progress: data.progress.map((value) => {
      const item = obj(value);
      if ((item.penerima_kipk !== null && typeof item.penerima_kipk !== "boolean") || !Array.isArray(item.beasiswa)) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
      const gpa = decimal(item.ipk_terkini);
      if (gpa !== null && gpa > 4) throw new Error("Data alumni belum dapat dibaca. Silakan coba lagi.");
      return { id: integer(item.id), revision: maybeInteger(item.revision), updatedAt: maybeText(item.tanggal_update),
        published: item.is_published === true, publishFinancials: item.publish_financials === true, semester: maybeInteger(item.semester), period: maybeText(item.periode),
        status: maybeText(item.status_pendidikan), gpa, kipk: item.penerima_kipk,
        ukt: decimal(item.nominal_ukt), ipi: decimal(item.nominal_ipi),
        scholarships: item.beasiswa.map((value) => { const scholarship = obj(value); return { id: integer(scholarship.beasiswa_id), name: maybeText(scholarship.nama_beasiswa), status: text(scholarship.status), amount: decimal(scholarship.nominal_beasiswa) }; }),
      };
    }),
  };
}
export function alumniQuery(search: string, university: string, program: string, admission: string, page: number) {
  const query = new URLSearchParams({ page: String(page) });
  if (search.trim()) query.set("search", search.trim());
  if (university) query.set("perguruan_tinggi_id", university);
  if (program) query.set("program_studi", program);
  if (admission) query.set("jalur_masuk", admission);
  return query.toString();
}
