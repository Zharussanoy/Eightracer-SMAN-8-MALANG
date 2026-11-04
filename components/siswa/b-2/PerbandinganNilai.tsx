"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Download, Filter, ChevronDown, Loader2, RotateCcw, AlertCircle, CheckCircle2, X } from "lucide-react";
import { benchmarkService, alumniAdminService } from "@/services/b2";
import { useUser } from "@/context/UserContext";

// ── 1. Data Profil Siswa Default (Fallback) ──
const PROFIL_SISWA = {
  nama: "Ahmad B2 Pratama",
  kelas: "Kelas XII IPA 1",
  tahunAjaran: "Tahun ajaran 2026/2027",
  rataRataNilai: 88.4,
};

// ── 2. Data KPI Hasil Perbandingan Default ──
const KPI_DATA = [
  {
    label: "ALUMNI YANG MIRIP",
    value: "12",
    note: "Dari data alumni tersedia",
  },
  {
    label: "KEMIRIPAN TERTINGGI",
    value: "92%",
    note: "Profil nilai paling mendekati",
  },
  {
    label: "RATA-RATA NILAI SAYA",
    value: "88,4",
    note: "Berdasarkan nilai akademik",
  },
];

// ── 3. Data Grafik Perbandingan per Mata Pelajaran (Fallback) ──
interface MataPelajaranBar {
  nama: string;
  nilaiku: number;
  nilaiAlumni: number;
  maxNilai: number;
}

const DATA_GRAFIK: MataPelajaranBar[] = [
  { nama: "Matematika",       nilaiku: 88, nilaiAlumni: 82, maxNilai: 100 },
  { nama: "Bahasa Indonesia", nilaiku: 91, nilaiAlumni: 87, maxNilai: 100 },
  { nama: "Bahasa Inggris",   nilaiku: 84, nilaiAlumni: 86, maxNilai: 100 },
  { nama: "Produktif TKJ",    nilaiku: 93, nilaiAlumni: 89, maxNilai: 100 },
];

// ── 4. Data Tabel Alumni dengan Nilai Serupa ──
export interface AlumniRow {
  rank: number;
  nama: string;
  nisn: string;
  nilaiRataRata: number;
  skor: number;
  programStudi: string;
  ptn?: string;
  angkatan: number;
}

const DATA_ALUMNI_FALLBACK: AlumniRow[] = [
  { rank: 1, nama: "Nadia Putri Ramadhani",  nisn: "0061284731", nilaiRataRata: 94.20, skor: 98.4, programStudi: "Teknik Informatika", ptn: "Universitas Brawijaya", angkatan: 2024 },
  { rank: 2, nama: "Rizky Aditya Pratama",   nisn: "0061284718", nilaiRataRata: 93.85, skor: 97.9, programStudi: "Teknik Informatika", ptn: "Institut Teknologi Sepuluh Nopember", angkatan: 2024 },
  { rank: 3, nama: "Salsabila Nur Aini",     nisn: "0061284792", nilaiRataRata: 92.70, skor: 96.8, programStudi: "Teknik Komputer",    ptn: "Universitas Airlangga", angkatan: 2024 },
  { rank: 4, nama: "Muhammad Farhan",        nisn: "0061284706", nilaiRataRata: 91.45, skor: 95.2, programStudi: "Teknik Komputer",    ptn: "Universitas Gadjah Mada", angkatan: 2024 },
  { rank: 5, nama: "Alya Safitri",           nisn: "0061284765", nilaiRataRata: 90.80, skor: 93.7, programStudi: "Sistem Informasi",   ptn: "Universitas Brawijaya", angkatan: 2024 },
];

const DEFAULT_PTN_LIST = [
  "Semua PTN",
  "Universitas Brawijaya",
  "Institut Teknologi Sepuluh Nopember",
  "Universitas Airlangga",
  "Universitas Gadjah Mada",
  "Universitas Indonesia",
  "Institut Teknologi Bandung",
  "Universitas Negeri Malang",
];

const DEFAULT_PRODI_LIST = [
  "Semua program studi",
  "Teknik Informatika",
  "Sistem Informasi",
  "Kedokteran",
  "Ilmu Komunikasi",
  "Teknik Komputer",
  "Manajemen",
];

// ── Warna medali ──
function MedalColor(rank: number): string {
  if (rank === 1) return "#F2B32E";
  if (rank === 2) return "#C4CFDE";
  if (rank === 3) return "#C79163";
  return "transparent";
}

