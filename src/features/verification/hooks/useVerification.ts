import { useState, useEffect, useCallback } from "react";
import { DocumentDetail } from "../types";

export function useVerification(documentId: string) {
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [rejectMode, setRejectMode] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

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

      fetchDocumentDetails();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Gagal memproses verifikasi berkas.";
      setErrorMsg(errMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (onSuccessRedirect?: () => void) => {
    if (!documentId) return;
    if (!window.confirm("Apakah Anda yakin ingin menghapus dokumen ini secara permanen?")) return;

    setDeleteLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal menghapus dokumen.");
      }
      if (onSuccessRedirect) {
        onSuccessRedirect();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Gagal menghapus dokumen.";
      setErrorMsg(errMsg);
      setDeleteLoading(false);
    }
  };

  return {
    doc,
    loading,
    submitLoading,
    deleteLoading,
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
    handleDelete,
  };
}
