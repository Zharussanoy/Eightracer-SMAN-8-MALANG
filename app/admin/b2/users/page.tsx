import ManajemenUsers from "@/components/admin/b-2/ManajemenUsers";

export const metadata = {
  title: "Manajemen Pengguna & Hak Akses | Admin B2 SMAN 8 Malang",
  description:
    "Kelola data akun pengguna, role hak akses (Administrator, Guru, Siswa), dan reset kata sandi sistem Eightracer.",
};

export default function UsersAdminPage() {
  return <ManajemenUsers />;
}
