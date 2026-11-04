import { AlumniItem } from "@/components/admin/direktori-alumni/types";

export interface ApiAlumni {
  id: number;
  nama: string;
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
    nisn: "-",
    nama: api.nama,
    kelas: "-",
    angkatan: api.tahun_lulus ? `Alumni ${api.tahun_lulus}` : "-",
    kampus: api.univ ?? "-",
    kampusKode: api.univ_singkat ?? "-",
    jenisKampus: undefined,
    jurusan: api.prodi ?? "-",
    jalur: api.jalur_masuk ?? "-",
    nomorWa: undefined,
    pilihanKe: api.pilihan_ke ? `Pilihan ${api.pilihan_ke}` : "-",
    statusPdss: undefined,
    statusPenerimaan: api.status_penerimaan ?? "-",
    jenjang: api.strata ?? "-",
    nilai: api.nilai_rapor ?? 0,
    skorUtbk: api.skor_utbk,
    sertifikat: (api.sertifikat || []).map(
      (s) => s.nama_kompetisi || "-"
    ),
    isKipk: api.is_kipk,
  };
}
