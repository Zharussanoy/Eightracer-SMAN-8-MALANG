"use client";

import Footer from "@/components/shared/Footer";
import SiswaTabNav, { SiswaTab } from "@/components/siswa/SiswaTabNav";
import AkademikHeaderCard from "@/components/siswa/b-2/AkademikHeaderCard";
import AkademikTablePanel from "@/components/siswa/b-2/AkademikTablePanel";
import AkademikTrendPanel from "@/components/siswa/b-2/AkademikTrendPanel";
import BiodataFormCard from "@/components/siswa/b-2/BiodataFormCard";
import BiodataProfileCard from "@/components/siswa/b-2/BiodataProfileCard";
import CatatanDetailPanel from "@/components/siswa/b-2/CatatanDetailPanel";
import CatatanTablePanel from "@/components/siswa/b-2/CatatanTablePanel";
import {
  DashboardChartsWrapper
} from "@/components/siswa/b-2/DashboardCards";
import KarakteristikMetricsCard from "@/components/siswa/b-2/KarakteristikMetricsCard";
import KarakteristikProfileCard from "@/components/siswa/b-2/KarakteristikProfileCard";
import RekomProdiSAW from "@/components/siswa/b-2/RekomProdiSAW";
import RankingEligibilitas from "@/components/siswa/b-2/RankingEligibilitas";
import PerbandinganNilai from "@/components/siswa/b-2/PerbandinganNilai";
import SiswaProfileCard from "@/components/siswa/b-2/SiswaProfileCard";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { akademikService, asesmenService } from "@/services/b2";
import { Plus, X, CheckCircle2, Loader2 } from "lucide-react";
import { AkademikMapelRow } from "@/components/siswa/b-2/AkademikTablePanel";
import { TrendItem } from "@/components/siswa/b-2/AkademikTrendPanel";

import {
  BiodataSiswa,
  CatatanSiswaItem,
  INITIAL_BIODATA_SISWA,
  KarakteristikMetric,
  KarakteristikProfileSummary,
  METRIK_KARAKTERISTIK,
  MOCK_CATATAN_LIST,
  NILAI_AKADEMIK,
  OVERALL_SKOR,
  RECAP_ASESMEN,
} from "@/components/siswa/b-2/mockDataSiswa";

function Breadcrumb({ tab }: { tab: SiswaTab }) {
  let displayTab: string = tab;
  if (tab === "Karakteristik" || tab === "Akademik") {
    displayTab = "Akademik";
  } else if (tab === "Catatan") {
    displayTab = "Catatan";
  } else if (tab === "Ranking Eligibilitas") {
    displayTab = "Ranking Eligibilitas";
  } else if (tab === "Perbandingan Nilai") {
    displayTab = "Perbandingan Nilai";
  }
  return (
    <p
      className="text-xs text-[#667085] mb-1.5"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      Beranda/B2/{displayTab}
    </p>
  );
}


function ComingSoon({ label }: { label: string }) {
  return (
    <div className="min-h-72 rounded-[24px] border-2 border-dashed border-[#5F089E]/30 bg-[#EFE6F5]/40 flex flex-col items-center justify-center gap-3 p-8 text-center">
      <p
        className="font-bold text-slate-600"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {label}
      </p>
      <p
        className="text-sm text-slate-400"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        Halaman ini belum tersedia pada tahap ini.
      </p>
    </div>
  );
}

