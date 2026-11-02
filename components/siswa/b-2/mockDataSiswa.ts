
export interface SiswaProfile {
  nama: string;
  nisn: string;
  kelas: string;
  status: "Aktif" | "Tidak Aktif";
  fotoUrl?: string;
}

export const SISWA_PROFILE: SiswaProfile = {
  nama: "Tegar Saputra",
  nisn: "12345",
  kelas: "XII-A",
  status: "Aktif",
  fotoUrl: "",
};


export interface BiodataSiswa {
  nama: string;
  nis: string;
  nisn: string;
  kelas: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  email: string;
  telepon: string;
  alamat: string;
  status: "Aktif" | "Tidak Aktif";
  fotoUrl?: string;
  terakhirSinkronPdss: string;
  statusPdss: "Terverifikasi" | "Sinkron" | "Belum Sinkron";
  pdssKodeSekolah: string;
}

export const INITIAL_BIODATA_SISWA: BiodataSiswa = {
  nama: "Tegar Saputra",
  nis: "123456",
  nisn: "12345",
  kelas: "XII-A",
  tempatLahir: "Malang",
  tanggalLahir: "07/20/2005",
  jenisKelamin: "Laki-laki",
  email: "tegar.siswa@example.com",
  telepon: "0812-3456-7890",
  alamat: "Malang, Jawa Timur",
  status: "Aktif",
  fotoUrl: "",
  terakhirSinkronPdss: "API v3.2",
  statusPdss: "Terverifikasi",
  pdssKodeSekolah: "20533814",
};

export const DAFTAR_KELAS_B2 = [
  "XII-A",
  "XII-B",
  "XII-C",
  "XII MIPA 1",
  "XII MIPA 2",
  "XII-C",
  "XII MIPA 1",
  "XII MIPA 2",
  "XII MIPA 3",
  "XII MIPA 4",
  "XII IPS 1",
  "XII IPS 2",
  "XII IPS 3",
];

// ---------- Overall Skor ----------
export interface OverallSkor {
  total: number;
  karakter: number;
  nilai: number;
  prestasi: number;
  kehadiran: number;
}

export const OVERALL_SKOR: OverallSkor = {
  total: 90,
  karakter: 60,
  nilai: 85,
  prestasi: 70,
  kehadiran: 95,
};

// ---------- Recap Asesmen ----------
export interface RecapAsesmen {
  kategori: string;
  skor: number;
  total: number;
}

export const RECAP_ASESMEN: RecapAsesmen[] = [
  { kategori: "Riasec", skor: 27, total: 68 },
  { kategori: "Prestasi", skor: 22, total: 68 },
  { kategori: "Prestasi Non Akademik", skor: 22, total: 68 },
  { kategori: "Kecerdasan Majemuk", skor: 19, total: 68 },
];


export interface KarakteristikMetric {
  kategori: string;
  persentase: number;
}

export const METRIK_KARAKTERISTIK: KarakteristikMetric[] = [
  { kategori: "Riasec", persentase: 92 },
  { kategori: "Prestasi", persentase: 90 },
  { kategori: "Prestasi non akademik", persentase: 85 },
  { kategori: "Kecerdasan Majemuk", persentase: 88 },
  { kategori: "Presensi", persentase: 98 },
];

export interface RekomendasiProdiKarakteristik {
  nama: string;
  persentase: number;
}

export const REKOMENDASI_PRODI_KARAKTERISTIK: RekomendasiProdiKarakteristik[] = [
  { nama: "Pendidikan Teknologi Informasi", persentase: 92 },
  { nama: "Sistem Informasi", persentase: 88 },
  { nama: "Teknik Informatika", persentase: 84 },
];

export interface KarakteristikProfileSummary {
  nama: string;
  nisn: string;
  kelas: string;
  status: "Eligible" | "Perlu Peningkatan" | "Tidak Eligible";
  ringkasan: string;
  pembaruanTerakhir: string;
  akumulasiNilaiRapor: number;
  peringkat: string;
}

