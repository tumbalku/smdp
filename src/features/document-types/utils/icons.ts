import {
  FileText,
  CreditCard,
  Award,
  FileSpreadsheet,
  GraduationCap,
  Briefcase,
  User,
  BookOpen,
  HeartPulse,
  ShieldCheck,
  FileDigit,
  FileSignature,
  type LucideIcon,
} from "lucide-react";

export interface DocumentIconOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const DOCUMENT_ICONS: DocumentIconOption[] = [
  { value: "FileText", label: "Dokumen Umum", icon: FileText },
  { value: "CreditCard", label: "ID Card / KTP / SIM", icon: CreditCard },
  { value: "Award", label: "Sertifikat / STR / SIP", icon: Award },
  { value: "FileSpreadsheet", label: "Spreadsheet / Excel", icon: FileSpreadsheet },
  { value: "GraduationCap", label: "Ijazah / Gelar", icon: GraduationCap },
  { value: "Briefcase", label: "Kontrak Kerja / SK", icon: Briefcase },
  { value: "User", label: "Pas Foto / Profil", icon: User },
  { value: "BookOpen", label: "Logbook / Buku Rekening", icon: BookOpen },
  { value: "HeartPulse", label: "Surat Kesehatan", icon: HeartPulse },
  { value: "ShieldCheck", label: "SKCK / Pernyataan", icon: ShieldCheck },
  { value: "FileDigit", label: "NPWP / Pajak", icon: FileDigit },
  { value: "FileSignature", label: "Surat Kuasa / Perjanjian", icon: FileSignature },
];

export const getDocumentIcon = (iconName?: string | null): LucideIcon => {
  const found = DOCUMENT_ICONS.find((i) => i.value === iconName);
  return found ? found.icon : FileText;
};
