import React from "react";
import { TrendingUp } from "lucide-react";

interface DonutSegmentConfig {
  id: "sesuai" | "penyesuaian" | "peninjauan";
  label: string;
  badgeLabel: string;
  count: number;
  percentage: number;
  percentageText: string;
  color: string;
  bgColor: string;
  textColor: string;
  tooltipText: string;
}

const SEGMENTS: DonutSegmentConfig[] = [
  {
    id: "sesuai",
    label: "Sesuai",
    badgeLabel: "SESUAI",
    count: 355,
    percentage: 92.4,
    percentageText: "92.4%",
    color: "#5F089E",
    bgColor: "bg-purple-50",
    textColor: "text-slate-900",
    tooltipText: "355 Siswa • Rekomendasi Peminatan Selaras",
  },
  {
    id: "penyesuaian",
    label: "Perlu Penyesuaian",
    badgeLabel: "PENYESUAIAN",
    count: 21,
    percentage: 5.5,
    percentageText: "5.5%",
    color: "#FCC850",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    tooltipText: "21 Siswa • Diskrepansi Ringan Minat / Rapor",
  },
  {
    id: "peninjauan",
    label: "Perlu Peninjauan",
    badgeLabel: "PENINJAUAN",
    count: 8,
    percentage: 2.1,
    percentageText: "2.1%",
    color: "#DC2626",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
    tooltipText: "8 Siswa • Kontradiktif, Perlu Konseling Lanjutan",
  },
];

const CIRCUMFERENCE = 364.4; // 2 * PI * 58

interface AdminB1AlignmentChartProps {
  onShowToast?: (msg: string) => void;
}

export const AdminB1AlignmentChart: React.FC<AdminB1AlignmentChartProps> = React.memo(
  function AdminB1AlignmentChart({ onShowToast }) {
    const [hoveredSegment, setHoveredSegment] = React.useState<
      "sesuai" | "penyesuaian" | "peninjauan" | null
    >(null);

    const activeInfo = React.useMemo(() => {
      if (!hoveredSegment) {
        return {
          percentage: "92.4%",
          label: "TINGKAT KECOCOKAN",
          tooltip: null,
        };
      }
      const found = SEGMENTS.find((s) => s.id === hoveredSegment);
      return {
        percentage: found?.percentageText ?? "92.4%",
        label: found?.badgeLabel ?? "TINGKAT KECOCOKAN",
        tooltip: found?.tooltipText ?? null,
      };
    }, [hoveredSegment]);

    const handleSegmentEnter = React.useCallback(
      (id: "sesuai" | "penyesuaian" | "peninjauan") => {
        setHoveredSegment(id);
      },
      []
    );

    const handleSegmentLeave = React.useCallback(() => {
      setHoveredSegment(null);
    }, []);

    // SVG dash array calculations
    const sesuaiDash = (92.4 / 100) * CIRCUMFERENCE;
    const penyesuaianDash = (5.5 / 100) * CIRCUMFERENCE;
    const peninjauanDash = (2.1 / 100) * CIRCUMFERENCE;

    const penyesuaianOffset = -sesuaiDash;
    const peninjauanOffset = -(sesuaiDash + penyesuaianDash);

    return (
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Analisis Keselarasan Peminatan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kesesuaian RIASEC dan Nilai Rapor
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[#5F089E] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Donut Chart */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Donut */}
            <svg
              className="w-full h-full -rotate-90 pointer-events-auto"
              viewBox="0 0 160 160"
            >
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r="58"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="18"
              />
              {/* Main Purple Segment (Sesuai: 92.4%) */}
              <circle
                cx="80"
                cy="80"
                r="58"
                fill="none"
                stroke="#5F089E"
                strokeWidth="18"
                strokeDasharray={`${sesuaiDash} ${CIRCUMFERENCE}`}
                strokeDashoffset="0"
                strokeLinecap="butt"
                opacity={hoveredSegment && hoveredSegment !== "sesuai" ? 0.45 : 1}
                className="cursor-pointer transition-opacity duration-150"
                onPointerEnter={() => handleSegmentEnter("sesuai")}
                onPointerLeave={handleSegmentLeave}
              />
              {/* Yellow Segment (Perlu Penyesuaian: 5.5%) */}
              <circle
                cx="80"
                cy="80"
                r="58"
                fill="none"
                stroke="#FCC850"
                strokeWidth="18"
                strokeDasharray={`${penyesuaianDash} ${CIRCUMFERENCE}`}
                strokeDashoffset={`${penyesuaianOffset}`}
                strokeLinecap="butt"
                opacity={hoveredSegment && hoveredSegment !== "penyesuaian" ? 0.45 : 1}
                className="cursor-pointer transition-opacity duration-150"
                onPointerEnter={() => handleSegmentEnter("penyesuaian")}
                onPointerLeave={handleSegmentLeave}
              />
              {/* Red Segment (Perlu Peninjauan: 2.1%) */}
              <circle
                cx="80"
                cy="80"
                r="58"
                fill="none"
                stroke="#DC2626"
                strokeWidth="18"
                strokeDasharray={`${peninjauanDash} ${CIRCUMFERENCE}`}
                strokeDashoffset={`${peninjauanOffset}`}
                strokeLinecap="butt"
                opacity={hoveredSegment && hoveredSegment !== "peninjauan" ? 0.45 : 1}
                className="cursor-pointer transition-opacity duration-150"
                onPointerEnter={() => handleSegmentEnter("peninjauan")}
                onPointerLeave={handleSegmentLeave}
              />
            </svg>

            {/* Donut Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2 select-none">
              <span className="text-3xl font-black text-slate-900 leading-none tabular-nums">
                {activeInfo.percentage}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5 leading-tight">
                {activeInfo.label}
              </span>
            </div>
          </div>

          {/* Dynamic Tooltip Info Container (Fixed height to prevent layout shift) */}
          <div className="h-7 mt-2 flex items-center justify-center">
            {activeInfo.tooltip ? (
              <div className="text-xs font-medium text-[#5F089E] bg-purple-50 px-3 py-1 rounded-full whitespace-nowrap shadow-sm border border-purple-100">
                {activeInfo.tooltip}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 font-medium">
                Arahkan kursor pada segmen untuk detail
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 pt-1 text-xs sm:text-sm">
          {SEGMENTS.map((seg) => {
            const isHovered = hoveredSegment === seg.id;
            return (
              <div
                key={seg.id}
                className={`flex items-center justify-between p-2 rounded-xl transition-colors duration-150 cursor-pointer ${
                  isHovered ? seg.bgColor : "hover:bg-slate-50"
                }`}
                onPointerEnter={() => handleSegmentEnter(seg.id)}
                onPointerLeave={handleSegmentLeave}
                onClick={() =>
                  onShowToast?.(
                    `Kategori ${seg.label}: ${seg.count} Siswa (${seg.percentageText}) - ${seg.tooltipText}`
                  )
                }
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-slate-700 font-medium">{seg.label}</span>
                </div>
                <span className={`font-bold ${seg.textColor}`}>
                  {seg.count} Siswa
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

