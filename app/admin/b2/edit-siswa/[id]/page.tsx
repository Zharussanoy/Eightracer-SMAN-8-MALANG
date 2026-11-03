import InputDataAkademikSiswa from "@/components/admin/b-2/InputDataAkademikSiswa";

export const metadata = {
  title: "Input Data Akademik Siswa | Admin B2 SMAN 8 Malang",
  description:
    "Formulir input dan kelola data akademik siswa B2 (Nilai Rapor, Prestasi, Kehadiran, RIASEC, Catatan Karakter, TKA, Kecerdasan Majemuk).",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSiswaPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-[#FAF7FC] flex flex-col selection:bg-purple-100">
      <main className="flex-1 w-full">
        <InputDataAkademikSiswa siswaId={resolvedParams.id} />
      </main>
    </div>
  );
}
