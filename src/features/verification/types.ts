export interface DocumentDetail {
  id: string;
  fileName: string;
  filePath: string;
  issueDate: string | null;
  expiryDate: string | null;
  uploadedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  documentType: {
    name: string;
    requiresExpiryDate: boolean;
    targetPositions: string | null;
  };
  owner: {
    name: string;
    email: string;
    employeeId: string | null;
  };
  verificationHistory: Array<{
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reviewerRole: string;
    reviewedBy: {
      name: string;
      email: string;
    } | null;
    reviewedAt: string | null;
    reviewNote: string | null;
    createdAt: string;
  }>;
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  filePath: string;
  issueDate: string | null;
  expiryDate: string | null;
  uploadedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  expiryStatus: "AMAN" | "KEDALUWARSA" | "MENDEKATI_KEDALUWARSA";
  daysRemaining: number | null;
  documentType: {
    name: string;
    targetPositions: string | null;
  };
  owner: {
    name: string;
    employeeId: string | null;
    email: string;
  };
}
