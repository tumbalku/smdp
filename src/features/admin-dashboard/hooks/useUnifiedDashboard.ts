import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { AdminStats, DocumentRecord as AdminDocumentRecord } from "../types";
import { DocumentType, DocumentRecord as EmployeeDocumentRecord } from "../../documents/types";

export function useUnifiedDashboard() {
  const { data: session } = useSession();
  const roles = session?.user?.roles ?? (session?.user?.role ? [session.user.role] : []);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [adminDocs, setAdminDocs] = useState<AdminDocumentRecord[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [userDocs, setUserDocs] = useState<EmployeeDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

  const isAdmin = roles.includes("HR_ADMIN") || roles.includes("STAFF");
  const isEmployee = roles.includes("EMPLOYEE");

  const fetchData = useCallback(async () => {
    if (roles.length === 0) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const promises: Promise<Response>[] = [];
      const fetchKeys: string[] = [];

      if (isAdmin) {
        promises.push(fetch("/api/admin/stats"));
        fetchKeys.push("stats");
        promises.push(fetch("/api/documents"));
        fetchKeys.push("adminDocs");
      }

      if (isEmployee) {
        promises.push(fetch("/api/document-types"));
        fetchKeys.push("docTypes");
        promises.push(fetch("/api/documents?personal=true"));
        fetchKeys.push("userDocs");
      }

      const responses = await Promise.all(promises);
      const dataResults = await Promise.all(responses.map((r) => r.json()));

      let tempStats = null;
      let tempAdminDocs = [];
      let tempDocTypes = [];
      let tempUserDocs = [];

      for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        const key = fetchKeys[i];
        const data = dataResults[i];

        if (!res.ok) {
          throw new Error(data.error?.message || `Gagal memuat data dashboard (${key}).`);
        }

        if (key === "stats") tempStats = data.data;
        if (key === "adminDocs") tempAdminDocs = data.data || [];
        if (key === "docTypes") tempDocTypes = data.data || [];
        if (key === "userDocs") tempUserDocs = data.data || [];
      }

      setStats(tempStats);
      setAdminDocs(tempAdminDocs);
      setDocTypes(tempDocTypes);
      setUserDocs(tempUserDocs);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal memuat data portal.");
    } finally {
      setLoading(false);
    }
  }, [roles, isAdmin, isEmployee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploadClick = (type: DocumentType) => {
    setSelectedType(type);
    setUploadOpen(true);
  };

  const handleGeneralUploadClick = () => {
    setSelectedType(null);
    setUploadOpen(true);
  };

  // Classify admin documents
  const pendingDocs: AdminDocumentRecord[] = [];
  const expiredDocs: AdminDocumentRecord[] = [];
  const warnDocs: AdminDocumentRecord[] = [];

  adminDocs.forEach((d) => {
    if (d.status === "PENDING") pendingDocs.push(d);
    if (d.expiryStatus === "KEDALUWARSA") expiredDocs.push(d);
    else if (d.expiryStatus === "MENDEKATI_KEDALUWARSA") warnDocs.push(d);
  });
  const criticalDocumentsCount = expiredDocs.length + warnDocs.length;

  return {
    // Shared
    loading,
    errorMsg,
    fetchData,
    roles,
    isAdmin,
    isEmployee,

    // Admin parts
    stats,
    adminDocs,
    pendingDocs,
    expiredDocs,
    warnDocs,
    criticalDocumentsCount,

    // Employee parts
    docTypes,
    userDocs,
    uploadOpen,
    setUploadOpen,
    selectedType,
    setSelectedType,
    handleUploadClick,
    handleGeneralUploadClick,
  };
}
