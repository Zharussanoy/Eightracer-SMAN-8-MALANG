"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { feature } from "topojson-client";
import { geoMercator, geoPath, geoCentroid } from "d3-geo";
import type { Topology, Objects } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
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
  RotateCcw,
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
      { id: 1, nama: "Universitas Brawijaya (UB)", alumni: 429, favorit: "Kedokteran, Teknik Informatika, Hukum, Manajemen" },
      { id: 2, nama: "Universitas Negeri Malang (UM)", alumni: 177, favorit: "Pendidikan, Psikologi, Teknik, Ekonomi" },
      { id: 3, nama: "Politeknik Negeri Malang (Polinema)", alumni: 83, favorit: "Teknik Mesin, Teknik Elektro, Akuntansi" },
      { id: 4, nama: "ITS Surabaya", alumni: 29, favorit: "Teknik Informatika, Sistem Informasi, Teknik Industri" },
      { id: 5, nama: "Universitas Airlangga (UNAIR)", alumni: 24, favorit: "Kedokteran, Farmasi, Manajemen, Psikologi" },
      { id: 6, nama: "UIN Maulana Malik Ibrahim", alumni: 19, favorit: "Farmasi, Teknik Informatika, Psikologi" },
      { id: 7, nama: "Universitas Jember (UNEJ)", alumni: 12, favorit: "Kedokteran Gigi, Pertanian, Hukum" },
      { id: 8, nama: "Poltekkes Kemenkes Malang", alumni: 12, favorit: "Keperawatan, Kebidanan, Gizi" },
      { id: 9, nama: "Universitas Negeri Surabaya (UNESA)", alumni: 9, favorit: "Pendidikan Olahraga, PGSD, Seni Rupa" },
      { id: 10, nama: "UPN Veteran Jawa Timur", alumni: 2, favorit: "Ilmu Komunikasi, Teknik Kimia" },
      { id: 11, nama: "PENS Surabaya", alumni: 1, favorit: "Teknik Mekatronika" },
      { id: 12, nama: "Universitas Terbuka", alumni: 1, favorit: "Ilmu Hukum" }
    ]
  },
  "DI Yogyakarta": {
    persentase: 1.8,
    totalAlumni: 15,
    kampus: [
      { id: 13, nama: "Universitas Gadjah Mada (UGM)", alumni: 13, favorit: "Kedokteran, Hubungan Internasional, Kehutanan, FEB" },
      { id: 14, nama: "UPN Veteran Yogyakarta", alumni: 1, favorit: "Teknik Pertambangan" },
      { id: 15, nama: "Poltekkes Yogyakarta", alumni: 1, favorit: "Kesehatan Lingkungan" }
    ]
  },
  "Jawa Barat": {
    persentase: 1.2,
    totalAlumni: 10,
    kampus: [
      { id: 16, nama: "Institut Pertanian Bogor (IPB)", alumni: 4, favorit: "Ilmu Komputer, Bisnis, Agronomi" },
      { id: 17, nama: "Universitas Padjajaran (UNPAD)", alumni: 3, favorit: "Psikologi, Kedokteran Gigi, HI" },
      { id: 18, nama: "ITB Bandung", alumni: 2, favorit: "STEI, FTTM, SBM" },
      { id: 19, nama: "Universitas Pendidikan Indonesia", alumni: 1, favorit: "Pendidikan Bahasa Inggris" }
    ]
  },
  "DKI Jakarta": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 20, nama: "Universitas Indonesia (UI)", alumni: 1, favorit: "Ilmu Komputer" }
    ]
  },
  "Jawa Tengah": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 21, nama: "Universitas Diponegoro (UNDIP)", alumni: 1, favorit: "Teknik Sipil" }
    ]
  },
  "Bali": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 22, nama: "Universitas Udayana", alumni: 1, favorit: "Kedokteran Hewan" }
    ]
  },
  "Sumatera Utara": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 23, nama: "Universitas Sumatera Utara (USU)", alumni: 1, favorit: "Kedokteran" }
    ]
  },
  "Kalimantan Barat": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 24, nama: "Universitas Tanjungpura", alumni: 1, favorit: "Teknik Lingkungan" }
    ]
  },
  "Kalimantan Timur": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 25, nama: "Universitas Mulawarman", alumni: 1, favorit: "Farmasi" }
    ]
  },
  "Nusa Tenggara Barat": {
    persentase: 0.1,
    totalAlumni: 1,
    kampus: [
      { id: 26, nama: "Universitas Mataram", alumni: 1, favorit: "Teknik Mesin" }
    ]
  }
};

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

