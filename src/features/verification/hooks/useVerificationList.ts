import { useState, useEffect } from "react";
import { DocumentRecord } from "../types";

export function useVerificationList() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [expiryStatus, setExpiryStatus] = useState("ALL");

  const fetchDocuments = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status !== "ALL") params.append("status", status);
      if (expiryStatus !== "ALL") params.append("expiryStatus", expiryStatus);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const resData = await res.json();

      if (res.ok) {
        setDocuments(resData.data || []);
      } else {
        throw new Error(resData.error?.message || "Gagal memuat dokumen.");
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
    fetchDocuments();
  }, [status, expiryStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  return {
    documents,
    loading,
    errorMsg,
    filters: {
      search,
      status,
      expiryStatus,
    },
    setFilters: {
      setSearch,
      setStatus,
      setExpiryStatus,
    },
    handleSearchSubmit,
  };
}
