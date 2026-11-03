import AdminB2Dashboard from "@/components/admin/b-2/AdminB2Dashboard";

export const metadata = {
  title: "Admin B2 - Rekam Data Siswa | Eightracer SMAN 8 Malang",
  description:
    "Portal Admin B2 untuk pengelolaan rekam data siswa, ranking eligibilitas SNBP, dan direktori angkatan.",
};

export default function AdminB2Page() {
  return (
    <div className="min-h-screen bg-[#FDFBFD] flex flex-col selection:bg-purple-100">
      <main className="flex-1 w-full flex flex-col">
        <AdminB2Dashboard />
      </main>
    </div>
  );
}

