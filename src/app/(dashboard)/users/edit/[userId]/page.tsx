import { requireRole } from "@/lib/auth-utils";
import { EditUserView } from "@/features/users/components/EditUserView";

export const metadata = {
  title: "Edit Pegawai - SMDP Portal",
  description: "Perbarui profil dan otorisasi akun pegawai.",
};

interface EditUserPageProps {
  params: Promise<{ userId: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  await requireRole(["HR_ADMIN"]);
  const { userId } = await params;
  return <EditUserView userId={userId} />;
}
