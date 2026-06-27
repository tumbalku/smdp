import { requireRole } from "@/lib/auth-utils";
import { DocTypesView } from "@/features/document-types/components/DocTypesView";

export const metadata = {
  title: "Konfigurasi Dokumen - SMDP Portal",
  description: "Kelola jenis-jenis dokumen kualifikasi kepegawaian yang dapat diunggah oleh pegawai.",
};

export default async function DocumentTypesPage() {
  await requireRole(["HR_ADMIN"]);
  return <DocTypesView />;
}