export const KARAKTERISTIK_SUMMARY: KarakteristikProfileSummary = {
  nama: "Tegar Saputra",
  nisn: "0061284731",
  kelas: "Kelas XII-A",
  status: "Eligible",
  ringkasan: "Profil siswa terverifikasi",
  pembaruanTerakhir: "12 Okt 2026",
  akumulasiNilaiRapor: 93.2,
  peringkat: "Peringkat #01",
};

// ---------- Halaman Akademik (Fitur B2 - Akademik) ----------
export interface AkademikSummaryCard {
  label: string;
  value: string;
  detail: string;
}

export const AKADEMIK_SUMMARY_CARDS: AkademikSummaryCard[] = [
  {
    label: "RATA-RATA NILAI",
    value: "88,6",
    detail: "Dari seluruh mata pelajaran",
  },
  {
    label: "NILAI TERTINGGI",
    value: "96",
    detail: "Matematika",
  },
  {
    label: "NILAI TERENDAH",
    value: "78",
    detail: "Pendidikan Jasmani",
  },
  {
    label: "KEHADIRAN",
    value: "96%",
    detail: "Kehadiran tercatat",
  },
];

export interface AkademikMapelRow {
  id: string;
  mataPelajaran: string;
  sem1: number;
  sem2: number;
  sem3: number;
  rataRata: string;
  predikat: "A" | "B" | "C";
}

export const AKADEMIK_MAPEL_DATA: AkademikMapelRow[] = [
  { id: "1", mataPelajaran: "Matematika", sem1: 90, sem2: 94, sem3: 96, rataRata: "93,3", predikat: "A" },
  { id: "2", mataPelajaran: "Bahasa Indonesia", sem1: 88, sem2: 90, sem3: 92, rataRata: "90,0", predikat: "A" },
  { id: "3", mataPelajaran: "Bahasa Inggris", sem1: 86, sem2: 89, sem3: 91, rataRata: "88,7", predikat: "A" },
  { id: "4", mataPelajaran: "Informatika", sem1: 94, sem2: 92, sem3: 95, rataRata: "93,7", predikat: "A" },
  { id: "5", mataPelajaran: "Dasar TJKT", sem1: 91, sem2: 89, sem3: 93, rataRata: "91,0", predikat: "A" },
  { id: "6", mataPelajaran: "Administrasi Sistem", sem1: 84, sem2: 87, sem3: 90, rataRata: "87,0", predikat: "B" },
  { id: "7", mataPelajaran: "Pendidikan Pancasila", sem1: 88, sem2: 86, sem3: 90, rataRata: "88,0", predikat: "B" },
  { id: "8", mataPelajaran: "Pendidikan Jasmani", sem1: 78, sem2: 82, sem3: 85, rataRata: "81,7", predikat: "B" },
  { id: "9", mataPelajaran: "Fisika Terapan", sem1: 85, sem2: 88, sem3: 91, rataRata: "88,0", predikat: "B" },
  { id: "10", mataPelajaran: "Kimia Dasar", sem1: 87, sem2: 89, sem3: 92, rataRata: "89,3", predikat: "A" },
  { id: "11", mataPelajaran: "Seni Budaya", sem1: 90, sem2: 91, sem3: 93, rataRata: "91,3", predikat: "A" },
  { id: "12", mataPelajaran: "Bimbingan Konseling", sem1: 95, sem2: 96, sem3: 98, rataRata: "96,3", predikat: "A" },
];

export interface AkademikTrendSemester {
  semester: string;
  nilai: number;
}

export const AKADEMIK_TREND_DATA: AkademikTrendSemester[] = [
  { semester: "Semester 1", nilai: 82 },
  { semester: "Semester 2", nilai: 86 },
  { semester: "Semester 3", nilai: 89 },
];

// ---------- Nilai Akademik ----------
export interface NilaiSemester {
  semester: number;
  rata: number;
  mapel: { nama: string; nilai: number }[];
}

