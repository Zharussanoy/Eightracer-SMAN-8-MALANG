import { CheckCircle2, CircleHelp } from "lucide-react";

export function RecommendationEvaluation() {
  return <div>
    <div className="bc4-evaluation"><CheckCircle2 size={32} /><span>Nilai Rapor Terpenuhi: Rata-rata contoh 91,8 melampaui batas minimal persyaratan (85,0).</span></div>
    <div className="bc4-evaluation"><CheckCircle2 size={32} /><span>Sertifikat Prestasi: Piagam contoh tercatat dan telah ditinjau sekolah.</span></div>
    <div className="bc4-evaluation bc4-pending"><CircleHelp size={32} /><span>Persyaratan LoA: Belum dapat dinilai karena informasi penerimaan perguruan tinggi belum tersedia.</span></div>
  </div>;
}
