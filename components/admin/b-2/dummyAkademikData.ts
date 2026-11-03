

export interface NilaiRapor {
  mataPelajaran: string;
  jurusan: "MIPA" | "IPS" | "Umum";
  semester: { s1: number | null; s2: number | null; s3: number | null; s4: number | null; s5: number | null };
}

export interface PrestasiItem {
  id: string;
  kategori: "Akademik" | "Non-Akademik" | "Seni & Budaya" | "Olahraga" | "Lainnya";
  jenis: string;
  tingkat: "Internasional" | "Nasional" | "Provinsi" | "Kota/Kabupaten" | "Sekolah";
  namaPrestasi: string;
  tahun: string;
  status: "Juara 1" | "Juara 2" | "Juara 3" | "Finalis" | "Peserta";
}

export interface KehadiranSemester {
  izin: number;
  sakit: number;
  alfa: number;
}

export interface RiasecData {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

export interface CatatanKarakter {
  id: string;
  tanggal: string;
  semester: string;
  kelas: string;
  tipeKatatan: string;
  catatan: string;
  nilaiBobotKuantitatif: number;
}

export interface NilaiTkaWajib {
  matematika: number;
  literasiBahasaIndonesia: number;
  literasiBahasaInggris: number;
  bahasaPadasi: number;
  tanggalUjian: string;
}

export interface NilaiTkaPilihan {
  mataUji: "Fisika" | "Kimia" | "Biologi" | "Geografi" | "Ekonomi" | "Sosiologi" | "Sejarah";
  nilai: number;
  tanggalUjian: string;
}

export interface KecerdasanMajemuk {
  tipeMusik: "Tinggi" | "Sedang" | "Rendah";
  diriKebahasaan: number;
  kinestetik: number;
  spasialVisual: number;
  interpersonal: number;
  intrapersonal: number;
  naturalis: number;
  logisMatematis: number;
}

export interface AkademikDataItem {
  siswaId: string;
  nilaiRapor: NilaiRapor[];
  prestasi: PrestasiItem[];
  kehadiran: {
    s1: KehadiranSemester;
    s2: KehadiranSemester;
    s3: KehadiranSemester;
    s4: KehadiranSemester;
    s5: KehadiranSemester;
  };
  riasec: RiasecData;
  catatanKarakter: CatatanKarakter[];
  nilaiTkaWajib: NilaiTkaWajib;
  nilaiTkaPilihan: NilaiTkaPilihan[];
  kecerdasanMajemuk: KecerdasanMajemuk;
}


const mataWajibMIPA: NilaiRapor["mataPelajaran"][] = [
  "Matematika Peminatan",
  "Fisika",
  "Kimia",
  "Biologi",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Pendidikan Agama",
  "PPKn",
];

const mataWajibIPS: NilaiRapor["mataPelajaran"][] = [
  "Geografi",
  "Ekonomi",
  "Sosiologi",
  "Sejarah",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Pendidikan Agama",
  "PPKn",
];

function makeRaporMIPA(base: number): NilaiRapor[] {
  return mataWajibMIPA.map((m) => ({
    mataPelajaran: m,
    jurusan: "MIPA",
    semester: {
      s1: Math.min(100, Math.round(base + (Math.random() * 6 - 3))),
      s2: Math.min(100, Math.round(base + (Math.random() * 6 - 3))),
      s3: Math.min(100, Math.round(base + (Math.random() * 6 - 3))),
      s4: Math.min(100, Math.round(base + (Math.random() * 6 - 3))),
      s5: Math.min(100, Math.round(base + (Math.random() * 6 - 3))),
    },
  }));
}

function makeRaporIPS(base: number): NilaiRapor[] {
  return mataWajibIPS.map((m) => ({
    mataPelajaran: m,
    jurusan: "IPS",
    semester: {
      s1: Math.min(100, Math.round(base + (Math.random() * 6 - 3))),
      s2: Math.min(100, Math.round(base + (Math.random() * 6 - 3))),
      s3: Math.min(100, Math.round(base + (Math.random() * 6 - 3))),
      s4: Math.min(100, Math.round(base + (Math.random() * 6 - 3))),
      s5: Math.min(100, Math.round(base + (Math.random() * 6 - 3))),
    },
  }));
}


export const DUMMY_AKADEMIK_DATA: Record<string, AkademikDataItem> = {
  "1": {
    siswaId: "1",
    nilaiRapor: [
      { mataPelajaran: "Matematika Peminatan", jurusan: "MIPA", semester: { s1: 95, s2: 96, s3: 94, s4: 97, s5: 95 } },
      { mataPelajaran: "Fisika", jurusan: "MIPA", semester: { s1: 92, s2: 93, s3: 94, s4: 94, s5: 96 } },
      { mataPelajaran: "Kimia", jurusan: "MIPA", semester: { s1: 96, s2: 95, s3: 97, s4: 96, s5: 98 } },
      { mataPelajaran: "Biologi", jurusan: "MIPA", semester: { s1: 97, s2: 96, s3: 98, s4: 97, s5: 97 } },
      { mataPelajaran: "Bahasa Indonesia", jurusan: "MIPA", semester: { s1: 91, s2: 93, s3: 92, s4: 94, s5: 93 } },
      { mataPelajaran: "Bahasa Inggris", jurusan: "MIPA", semester: { s1: 94, s2: 95, s3: 96, s4: 95, s5: 97 } },
      { mataPelajaran: "Pendidikan Agama", jurusan: "MIPA", semester: { s1: 93, s2: 94, s3: 93, s4: 95, s5: 94 } },
      { mataPelajaran: "PPKn", jurusan: "MIPA", semester: { s1: 90, s2: 92, s3: 91, s4: 93, s5: 92 } },
    ],
    prestasi: [
      { id: "p1", kategori: "Akademik", jenis: "Olimpiade", tingkat: "Nasional", namaPrestasi: "OSN Biologi", tahun: "2024", status: "Juara 1" },
      { id: "p2", kategori: "Non-Akademik", jenis: "Organisasi", tingkat: "Sekolah", namaPrestasi: "Ketua OSIS SMAN 8 Malang", tahun: "2024", status: "Peserta" },
    ],
    kehadiran: {
      s1: { izin: 1, sakit: 2, alfa: 0 },
      s2: { izin: 0, sakit: 1, alfa: 0 },
      s3: { izin: 2, sakit: 1, alfa: 0 },
      s4: { izin: 0, sakit: 0, alfa: 0 },
      s5: { izin: 1, sakit: 2, alfa: 0 },
    },
    riasec: { R: 60, I: 90, A: 55, S: 75, E: 65, C: 70 },
    catatanKarakter: [
      { id: "c1", tanggal: "2023-07-15", semester: "S1", kelas: "X MIPA 1", tipeKatatan: "Positif", catatan: "Aktif berpartisipasi dalam diskusi kelas dan selalu mengumpulkan tugas tepat waktu.", nilaiBobotKuantitatif: 90 },
      { id: "c2", tanggal: "2024-01-20", semester: "S3", kelas: "XI MIPA 1", tipeKatatan: "Positif", catatan: "Menunjukkan kepemimpinan yang baik dalam kegiatan kelompok belajar.", nilaiBobotKuantitatif: 95 },
      { id: "c3", tanggal: "2024-08-05", semester: "S5", kelas: "XII MIPA 1", tipeKatatan: "Positif", catatan: "Berperan aktif sebagai tutor sebaya untuk teman yang membutuhkan bantuan.", nilaiBobotKuantitatif: 92 },
    ],
    nilaiTkaWajib: { matematika: 94, literasiBahasaIndonesia: 92, literasiBahasaInggris: 96, bahasaPadasi: 88, tanggalUjian: "2024-10-15" },
    nilaiTkaPilihan: [
      { mataUji: "Biologi", nilai: 97, tanggalUjian: "2024-10-15" },
      { mataUji: "Kimia", nilai: 95, tanggalUjian: "2024-10-15" },
    ],
    kecerdasanMajemuk: { tipeMusik: "Sedang", diriKebahasaan: 88, kinestetik: 72, spasialVisual: 85, interpersonal: 90, intrapersonal: 87, naturalis: 92, logisMatematis: 94 },
  },

  "2": {
    siswaId: "2",
    nilaiRapor: [
      { mataPelajaran: "Matematika Peminatan", jurusan: "MIPA", semester: { s1: 93, s2: 94, s3: 95, s4: 94, s5: 96 } },
      { mataPelajaran: "Fisika", jurusan: "MIPA", semester: { s1: 91, s2: 92, s3: 93, s4: 94, s5: 95 } },
      { mataPelajaran: "Kimia", jurusan: "MIPA", semester: { s1: 89, s2: 90, s3: 91, s4: 92, s5: 93 } },
      { mataPelajaran: "Biologi", jurusan: "MIPA", semester: { s1: 88, s2: 90, s3: 91, s4: 92, s5: 93 } },
      { mataPelajaran: "Bahasa Indonesia", jurusan: "MIPA", semester: { s1: 92, s2: 93, s3: 94, s4: 94, s5: 95 } },
      { mataPelajaran: "Bahasa Inggris", jurusan: "MIPA", semester: { s1: 96, s2: 96, s3: 97, s4: 97, s5: 98 } },
      { mataPelajaran: "Pendidikan Agama", jurusan: "MIPA", semester: { s1: 91, s2: 92, s3: 92, s4: 93, s5: 93 } },
      { mataPelajaran: "PPKn", jurusan: "MIPA", semester: { s1: 90, s2: 91, s3: 91, s4: 92, s5: 92 } },
    ],
    prestasi: [
      { id: "p1", kategori: "Akademik", jenis: "Kompetisi", tingkat: "Provinsi", namaPrestasi: "Gemastik - Keamanan Siber", tahun: "2024", status: "Juara 2" },
      { id: "p2", kategori: "Non-Akademik", jenis: "Teknologi", tingkat: "Nasional", namaPrestasi: "Hackathon Kemendikbud", tahun: "2023", status: "Finalis" },
    ],
    kehadiran: {
      s1: { izin: 2, sakit: 1, alfa: 0 },
      s2: { izin: 1, sakit: 2, alfa: 0 },
      s3: { izin: 0, sakit: 1, alfa: 0 },
      s4: { izin: 1, sakit: 0, alfa: 0 },
      s5: { izin: 0, sakit: 2, alfa: 0 },
    },
    riasec: { R: 80, I: 85, A: 50, S: 60, E: 70, C: 75 },
    catatanKarakter: [
      { id: "c1", tanggal: "2023-08-10", semester: "S1", kelas: "X MIPA 2", tipeKatatan: "Positif", catatan: "Memiliki kemampuan pemecahan masalah yang sangat baik dalam mata pelajaran matematika.", nilaiBobotKuantitatif: 88 },
      { id: "c2", tanggal: "2024-02-12", semester: "S3", kelas: "XI MIPA 2", tipeKatatan: "Positif", catatan: "Aktif mengembangkan proyek coding di luar jam sekolah dan berbagi hasil dengan teman.", nilaiBobotKuantitatif: 90 },
    ],
    nilaiTkaWajib: { matematika: 96, literasiBahasaIndonesia: 90, literasiBahasaInggris: 94, bahasaPadasi: 85, tanggalUjian: "2024-10-15" },
    nilaiTkaPilihan: [
      { mataUji: "Fisika", nilai: 93, tanggalUjian: "2024-10-15" },
    ],
    kecerdasanMajemuk: { tipeMusik: "Rendah", diriKebahasaan: 80, kinestetik: 68, spasialVisual: 92, interpersonal: 75, intrapersonal: 85, naturalis: 70, logisMatematis: 96 },
  },

  "3": {
    siswaId: "3",
    nilaiRapor: [
      { mataPelajaran: "Geografi", jurusan: "IPS", semester: { s1: 94, s2: 95, s3: 95, s4: 96, s5: 95 } },
      { mataPelajaran: "Ekonomi", jurusan: "IPS", semester: { s1: 92, s2: 93, s3: 94, s4: 93, s5: 95 } },
      { mataPelajaran: "Sosiologi", jurusan: "IPS", semester: { s1: 96, s2: 95, s3: 96, s4: 97, s5: 96 } },
      { mataPelajaran: "Sejarah", jurusan: "IPS", semester: { s1: 91, s2: 92, s3: 93, s4: 93, s5: 94 } },
      { mataPelajaran: "Bahasa Indonesia", jurusan: "IPS", semester: { s1: 93, s2: 94, s3: 95, s4: 95, s5: 96 } },
      { mataPelajaran: "Bahasa Inggris", jurusan: "IPS", semester: { s1: 95, s2: 96, s3: 96, s4: 97, s5: 97 } },
      { mataPelajaran: "Pendidikan Agama", jurusan: "IPS", semester: { s1: 92, s2: 93, s3: 93, s4: 94, s5: 93 } },
      { mataPelajaran: "PPKn", jurusan: "IPS", semester: { s1: 91, s2: 92, s3: 92, s4: 93, s5: 93 } },
    ],
    prestasi: [
      { id: "p1", kategori: "Akademik", jenis: "Olimpiade", tingkat: "Nasional", namaPrestasi: "OISMIPA - Ekonomi", tahun: "2024", status: "Juara 3" },
      { id: "p2", kategori: "Non-Akademik", jenis: "Debat", tingkat: "Provinsi", namaPrestasi: "Debat Bahasa Inggris Jawa Timur", tahun: "2024", status: "Juara 1" },
    ],
    kehadiran: {
      s1: { izin: 0, sakit: 1, alfa: 0 },
      s2: { izin: 1, sakit: 0, alfa: 0 },
      s3: { izin: 0, sakit: 2, alfa: 0 },
      s4: { izin: 2, sakit: 1, alfa: 0 },
      s5: { izin: 1, sakit: 1, alfa: 0 },
    },
    riasec: { R: 45, I: 70, A: 80, S: 88, E: 85, C: 65 },
    catatanKarakter: [
      { id: "c1", tanggal: "2023-07-20", semester: "S1", kelas: "X IPS 1", tipeKatatan: "Positif", catatan: "Menunjukkan kemampuan komunikasi dan kepemimpinan yang sangat menonjol.", nilaiBobotKuantitatif: 93 },
    ],
    nilaiTkaWajib: { matematika: 88, literasiBahasaIndonesia: 95, literasiBahasaInggris: 97, bahasaPadasi: 90, tanggalUjian: "2024-10-15" },
    nilaiTkaPilihan: [
      { mataUji: "Ekonomi", nilai: 94, tanggalUjian: "2024-10-15" },
      { mataUji: "Sosiologi", nilai: 96, tanggalUjian: "2024-10-15" },
    ],
    kecerdasanMajemuk: { tipeMusik: "Tinggi", diriKebahasaan: 95, kinestetik: 75, spasialVisual: 78, interpersonal: 96, intrapersonal: 88, naturalis: 72, logisMatematis: 80 },
  },

  "4": {
    siswaId: "4",
    nilaiRapor: [
      { mataPelajaran: "Matematika Peminatan", jurusan: "MIPA", semester: { s1: 90, s2: 91, s3: 93, s4: 94, s5: 95 } },
      { mataPelajaran: "Fisika", jurusan: "MIPA", semester: { s1: 92, s2: 93, s3: 93, s4: 94, s5: 94 } },
      { mataPelajaran: "Kimia", jurusan: "MIPA", semester: { s1: 88, s2: 90, s3: 91, s4: 92, s5: 93 } },
      { mataPelajaran: "Biologi", jurusan: "MIPA", semester: { s1: 86, s2: 88, s3: 90, s4: 91, s5: 92 } },
      { mataPelajaran: "Bahasa Indonesia", jurusan: "MIPA", semester: { s1: 91, s2: 92, s3: 93, s4: 93, s5: 94 } },
      { mataPelajaran: "Bahasa Inggris", jurusan: "MIPA", semester: { s1: 93, s2: 94, s3: 95, s4: 95, s5: 96 } },
      { mataPelajaran: "Pendidikan Agama", jurusan: "MIPA", semester: { s1: 90, s2: 91, s3: 92, s4: 92, s5: 93 } },
      { mataPelajaran: "PPKn", jurusan: "MIPA", semester: { s1: 89, s2: 90, s3: 91, s4: 91, s5: 92 } },
    ],
    prestasi: [
      { id: "p1", kategori: "Akademik", jenis: "Kompetisi", tingkat: "Kota/Kabupaten", namaPrestasi: "Lomba Robotika Kota Malang", tahun: "2024", status: "Juara 2" },
    ],
    kehadiran: {
      s1: { izin: 3, sakit: 2, alfa: 1 },
      s2: { izin: 2, sakit: 3, alfa: 0 },
      s3: { izin: 1, sakit: 2, alfa: 0 },
      s4: { izin: 2, sakit: 1, alfa: 1 },
      s5: { izin: 1, sakit: 2, alfa: 0 },
    },
    riasec: { R: 88, I: 82, A: 48, S: 55, E: 60, C: 70 },
    catatanKarakter: [
      { id: "c1", tanggal: "2024-03-15", semester: "S3", kelas: "XI MIPA 1", tipeKatatan: "Negatif", catatan: "Terlambat mengumpulkan beberapa tugas di awal semester ketiga.", nilaiBobotKuantitatif: 72 },
      { id: "c2", tanggal: "2024-09-01", semester: "S5", kelas: "XII MIPA 1", tipeKatatan: "Positif", catatan: "Ada peningkatan signifikan dalam kedisiplinan dan partisipasi kelas.", nilaiBobotKuantitatif: 85 },
    ],
    nilaiTkaWajib: { matematika: 92, literasiBahasaIndonesia: 88, literasiBahasaInggris: 91, bahasaPadasi: 84, tanggalUjian: "2024-10-15" },
    nilaiTkaPilihan: [
      { mataUji: "Fisika", nilai: 93, tanggalUjian: "2024-10-15" },
    ],
    kecerdasanMajemuk: { tipeMusik: "Rendah", diriKebahasaan: 75, kinestetik: 85, spasialVisual: 90, interpersonal: 68, intrapersonal: 80, naturalis: 78, logisMatematis: 92 },
  },

  "5": {
    siswaId: "5",
    nilaiRapor: [
      { mataPelajaran: "Geografi", jurusan: "IPS", semester: { s1: 88, s2: 89, s3: 90, s4: 91, s5: 92 } },
      { mataPelajaran: "Ekonomi", jurusan: "IPS", semester: { s1: 90, s2: 91, s3: 92, s4: 92, s5: 93 } },
      { mataPelajaran: "Sosiologi", jurusan: "IPS", semester: { s1: 92, s2: 93, s3: 94, s4: 93, s5: 94 } },
      { mataPelajaran: "Sejarah", jurusan: "IPS", semester: { s1: 89, s2: 90, s3: 91, s4: 91, s5: 92 } },
      { mataPelajaran: "Bahasa Indonesia", jurusan: "IPS", semester: { s1: 91, s2: 92, s3: 92, s4: 93, s5: 93 } },
      { mataPelajaran: "Bahasa Inggris", jurusan: "IPS", semester: { s1: 93, s2: 94, s3: 95, s4: 95, s5: 96 } },
      { mataPelajaran: "Pendidikan Agama", jurusan: "IPS", semester: { s1: 90, s2: 91, s3: 92, s4: 92, s5: 93 } },
      { mataPelajaran: "PPKn", jurusan: "IPS", semester: { s1: 89, s2: 90, s3: 90, s4: 91, s5: 91 } },
    ],
    prestasi: [
      { id: "p1", kategori: "Seni & Budaya", jenis: "Desain", tingkat: "Provinsi", namaPrestasi: "Lomba Desain Grafis Jawa Timur", tahun: "2024", status: "Juara 2" },
      { id: "p2", kategori: "Seni & Budaya", jenis: "Ilustrasi", tingkat: "Nasional", namaPrestasi: "Kompetisi Ilustrasi Digital Kemendikbud", tahun: "2023", status: "Finalis" },
    ],
    kehadiran: {
      s1: { izin: 1, sakit: 1, alfa: 0 },
      s2: { izin: 0, sakit: 2, alfa: 0 },
      s3: { izin: 2, sakit: 1, alfa: 0 },
      s4: { izin: 1, sakit: 0, alfa: 0 },
      s5: { izin: 0, sakit: 1, alfa: 0 },
    },
    riasec: { R: 55, I: 65, A: 95, S: 80, E: 75, C: 60 },
    catatanKarakter: [
      { id: "c1", tanggal: "2023-09-05", semester: "S1", kelas: "X IPS 2", tipeKatatan: "Positif", catatan: "Memiliki kreativitas tinggi dan aktif dalam kegiatan ekstrakurikuler seni.", nilaiBobotKuantitatif: 91 },
    ],
    nilaiTkaWajib: { matematika: 85, literasiBahasaIndonesia: 93, literasiBahasaInggris: 94, bahasaPadasi: 88, tanggalUjian: "2024-10-15" },
    nilaiTkaPilihan: [
      { mataUji: "Sosiologi", nilai: 92, tanggalUjian: "2024-10-15" },
    ],
    kecerdasanMajemuk: { tipeMusik: "Tinggi", diriKebahasaan: 90, kinestetik: 78, spasialVisual: 96, interpersonal: 85, intrapersonal: 88, naturalis: 80, logisMatematis: 72 },
  },

  "6": {
    siswaId: "6",
    nilaiRapor: [
      { mataPelajaran: "Matematika Peminatan", jurusan: "MIPA", semester: { s1: 88, s2: 89, s3: 90, s4: 91, s5: null } },
      { mataPelajaran: "Fisika", jurusan: "MIPA", semester: { s1: 86, s2: 87, s3: 88, s4: 89, s5: null } },
      { mataPelajaran: "Kimia", jurusan: "MIPA", semester: { s1: 87, s2: 88, s3: 89, s4: 90, s5: null } },
      { mataPelajaran: "Biologi", jurusan: "MIPA", semester: { s1: 85, s2: 87, s3: 88, s4: 89, s5: null } },
      { mataPelajaran: "Bahasa Indonesia", jurusan: "MIPA", semester: { s1: 89, s2: 90, s3: 91, s4: 91, s5: null } },
      { mataPelajaran: "Bahasa Inggris", jurusan: "MIPA", semester: { s1: 90, s2: 91, s3: 92, s4: 93, s5: null } },
      { mataPelajaran: "Pendidikan Agama", jurusan: "MIPA", semester: { s1: 88, s2: 89, s3: 89, s4: 90, s5: null } },
      { mataPelajaran: "PPKn", jurusan: "MIPA", semester: { s1: 87, s2: 88, s3: 88, s4: 89, s5: null } },
    ],
    prestasi: [
      { id: "p1", kategori: "Akademik", jenis: "Olimpiade", tingkat: "Kota/Kabupaten", namaPrestasi: "Olimpiade Statistika Kota Malang", tahun: "2024", status: "Juara 1" },
    ],
    kehadiran: {
      s1: { izin: 2, sakit: 3, alfa: 0 },
      s2: { izin: 3, sakit: 2, alfa: 1 },
      s3: { izin: 1, sakit: 4, alfa: 0 },
      s4: { izin: 2, sakit: 3, alfa: 0 },
      s5: { izin: 0, sakit: 0, alfa: 0 },
    },
    riasec: { R: 70, I: 85, A: 55, S: 65, E: 68, C: 80 },
    catatanKarakter: [
      { id: "c1", tanggal: "2024-01-15", semester: "S3", kelas: "XI MIPA 3", tipeKatatan: "Positif", catatan: "Menunjukkan kemampuan analitik yang kuat dalam pemecahan soal statistika.", nilaiBobotKuantitatif: 89 },
      { id: "c2", tanggal: "2024-04-20", semester: "S3", kelas: "XI MIPA 3", tipeKatatan: "Negatif", catatan: "Sering tidak hadir karena sakit; perlu pemantauan lebih lanjut.", nilaiBobotKuantitatif: 70 },
    ],
    nilaiTkaWajib: { matematika: 90, literasiBahasaIndonesia: 88, literasiBahasaInggris: 89, bahasaPadasi: 83, tanggalUjian: "2024-10-15" },
    nilaiTkaPilihan: [
      { mataUji: "Fisika", nilai: 88, tanggalUjian: "2024-10-15" },
    ],
    kecerdasanMajemuk: { tipeMusik: "Sedang", diriKebahasaan: 82, kinestetik: 70, spasialVisual: 85, interpersonal: 72, intrapersonal: 82, naturalis: 75, logisMatematis: 90 },
  },

  "7": {
    siswaId: "7",
    nilaiRapor: [
      { mataPelajaran: "Geografi", jurusan: "IPS", semester: { s1: 89, s2: 90, s3: 91, s4: 91, s5: 92 } },
      { mataPelajaran: "Ekonomi", jurusan: "IPS", semester: { s1: 88, s2: 89, s3: 89, s4: 90, s5: 91 } },
      { mataPelajaran: "Sosiologi", jurusan: "IPS", semester: { s1: 91, s2: 92, s3: 93, s4: 92, s5: 93 } },
      { mataPelajaran: "Sejarah", jurusan: "IPS", semester: { s1: 90, s2: 91, s3: 92, s4: 92, s5: 93 } },
      { mataPelajaran: "Bahasa Indonesia", jurusan: "IPS", semester: { s1: 92, s2: 93, s3: 94, s4: 94, s5: 95 } },
      { mataPelajaran: "Bahasa Inggris", jurusan: "IPS", semester: { s1: 91, s2: 92, s3: 93, s4: 93, s5: 94 } },
      { mataPelajaran: "Pendidikan Agama", jurusan: "IPS", semester: { s1: 90, s2: 91, s3: 92, s4: 92, s5: 92 } },
      { mataPelajaran: "PPKn", jurusan: "IPS", semester: { s1: 89, s2: 90, s3: 91, s4: 91, s5: 92 } },
    ],
    prestasi: [
      { id: "p1", kategori: "Olahraga", jenis: "Bulu Tangkis", tingkat: "Provinsi", namaPrestasi: "Kejuaraan Bulu Tangkis Pelajar Jawa Timur", tahun: "2024", status: "Juara 2" },
    ],
    kehadiran: {
      s1: { izin: 1, sakit: 2, alfa: 0 },
      s2: { izin: 2, sakit: 1, alfa: 0 },
      s3: { izin: 1, sakit: 1, alfa: 0 },
      s4: { izin: 0, sakit: 2, alfa: 0 },
      s5: { izin: 1, sakit: 1, alfa: 0 },
    },
    riasec: { R: 60, I: 68, A: 72, S: 90, E: 82, C: 65 },
    catatanKarakter: [
      { id: "c1", tanggal: "2023-08-20", semester: "S1", kelas: "X IPS 3", tipeKatatan: "Positif", catatan: "Sangat aktif dalam kegiatan sosial dan memiliki empati tinggi terhadap teman.", nilaiBobotKuantitatif: 90 },
    ],
    nilaiTkaWajib: { matematika: 84, literasiBahasaIndonesia: 92, literasiBahasaInggris: 91, bahasaPadasi: 87, tanggalUjian: "2024-10-15" },
    nilaiTkaPilihan: [
      { mataUji: "Sosiologi", nilai: 92, tanggalUjian: "2024-10-15" },
    ],
    kecerdasanMajemuk: { tipeMusik: "Sedang", diriKebahasaan: 88, kinestetik: 90, spasialVisual: 75, interpersonal: 95, intrapersonal: 85, naturalis: 82, logisMatematis: 75 },
  },

  "8": {
    siswaId: "8",
    nilaiRapor: [
      { mataPelajaran: "Matematika Peminatan", jurusan: "MIPA", semester: { s1: 86, s2: 87, s3: 88, s4: 89, s5: 90 } },
      { mataPelajaran: "Fisika", jurusan: "MIPA", semester: { s1: 88, s2: 89, s3: 90, s4: 91, s5: 91 } },
      { mataPelajaran: "Kimia", jurusan: "MIPA", semester: { s1: 84, s2: 85, s3: 86, s4: 87, s5: 88 } },
      { mataPelajaran: "Biologi", jurusan: "MIPA", semester: { s1: 83, s2: 84, s3: 85, s4: 86, s5: 87 } },
      { mataPelajaran: "Bahasa Indonesia", jurusan: "MIPA", semester: { s1: 88, s2: 89, s3: 89, s4: 90, s5: 91 } },
      { mataPelajaran: "Bahasa Inggris", jurusan: "MIPA", semester: { s1: 87, s2: 88, s3: 89, s4: 90, s5: 90 } },
      { mataPelajaran: "Pendidikan Agama", jurusan: "MIPA", semester: { s1: 86, s2: 87, s3: 88, s4: 88, s5: 89 } },
      { mataPelajaran: "PPKn", jurusan: "MIPA", semester: { s1: 85, s2: 86, s3: 86, s4: 87, s5: 88 } },
    ],
    prestasi: [
      { id: "p1", kategori: "Olahraga", jenis: "Basket", tingkat: "Kota/Kabupaten", namaPrestasi: "Basket Pelajar Kota Malang", tahun: "2024", status: "Juara 3" },
    ],
    kehadiran: {
      s1: { izin: 3, sakit: 2, alfa: 1 },
      s2: { izin: 2, sakit: 3, alfa: 0 },
      s3: { izin: 2, sakit: 2, alfa: 1 },
      s4: { izin: 3, sakit: 1, alfa: 0 },
      s5: { izin: 1, sakit: 2, alfa: 0 },
    },
    riasec: { R: 85, I: 72, A: 60, S: 70, E: 78, C: 75 },
    catatanKarakter: [
      { id: "c1", tanggal: "2024-02-25", semester: "S3", kelas: "XI MIPA 4", tipeKatatan: "Positif", catatan: "Menunjukkan jiwa kepemimpinan yang kuat saat memimpin tim basket sekolah.", nilaiBobotKuantitatif: 87 },
    ],
    nilaiTkaWajib: { matematika: 88, literasiBahasaIndonesia: 86, literasiBahasaInggris: 87, bahasaPadasi: 82, tanggalUjian: "2024-10-15" },
    nilaiTkaPilihan: [
      { mataUji: "Fisika", nilai: 89, tanggalUjian: "2024-10-15" },
    ],
    kecerdasanMajemuk: { tipeMusik: "Sedang", diriKebahasaan: 78, kinestetik: 92, spasialVisual: 82, interpersonal: 85, intrapersonal: 78, naturalis: 75, logisMatematis: 85 },
  },
};

