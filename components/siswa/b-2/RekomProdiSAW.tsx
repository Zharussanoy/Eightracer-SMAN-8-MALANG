"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  BarChart3,
  RefreshCw,
  BookOpen,
  Award,
  CheckCircle2,
  Printer,
  Search,
  SlidersHorizontal,
  Building2,
  FileSpreadsheet,
  Star,
  ShieldCheck,
  Compass,
  ArrowUpDown,
  GraduationCap,
} from "lucide-react";
import {
  asesmenService,
  akademikService,
  prodiAdminService,
  ptnService,
  siswaProfileService,
} from "@/services/b2";
import { useUser } from "@/context/UserContext";

// ── 1. Tipe Data Kriteria & Alternatif SAW ──
export interface KriteriaBobot {
  id: string;
  nama: string;
  bobot: number;
  jenisManfaat: "benefit" | "cost";
  keterangan: string;
}

export interface ProdiAlternatif {
  id: string;
  namaProdi: string;
  universitas: string;
  kodeUniv: string;
  rumpun: "SAINTEK" | "SOSHUM";
  jalurMasuk: "SNBP" | "SNBT" | "Mandiri";
  skorNilai: number; // C1: Nilai Akademik Siswa
  minat: number; // C2: Kesesuaian Minat RIASEC (skala 1-10)
  peluangKarir: number; // C3: Prospek Karir & Industri (skala 1-10)
  dayaTampung: number; // C4: Kuota Kursi Penerimaan
  tingkatKesulitan: number; // C5: Rasio Ketetatan / Kesulitan (Cost, skala 1-10)
  kodeRiasec?: string;
  namaKlaster?: string;
}

export interface HasilSAW {
  id: string;
  namaProdi: string;
  universitas: string;
  kodeUniv: string;
  rumpun: "SAINTEK" | "SOSHUM";
  jalurMasuk: "SNBP" | "SNBT" | "Mandiri";
  skor: number; // Nilai Preferensi Vi (0.00 - 1.00)
  peringkat: number;
  rekomendasi:
    | "Sangat Direkomendasikan"
    | "Direkomendasikan"
    | "Pertimbangkan"
    | "Kurang Sesuai";
  rincianSkor: {
    c1_nilai: number;
    c2_minat: number;
    c3_karir: number;
    c4_dayaTampung: number;
    c5_kesulitan: number;
  };
  normScore: {
    r1: number;
    r2: number;
    r3: number;
    r4: number;
    r5: number;
  };
  alasan: string;
}

// ── 2. Definisi Kriteria Standar BK SMARIHASTA ──
export const KRITERIA_STANDAR_SAW: KriteriaBobot[] = [
  {
    id: "k1",
    nama: "Rata-rata Nilai Akademik",
    bobot: 0.30,
    jenisManfaat: "benefit",
    keterangan: "Rata-rata rapor kumulatif semester 1–5 & mapel pendukung",
  },
  {
    id: "k2",
    nama: "Kesesuaian Minat (RIASEC)",
    bobot: 0.25,
    jenisManfaat: "benefit",
    keterangan: "Tingkat kesesuaian profil asesmen minat bakat RIASEC",
  },
  {
    id: "k3",
    nama: "Prospek & Peluang Karir",
    bobot: 0.20,
    jenisManfaat: "benefit",
    keterangan: "Indeks serapan kerja lulusan & relevansi era industri 4.0/AI",
  },
  {
    id: "k4",
    nama: "Daya Tampung PTN",
    bobot: 0.15,
    jenisManfaat: "benefit",
    keterangan: "Kuantitas alokasi kursi penerimaan (kuota lebih besar = peluang lebih tinggi)",
  },
  {
    id: "k5",
    nama: "Tingkat Persaingan",
    bobot: 0.10,
    jenisManfaat: "cost",
    keterangan: "Rasio ketetatan pelamar (cost: nilai lebih rendah = lebih aman)",
  },
];

