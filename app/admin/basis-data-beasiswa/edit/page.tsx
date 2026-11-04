import ScholarshipEditorPage from "@/components/b4/ScholarshipEditorPage";
import { Suspense } from "react";
async function Editor({ searchParams }: { searchParams: Promise<{ id?: string }> }) { const { id } = await searchParams; return <ScholarshipEditorPage id={id ?? "not-found"} />; }
export default function Page(props: { searchParams: Promise<{ id?: string }> }) { return <Suspense fallback={<p>Memuat formulir beasiswa…</p>}><Editor {...props} /></Suspense>; }
