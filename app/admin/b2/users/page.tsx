import ManajemenUsers from "@/components/admin/b-2/ManajemenUsers";
import Footer from "@/components/shared/Footer";

export const metadata = {
  title: "Manajemen Pengguna & Hak Akses | Admin B2 SMAN 8 Malang",
  description:
    "Kelola data akun pengguna, role hak akses (Administrator, Guru, Siswa), dan reset kata sandi sistem Eightracer.",
};

export default function UsersAdminPage() {
  return (
    <div className="min-h-screen bg-[#FDFBFD] flex flex-col selection:bg-purple-100">
      <main className="flex-1 w-full flex flex-col">
        <ManajemenUsers />
      </main>
      <Footer />
    </div>
  );
}