export const NILAI_AKADEMIK: NilaiSemester[] = [
  {
    semester: 1,
    rata: 82,
    mapel: [
      { nama: "Matematika", nilai: 80 },
      { nama: "Bahasa Indonesia", nilai: 85 },
      { nama: "Bahasa Inggris", nilai: 82 },
      { nama: "Fisika", nilai: 78 },
      { nama: "Kimia", nilai: 82 },
      { nama: "Biologi", nilai: 88 },
      { nama: "Informatika", nilai: 86 },
      { nama: "Pendidikan Agama", nilai: 85 },
      { nama: "Pendidikan Pancasila", nilai: 84 },
      { nama: "PJOK", nilai: 80 },
      { nama: "Sejarah", nilai: 80 },
      { nama: "Seni Budaya", nilai: 82 },
    ],
  },
  {
    semester: 2,
    rata: 85,
    mapel: [
      { nama: "Matematika", nilai: 83 },
      { nama: "Bahasa Indonesia", nilai: 88 },
      { nama: "Bahasa Inggris", nilai: 85 },
      { nama: "Fisika", nilai: 80 },
      { nama: "Kimia", nilai: 85 },
      { nama: "Biologi", nilai: 90 },
      { nama: "Informatika", nilai: 88 },
      { nama: "Pendidikan Agama", nilai: 88 },
      { nama: "Pendidikan Pancasila", nilai: 86 },
      { nama: "PJOK", nilai: 82 },
      { nama: "Sejarah", nilai: 83 },
      { nama: "Seni Budaya", nilai: 85 },
    ],
  },
  {
    semester: 3,
    rata: 87,
    mapel: [
      { nama: "Matematika", nilai: 85 },
      { nama: "Bahasa Indonesia", nilai: 89 },
      { nama: "Bahasa Inggris", nilai: 88 },
      { nama: "Fisika", nilai: 83 },
      { nama: "Kimia", nilai: 87 },
      { nama: "Biologi", nilai: 91 },
      { nama: "Informatika", nilai: 92 },
      { nama: "Pendidikan Agama", nilai: 90 },
      { nama: "Pendidikan Pancasila", nilai: 88 },
      { nama: "PJOK", nilai: 85 },
      { nama: "Sejarah", nilai: 85 },
      { nama: "Seni Budaya", nilai: 88 },
    ],
  },
  {
    semester: 4,
    rata: 88,
    mapel: [
      { nama: "Matematika", nilai: 87 },
      { nama: "Bahasa Indonesia", nilai: 90 },
      { nama: "Bahasa Inggris", nilai: 89 },
      { nama: "Fisika", nilai: 84 },
      { nama: "Kimia", nilai: 89 },
      { nama: "Biologi", nilai: 92 },
      { nama: "Informatika", nilai: 94 },
      { nama: "Pendidikan Agama", nilai: 90 },
      { nama: "Pendidikan Pancasila", nilai: 90 },
      { nama: "PJOK", nilai: 86 },
      { nama: "Sejarah", nilai: 85 },
      { nama: "Seni Budaya", nilai: 90 },
    ],
  },
  {
    semester: 5,
    rata: 91,
    mapel: [
      { nama: "Matematika", nilai: 90 },
      { nama: "Bahasa Indonesia", nilai: 92 },
      { nama: "Bahasa Inggris", nilai: 91 },
      { nama: "Fisika", nilai: 88 },
      { nama: "Kimia", nilai: 91 },
      { nama: "Biologi", nilai: 95 },
      { nama: "Informatika", nilai: 96 },
      { nama: "Pendidikan Agama", nilai: 92 },
      { nama: "Pendidikan Pancasila", nilai: 92 },
      { nama: "PJOK", nilai: 88 },
      { nama: "Sejarah", nilai: 86 },
      { nama: "Seni Budaya", nilai: 93 },
    ],
  },
  {
    semester: 6,
    rata: 93,
    mapel: [
      { nama: "Matematika", nilai: 93 },
      { nama: "Bahasa Indonesia", nilai: 95 },
      { nama: "Bahasa Inggris", nilai: 93 },
      { nama: "Fisika", nilai: 90 },
      { nama: "Kimia", nilai: 93 },
      { nama: "Biologi", nilai: 97 },
      { nama: "Informatika", nilai: 98 },
      { nama: "Pendidikan Agama", nilai: 94 },
      { nama: "Pendidikan Pancasila", nilai: 94 },
      { nama: "PJOK", nilai: 90 },
      { nama: "Sejarah", nilai: 89 },
      { nama: "Seni Budaya", nilai: 95 },
    ],
  },
];

