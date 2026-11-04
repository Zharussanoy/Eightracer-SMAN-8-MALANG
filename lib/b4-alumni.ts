// Proyeksi baca admin. Tidak meneruskan kontak, NISN, lampiran atau pivot BE.
export interface AlumniAdmission {
  id: number;
  studentId: number;
  name: string;
  university: string | null;
  universityId: number | null;
  program: string | null;
  admission: string | null;
  status: string | null;
  entryYear: string | null;
}
export interface AlumniPage {
  data: AlumniAdmission[];
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}
export interface AlumniEvent {
  id: string;
  kind: string;
  date: string | null;
  year: string | null;
  semester: number | null;
  period: string | null;
  status: string | null;
  ipk: number | null;
  ukt: number | null;
  ipi: number | null;
  kipk: boolean | null;
  scholarships: { name: string; status: string | null }[];
  university: string | null;
  program: string | null;
  current: boolean | null;
}
export interface AlumniTimeline { name: string | null; events: AlumniEvent[] }
type Obj = Record<string, unknown>;
export function record(value: unknown): Obj {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Struktur respons alumni belum sesuai kontrak.");
  return value as Obj;
}
function relation(value: unknown): Obj { return value && typeof value === "object" && !Array.isArray(value) ? value as Obj : {}; }
function text(value: unknown): string | null { return typeof value === "string" && value.trim() ? value : null; }
function number(value: unknown): number | null {
  if (typeof value !== "number" && !(typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value))) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function id(value: unknown): number {
  const parsed = number(value);
  if (parsed === null || !Number.isSafeInteger(parsed) || parsed < 1) throw new Error("ID alumni belum sesuai kontrak.");
  return parsed;
}
function calendar(value: unknown): string | null { return typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) ? value.slice(0, 10) : null; }
function year(value: unknown): string | null { return /^\d{4}$/.test(String(value)) ? String(value) : null; }
function university(row: Obj): string | null {
  const campus = relation(row.perguruan_tinggi);
  return text(campus.nama_pt) ?? text(campus.nama_perguruan_tinggi) ?? text(campus.nama) ?? text(row.nama_perguruan_tinggi);
}
export function parseAlumniPage(payload: unknown): AlumniPage {
  const outer = record(payload);
  const root = Array.isArray(outer.data) ? outer : record(outer.data);
  const meta = root.meta === undefined ? root : record(root.meta);
  if (!Array.isArray(root.data)) throw new Error("Daftar alumni belum sesuai kontrak.");
  const data = root.data.map((value): AlumniAdmission => {
    const row = record(value), student = relation(row.siswa);
    const name = text(student.nama_lengkap) ?? text(row.nama_lengkap);
    if (!name) throw new Error("Nama alumni belum dikirim oleh BE.");
    return { id: id(row.id), studentId: id(row.siswa_id ?? student.id), name,
      university: university(row), universityId: number(row.perguruan_tinggi_id ?? relation(row.perguruan_tinggi).id), program: text(row.program_studi), admission: text(row.jalur_masuk),
      status: text(row.status_penerimaan), entryYear: year(row.tahun_masuk_pt) };
  });
  const total = number(meta.total);
  if (total === null || !Number.isSafeInteger(total) || total < data.length) throw new Error("Jumlah alumni belum sesuai kontrak.");
  return { data, currentPage: id(meta.current_page), lastPage: id(meta.last_page), perPage: id(meta.per_page), total };
}
export function parseAlumniTimeline(payload: unknown): AlumniTimeline {
  const outer = record(payload);
  const source = outer.data ?? outer;
  const root = relation(source);
  const collection = Array.isArray(source) ? source : root.timeline ?? root.progress ?? root.progres ?? root.riwayat_progress;
  if (!Array.isArray(collection)) throw new Error("Struktur timeline perlu dicocokkan dengan respons BE; data contoh tidak digunakan.");
  // Respons BE asli mengelompokkan kejadian per penerimaan PT:
  // data: [{ study_tracer_id, events: [{ type, date, year, label, ... }] }].
  const rows = collection.flatMap((value) => {
    const group = record(value);
    if ("events" in group) {
      if (!Array.isArray(group.events)) throw new Error("Kejadian timeline belum sesuai kontrak.");
      return group.events.map((event) => ({ event: record(event), admission: group.study_tracer_id }));
    }
    return [{ event: group, admission: group.study_tracer_id }];
  });
  const student = relation(root.siswa ?? root.alumni);
  const events = rows.map(({ event, admission }, index): AlumniEvent => {
    const detail = relation(event.data);
    const row = { ...event, ...detail };
    if (!["type", "jenis", "title", "label", "semester", "tanggal_update", "date", "tanggal", "year", "tahun"].some((key) => row[key] !== undefined)) {
      throw new Error("Kejadian timeline belum sesuai kontrak.");
    }
    const rawScholarships = row.beasiswa;
    const scholarships = Array.isArray(rawScholarships) ? rawScholarships.map((value) => {
      const item = relation(value), catalog = relation(item.beasiswa);
      return { name: text(item.nama_beasiswa) ?? text(catalog.nama_beasiswa), status: text(item.status_beasiswa) };
    }).filter((item): item is { name: string; status: string | null } => item.name !== null) : [];
    const semester = number(row.semester), ipk = number(row.ipk_terkini);
    return { id: `${admission ?? "timeline"}:${text(event.type) ?? text(event.jenis) ?? "event"}:${row.id ?? index}:${index}`,
      kind: text(event.label) ?? text(event.title) ?? text(event.type) ?? text(event.jenis) ?? (semester !== null ? "Progres perkuliahan" : "Riwayat pendidikan"),
      date: event.granularity === "year" ? null : calendar(row.tanggal_update ?? event.tanggal ?? event.date),
      year: year(row.tahun_masuk_pt ?? row.tahun_lulus ?? event.year ?? event.tahun),
      semester: semester !== null && Number.isInteger(semester) && semester > 0 ? semester : null,
      period: text(row.periode), status: text(row.status_pendidikan) ?? text(row.status_penerimaan),
      ipk: ipk !== null && ipk >= 0 && ipk <= 4 ? ipk : null,
      ukt: number(row.nominal_ukt), ipi: number(row.nominal_ipi),
      kipk: typeof row.penerima_kipk === "boolean" ? row.penerima_kipk : null,
      scholarships, university: university(row), program: text(row.program_studi),
      current: typeof row.is_current === "boolean" ? row.is_current : null };
  });
  return { name: text(student.nama_lengkap) ?? text(root.nama_lengkap), events };
}
