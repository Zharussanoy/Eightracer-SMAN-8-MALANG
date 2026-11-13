export interface RecommendationStudent { id: number; name: string; cohort: string | null; classroom: string | null; classroomId: number | null; hasNisn: boolean }
export interface RecommendationStudentPage { data: RecommendationStudent[]; currentPage: number; lastPage: number; perPage: number; total: number; filters: {cohorts:string[];classrooms:{id:number;name:string}[]} }
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Data siswa belum dapat dibaca. Silakan coba lagi.");
  return value as Record<string, unknown>;
}
function integer(value: unknown, minimum: number) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) throw new Error("Data siswa belum dapat dibaca. Silakan coba lagi.");
  return value;
}
const text=(value:unknown)=>typeof value==="string"&&value.trim()?value:null;
export function parseRecommendationStudents(payload: unknown): RecommendationStudentPage {
  const outer = record(payload);
  const root = Array.isArray(outer.data) ? outer : record(outer.data);
  const meta = root.meta === undefined ? root : record(root.meta);
  if (!Array.isArray(root.data)) throw new Error("Data siswa belum dapat dibaca. Silakan coba lagi.");
  const data = root.data.map((value) => {
    const row = record(value);
    if (typeof row.nama_lengkap !== "string" || !row.nama_lengkap.trim()) throw new Error("Data siswa belum dapat dibaca. Silakan coba lagi.");
    const histories=Array.isArray(row.riwayat_kelas)?row.riwayat_kelas.map(record):[];
    const classroom=histories.find(v=>v.tanggal_selesai===null&&v.kelas&&typeof v.kelas==="object");
    const cls=classroom?record(classroom.kelas):{};
    return { id: integer(row.id, 1), name: row.nama_lengkap, cohort: /^\d{4}$/.test(String(row.tahun_lulus)) ? String(row.tahun_lulus) : null,
      classroom:text(cls.nama_kelas),classroomId:typeof cls.id==="number"?integer(cls.id,1):null,hasNisn:!!text(row.nisn)};
  });
  const total = integer(meta.total, 0), perPage = integer(meta.per_page, 1);
  if (data.length > total || data.length > perPage) throw new Error("Data siswa belum dapat dibaca. Silakan coba lagi.");
  const filters=outer.filters?record(outer.filters):{};
  const cohorts=Array.isArray(filters.cohorts)?filters.cohorts.filter(v=>/^\d{4}$/.test(String(v))).map(String):[...new Set(data.map(v=>v.cohort).filter((v):v is string=>!!v))];
  const classrooms=Array.isArray(filters.classrooms)?filters.classrooms.map(v=>{const c=record(v),name=text(c.nama_kelas);if(!name)throw Error("Kelas tidak valid.");return{id:integer(c.id,1),name};}):[];
  return { data, currentPage: integer(meta.current_page, 1), lastPage: integer(meta.last_page, 1), perPage, total,filters:{cohorts,classrooms} };
}
