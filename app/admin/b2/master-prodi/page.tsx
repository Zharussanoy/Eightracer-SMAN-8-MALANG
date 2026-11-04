import ManajemenMasterProdi from "@/components/admin/b-2/ManajemenMasterProdi";

export const metadata = {
  title: "Manajemen Master Program Studi & Kuota SNBP PTN | Admin B2 SMAN 8 Malang",
  description:
    "Portal Admin B2 untuk pengelolaan master klaster program studi, pemetaan kelompok rumpun, profil minat RIASEC, kecerdasan majemuk, serta kuota eligibilitas daya tampung SNBP PTN.",
};

export default function MasterProdiPage() {
  return (
    <div className="min-h-screen bg-[#FDFBFD] flex flex-col selection:bg-purple-100">
      <main className="flex-1 w-full">
        <ManajemenMasterProdi />
      </main>
    </div>
  );
}
