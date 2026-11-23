export interface ImportCategoryConfig {
  key: string;
  title: string;
  filename: string;
  requiredHeaders: string[];
  optionalHeaders: string[];
  headerGuide: {
    wajib: string[];
    opsional?: string[];
    keterangan?: string;
  };
  templateContent: string;
}

export const IMPORT_CONFIGS: Record<string, ImportCategoryConfig> = {
  "Nilai Rapor Akademik": {
    key: "Nilai Rapor Akademik",
    title: "Nilai Rapor Akademik",
    filename: "template_nilai_rapor.csv",
    requiredHeaders: ["mata_pelajaran", "semester_1", "semester_2", "semester_3", "semester_4", "semester_5"],
    optionalHeaders: ["jurusan"],
    headerGuide: {
      wajib: ["mata_pelajaran", "semester_1", "semester_2", "semester_3", "semester_4", "semester_5"],
      opsional: ["jurusan"],
      keterangan: "Nilai dalam skala 0–100 per semester",
    },
    templateContent:
      "mata_pelajaran,jurusan,semester_1,semester_2,semester_3,semester_4,semester_5\n" +
      "Matematika,MIPA,88,90,92,91,93\n" +
      "Bahasa Indonesia,MIPA,86,88,89.5,90,92\n" +
      "Bahasa Inggris,MIPA,87,87,88.5,89,90\n" +
      "Fisika,MIPA,85,87,89,90,91\n" +
      "Kimia,MIPA,84,86,88,89,90\n" +
      "Biologi,MIPA,89,88,90,92,94",
  },
  "Prestasi & Kompetisi": {
    key: "Prestasi & Kompetisi",
    title: "Prestasi & Kompetisi",
    filename: "template_prestasi_kompetisi.csv",
    requiredHeaders: ["jenis_prestasi", "nama_kompetisi", "tingkat", "tahun", "peringkat"],
    optionalHeaders: ["bidang", "penyelenggara", "dokumen"],
    headerGuide: {
      wajib: ["jenis_prestasi", "nama_kompetisi", "tingkat", "tahun", "peringkat"],
      opsional: ["bidang", "penyelenggara", "dokumen"],
      keterangan: "Jenis: Akademik/Non-Akademik; Tingkat: Kota/Provinsi/Nasional/Internasional",
    },
    templateContent:
      "jenis_prestasi,nama_kompetisi,bidang,tingkat,penyelenggara,tahun,peringkat,dokumen\n" +
      "Akademik,Olimpiade Sains Nasional,Sains,Nasional,Puspresnas Kemdikbud,2024,Juara 1,Sertifikat_OSN.pdf\n" +
      "Non-Akademik,Festival Lomba Seni Siswa,Seni Musik,Provinsi,Dinas Pendidikan Jatim,2023,Juara 2,Piagam_FLS2N.pdf",
  },
  "Profil Asesmen RIASEC": {
    key: "Profil Asesmen RIASEC",
    title: "Profil Asesmen RIASEC",
    filename: "template_asesmen_riasec.csv",
    requiredHeaders: ["kode_tes", "realistic", "investigative", "artistic", "social", "enterprising", "conventional"],
    optionalHeaders: ["tanggal_asesmen"],
    headerGuide: {
      wajib: ["kode_tes", "realistic", "investigative", "artistic", "social", "enterprising", "conventional"],
      opsional: ["tanggal_asesmen"],
      keterangan: "Skor tipe kepribadian RIASEC (0–100)",
    },
    templateContent:
      "kode_tes,tanggal_asesmen,realistic,investigative,artistic,social,enterprising,conventional\n" +
      "gc333,20/09/2024,77,89,75,80,74,64",
  },
  "Catatan Karakteristik Siswa": {
    key: "Catatan Karakteristik Siswa",
    title: "Catatan Karakteristik Siswa",
    filename: "template_catatan_karakteristik.csv",
    requiredHeaders: ["tanggal", "semester", "kelas", "tipe_catatan", "deskripsi_catatan", "bobot_kuantitatif"],
    optionalHeaders: [],
    headerGuide: {
      wajib: ["tanggal", "semester", "kelas", "tipe_catatan", "deskripsi_catatan", "bobot_kuantitatif"],
      keterangan: "Semester (S1–S5), Tipe (Kedisiplinan, Kerjasama, dll), Bobot (0–100)",
    },
    templateContent:
      "tanggal,semester,kelas,tipe_catatan,deskripsi_catatan,bobot_kuantitatif\n" +
      "12/01/2024,S1,XII MIPA 1,Kedisiplinan,Selalu hadir tepat waktu dan aktif dalam kegiatan belajar,92\n" +
      "15/04/2024,S2,XII MIPA 1,Kerjasama,Mampu memimpin kelompok praktikum dengan sangat kolaboratif,90\n" +
      "20/09/2024,S3,XII MIPA 1,Kepemimpinan,Menjadi koordinator projek P5 dengan inisiatif tinggi,95",
  },
  "Nilai TKA Mata Uji Wajib": {
    key: "Nilai TKA Mata Uji Wajib",
    title: "Nilai TKA Mata Uji Wajib",
    filename: "template_tka_wajib.csv",
    requiredHeaders: ["mata_uji", "nilai"],
    optionalHeaders: [],
    headerGuide: {
      wajib: ["mata_uji", "nilai"],
      keterangan: "Mata Uji: Matematika, Bahasa Indonesia, Bahasa Padasi / Inggris",
    },
    templateContent:
      "mata_uji,nilai\n" +
      "Matematika,92\n" +
      "Bahasa Indonesia,90\n" +
      "Bahasa Padasi / Inggris,88",
  },
  "Nilai TKA Mata Uji Pilihan": {
    key: "Nilai TKA Mata Uji Pilihan",
    title: "Nilai TKA Mata Uji Pilihan",
    filename: "template_tka_pilihan.csv",
    requiredHeaders: ["mata_uji", "nilai"],
    optionalHeaders: ["tanggal_ujian"],
    headerGuide: {
      wajib: ["mata_uji", "nilai"],
      opsional: ["tanggal_ujian"],
      keterangan: "Mata uji peminatan (Kimia, Biologi, Fisika, Informatika, dll)",
    },
    templateContent:
      "mata_uji,nilai,tanggal_ujian\n" +
      "Kimia,90,2024-10-15\n" +
      "Biologi,92,2024-10-15\n" +
      "Fisika,89,2024-10-16\n" +
      "Informatika,93,2024-10-16",
  },
  "Kecerdasan Majemuk Siswa": {
    key: "Kecerdasan Majemuk Siswa",
    title: "Kecerdasan Majemuk Siswa",
    filename: "template_kecerdasan_majemuk.csv",
    requiredHeaders: [
      "linguistik",
      "logis_matematis",
      "spasial_visual",
      "kinestetik",
      "musikal",
      "interpersonal",
      "intrapersonal",
      "naturalis",
    ],
    optionalHeaders: ["tanggal_asesmen"],
    headerGuide: {
      wajib: [
        "linguistik",
        "logis_matematis",
        "spasial_visual",
        "kinestetik",
        "musikal",
        "interpersonal",
        "intrapersonal",
        "naturalis",
      ],
      opsional: ["tanggal_asesmen"],
      keterangan: "Skor tiap dimensi Multiple Intelligence (0–100)",
    },
    templateContent:
      "linguistik,logis_matematis,spasial_visual,kinestetik,musikal,interpersonal,intrapersonal,naturalis,tanggal_asesmen\n" +
      "85,94,88,78,70,85,80,78,14/09/2024",
  },
};

