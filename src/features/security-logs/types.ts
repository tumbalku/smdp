export interface SecurityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  eventType: string;
  resource: string;
  ipAddress: string | null;
  status: "SUCCESS" | "FAILED" | "WARNING";
  metadata: string | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