// ============================================================
// DATA SAW — Rekomendasi Program Studi (Fitur B2)
// ============================================================

export interface KriteriaBobot {
  id: string;
  nama: string;
  bobot: number; // 0–1, jumlah semua bobot harus = 1
  jenisManfaat: "benefit" | "cost";
  keterangan: string;
}

export interface ProdiAlternatif {
  id: string;
  namaProdi: string;
  universitas: string;
  kodeUniv: string;
  skorNilai: number;
  minat: number;
  peluangKarir: number;
  dayaTampung: number;
  tingkatKesulitan: number;
  jalurMasuk: "SNBP" | "SNBT" | "Mandiri";
}

export interface HasilSAW {
  id: string;
  namaProdi: string;
  universitas: string;
  kodeUniv: string;
  skor: number;
  peringkat: number;
  jalurMasuk: string;
  rekomendasi:
    | "Sangat Direkomendasikan"
    | "Direkomendasikan"
    | "Pertimbangkan"
    | "Kurang Sesuai";
}

export const KRITERIA_SAW: KriteriaBobot[] = [
  {
    id: "k1",
    nama: "Nilai Akademik",
    bobot: 0.3,
    jenisManfaat: "benefit",
    keterangan: "Rata-rata nilai rapor 5 semester terakhir",
  },
  {
    id: "k2",
    nama: "Kesesuaian Minat",
    bobot: 0.25,
    jenisManfaat: "benefit",
    keterangan: "Skor kesesuaian minat dari asesmen RIASEC",
  },
  {
    id: "k3",
    nama: "Peluang Karir",
    bobot: 0.2,
    jenisManfaat: "benefit",
    keterangan: "Indeks prospek karir program studi",
  },
  {
    id: "k4",
    nama: "Daya Tampung",
    bobot: 0.15,
    jenisManfaat: "benefit",
    keterangan: "Jumlah kuota penerimaan (lebih besar = lebih mudah)",
  },
  {
    id: "k5",
    nama: "Tingkat Kesulitan",
    bobot: 0.1,
    jenisManfaat: "cost",
    keterangan: "Tingkat persaingan (lebih rendah = lebih mudah)",
  },
];

export const ALTERNATIF_PRODI: ProdiAlternatif[] = [
  {
    id: "p1",
    namaProdi: "Teknik Informatika",
    universitas: "Universitas Brawijaya",
    kodeUniv: "UB",
    skorNilai: 88,
    minat: 9,
    peluangKarir: 10,
    dayaTampung: 120,
    tingkatKesulitan: 8,
    jalurMasuk: "SNBP",
  },
  {
    id: "p2",
    namaProdi: "Sistem Informasi",
    universitas: "Universitas Negeri Malang",
    kodeUniv: "UM",
    skorNilai: 85,
    minat: 8,
    peluangKarir: 9,
    dayaTampung: 150,
    tingkatKesulitan: 6,
    jalurMasuk: "SNBP",
  },
  {
    id: "p3",
    namaProdi: "Ilmu Komputer",
    universitas: "Universitas Gadjah Mada",
    kodeUniv: "UGM",
    skorNilai: 92,
    minat: 8,
    peluangKarir: 10,
    dayaTampung: 80,
    tingkatKesulitan: 9,
    jalurMasuk: "SNBT",
  },
  {
    id: "p4",
    namaProdi: "Teknik Elektro",
    universitas: "Institut Teknologi Bandung",
    kodeUniv: "ITB",
    skorNilai: 90,
    minat: 6,
    peluangKarir: 9,
    dayaTampung: 60,
    tingkatKesulitan: 10,
    jalurMasuk: "SNBT",
  },
  {
    id: "p5",
    namaProdi: "Matematika",
    universitas: "Universitas Negeri Malang",
    kodeUniv: "UM",
    skorNilai: 87,
    minat: 7,
    peluangKarir: 7,
    dayaTampung: 100,
    tingkatKesulitan: 5,
    jalurMasuk: "SNBP",
  },
  {
    id: "p6",
    namaProdi: "Statistika",
    universitas: "ITS Surabaya",
    kodeUniv: "ITS",
    skorNilai: 86,
    minat: 7,
    peluangKarir: 8,
    dayaTampung: 90,
    tingkatKesulitan: 6,
    jalurMasuk: "SNBT",
  },
];


