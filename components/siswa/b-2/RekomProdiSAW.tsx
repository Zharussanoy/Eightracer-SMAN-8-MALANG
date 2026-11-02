"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  BarChart3,
  RefreshCw,
  BookOpen,
  Award,
} from "lucide-react";
import {
  KRITERIA_SAW,
  ALTERNATIF_PRODI,
  KriteriaBobot,
  ProdiAlternatif,
  HasilSAW,
} from "./mockDataSiswa";


function hitungSAW(
  alternatif: ProdiAlternatif[],
  kriteria: KriteriaBobot[],
  nilaiSiswa: number,
  minatSiswa: number
): HasilSAW[] {

  const data = alternatif.map((p) => ({
    ...p,
    skorNilai: nilaiSiswa,
    minat: minatSiswa,
  }));

  const kritKey: { id: string; key: keyof ProdiAlternatif }[] = [
    { id: "k1", key: "skorNilai" },
    { id: "k2", key: "minat" },
    { id: "k3", key: "peluangKarir" },
    { id: "k4", key: "dayaTampung" },
    { id: "k5", key: "tingkatKesulitan" },
  ];

  const getMax = (key: keyof ProdiAlternatif) =>
    Math.max(...data.map((d) => Number(d[key])));
  const getMin = (key: keyof ProdiAlternatif) =>
    Math.min(...data.map((d) => Number(d[key])));

  // 1. Normalisasi
  const normalisasi = data.map((alt) => {
    const row: Record<string, number> = {};
    kritKey.forEach(({ id, key }) => {
      const k = kriteria.find((kr) => kr.id === id)!;
      row[id] =
        k.jenisManfaat === "benefit"
          ? Number(alt[key]) / getMax(key)
          : getMin(key) / Number(alt[key]);
    });
    return { alt, row };
  });


  const skorAkhir = normalisasi.map(({ alt, row }) => ({
    alt,
    skor: kriteria.reduce((t, k) => t + k.bobot * (row[k.id] ?? 0), 0),
  }));


  skorAkhir.sort((a, b) => b.skor - a.skor);

  return skorAkhir.map(({ alt, skor }, idx) => {
    const rekomendasi: HasilSAW["rekomendasi"] =
      idx === 0
        ? "Sangat Direkomendasikan"
        : idx <= 2
        ? "Direkomendasikan"
        : idx <= 4
        ? "Pertimbangkan"
        : "Kurang Sesuai";

    return {
      id: alt.id,
      namaProdi: alt.namaProdi,
      universitas: alt.universitas,
      kodeUniv: alt.kodeUniv,
      skor: Math.round(skor * 1000) / 1000,
      peringkat: idx + 1,
      jalurMasuk: alt.jalurMasuk,
      rekomendasi,
    };
  });
}

const BADGE: Record<HasilSAW["rekomendasi"], string> = {
  "Sangat Direkomendasikan":
    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Direkomendasikan: "bg-blue-100 text-blue-700 border border-blue-200",
  Pertimbangkan: "bg-amber-100 text-amber-700 border border-amber-200",
  "Kurang Sesuai": "bg-red-50 text-red-600 border border-red-200",
};

const JALUR_COLOR: Record<string, string> = {
  SNBP: "bg-purple-100 text-purple-700",
  SNBT: "bg-blue-100 text-blue-700",
  Mandiri: "bg-slate-100 text-slate-600",
};


