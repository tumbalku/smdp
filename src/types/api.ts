export type ApiResponse<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
  meta?: {
    total?: number;
    totalPages?: number;
    page?: number;
  };
};
