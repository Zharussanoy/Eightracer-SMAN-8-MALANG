"use client";

import Link from "next/link";
import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import B4Shell, { Avatar } from "./B4Shell";
import { publishedFor, useDemoData } from "./demoStore";
import { RecommendationEvaluation } from "./RecommendationParts";

export default function StudentRecommendationsPage() {
  const data = useDemoData();
  const items = publishedFor(data, data.viewerId);
  return <B4Shell student title="Rekomendasi Beasiswa" description="Temukan peluang beasiswa yang sesuai dengan profil dan perjalanan akademikmu."><div className="bc4-note"><ShieldCheck size={35} /><div><strong>Rekomendasi Telah Ditinjau Sekolah</strong><p>Beasiswa yang ditampilkan telah ditinjau dan dipublikasikan Admin/BK pada pratinjau ini.</p></div></div><h2 className="bc4-listTitle">Rekomendasi Beasiswa Untukmu</h2>{items.length ? <div className="bc4-grid3 bc4-resultCards">{items.map((item, index) => {
    const catalog = data.catalog.find((entry) => entry.id === item.scholarshipId)!;
    return <article className="bc4-panel bc4-scholarCard" key={item.id}><h3><GraduationCap size={29} />{catalog.name}</h3><dl className="bc4-metrics"><div><dt>Jenjang</dt><dd>{catalog.level}</dd></div><div><dt>Pendanaan</dt><dd>{catalog.funding}</dd></div><div><dt>Periode</dt><dd>{catalog.applyPeriod}</dd></div></dl><p className="bc4-reason">{item.reason}</p><Link className={`bc4-button ${index === 0 ? "bc4-primary" : ""}`} href={`/siswa/rekomendasi-beasiswa/${item.id}`}>Lihat Detail Rekomendasi</Link></article>;
  })}</div> : <div className="bc4-empty">Belum ada rekomendasi yang dipublikasikan untuk profil ini. Rekomendasi akan muncul setelah ditinjau admin.</div>}<div className="bc4-note" style={{ marginTop: 35 }}><Sparkles size={36} /><div><strong>Masih Ingin Mencari Informasi Beasiswa?</strong><p>Pelajari rekomendasimu melalui contoh percakapan Eightracer AI.</p></div><Link href="/siswa/rekomendasi-beasiswa/chat" className="bc4-button bc4-primary">Tanya Eightracer AI</Link></div></B4Shell>;
}

export function StudentRecommendationDetail({ id }: { id: string }) {
  const data = useDemoData();
  const item = publishedFor(data, data.viewerId).find((entry) => entry.id === id);
  const catalog = data.catalog.find((entry) => entry.id === item?.scholarshipId);
  return <B4Shell student title="Detail Rekomendasi Beasiswa" description="Pelajari informasi dan alasan kecocokan beasiswa yang direkomendasikan untukmu." parent={{ label: "Rekomendasi Beasiswa", href: "/siswa/rekomendasi-beasiswa" }}>{!item || !catalog ? <div className="bc4-empty">Rekomendasi tidak tersedia untuk profil ini atau belum dipublikasikan. <Link href="/siswa/rekomendasi-beasiswa">Kembali ke rekomendasi</Link></div> : <><section className="bc4-panel bc4-recommendationHeader"><GraduationCap size={45} /><div style={{ flex: 1 }}><h3>{catalog.name}</h3><p>{catalog.provider} · {catalog.level}</p></div><div className="bc4-score"><span>Skor Kecocokan (contoh)</span><strong>{item.score}/100</strong></div></section><div className="bc4-note" style={{ marginTop: 28 }}><div><strong>Alasan Kecocokan</strong><p>{item.reason}</p></div></div><div className="bc4-detailRecGrid"><div><section className="bc4-panel"><h2>Evaluasi Kriteria Siswa</h2><RecommendationEvaluation /></section><section className="bc4-panel"><h2>Referensi dari Jejak Alumni</h2><div className="bc4-yellowCard"><div className="bc4-profile" style={{ padding: 0, border: 0 }}><Avatar name="Dian Permata Sari" /><div><h2>Dian Permata Sari</h2><p>Universitas Indonesia · S1 Psikologi</p><span className="bc4-tag">SNBP</span><span className="bc4-tag">Angkatan 2021</span></div></div><p style={{ margin: "15px 0" }}>Contoh referensi perjalanan alumni untuk dipelajari; bukan jaminan kelulusan seleksi.</p><Link className="bc4-button" href="/siswa/jejak-alumni/dian">Lihat Jejak Alumni</Link></div></section></div><div><aside className="bc4-panel"><h2>Informasi Beasiswa</h2><dl className="bc4-facts">{[["Penyelenggara", catalog.provider], ["Jenjang", catalog.level], ["Pendanaan", catalog.funding], ["Periode", catalog.applyPeriod], ["Waktu yang Disarankan", item.timing]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></aside><aside className="bc4-aiCta"><h2>Masih ada yang ingin kamu ketahui?</h2><p>Tanyakan lebih lanjut tentang beasiswa ini pada percakapan demo.</p><Link className="bc4-button" href={`/siswa/rekomendasi-beasiswa/chat?beasiswa=${encodeURIComponent(item.id)}`}>Tanya tentang beasiswa ini</Link></aside></div></div></>}</B4Shell>;
}
