import { CreateDocTypeView } from "@/features/document-types/components/CreateDocTypeView";

export const metadata = {
  title: "Tambah Jenis Dokumen - SMDP Portal",
  description: "Buat jenis dokumen baru untuk diunggah oleh pegawai.",
};

export default function CreateDocumentTypePage() {
  return <CreateDocTypeView />;
}