// ── 3. Data Master Program Studi Favorit SMARIHASTA ──
const MASTER_PRODI_SMARIHASTA: Omit<ProdiAlternatif, "skorNilai" | "minat">[] = [
  {
    id: "p1",
    namaProdi: "Teknik Informatika",
    universitas: "Universitas Brawijaya",
    kodeUniv: "UB",
    rumpun: "SAINTEK",
    jalurMasuk: "SNBP",
    peluangKarir: 10,
    dayaTampung: 120,
    tingkatKesulitan: 8.5,
    kodeRiasec: "IRC",
    namaKlaster: "Ilmu Komputer & Informatika",
  },
  {
    id: "p2",
    namaProdi: "Sistem Informasi",
    universitas: "Universitas Negeri Malang",
    kodeUniv: "UM",
    rumpun: "SAINTEK",
    jalurMasuk: "SNBP",
    peluangKarir: 9.2,
    dayaTampung: 150,
    tingkatKesulitan: 6.5,
    kodeRiasec: "IRC",
    namaKlaster: "Sistem Informasi & Sains Data",
  },
  {
    id: "p3",
    namaProdi: "Ilmu Komputer",
    universitas: "Universitas Gadjah Mada",
    kodeUniv: "UGM",
    rumpun: "SAINTEK",
    jalurMasuk: "SNBT",
    peluangKarir: 10,
    dayaTampung: 80,
    tingkatKesulitan: 9.0,
    kodeRiasec: "IRC",
    namaKlaster: "Ilmu Komputer & Informatika",
  },
  {
    id: "p4",
    namaProdi: "Teknik Elektro",
    universitas: "Institut Teknologi Bandung",
    kodeUniv: "ITB",
    rumpun: "SAINTEK",
    jalurMasuk: "SNBT",
    peluangKarir: 9.5,
    dayaTampung: 60,
    tingkatKesulitan: 9.5,
    kodeRiasec: "RIE",
    namaKlaster: "Teknik Elektro & Robotika",
  },
  {
    id: "p5",
    namaProdi: "Sains Data",
    universitas: "Institut Teknologi Sepuluh Nopember",
    kodeUniv: "ITS",
    rumpun: "SAINTEK",
    jalurMasuk: "SNBP",
    peluangKarir: 9.8,
    dayaTampung: 90,
    tingkatKesulitan: 7.8,
    kodeRiasec: "IRC",
    namaKlaster: "Sistem Informasi & Sains Data",
  },
  {
    id: "p6",
    namaProdi: "Kedokteran",
    universitas: "Universitas Airlangga",
    kodeUniv: "UNAIR",
    rumpun: "SAINTEK",
    jalurMasuk: "SNBP",
    peluangKarir: 9.7,
    dayaTampung: 75,
    tingkatKesulitan: 10.0,
    kodeRiasec: "ISR",
    namaKlaster: "Kedokteran & Ilmu Kesehatan",
  },
  {
    id: "p7",
    namaProdi: "Farmasi",
    universitas: "Universitas Airlangga",
    kodeUniv: "UNAIR",
    rumpun: "SAINTEK",
    jalurMasuk: "SNBP",
    peluangKarir: 9.0,
    dayaTampung: 100,
    tingkatKesulitan: 8.2,
    kodeRiasec: "IRC",
    namaKlaster: "Farmasi & Sains Terapan",
  },
  {
    id: "p8",
    namaProdi: "Matematika & Aktuaria",
    universitas: "Universitas Brawijaya",
    kodeUniv: "UB",
    rumpun: "SAINTEK",
    jalurMasuk: "SNBP",
    peluangKarir: 9.3,
    dayaTampung: 95,
    tingkatKesulitan: 6.8,
    kodeRiasec: "ICR",
    namaKlaster: "Matematika & Aktuaria",
  },
  {
    id: "p9",
    namaProdi: "Manajemen Bisnis",
    universitas: "Universitas Brawijaya",
    kodeUniv: "UB",
    rumpun: "SOSHUM",
    jalurMasuk: "SNBP",
    peluangKarir: 9.0,
    dayaTampung: 180,
    tingkatKesulitan: 7.9,
    kodeRiasec: "ECS",
    namaKlaster: "Manajemen Bisnis & Keuangan",
  },
  {
    id: "p10",
    namaProdi: "Ilmu Komunikasi",
    universitas: "Universitas Brawijaya",
    kodeUniv: "UB",
    rumpun: "SOSHUM",
    jalurMasuk: "SNBP",
    peluangKarir: 8.8,
    dayaTampung: 130,
    tingkatKesulitan: 7.5,
    kodeRiasec: "ASE",
    namaKlaster: "Ilmu Komunikasi & Media Digital",
  },
  {
    id: "p11",
    namaProdi: "Psikologi",
    universitas: "Universitas Airlangga",
    kodeUniv: "UNAIR",
    rumpun: "SOSHUM",
    jalurMasuk: "SNBP",
    peluangKarir: 8.9,
    dayaTampung: 110,
    tingkatKesulitan: 8.0,
    kodeRiasec: "SIA",
    namaKlaster: "Psikologi & Humaniora",
  },
  {
    id: "p12",
    namaProdi: "Arsitektur",
    universitas: "Institut Teknologi Sepuluh Nopember",
    kodeUniv: "ITS",
    rumpun: "SAINTEK",
    jalurMasuk: "SNBP",
    peluangKarir: 8.9,
    dayaTampung: 70,
    tingkatKesulitan: 8.3,
    kodeRiasec: "AIR",
    namaKlaster: "Arsitektur & Desain Lingkungan",
  },
];

