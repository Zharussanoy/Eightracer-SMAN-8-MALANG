import { AlumniItem } from "@/components/admin/direktori-alumni/types";

export interface ApiAlumni {
  id: number;
  nama: string;
  nisn?: string | null;
  kelas?: string | null;
  nomor_wa?: string | null;
  jenis_kampus?: AlumniItem["jenisKampus"] | null;
  jalur_lainnya?: string | null;
  lembaga_penyalur?: string | null;
  pelamar_kipk?: "YA" | "TIDAK" | null;
  beasiswa?: string | null;
  beasiswa_lainnya?: string | null;
  pekerjaan?: string | null;
  tahun_lulus: string | null;
  univ: string | null;
  univ_singkat: string | null;
  provinsi: string | null;
  prodi: string | null;
  strata: string | null;
  jalur_masuk: string | null;
  sub_jalur: string | null;
  pilihan_ke: number | null;
  status_penerimaan: string | null;
  nilai_rapor: number | null;
  skor_utbk: number | null;
  is_kipk: boolean;
  sertifikat: Array<{
    nama_kompetisi?: string;
    tingkat?: string;
    peringkat?: string;
    tahun?: number;
  }>;
}

export function mapApiAlumniToItem(api: ApiAlumni): AlumniItem {
  return {
    id: String(api.id),
    nisn: api.nisn ?? "-",
    nama: api.nama,
    kelas: api.kelas ?? "-",
    angkatan: api.tahun_lulus ? `Alumni ${api.tahun_lulus}` : "-",
    kampus: api.univ ?? "-",
    kampusKode: api.univ_singkat ?? "-",
    jenisKampus: api.jenis_kampus ?? undefined,
    jurusan: api.prodi ?? "-",
    jalur: api.jalur_masuk ?? "-",
    nomorWa: api.nomor_wa ?? undefined,
    pilihanKe: api.pilihan_ke == null ? "-" : api.pilihan_ke === 0 ? "Tanpa Pilihan" : String(api.pilihan_ke),
    statusPdss: undefined,
    statusPenerimaan: api.status_penerimaan ?? "-",
    jenjang: api.strata ?? "-",
    nilai: api.nilai_rapor ?? 0,
    skorUtbk: api.skor_utbk,
    sertifikat: (api.sertifikat || []).map(
      (s) => s.nama_kompetisi || "-"
    ),
    isKipk: api.is_kipk,
    jalurLainnya: api.jalur_lainnya ?? api.sub_jalur ?? undefined,
    lembagaPenyalur: api.jenis_kampus === "Luar Negeri" ? api.lembaga_penyalur ?? "" : "",
    pelamarKipk: api.pelamar_kipk ?? "",
    beasiswa: api.beasiswa ?? "",
    beasiswaLainnya: api.beasiswa_lainnya ?? "",
    pekerjaan: api.pekerjaan ?? "",
  };
}