export default function SiswaDashboardPage() {

  const [activeTab, setActiveTab] = useState<SiswaTab>("Dashboard");

  const { currentUser, currentPreset } = useUser();
  const [liveMapelList, setLiveMapelList] = useState<AkademikMapelRow[]>([]);
  const [liveTrends, setLiveTrends] = useState<TrendItem[]>([]);
  const [liveSummaryCards, setLiveSummaryCards] = useState<
    Array<{ label: string; value: string; detail: string }>
  >([]);
  const [liveKarakteristikSummary, setLiveKarakteristikSummary] = useState<Partial<KarakteristikProfileSummary>>({});
  const [liveMetrics, setLiveMetrics] = useState<KarakteristikMetric[]>([]);
  const [isLoadingAkademik, setIsLoadingAkademik] = useState(false);

  const [biodata, setBiodata] = useState<BiodataSiswa>(INITIAL_BIODATA_SISWA);
  const [isEditingBiodata, setIsEditingBiodata] = useState(false);

  const [catatanList, setCatatanList] =
    useState<CatatanSiswaItem[]>(MOCK_CATATAN_LIST);
  const [selectedCatatanId, setSelectedCatatanId] = useState<string>("1001");
  const [catatanSearch, setCatatanSearch] = useState<string>("");
  const [catatanPage, setCatatanPage] = useState<number>(1);
  const [showTambahCatatanModal, setShowTambahCatatanModal] = useState(false);
  const [tambahSemester, setTambahSemester] = useState<number>(1);
  const [tambahJenis, setTambahJenis] = useState<string>("Kedisiplinan");
  const [tambahPoin, setTambahPoin] = useState<string>("+5");
  const [tambahDeskripsi, setTambahDeskripsi] = useState<string>("");
  const [isSavingNewCatatan, setIsSavingNewCatatan] = useState<boolean>(false);
  const [catatanActionFeedback, setCatatanActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingAkademik(true);

    const isStudent = currentPreset === "siswa_aktif" || currentUser.role === "siswa";
    const queryParams = isStudent ? undefined : { siswa_id: 1 };

    Promise.all([
      akademikService.getAkademik(queryParams).catch(() => null),
      asesmenService.getAsesmen(queryParams).catch(() => null),
    ])
      .then(([resAkademik, resAsesmen]) => {
        if (!isMounted) return;

        if (resAkademik?.data) {
          const { siswa, nilai_rapor, prestasi } = resAkademik.data;

          if (siswa) {
            setBiodata((prev) => ({
              ...prev,
              nama: siswa.nama_lengkap || prev.nama,
              nisn: siswa.nisn || prev.nisn,
            }));
          }

          if (Array.isArray(nilai_rapor) && nilai_rapor.length > 0) {
            const mapelMap = new Map<string, any>();
            const semTotals: Record<number, { sum: number; count: number }> = {
              1: { sum: 0, count: 0 },
              2: { sum: 0, count: 0 },
              3: { sum: 0, count: 0 },
            };

            nilai_rapor.forEach((nr: any) => {
              const name =
                nr.mata_pelajaran?.nama_mata_pelajaran ||
                `Mata Pelajaran #${nr.mata_pelajaran_id}`;
              const scoreNum = parseFloat(nr.nilai_akhir);

              if (!mapelMap.has(name)) {
                mapelMap.set(name, {
                  id: String(nr.mata_pelajaran_id || name),
                  mataPelajaran: name,
                  sem1: "-",
                  sem2: "-",
                  sem3: "-",
                  scores: [] as number[],
                });
              }

              const item = mapelMap.get(name)!;
              if (nr.semester === 1) item.sem1 = scoreNum;
              if (nr.semester === 2) item.sem2 = scoreNum;
              if (nr.semester === 3) item.sem3 = scoreNum;

              if (!isNaN(scoreNum)) {
                item.scores.push(scoreNum);
                if (semTotals[nr.semester]) {
                  semTotals[nr.semester].sum += scoreNum;
                  semTotals[nr.semester].count += 1;
                }
              }
            });

            const mappedRows: AkademikMapelRow[] = Array.from(mapelMap.values()).map(
              (m) => {
                const avg =
                  m.scores.length > 0
                    ? (m.scores.reduce((a: number, b: number) => a + b, 0) / m.scores.length).toFixed(1)
                    : "-";
                const avgNum = parseFloat(avg);
                return {
                  id: m.id,
                  mataPelajaran: m.mataPelajaran,
                  sem1: m.sem1,
                  sem2: m.sem2,
                  sem3: m.sem3,
                  rataRata: avg,
                  predikat: !isNaN(avgNum) && avgNum >= 85 ? "A" : "B",
                };
              }
            );

            setLiveMapelList(mappedRows);

            const calculatedTrends: TrendItem[] = [1, 2, 3].map((s) => ({
              semester: `Semester ${s}`,
              nilai:
                semTotals[s].count > 0
                  ? Math.round(semTotals[s].sum / semTotals[s].count)
                  : 88,
            }));
            setLiveTrends(calculatedTrends);

            const allScores = nilai_rapor
              .map((nr: any) => parseFloat(nr.nilai_akhir))
              .filter((n: number) => !isNaN(n));
            const overallAvg =
              allScores.length > 0
                ? (allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length).toFixed(1)
                : "88.6";

            const tkaVal = siswa?.nilai_tka
              ? Number(siswa.nilai_tka).toFixed(1)
              : "89.0";
            const totalPrestasi = Array.isArray(prestasi) ? String(prestasi.length) : "0";

            setLiveSummaryCards([
              {
                label: "RATA-RATA RAPOR",
                value: overallAvg,
                detail: "Dari seluruh mata pelajaran",
              },
              {
                label: "NILAI TKA",
                value: tkaVal,
                detail: "Skor Tes Kemampuan Akademik",
              },
              {
                label: "TOTAL MAPEL",
                value: String(mapelMap.size),
                detail: "Mata pelajaran terdata",
              },
              {
                label: "PRESTASI SISWA",
                value: totalPrestasi,
                detail: "Capaian terverifikasi",
              },
            ]);
          }

          // Sinkronisasi Catatan Karakter jika ada data dari backend
          if (Array.isArray(resAkademik.data.catatan_karakter) && resAkademik.data.catatan_karakter.length > 0) {
            const liveCatatans: CatatanSiswaItem[] = resAkademik.data.catatan_karakter.map((ck: any) => ({
              id: String(ck.id),
              idCatatan: String(ck.id),
              idSiswa: String(ck.siswa_id || "1"),
              semester: ck.semester || 1,
              jenisCatatan: ck.jenis_catatan || "Kedisiplinan",
              poinDisiplin: ck.poin_disiplin ? `+${ck.poin_disiplin}` : "+5",
              deskripsiCatatan: ck.deskripsi || "-",
              tanggalPencatatan: ck.tanggal_pencatatan ? ck.tanggal_pencatatan.slice(0, 10) : "2026-10-10",
              tanggalLengkap: ck.tanggal_pencatatan || "10 Oktober 2026",
              kategoriSubtitle: "Karakter",
              tanggal: ck.tanggal_pencatatan ? ck.tanggal_pencatatan.slice(0, 10) : "10 Okt 2026",
              kategori: ck.jenis_catatan || "Kedisiplinan",
              judul: ck.jenis_catatan || "Catatan Siswa",
              ringkasan: ck.deskripsi || "-",
              pencatat: "Wali Kelas",
              pencatatLengkap: "Wali Kelas · SMAN 8 Malang",
              status: "Selesai",
            }));
            setCatatanList(liveCatatans);
            if (liveCatatans[0]) {
              setSelectedCatatanId(liveCatatans[0].id);
            }
          }
        }

        if (resAsesmen?.data) {
          const { karakteristik, riasec, multiple_intelligence, rekomendasi_prodi } = resAsesmen.data;

          if (karakteristik) {
            setLiveKarakteristikSummary((prev) => ({
              ...prev,
              ringkasan: karakteristik.tipe_kepribadian
                ? `Tipe Kepribadian: ${karakteristik.tipe_kepribadian}. Kecerdasan Dominan: ${karakteristik.kecerdasan_majemuk_dominan || "Logis-Matematis"}. Kode RIASEC: ${karakteristik.kode_riasec || "-"}`
                : prev.ringkasan,
              pembaruanTerakhir: karakteristik.tanggal_asesmen ? karakteristik.tanggal_asesmen.slice(0, 10) : prev.pembaruanTerakhir,
            }));
          }

          // Menjaga agar 5 baris metrik karakteristik selalu lengkap dan seimbang sesuai UI/UX Figma (Gambar 1)
          const updatedMetrics: KarakteristikMetric[] = METRIK_KARAKTERISTIK.map((m) => ({ ...m }));

          if (riasec) {
            const riasecScores = [
              riasec.realistic_score,
              riasec.investigative_score,
              riasec.artistic_score,
              riasec.social_score,
              riasec.enterprising_score,
              riasec.conventional_score,
            ].filter((s) => s !== null && s !== undefined).map(Number);

            const maxRiasec = riasecScores.length > 0 ? Math.max(...riasecScores) : 92;
            const idxRiasec = updatedMetrics.findIndex((m) => m.kategori.toLowerCase().includes("riasec"));
            if (idxRiasec !== -1) {
              updatedMetrics[idxRiasec] = {
                kategori: "Riasec",
                persentase: maxRiasec,
              };
            }
          }

          if (Array.isArray(multiple_intelligence) && multiple_intelligence.length > 0) {
            const validScores = multiple_intelligence
              .map((mi) => Number(mi.skor))
              .filter((s) => !isNaN(s) && s > 0);
            const avgMi = validScores.length > 0
              ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
              : 88;
            const idxKm = updatedMetrics.findIndex((m) => m.kategori.toLowerCase().includes("kecerdasan"));
            if (idxKm !== -1) {
              updatedMetrics[idxKm] = {
                kategori: "Kecerdasan Majemuk",
                persentase: avgMi,
              };
            }
          }

          setLiveMetrics(updatedMetrics);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingAkademik(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPreset, currentUser.role]);

  const selectedCatatan =
    catatanList.find(
      (c) => c.id === selectedCatatanId || c.idCatatan === selectedCatatanId
    ) || catatanList[0];

  const handleAddNewCatatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tambahDeskripsi.trim()) {
      alert("Mohon isi deskripsi catatan!");
      return;
    }

    try {
      setIsSavingNewCatatan(true);
      const isStudent = currentPreset === "siswa_aktif" || currentUser.role === "siswa";
      const payload: any = {
        catatan_karakter: [
          {
            semester: tambahSemester,
            jenis_catatan: tambahJenis,
            poin_disiplin: parseInt(tambahPoin.replace(/\D/g, "")) || 5,
            deskripsi: tambahDeskripsi.trim(),
            tanggal_pencatatan: new Date().toISOString().slice(0, 10),
          },
        ],
      };
      if (!isStudent) {
        payload.siswa_id = 1;
      }

      const res = await akademikService.storePresensiKarakter(payload);

      const newId = res?.data?.catatan_karakter?.[res.data.catatan_karakter.length - 1]?.id
        ? String(res.data.catatan_karakter[res.data.catatan_karakter.length - 1].id)
        : String(Date.now());

      const newCatatan: CatatanSiswaItem = {
        id: newId,
        idCatatan: newId,
        idSiswa: "1",
        semester: tambahSemester,
        jenisCatatan: tambahJenis,
        poinDisiplin: tambahPoin.startsWith("+") || tambahPoin.startsWith("-") ? tambahPoin : `+${tambahPoin}`,
        deskripsiCatatan: tambahDeskripsi.trim(),
        tanggalPencatatan: new Date().toISOString().slice(0, 10),
        tanggalLengkap: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        kategoriSubtitle: "Karakter",
        tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        kategori: tambahJenis,
        judul: tambahJenis,
        ringkasan: tambahDeskripsi.trim(),
        pencatat: currentUser.name || "Guru/Wali Kelas",
        pencatatLengkap: `${currentUser.name || "Wali Kelas"} · SMAN 8 Malang`,
        status: "Selesai",
      };

      setCatatanList([newCatatan, ...catatanList]);
      setSelectedCatatanId(newId);
      setShowTambahCatatanModal(false);
      setTambahDeskripsi("");
      setCatatanActionFeedback("Catatan karakter siswa berhasil dicatat ke API!");
      setTimeout(() => setCatatanActionFeedback(null), 4000);
    } catch (err: any) {
      alert("Gagal menambahkan catatan karakter: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setIsSavingNewCatatan(false);
    }
  };

  const handleSaveCatatan = async (updated: CatatanSiswaItem) => {
    setCatatanList((prev) =>
      prev.map((c) =>
        c.id === updated.id || c.idCatatan === updated.idCatatan ? updated : c
      )
    );

    try {
      const isStudent = currentPreset === "siswa_aktif" || currentUser.role === "siswa";
      await akademikService.storePresensiKarakter({
        siswa_id: isStudent ? undefined : 1,
        catatan_karakter: [
          {
            semester: Number(updated.semester) || 1,
            jenis_catatan: updated.jenisCatatan || updated.kategori || "Kedisiplinan",
            poin_disiplin: parseInt(String(updated.poinDisiplin).replace(/\D/g, "")) || 5,
            deskripsi: updated.deskripsiCatatan || updated.ringkasan || "-",
            tanggal_pencatatan: new Date().toISOString().slice(0, 10),
          },
        ],
      });
      setCatatanActionFeedback("Perubahan catatan karakter berhasil disimpan ke API!");
      setTimeout(() => setCatatanActionFeedback(null), 4000);
    } catch (err: any) {
      console.warn("Gagal sinkronisasi catatan karakter ke backend:", err?.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-purple-100">

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 lg:px-10 pt-8 pb-16">

        <div className="mb-6">
          <Breadcrumb tab={activeTab} />
          <h1
            className="text-[28px] sm:text-[32px] font-bold text-[#101828] tracking-tight leading-tight"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Rekam Data Siswa
          </h1>
          <p
            className="text-xs sm:text-sm text-[#667085] mt-1"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Rekap karakteristik, eligibilitas dan rekomendasi prodi
          </p>
        </div>


        <div className="mb-7">
          <SiswaTabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>




        {activeTab === "Akademik" && (
          <div className="flex flex-col gap-6">

            <AkademikHeaderCard
              siswaData={{
                nama: biodata.nama,
                nisn: biodata.nisn,
                kelas: biodata.kelas,
                status: biodata.status,
              }}
              summaryCards={liveSummaryCards.length > 0 ? liveSummaryCards : undefined}
            />


            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-stretch">
              <AkademikTablePanel
                data={liveMapelList.length > 0 ? liveMapelList : undefined}
                isLoading={isLoadingAkademik}
              />
              <AkademikTrendPanel
                trends={liveTrends.length > 0 ? liveTrends : undefined}
              />
            </div>
          </div>
        )}

        {activeTab === "Karakteristik" && (
          <div className="flex flex-col gap-6 sm:gap-7">
            {/* ── BAGIAN ATAS: Profil Siswa & Metrik Karakteristik Sejajar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-7 items-start">
              <KarakteristikProfileCard
                summary={{
                  nama: biodata.nama,
                  nisn: biodata.nisn,
                  kelas: biodata.kelas,
                  akumulasiNilaiRapor: liveSummaryCards[0]?.value ? parseFloat(liveSummaryCards[0].value) : 88.5,
                  ...liveKarakteristikSummary,
                }}
              />

              <KarakteristikMetricsCard
                metrics={liveMetrics.length > 0 ? liveMetrics : undefined}
              />
            </div>

            {/* ── BAGIAN UTAMA: Rekomendasi Program Studi (Metode SAW) ── */}
            <RekomProdiSAW />
          </div>
        )}


        {activeTab === "Biodata" && (
          <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-7 items-stretch">

            <BiodataProfileCard
              biodata={biodata}
              isEditing={isEditingBiodata}
              onToggleEdit={() => setIsEditingBiodata((prev) => !prev)}
            />

            <BiodataFormCard
              biodata={biodata}
              isEditing={isEditingBiodata}
              onSave={(updated) => {
                setBiodata(updated);
                setIsEditingBiodata(false);
              }}
              onCancel={() => setIsEditingBiodata(false)}
              onEnableEdit={() => setIsEditingBiodata(true)}
            />
          </div>
        )}


        {activeTab === "Dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-7 items-start">

            <SiswaProfileCard
              profile={{
                nama: biodata.nama,
                nisn: biodata.nisn,
                kelas: biodata.kelas,
                status: biodata.status,
                fotoUrl: biodata.fotoUrl,
              }}
              skor={OVERALL_SKOR}
            />


            <DashboardChartsWrapper
              recapData={RECAP_ASESMEN}
              nilaiData={NILAI_AKADEMIK}
            />
          </div>
        )}

        {activeTab === "Catatan" && (
          <div className="flex flex-col gap-6 mt-6">

            <div className="rounded-[14px] bg-[#F0E6F5] p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-[10px] bg-white border border-[#DECFE8] flex items-center justify-center shrink-0 shadow-2xs">
                  <span
                    className="font-bold text-[18px] text-[#5F089E]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {biodata.nama
                      ? biodata.nama
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "TS"}
                  </span>
                </div>

                <div>
                  <h2
                    className="font-bold text-[16px] text-[#14141C] leading-snug"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {biodata.nama || "Tegar Saputra"}
                  </h2>
                  <p
                    className="font-normal text-[11px] text-[#6E6B78] mt-0.5"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    NISN {biodata.nisn || "0061284731"} <span className="mx-1">•</span> Kelas XII-A <span className="mx-1">•</span> SMA Negeri 8 Malang
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[7px] bg-[#E0F5E8] text-[#148557] font-semibold text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#148557]"></span>
                      Aktif
                    </span>
                    <span className="text-[10px] text-[#6E6B78]">
                      Total {catatanList.length} Catatan Terdata
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTambahCatatanModal(true)}
                className="h-[38px] px-4 rounded-[9px] bg-[#5F089E] hover:bg-[#520492] text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Catatan Karakter</span>
              </button>
            </div>

            {catatanActionFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{catatanActionFeedback}</span>
              </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] gap-6 items-start">

              <CatatanTablePanel
                catatanList={catatanList}
                selectedId={selectedCatatan?.id || ""}
                onSelectCatatan={(item) => setSelectedCatatanId(item.id)}
                searchTerm={catatanSearch}
                onSearchChange={setCatatanSearch}
                currentPage={catatanPage}
                onPageChange={setCatatanPage}
                pageSize={8}
              />


              {selectedCatatan && (
                <CatatanDetailPanel
                  catatan={selectedCatatan}
                  onSaveCatatan={handleSaveCatatan}
                />
              )}
            </div>

            {showTambahCatatanModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#DECFE8] overflow-hidden">
                  <div className="px-5 py-4 bg-[#F0E6F5] border-b border-[#DECFE8] flex items-center justify-between">
                    <div>
                      <h3 className="text-[15px] font-bold text-[#14141C]">
                        Tambah Catatan Karakter Siswa
                      </h3>
                      <p className="text-[11px] text-[#6E6B78] mt-0.5">
                        Pencatatan langsung ke API backend untuk {biodata.nama || "Siswa"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTambahCatatanModal(false)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-white/60 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddNewCatatan} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#6E6B78] uppercase tracking-wider block mb-1">
                          Semester
                        </label>
                        <select
                          value={tambahSemester}
                          onChange={(e) => setTambahSemester(Number(e.target.value))}
                          className="w-full h-9 px-3 text-[12px] font-medium border border-[#DECFE8] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#5F089E]"
                        >
                          <option value={1}>Semester 1</option>
                          <option value={2}>Semester 2</option>
                          <option value={3}>Semester 3</option>
                          <option value={4}>Semester 4</option>
                          <option value={5}>Semester 5</option>
                          <option value={6}>Semester 6</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#6E6B78] uppercase tracking-wider block mb-1">
                          Poin Disiplin
                        </label>
                        <input
                          type="text"
                          value={tambahPoin}
                          onChange={(e) => setTambahPoin(e.target.value)}
                          placeholder="+5 atau -5"
                          className="w-full h-9 px-3 text-[12px] font-bold border border-[#DECFE8] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#5F089E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#6E6B78] uppercase tracking-wider block mb-1">
                        Jenis / Kategori Catatan
                      </label>
                      <input
                        type="text"
                        value={tambahJenis}
                        onChange={(e) => setTambahJenis(e.target.value)}
                        placeholder="Contoh: Kedisiplinan, Kepemimpinan, Prestasi"
                        className="w-full h-9 px-3 text-[12px] font-medium border border-[#DECFE8] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#5F089E]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#6E6B78] uppercase tracking-wider block mb-1">
                        Deskripsi Catatan
                      </label>
                      <textarea
                        rows={3}
                        value={tambahDeskripsi}
                        onChange={(e) => setTambahDeskripsi(e.target.value)}
                        placeholder="Tuliskan catatan observasi karakter siswa secara objektif..."
                        className="w-full p-3 text-[12px] border border-[#DECFE8] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#5F089E]"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowTambahCatatanModal(false)}
                        disabled={isSavingNewCatatan}
                        className="px-4 py-2 rounded-lg bg-white border border-[#DECFE8] text-[#6E6B78] hover:text-[#14141C] text-[12px] font-medium transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingNewCatatan}
                        className="px-4 py-2 rounded-lg bg-[#5F089E] hover:bg-[#520492] text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isSavingNewCatatan ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Simpan ke Server
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Ranking Eligibilitas" && (
          <RankingEligibilitas />
        )}

        {/* TAB: Perbandingan Nilai — FITUR B2 */}
        {activeTab === "Perbandingan Nilai" && (
          <PerbandinganNilai />
        )}
      </main>
      <Footer />
    </div>
  );
}