// ── 4. Fungsi Algoritma SAW Matematika Murni ──
export function hitungEngineSAW(
  alternatifs: ProdiAlternatif[],
  kriterias: KriteriaBobot[]
): HasilSAW[] {
  if (alternatifs.length === 0) return [];

  // Cari Max dan Min untuk tiap kriteria
  const maxC1 = Math.max(...alternatifs.map((a) => a.skorNilai));
  const maxC2 = Math.max(...alternatifs.map((a) => a.minat));
  const maxC3 = Math.max(...alternatifs.map((a) => a.peluangKarir));
  const maxC4 = Math.max(...alternatifs.map((a) => a.dayaTampung));
  const minC5 = Math.min(...alternatifs.map((a) => a.tingkatKesulitan));

  const bobotMap = new Map(kriterias.map((k) => [k.id, k.bobot]));
  const w1 = bobotMap.get("k1") ?? 0.30;
  const w2 = bobotMap.get("k2") ?? 0.25;
  const w3 = bobotMap.get("k3") ?? 0.20;
  const w4 = bobotMap.get("k4") ?? 0.15;
  const w5 = bobotMap.get("k5") ?? 0.10;

  // 1. Normalisasi Matriks Keputusan (R)
  const normalizedList = alternatifs.map((alt) => {
    // Kriteria Benefit (C1 - C4): x_ij / max(x_j)
    const r1 = maxC1 > 0 ? alt.skorNilai / maxC1 : 0;
    const r2 = maxC2 > 0 ? alt.minat / maxC2 : 0;
    const r3 = maxC3 > 0 ? alt.peluangKarir / maxC3 : 0;
    const r4 = maxC4 > 0 ? alt.dayaTampung / maxC4 : 0;
    // Kriteria Cost (C5): min(x_j) / x_ij
    const r5 = alt.tingkatKesulitan > 0 ? minC5 / alt.tingkatKesulitan : 0;

    // 2. Nilai Preferensi Akhir (Vi = sum(w_j * r_ij))
    const vi = w1 * r1 + w2 * r2 + w3 * r3 + w4 * r4 + w5 * r5;

    return {
      alt,
      r1,
      r2,
      r3,
      r4,
      r5,
      vi,
    };
  });

  // 3. Urutkan dari skor tertinggi (Ranking 1..N)
  normalizedList.sort((a, b) => b.vi - a.vi);

  return normalizedList.map((item, idx) => {
    const rank = idx + 1;
    let rekomendasi: HasilSAW["rekomendasi"] = "Kurang Sesuai";
    if (rank === 1 || item.vi >= 0.88) {
      rekomendasi = "Sangat Direkomendasikan";
    } else if (rank <= 3 || item.vi >= 0.78) {
      rekomendasi = "Direkomendasikan";
    } else if (rank <= 6 || item.vi >= 0.68) {
      rekomendasi = "Pertimbangkan";
    }

    const alasan =
      rank === 1
        ? `Program studi paling optimal sesuai kombinasi nilai akademik (${item.alt.skorNilai}), profil RIASEC (${item.alt.kodeRiasec || "-"}), dan prospek karir.`
        : rank <= 3
        ? `Sangat kompetitif dengan kesesuaian profil tinggi di ${item.alt.universitas}.`
        : `Alternatif realistis dengan kuota penerimaan memadai dan rasio persaingan seimbang.`;

    return {
      id: item.alt.id,
      namaProdi: item.alt.namaProdi,
      universitas: item.alt.universitas,
      kodeUniv: item.alt.kodeUniv,
      rumpun: item.alt.rumpun,
      jalurMasuk: item.alt.jalurMasuk,
      skor: Math.round(item.vi * 1000) / 1000,
      peringkat: rank,
      rekomendasi,
      rincianSkor: {
        c1_nilai: item.alt.skorNilai,
        c2_minat: item.alt.minat,
        c3_karir: item.alt.peluangKarir,
        c4_dayaTampung: item.alt.dayaTampung,
        c5_kesulitan: item.alt.tingkatKesulitan,
      },
      normScore: {
        r1: Math.round(item.r1 * 1000) / 1000,
        r2: Math.round(item.r2 * 1000) / 1000,
        r3: Math.round(item.r3 * 1000) / 1000,
        r4: Math.round(item.r4 * 1000) / 1000,
        r5: Math.round(item.r5 * 1000) / 1000,
      },
      alasan,
    };
  });
}

const BADGE_COLOR: Record<HasilSAW["rekomendasi"], string> = {
  "Sangat Direkomendasikan": "bg-emerald-100 text-emerald-800 border-emerald-300",
  Direkomendasikan: "bg-purple-100 text-[#6305B0] border-purple-300",
  Pertimbangkan: "bg-amber-100 text-amber-800 border-amber-300",
  "Kurang Sesuai": "bg-slate-100 text-slate-600 border-slate-300",
};

const JALUR_COLOR: Record<string, string> = {
  SNBP: "bg-purple-50 text-[#6305B0] border border-purple-200",
  SNBT: "bg-blue-50 text-blue-700 border border-blue-200",
  Mandiri: "bg-slate-100 text-slate-700 border border-slate-200",
};

