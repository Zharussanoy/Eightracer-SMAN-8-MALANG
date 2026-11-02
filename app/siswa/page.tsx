"use client";

import { useState } from "react";
import SiswaNavbar from "@/components/siswa/SiswaNavbar";
import SiswaTabNav, { SiswaTab } from "@/components/siswa/SiswaTabNav";
import SiswaProfileCard from "@/components/siswa/b-2/SiswaProfileCard";
import BiodataProfileCard from "@/components/siswa/b-2/BiodataProfileCard";
import BiodataFormCard from "@/components/siswa/b-2/BiodataFormCard";
import KarakteristikProfileCard from "@/components/siswa/b-2/KarakteristikProfileCard";
import KarakteristikMetricsCard from "@/components/siswa/b-2/KarakteristikMetricsCard";
import KarakteristikRekomendasiProdi from "@/components/siswa/b-2/KarakteristikRekomendasiProdi";
import AkademikHeaderCard from "@/components/siswa/b-2/AkademikHeaderCard";
import AkademikTablePanel from "@/components/siswa/b-2/AkademikTablePanel";
import AkademikTrendPanel from "@/components/siswa/b-2/AkademikTrendPanel";
import {
  DashboardChartsWrapper,
  RecapAsesmenCard,
  NilaiAkademikCard,
} from "@/components/siswa/b-2/DashboardCards";
import RekomProdiSAW from "@/components/siswa/b-2/RekomProdiSAW";
import RankingEligibilitas from "@/components/siswa/b-2/RankingEligibilitas";
import CatatanTablePanel from "@/components/siswa/b-2/CatatanTablePanel";
import CatatanDetailPanel from "@/components/siswa/b-2/CatatanDetailPanel";
import CatatanHeaderCard from "@/components/siswa/b-2/CatatanHeaderCard";

import {
  INITIAL_BIODATA_SISWA,
  BiodataSiswa,
  OVERALL_SKOR,
  RECAP_ASESMEN,
  NILAI_AKADEMIK,
  MOCK_CATATAN_LIST,
  CatatanSiswaItem,
} from "@/components/siswa/b-2/mockDataSiswa";

