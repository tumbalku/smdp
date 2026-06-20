export interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  targetPositions: string | null;
  isMandatory: boolean;
  requiresExpiryDate: boolean;
  maxSize: number;
  allowedFormats: string;
}