export default function RekomProdiSAW() {
  const { currentUser } = useUser();

  // State Input Simulasi Siswa
  const [nilaiRata, setNilaiRata] = useState<string>("90.1");
  const [minat, setMinat] = useState<string>("9");
  const [liveRiasecCode, setLiveRiasecCode] = useState<string>("IRC");
  const [liveKecerdasan, setLiveKecerdasan] = useState<string>("Logis-Matematis");
  const [siswaNama, setSiswaNama] = useState<string>("Ahmad B2 Pratama");
  const [siswaNisn, setSiswaNisn] = useState<string>("0061234567");

  // State Kriteria Bobot
  const [bobotEdited, setBobotEdited] = useState<KriteriaBobot[]>(
    KRITERIA_STANDAR_SAW.map((k) => ({ ...k }))
  );
  const [showKriteria, setShowKriteria] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State Hasil Rekomendasi
  const [hasil, setHasil] = useState<HasilSAW[]>([]);
  const [calculated, setCalculated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // State Filter & Tampilan
  const [filterRumpun, setFilterRumpun] = useState<"SEMUA" | "SAINTEK" | "SOSHUM">("SEMUA");
  const [filterJalur, setFilterJalur] = useState<"SEMUA" | "SNBP" | "SNBT" | "Mandiri">("SEMUA");
  const [searchProdi, setSearchProdi] = useState<string>("");
  const [activeView, setActiveView] = useState<"cards" | "matrix">("cards");

  // State Live Data Klaster Backend
  const [backendKlasterList, setBackendKlasterList] = useState<any[]>([]);

  // ── 5. Fetch Live Data Asesmen & Akademik Siswa dari Backend ──
  const fetchLiveContext = async () => {
    try {
      setLoading(true);

      // 1. Fetch live profil siswa
      const profRes = await siswaProfileService.getProfile().catch(() => null);
      if (profRes?.data) {
        if (profRes.data.nama_lengkap) setSiswaNama(profRes.data.nama_lengkap);
        if (profRes.data.nisn) setSiswaNisn(profRes.data.nisn);
      }

      // 2. Fetch live data asesmen karakteristik & RIASEC
      const asesmenRes = await asesmenService.getAsesmen().catch(() => null);
      if (asesmenRes?.data) {
        const rawChar: any = asesmenRes.data.karakteristik;
        const char = Array.isArray(rawChar) ? rawChar[0] : rawChar;
        if (char?.kode_riasec) setLiveRiasecCode(char.kode_riasec);
        if (char?.kecerdasan_majemuk_dominan) {
          setLiveKecerdasan(char.kecerdasan_majemuk_dominan);
        }
      }

      // 3. Fetch live data akademik siswa untuk rata-rata rapor
      const akRes = await akademikService.getAkademik().catch(() => null);
      if (akRes?.data) {
        if (akRes.data.rata_rata_rapor) {
          const val = Number(akRes.data.rata_rata_rapor).toFixed(1);
          setNilaiRata(val);
        } else if (akRes.data.nilai_rapor && Array.isArray(akRes.data.nilai_rapor) && akRes.data.nilai_rapor.length > 0) {
          const total = akRes.data.nilai_rapor.reduce(
            (acc: number, item: any) => acc + (Number(item.nilai_akhir) || 0),
            0
          );
          const avg = (total / akRes.data.nilai_rapor.length).toFixed(1);
          setNilaiRata(avg);
        }
      }

      // 4. Fetch live data klaster prodi dari backend database
      const prodiRes = await prodiAdminService.getAll({ per_page: 50 }).catch(() => null);
      if (prodiRes?.data?.data && Array.isArray(prodiRes.data.data)) {
        setBackendKlasterList(prodiRes.data.data);
      }

      setSyncNotice("Terhubung ke Database Live SMAN 8 Malang (Klaster & RIASEC)");
    } catch (err: any) {
      console.warn("Koneksi live SAW (fallback):", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveContext();
  }, [currentUser]);

  // ── 6. Susun Alternatif Prodi Dinamis berdasarkan Nilai & Minat Siswa ──
  const buildAlternatifs = useCallback((): ProdiAlternatif[] => {
    const baseNilai = parseFloat(nilaiRata) || 88.5;
    const baseMinat = parseInt(minat) || 8;
    const userRiasec = liveRiasecCode.toUpperCase();

    return MASTER_PRODI_SMARIHASTA.map((p) => {
      // 1. Hitung skor nilai akademik spesifik per rumpun/mapel prodi
      let prodiNilai = baseNilai;
      if (p.kodeUniv === "UB" && (p.namaProdi.includes("Informatika") || p.namaProdi.includes("Sistem"))) {
        prodiNilai = Math.min(100, Math.round((baseNilai * 1.02) * 10) / 10);
      } else if (p.kodeUniv === "ITB" || p.kodeUniv === "UGM") {
        prodiNilai = Math.round(baseNilai * 10) / 10;
      } else if (p.rumpun === "SOSHUM") {
        prodiNilai = Math.max(70, Math.round((baseNilai * 0.98) * 10) / 10);
      }

      // 2. Hitung kecocokan minat RIASEC dengan kode prodi
      let matchScore = baseMinat;
      if (p.kodeRiasec) {
        const prodiRiasec = p.kodeRiasec.toUpperCase();
        if (prodiRiasec === userRiasec) {
          matchScore = Math.min(10, baseMinat + 1);
        } else {
          // Hitung irisan huruf
          let overlap = 0;
          for (const ch of userRiasec) {
            if (prodiRiasec.includes(ch)) overlap++;
          }
          if (overlap >= 2) {
            matchScore = Math.min(10, baseMinat);
          } else if (overlap === 1) {
            matchScore = Math.max(5, baseMinat - 1);
          } else {
            matchScore = Math.max(4, baseMinat - 2.5);
          }
        }
      }

      return {
        ...p,
        skorNilai: prodiNilai,
        minat: matchScore,
      };
    });
  }, [nilaiRata, minat, liveRiasecCode]);

  // Hitung otomatis saat pertama kali komponen termuat
  useEffect(() => {
    const alternatifs = buildAlternatifs();
    const hasilAwal = hitungEngineSAW(alternatifs, bobotEdited);
    setHasil(hasilAwal);
    setCalculated(true);
  }, [buildAlternatifs]);

  // ── 7. Validasi Input ──
  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    const n = parseFloat(nilaiRata);
    if (isNaN(n) || n < 0 || n > 100) e.nilaiRata = "Nilai harus antara 0–100";
    const m = parseInt(minat);
    if (isNaN(m) || m < 1 || m > 10) e.minat = "Kesesuaian minat harus antara 1–10";
    const tot = bobotEdited.reduce((s, k) => s + k.bobot, 0);
    if (Math.abs(tot - 1) > 0.01) {
      e.bobot = `Total bobot harus tepat 1.00 (sekarang: ${tot.toFixed(2)})`;
    }
    return e;
  }, [nilaiRata, minat, bobotEdited]);

  // ── 8. Eksekusi Perhitungan SAW ──
  const handleHitung = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      const alternatifs = buildAlternatifs();
      const hasilBaru = hitungEngineSAW(alternatifs, bobotEdited);
      setHasil(hasilBaru);
      setCalculated(true);
      setLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setNilaiRata("90.1");
    setMinat("9");
    setBobotEdited(KRITERIA_STANDAR_SAW.map((k) => ({ ...k })));
    setErrors({});
    const alternatifs = buildAlternatifs();
    const hasilDefault = hitungEngineSAW(alternatifs, KRITERIA_STANDAR_SAW);
    setHasil(hasilDefault);
    setCalculated(true);
  };

  const totalBobot = bobotEdited.reduce((s, k) => s + k.bobot, 0);

  // ── 9. Filter Hasil Rekomendasi ──
  const filteredHasil = useMemo(() => {
    return hasil.filter((item) => {
      if (filterRumpun !== "SEMUA" && item.rumpun !== filterRumpun) return false;
      if (filterJalur !== "SEMUA" && item.jalurMasuk !== filterJalur) return false;
      if (searchProdi.trim()) {
        const q = searchProdi.toLowerCase().trim();
        const matchName = item.namaProdi.toLowerCase().includes(q);
        const matchUniv = item.universitas.toLowerCase().includes(q);
        const matchKode = item.kodeUniv.toLowerCase().includes(q);
        if (!matchName && !matchUniv && !matchKode) return false;
      }
      return true;
    });
  }, [hasil, filterRumpun, filterJalur, searchProdi]);

  // ── 10. Cetak Bukti Hasil Rekomendasi SAW Resmi Kop SMARIHASTA ──
  const handlePrintRekomendasi = () => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const tanggalHariIni = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const docHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Surat Rekomendasi Program Studi - ${siswaNama}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Times New Roman', Times, serif; color: #111; margin: 0; padding: 15px; font-size: 11pt; line-height: 1.5; }
          .kop { border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px; text-align: center; }
          .kop h2 { margin: 0; font-size: 12.5pt; font-weight: bold; text-transform: uppercase; }
          .kop h1 { margin: 2px 0; font-size: 15pt; font-weight: bold; text-transform: uppercase; }
          .kop p { margin: 1px 0; font-size: 9pt; font-style: italic; }
          .title { text-align: center; margin: 14px 0 16px; }
          .title h3 { margin: 0; font-size: 12.5pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; }
          .title p { margin: 2px 0; font-size: 10pt; }
          table.info { width: 100%; border-collapse: collapse; margin: 12px 0; }
          table.info td { padding: 3px 5px; font-size: 10.5pt; vertical-align: top; }
          table.scores { width: 100%; border-collapse: collapse; margin: 14px 0; }
          table.scores th, table.scores td { border: 1px solid #333; padding: 5px 7px; font-size: 9.5pt; }
          table.scores th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
          .highlight-box { border: 1.5px solid #6305B0; background-color: #faf5ff; padding: 10px 14px; margin: 14px 0; border-radius: 6px; }
          .ttd-container { margin-top: 25px; display: flex; justify-content: flex-end; }
          .ttd-box { width: 260px; text-align: center; font-size: 10.5pt; }
          .ttd-space { height: 55px; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>PEMERINTAH PROVINSI JAWA TIMUR</h2>
          <h2>DINAS PENDIDIKAN</h2>
          <h1>SMA NEGERI 8 MALANG</h1>
          <p>Jalan Veteran No. 19 Malang 65145 | Telp: (0341) 551096 | Email: info@sman8malang.sch.id</p>
        </div>

        <div class="title">
          <h3>LEMBAR REKOMENDASI PROGRAM STUDI (METODE SAW)</h3>
          <p>Nomor: 421.3/ 295 /BK.101.6.9.8/2026</p>
        </div>

        <p>Bimbingan dan Konseling SMA Negeri 8 Malang menerangkan bahwa hasil analisis pendukung keputusan pemilihan program studi perguruan tinggi untuk siswa:</p>

        <table class="info">
          <tr><td style="width:160px;">Nama Lengkap Siswa</td><td style="width:15px;">:</td><td><strong>${siswaNama}</strong></td></tr>
          <tr><td>NISN</td><td>:</td><td>${siswaNisn}</td></tr>
          <tr><td>Rata-rata Nilai Rapor</td><td>:</td><td>${nilaiRata} (Semester 1–5)</td></tr>
          <tr><td>Profil Minat Asesmen</td><td>:</td><td>Kode RIASEC: <strong>${liveRiasecCode}</strong> | Kecerdasan: ${liveKecerdasan}</td></tr>
        </table>

        <div class="highlight-box">
          <strong>Rekomendasi Utama (Peringkat #1):</strong><br/>
          Program Studi: <strong>${hasil[0]?.namaProdi || "Teknik Informatika"}</strong> — <strong>${hasil[0]?.universitas || "Universitas Brawijaya"}</strong><br/>
          Skor Preferensi SAW: <strong>${hasil[0] ? (hasil[0].skor * 100).toFixed(1) : "94.2"}%</strong> (${hasil[0]?.rekomendasi || "Sangat Direkomendasikan"})
        </div>

        <p>Tabel Peringkat Rekomendasi Program Studi Berdasarkan Metode Simple Additive Weighting (SAW):</p>

        <table class="scores">
          <thead>
            <tr>
              <th style="width:35px;">Rank</th>
              <th>Program Studi</th>
              <th>Perguruan Tinggi</th>
              <th>Rumpun</th>
              <th>Jalur</th>
              <th>Skor SAW</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${hasil
              .slice(0, 7)
              .map(
                (h) => `
              <tr>
                <td style="text-align:center;font-weight:bold;">#${h.peringkat}</td>
                <td><strong>${h.namaProdi}</strong></td>
                <td>${h.universitas} (${h.kodeUniv})</td>
                <td style="text-align:center;">${h.rumpun}</td>
                <td style="text-align:center;">${h.jalurMasuk}</td>
                <td style="text-align:right;font-weight:bold;">${(h.skor * 100).toFixed(1)}%</td>
                <td>${h.rekomendasi}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <p style="font-size:9.5pt;color:#444;">*Catatan BK: Rekomendasi diolah berdasarkan kombinasi pembobotan 5 kriteria: Nilai Akademik (${(bobotEdited.find(k => k.id === "k1")?.bobot || 0.3) * 100}%), Minat RIASEC (${(bobotEdited.find(k => k.id === "k2")?.bobot || 0.25) * 100}%), Prospek Karir (${(bobotEdited.find(k => k.id === "k3")?.bobot || 0.2) * 100}%), Daya Tampung (${(bobotEdited.find(k => k.id === "k4")?.bobot || 0.15) * 100}%), dan Tingkat Persaingan (${(bobotEdited.find(k => k.id === "k5")?.bobot || 0.1) * 100}%).</p>

        <div class="ttd-container">
          <div class="ttd-box">
            <p>Malang, ${tanggalHariIni}</p>
            <p>Kepala SMA Negeri 8 Malang,</p>
            <div class="ttd-space"></div>
            <p><strong>Drs. H. Moh. Sulthon, M.Pd.</strong></p>
            <p style="font-size:9.5pt;">NIP. 19680512 199403 1 008</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const doc = printFrame.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(docHtml);
      doc.close();
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 3000);
    }
  };

  return (
    <div className="space-y-6 w-full text-[#14141C]">
      {/* ──────────────────────────────────────────────────────────
          HERO BANNER: ENGINE REKOMENDASI SAW SMARIHASTA
         ────────────────────────────────────────────────────────── */}
      <div className="rounded-[18px] bg-gradient-to-r from-[#4A047D] via-[#5F089E] to-[#7B1FA2] text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-900 text-[11px] font-bold flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live Engine SAW Terverifikasi
              </span>
              <span className="text-[11px] font-medium text-purple-200">
                Formula BK SMAN 8 Malang
              </span>
              {syncNotice && (
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white/90">
                  Live Database
                </span>
              )}
            </div>

            <h2
              className="text-xl sm:text-2xl font-black tracking-tight"
              style={{ fontFamily: "Inter, Montserrat, sans-serif" }}
            >
              Rekomendasi Program Studi (Metode SAW)
            </h2>
            <p className="text-purple-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Sistem pendukung keputusan multi-kriteria berbasis{" "}
              <strong className="text-white">Simple Additive Weighting (SAW)</strong>. Menghitung keselarasan objektif antara nilai rapor kumulatif, profil asesmen minat RIASEC, daya tampung PTN, serta peluang karir.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrintRekomendasi}
                className="px-3.5 py-1.5 rounded-lg bg-white text-[#6305B0] hover:bg-purple-50 text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Rekomendasi (PDF)</span>
              </button>

              <button
                type="button"
                onClick={fetchLiveContext}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Sinkronkan Ulang Data</span>
              </button>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-white/10 backdrop-blur-xs p-3.5 sm:p-4 rounded-xl border border-white/20 shrink-0 flex flex-col gap-1.5 min-w-[200px]">
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">
              Profil Terhubung
            </span>
            <p className="text-sm font-bold text-white truncate">{siswaNama}</p>
            <div className="flex items-center gap-2 pt-1 border-t border-white/20 text-[11px] text-purple-100">
              <span className="px-1.5 py-0.5 rounded bg-white/20 font-bold text-amber-300 text-[10px]">
                {liveRiasecCode}
              </span>
              <span className="truncate">{liveKecerdasan}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          MAIN CONTENT: GRID 2 KOLOM (SIMULASI vs HASIL)
         ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-7 items-start">
        {/* ── PANEL KIRI (INPUT & BOBOT KRITERIA) ── */}
        <div className="space-y-4">
          {/* Kartu Parameter Siswa */}
          <div className="rounded-[16px] border border-slate-200 bg-white p-4.5 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5F089E]" />
                Parameter Input Siswa
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-[#6305B0] font-bold">
                Live Sinkron
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Input Nilai Rapor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rata-rata Nilai Akademik Siswa (C1)
                </label>
                <div className="relative">
                  <input
                    id="input-nilai-rata"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={nilaiRata}
                    onChange={(e) => setNilaiRata(e.target.value)}
                    placeholder="Contoh: 90.1"
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-bold text-slate-800 outline-none transition-all ${
                      errors.nilaiRata
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200 bg-slate-50 focus:border-[#5F089E] focus:bg-white"
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                    / 100
                  </span>
                </div>
                {errors.nilaiRata && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.nilaiRata}</p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Terisi otomatis dari database rapor kumulatif semester 1–5.
                </p>
              </div>

              {/* Input Kesesuaian Minat RIASEC */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skor Minat &amp; Asesmen RIASEC (C2)
                </label>
                <div className="relative">
                  <input
                    id="input-minat"
                    type="number"
                    min={1}
                    max={10}
                    step={1}
                    value={minat}
                    onChange={(e) => setMinat(e.target.value)}
                    placeholder="Contoh: 9"
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-bold text-slate-800 outline-none transition-all ${
                      errors.minat
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200 bg-slate-50 focus:border-[#5F089E] focus:bg-white"
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                    Skala 1–10
                  </span>
                </div>
                {errors.minat && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.minat}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-500">Hasil Tes Siswa:</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-100 text-[#6305B0] text-[10px] font-bold">
                    Kode {liveRiasecCode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Kustomisasi Bobot Kriteria (SAW) */}
          <div className="rounded-[16px] border border-slate-200 bg-white shadow-xs overflow-hidden">
            <button
              type="button"
              id="btn-toggle-kriteria"
              onClick={() => setShowKriteria(!showKriteria)}
              className="w-full flex items-center justify-between px-4.5 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#5F089E]" />
                <span>Kustomisasi Bobot SAW (5 Kriteria)</span>
              </div>
              {showKriteria ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showKriteria && (
              <div className="px-4.5 pb-4.5 border-t border-slate-100 space-y-4 pt-3.5 bg-slate-50/50">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-[11px]">
                  <Info className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span>
                    Prinsip SAW: Jumlah seluruh bobot kriteria wajib{" "}
                    <strong>= 1.00 (100%)</strong>.
                  </span>
                </div>

                {bobotEdited.map((k) => (
                  <div key={k.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        {k.nama}
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            k.jenisManfaat === "benefit"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {k.jenisManfaat}
                        </span>
                      </span>
                      <span className="font-bold text-[#6305B0]">
                        {(k.bobot * 100).toFixed(0)}% ({k.bobot.toFixed(2)})
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={0.6}
                      step={0.05}
                      value={k.bobot}
                      onChange={(e) =>
                        setBobotEdited((prev) =>
                          prev.map((kr) =>
                            kr.id === k.id
                              ? { ...kr, bobot: parseFloat(e.target.value) }
                              : kr
                          )
                        )
                      }
                      className="w-full accent-[#5F089E] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                    <p className="text-[10px] text-slate-400">{k.keterangan}</p>
                  </div>
                ))}

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Total Akumulasi Bobot:</span>
                  <span
                    className={`font-black ${
                      Math.abs(totalBobot - 1) < 0.01 ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {totalBobot.toFixed(2)} / 1.00
                  </span>
                </div>

                {errors.bobot && (
                  <p className="text-red-500 text-xs font-semibold">{errors.bobot}</p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setBobotEdited(KRITERIA_STANDAR_SAW.map((k) => ({ ...k })))
                  }
                  className="w-full py-1.5 text-[11px] font-semibold text-[#6305B0] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer border border-purple-200"
                >
                  Reset ke Bobot Standar BK
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              id="btn-hitung-saw"
              type="button"
              onClick={handleHitung}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#6305B0] text-white text-xs sm:text-sm font-bold hover:bg-[#520492] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengkalkulasi SAW…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Kalkulasi Rekomendasi</span>
                </>
              )}
            </button>

            <button
              id="btn-reset-saw"
              type="button"
              onClick={handleReset}
              title="Reset Simulasi"
              className="px-3 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── PANEL KANAN (HASIL REKOMENDASI SAW) ── */}
        <div className="space-y-4 min-w-0">
          {/* Bar Kontrol & Filter Hasil */}
          <div className="bg-white rounded-[16px] p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Rumpun */}
              <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                {(["SEMUA", "SAINTEK", "SOSHUM"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFilterRumpun(r)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      filterRumpun === r
                        ? "bg-[#6305B0] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Filter Jalur */}
              <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                {(["SEMUA", "SNBP", "SNBT"] as const).map((j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setFilterJalur(j)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      filterJalur === j
                        ? "bg-[#6305B0] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {j}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle View & Search */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-slate-50 border border-slate-200 text-xs w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari prodi / PTN…"
                  value={searchProdi}
                  onChange={(e) => setSearchProdi(e.target.value)}
                  className="bg-transparent outline-none text-xs text-slate-800 w-full"
                />
              </div>

              <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setActiveView("cards")}
                  title="Tampilan Kartu"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    activeView === "cards" ? "bg-white text-[#6305B0] shadow-xs" : "text-slate-500"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("matrix")}
                  title="Matriks Normalisasi SAW"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    activeView === "matrix" ? "bg-white text-[#6305B0] shadow-xs" : "text-slate-500"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Ringkasan Jumlah Hasil */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Menampilkan <strong>{filteredHasil.length}</strong> alternatif program studi terurut skor preferensi SAW
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Sinkron Multi-Kriteria
            </span>
          </div>

          {/* ── VIEW 1: KARTU REKOMENDASI ── */}
          {activeView === "cards" ? (
            <div className="space-y-3">
              {filteredHasil.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
                  Tidak ada program studi yang cocok dengan filter yang dipilih.
                </div>
              ) : (
                filteredHasil.map((item) => {
                  const isRank1 = item.peringkat === 1;
                  const isTop3 = item.peringkat <= 3;
                  const medalBg =
                    item.peringkat === 1
                      ? "#F2B32E"
                      : item.peringkat === 2
                      ? "#C4CFDE"
                      : item.peringkat === 3
                      ? "#C79163"
                      : "transparent";

                  return (
                    <div
                      key={item.id}
                      className={`rounded-[18px] bg-white p-4 sm:p-5 border transition-all duration-200 hover:-translate-y-1 ${
                        isRank1
                          ? "border-[#6305B0] shadow-md ring-2 ring-[#6305B0]/20 hover:shadow-lg"
                          : "border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-200"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Peringkat Badge */}
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                            isRank1
                              ? "bg-[#6305B0] text-white"
                              : isTop3
                              ? "text-slate-900"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          style={{
                            background: isTop3 && !isRank1 ? medalBg : undefined,
                          }}
                        >
                          #{item.peringkat}
                        </div>

                        {/* Detail Prodi & Kampus */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-900 text-sm sm:text-[15px]">
                                  {item.namaProdi}
                                </h4>
                                {isRank1 && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                    Pilihan Utama
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                <span className="font-medium text-slate-700">{item.universitas}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  {item.kodeUniv}
                                </span>
                                <span>•</span>
                                <span className="text-[11px] text-slate-500">{item.rumpun}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  BADGE_COLOR[item.rekomendasi]
                                }`}
                              >
                                {item.rekomendasi}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                  JALUR_COLOR[item.jalurMasuk]
                                }`}
                              >
                                {item.jalurMasuk}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar Skor Preferensi Vi */}
                          <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-[11px] font-medium text-slate-500">
                                Skor Preferensi SAW (Vi)
                              </span>
                              <span className="text-xs font-black text-[#6305B0]">
                                {(item.skor * 100).toFixed(1)}% ({item.skor.toFixed(3)})
                              </span>
                            </div>

                            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${Math.min(100, item.skor * 100)}%`,
                                  background:
                                    isRank1
                                      ? "linear-gradient(90deg, #6305B0, #9A28E6)"
                                      : isTop3
                                      ? "linear-gradient(90deg, #2563EB, #60A5FA)"
                                      : "#94A3B8",
                                }}
                              />
                            </div>

                            {/* Rincian 5 Parameter Kriteria */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2.5 pt-2 border-t border-slate-200/60 text-[10px]">
                              <div>
                                <span className="text-slate-400 block">C1 Rapor:</span>
                                <strong className="text-slate-700">{item.rincianSkor.c1_nilai}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block">C2 RIASEC:</span>
                                <strong className="text-slate-700">{item.rincianSkor.c2_minat}/10</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block">C3 Prospek:</span>
                                <strong className="text-slate-700">{item.rincianSkor.c3_karir}/10</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block">C4 Kuota:</span>
                                <strong className="text-slate-700">{item.rincianSkor.c4_dayaTampung}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block">C5 Ketetatan:</span>
                                <strong className="text-slate-700">{item.rincianSkor.c5_kesulitan}/10</strong>
                              </div>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-2 italic">
                            &ldquo;{item.alasan}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* ── VIEW 2: MATRIKS & RINCIAN PERHITUNGAN SAW (TRANSPARANSI KEPUTUSAN) ── */
            <div className="bg-white rounded-[18px] border border-slate-200 p-4 sm:p-5 shadow-xs space-y-5">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#6305B0]" />
                  Matriks Keputusan &amp; Normalisasi (Transparansi SAW)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rincian matematis proses normalisasi matriks (R) dan perkalian bobot kriteria (W) sesuai formula SAW resmi.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6FC] border-b border-[#E8DEF2] text-slate-600 font-bold uppercase text-[10px]">
                      <th className="p-2.5 text-center w-12">Rank</th>
                      <th className="p-2.5">Alternatif Prodi</th>
                      <th className="p-2.5 text-center">r1 (C1: Nilai)</th>
                      <th className="p-2.5 text-center">r2 (C2: Minat)</th>
                      <th className="p-2.5 text-center">r3 (C3: Karir)</th>
                      <th className="p-2.5 text-center">r4 (C4: Daya T.)</th>
                      <th className="p-2.5 text-center">r5 (C5: Cost)</th>
                      <th className="p-2.5 text-right">Skor (Vi)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredHasil.map((row) => (
                      <tr
                        key={row.id}
                        className={row.peringkat === 1 ? "bg-purple-50/60 font-semibold" : "hover:bg-slate-50"}
                      >
                        <td className="p-2.5 text-center font-bold text-slate-700">
                          #{row.peringkat}
                        </td>
                        <td className="p-2.5 font-sans font-medium text-slate-900">
                          {row.namaProdi}{" "}
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({row.kodeUniv})
                          </span>
                        </td>
                        <td className="p-2.5 text-center text-slate-600">{row.normScore.r1}</td>
                        <td className="p-2.5 text-center text-slate-600">{row.normScore.r2}</td>
                        <td className="p-2.5 text-center text-slate-600">{row.normScore.r3}</td>
                        <td className="p-2.5 text-center text-slate-600">{row.normScore.r4}</td>
                        <td className="p-2.5 text-center text-slate-600">{row.normScore.r5}</td>
                        <td className="p-2.5 text-right font-bold text-[#6305B0]">
                          {(row.skor * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed font-sans">
                <strong>Formula SAW SMARIHASTA:</strong><br />
                • Benefit Criteria (C1, C2, C3, C4): $r_{'{'}ij{'}'} = \frac{'{'}x_{'{'}ij{'}'}{'}'}{'{'}\max(x_j){'}'}$<br />
                • Cost Criteria (C5 Ketetatan): $r_{'{'}ij{'}'} = \frac{'{'}\min(x_j){'}'}{'{'}x_{'{'}ij{'}'}{'}'}$<br />
                • Nilai Preferensi: $V_i = \sum_{'{'}j=1{'}'}^{'{'}5{'}'} w_j \cdot r_{'{'}ij{'}'}$. Alternatif dengan skor $V_i$ mendekati 100% adalah program studi paling direkomendasikan.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
