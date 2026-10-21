"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  MapPin,
  GraduationCap,
  Globe,
  Plus,
  Minus,
  X,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  School,
  Users,
  Search,
} from "lucide-react";

export interface KampusItem {
  id: number;
  nama: string;
  alumni: number;
  favorit: string;
}

export interface ProvinsiData {
  persentase: number;
  totalAlumni: number;
  kampus: KampusItem[];
}

export const dataPersebaran: Record<string, ProvinsiData> = {
  "Jawa Timur": {
    persentase: 95.8,
    totalAlumni: 798,
    kampus: [
      { id: 1, nama: "Universitas Brawijaya (UB)", alumni: 429, favorit: "Berbagai Jurusan" },
      { id: 2, nama: "Universitas Negeri Malang (UM)", alumni: 177, favorit: "Berbagai Jurusan" },
      { id: 3, nama: "Politeknik Negeri Malang (Polinema)", alumni: 83, favorit: "Berbagai Jurusan" },
      { id: 4, nama: "ITS Surabaya", alumni: 29, favorit: "Berbagai Jurusan" },
      { id: 5, nama: "Universitas Airlangga (UNAIR)", alumni: 24, favorit: "Berbagai Jurusan" },
      { id: 6, nama: "UIN Maulana Malik Ibrahim", alumni: 19, favorit: "Berbagai Jurusan" },
      { id: 7, nama: "Universitas Jember (UNEJ)", alumni: 12, favorit: "Berbagai Jurusan" },
      { id: 8, nama: "Poltekkes Kemenkes Malang", alumni: 12, favorit: "Berbagai Jurusan" },
      { id: 9, nama: "Universitas Negeri Surabaya (UNESA)", alumni: 9, favorit: "Berbagai Jurusan" },
      { id: 10, nama: "UPN Veteran Jawa Timur", alumni: 2, favorit: "Berbagai Jurusan" },
      { id: 11, nama: "PENS Surabaya", alumni: 1, favorit: "Berbagai Jurusan" },
      { id: 12, nama: "Universitas Terbuka", alumni: 1, favorit: "Berbagai Jurusan" }
    ]
  },
  "DI Yogyakarta": {
    persentase: 1.8,
    totalAlumni: 15,
    kampus: [
      { id: 13, nama: "UGM", alumni: 13, favorit: "Berbagai Jurusan" },
      { id: 14, nama: "UPN Veteran Yogyakarta", alumni: 1, favorit: "Berbagai Jurusan" },
      { id: 15, nama: "Poltekkes Yogyakarta", alumni: 1, favorit: "Berbagai Jurusan" }
    ]
  },
  "Jawa Barat": {
    persentase: 1.2,
    totalAlumni: 10,
    kampus: [
      { id: 16, nama: "Institut Pertanian Bogor (IPB)", alumni: 4, favorit: "Berbagai Jurusan" },
      { id: 17, nama: "Universitas Padjajaran (UNPAD)", alumni: 3, favorit: "Berbagai Jurusan" },
      { id: 18, nama: "ITB Bandung", alumni: 2, favorit: "Berbagai Jurusan" },
      { id: 19, nama: "Universitas Pendidikan Indonesia", alumni: 1, favorit: "Berbagai Jurusan" }
    ]
  },
  "DKI Jakarta": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 20, nama: "Universitas Indonesia", alumni: 1, favorit: "Berbagai Jurusan" }
    ]
  },
  "Jawa Tengah": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 21, nama: "UNDIP", alumni: 1, favorit: "Berbagai Jurusan" }
    ]
  },
  "Bali": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 22, nama: "Universitas Udayana", alumni: 1, favorit: "Berbagai Jurusan" }
    ]
  },
  "Sumatera Utara": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 23, nama: "Universitas Sumatera Utara", alumni: 1, favorit: "Berbagai Jurusan" }
    ]
  },
  "Kalimantan Barat": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 24, nama: "Universitas Tanjungpura", alumni: 1, favorit: "Berbagai Jurusan" }
    ]
  },
  "Kalimantan Timur": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 25, nama: "Universitas Mulawarman", alumni: 1, favorit: "Berbagai Jurusan" }
    ]
  },
  "Nusa Tenggara Barat": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 26, nama: "Universitas Mataram", alumni: 1, favorit: "Berbagai Jurusan" }
    ]
  }
};

