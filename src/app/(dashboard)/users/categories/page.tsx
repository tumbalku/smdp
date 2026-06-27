import { requireRole } from "@/lib/auth-utils";
import { CategoriesView } from "@/features/users/components/CategoriesView";

export const metadata = {
  title: "Kelola Kategori Kepegawaian - SMDP Portal",
  description: "Kelola status kepegawaian, kelompok profesi, jabatan, serta pangkat & golongan.",
};

export default async function CategoriesManagementPage() {
  await requireRole(["HR_ADMIN"]);
  return <CategoriesView />;
}