export function getImportConfig(category: string): ImportCategoryConfig {
  if (IMPORT_CONFIGS[category]) return IMPORT_CONFIGS[category];

  // Fallback matching
  const lower = category.toLowerCase();
  if (lower.includes("rapor")) return IMPORT_CONFIGS["Nilai Rapor Akademik"];
  if (lower.includes("prestasi")) return IMPORT_CONFIGS["Prestasi & Kompetisi"];
  if (lower.includes("riasec")) return IMPORT_CONFIGS["Profil Asesmen RIASEC"];
  if (lower.includes("catatan") || lower.includes("karakter")) return IMPORT_CONFIGS["Catatan Karakteristik Siswa"];
  if (lower.includes("wajib")) return IMPORT_CONFIGS["Nilai TKA Mata Uji Wajib"];
  if (lower.includes("pilihan")) return IMPORT_CONFIGS["Nilai TKA Mata Uji Pilihan"];
  if (lower.includes("kecerdasan") || lower.includes("majemuk")) return IMPORT_CONFIGS["Kecerdasan Majemuk Siswa"];

  return IMPORT_CONFIGS["Nilai Rapor Akademik"];
}

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s\-_]/g, "");
}

// Map alias names to standard header names
const HEADER_ALIASES: Record<string, string> = {
  // Rapor
  matapelajaran: "mata_pelajaran",
  mapel: "mata_pelajaran",
  namamapel: "mata_pelajaran",
  jurusan: "jurusan",
  semester1: "semester_1",
  sem1: "semester_1",
  s1: "semester_1",
  semester2: "semester_2",
  sem2: "semester_2",
  s2: "semester_2",
  semester3: "semester_3",
  sem3: "semester_3",
  s3: "semester_3",
  semester4: "semester_4",
  sem4: "semester_4",
  s4: "semester_4",
  semester5: "semester_5",
  sem5: "semester_5",
  s5: "semester_5",

  // Prestasi
  jenisprestasi: "jenis_prestasi",
  jenis: "jenis_prestasi",
  namakompetisi: "nama_kompetisi",
  namalomba: "nama_kompetisi",
  lomba: "nama_kompetisi",
  bidang: "bidang",
  tingkat: "tingkat",
  penyelenggara: "penyelenggara",
  tahun: "tahun",
  peringkat: "peringkat",
  dokumen: "dokumen",
  bukti: "dokumen",

  // RIASEC
  kodetes: "kode_tes",
  kode: "kode_tes",
  tanggalasesmen: "tanggal_asesmen",
  tglasesmen: "tanggal_asesmen",
  realistic: "realistic",
  r: "realistic",
  investigative: "investigative",
  i: "investigative",
  artistic: "artistic",
  a: "artistic",
  social: "social",
  s: "social",
  enterprising: "enterprising",
  e: "enterprising",
  conventional: "conventional",
  c: "conventional",

  // Catatan Karakteristik
  tanggal: "tanggal",
  tgl: "tanggal",
  tanggalcatatan: "tanggal",
  semester: "semester",
  sem: "semester",
  kelas: "kelas",
  tipecatatan: "tipe_catatan",
  tipe: "tipe_catatan",
  deskripsicatatan: "deskripsi_catatan",
  catatan: "deskripsi_catatan",
  deskripsi: "deskripsi_catatan",
  bobotkuantitatif: "bobot_kuantitatif",
  bobot: "bobot_kuantitatif",
  nilaibobot: "bobot_kuantitatif",

  // TKA
  matauji: "mata_uji",
  nilai: "nilai",
  tanggalujian: "tanggal_ujian",

  // Kecerdasan Majemuk
  linguistik: "linguistik",
  kebahasaan: "linguistik",
  logismatematis: "logis_matematis",
  logika: "logis_matematis",
  spasialvisual: "spasial_visual",
  spasial: "spasial_visual",
  kinestetik: "kinestetik",
  musikal: "musikal",
  interpersonal: "interpersonal",
  intrapersonal: "intrapersonal",
  naturalis: "naturalis",
};

