import { requireRole } from "@/lib/auth-utils";
import { VerificationListView } from "@/features/verification/components/VerificationListView";

export const metadata = {
  title: "Verifikasi Berkas - SMDP Portal",
  description: "Tinjau, setujui, atau tolak berkas kualifikasi kepegawaian medis dan administratif.",
};

export default async function VerificationListPage() {
  await requireRole(["HR_ADMIN", "STAFF"]);
  return <VerificationListView />;
}
