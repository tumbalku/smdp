import { useState, useCallback } from "react";

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const nextPage = useCallback((totalPages: number) => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }, []);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    nextPage,
    prevPage,
    resetPage,
  };
}
