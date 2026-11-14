"use client";
import { displayTitle } from "@/lib/display-copy";

export interface AnalyticsBar { label: string; count: number | null }

export function AnalyticsBars({ data, label }: { data: AnalyticsBar[]; label: string }) {
  if (!data.length) return <p className="bc4-empty">Belum ada data untuk grafik ini.</p>;
  const max = Math.max(0, ...data.map((item) => item.count ?? 0));
  return <div className="bc4-liveChart" role="region" aria-label={label} tabIndex={0}><ol className="bc4-liveBars">{data.map((item, index) => <li key={`${item.label}:${index}`}>
    <div className="bc4-liveBarArea"><strong>{item.count === null ? "Belum tercatat" : item.count.toLocaleString("id-ID")}</strong><span style={{ height: `${item.count !== null && max > 0 ? item.count / max * 160 : 0}px` }} /></div>
    <span>{displayTitle(item.label)}</span>
  </li>)}</ol></div>;
}

export function AnalyticsDistribution({ data }: { data: AnalyticsBar[] }) {
  const max = Math.max(0, ...data.map((item) => item.count ?? 0));
  return data.length ? <div className="b4-scholarshipBars">{data.map((item, index) => <div className="b4-scholarshipBarRow" key={`${item.label}:${index}`}>
    <div><span>{displayTitle(item.label)}</span><strong>{item.count === null ? "Belum tercatat" : `${item.count.toLocaleString("id-ID")} Alumni`}</strong></div>
    <span className="b4-scholarshipTrack"><span style={{ width: `${item.count !== null && max > 0 ? item.count / max * 100 : 0}%` }} /></span>
  </div>)}</div> : <p className="bc4-empty">Belum ada distribusi beasiswa yang tercatat.</p>;
}