export function parseAndValidateCsv(
  text: string,
  config: ImportCategoryConfig
): {
  success: boolean;
  error?: string;
  rows?: Record<string, string>[];
  headers?: string[];
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      success: false,
      error: "Berkas CSV minimal harus memiliki 1 baris header dan 1 baris data.",
    };
  }

  // Detect delimiter: comma or semicolon
  const headerLine = lines[0];
  const delimiter = headerLine.includes(";") ? ";" : ",";

  // Parse raw headers
  const rawHeaders = headerLine.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const mappedHeaders = rawHeaders.map((h) => {
    const norm = normalizeHeader(h);
    return HEADER_ALIASES[norm] || norm;
  });

  // Check required headers
  const missingHeaders: string[] = [];
  for (const req of config.requiredHeaders) {
    if (!mappedHeaders.includes(req)) {
      missingHeaders.push(req);
    }
  }

  if (missingHeaders.length > 0) {
    return {
      success: false,
      error: `Header kolom tidak sesuai untuk kategori "${config.title}". Kolom wajib yang belum ditemukan: [${missingHeaders.join(", ")}]. Silakan gunakan format template CSV yang disediakan.`,
      headers: rawHeaders,
    };
  }

  // Parse data rows
  const parsedRows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rowValues = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const rowObj: Record<string, string> = {};

    mappedHeaders.forEach((header, index) => {
      rowObj[header] = rowValues[index] !== undefined ? rowValues[index] : "";
    });

    parsedRows.push(rowObj);
  }

  return {
    success: true,
    rows: parsedRows,
    headers: rawHeaders,
  };
}

export function downloadCategoryCsvTemplate(config: ImportCategoryConfig) {
  const blob = new Blob([config.templateContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = config.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
