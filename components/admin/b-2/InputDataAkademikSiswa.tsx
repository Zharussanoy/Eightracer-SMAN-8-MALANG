"use client";

import {
  AkademikDataItem,
  CatatanKarakter,
  DUMMY_AKADEMIK_DATA,
  NilaiRapor,
  NilaiTkaPilihan
} from "@/components/admin/b-2/dummyAkademikData";
import { DATA_MANAJEMEN_SISWA, SiswaDataItem } from "@/components/admin/b-2/mockDataAdminB2";
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  Plus,
  Search,
  Trash2,
  Upload
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  siswaId: string;
}

export default function InputDataAkademikSiswa({ siswaId }: Props) {
  const siswa: SiswaDataItem | undefined = DATA_MANAJEMEN_SISWA.find((s) => s.id === siswaId);
  const rawAkademik: AkademikDataItem | undefined = DUMMY_AKADEMIK_DATA[siswaId];

  const defaultSiswa: SiswaDataItem = siswa || {
    id: siswaId,
    initials: "TS",
    initialsBg: "#E0D7F5",
    nama: "Tegar Saputra",
    nisn: "005391101",
    kelas: "XII IPA 1",
    gender: "Laki-laki",
    statusKelengkapan: "Lengkap",
    kelengkapanDetail: "(100%)",
    rataRapor: 92.4,
    rekomendasiMinat: "Teknik Informatika",
  };

  const [nilaiRaporList, setNilaiRaporList] = useState<NilaiRapor[]>(
    rawAkademik?.nilaiRapor || [
      {
        mataPelajaran: "Matematika",
        jurusan: "MIPA",
        semester: { s1: 88, s2: 90, s3: 92, s4: null, s5: null },
      },
      {
        mataPelajaran: "Bahasa Indonesia",
        jurusan: "MIPA",
        semester: { s1: 86, s2: 88, s3: 89.5, s4: null, s5: null },
      },
      {
        mataPelajaran: "Bahasa Inggris",
        jurusan: "MIPA",
        semester: { s1: 87, s2: 87, s3: 88.5, s4: null, s5: null },
      },
      {
        mataPelajaran: "Biologi",
        jurusan: "MIPA",
        semester: { s1: 89, s2: 88, s3: 90, s4: null, s5: null },
      },
    ]
  );

  const [prestasiForm, setPrestasiForm] = useState({
    jenisPrestasi: "Akademik",
    namaLomba: "Juara 1 Olimpiade Sains",
    bidang: "Sains",
    tahun: "2023",
    periodePrestasi: "1 Kali",
    tingkat: "Kabupaten/Kota",
    penyelenggara: "Universitas Brawijaya",
    peringkat: "1",
    dokumen: "Sertifikat",
  });

  const [kehadiranForm, setKehadiranForm] = useState({
    semester1: "97%",
    semester2: "99%",
    sakit: "0%",
    izin: "0%",
    alfa: "1%",
  });

  const [riasecMeta, setRiasecMeta] = useState({
    kodeTes: "gc333",
    tanggalAsesmen: "20/09/2024",
  });

  const [riasecScores, setRiasecScores] = useState({
    R: rawAkademik?.riasec.R || 77,
    I: rawAkademik?.riasec.I || 89,
    A: rawAkademik?.riasec.A || 75,
    S: rawAkademik?.riasec.S || 80,
    E: rawAkademik?.riasec.E || 74,
    C: rawAkademik?.riasec.C || 64,
  });

  const [riwayatCatatan, setRiwayatCatatan] = useState<CatatanKarakter[]>(
    rawAkademik?.catatanKarakter && rawAkademik.catatanKarakter.length > 0
      ? rawAkademik.catatanKarakter
      : [
        {
          id: "1",
          tanggal: "12/01/2023",
          semester: "S1",
          kelas: "X MIPA 1",
          tipeKatatan: "Kedisiplinan",
          catatan: "Selalu hadir tepat waktu dan aktif dalam kegiatan belajar mengajar.",
          nilaiBobotKuantitatif: 90,
        },
        {
          id: "2",
          tanggal: "15/05/2023",
          semester: "S2",
          kelas: "X MIPA 1",
          tipeKatatan: "Kerjasama",
          catatan: "Mampu bekerjasama dengan baik saat penugasan kelompok praktikum.",
          nilaiBobotKuantitatif: 88,
        },
        {
          id: "3",
          tanggal: "20/11/2023",
          semester: "S3",
          kelas: "XI MIPA 1",
          tipeKatatan: "Kepemimpinan",
          catatan: "Memimpin diskusi presentasi dengan artikulasi yang sangat baik.",
          nilaiBobotKuantitatif: 92,
        },
      ]
  );

  const [searchCatatan, setSearchCatatan] = useState("");
  const [catatanBaru, setCatatanBaru] = useState({
    tanggal: "2024-03-10",
    semester: "S4",
    tipe: "Kedisiplinan",
    catatan: "",
    bobot: 85,
  });

  const [tkaWajib, setTkaWajib] = useState([
    { mapel: "Matematika", nilai: rawAkademik?.nilaiTkaWajib.matematika || 89 },
    { mapel: "Bahasa Indonesia", nilai: rawAkademik?.nilaiTkaWajib.literasiBahasaIndonesia || 90 },
    { mapel: "Bahasa Padasi / Inggris", nilai: rawAkademik?.nilaiTkaWajib.bahasaPadasi || 89 },
  ]);

  const [tkaPilihan, setTkaPilihan] = useState<NilaiTkaPilihan[]>(
    rawAkademik?.nilaiTkaPilihan && rawAkademik.nilaiTkaPilihan.length > 0
      ? rawAkademik.nilaiTkaPilihan
      : [
        { mataUji: "Kimia", nilai: 85, tanggalUjian: "2024-10-15" },
        { mataUji: "Biologi", nilai: 87, tanggalUjian: "2024-10-15" },
      ]
  );

  const [kecerdasanForm, setKecerdasanForm] = useState({
    klasifikasi: "Asesmen Minat & Bakat Terstandar",
    jenisKecerdasan: "Logis-Matematis & Spasial",
    linguistik: rawAkademik?.kecerdasanMajemuk.diriKebahasaan || 82,
    logisMatematis: rawAkademik?.kecerdasanMajemuk.logisMatematis || 94,
    spasialVisual: rawAkademik?.kecerdasanMajemuk.spasialVisual || 88,
    kinestetik: rawAkademik?.kecerdasanMajemuk.kinestetik || 75,
    musikal: 70,
    interpersonal: rawAkademik?.kecerdasanMajemuk.interpersonal || 85,
    intrapersonal: rawAkademik?.kecerdasanMajemuk.intrapersonal || 80,
    naturalis: rawAkademik?.kecerdasanMajemuk.naturalis || 78,
    skorAsesmen: "85.5",
    tanggalAsesmen: "14/09/2024",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSimpan = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    }, 600);
  };

  const handleAddMapelRapor = () => {
    const nama = prompt("Masukkan nama mata pelajaran baru:");
    if (nama && nama.trim()) {
      setNilaiRaporList([
        ...nilaiRaporList,
        {
          mataPelajaran: nama.trim(),
          jurusan: "MIPA",
          semester: { s1: 0, s2: 0, s3: 0, s4: null, s5: null },
        },
      ]);
    }
  };

  const handleTambahCatatan = () => {
    if (!catatanBaru.catatan.trim()) {
      alert("Harap isi deskripsi catatan!");
      return;
    }

    const baru: CatatanKarakter = {
      id: Date.now().toString(),
      tanggal: catatanBaru.tanggal,
      semester: catatanBaru.semester,
      kelas: defaultSiswa.kelas,
      tipeKatatan: catatanBaru.tipe,
      catatan: catatanBaru.catatan,
      nilaiBobotKuantitatif: Number(catatanBaru.bobot) || 80,
    };

    setRiwayatCatatan([baru, ...riwayatCatatan]);
    setCatatanBaru({
      ...catatanBaru,
      catatan: "",
    });
  };

  const handleAddTkaPilihan = () => {
    const mataUji = prompt("Nama Mata Uji Pilihan (misal: Fisika / Geografi):");
    if (mataUji && mataUji.trim()) {
      setTkaPilihan([
        ...tkaPilihan,
        {
          mataUji: mataUji.trim() as any,
          nilai: 85,
          tanggalUjian: "2024-10-15",
        },
      ]);
    }
  };

  const handleAddTkaWajib = () => {
    const mapel = prompt("Nama Mata Uji Wajib baru:");
    if (mapel && mapel.trim()) {
      setTkaWajib([...tkaWajib, { mapel: mapel.trim(), nilai: 80 }]);
    }
  };

  return (
    <div className="w-full bg-[#FAF7FC] min-h-screen text-[#1F2937] pb-16">
      <div className="bg-white border-b border-[#E9D5FF] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/b2"
              className="p-2 rounded-lg text-[#6941C6] hover:bg-[#F4EBFF] transition-colors"
              title="Kembali ke Manajemen Data"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[17px] font-bold text-[#3B0764] tracking-tight">
                Input Data Akademik Siswa
              </h1>
              <p className="text-[12px] text-[#6B7280]">
                Admin B2 · Kelola berkas komprehensif eligibilitas SNBP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> Data tersimpan!
              </span>
            )}
            <button
              type="button"
              onClick={handleSimpan}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#6305B0] hover:bg-[#530494] text-white text-[13px] font-medium shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isSaving ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2937]">
            Input Data Akademik Siswa
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            Kelola nilai rapor, prestasi, kehadiran, dan profil potensi siswa untuk mendukung skema riset program studi.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[#4B5563]">
            Nama Siswa
          </label>
          <div className="bg-white border border-[#E9D5FF] rounded-xl p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-[15px] shrink-0"
                style={{
                  backgroundColor: defaultSiswa.initialsBg || "#E0D7F5",
                  color: "#6305B0",
                }}
              >
                {defaultSiswa.initials}
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#1F2937] uppercase tracking-wide">
                  {defaultSiswa.nama}
                </p>
                <p className="text-[12px] text-[#6B7280] mt-0.5">
                  {defaultSiswa.kelas} | NISN {defaultSiswa.nisn} | {defaultSiswa.gender} (2024/2025)
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#F4EBFF] text-[#6941C6] border border-[#D6BBFB]">
                {defaultSiswa.statusKelengkapan} {defaultSiswa.kelengkapanDetail}
              </span>
              <p className="text-[12px] text-[#6B7280] mt-1 font-medium">
                Rata-rata: <span className="text-[#6305B0] font-bold">{defaultSiswa.rataRapor}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E9D5FF] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8FF] pb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">Nilai Rapor</h3>
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280] mt-1">
                <span>Masukkan nilai setiap mata pelajaran berdasarkan semester.</span>
                <span className="flex items-center gap-1.5 font-medium text-[#059669]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  Untuk Mata Pelajaran Wajib/Umum
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#D97706]">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                  Untuk Mata Pelajaran Pilihan
                </span>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6305B0] hover:bg-[#530494] text-white text-[12px] font-medium shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              Import (PDF/Excel)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#FAF7FC] text-[#6B7280] font-semibold text-[11px] uppercase tracking-wider border-b border-[#E9D5FF]">
                  <th className="py-2.5 px-3">Mata Pelajaran</th>
                  <th className="py-2.5 px-3 text-center">Klasifikasi</th>
                  <th className="py-2.5 px-3 text-center">Semester 1</th>
                  <th className="py-2.5 px-3 text-center">Semester 2</th>
                  <th className="py-2.5 px-3 text-center">Semester 3</th>
                  <th className="py-2.5 px-3 text-center">Semester 4</th>
                  <th className="py-2.5 px-3 text-center">Semester 5</th>
                  <th className="py-2.5 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E8FF]">
                {nilaiRaporList.map((item, idx) => {
                  const isPilihan = item.mataPelajaran.toLowerCase().includes("biologi") || item.mataPelajaran.toLowerCase().includes("kimia") || item.mataPelajaran.toLowerCase().includes("fisika");
                  return (
                    <tr key={idx} className="hover:bg-[#FCFAFF]">
                      <td className="py-2.5 px-3 font-medium text-[#1F2937] min-w-[170px]">
                        {item.mataPelajaran}
                      </td>
                      <td className="py-2.5 px-3 text-center min-w-[90px]">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${isPilihan
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                            }`}
                          title={isPilihan ? "Mata Pelajaran Pilihan" : "Mata Pelajaran Wajib"}
                        >
                          {isPilihan ? "P" : "W"}
                        </span>
                      </td>
                      {(["s1", "s2", "s3", "s4", "s5"] as const).map((sem) => (
                        <td key={sem} className="py-2.5 px-2 text-center min-w-[75px]">
                          <input
                            type="number"
                            step="0.1"
                            value={item.semester[sem] ?? ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? null : parseFloat(e.target.value);
                              const updated = [...nilaiRaporList];
                              updated[idx].semester[sem] = val;
                              setNilaiRaporList(updated);
                            }}
                            placeholder="-"
                            className="w-16 h-8 text-center text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                          />
                        </td>
                      ))}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setNilaiRaporList(nilaiRaporList.filter((_, i) => i !== idx));
                          }}
                          className="text-[#9CA3AF] hover:text-red-500 p-1 cursor-pointer"
                          title="Hapus mata pelajaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddMapelRapor}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6305B0] hover:text-[#530494] pt-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Mata Pelajaran
          </button>
        </div>

        <div className="bg-white border border-[#E9D5FF] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3E8FF] pb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">Prestasi Siswa</h3>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                Catatan capaian akademik maupun non-akademik.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6305B0] hover:bg-[#530494] text-white text-[12px] font-medium shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import (PDF/Excel)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Jenis Prestasi
                </label>
                <input
                  type="text"
                  value={prestasiForm.jenisPrestasi}
                  onChange={(e) => setPrestasiForm({ ...prestasiForm, jenisPrestasi: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Nama Lomba / Prestasi
                </label>
                <input
                  type="text"
                  value={prestasiForm.namaLomba}
                  onChange={(e) => setPrestasiForm({ ...prestasiForm, namaLomba: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Bidang
                </label>
                <input
                  type="text"
                  value={prestasiForm.bidang}
                  onChange={(e) => setPrestasiForm({ ...prestasiForm, bidang: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Tahun
                </label>
                <input
                  type="text"
                  value={prestasiForm.tahun}
                  onChange={(e) => setPrestasiForm({ ...prestasiForm, tahun: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Periode Prestasi (Filter Tahun)
                </label>
                <input
                  type="text"
                  value={prestasiForm.periodePrestasi}
                  onChange={(e) => setPrestasiForm({ ...prestasiForm, periodePrestasi: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Tingkat
                </label>
                <input
                  type="text"
                  value={prestasiForm.tingkat}
                  onChange={(e) => setPrestasiForm({ ...prestasiForm, tingkat: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Penyelenggara
                </label>
                <input
                  type="text"
                  value={prestasiForm.penyelenggara}
                  onChange={(e) => setPrestasiForm({ ...prestasiForm, penyelenggara: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Peringkat
                </label>
                <input
                  type="text"
                  value={prestasiForm.peringkat}
                  onChange={(e) => setPrestasiForm({ ...prestasiForm, peringkat: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Dokumen / Bukti
                </label>
                <input
                  type="text"
                  value={prestasiForm.dokumen}
                  onChange={(e) => setPrestasiForm({ ...prestasiForm, dokumen: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E9D5FF] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3E8FF] pb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">Kehadiran</h3>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                Distribusi persentase kehadiran siswa semester 1-5, format persen.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6305B0] hover:bg-[#530494] text-white text-[12px] font-medium shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import (PDF/Excel)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                Semester 1
              </label>
              <input
                type="text"
                value={kehadiranForm.semester1}
                onChange={(e) => setKehadiranForm({ ...kehadiranForm, semester1: e.target.value })}
                className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                Semester 2
              </label>
              <input
                type="text"
                value={kehadiranForm.semester2}
                onChange={(e) => setKehadiranForm({ ...kehadiranForm, semester2: e.target.value })}
                className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                Sakit
              </label>
              <input
                type="text"
                value={kehadiranForm.sakit}
                onChange={(e) => setKehadiranForm({ ...kehadiranForm, sakit: e.target.value })}
                className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                Izin
              </label>
              <input
                type="text"
                value={kehadiranForm.izin}
                onChange={(e) => setKehadiranForm({ ...kehadiranForm, izin: e.target.value })}
                className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                Alfa
              </label>
              <input
                type="text"
                value={kehadiranForm.alfa}
                onChange={(e) => setKehadiranForm({ ...kehadiranForm, alfa: e.target.value })}
                className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E9D5FF] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3E8FF] pb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">Profil Minat RIASEC</h3>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                Nilai komponen asesmen minat tipe kepribadian karir RIASEC.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6305B0] hover:bg-[#530494] text-white text-[12px] font-medium shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import (PDF/Excel)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                Kode Tes
              </label>
              <input
                type="text"
                value={riasecMeta.kodeTes}
                onChange={(e) => setRiasecMeta({ ...riasecMeta, kodeTes: e.target.value })}
                className="w-36 h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                Tanggal Asesmen
              </label>
              <input
                type="text"
                value={riasecMeta.tanggalAsesmen}
                onChange={(e) => setRiasecMeta({ ...riasecMeta, tanggalAsesmen: e.target.value })}
                className="w-44 h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {[
              { code: "R", name: "Realistic", key: "R", color: "#3B82F6", bg: "#EFF6FF" },
              { code: "I", name: "Investigative", key: "I", color: "#8B5CF6", bg: "#F5F3FF" },
              { code: "A", name: "Artistic", key: "A", color: "#EC4899", bg: "#FDF2F8" },
              { code: "S", name: "Social", key: "S", color: "#10B981", bg: "#ECFDF5" },
              { code: "E", name: "Enterprising", key: "E", color: "#F59E0B", bg: "#FFFBEB" },
              { code: "C", name: "Conventional", key: "C", color: "#6B7280", bg: "#F9FAFB" },
            ].map((r) => (
              <div
                key={r.code}
                className="border border-[#E9D5FF] rounded-xl p-3 flex flex-col items-center gap-2 bg-[#FAF7FC]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[13px]"
                  style={{ backgroundColor: r.bg, color: r.color }}
                >
                  {r.code}
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-semibold text-[#4B5563]">{r.name}</p>
                </div>
                <input
                  type="number"
                  value={riasecScores[r.key as keyof typeof riasecScores]}
                  onChange={(e) =>
                    setRiasecScores({
                      ...riasecScores,
                      [r.key]: Number(e.target.value),
                    })
                  }
                  className="w-16 h-8 text-center text-[13px] font-bold border border-[#E9D5FF] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E9D5FF] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3E8FF] pb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">Catatan Karakteristik Siswa</h3>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                Kelola Catatan Karakter Siswa
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6305B0] hover:bg-[#530494] text-white text-[12px] font-medium shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import (PDF/Excel)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-bold text-[#1F2937]">Riwayat Catatan</h4>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchCatatan}
                    onChange={(e) => setSearchCatatan(e.target.value)}
                    placeholder="Cari catatan..."
                    className="w-full h-8 pl-8 pr-3 text-[12px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="border border-[#E9D5FF] rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7FC] text-[#6B7280] font-semibold text-[11px] uppercase border-b border-[#E9D5FF]">
                      <th className="py-2 px-2.5">Tanggal</th>
                      <th className="py-2 px-2.5">Sem</th>
                      <th className="py-2 px-2.5">Tipe</th>
                      <th className="py-2 px-2.5">Deskripsi</th>
                      <th className="py-2 px-2.5 text-center">Bobot</th>
                      <th className="py-2 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3E8FF]">
                    {riwayatCatatan
                      .filter(
                        (c) =>
                          c.catatan.toLowerCase().includes(searchCatatan.toLowerCase()) ||
                          c.tipeKatatan.toLowerCase().includes(searchCatatan.toLowerCase())
                      )
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-[#FCFAFF]">
                          <td className="py-2 px-2.5 whitespace-nowrap text-[#4B5563]">{c.tanggal}</td>
                          <td className="py-2 px-2.5 whitespace-nowrap font-medium text-[#6305B0]">{c.semester}</td>
                          <td className="py-2 px-2.5 whitespace-nowrap font-medium text-[#1F2937]">{c.tipeKatatan}</td>
                          <td className="py-2 px-2.5 text-[#4B5563] max-w-[200px] truncate" title={c.catatan}>
                            {c.catatan}
                          </td>
                          <td className="py-2 px-2.5 text-center font-bold text-[#6305B0]">
                            {c.nilaiBobotKuantitatif}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => setRiwayatCatatan(riwayatCatatan.filter((item) => item.id !== c.id))}
                              className="text-[#9CA3AF] hover:text-red-500 p-1 cursor-pointer"
                              title="Hapus catatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FAF7FC] border border-[#E9D5FF] rounded-xl p-4 space-y-3">
              <h4 className="text-[14px] font-bold text-[#1F2937]">Tambah Catatan Karakter</h4>

              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={catatanBaru.tanggal}
                  onChange={(e) => setCatatanBaru({ ...catatanBaru, tanggal: e.target.value })}
                  className="w-full h-8 px-2.5 text-[12px] border border-[#E9D5FF] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Semester
                  </label>
                  <select
                    value={catatanBaru.semester}
                    onChange={(e) => setCatatanBaru({ ...catatanBaru, semester: e.target.value })}
                    className="w-full h-8 px-2 text-[12px] border border-[#E9D5FF] rounded-lg bg-white focus:outline-none"
                  >
                    <option value="S1">Semester 1</option>
                    <option value="S2">Semester 2</option>
                    <option value="S3">Semester 3</option>
                    <option value="S4">Semester 4</option>
                    <option value="S5">Semester 5</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Tipe Karakter
                  </label>
                  <input
                    type="text"
                    value={catatanBaru.tipe}
                    onChange={(e) => setCatatanBaru({ ...catatanBaru, tipe: e.target.value })}
                    placeholder="Contoh: Kedisiplinan"
                    className="w-full h-8 px-2.5 text-[12px] border border-[#E9D5FF] rounded-lg bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Deskripsi Catatan
                </label>
                <textarea
                  rows={2}
                  value={catatanBaru.catatan}
                  onChange={(e) => setCatatanBaru({ ...catatanBaru, catatan: e.target.value })}
                  placeholder="Tuliskan catatan observasi karakter siswa..."
                  className="w-full p-2 text-[12px] border border-[#E9D5FF] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  Nilai Bobot Angka (0-100)
                </label>
                <input
                  type="number"
                  value={catatanBaru.bobot}
                  onChange={(e) => setCatatanBaru({ ...catatanBaru, bobot: Number(e.target.value) })}
                  className="w-full h-8 px-2.5 text-[12px] border border-[#E9D5FF] rounded-lg bg-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleTambahCatatan}
                className="w-full py-2 bg-[#6305B0] hover:bg-[#530494] text-white text-[12px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Catatan Baru
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E9D5FF] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3E8FF] pb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">Nilai TKA Mata Uji Wajib</h3>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                Masukkan nilai setiap mata uji Wajib.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6305B0] hover:bg-[#530494] text-white text-[12px] font-medium shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import (PDF/Excel)
            </button>
          </div>

          <div className="space-y-2.5 max-w-lg">
            {tkaWajib.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E9D5FF] bg-[#FAF7FC]"
              >
                <span className="text-[13px] font-medium text-[#1F2937]">{item.mapel}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.nilai}
                    onChange={(e) => {
                      const updated = [...tkaWajib];
                      updated[idx].nilai = Number(e.target.value);
                      setTkaWajib(updated);
                    }}
                    className="w-20 h-8 text-center text-[13px] font-bold border border-[#E9D5FF] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                  />
                  <button
                    type="button"
                    onClick={() => setTkaWajib(tkaWajib.filter((_, i) => i !== idx))}
                    className="text-[#9CA3AF] hover:text-red-500 p-1 cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddTkaWajib}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6305B0] hover:text-[#530494] pt-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Mata Uji Wajib
          </button>
        </div>

        <div className="bg-white border border-[#E9D5FF] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3E8FF] pb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">Nilai TKA Mata Uji Pilihan</h3>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                Masukkan nilai setiap mata uji Pilihan.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6305B0] hover:bg-[#530494] text-white text-[12px] font-medium shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import (PDF/Excel)
            </button>
          </div>

          <div className="space-y-2.5 max-w-lg">
            {tkaPilihan.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E9D5FF] bg-[#FAF7FC]"
              >
                <span className="text-[13px] font-medium text-[#1F2937]">{item.mataUji}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.nilai}
                    onChange={(e) => {
                      const updated = [...tkaPilihan];
                      updated[idx].nilai = Number(e.target.value);
                      setTkaPilihan(updated);
                    }}
                    className="w-20 h-8 text-center text-[13px] font-bold border border-[#E9D5FF] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                  />
                  <button
                    type="button"
                    onClick={() => setTkaPilihan(tkaPilihan.filter((_, i) => i !== idx))}
                    className="text-[#9CA3AF] hover:text-red-500 p-1 cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddTkaPilihan}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6305B0] hover:text-[#530494] pt-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Mata Uji Pilihan
          </button>

          <p className="text-[11px] text-[#9CA3AF] italic">
            * Nilai mengacu pada ambang batas masing-masing program studi pilihan siswa.
          </p>
        </div>

        <div className="bg-white border border-[#E9D5FF] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3E8FF] pb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">Kecerdasan Majemuk Siswa</h3>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                Input hasil asesmen untuk menunjukkan profil kecerdasan majemuk setiap siswa.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6305B0] hover:bg-[#530494] text-white text-[12px] font-medium shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import (PDF/Excel)
            </button>
          </div>

          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3 flex items-center gap-2.5 text-[12px] text-[#1E40AF]">
            <Info className="w-4 h-4 shrink-0 text-[#3B82F6]" />
            <span>Sebelum mengisi, pastikan opsi telah valid pada opsi asesmen.</span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
              Klasifikasi
            </label>
            <input
              type="text"
              value={kecerdasanForm.klasifikasi}
              onChange={(e) => setKecerdasanForm({ ...kecerdasanForm, klasifikasi: e.target.value })}
              className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
            />
          </div>

          <div className="bg-[#FAF7FC] border border-[#E9D5FF] rounded-xl p-3.5 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0"
              style={{
                backgroundColor: defaultSiswa.initialsBg || "#E0D7F5",
                color: "#6305B0",
              }}
            >
              {defaultSiswa.initials}
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#1F2937] uppercase">{defaultSiswa.nama}</p>
              <p className="text-[11px] text-[#6B7280]">
                {defaultSiswa.kelas} | NISN {defaultSiswa.nisn}
              </p>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
              Jenis Kecerdasan Dominan
            </label>
            <input
              type="text"
              value={kecerdasanForm.jenisKecerdasan}
              onChange={(e) => setKecerdasanForm({ ...kecerdasanForm, jenisKecerdasan: e.target.value })}
              className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-2">
              Dimensi Skor Kecerdasan (0-100)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Linguistik", key: "linguistik" },
                { label: "Logis-Matematis", key: "logisMatematis" },
                { label: "Visual-Spasial", key: "spasialVisual" },
                { label: "Kinestetik", key: "kinestetik" },
                { label: "Musikal", key: "musikal" },
                { label: "Interpersonal", key: "interpersonal" },
                { label: "Intrapersonal", key: "intrapersonal" },
                { label: "Naturalis", key: "naturalis" },
              ].map((dim) => (
                <div key={dim.key} className="bg-[#FAF7FC] border border-[#E9D5FF] rounded-xl p-2.5">
                  <span className="text-[11px] text-[#6B7280] font-medium block mb-1 truncate">{dim.label}</span>
                  <input
                    type="number"
                    value={kecerdasanForm[dim.key as keyof typeof kecerdasanForm]}
                    onChange={(e) =>
                      setKecerdasanForm({
                        ...kecerdasanForm,
                        [dim.key]: Number(e.target.value),
                      })
                    }
                    className="w-full h-8 text-center text-[13px] font-bold border border-[#E9D5FF] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                Skor Asesmen
              </label>
              <input
                type="text"
                value={kecerdasanForm.skorAsesmen}
                onChange={(e) => setKecerdasanForm({ ...kecerdasanForm, skorAsesmen: e.target.value })}
                className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
              />
              <span className="text-[10px] text-[#9CA3AF] mt-0.5 block">Rentang skor asesmen 0-100</span>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                Tanggal Asesmen
              </label>
              <input
                type="text"
                value={kecerdasanForm.tanggalAsesmen}
                onChange={(e) => setKecerdasanForm({ ...kecerdasanForm, tanggalAsesmen: e.target.value })}
                className="w-full h-9 px-3 text-[13px] border border-[#E9D5FF] rounded-lg bg-[#FAF7FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6305B0]"
              />
              <span className="text-[10px] text-[#9CA3AF] mt-0.5 block">Format: dd/mm/yyyy</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E9D5FF]">
          <div className="flex items-center gap-2 text-emerald-600 text-[13px] font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Data telah terisi dengan referensi lengkap</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              href="/admin/b2"
              className="px-5 py-2.5 rounded-xl border border-[#D6BBFB] text-[#6941C6] hover:bg-[#F4EBFF] text-[13px] font-medium transition-colors cursor-pointer"
            >
              Batal
            </Link>
            <button
              type="button"
              onClick={handleSimpan}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#6305B0] hover:bg-[#530494] text-white text-[13px] font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isSaving ? "Menyimpan Data..." : "Simpan Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}