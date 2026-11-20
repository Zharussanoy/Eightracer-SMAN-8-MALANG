export type StatusRapor = "Antrean Cek" | "Tervalidasi Rapor Fisik" | "Perlu Koreksi Fisik" | "Belum Diisi";

export interface MapelNilaiValidationItem {
  id?: number | string;
  mataPelajaranId?: number;
  namaMapel: string;
  inputMandiri: number;
  bukuRapor: number;
  selisih: number;
  adaSelisih?: boolean;
  statusValidasi?: string;
  tanggalInput?: string;
  catatanWaliKelas?: string | null;
}

export interface StudentB1WaliKelas {
  id: string;
  no: string;
  nisn: string;
  nama: string;
  initial: string;
  kelas: string;
  semester: string;
  daftarSemesterTerisi?: number[];
  kelengkapanProfil: number; // e.g. 100
  mapelPilihanCount: string; // e.g. "4/4 Mapel"
  rataRata: number; // e.g. 85.25
  statusRapor: StatusRapor;
  hasDiscrepancy?: boolean;
  mapelDiscrepancy?: MapelNilaiValidationItem;
  daftarNilaiPilihan?: MapelNilaiValidationItem[];
  profilDetail?: {
    mapelPilihan: string[];
    riasec: {
      kode: string;
      label: string;
      deskripsi: string;
    };
    kecerdasanMajemuk: {
      tipe: string;
      deskripsi: string;
    };
    prestasi: {
      id: string;
      judul: string;
      penyelenggara: string;
      tahun: string;
      tingkat: string;
    }[];
  };
}

