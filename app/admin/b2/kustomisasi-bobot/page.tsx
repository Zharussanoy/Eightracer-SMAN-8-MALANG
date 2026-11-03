import KustomisasiBobotRanking from "@/components/admin/b-2/KustomisasiBobotRanking";

export const metadata = {
  title: "Kustomisasi Bobot Ranking | Admin B2 SMAN 8 Malang",
  description:
    "Sesuaikan persentase kontribusi setiap variabel penilaian ranking eligibilitas SNBP siswa B2.",
};

export default function KustomisasiBobotPage() {
  return (
    <div className="min-h-screen bg-[#FDFBFD] flex flex-col selection:bg-purple-100">
      <main className="flex-1 w-full flex flex-col">
        <KustomisasiBobotRanking />
      </main>
    </div>
  );
}

