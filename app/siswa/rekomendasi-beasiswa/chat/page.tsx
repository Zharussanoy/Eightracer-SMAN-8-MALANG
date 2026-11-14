import { Suspense } from "react";
import ScholarshipChatPage from "@/components/b4/ScholarshipChatPage";
type Query = { beasiswa?: string | string[]; target_jenjang?: string | string[] };
async function Chat({ searchParams }: { searchParams: Promise<Query> }) {
  const { beasiswa, target_jenjang } = await searchParams;
  const validId = typeof beasiswa === "string" && /^[1-9]\d*$/.test(beasiswa) && Number.isSafeInteger(Number(beasiswa));
  const validLevel = target_jenjang === "SMA" || target_jenjang === "Kuliah";
  return <ScholarshipChatPage scholarshipId={validId ? Number(beasiswa) : undefined} targetLevel={validLevel ? target_jenjang : undefined} invalidContext={(beasiswa !== undefined && !validId) || (target_jenjang !== undefined && !validLevel)} />;
}
export default function Page(props: { searchParams: Promise<Query> }) { return <Suspense fallback={<p>Memuat percakapan…</p>}><Chat {...props} /></Suspense>; }
