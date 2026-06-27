import { requireRole } from "@/lib/auth-utils";
import { AdminDashboardContent } from "@/features/dashboard/components/AdminDashboardContent";

export const metadata = {
  title: "Dashboard Administrasi - SMDP Portal",
  description: "Dashboard Administrasi Kepegawaian.",
};

export default async function AdministrasiDashboardPage() {
  await requireRole(["HR_ADMIN", "STAFF"]);
  return <AdminDashboardContent />;
}
