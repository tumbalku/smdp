import { requireRole } from "@/lib/auth-utils";
import { SecurityLogsView } from "@/features/security-logs/components/SecurityLogsView";

export const metadata = {
  title: "Audit Log Keamanan - SMDP Portal",
  description: "Pantau aktivitas krusial, riwayat autentikasi, dan pelacakan hak akses sistem.",
};

export default async function SecurityLogsPage() {
  await requireRole(["HR_ADMIN"]);
  return <SecurityLogsView />;
}