// Titik koordinat representasi centroid untuk memudahkan visualisasi dan klik di wilayah pulau/provinsi kecil
const PROVINCE_CENTROIDS: Record<string, [number, number]> = {
  "Jawa Timur": [112.75, -7.7],
  "DI Yogyakarta": [110.37, -7.88],
  "Jawa Barat": [107.6, -6.9],
  "DKI Jakarta": [106.84, -6.2],
  "Jawa Tengah": [110.15, -7.15],
  "Bali": [115.18, -8.4],
  "Sumatera Utara": [99.07, 2.11],
  "Kalimantan Barat": [110.5, 0.0],
  "Kalimantan Timur": [116.4, 0.5],
  "Nusa Tenggara Barat": [117.5, -8.6],
};

// Helper normalisasi nama provinsi dari TopoJSON ke key di dataPersebaran
export const normalizeProvinceName = (geoName?: string): string => {
  if (!geoName) return "";
  const trimmed = geoName.trim();
  if (trimmed === "Jakarta") return "DKI Jakarta";
  if (trimmed === "Yogyakarta") return "DI Yogyakarta";
  if (trimmed === "D.I. Yogyakarta") return "DI Yogyakarta";
  if (trimmed === "D.K.I. Jakarta") return "DKI Jakarta";
  return trimmed;
};

// Helper untuk mencocokkan data provinsi
export const getProvinceData = (
  rawName?: string
): { provinceKey: string; data: ProvinsiData } | null => {
  if (!rawName) return null;
  const normalized = normalizeProvinceName(rawName);
  if (dataPersebaran[normalized]) {
    return { provinceKey: normalized, data: dataPersebaran[normalized] };
  }
  if (dataPersebaran[rawName]) {
    return { provinceKey: rawName, data: dataPersebaran[rawName] };
  }
  return null;
};

// Helper warna wilayah berdasarkan proporsi sebaran alumni
const getProvinceFillColor = (persentase: number): string => {
  if (persentase >= 50) return "#5F089E"; // Dominan Utama (Jawa Timur)
  if (persentase >= 1) return "#7E22CE"; // Menengah (DI Yogyakarta, Jawa Barat)
  return "#A855F7"; // Lainnya dengan alumni terdata
};

