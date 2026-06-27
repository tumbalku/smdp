import { requireRole } from "@/lib/auth-utils";
import { CreateDocTypeView } from "@/features/document-types/components/CreateDocTypeView";

export const metadata = {
  title: "Tambah Jenis Dokumen - SMDP Portal",
  description: "Buat jenis dokumen baru untuk diunggah oleh pegawai.",
};

export default async function CreateDocumentTypePage() {
  await requireRole(["HR_ADMIN"]);
  return <CreateDocTypeView />;
}
