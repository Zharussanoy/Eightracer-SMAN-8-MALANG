import { Suspense } from "react";
import ScholarshipChatPage from "@/components/b4/ScholarshipChatPage";
async function Chat({ searchParams }: { searchParams: Promise<{ beasiswa?: string }> }) { const { beasiswa } = await searchParams; return <ScholarshipChatPage recommendationId={beasiswa} />; }
export default function Page(props: { searchParams: Promise<{ beasiswa?: string }> }) { return <Suspense fallback={<p>Memuat percakapan…</p>}><Chat {...props} /></Suspense>; }
