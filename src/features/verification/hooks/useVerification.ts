import { useState, useEffect, useCallback } from "react";
import { DocumentDetail } from "../types";

export function useVerification(documentId: string) {
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [rejectMode, setRejectMode] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  // ponytail: declare fetcher as stable callback to be run both on mount/updates and directly inside mutator handlers
  const fetchDocumentDetails = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/documents/${documentId}`);
      const resData = await res.json();
      if (res.ok && resData.data) {
        setDoc(resData.data);
      } else {
        throw new Error(resData.error?.message || "Gagal memuat rincian dokumen.");
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Gagal menghubungi server.";
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocumentDetails();
  }, [fetchDocumentDetails]);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    if (!documentId) return;

    if (status === "REJECTED" && (!reviewNote || reviewNote.trim().length < 10)) {
      setErrorMsg("Harap isi catatan penolakan dengan minimal 10 karakter.");
      return;
    }

    setSubmitLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/documents/${documentId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal menyimpan verifikasi.");
      }

      setSuccessMsg(
        status === "APPROVED"
          ? "Dokumen berhasil disetujui."
          : "Dokumen telah ditolak dengan catatan."
      );
      setRejectMode(false);
      setReviewNote("");

      // ponytail: refresh document info directly
      fetchDocumentDetails();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Gagal memproses verifikasi berkas.";
      setErrorMsg(errMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  return {
    doc,
    loading,
    submitLoading,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    rejectMode,
    setRejectMode,
    reviewNote,
    setReviewNote,
    fetchDocumentDetails,
    handleAction,
  };
}