// Breadcrumb: Beranda/B2/Catatan pada Catatan & Ranking Eligibilitas (sesuai screenshot dan layer Figma), Beranda/B2/Akademik pada Akademik & Karakteristik
function Breadcrumb({ tab }: { tab: SiswaTab }) {
  let displayTab: string = tab;
  if (tab === "Karakteristik" || tab === "Akademik") {
    displayTab = "Akademik";
  } else if (tab === "Catatan") {
    displayTab = "Catatan";
  } else if (tab === "Ranking Eligibilitas") {
    displayTab = "Ranking Eligibilitas";
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

// Placeholder untuk tab yang belum dikerjakan
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
  // Tab Ranking Eligibilitas aktif secara default sesuai permintaan revisi
  const [activeTab, setActiveTab] = useState<SiswaTab>("Ranking Eligibilitas");

  // State biodata siswa (frontend only, simulasi tersimpan di memory)
  const [biodata, setBiodata] = useState<BiodataSiswa>(INITIAL_BIODATA_SISWA);
  const [isEditingBiodata, setIsEditingBiodata] = useState(false);

  // State Catatan Siswa
  const [catatanList, setCatatanList] =
    useState<CatatanSiswaItem[]>(MOCK_CATATAN_LIST);
  const [selectedCatatanId, setSelectedCatatanId] = useState<string>("1001");
  const [catatanSearch, setCatatanSearch] = useState<string>("");
  const [catatanPage, setCatatanPage] = useState<number>(1);

  // Ambil objek catatan yang sedang dipilih
  const selectedCatatan =
    catatanList.find(
      (c) => c.id === selectedCatatanId || c.idCatatan === selectedCatatanId
    ) || catatanList[0];

  const handleSaveCatatan = (updated: CatatanSiswaItem) => {
    setCatatanList((prev) =>
      prev.map((c) =>
        c.id === updated.id || c.idCatatan === updated.idCatatan ? updated : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-purple-100">
      {/* ── Navbar siswa (Untitled UI) ── */}
      <SiswaNavbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 lg:px-10 pt-8 pb-16">
        {/* ── Breadcrumb & Judul Halaman ── */}
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

        {/* ── Tab Navigasi ── */}
        <div className="mb-7">
          <SiswaTabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* ── Konten per tab ── */}

        {/* TAB: Akademik — FOKUS UTAMA B2 AKADEMIK SISWA */}
        {activeTab === "Akademik" && (
          <div className="flex flex-col gap-6">
            {/* Bagian Atas: Identitas Siswa & 4 Kartu Ringkasan Akademik */}
            <AkademikHeaderCard />

            {/* Bagian Bawah: 2 Kolom (Tabel Nilai di kiri, Perkembangan Grafik di kanan) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-stretch">
              <AkademikTablePanel />
              <AkademikTrendPanel />
            </div>
          </div>
        )}

        {/* TAB: Karakteristik */}
        {activeTab === "Karakteristik" && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-7 items-start">
            {/* Kolom kiri: Profil Siswa & Akumulasi Nilai Rapor */}
            <KarakteristikProfileCard />

            {/* Kolom kanan: Panel Karakteristik & Rekomendasi Program Studi */}
            <div className="flex flex-col gap-6">
              <KarakteristikMetricsCard />
              <KarakteristikRekomendasiProdi />
            </div>
          </div>
        )}

        {/* TAB: Biodata */}
        {activeTab === "Biodata" && (
          <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-7 items-stretch">
            {/* Kolom kiri — Kartu Profil Siswa */}
            <BiodataProfileCard
              biodata={biodata}
              isEditing={isEditingBiodata}
              onToggleEdit={() => setIsEditingBiodata((prev) => !prev)}
            />

            {/* Kolom kanan — Formulir Biodata & Kartu Sinkronisasi PDSS */}
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

        {/* TAB: Dashboard */}
        {activeTab === "Dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-7 items-start">
            {/* Kolom kiri — profil */}
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

            {/* Kolom kanan — kotak ungu tua pembungkus dengan grafik recap & nilai */}
            <DashboardChartsWrapper
              recapData={RECAP_ASESMEN}
              nilaiData={NILAI_AKADEMIK}
            />
          </div>
        )}

        {/* TAB: Catatan — FOKUS UTAMA B2 CATATAN SISWA */}
        {activeTab === "Catatan" && (
          <div className="flex flex-col gap-6 mt-6">
            {/* Kartu Profil Siswa (Tegar Saputra) */}
            <div className="rounded-[14px] bg-[#F0E6F5] p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-[10px] bg-white border border-[#DECFE8] flex items-center justify-center shrink-0 shadow-2xs">
                  <span
                    className="font-bold text-[18px] text-[#5F089E]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    NP
                  </span>
                </div>

                <div>
                  <h2
                    className="font-bold text-[16px] text-[#14141C] leading-snug"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    Tegar Saputra
                  </h2>
                  <p
                    className="font-normal text-[11px] text-[#6E6B78] mt-0.5"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    NISN 0061284731 <span className="mx-1">•</span> Kelas XII-A <span className="mx-1">•</span> SMA Negeri 8 Malang
                  </p>
                  <div className="mt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[7px] bg-[#E0F5E8] text-[#148557] font-semibold text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#148557]"></span>
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dua Panel Sejajar: Riwayat Catatan & Detail Catatan Karakter */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] gap-6 items-start">
              {/* Panel Kiri: Riwayat Catatan */}
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

              {/* Panel Kanan: Detail Catatan Karakter */}
              {selectedCatatan && (
                <CatatanDetailPanel
                  catatan={selectedCatatan}
                  onSaveCatatan={handleSaveCatatan}
                />
              )}
            </div>
          </div>
        )}

        {/* TAB: Ranking Eligibilitas — FITUR B2 */}
        {activeTab === "Ranking Eligibilitas" && (
          <RankingEligibilitas />
        )}
      </main>
    </div>
  );
}
