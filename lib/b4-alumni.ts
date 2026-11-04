export interface AlumniRow {
  id: number; studentId: number; name: string; graduationYear: number | null;
  university: string; universityId: number; universityKind: string | null;
  studyProgram: string; admissionPath: string; admissionStatus: string;
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
  scholarships: { name: string | null; status: string }[];
}
export interface AlumniDetail extends AlumniRow {
  hasNisn: boolean; classroom: string | null; degree: string | null; admissionSubpath: string | null;
  choice: number | null; admissionYear: number | null; reportScore: number | null;
  utbkScore: number | null; progress: AlumniProgressRow[];
}
function obj(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Respons alumni tidak sesuai kontrak.");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 2000) throw new Error("Field alumni tidak sesuai kontrak.");
  return value;
}
function maybeText(value: unknown): string | null { return value == null ? null : text(value); }
function integer(value: unknown, min = 1): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min) throw new Error("ID/paginasi alumni tidak sesuai kontrak.");
  return value;
}
function maybeInteger(value: unknown): number | null { return value == null ? null : integer(value); }
function decimal(value: unknown): number | null {
  if (value == null) return null;
  if ((typeof value !== "number" && typeof value !== "string") || (typeof value === "string" && value.trim() === "") || !Number.isFinite(Number(value)) || Number(value) < 0) throw new Error("Nilai alumni tidak sesuai kontrak.");
  return Number(value);
}
function row(payload: unknown): AlumniRow {
  const data = obj(payload), university = obj(data.perguruan_tinggi);
  return {
    id: integer(data.id), studentId: integer(data.siswa_id), name: text(data.nama_lengkap),
    graduationYear: maybeInteger(data.tahun_lulus), university: text(university.nama_pt),
    universityId: integer(university.id), universityKind: maybeText(university.jenis_pt),
    studyProgram: text(data.program_studi), admissionPath: text(data.jalur_masuk),
    admissionStatus: text(data.status_penerimaan), latestStatus: maybeText(data.status_terakhir),
  };
}
export function parseAlumniPage(payload: unknown): AlumniPage {
  const data = obj(payload), filters = obj(data.filters);
  if (!Array.isArray(data.data) || !Array.isArray(filters.universities) || !Array.isArray(filters.study_programs) || !Array.isArray(filters.admission_paths)) throw new Error("Daftar alumni tidak sesuai kontrak.");
  const page: AlumniPage = {
    data: data.data.map(row), currentPage: integer(data.current_page), lastPage: integer(data.last_page),
    perPage: integer(data.per_page), total: integer(data.total, 0),
    filters: {
      universities: filters.universities.map((value) => { const item = obj(value); return { value: String(integer(item.id)), label: text(item.nama_pt) }; }),
      studyPrograms: filters.study_programs.map(text), admissionPaths: filters.admission_paths.map(text),
    },
  };
  if (page.data.length > page.perPage || page.data.length > page.total) throw new Error("Jumlah alumni tidak sesuai kontrak.");
  return page;
}
export function parseAlumniDetail(payload: unknown): AlumniDetail {
  const data = obj(obj(payload).data);
  if (typeof data.has_nisn !== "boolean" || !Array.isArray(data.progress)) throw new Error("Detail alumni tidak sesuai kontrak.");
  return { ...row(data), hasNisn: data.has_nisn, classroom: maybeText(data.kelas_terakhir), degree: maybeText(data.strata_pendidikan),
    admissionSubpath: maybeText(data.sub_jalur_mandiri), choice: maybeInteger(data.pilihan_ke),
    admissionYear: maybeInteger(data.tahun_masuk_pt), reportScore: decimal(data.nilai_rapor_pendaftaran),
    utbkScore: decimal(data.skor_utbk),
    progress: data.progress.map((value) => {
      const item = obj(value);
      if ((item.penerima_kipk !== null && typeof item.penerima_kipk !== "boolean") || !Array.isArray(item.beasiswa)) throw new Error("Progres alumni tidak sesuai kontrak.");
      const gpa = decimal(item.ipk_terkini);
      if (gpa !== null && gpa > 4) throw new Error("IPK alumni tidak sesuai kontrak.");
      return { id: integer(item.id), semester: maybeInteger(item.semester), period: maybeText(item.periode),
        status: maybeText(item.status_pendidikan), gpa, kipk: item.penerima_kipk,
        ukt: decimal(item.nominal_ukt), ipi: decimal(item.nominal_ipi),
        scholarships: item.beasiswa.map((value) => { const scholarship = obj(value); return { name: maybeText(scholarship.nama_beasiswa), status: text(scholarship.status) }; }),
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
