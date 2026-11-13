import { StudentB1WaliKelas } from "./types";

export const initialWaliKelasStudents: StudentB1WaliKelas[] = [
  {
    id: "std-1",
    no: "01",
    nisn: "0012345678",
    nama: "Amalia Mayasari",
    initial: "AM",
    kelas: "X-3",
    semester: "Semester 3",
    kelengkapanProfil: 100,
    mapelPilihanCount: "4/4 Mapel",
    rataRata: 85.25,
    statusRapor: "Antrean Cek",
    hasDiscrepancy: true,
    mapelDiscrepancy: {
      namaMapel: "KIMIA",
      inputMandiri: 86.0,
      bukuRapor: 90.0,
      selisih: -4.0,
      tanggalInput: "08/06/2024",
    },
    profilDetail: {
      mapelPilihan: [
        "Matematika Tingkat Lanjut",
        "Informatika Terapan",
        "Kimia Terapan",
        "Fisika Lanjut",
      ],
      riasec: {
        kode: "Investigative - Realistic",
        label: "Investigatif - Realistis",
        deskripsi:
          "Memiliki minat riset mendalam, kemampuan analisis komputasi kuantitatif, dan eksplorasi laboratorium sains.",
      },
      kecerdasanMajemuk: {
        tipe: "Logis-Matematis, Spasial",
        deskripsi:
          "Unggul dalam penalaran algoritmik sistematis, pengenalan pola grafis, dan pemodelan sains kompleks.",
      },
      prestasi: [
        {
          id: "p-1",
          judul: "Juara 2 OSN Informatika Kota Malang 2024",
          penyelenggara: "Pusat Prestasi Nasional (Puspresnas) - Kemendikbudristek",
          tahun: "2024",
          tingkat: "Kota / Kabupaten",
        },
        {
          id: "p-2",
          judul: "Medali Perak Lomba Karya Ilmiah Remaja (LKIR) 2023",
          penyelenggara: "Tingkat Provinsi Jawa Timur • Divisi Rekayasa Teknologi",
          tahun: "2023",
          tingkat: "Provinsi",
        },
      ],
    },
  },
  {
    id: "std-2",
    no: "02",
    nisn: "0012345678",
    nama: "Rusyda Octa A",
    initial: "RO",
    kelas: "X-3",
    semester: "Semester 3",
    kelengkapanProfil: 100,
    mapelPilihanCount: "4/4 Mapel",
    rataRata: 88.10,
    statusRapor: "Tervalidasi Rapor Fisik",
    hasDiscrepancy: false,
    profilDetail: {
      mapelPilihan: [
        "Matematika Tingkat Lanjut",
        "Biologi",
        "Kimia Terapan",
        "Bahasa Inggris Tingkat Lanjut",
      ],
      riasec: {
        kode: "Investigative - Social",
        label: "Investigatif - Sosial",
        deskripsi: "Minat kuat pada sains biomedis dan pengabdian kesehatan masyarakat.",
      },
      kecerdasanMajemuk: {
        tipe: "Naturalis, Interpersonal",
        deskripsi: "Peka terhadap analisis biologis organisme hidup dan empati komunikasi.",
      },
      prestasi: [
        {
          id: "p-3",
          judul: "Finalis Olimpiade Biologi Nasional 2024",
          penyelenggara: "Universitas Airlangga",
          tahun: "2024",
          tingkat: "Nasional",
        },
      ],
    },
  },
  {
    id: "std-3",
    no: "03",
    nisn: "0012345678",
    nama: "Amalia Rizqi",
    initial: "AR",
    kelas: "X-3",
    semester: "Semester 3",
    kelengkapanProfil: 100,
    mapelPilihanCount: "4/4 Mapel",
    rataRata: 91.40,
    statusRapor: "Tervalidasi Rapor Fisik",
    hasDiscrepancy: false,
    profilDetail: {
      mapelPilihan: [
        "Ekonomi Terapan",
        "Sosiologi Lanjut",
        "Matematika Tingkat Lanjut",
        "Geografi Terapan",
      ],
      riasec: {
        kode: "Enterprising - Conventional",
        label: "Enterprising - Konvensional",
        deskripsi: "Minat tinggi pada ekosistem keuangan, analisis pasar, dan tata kelola bisnis.",
      },
      kecerdasanMajemuk: {
        tipe: "Logis-Matematis, Linguistik",
        deskripsi: "Kuat dalam negosiasi, analisis data finansial, dan presentasi bisnis.",
      },
      prestasi: [
        {
          id: "p-4",
          judul: "Juara 1 Business Plan Competition Pelajar 2024",
          penyelenggara: "Fakultas Ekonomi Bisnis UB",
          tahun: "2024",
          tingkat: "Jawa Timur",
        },
      ],
    },
  },
  {
    id: "std-4",
    no: "04",
    nisn: "0012345678",
    nama: "Naysilla Salsa",
    initial: "NS",
    kelas: "X-3",
    semester: "Semester 3",
    kelengkapanProfil: 100,
    mapelPilihanCount: "4/4 Mapel",
    rataRata: 89.00,
    statusRapor: "Tervalidasi Rapor Fisik",
    hasDiscrepancy: false,
    profilDetail: {
      mapelPilihan: [
        "Fisika Lanjut",
        "Matematika Tingkat Lanjut",
        "Informatika Terapan",
        "Bahasa Jepang",
      ],
      riasec: {
        kode: "Realistic - Investigative",
        label: "Realistis - Investigatif",
        deskripsi: "Fokus ke rekayasa manufaktur, robotika, dan komputasi presisi tinggi.",
      },
      kecerdasanMajemuk: {
        tipe: "Spasial-Visual, Kinestetik",
        deskripsi: "Pemahaman visual 3D luar biasa dan ketelitian rancang bangun prototipe.",
      },
      prestasi: [
        {
          id: "p-5",
          judul: "Best Technical Design Robot Line Follower 2024",
          penyelenggara: "Politeknik Negeri Malang",
          tahun: "2024",
          tingkat: "Regional",
        },
      ],
    },
  },
  {
    id: "std-5",
    no: "05",
    nisn: "0012345678",
    nama: "Salma Ananda",
    initial: "SA",
    kelas: "X-3",
    semester: "Semester 3",
    kelengkapanProfil: 100,
    mapelPilihanCount: "4/4 Mapel",
    rataRata: 83.50,
    statusRapor: "Antrean Cek",
    hasDiscrepancy: true,
    mapelDiscrepancy: {
      namaMapel: "FISIKA",
      inputMandiri: 82.0,
      bukuRapor: 85.0,
      selisih: -3.0,
      tanggalInput: "09/06/2024",
    },
    profilDetail: {
      mapelPilihan: [
        "Biologi",
        "Kimia Terapan",
        "Sosiologi Lanjut",
        "Informatika Terapan",
      ],
      riasec: {
        kode: "Social - Investigative",
        label: "Sosial - Investigatif",
        deskripsi: "Ketertarikan pada ilmu lingkungan, ketahanan pangan, dan sains agrikultur terapan.",
      },
      kecerdasanMajemuk: {
        tipe: "Naturalis, Eksistensial",
        deskripsi: "Kemampuan analisis keanekaragaman hayati dan kepedulian ekologis.",
      },
      prestasi: [
        {
          id: "p-6",
          judul: "Juara Harapan 1 Lomba Esai Konservasi Alam 2024",
          penyelenggara: "DLH Kota Malang",
          tahun: "2024",
          tingkat: "Kota / Kabupaten",
        },
      ],
    },
  },
];

