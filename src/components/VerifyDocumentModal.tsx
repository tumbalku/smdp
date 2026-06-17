"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Download, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

interface DocumentDetail {
  id: string;
  fileName: string;
  filePath: string;
  issueDate: string | null;
  expiryDate: string | null;
  uploadedAt: string;
  documentType: {
    name: string;
    requiresExpiryDate: boolean;
  };
  owner: {
    name: string;
    email: string;
    employeeId: string | null;
  };
}

interface VerifyDocumentModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  onVerificationSuccess: () => void;
}

export default function VerifyDocumentModal({
  open,
  onClose,
  documentId,
  onVerificationSuccess,
}: VerifyDocumentModalProps) {
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [rejectMode, setRejectMode] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    if (open && documentId) {
      setLoading(true);
      setErrorMsg("");
      setRejectMode(false);
      setReviewNote("");

      fetch(`/api/documents/${documentId}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.data) {
            setDoc(resData.data);
          } else {
            setErrorMsg(resData.error?.message || "Gagal mengambil rincian dokumen.");
          }
        })
        .catch((err) => {
          console.error("Error fetching doc details:", err);
          setErrorMsg("Gagal menghubungi server.");
        })
        .finally(() => setLoading(false));
    }
  }, [open, documentId]);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    if (!documentId) return;

    if (status === "REJECTED" && (!reviewNote || reviewNote.trim().length < 10)) {
      return;
    }

    setSubmitLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/documents/${documentId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Terjadi kesalahan saat memverifikasi.");
      }

      onVerificationSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal melakukan verifikasi.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const isRejectDisabled = reviewNote.trim().length < 10 || submitLoading;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[90vw] md:max-w-5xl max-h-[90vh] overflow-y-auto" id="verify-document-modal">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-slate-800 tracking-tight">
            Verifikasi Dokumen
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-semibold">Memuat dokumen...</p>
          </div>
        ) : errorMsg && !doc ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        ) : doc ? (
          <div className="space-y-4">
            {errorMsg && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Nama Pegawai</p>
                <p className="font-bold text-slate-700 mt-0.5">
                  {doc.owner.name} ({doc.owner.employeeId || "-"})
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Jenis Dokumen</p>
                <p className="font-bold text-slate-700 mt-0.5">{doc.documentType.name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Tanggal Terbit</p>
                <p className="font-semibold text-slate-600 mt-0.5">{formatDate(doc.issueDate)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Tanggal Kedaluwarsa</p>
                <p className="font-semibold text-slate-600 mt-0.5">{formatDate(doc.expiryDate)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">Nama Berkas</p>
                <p className="font-medium text-slate-600 truncate mt-0.5">{doc.fileName}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700">Pratinjau Berkas</Label>
              <a
                href={`/api/documents/download?path=${encodeURIComponent(doc.filePath)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-slate-100 h-8 px-3 text-xs font-semibold text-slate-700 transition-colors gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Berkas
              </a>
            </div>

            {/* Document preview zone */}
            <div className="w-full border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-1">
              {doc.fileName.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`/api/documents/download?path=${encodeURIComponent(doc.filePath)}#toolbar=0`}
                  className="w-full h-[500px] md:h-[60vh] rounded-lg border-0 bg-white"
                />
              ) : doc.fileName.toLowerCase().match(/\.(png|jpg|jpeg)$/) ? (
                <img
                  src={`/api/documents/download?path=${encodeURIComponent(doc.filePath)}`}
                  alt="Pratinjau"
                  className="w-full max-h-[500px] md:max-h-[60vh] object-contain rounded-lg bg-white mx-auto block"
                />
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground font-medium">
                    Pratinjau tidak didukung. Silakan unduh untuk melihat berkas.
                  </p>
                </div>
              )}
            </div>

            {rejectMode && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="reviewNote" className="text-xs font-bold text-slate-700">
                  Catatan Penolakan (Minimal 10 Karakter)
                </Label>
                <Input
                  id="reviewNote"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Jelaskan alasan dokumen ini ditolak..."
                  className={reviewNote.trim().length > 0 && reviewNote.trim().length < 10 ? "border-destructive text-xs" : "text-xs"}
                />
                {reviewNote.trim().length > 0 && reviewNote.trim().length < 10 && (
                  <p className="text-[10px] text-destructive">
                    Kurang {10 - reviewNote.trim().length} karakter lagi.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between sm:justify-between w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (rejectMode) {
                setRejectMode(false);
              } else {
                onClose();
              }
            }}
            disabled={submitLoading}
          >
            {rejectMode ? "Kembali" : "Batal"}
          </Button>

          {!loading && doc && (
            <div className="flex gap-2">
              {!rejectMode ? (
                <>
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10 text-xs"
                    onClick={() => setRejectMode(true)}
                    disabled={submitLoading}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Tolak
                  </Button>
                  <Button
                    style={{ backgroundColor: "var(--jobster-success, #22c55e)", color: "#fff" }}
                    className="text-xs font-bold"
                    onClick={() => handleAction("APPROVED")}
                    disabled={submitLoading}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Setujui
                  </Button>
                </>
              ) : (
                <Button
                  variant="destructive"
                  className="text-xs font-bold"
                  onClick={() => handleAction("REJECTED")}
                  disabled={isRejectDisabled}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Kirim Penolakan
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
