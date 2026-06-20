import { useState, useEffect } from "react";
import { SecurityLog, PaginationMeta } from "../types";

export function useSecurityLogs() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ponytail: merge separate filters/pagination states into a single unified object
  const [filtersState, setFiltersState] = useState({
    search: "",
    status: "ALL",
    eventType: "ALL",
    page: 1,
  });

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = new URLSearchParams();
      params.append("page", filtersState.page.toString());
      if (filtersState.search) params.append("search", filtersState.search);
      if (filtersState.status !== "ALL") params.append("status", filtersState.status);
      if (filtersState.eventType !== "ALL") params.append("eventType", filtersState.eventType);

      const res = await fetch(`/api/admin/security-logs?${params.toString()}`);
      const resData = await res.json();

      if (res.ok) {
        setLogs(resData.data || []);
        setMeta(resData.meta || null);
      } else {
        throw new Error(resData.error?.message || "Gagal memuat log keamanan.");
      }
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setErrorMsg(error.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filtersState.page, filtersState.status, filtersState.eventType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltersState((p) => ({ ...p, page: 1 }));
    fetchLogs();
  };

  return {
    logs,
    meta,
    loading,
    errorMsg,
    filters: filtersState,
    setFilters: {
      setSearch: (search: string) => setFiltersState((p) => ({ ...p, search })),
      setStatus: (status: string) => setFiltersState((p) => ({ ...p, status })),
      setEventType: (eventType: string) => setFiltersState((p) => ({ ...p, eventType })),
      setPage: (page: number) => setFiltersState((p) => ({ ...p, page })),
    },
    handleSearchSubmit,
  };
}