export default function AlumniMapChart() {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedKampus, setSelectedKampus] = useState<KampusItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [hoveredProvince, setHoveredProvince] = useState<{
    name: string;
    totalAlumni: number;
    persentase: number;
    hasData: boolean;
  } | null>(null);

  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State Management untuk posisi Center dan level Zoom
  const [mapPosition, setMapPosition] = useState<{
    center: [number, number];
    zoom: number;
  }>({
    center: [118.0, -2.0],
    zoom: 1,
  });

  // Tombol Reset Nasional
  const handleResetNasional = () => {
    setMapPosition({
      center: [118.0, -2.0],
      zoom: 1,
    });
  };

  // Tombol Fokus Jawa Timur
  const handleFocusJatim = () => {
    setMapPosition({
      center: [112.73, -7.65],
      zoom: 5.5,
    });
  };

  // Tombol Zoom In (+)
  const handleZoomIn = () => {
    setMapPosition((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.5, 8),
    }));
  };

  // Tombol Zoom Out (-)
  const handleZoomOut = () => {
    setMapPosition((prev) => {
      const nextZoom = Math.max(prev.zoom / 1.5, 1);
      return {
        center: nextZoom <= 1.2 ? [118.0, -2.0] : prev.center,
        zoom: nextZoom,
      };
    });
  };

  // Data provinsi yang sedang aktif dipilih
  const currentProvinceData = selectedProvince ? dataPersebaran[selectedProvince] : null;

  // Daftar kampus diurutkan dari alumni terbanyak ke sedikit (descending order)
  const sortedKampus = useMemo(() => {
    if (!currentProvinceData) return [];
    return [...currentProvinceData.kampus].sort((a, b) => b.alumni - a.alumni);
  }, [currentProvinceData]);

  // Daftar kampus yang disaring dengan pencarian
  const filteredKampus = useMemo(() => {
    if (!searchQuery.trim()) return sortedKampus;
    const query = searchQuery.toLowerCase();
    return sortedKampus.filter(
      (k) =>
        k.nama.toLowerCase().includes(query) ||
        k.favorit.toLowerCase().includes(query)
    );
  }, [sortedKampus, searchQuery]);

  // Index kampus saat ini di Level 2
  const currentKampusIndex = useMemo(() => {
    if (!selectedKampus || sortedKampus.length === 0) return -1;
    return sortedKampus.findIndex((k) => k.id === selectedKampus.id);
  }, [selectedKampus, sortedKampus]);

  // Navigasi Kampus Sebelumnya di Level 2
  const handlePrevKampus = useCallback(() => {
    if (sortedKampus.length === 0 || currentKampusIndex === -1) return;
    const prevIdx =
      currentKampusIndex > 0 ? currentKampusIndex - 1 : sortedKampus.length - 1;
    setSelectedKampus(sortedKampus[prevIdx]);
  }, [sortedKampus, currentKampusIndex]);

  // Navigasi Kampus Berikutnya di Level 2
  const handleNextKampus = useCallback(() => {
    if (sortedKampus.length === 0 || currentKampusIndex === -1) return;
    const nextIdx =
      currentKampusIndex < sortedKampus.length - 1 ? currentKampusIndex + 1 : 0;
    setSelectedKampus(sortedKampus[nextIdx]);
  }, [sortedKampus, currentKampusIndex]);

  // Handler interaksi klik provinsi pada Geographies
  const handleProvinceClick = (rawProvName?: string) => {
    const match = getProvinceData(rawProvName);
    // ATURAN: Jika provinsi yang diklik tidak ada di dalam object, jangan tampilkan modal
    if (!match) return;

    setSelectedProvince(match.provinceKey);
    setSelectedKampus(null);
    setSearchQuery("");
  };

  // Tutup semua pop-up modal
  const handleCloseModal = () => {
    setSelectedProvince(null);
    setSelectedKampus(null);
    setSearchQuery("");
  };

  // Keyboard navigation support untuk modal (Arrow Left, Arrow Right, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProvince) return;

      if (e.key === "Escape") {
        e.preventDefault();
        if (selectedKampus) {
          // Dari Level 2 kembali ke Level 1
          setSelectedKampus(null);
        } else {
          // Tutup Level 1
          handleCloseModal();
        }
      } else if (selectedKampus) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevKampus();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNextKampus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProvince, selectedKampus, handlePrevKampus, handleNextKampus]);

  // Tooltip Mouse Events
  const handleProvinceMouseEnter = (
    rawName: string,
    e: React.MouseEvent
  ) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const match = getProvinceData(rawName);

    if (match) {
      setHoveredProvince({
        name: match.provinceKey,
        totalAlumni: match.data.totalAlumni,
        persentase: match.data.persentase,
        hasData: true,
      });
    } else {
      setHoveredProvince({
        name: normalizeProvinceName(rawName) || rawName,
        totalAlumni: 0,
        persentase: 0,
        hasData: false,
      });
    }

    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !hoveredProvince) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHoveredProvince(null);
    setTooltipPos(null);
  };

  const currentZoom = mapPosition.zoom || 1;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[620px] sm:h-[650px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#F9F5FD] via-white to-[#F6EEFD] border-2 border-[#5F089E]/25 p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col justify-between"
    >
      {/* Map Header Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-1 border-b border-purple-100 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5F089E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5F089E]"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-[#5F089E] uppercase tracking-wider">
            Peta Sebaran Wilayah Alumni &bull; Drill-Down Provinsi
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-medium hidden md:inline-block">
            Klik wilayah provinsi berwarna ungu untuk membuka daftar & detail kampus
          </span>
        </div>
      </div>

      {/* SVG Map Container (Full Area) */}
      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
        {/* Tombol Kontrol Navigasi Peta (Absolute Positioning) */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-[#5F089E]/25 shadow-md">
          <button
            type="button"
            onClick={handleResetNasional}
            title="Lihat Peta Nasional Indonesia (Zoom 1x)"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              currentZoom <= 1.5
                ? "bg-[#5F089E] text-white shadow-xs"
                : "text-slate-700 hover:text-[#5F089E] hover:bg-purple-50"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Nasional</span>
          </button>

          <button
            type="button"
            onClick={handleFocusJatim}
            title="Fokus Wilayah Jawa Timur (Basis Utama)"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              currentZoom > 1.5
                ? "bg-[#5F089E] text-white shadow-xs"
                : "text-slate-700 hover:text-[#5F089E] hover:bg-purple-50"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#FCC850]" />
            <span>Fokus Jawa Timur</span>
          </button>

          <div className="h-4 w-px bg-purple-200 mx-0.5" />

          {/* Tombol Zoom In (+) */}
          <button
            type="button"
            onClick={handleZoomIn}
            title="Perbesar Peta (+)"
            className="w-7 h-7 rounded-lg sm:rounded-xl text-slate-700 hover:text-[#5F089E] hover:bg-purple-50 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Tombol Zoom Out (-) */}
          <button
            type="button"
            onClick={handleZoomOut}
            title="Perkecil Peta (-)"
            className="w-7 h-7 rounded-lg sm:rounded-xl text-slate-700 hover:text-[#5F089E] hover:bg-purple-50 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Legend Informasi Skala Sebaran Wilayah (Bottom Left) */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl sm:rounded-2xl border border-[#5F089E]/20 shadow-sm hidden sm:flex flex-col gap-1.5 text-[11px]">
          <span className="font-extrabold text-[#5F089E] tracking-wide uppercase text-[10px]">
            Tingkat Sebaran Alumni
          </span>
          <div className="flex items-center gap-3 font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5F089E] inline-block shadow-2xs" />
              Jatim (95.8%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7E22CE] inline-block shadow-2xs" />
              1% - 5%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] inline-block shadow-2xs" />
              &lt; 1%
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EDE8F5] inline-block border border-purple-200" />
              0 Alumni
            </span>
          </div>
        </div>

        {/* ComposableMap */}
        <ComposableMap
          projection="geoMercator"
          width={900}
          height={550}
          projectionConfig={{
            scale: 1050,
            center: [118, -2.5],
          }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* ZoomableGroup: FREE PAN & SCROLL ZOOM */}
          <ZoomableGroup
            center={mapPosition.center}
            zoom={mapPosition.zoom}
            minZoom={1}
            maxZoom={8}
            onMoveEnd={(pos) => {
              if (pos.coordinates && pos.zoom) {
                setMapPosition({
                  center: pos.coordinates,
                  zoom: pos.zoom,
                });
              }
            }}
            style={{ transition: "all 0.8s ease-in-out" }}
          >
            {/* Layer Wilayah Provinsi Indonesia */}
            <Geographies geography="/indonesia-topo.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const rawName = geo.properties?.provinsi;
                  const match = getProvinceData(rawName);
                  const hasData = !!match;
                  const isHovered =
                    hoveredProvince?.hasData &&
                    hoveredProvince?.name === match?.provinceKey;
                  const isSelected = selectedProvince === match?.provinceKey;

                  const fillColor = hasData
                    ? getProvinceFillColor(match.data.persentase)
                    : "#EDE8F5";

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleProvinceClick(rawName)}
                      onMouseEnter={(e) => handleProvinceMouseEnter(rawName, e)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        fill: isSelected ? "#FCC850" : fillColor,
                        stroke: hasData ? "#5F089E" : "#D8CCE8",
                        strokeWidth: hasData ? 0.75 : 0.35,
                        outline: "none",
                        cursor: hasData ? "pointer" : "default",
                        transition: "all 200ms ease",
                      }}
                      className={`outline-none transition-all duration-200 ${
                        hasData
                          ? "cursor-pointer hover:!fill-[#FCC850] hover:!stroke-[#3D0566] hover:!stroke-[1.5px]"
                          : "cursor-default hover:!fill-[#E4DAF2]"
                      }`}
                    />
                  );
                })
              }
            </Geographies>

            {/* Marker Penanda Interaktif untuk 10 Provinsi Terdata */}
            {Object.entries(dataPersebaran).map(([provName, provData]) => {
              const coords = PROVINCE_CENTROIDS[provName];
              if (!coords) return null;

              const isSelected = selectedProvince === provName;
              const isHovered = hoveredProvince?.name === provName;

              return (
                <Marker
                  key={provName}
                  coordinates={coords}
                  onClick={() => handleProvinceClick(provName)}
                  onMouseEnter={(e) => handleProvinceMouseEnter(provName, e)}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer"
                >
                  <g className="cursor-pointer transition-transform duration-200">
                    {/* Efek Wave / Pulsing */}
                    <circle
                      r={(isHovered || isSelected ? 16 : 10) / currentZoom}
                      fill="#5F089E"
                      opacity={isHovered || isSelected ? 0.35 : 0.2}
                    />
                    {/* Lingkaran Luar */}
                    <circle
                      r={(isHovered || isSelected ? 8.5 : 6) / currentZoom}
                      fill={isHovered || isSelected ? "#FCC850" : "#5F089E"}
                      stroke="#ffffff"
                      strokeWidth={Math.max(0.6, 1.8 / currentZoom)}
                    />
                    {/* Titik Inti */}
                    <circle
                      r={(isHovered || isSelected ? 3.5 : 2.5) / currentZoom}
                      fill={isHovered || isSelected ? "#5F089E" : "#FCC850"}
                    />
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Hover Tooltip (Mengikuti Kursor) */}
        {hoveredProvince && tooltipPos && (
          <div
            className="pointer-events-none absolute z-40 transform -translate-x-1/2 -translate-y-full pb-3 transition-opacity duration-150"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 8}px`,
            }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-purple-400/40 text-xs whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-extrabold text-sm text-white">
                  {hoveredProvince.name}
                </span>
                {hoveredProvince.hasData && (
                  <span className="px-2 py-0.5 rounded-full bg-[#5F089E] text-[#FCC850] font-extrabold text-[10px] shadow-xs">
                    {hoveredProvince.persentase}%
                  </span>
                )}
              </div>
              {hoveredProvince.hasData ? (
                <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-medium">
                  <span className="text-[#FCC850] font-bold">
                    {hoveredProvince.totalAlumni} Alumni
                  </span>
                  <span>&bull;</span>
                  <span className="text-purple-300">Klik untuk daftar kampus</span>
                </div>
              ) : (
                <span className="text-slate-400 text-[11px]">
                  Belum ada alumni terdata
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* POP-UP MODAL: LEVEL 1 (DAFTAR KAMPUS) & LEVEL 2 (DETAIL) */}
      {/* ======================================================== */}
      {selectedProvince && currentProvinceData && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full border border-purple-100 relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ==================================================== */}
            {/* LEVEL 2: DETAIL KAMPUS SPESIFIK                     */}
            {/* ==================================================== */}
            {selectedKampus ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header Navigasi Level 2 */}
                <div className="p-4 sm:p-5 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/60 to-white">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedKampus(null)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#5F089E] hover:text-[#4d0680] bg-white hover:bg-purple-100/70 border border-[#5F089E]/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Daftar Kampus</span>
                    </button>

                    {/* Navigasi Kampus Sebelumnya / Berikutnya */}
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        type="button"
                        onClick={handlePrevKampus}
                        title="Kampus Sebelumnya (Panah Kiri)"
                        className="w-7 h-7 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#5F089E] flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Kampus Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-bold text-slate-500 px-1.5">
                        {currentKampusIndex !== -1
                          ? `${currentKampusIndex + 1} / ${sortedKampus.length}`
                          : ""}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextKampus}
                        title="Kampus Berikutnya (Panah Kanan)"
                        className="w-7 h-7 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#5F089E] flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Kampus Berikutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tombol Close Modal Penuh */}
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Tutup Modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Konten Detail Kampus (Level 2) */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                  {/* Info Utama Kampus */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-[#EFE6F5] border border-[#5F089E]/25 flex items-center justify-center text-[#5F089E] shrink-0 shadow-xs">
                      <GraduationCap className="w-7 h-7 stroke-[1.8]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#5F089E] uppercase tracking-wider block">
                        Detail Perguruan Tinggi Negeri
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                        {selectedKampus.nama}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#5F089E]" />
                        <span>Provinsi {selectedProvince}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Highlight Statistik Serapan */}
                  <div className="p-4.5 rounded-2xl bg-gradient-to-r from-[#EFE6F5] to-purple-50 border border-[#5F089E]/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#5F089E] uppercase tracking-wider block">
                        Total Alumni Terdaftar
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-3xl font-black text-[#5F089E] tracking-tight">
                          {selectedKampus.alumni}
                        </span>
                        <span className="text-xs font-bold text-slate-600">Alumni</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                        Kontribusi:{" "}
                        <strong className="text-[#5F089E]">
                          {(
                            (selectedKampus.alumni /
                              currentProvinceData.totalAlumni) *
                            100
                          ).toFixed(1)}
                          %
                        </strong>{" "}
                        dari seluruh alumni di {selectedProvince}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-3 py-1 rounded-full bg-[#FCC850] text-slate-900 font-extrabold text-xs shadow-2xs">
                        PTN Favorit
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Tracer Study
                      </span>
                    </div>
                  </div>

                  {/* Jurusan / Program Studi Favorit */}
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-[#5F089E]" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Program Studi / Jurusan Favorit:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedKampus.favorit.split(",").map((prodi, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#5F089E]/25 text-xs font-semibold text-[#5F089E] shadow-2xs"
                        >
                          {prodi.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Banner */}
                  <Link
                    href="#persebaran-kampus"
                    onClick={handleCloseModal}
                    className="w-full py-3 px-4 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] active:bg-[#3d0566] text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
                  >
                    <span>Lihat Direktori Alumni Lengkap</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              /* ==================================================== */
              /* LEVEL 1: DAFTAR KAMPUS PER PROVINSI                 */
              /* ==================================================== */
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header Modal Level 1 */}
                <div className="p-5 sm:p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50/70 to-white">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#5F089E] text-white flex items-center justify-center shadow-xs">
                        <School className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#5F089E] uppercase tracking-wider block">
                          Provinsi Terpilih
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                          {selectedProvince}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Tutup Modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Rangkuman Statistik Provinsi */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-purple-100/80">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5F089E] text-[#FCC850] text-xs font-black shadow-2xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>{currentProvinceData.totalAlumni} Alumni</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-[#5F089E] text-xs font-extrabold border border-[#5F089E]/20">
                      <span>{currentProvinceData.persentase}%</span>
                      <span className="text-slate-500 font-semibold">Total Nasional</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      <span>{sortedKampus.length} Perguruan Tinggi</span>
                    </span>
                  </div>

                  {/* Kotak Pencarian Kampus (Jika lebih dari 3 kampus) */}
                  {sortedKampus.length > 3 && (
                    <div className="relative mt-3.5">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama kampus di provinsi ini..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-purple-200 focus:border-[#5F089E] focus:outline-none focus:ring-1 focus:ring-[#5F089E] text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  )}
                </div>

                {/* Sub-Header Petunjuk */}
                <div className="px-5 py-2.5 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Daftar Kampus Berdasarkan Jumlah Alumni Terbanyak:</span>
                  <span className="text-[11px] text-[#5F089E] font-bold">
                    Klik kartu untuk detail
                  </span>
                </div>

                {/* List Kampus per Provinsi (Urut Descending) */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 max-h-[380px]">
                  {filteredKampus.length > 0 ? (
                    filteredKampus.map((kampus, index) => {
                      const rank = index + 1;
                      const persentaseProv = (
                        (kampus.alumni / currentProvinceData.totalAlumni) *
                        100
                      ).toFixed(1);

                      return (
                        <div
                          key={kampus.id}
                          onClick={() => setSelectedKampus(kampus)}
                          className="group p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-purple-100 hover:border-[#5F089E] bg-white hover:bg-purple-50/60 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Ranking Badge */}
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                rank === 1
                                  ? "bg-[#FCC850] text-slate-900 shadow-xs"
                                  : rank === 2
                                  ? "bg-purple-100 text-[#5F089E]"
                                  : rank === 3
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              #{rank}
                            </div>

                            {/* Nama Kampus & Info Favorit */}
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#5F089E] transition-colors truncate">
                                {kampus.nama}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate font-medium mt-0.5">
                                Favorit: {kampus.favorit}
                              </p>
                            </div>
                          </div>

                          {/* Alumni Count Badge & Arrow */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="block font-black text-sm text-[#5F089E]">
                                {kampus.alumni}{" "}
                                <span className="text-[10px] font-bold text-slate-500">
                                  Alumni
                                </span>
                              </span>
                              <span className="block text-[10px] text-slate-400 font-semibold">
                                {persentaseProv}% prov
                              </span>
                            </div>

                            <div className="w-7 h-7 rounded-lg bg-purple-50 group-hover:bg-[#5F089E] group-hover:text-white text-[#5F089E] flex items-center justify-center transition-all">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada kampus yang cocok dengan pencarian &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>

                {/* Footer Modal Level 1 */}
                <div className="p-3.5 px-5 bg-slate-50 border-t border-purple-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">
                    Menampilkan {filteredKampus.length} dari {sortedKampus.length} kampus
                  </span>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
