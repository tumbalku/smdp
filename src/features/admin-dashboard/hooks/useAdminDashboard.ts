import { useState, useEffect } from "react";
import { AdminStats, DocumentRecord } from "../types";

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // ponytail: parallel fetch to prevent waterfall
      const [statsRes, docsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/documents"),
      ]);
      const [statsData, docsData] = await Promise.all([
        statsRes.json(),
        docsRes.json(),
      ]);

      if (statsRes.ok && docsRes.ok) {
        setStats(statsData.data);
        setDocuments(docsData.data || []);
      } else {
        throw new Error(
          statsData.error?.message ||
          docsData.error?.message ||
          "Gagal mengambil data administrasi."
        );
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
    fetchData();
  }, []);

  // ponytail: single pass classification of documents
  const pendingDocs: DocumentRecord[] = [];
  const expiredDocs: DocumentRecord[] = [];
  const warnDocs: DocumentRecord[] = [];

  documents.forEach((d) => {
    if (d.status === "PENDING") pendingDocs.push(d);
    if (d.expiryStatus === "KEDALUWARSA") expiredDocs.push(d);
    else if (d.expiryStatus === "MENDEKATI_KEDALUWARSA") warnDocs.push(d);
  });
  const criticalDocumentsCount = expiredDocs.length + warnDocs.length;

  return {
    stats,
    documents,
    loading,
    errorMsg,
    pendingDocs,
    expiredDocs,
    warnDocs,
    criticalDocumentsCount,
  };
}
