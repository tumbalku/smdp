/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { DocumentType, DocumentRecord } from "../types";

export function useDocuments() {
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [userDocs, setUserDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // ponytail: parallel fetch to avoid waterfall
      const [typesRes, docsRes] = await Promise.all([
        fetch("/api/document-types"),
        fetch("/api/documents"),
      ]);
      const [typesData, docsData] = await Promise.all([
        typesRes.json(),
        docsRes.json(),
      ]);

      if (typesRes.ok && docsRes.ok) {
        setDocTypes(typesData.data || []);
        setUserDocs(docsData.data || []);
      } else {
        throw new Error(
          typesData.error?.message ||
          docsData.error?.message ||
          "Gagal memuat data dari server."
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal memuat data portal.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    docTypes,
    userDocs,
    loading,
    errorMsg,
    setErrorMsg,
    uploadOpen,
    setUploadOpen,
    selectedType,
    setSelectedType,
    fetchData,
    handleUploadClick,
    handleGeneralUploadClick,
  };
}
