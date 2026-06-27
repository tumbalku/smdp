export interface RetirementUser {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  gender: string | null;
  birthDate: string | null;
  age: number;
  status: "MENDEKATI_PENSIUN" | "PENSIUN";
}

export interface AdminStats {
  totalEmployees: number;
  genderStats: {
    maleCount: number;
    femaleCount: number;
    unknownGenderCount: number;
  };
  retirementStats: {
    activeCount: number;
    approachingCount: number;
    retiredCount: number;
    noBirthDateCount: number;
    retirementAgeLimit: number;
  };
  retirementList: RetirementUser[];
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
