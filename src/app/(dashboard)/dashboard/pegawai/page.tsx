import { requireRole } from "@/lib/auth-utils";
import { EmployeeView } from "@/features/dashboard/components/EmployeeView";

export const metadata = {
  title: "Dashboard Pegawai - SMDP Portal",
  description: "Portal Kepatuhan Berkas Pegawai.",
};

export default async function EmployeeDashboardPage() {
  await requireRole(["EMPLOYEE"]);
  return <EmployeeView isEmbedded={false} />;
}