export interface SiswaEligibilitas {
  peringkat: number;
  nama: string;
  nisn: string;
  kelas: string;
  skorAkademik: number;
  skorKarakter: number;
  skorPrestasi: number;
  skorKehadiran: number;
  totalSkor: number;
  status: "Eligible" | "Perlu Peningkatan" | "Tidak Eligible";
  jalurRekomendasi: "SNBP" | "SNBT" | "Mandiri";
}

export const RANKING_ELIGIBILITAS: SiswaEligibilitas[] = [
  {
    peringkat: 1,
    nama: "Naysilla Salsa Ardiyati",
    nisn: "0054819283",
    kelas: "XII-A",
    skorAkademik: 96,
    skorKarakter: 92,
    skorPrestasi: 95,
    skorKehadiran: 98,
    totalSkor: 95.2,
    status: "Eligible",
    jalurRekomendasi: "SNBP",
  },
  {
    peringkat: 2,
    nama: "Amalia Rizqi Kurniawati",
    nisn: "0054819285",
    kelas: "XII-B",
    skorAkademik: 94,
    skorKarakter: 90,
    skorPrestasi: 93,
    skorKehadiran: 97,
    totalSkor: 93.5,
    status: "Eligible",
    jalurRekomendasi: "SNBP",
  },
  {
    peringkat: 3,
    nama: "Mohammad Yan Hasby",
    nisn: "0054819287",
    kelas: "XII-C",
    skorAkademik: 92,
    skorKarakter: 88,
    skorPrestasi: 85,
    skorKehadiran: 96,
    totalSkor: 90.8,
    status: "Eligible",
    jalurRekomendasi: "SNBP",
  },
  {
    peringkat: 4,
    nama: "Tegar Saputra",
    nisn: "12345",
    kelas: "XII-A",
    skorAkademik: 85,
    skorKarakter: 60,
    skorPrestasi: 70,
    skorKehadiran: 95,
    totalSkor: 78.5,
    status: "Eligible",
    jalurRekomendasi: "SNBT",
  },
  {
    peringkat: 5,
    nama: "Amalia Mayasari",
    nisn: "0054819284",
    kelas: "XII-B",
    skorAkademik: 88,
    skorKarakter: 82,
    skorPrestasi: 75,
    skorKehadiran: 90,
    totalSkor: 84.2,
    status: "Eligible",
    jalurRekomendasi: "SNBT",
  },
  {
    peringkat: 6,
    nama: "Rusyda Octa Amalia",
    nisn: "0054819286",
    kelas: "XII-A",
    skorAkademik: 78,
    skorKarakter: 75,
    skorPrestasi: 65,
    skorKehadiran: 85,
    totalSkor: 75.8,
    status: "Perlu Peningkatan",
    jalurRekomendasi: "Mandiri",
  },
  {
    peringkat: 7,
    nama: "Bagas Arya Putra",
    nisn: "0054819288",
    kelas: "XII-C",
    skorAkademik: 82,
    skorKarakter: 78,
    skorPrestasi: 80,
    skorKehadiran: 88,
    totalSkor: 81.5,
    status: "Eligible",
    jalurRekomendasi: "SNBT",
  },
  {
    peringkat: 8,
    nama: "Clarissa Dewi",
    nisn: "0054819289",
    kelas: "XII-B",
    skorAkademik: 75,
    skorKarakter: 70,
    skorPrestasi: 60,
    skorKehadiran: 80,
    totalSkor: 71.3,
    status: "Perlu Peningkatan",
    jalurRekomendasi: "Mandiri",
  },
  {
    peringkat: 9,
    nama: "Danang Kusuma",
    nisn: "0054819290",
    kelas: "XII-C",
    skorAkademik: 65,
    skorKarakter: 60,
    skorPrestasi: 55,
    skorKehadiran: 75,
    totalSkor: 63.8,
    status: "Tidak Eligible",
    jalurRekomendasi: "Mandiri",
  },
  {
    peringkat: 10,
    nama: "Rizky Pratama",
    nisn: "0054819291",
    kelas: "XII-A",
    skorAkademik: 70,
    skorKarakter: 65,
    skorPrestasi: 58,
    skorKehadiran: 78,
    totalSkor: 67.9,
    status: "Tidak Eligible",
    jalurRekomendasi: "Mandiri",
  },
];

