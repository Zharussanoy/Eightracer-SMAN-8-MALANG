import { Suspense } from "react";
import InputDataAkademikSiswa from "@/components/admin/b-2/InputDataAkademikSiswa";
import Footer from "@/components/shared/Footer";

export const metadata = {
  title: "Input Data Akademik Siswa | Admin B2 SMAN 8 Malang",
  description:
    "Formulir input dan kelola data akademik siswa B2 (Nilai Rapor, Prestasi, Kehadiran, RIASEC, Catatan Karakter, TKA, Kecerdasan Majemuk).",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EditSiswaContent({ params }: PageProps) {
  const resolvedParams = await params;
  return <InputDataAkademikSiswa siswaId={resolvedParams.id} />;
}

export default function EditSiswaPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-[#FAF7FC] flex flex-col selection:bg-purple-100">
      <main className="flex-1 w-full">
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat formulir siswa...</div>}>
          <EditSiswaContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