// ── Komponen Utama ──
export default function PerbandinganNilai() {
  const { currentUser } = useUser();
  const [angkatan, setAngkatan] = useState("Semua angkatan");
  const [kelompokMapel, setKelompokMapel] = useState("Semua mata pelajaran");
  const [programStudi, setProgramStudi] = useState("Semua program studi");
  const [ptnTarget, setPtnTarget] = useState("Semua PTN");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Live Backend State
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [alumniList, setAlumniList] = useState<AlumniRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAlumni, setIsLoadingAlumni] = useState(false);
  const [availablePtns, setAvailablePtns] = useState<string[]>([]);
  const [availableProdis, setAvailableProdis] = useState<string[]>([]);
  const [availableAngkatan, setAvailableAngkatan] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // ── Ambil Live Benchmark Siswa vs Alumni (/v1/siswa/benchmark-alumni) ──
  const fetchBenchmark = async (prodi?: string, ptn?: string) => {
    try {
      setIsLoading(true);
      setNotification(null);

      // Jika user sedang login sebagai admin/guru, otomatis ambil siswa_id pertama agar tidak 404
      const siswaIdParam = currentUser?.role === "admin" || currentUser?.role === "guru" ? 1 : undefined;

      const res = await benchmarkService.compareWithAlumni({
        nama_prodi: prodi && prodi !== "Semua program studi" ? prodi : undefined,
        ptn: ptn && ptn !== "Semua PTN" ? ptn : undefined,
        siswa_id: siswaIdParam,
      });

      if (res?.data) {
        setBenchmarkData(res.data);
        const total = res.data.benchmark_alumni?.total_alumni_pembanding ?? 0;
        const targetProdi = res.data.target_pencarian?.prodi || (prodi && prodi !== "Semua program studi" ? prodi : "Semua Prodi");
        const targetPtn = res.data.target_pencarian?.ptn || (ptn && ptn !== "Semua PTN" ? ptn : "Semua PTN");
        setNotification({
          type: "success",
          message: `Analisis perbandingan live berhasil dihitung! Ditemukan ${total} alumni pembanding untuk target "${targetProdi}" di "${targetPtn}".`,
        });
      }
    } catch (err: any) {
      console.warn("Backend benchmark alumni (fallback):", err?.message);
      setNotification({
        type: "error",
        message: err?.message || "Gagal memuat analisis perbandingan dari backend.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Ambil Live Data Alumni Pembanding (/v1/admin/alumni atau /alumni) ──
  const fetchAlumniList = async () => {
    setIsLoadingAlumni(true);
    try {
      let rows: AlumniRow[] = [];
      const ptnsSet = new Set<string>();
      const prodisSet = new Set<string>();
      const angkatanSet = new Set<string>();

      try {
        const resAdmin = await alumniAdminService.getAllAdmin();
        const items = resAdmin?.data?.data || [];
        if (Array.isArray(items) && items.length > 0) {
          rows = items.map((item, idx) => {
            const nama = item.siswa?.nama_lengkap || item.nama || `Alumni #${item.id}`;
            const nisn = item.siswa?.nisn || item.nisn || `00${item.id}123456`;
            const nilai = Number(item.nilai_rapor_pendaftaran || item.nilai_rapor || 90);
            const skor = Number(item.skor_utbk) || Number((nilai * 1.05).toFixed(1));
            const prodi = item.program_studi || item.prodi || "Teknik Informatika";
            const ptn = item.perguruan_tinggi?.nama_pt || item.univ || "Universitas Brawijaya";
            const thn = item.buku_alumni?.tahun_lulusan || item.siswa?.tahun_lulus || item.tahun_lulus || "2024";

            if (ptn) ptnsSet.add(ptn);
            if (prodi) prodisSet.add(prodi);
            if (thn) angkatanSet.add(String(thn));

            return {
              rank: idx + 1,
              nama,
              nisn,
              nilaiRataRata: nilai,
              skor,
              programStudi: prodi,
              ptn,
              angkatan: parseInt(String(thn)) || 2024,
            };
          });
        }
      } catch {
        // Fallback ke /alumni publik jika endpoint admin ditolak
        const resPub = await alumniAdminService.getAllPublic();
        const items = resPub?.data || [];
        if (Array.isArray(items) && items.length > 0) {
          rows = items.map((item, idx) => {
            const nama = item.nama || `Alumni #${item.id}`;
            const nisn = item.nisn || `00${item.id}123456`;
            const nilai = Number(item.nilai_rapor || 90);
            const skor = Number(item.skor_utbk) || Number((nilai * 1.05).toFixed(1));
            const prodi = item.prodi || item.program_studi || "Teknik Informatika";
            const ptn = item.univ || item.perguruan_tinggi?.nama_pt || "Universitas Brawijaya";
            const thn = item.tahun_lulus || "2024";

            if (ptn) ptnsSet.add(ptn);
            if (prodi) prodisSet.add(prodi);
            if (thn) angkatanSet.add(String(thn));

            return {
              rank: idx + 1,
              nama,
              nisn,
              nilaiRataRata: nilai,
              skor,
              programStudi: prodi,
              ptn,
              angkatan: parseInt(String(thn)) || 2024,
            };
          });
        }
      }

      if (rows.length > 0) {
        rows.sort((a, b) => b.nilaiRataRata - a.nilaiRataRata);
        rows.forEach((r, i) => (r.rank = i + 1));
        setAlumniList(rows);
        if (ptnsSet.size > 0) setAvailablePtns(Array.from(ptnsSet));
        if (prodisSet.size > 0) setAvailableProdis(Array.from(prodisSet));
        if (angkatanSet.size > 0) setAvailableAngkatan(Array.from(angkatanSet).sort((a, b) => b.localeCompare(a)));
      } else {
        setAlumniList(DATA_ALUMNI_FALLBACK);
      }
    } catch (e) {
      console.warn("Backend alumni fallback:", e);
      setAlumniList(DATA_ALUMNI_FALLBACK);
    } finally {
      setIsLoadingAlumni(false);
    }
  };

  useEffect(() => {
    fetchBenchmark(programStudi, ptnTarget);
    fetchAlumniList();
  }, [currentUser]);

  // Gabungan opsi PTN & Prodi untuk dropdown filter
  const allPtns = useMemo(() => {
    const set = new Set([...DEFAULT_PTN_LIST, ...availablePtns]);
    return Array.from(set);
  }, [availablePtns]);

  const allProdis = useMemo(() => {
    const set = new Set([...DEFAULT_PRODI_LIST, ...availableProdis]);
    return Array.from(set);
  }, [availableProdis]);

  const allAngkatan = useMemo(() => {
    const base = ["Semua angkatan", "2024", "2023", "2022"];
    const set = new Set([...base, ...availableAngkatan]);
    return Array.from(set);
  }, [availableAngkatan]);

  // ── Filter Interaktif Data Alumni ──
  const effectiveAlumni = alumniList.length > 0 ? alumniList : DATA_ALUMNI_FALLBACK;

  const filteredAlumni = useMemo(() => {
    return effectiveAlumni.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        a.nama.toLowerCase().includes(q) ||
        a.nisn.includes(q) ||
        (a.ptn && a.ptn.toLowerCase().includes(q)) ||
        a.programStudi.toLowerCase().includes(q);

      const matchesProdi =
        programStudi === "Semua program studi" ||
        a.programStudi.toLowerCase().includes(programStudi.toLowerCase());

      const matchesPtn =
        ptnTarget === "Semua PTN" ||
        (a.ptn && a.ptn.toLowerCase().includes(ptnTarget.toLowerCase()));

      const matchesAngkatan =
        angkatan === "Semua angkatan" ||
        String(a.angkatan) === String(angkatan);

      return matchesSearch && matchesProdi && matchesPtn && matchesAngkatan;
    });
  }, [effectiveAlumni, searchQuery, programStudi, ptnTarget, angkatan]);

  // ── Pagination Interaktif ──
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredAlumni.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAlumni = filteredAlumni.slice(startIndex, startIndex + pageSize);

  // ── Unduh Data CSV ──
  const handleDownloadCsv = () => {
    if (filteredAlumni.length === 0) {
      alert("Tidak ada data alumni untuk diunduh.");
      return;
    }
    const headers = ["Rank", "Nama Siswa", "NISN", "Nilai Rata-Rata", "Skor", "Program Studi", "PTN", "Angkatan"];
    const csvRows = [
      headers.join(","),
      ...filteredAlumni.map((r) =>
        [
          r.rank,
          `"${r.nama.replace(/"/g, '""')}"`,
          `"${r.nisn}"`,
          r.nilaiRataRata.toFixed(2),
          r.skor.toFixed(1),
          `"${r.programStudi.replace(/"/g, '""')}"`,
          `"${(r.ptn || "-").replace(/"/g, '""')}"`,
          r.angkatan,
        ].join(",")
      ),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `benchmark_alumni_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setAngkatan("Semua angkatan");
    setKelompokMapel("Semua mata pelajaran");
    setProgramStudi("Semua program studi");
    setPtnTarget("Semua PTN");
    setSearchQuery("");
    setCurrentPage(1);
    fetchBenchmark("Semua program studi", "Semua PTN");
  };

  // ── KPI Items ──
  const kpiItems = [
    {
      label: "TOTAL ALUMNI PEMBANDING",
      value: benchmarkData?.benchmark_alumni?.total_alumni_pembanding !== undefined
        ? `${benchmarkData.benchmark_alumni.total_alumni_pembanding} Alumni`
        : `${filteredAlumni.length} Alumni`,
      note: `Target: ${benchmarkData?.target_pencarian?.prodi ?? programStudi} (${benchmarkData?.target_pencarian?.ptn ?? ptnTarget})`,
    },
    {
      label: "ESTIMASI PELUANG LOLOS",
      value: benchmarkData?.gap_analisis?.estimasi_peluang
        ? `${benchmarkData.gap_analisis.estimasi_peluang} (${benchmarkData.gap_analisis.estimasi_peluang_persen}%)`
        : KPI_DATA[1].value,
      note: "Berdasarkan gap nilai rapor kumulatif",
    },
    {
      label: "RATA-RATA NILAI SAYA",
      value: benchmarkData?.siswa?.rata_rata_rapor !== undefined
        ? Number(benchmarkData.siswa.rata_rata_rapor).toFixed(1).replace(".", ",")
        : KPI_DATA[2].value,
      note: benchmarkData?.benchmark_alumni?.rata_rata_nilai_alumni
        ? `Rata-rata alumni: ${benchmarkData.benchmark_alumni.rata_rata_nilai_alumni}`
        : KPI_DATA[2].note,
    },
  ];

  // ── Data Grafik Rincian Mata Pelajaran ──
  const grafikItems: MataPelajaranBar[] =
    benchmarkData?.gap_analisis?.rincian_per_mapel &&
    benchmarkData.gap_analisis.rincian_per_mapel.length > 0
      ? benchmarkData.gap_analisis.rincian_per_mapel.map((m: any) => ({
          nama: m.nama_mapel,
          nilaiku: Number(m.nilai_siswa) || 0,
          nilaiAlumni: Number(m.rata_rata_alumni) || 0,
          maxNilai: 100,
        }))
      : DATA_GRAFIK;

  return (
    <div
      className="flex flex-col gap-6 w-full max-w-[1360px] mx-auto"
      style={{ fontFamily: "Inter, sans-serif", color: "#1F1729" }}
    >
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-[13px] border animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-[#DCFCE7] border-[#86EFAC] text-[#148557]"
              : "bg-[#FEE4E2] border-[#FECDCA] text-[#D92D20]"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── ROW 1: Profil + Atur Perbandingan ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 items-stretch">
        {/* Kartu Profil Siswa */}
        <div
          className="rounded-[12px] p-5 sm:p-6 flex flex-col justify-between"
          style={{ background: "#F0E5F5", minHeight: 180 }}
        >
          <div>
            <p
              className="text-[12px] font-semibold uppercase tracking-wider mb-2.5"
              style={{ color: "#6E6678" }}
            >
              PROFIL AKADEMIK SAYA
            </p>
            <h2
              className="font-bold text-[22px] leading-tight mb-1.5"
              style={{ color: "#1F1729", fontFamily: "Inter, sans-serif" }}
            >
              {benchmarkData?.siswa?.nama_lengkap || PROFIL_SISWA.nama}
            </h2>
            <p className="text-[12px]" style={{ color: "#6E6678" }}>
              {benchmarkData?.siswa?.nisn ? `NISN: ${benchmarkData.siswa.nisn}` : PROFIL_SISWA.kelas}&nbsp;•&nbsp;
              {benchmarkData?.siswa?.peringkat_eligibilitas
                ? `Peringkat #${benchmarkData.siswa.peringkat_eligibilitas} (${benchmarkData.siswa.status_eligible || 'Eligible'})`
                : PROFIL_SISWA.tahunAjaran}
            </p>
          </div>
          <div
            className="mt-4 rounded-[8px] px-3.5 py-2 inline-flex flex-col"
            style={{ background: "#F0E6F7", width: 170 }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#6E6678" }}
            >
              RATA-RATA NILAI
            </span>
            <span
              className="font-bold text-[20px] leading-tight"
              style={{ color: "#6200A8" }}
            >
              {benchmarkData?.siswa?.rata_rata_rapor !== undefined
                ? Number(benchmarkData.siswa.rata_rata_rapor).toFixed(1).replace(".", ",")
                : PROFIL_SISWA.rataRataNilai.toFixed(1).replace(".", ",")}
            </span>
          </div>
        </div>

        {/* Kartu Atur Perbandingan */}
        <div
          className="rounded-[12px] p-5 sm:p-6 flex flex-col justify-between"
          style={{ background: "#F0E5F5" }}
        >
          <div className="flex items-center justify-between mb-3.5">
            <p className="font-bold text-[18px]" style={{ color: "#1F1729" }}>
              Atur Perbandingan
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-[#6200A8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            {/* Dropdown Target PTN */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#6E6678" }}
              >
                TARGET PTN
              </label>
              <div
                className="relative flex items-center rounded-[7px] px-3 h-10 cursor-pointer"
                style={{ background: "#FCFCFF", border: "1px solid #E8E3ED" }}
              >
                <span className="text-[12px] font-medium flex-1 truncate" style={{ color: "#1F1729" }}>
                  {ptnTarget}
                </span>
                <ChevronDown className="w-4 h-4 ml-1 shrink-0" style={{ color: "#6E6678" }} />
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  value={ptnTarget}
                  onChange={(e) => {
                    setPtnTarget(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {allPtns.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dropdown Program Studi */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#6E6678" }}
              >
                PROGRAM STUDI
              </label>
              <div
                className="relative flex items-center rounded-[7px] px-3 h-10 cursor-pointer"
                style={{ background: "#FCFCFF", border: "1px solid #E8E3ED" }}
              >
                <span className="text-[12px] font-medium flex-1 truncate" style={{ color: "#1F1729" }}>
                  {programStudi}
                </span>
                <ChevronDown className="w-4 h-4 ml-1 shrink-0" style={{ color: "#6E6678" }} />
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  value={programStudi}
                  onChange={(e) => {
                    setProgramStudi(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {allProdis.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dropdown Angkatan */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#6E6678" }}
              >
                ANGKATAN ALUMNI
              </label>
              <div
                className="relative flex items-center rounded-[7px] px-3 h-10 cursor-pointer"
                style={{
                  background: "#FCFCFF",
                  border: "1px solid #E8E3ED",
                }}
              >
                <span className="text-[12px] font-medium flex-1 truncate" style={{ color: "#1F1729" }}>
                  {angkatan}
                </span>
                <ChevronDown className="w-4 h-4 ml-1 shrink-0" style={{ color: "#6E6678" }} />
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  value={angkatan}
                  onChange={(e) => {
                    setAngkatan(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {allAngkatan.map((th) => (
                    <option key={th} value={th}>
                      {th}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tombol Bandingkan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider opacity-0">
                AKSI
              </label>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => fetchBenchmark(programStudi, ptnTarget)}
                className="h-10 px-5 rounded-[7px] font-semibold text-[12px] text-white shrink-0 transition-opacity hover:opacity-90 active:opacity-80 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                style={{ background: "#6200A8" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Bandingkan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ROW 2: KPI Cards ─── */}
      <div>
        <h2
          className="font-bold text-[22px] mb-3.5"
          style={{ color: "#1F1729", fontFamily: "Inter, sans-serif" }}
        >
          Hasil Perbandingan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpiItems.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-[11px] p-5 sm:p-6"
              style={{ background: "#F0E5F5" }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#6E6678" }}
              >
                {kpi.label}
              </p>
              <p
                className="font-bold text-[26px] leading-tight mb-1"
                style={{ color: "#1F1729" }}
              >
                {kpi.value}
              </p>
              <p className="text-[11px]" style={{ color: "#6E6678" }}>
                {kpi.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ROW 3: Grafik Perbandingan per Mata Pelajaran ─── */}
      <div
        className="rounded-[12px] p-6"
        style={{ background: "#F0E5F5" }}
      >
        <p
          className="font-bold text-[18px] mb-1"
          style={{ color: "#1F1729" }}
        >
          Perbandingan Nilai per Mata Pelajaran
        </p>
        <p className="text-[12px] mb-4" style={{ color: "#6E6678" }}>
          Nilaiku dibandingkan dengan rata-rata alumni terpilih.
        </p>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-2.5 rounded-[2px]"
              style={{ background: "#6200A8" }}
            />
            <span className="text-[11px] font-medium" style={{ color: "#6E6678" }}>
              Nilai saya
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-2.5 rounded-[2px]"
              style={{ background: "#B8A1D1" }}
            />
            <span className="text-[11px] font-medium" style={{ color: "#6E6678" }}>
              Rata-rata alumni
            </span>
          </div>
        </div>

        {/* Bar rows */}
        <div className="flex flex-col gap-5">
          {grafikItems.map((item) => {
            const pctKu = Math.min(100, (item.nilaiku / item.maxNilai) * 100);
            const pctAlumni = Math.min(100, (item.nilaiAlumni / item.maxNilai) * 100);
            return (
              <div key={item.nama} className="flex items-start gap-4">
                {/* Label Mata Pelajaran */}
                <div
                  className="text-[13px] font-medium shrink-0 pt-0.5"
                  style={{ color: "#6E6678", width: 150 }}
                >
                  {item.nama}
                </div>

                {/* Bars */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-2.5 rounded-[4px] bg-white/50 overflow-hidden">
                      <div
                        className="h-full rounded-[4px] transition-all duration-700"
                        style={{
                          width: `${pctKu}%`,
                          background: "#6200A8",
                        }}
                      />
                    </div>
                    <span
                      className="text-[11px] font-bold w-6 text-right"
                      style={{ color: "#1F1729" }}
                    >
                      {item.nilaiku}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-2.5 rounded-[4px] bg-white/50 overflow-hidden">
                      <div
                        className="h-full rounded-[4px] transition-all duration-700"
                        style={{
                          width: `${pctAlumni}%`,
                          background: "#B8A1D1",
                        }}
                      />
                    </div>
                    <span
                      className="text-[11px] font-medium w-6 text-right"
                      style={{ color: "#6E6678" }}
                    >
                      {item.nilaiAlumni}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── ROW 4: Tabel Alumni dengan Nilai Serupa ─── */}
      <div
        className="rounded-[12px] overflow-hidden"
        style={{
          background: "#F0E6F5",
          border: "1.5px solid #6305B0",
        }}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5 border-b border-[#DECFE8]">
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-bold text-[18px]" style={{ color: "#1F1729" }}>
              Alumni dengan Nilai Serupa
            </h3>
            <p className="text-[11px] text-[#6E6678]">
              {isLoadingAlumni ? "Memuat data alumni dari database..." : `Tersedia ${effectiveAlumni.length} data alumni riil di sistem`}
            </p>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3.5 h-10 rounded-[9px] flex-1 min-w-[190px] max-w-[280px]"
            style={{ background: "#FFFFFF", border: "1px solid #DECFE8" }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: "#6E6B78" }} />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau prodi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-transparent outline-none text-[12px]"
              style={{ color: "#1F1729", fontFamily: "Inter, sans-serif" }}
            />
          </div>

          {/* Filter Angkatan Dropdown */}
          <div
            className="relative flex items-center rounded-[9px] px-3 h-10 cursor-pointer shrink-0"
            style={{
              background: "#FFFFFF",
              border: "1px solid #6305B0",
              color: "#6305B0",
            }}
          >
            <span className="text-[12px] font-semibold max-w-[130px] truncate">{angkatan}</span>
            <ChevronDown className="w-4 h-4 ml-1.5 shrink-0" />
            <select
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
              value={angkatan}
              onChange={(e) => {
                setAngkatan(e.target.value);
                setCurrentPage(1);
              }}
            >
              {allAngkatan.map((th) => (
                <option key={th} value={th}>
                  {th}
                </option>
              ))}
            </select>
          </div>

          {/* Filter PTN Dropdown */}
          <div
            className="relative flex items-center rounded-[9px] px-3 h-10 cursor-pointer shrink-0"
            style={{
              background: "#FFFFFF",
              border: "1px solid #6305B0",
              color: "#6305B0",
            }}
          >
            <Filter className="w-4 h-4 mr-1.5 shrink-0" />
            <span className="text-[12px] font-semibold max-w-[140px] truncate">{ptnTarget}</span>
            <ChevronDown className="w-4 h-4 ml-1 shrink-0" />
            <select
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
              value={ptnTarget}
              onChange={(e) => {
                setPtnTarget(e.target.value);
                setCurrentPage(1);
              }}
            >
              {allPtns.map((ptn) => (
                <option key={ptn} value={ptn}>
                  {ptn}
                </option>
              ))}
            </select>
          </div>

          {/* Unduh CSV */}
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="h-10 px-4 rounded-[9px] font-semibold text-[12px] flex items-center gap-1.5 shrink-0 text-white hover:opacity-90 transition-opacity cursor-pointer"
            style={{ background: "#6305B0" }}
          >
            <Download className="w-4 h-4" />
            Unduh CSV
          </button>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  RANK
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  NAMA SISWA
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  NISN
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  NILAI RATA-RATA
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  SKOR
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  PROGRAM STUDI & PTN
                </th>
                <th
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "#FFFFFF", color: "#6E6B78" }}
                >
                  ANGKATAN
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlumni.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#6E6678]">
                    Tidak ada data alumni yang cocok dengan kriteria pencarian / filter yang dipilih.
                  </td>
                </tr>
              ) : (
                paginatedAlumni.map((row, idx) => {
                  const isShade = idx % 2 === 1;
                  const medalColor = MedalColor(row.rank);
                  const isTop3 = row.rank <= 3;
                  return (
                    <tr
                      key={`${row.nisn}-${row.rank}`}
                      style={{ background: isShade ? "#F7F0FA" : "transparent" }}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-bold text-[13px]"
                            style={{
                              color: isTop3 ? "#6305B0" : "#6E6B78",
                            }}
                          >
                            {String(row.rank).padStart(2, "0")}
                          </span>
                          {isTop3 && (
                            <span
                              className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                              style={{ background: medalColor }}
                            >
                              {row.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Nama */}
                      <td
                        className="px-4 py-3.5 text-[13px] font-medium"
                        style={{ color: "#14141C" }}
                      >
                        {row.nama}
                      </td>

                      {/* NISN */}
                      <td
                        className="px-4 py-3.5 text-[12px]"
                        style={{ color: "#6E6B78" }}
                      >
                        {row.nisn}
                      </td>

                      {/* Nilai Rata-Rata */}
                      <td
                        className="px-4 py-3.5 text-[13px] font-medium"
                        style={{ color: "#14141C" }}
                      >
                        {row.nilaiRataRata.toFixed(2).replace(".", ",")}
                      </td>

                      {/* Skor */}
                      <td
                        className="px-4 py-3.5 text-[13px] font-semibold"
                        style={{ color: "#6305B0" }}
                      >
                        {row.skor.toFixed(1).replace(".", ",")}
                      </td>

                      {/* Program Studi & PTN */}
                      <td className="px-4 py-3.5 text-[12px]">
                        <span className="font-medium text-[#1F1729] block">
                          {row.programStudi}
                        </span>
                        {row.ptn && (
                          <span className="text-[11px] font-medium block text-[#6200A8]">
                            {row.ptn}
                          </span>
                        )}
                      </td>

                      {/* Angkatan */}
                      <td
                        className="px-4 py-3.5 text-[13px] font-semibold"
                        style={{ color: "#14141C" }}
                      >
                        {row.angkatan}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 border-t"
          style={{ borderColor: "#DECFE8" }}
        >
          <span className="text-[12px] font-medium" style={{ color: "#6E6678" }}>
            Menampilkan {paginatedAlumni.length} dari {filteredAlumni.length} alumni terfilter (Total dataset: {effectiveAlumni.length} alumni)
          </span>

          {/* Pagination */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded flex items-center justify-center text-[13px] font-bold disabled:opacity-40 cursor-pointer"
              style={{ color: "#6305B0" }}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className="w-7 h-7 rounded text-[12px] font-semibold transition-colors cursor-pointer"
                style={{
                  background: currentPage === p ? "#6305B0" : "transparent",
                  color: currentPage === p ? "#FFFFFF" : "#6305B0",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded flex items-center justify-center text-[13px] font-bold disabled:opacity-40 cursor-pointer"
              style={{ color: "#6305B0" }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

