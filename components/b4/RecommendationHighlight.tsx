import {Star} from "lucide-react";
import type {RecommendationCandidate} from "@/lib/b4-recommendations";
export default function RecommendationHighlight({candidate}:{candidate:RecommendationCandidate}){
 const r=candidate.ranking;
 if(!r.highlighted||r.rank!==1||candidate.checklist.some(c=>c.status==="belum_terpenuhi"))return null;
 const valid=r.highlightLabel==="Prioritas Dipelajari"?candidate.complete===false&&r.reason==="exploration_only"&&r.status==="applied"&&r.similarity!==null&&r.similarity>0
  :["Paling Sesuai","Pilihan Sesuai Kriteria"].includes(r.highlightLabel??"")&&candidate.complete===true&&candidate.meets===true;
 if(!valid)return null;
 return <span className="bc4-topRecommendation" title={r.highlightReason??undefined}><Star size={16} fill="currentColor" aria-hidden="true"/>{r.highlightLabel}</span>;
}
