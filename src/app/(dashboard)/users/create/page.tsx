import { requireRole } from "@/lib/auth-utils";
import { CreateUserView } from "@/features/users/components/CreateUserView";

export const metadata = {
  title: "Tambah Pegawai Baru - SMDP Portal",
  description: "Daftarkan akun pegawai baru dan atur otorisasi perannya.",
};

export default async function CreateUserPage() {
  await requireRole(["HR_ADMIN"]);
  return <CreateUserView />;
}