// ---------- Fitur B2: Catatan Siswa ----------
export type StatusCatatan = "Selesai" | "Tindak lanjut" | "Privat";

export interface CatatanSiswaItem {
  id: string; // ID internal misal "1001" atau "cat-1"
  idCatatan: string; // misal "1001"
  idSiswa: string; // misal "30"
  semester: number | string; // misal 2
  jenisCatatan: string; // misal "Disiplin", "Tanggung Jawab", dll.
  poinDisiplin: string; // misal "-5", "+3", "+5", "+2"
  deskripsiCatatan: string; // Deskripsi lengkap catatan
  tanggalPencatatan: string; // misal "12 Okt 2026"
  tanggalLengkap: string; // misal "12 Oktober 2026"
  kategoriSubtitle?: string; // misal "Akademik" untuk subjudul "12 Oktober 2026 • Akademik"
  
  // Backward compatibility fields
  tanggal?: string;
  kategori?: string;
  judul?: string;
  ringkasan?: string;
  tindakLanjut?: string;
  pencatat?: string;
  pencatatLengkap?: string;
  status?: StatusCatatan;
}

export interface RiwayatCatatanItem {
  waktu: string;
  aktor: string;
  aksi: string;
  keterangan: string;
}

export const MOCK_CATATAN_LIST: CatatanSiswaItem[] = [
  {
    id: "1001",
    idCatatan: "1001",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Disiplin",
    poinDisiplin: "-5",
    deskripsiCatatan: "Datang tepat waktu dan mematuhi aturan sekolah.",
    tanggalPencatatan: "12 Okt 2026",
    tanggalLengkap: "12 Oktober 2026",
    kategoriSubtitle: "Akademik",
    // Compatibility fields
    tanggal: "12 Okt 2026",
    kategori: "Disiplin",
    judul: "Disiplin Kedatangan",
    ringkasan: "Datang tepat waktu dan mematuhi aturan sekolah.",
    pencatat: "Wali kelas",
    pencatatLengkap: "Ibu Rina · Wali Kelas",
    status: "Selesai",
  },
  {
    id: "1002",
    idCatatan: "1002",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Tanggung Jawab",
    poinDisiplin: "+3",
    deskripsiCatatan: "Menyelesaikan tugas sesuai batas waktu.",
    tanggalPencatatan: "10 Okt 2026",
    tanggalLengkap: "10 Oktober 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "10 Okt 2026",
    kategori: "Tanggung Jawab",
    judul: "Ketepatan Tugas",
    ringkasan: "Menyelesaikan tugas sesuai batas waktu.",
    pencatat: "Wali kelas",
    pencatatLengkap: "Ibu Rina · Wali Kelas",
    status: "Selesai",
  },
  {
    id: "1003",
    idCatatan: "1003",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Diskusi target belajar",
    poinDisiplin: "+3",
    deskripsiCatatan: "Aktif membantu teman dalam kegiatan kelompok.",
    tanggalPencatatan: "08 Okt 2026",
    tanggalLengkap: "08 Oktober 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "08 Okt 2026",
    kategori: "Diskusi target belajar",
    judul: "Kerja Kelompok",
    ringkasan: "Aktif membantu teman dalam kegiatan kelompok.",
    pencatat: "Guru BK",
    pencatatLengkap: "Bpk. Bambang, S.Pd · Guru BK",
    status: "Selesai",
  },
  {
    id: "1004",
    idCatatan: "1004",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Kerja Sama",
    poinDisiplin: "+3",
    deskripsiCatatan: "Mengakui kesalahan dan bersikap jujur saat ujian.",
    tanggalPencatatan: "05 Okt 2026",
    tanggalLengkap: "05 Oktober 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "05 Okt 2026",
    kategori: "Kerja Sama",
    judul: "Sikap Kejujuran",
    ringkasan: "Mengakui kesalahan dan bersikap jujur saat ujian.",
    pencatat: "Guru Mapel",
    pencatatLengkap: "Ibu Siti, M.Pd · Guru Fisika",
    status: "Selesai",
  },
  {
    id: "1005",
    idCatatan: "1005",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Kejujuran",
    poinDisiplin: "+5",
    deskripsiCatatan: "Mengerjakan tugas tanpa bergantung pada teman.",
    tanggalPencatatan: "02 Okt 2026",
    tanggalLengkap: "02 Oktober 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "02 Okt 2026",
    kategori: "Kejujuran",
    judul: "Kemandirian Belajar",
    ringkasan: "Mengerjakan tugas tanpa bergantung pada teman.",
    pencatat: "Guru BK",
    pencatatLengkap: "Bpk. Bambang, S.Pd · Guru BK",
    status: "Selesai",
  },
  {
    id: "1006",
    idCatatan: "1006",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Kemandirian",
    poinDisiplin: "+3",
    deskripsiCatatan: "Terlambat mengumpulkan tugas tanpa alasan yang jelas.",
    tanggalPencatatan: "29 Sep 2026",
    tanggalLengkap: "29 September 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "29 Sep 2026",
    kategori: "Kemandirian",
    judul: "Keterlambatan Pengumpulan Tugas",
    ringkasan: "Terlambat mengumpulkan tugas tanpa alasan yang jelas.",
    pencatat: "Guru Mapel",
    pencatatLengkap: "Bpk. Hendra, M.Kom · Pembina Ekstrakurikuler",
    status: "Tindak lanjut",
  },
  {
    id: "1007",
    idCatatan: "1007",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Disiplin",
    poinDisiplin: "+5",
    deskripsiCatatan: "Tidak mematuhi tata tertib selama kegiatan belajar.",
    tanggalPencatatan: "25 Sep 2026",
    tanggalLengkap: "25 September 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "25 Sep 2026",
    kategori: "Disiplin",
    judul: "Pelanggaran Tata Tertib",
    ringkasan: "Tidak mematuhi tata tertib selama kegiatan belajar.",
    pencatat: "Tim Tatib",
    pencatatLengkap: "Tim Tata Tertib Sekolah",
    status: "Tindak lanjut",
  },
  {
    id: "1008",
    idCatatan: "1008",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Kepedulian",
    poinDisiplin: "+2",
    deskripsiCatatan: "Membantu menjaga kebersihan ruang kelas.",
    tanggalPencatatan: "21 Sep 2026",
    tanggalLengkap: "21 September 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "21 Sep 2026",
    kategori: "Kepedulian",
    judul: "Kebersihan Kelas",
    ringkasan: "Membantu menjaga kebersihan ruang kelas.",
    pencatat: "Wali kelas",
    pencatatLengkap: "Ibu Rina · Wali Kelas",
    status: "Selesai",
  },
  // Data tambahan untuk halaman pagination ke-2 (menampilkan 8 dari 12 catatan)
  {
    id: "1009",
    idCatatan: "1009",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Kedisiplinan",
    poinDisiplin: "+4",
    deskripsiCatatan: "Mengikuti upacara bendera dengan tertib dan khidmat.",
    tanggalPencatatan: "15 Sep 2026",
    tanggalLengkap: "15 September 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "15 Sep 2026",
    kategori: "Kedisiplinan",
    judul: "Kedisiplinan Upacara",
    ringkasan: "Mengikuti upacara bendera dengan tertib dan khidmat.",
    pencatat: "Tim Tatib",
    pencatatLengkap: "Tim Tata Tertib Sekolah",
    status: "Selesai",
  },
  {
    id: "1010",
    idCatatan: "1010",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Konseling",
    poinDisiplin: "+3",
    deskripsiCatatan: "Konsultasi minat bakat dan perencanaan studi perguruan tinggi.",
    tanggalPencatatan: "10 Sep 2026",
    tanggalLengkap: "10 September 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "10 Sep 2026",
    kategori: "Konseling",
    judul: "Konsultasi Minat",
    ringkasan: "Konsultasi minat bakat dan perencanaan studi perguruan tinggi.",
    pencatat: "Guru BK",
    pencatatLengkap: "Bpk. Bambang, S.Pd · Guru BK",
    status: "Privat",
  },
  {
    id: "1011",
    idCatatan: "1011",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Tanggung Jawab",
    poinDisiplin: "+2",
    deskripsiCatatan: "Menjalankan piket kelas secara konsisten setiap hari Rabu.",
    tanggalPencatatan: "03 Sep 2026",
    tanggalLengkap: "03 September 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "03 Sep 2026",
    kategori: "Tanggung Jawab",
    judul: "Piket Kelas",
    ringkasan: "Menjalankan piket kelas secara konsisten setiap hari Rabu.",
    pencatat: "Wali kelas",
    pencatatLengkap: "Ibu Rina · Wali Kelas",
    status: "Selesai",
  },
  {
    id: "1012",
    idCatatan: "1012",
    idSiswa: "30",
    semester: 2,
    jenisCatatan: "Kerja Sama",
    poinDisiplin: "+3",
    deskripsiCatatan: "Membantu koordinasi pengumpulan donasi bakti sosial sekolah.",
    tanggalPencatatan: "28 Agu 2026",
    tanggalLengkap: "28 Agustus 2026",
    kategoriSubtitle: "Akademik",
    tanggal: "28 Agu 2026",
    kategori: "Kerja Sama",
    judul: "Bakti Sosial",
    ringkasan: "Membantu koordinasi pengumpulan donasi bakti sosial sekolah.",
    pencatat: "Pembina",
    pencatatLengkap: "Bpk. Hendra, M.Kom · Pembina OSIS",
    status: "Selesai",
  },
];

export const MOCK_RIWAYAT_PERUBAHAN: Record<string, RiwayatCatatanItem[]> = {
  "cat-1": [
    {
      waktu: "12 Okt 2026, 14:30 WIB",
      aktor: "Ibu Rina (Wali Kelas)",
      aksi: "Membuat catatan baru",
      keterangan: "Mencatat kemajuan hasil evaluasi ulangan harian siswa.",
    },
    {
      waktu: "12 Okt 2026, 16:15 WIB",
      aktor: "Ibu Rina (Wali Kelas)",
      aksi: "Memperbarui tindak lanjut",
      keterangan: "Menambahkan poin pemantauan pada pekan berikutnya.",
    },
    {
      waktu: "13 Okt 2026, 08:00 WIB",
      aktor: "Sistem Eightracer",
      aksi: "Sinkronisasi status",
      keterangan: "Status catatan diperbarui menjadi Selesai.",
    },
  ],
};