export default function RekomProdiSAW() {
  const [nilaiRata, setNilaiRata] = useState("85");
  const [minat, setMinat] = useState("8");
  const [bobotEdited, setBobotEdited] = useState<KriteriaBobot[]>(
    KRITERIA_SAW.map((k) => ({ ...k }))
  );
  const [showKriteria, setShowKriteria] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasil, setHasil] = useState<HasilSAW[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    const n = parseFloat(nilaiRata);
    if (isNaN(n) || n < 0 || n > 100)
      e.nilaiRata = "Nilai harus antara 0–100";
    const m = parseInt(minat);
    if (isNaN(m) || m < 1 || m > 10)
      e.minat = "Kesesuaian minat harus antara 1–10";
    const tot = bobotEdited.reduce((s, k) => s + k.bobot, 0);
    if (Math.abs(tot - 1) > 0.01)
      e.bobot = `Total bobot harus = 1.00 (sekarang: ${tot.toFixed(2)})`;
    return e;
  }, [nilaiRata, minat, bobotEdited]);

  const handleHitung = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setHasil(
        hitungSAW(ALTERNATIF_PRODI, bobotEdited, parseFloat(nilaiRata), parseInt(minat))
      );
      setCalculated(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setNilaiRata("85");
    setMinat("8");
    setBobotEdited(KRITERIA_SAW.map((k) => ({ ...k })));
    setHasil([]);
    setCalculated(false);
    setErrors({});
  };

  const totalBobot = bobotEdited.reduce((s, k) => s + k.bobot, 0);

  return (
    <div className="space-y-6">

      <div className="rounded-[20px] bg-gradient-to-r from-[#4A047D] via-[#5F089E] to-[#7B1FA2] text-white p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h2
              className="text-xl font-black tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Rekomendasi Program Studi
            </h2>
            <p
              className="text-purple-100/90 text-sm mt-1 leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Menggunakan metode{" "}
              <span className="font-bold text-white">
                Simple Additive Weighting (SAW)
              </span>{" "}
              — skor setiap prodi dihitung berdasarkan kriteria terbobot.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="space-y-4">

          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3
              className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-2"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <BookOpen className="w-4 h-4 text-[#5F089E]" />
              Data Siswa
            </h3>

            <div className="space-y-4">

              <div>
                <label
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Rata-rata Nilai Akademik{" "}
                  <span className="text-slate-400 font-normal">(0–100)</span>
                </label>
                <input
                  id="input-nilai-rata"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={nilaiRata}
                  onChange={(e) => setNilaiRata(e.target.value)}
                  placeholder="Contoh: 85"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#5F089E]/30 ${
                    errors.nilaiRata
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200 bg-slate-50 focus:border-[#5F089E]"
                  }`}
                />
                {errors.nilaiRata && (
                  <p className="text-red-500 text-xs mt-1">{errors.nilaiRata}</p>
                )}
              </div>


              <div>
                <label
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Kesesuaian Minat{" "}
                  <span className="text-slate-400 font-normal">
                    (1–10, dari asesmen RIASEC)
                  </span>
                </label>
                <input
                  id="input-minat"
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  value={minat}
                  onChange={(e) => setMinat(e.target.value)}
                  placeholder="Contoh: 8"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#5F089E]/30 ${
                    errors.minat
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200 bg-slate-50 focus:border-[#5F089E]"
                  }`}
                />
                {errors.minat && (
                  <p className="text-red-500 text-xs mt-1">{errors.minat}</p>
                )}
              </div>
            </div>
          </div>


          <div className="rounded-[20px] border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              id="btn-toggle-kriteria"
              onClick={() => setShowKriteria(!showKriteria)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#5F089E]" />
                Kustomisasi Bobot Kriteria
              </div>
              {showKriteria ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showKriteria && (
              <div className="px-5 pb-5 border-t border-slate-100 space-y-4 pt-4">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <p className="text-[10px] text-blue-700">
                    Total bobot harus{" "}
                    <span className="font-bold">= 1.00</span>
                  </p>
                </div>

                {bobotEdited.map((k) => (
                  <div key={k.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        {k.nama}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            k.jenisManfaat === "benefit"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {k.jenisManfaat}
                        </span>
                      </span>
                      <span className="text-xs font-black text-[#5F089E]">
                        {k.bobot.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
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
                      className="w-full accent-[#5F089E] cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {k.keterangan}
                    </p>
                  </div>
                ))}


                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Bobot:</span>
                    <span
                      className={`font-black ${
                        Math.abs(totalBobot - 1) < 0.01
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {totalBobot.toFixed(2)}
                    </span>
                  </div>
                </div>
                {errors.bobot && (
                  <p className="text-red-500 text-xs">{errors.bobot}</p>
                )}
              </div>
            )}
          </div>


          <div className="flex gap-2">
            <button
              id="btn-hitung-saw"
              type="button"
              onClick={handleHitung}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#5F089E] text-white text-sm font-bold hover:bg-[#4A047D] transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Menghitung…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Hitung Rekomendasi
                </>
              )}
            </button>
            <button
              id="btn-reset-saw"
              type="button"
              onClick={handleReset}
              title="Reset"
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>


        <div className="lg:col-span-2">
          {!calculated ? (
            <div className="min-h-72 rounded-[20px] border-2 border-dashed border-[#5F089E]/30 bg-[#EFE6F5]/40 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#5F089E]/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#5F089E]/50" />
              </div>
              <p
                className="font-bold text-slate-600"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Belum Ada Hasil
              </p>
              <p
                className="text-sm text-slate-400 max-w-xs"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Isi nilai dan minat di panel kiri, lalu klik{" "}
                <span className="font-semibold text-[#5F089E]">
                  Hitung Rekomendasi
                </span>{" "}
                untuk melihat ranking prodi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p
                  className="text-xs text-slate-500"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {hasil.length} program studi diurutkan berdasarkan SAW
                </p>
                <span className="text-[10px] px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200">
                  DATA DUMMY
                </span>
              </div>

              {hasil.map((h, idx) => (
                <div
                  key={h.id}
                  className={`rounded-[20px] border bg-white p-4 shadow-sm hover:shadow-md transition-all ${
                    idx === 0
                      ? "border-[#5F089E] ring-2 ring-[#5F089E]/20"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        idx === 0
                          ? "bg-[#5F089E] text-white shadow"
                          : idx <= 2
                          ? "bg-[#EFE6F5] text-[#5F089E]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      #{h.peringkat}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p
                            className="font-bold text-slate-900 text-sm"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            {h.namaProdi}
                          </p>
                          <p
                            className="text-xs text-slate-500 mt-0.5"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {h.universitas}{" "}
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                              {h.kodeUniv}
                            </span>
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 ${BADGE[h.rekomendasi]}`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {h.rekomendasi}
                        </span>
                      </div>


                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-24">
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-slate-400">
                              Skor SAW
                            </span>
                            <span className="text-[10px] font-black text-[#5F089E]">
                              {(h.skor * 100).toFixed(1)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${h.skor * 100}%`,
                                background:
                                  idx === 0
                                    ? "#5F089E"
                                    : idx <= 2
                                    ? "#226CE0"
                                    : "#94a3b8",
                              }}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-lg font-bold ${
                            JALUR_COLOR[h.jalurMasuk] ??
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {h.jalurMasuk}
                        </span>
                        {idx === 0 && (
                          <Award className="w-4 h-4 text-yellow-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}


              <div className="rounded-xl p-3 bg-slate-50 border border-slate-200">
                <p
                  className="text-[10px] text-slate-500 leading-relaxed"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <span className="font-bold text-slate-600">Metode SAW:</span>{" "}
                  Nilai dinormalisasi terhadap nilai terbaik per kriteria, lalu
                  dikalikan bobot dan dijumlahkan. Skor mendekati 100 berarti
                  paling sesuai.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