export const normalizeProvinceName = (geoName?: string): string => {
  if (!geoName) return "";
  const trimmed = geoName.trim();
  if (trimmed === "Jakarta") return "DKI Jakarta";
  if (trimmed === "Yogyakarta") return "DI Yogyakarta";
  if (trimmed === "D.I. Yogyakarta") return "DI Yogyakarta";
  if (trimmed === "D.K.I. Jakarta") return "DKI Jakarta";
  return trimmed;
};

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

const getProvinceFillColor = (persentase: number): string => {
  if (persentase >= 50) return "#5F089E";
  if (persentase >= 1) return "#7E22CE";
  return "#A855F7";
};

interface ProvinceFeatureItem {
  feature: GeoJSON.Feature<Geometry, { provinsi: string }>;
  name: string;
  pathD: string;
  hasData: boolean;
  persentase: number;
  totalAlumni: number;
  centroidLon: number;
  centerXY: [number, number];
}

const SVG_WIDTH = 900;
const SVG_HEIGHT = 550;

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
  const [featuresList, setFeaturesList] = useState<ProvinceFeatureItem[]>([]);
  const [isOutlineDrawn, setIsOutlineDrawn] = useState(false);
  const [outlineKey, setOutlineKey] = useState(0);

  const projection = useMemo(() => {
    return geoMercator()
      .scale(1050)
      .center([118, -2.5])
      .translate([SVG_WIDTH / 2, SVG_HEIGHT / 2]);
  }, []);

  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  useEffect(() => {
    let isMounted = true;
    fetch("/indonesia-topo.json")
      .then((res) => res.json())
      .then((topoData: Topology<Objects>) => {
        if (!isMounted) return;
        const fc = feature(
          topoData,
          topoData.objects.provinces
        ) as FeatureCollection<Geometry, { provinsi: string }>;

        const mapped: ProvinceFeatureItem[] = fc.features.map((feat) => {
          const rawName = feat.properties?.provinsi || "";
          const match = getProvinceData(rawName);
          const c = geoCentroid(feat);
          const centerPixel = projection(c) || [SVG_WIDTH / 2, SVG_HEIGHT / 2];
          const pathD = pathGenerator(feat) || "";

          return {
            feature: feat,
            name: match ? match.provinceKey : normalizeProvinceName(rawName) || rawName,
            pathD,
            hasData: !!match,
            persentase: match ? match.data.persentase : 0,
            totalAlumni: match ? match.data.totalAlumni : 0,
            centroidLon: c[0] || 0,
            centerXY: centerPixel as [number, number],
          };
        });

        mapped.sort((a, b) => a.centroidLon - b.centroidLon);
        setFeaturesList(mapped);
      })
      .catch((err) => {
        console.error("Gagal memuat peta indonesia-topo.json:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [projection, pathGenerator]);

  const targetScale = useMotionValue(1);
  const targetCenterX = useMotionValue(SVG_WIDTH / 2);
  const targetCenterY = useMotionValue(SVG_HEIGHT / 2);

  const springConfig = { stiffness: 160, damping: 22, mass: 0.7 };
  const smoothScale = useSpring(targetScale, springConfig);
  const smoothCenterX = useSpring(targetCenterX, springConfig);
  const smoothCenterY = useSpring(targetCenterY, springConfig);

  const [activeZoomLevel, setActiveZoomLevel] = useState(1);
  const mapGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const updateSvgMatrix = () => {
      const s = smoothScale.get();
      const cx = smoothCenterX.get();
      const cy = smoothCenterY.get();
      const tx = SVG_WIDTH / 2 - cx * s;
      const ty = SVG_HEIGHT / 2 - cy * s;
      if (mapGroupRef.current) {
        mapGroupRef.current.setAttribute(
          "transform",
          `translate(${tx}, ${ty}) scale(${s})`
        );
      }
    };

    const unsubS = smoothScale.on("change", updateSvgMatrix);
    const unsubX = smoothCenterX.on("change", updateSvgMatrix);
    const unsubY = smoothCenterY.on("change", updateSvgMatrix);

    updateSvgMatrix();

    return () => {
      unsubS();
      unsubX();
      unsubY();
    };
  }, [smoothScale, smoothCenterX, smoothCenterY]);

  const zoomToCoordinates = useCallback(
    (pixelX: number, pixelY: number, targetZoom: number) => {
      targetCenterX.set(pixelX);
      targetCenterY.set(pixelY);
      targetScale.set(targetZoom);
      setActiveZoomLevel(targetZoom);
    },
    [targetCenterX, targetCenterY, targetScale]
  );

  const handleResetNasional = useCallback(() => {
    setSelectedProvince(null);
    setSelectedKampus(null);
    targetCenterX.set(SVG_WIDTH / 2);
    targetCenterY.set(SVG_HEIGHT / 2);
    targetScale.set(1);
    setActiveZoomLevel(1);
  }, [targetCenterX, targetCenterY, targetScale]);

  const handleFocusJatim = useCallback(() => {
    const coords = PROVINCE_CENTROIDS["Jawa Timur"];
    const pixel = projection(coords) || [353.8, 370.7];
    setSelectedProvince("Jawa Timur");
    setSelectedKampus(null);
    setSearchQuery("");
    zoomToCoordinates(pixel[0], pixel[1], 4.2);
  }, [projection, zoomToCoordinates]);

  const handleZoomIn = () => {
    const currentScale = targetScale.get();
    const newScale = Math.min(currentScale * 1.45, 8);
    targetScale.set(newScale);
    setActiveZoomLevel(newScale);
  };

  const handleZoomOut = () => {
    const currentScale = targetScale.get();
    const newScale = Math.max(currentScale / 1.45, 1);
    if (newScale <= 1.08) {
      handleResetNasional();
    } else {
      targetScale.set(newScale);
      setActiveZoomLevel(newScale);
    }
  };

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cx: targetCenterX.get(),
      cy: targetCenterY.get(),
    };
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDraggedRef.current = true;
    }
    const currentS = targetScale.get();
    const newCx = dragStartRef.current.cx - dx / currentS;
    const newCy = dragStartRef.current.cy - dy / currentS;
    targetCenterX.set(newCx);
    targetCenterY.set(newCy);
  };

  const handleSvgMouseUp = () => {
    isDraggingRef.current = false;
  };

  const touchStartRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const touchPinchDistRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        cx: targetCenterX.get(),
        cy: targetCenterY.get(),
      };
      touchPinchDistRef.current = null;
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchPinchDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1 && touchStartRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDraggedRef.current = true;
      }
      const currentS = targetScale.get();
      const newCx = touchStartRef.current.cx - dx / currentS;
      const newCy = touchStartRef.current.cy - dy / currentS;
      targetCenterX.set(newCx);
      targetCenterY.set(newCy);
    } else if (e.touches.length === 2 && touchPinchDistRef.current !== null) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchPinchDistRef.current > 0) {
        const factor = newDist / touchPinchDistRef.current;
        const currentScale = targetScale.get();
        const newScale = Math.min(Math.max(currentScale * factor, 1), 8);
        targetScale.set(newScale);
        setActiveZoomLevel(newScale);
      }
      touchPinchDistRef.current = newDist;
      hasDraggedRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchStartRef.current = null;
    touchPinchDistRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const currentS = targetScale.get();
    const factor = e.deltaY < 0 ? 1.25 : 1 / 1.25;
    const newScale = Math.min(Math.max(currentS * factor, 1), 8);
    if (newScale <= 1.05) {
      handleResetNasional();
    } else {
      targetScale.set(newScale);
      setActiveZoomLevel(newScale);
    }
  };

  const handleReplayIntro = () => {
    setIsOutlineDrawn(false);
    setOutlineKey((prev) => prev + 1);
  };

  const handleProvinceClick = (provName: string) => {
    if (hasDraggedRef.current) return;
    const match = getProvinceData(provName);
    if (!match) return;

    const targetKey = match.provinceKey;
    setSelectedProvince(targetKey);
    setSelectedKampus(null);
    setSearchQuery("");

    const coords = PROVINCE_CENTROIDS[targetKey];
    let pixel: [number, number];
    if (coords) {
      pixel = (projection(coords) as [number, number]) || [SVG_WIDTH / 2, SVG_HEIGHT / 2];
    } else {
      const feat = featuresList.find((f) => f.name === targetKey);
      pixel = feat ? feat.centerXY : [SVG_WIDTH / 2, SVG_HEIGHT / 2];
    }

    const zoomLevel = targetKey === "Jawa Timur" ? 4.2 : 4.8;
    zoomToCoordinates(pixel[0], pixel[1], zoomLevel);
  };

  const handleCloseModal = () => {
    setSelectedProvince(null);
    setSelectedKampus(null);
    setSearchQuery("");
  };

  const currentProvinceData = selectedProvince ? dataPersebaran[selectedProvince] : null;

  const sortedKampus = useMemo(() => {
    if (!currentProvinceData) return [];
    return [...currentProvinceData.kampus].sort((a, b) => b.alumni - a.alumni);
  }, [currentProvinceData]);

  const filteredKampus = useMemo(() => {
    if (!searchQuery.trim()) return sortedKampus;
    const query = searchQuery.toLowerCase();
    return sortedKampus.filter(
      (k) =>
        k.nama.toLowerCase().includes(query) ||
        k.favorit.toLowerCase().includes(query)
    );
  }, [sortedKampus, searchQuery]);

  const currentKampusIndex = useMemo(() => {
    if (!selectedKampus || sortedKampus.length === 0) return -1;
    return sortedKampus.findIndex((k) => k.id === selectedKampus.id);
  }, [selectedKampus, sortedKampus]);

  const handlePrevKampus = useCallback(() => {
    if (sortedKampus.length === 0 || currentKampusIndex === -1) return;
    const prevIdx =
      currentKampusIndex > 0 ? currentKampusIndex - 1 : sortedKampus.length - 1;
    setSelectedKampus(sortedKampus[prevIdx]);
  }, [sortedKampus, currentKampusIndex]);

  const handleNextKampus = useCallback(() => {
    if (sortedKampus.length === 0 || currentKampusIndex === -1) return;
    const nextIdx =
      currentKampusIndex < sortedKampus.length - 1 ? currentKampusIndex + 1 : 0;
    setSelectedKampus(sortedKampus[nextIdx]);
  }, [sortedKampus, currentKampusIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProvince) return;
      if (e.key === "Escape") {
        e.preventDefault();
        if (selectedKampus) {
          setSelectedKampus(null);
        } else {
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

  const handleProvinceMouseEnter = (item: ProvinceFeatureItem, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHoveredProvince({
      name: item.name,
      totalAlumni: item.totalAlumni,
      persentase: item.persentase,
      hasData: item.hasData,
    });
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


  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[620px] sm:h-[650px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#F9F5FD] via-white to-[#F6EEFD] border-2 border-[#5F089E]/25 p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col justify-between select-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-1 border-b border-purple-100 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5F089E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5F089E]"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-[#5F089E] uppercase tracking-wider">
            Peta Sebaran Wilayah Alumni
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReplayIntro}
            title="Ulangi animasi outline gambar peta"
            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#5F089E] bg-white hover:bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3 h-3 text-[#5F089E]" />
            <span>Putar Animasi</span>
          </button>
          <span className="text-[11px] text-slate-500 font-medium hidden md:inline-block">
            Klik provinsi untuk zoom-in & membuka daftar kampus
          </span>
        </div>
      </div>

      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-[#5F089E]/25 shadow-md">
          <button
            type="button"
            onClick={handleResetNasional}
            title="Lihat Peta Nasional Indonesia (Zoom 1x)"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${activeZoomLevel <= 1.2 && !selectedProvince
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
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${selectedProvince === "Jawa Timur"
              ? "bg-[#5F089E] text-white shadow-xs"
              : "text-slate-700 hover:text-[#5F089E] hover:bg-purple-50"
              }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#FCC850]" />
            <span>Fokus Jawa Timur</span>
          </button>

          <div className="h-4 w-px bg-purple-200 mx-0.5" />

          <button
            type="button"
            onClick={handleZoomIn}
            title="Perbesar Peta (+)"
            className="w-7 h-7 rounded-lg sm:rounded-xl text-slate-700 hover:text-[#5F089E] hover:bg-purple-50 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            title="Perkecil Peta (-)"
            className="w-7 h-7 rounded-lg sm:rounded-xl text-slate-700 hover:text-[#5F089E] hover:bg-purple-50 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

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

        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full max-h-full cursor-grab active:cursor-grabbing select-none"
          style={{ overflow: "hidden", touchAction: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={handleSvgMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onWheel={handleWheel}
        >
          <defs>
            <filter id="marker-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#5F089E" floodOpacity="0.4" />
            </filter>
            <linearGradient id="jatim-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5F089E" />
              <stop offset="100%" stopColor="#7E22CE" />
            </linearGradient>
          </defs>

          <g
            ref={mapGroupRef}
            transform="translate(0, 0) scale(1)"
          >
            {/* FITUR 1: ANIMASI PEMBUKA (DRAWING SVG OUTLINE PATH)      */}
            <g key={`outline-${outlineKey}`} className="pointer-events-none">
              {featuresList.map((item, idx) => (
                <motion.path
                  key={`path-stroke-${idx}-${outlineKey}`}
                  d={item.pathD}
                  fill="none"
                  stroke={item.hasData ? "#5F089E" : "#C4B2DC"}
                  strokeWidth={item.hasData ? 1.4 : 0.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: {
                      duration: 1.8,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.05 + idx * 0.02,
                    },
                    opacity: { duration: 0.4, delay: 0.05 + idx * 0.02 },
                  }}
                  onAnimationComplete={() => {
                    if (idx === featuresList.length - 1) {
                      setIsOutlineDrawn(true);
                    }
                  }}
                />
              ))}
            </g>

            {/* FITUR 1 & 3: FILL WILAYAH (STAGGERED FADE-IN & DRILL-DOWN)*/}
            <g className="regions-fill">
              {featuresList.map((item, idx) => {
                const isSelected = selectedProvince === item.name;
                const isOtherFaded = selectedProvince !== null && !isSelected;
                const isHovered =
                  hoveredProvince?.hasData && hoveredProvince?.name === item.name;

                let baseFill = item.hasData
                  ? getProvinceFillColor(item.persentase)
                  : "#EDE8F5";
                if (isSelected) baseFill = "#FCC850";

                return (
                  <motion.path
                    key={`fill-${item.name}-${idx}-${outlineKey}`}
                    d={item.pathD}
                    onClick={() => handleProvinceClick(item.name)}
                    onMouseEnter={(e) => handleProvinceMouseEnter(item, e)}
                    onMouseLeave={handleMouseLeave}
                    vectorEffect="non-scaling-stroke"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{
                      opacity: isOtherFaded ? 0.2 : 1,
                      scale: 1,
                      fill: isSelected
                        ? "#FCC850"
                        : isHovered
                          ? "#FCC850"
                          : baseFill,
                      stroke: isSelected
                        ? "#3D0566"
                        : item.hasData
                          ? "#5F089E"
                          : "#D8CCE8",
                      strokeWidth: isSelected ? 1.8 : item.hasData ? 0.9 : 0.35,
                    }}
                    transition={{
                      opacity: {
                        duration: 0.5,
                        delay: 0.8 + idx * 0.035,
                      },
                      scale: {
                        duration: 0.6,
                        delay: 0.8 + idx * 0.035,
                        ease: "easeOut",
                      },
                      fill: { duration: 0.25 },
                      stroke: { duration: 0.25 },
                    }}
                    style={{
                      transformOrigin: `${item.centerXY[0]}px ${item.centerXY[1]}px`,
                      cursor: item.hasData ? "pointer" : "default",
                      outline: "none",
                    }}
                    className={
                      item.hasData
                        ? "transition-[filter] duration-200 hover:drop-shadow-sm"
                        : ""
                    }
                  />
                );
              })}
            </g>

            {/* FITUR 2: ANIMASI RIAK AKTIF (CONTINUOUS RIPPLE EFFECT)    */}
            <g className="ripple-markers">
              {Object.entries(dataPersebaran).map(([provName, provData]) => {
                const coords = PROVINCE_CENTROIDS[provName];
                if (!coords) return null;
                const pixel = projection(coords) || [0, 0];
                const cx = pixel[0];
                const cy = pixel[1];

                const isSelected = selectedProvince === provName;
                const isHovered = hoveredProvince?.name === provName;
                const isOtherFaded = selectedProvince !== null && !isSelected;

                return (
                  <g
                    key={`ripple-group-${provName}`}
                    className="cursor-pointer"
                    onClick={() => handleProvinceClick(provName)}
                    onMouseEnter={(e) => {
                      const feat = featuresList.find((f) => f.name === provName);
                      if (feat) handleProvinceMouseEnter(feat, e);
                    }}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      opacity: isOtherFaded ? 0.2 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r={7}
                      fill="none"
                      stroke="#5F089E"
                      strokeWidth={1.8}
                      initial={{ r: 6, opacity: 0.8 }}
                      animate={{
                        r: [6, 26],
                        opacity: [0.8, 0],
                        strokeWidth: [2, 0.4],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />

                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="none"
                      stroke={isSelected ? "#FCC850" : "#7E22CE"}
                      strokeWidth={1.5}
                      initial={{ r: 5, opacity: 0.7 }}
                      animate={{
                        r: [5, 20],
                        opacity: [0.7, 0],
                        strokeWidth: [1.8, 0.3],
                      }}
                      transition={{
                        duration: 2.2,
                        delay: 0.7,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />

                    {(isHovered || isSelected) && (
                      <motion.circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="#FCC850"
                        opacity={0.35}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.35 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected || isHovered ? 7.5 : 5.5}
                      fill={isSelected || isHovered ? "#FCC850" : "#5F089E"}
                      stroke="#FFFFFF"
                      strokeWidth={1.8}
                      filter="url(#marker-glow)"
                      className="transition-all duration-200"
                    />

                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected || isHovered ? 3.2 : 2.2}
                      fill={isSelected || isHovered ? "#5F089E" : "#FCC850"}
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

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

      {/* FITUR 4: POP-UP MODAL & LIST ANIMASI (SPRING & STAGGER)  */}
      <AnimatePresence>
        {selectedProvince && currentProvinceData && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              key="modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 26,
              }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full border border-purple-100 relative overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* LEVEL 2: DETAIL KAMPUS SPESIFIK                     */}
              {selectedKampus ? (
                <div className="flex flex-col h-full overflow-hidden">
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

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Tutup Modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Detail Kampus */}
                  <motion.div
                    key={`detail-${selectedKampus.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="p-5 sm:p-6 overflow-y-auto space-y-4"
                  >
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

                    <Link
                      href="/admin?tab=direktori&role=siswa"
                      onClick={handleCloseModal}
                      className="w-full py-3 px-4 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] active:bg-[#3d0566] text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
                    >
                      <span>Lihat Direktori Alumni Lengkap</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </div>
              ) : (
                /* LEVEL 1: DAFTAR KAMPUS DENGAN STAGGERED SPRING      */
                <div className="flex flex-col h-full overflow-hidden">
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

                  <div className="px-5 py-2.5 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>Daftar Kampus Berdasarkan Jumlah Alumni:</span>
                    <span className="text-[11px] text-[#5F089E] font-bold">
                      Klik kartu untuk detail
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 max-h-[380px]">
                    {filteredKampus.length > 0 ? (
                      <motion.div
                        className="space-y-2.5"
                        initial="hidden"
                        animate="show"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.05,
                            },
                          },
                        }}
                      >
                        {filteredKampus.map((kampus, index) => {
                          const rank = index + 1;
                          const persentaseProv = (
                            (kampus.alumni / currentProvinceData.totalAlumni) *
                            100
                          ).toFixed(1);

                          return (
                            <motion.div
                              key={kampus.id}
                              variants={{
                                hidden: { opacity: 0, y: 22, scale: 0.95 },
                                show: {
                                  opacity: 1,
                                  y: 0,
                                  scale: 1,
                                  transition: {
                                    type: "spring",
                                    stiffness: 280,
                                    damping: 22,
                                  },
                                },
                              }}
                              whileHover={{ scale: 1.015, x: 3 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedKampus(kampus)}
                              className="group p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-purple-100 hover:border-[#5F089E] bg-white hover:bg-purple-50/60 transition-colors duration-200 cursor-pointer shadow-2xs hover:shadow-md flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${rank === 1
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

                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#5F089E] transition-colors truncate">
                                    {kampus.nama}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 truncate font-medium mt-0.5">
                                    Favorit: {kampus.favorit}
                                  </p>
                                </div>
                              </div>

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
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        Tidak ada kampus yang cocok dengan pencarian &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </div>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
