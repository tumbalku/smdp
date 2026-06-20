export interface DocumentType {
  id: string;
  name: string;
  requiresExpiryDate: boolean;
  isMandatory: boolean;
  maxSize: number;
  allowedFormats: string;
  description: string | null;
}

export interface DocumentRecord {
  id: string;
  ownerId: string;
  documentTypeId: string;
  filePath: string;
  fileName: string;
  issueDate: string | null;
  expiryDate: string | null;
  uploadedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  latestVerification: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reviewNote: string | null;
  } | null;
  documentType: DocumentType;
}
