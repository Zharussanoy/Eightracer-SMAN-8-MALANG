"use client";

import { useState } from "react";

export interface AlignmentDataProps {
  tingkatKecocokanPersen?: number;
  sesuai?: { jumlah_siswa: number; persentase: number };
  perluPenyesuaian?: { jumlah_siswa: number; persentase: number };
  perluPeninjauan?: { jumlah_siswa: number; persentase: number };
}

interface SegmentData {
  id: string;
  label: string;
  students: number;
  percentage: number;
  color: string;
  hoverColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export default function AdminB1AlignmentChart({
  data,
}: {
  data?: AlignmentDataProps;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const segments: SegmentData[] = [
    {
      id: "sesuai",
      label: "Sesuai",
      students: data?.sesuai?.jumlah_siswa ?? 0,
      percentage: data?.sesuai?.persentase ?? 0,
      color: "#5F089E",
      hoverColor: "#4d0680",
      badgeBg: "bg-purple-50",
      badgeText: "text-[#5F089E]",
      description: "Minat RIASEC & capaian nilai rapor sangat selaras",
    },
    {
      id: "penyesuaian",
      label: "Perlu Penyesuaian",
      students: data?.perluPenyesuaian?.jumlah_siswa ?? 0,
      percentage: data?.perluPenyesuaian?.persentase ?? 0,
      color: "#A855F7",
      hoverColor: "#9333EA",
      badgeBg: "bg-purple-50/70",
      badgeText: "text-purple-700",
      description: "Minat sesuai namun beberapa nilai mapel pendukung di bawah KKM",
    },
    {
      id: "peninjauan",
      label: "Perlu Peninjauan",
      students: data?.perluPeninjauan?.jumlah_siswa ?? 0,
      percentage: data?.perluPeninjauan?.persentase ?? 0,
      color: "#FCC850",
      hoverColor: "#EAB308",
      badgeBg: "bg-amber-50",
      badgeText: "text-amber-700",
      description: "Terdapat perbedaan signifikan antara profil RIASEC & nilai akademik",
    },
  ];

  const activeSegment = segments.find((s) => s.id === hoveredId) || null;
  const totalPercentage = data?.tingkatKecocokanPersen ?? segments[0].percentage;

  const size = 180;
  const strokeWidth = 22;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const hasAnyStudents = segments.some((s) => s.students > 0);

  const renderedSegments = segments.reduce<
    Array<
      SegmentData & {
        dashArray: string;
        dashOffset: number;
      }
    >
  >((acc, seg) => {
    const prevCumulative = acc.reduce((sum, item) => sum + item.percentage, 0);
    const segLength = (seg.percentage / 100) * circumference;
    const gap = seg.percentage > 0 ? 3 : 0;
    const adjustedLength = Math.max(0, segLength - gap);
    const dashArray = `${adjustedLength} ${circumference - adjustedLength}`;
    const dashOffset = -((prevCumulative / 100) * circumference);

    acc.push({
      ...seg,
      dashArray,
      dashOffset,
    });
    return acc;
  }, []);

  return (
    <div className="bg-white border border-[#E9E9E9] rounded-2xl p-6 flex flex-col justify-between shadow-[0px_1px_3px_rgba(0,0,0,0.02)] hover:border-purple-200 transition-colors">
      <div>
        <h3 className="text-base font-bold text-[#1E1E1E]">
          Analisis Keselarasan Peminatan
        </h3>
        <p className="text-xs text-[#737373] mt-0.5 mb-5">
          Kesesuaian RIASEC dan Nilai Rapor
        </p>
      </div>

      {/* Interactive SVG Donut Chart */}
      <div className="relative w-44 h-44 mx-auto my-1 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 transform overflow-visible"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F5F3F7"
            strokeWidth={strokeWidth}
          />

          {hasAnyStudents &&
            renderedSegments.map((seg) => {
              const isHovered = hoveredId === seg.id;
              const isDimmed = hoveredId !== null && !isHovered;

              return (
                <circle
                  key={seg.id}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={isHovered ? seg.hoverColor : seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    opacity: isDimmed ? 0.45 : 1,
                    filter: isHovered
                      ? "drop-shadow(0px 4px 8px rgba(95, 8, 158, 0.22))"
                      : "none",
                  }}
                  onMouseEnter={() => setHoveredId(seg.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              );
            })}
        </svg>

        <div className="absolute inset-4 rounded-full flex flex-col items-center justify-center text-center px-2 pointer-events-none transition-all duration-200">
          {activeSegment ? (
            <>
              <span
                className="text-2xl font-extrabold leading-none transition-colors"
                style={{ color: activeSegment.color === "#FCC850" ? "#B45309" : activeSegment.color }}
              >
                {activeSegment.percentage}%
              </span>
              <span className="text-[11px] font-bold text-[#1E1E1E] mt-1 leading-tight">
                {activeSegment.students} Siswa
              </span>
              <span className="text-[9px] text-[#737373] mt-0.5 leading-tight line-clamp-1">
                {activeSegment.label}
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-extrabold text-[#5F089E] leading-none">
                {totalPercentage}%
              </span>
              <span className="text-[10px] font-semibold text-[#737373] mt-1">
                Tingkat Kecocokan
              </span>
            </>
          )}
        </div>
      </div>

      <div className="min-h-[34px] flex items-center justify-center text-center px-2 my-2">
        {activeSegment ? (
          <p className="text-[11px] text-[#5F089E] bg-purple-50/80 border border-purple-100 rounded-lg px-2.5 py-1 font-medium animate-in fade-in duration-150">
            {activeSegment.description}
          </p>
        ) : (
          <p className="text-[11px] text-[#999999]">
            Arahkan kursor pada grafik atau daftar di bawah untuk detail rincian
          </p>
        )}
      </div>

      {/* Interactive Legend List */}
      <div className="space-y-1.5 text-xs pt-3 border-t border-[#F5F5F5]">
        {segments.map((seg) => {
          const isHovered = hoveredId === seg.id;
          return (
            <div
              key={seg.id}
              onMouseEnter={() => setHoveredId(seg.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                isHovered
                  ? "bg-purple-50/90 shadow-2xs scale-[1.01]"
                  : "hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2 text-[#1E1E1E] font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full transition-transform"
                  style={{
                    backgroundColor: seg.color,
                    transform: isHovered ? "scale(1.3)" : "scale(1)",
                  }}
                />
                {seg.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1E1E1E]">
                  {seg.students} Siswa
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${seg.badgeBg} ${seg.badgeText}`}
                >
                  {seg.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
