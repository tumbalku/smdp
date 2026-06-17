"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  History,
} from "lucide-react";

interface DocumentDetail {
  id: string;
  fileName: string;
  filePath: string;
  issueDate: string | null;
  expiryDate: string | null;
  uploadedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  documentType: {
    name: string;
    requiresExpiryDate: boolean;
    targetPositions: string | null;
  };
  owner: {
    name: string;
    email: string;
    employeeId: string | null;
  };
  verificationHistory: Array<{
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reviewerRole: string;
    reviewedBy: {
      name: string;
      email: string;
    } | null;
    reviewedAt: string | null;
    reviewNote: string | null;
    createdAt: string;
  }>;
}

export default function VerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [rejectMode, setRejectMode] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const fetchDocumentDetails = async () => {
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentDetails();
  }, [documentId]);

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
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memproses verifikasi berkas.");
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

  const formatTimestamp = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat berkas peninjauan...</p>
      </div>
    );
  }

  if (errorMsg && !doc) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Link
          href="/admin/verification"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-slate-100 h-8 px-3 text-xs font-semibold text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!doc) return null;

  const isRejectDisabled = reviewNote.trim().length < 10 || submitLoading;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6" id="verification-detail-page">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/verification"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background hover:bg-muted h-9 w-9 text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Verifikasi Dokumen Pegawai</h1>
            <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
              Reviewer: <span className="text-primary">{doc.documentType.name}</span> milik {doc.owner.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`text-xs font-bold px-3 py-1 ${doc.status === "APPROVED"
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : doc.status === "PENDING"
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-rose-500 hover:bg-rose-600 text-white"
            }`}>
            Status: {doc.status === "APPROVED" ? "Disetujui" : doc.status === "PENDING" ? "Menunggu Verifikasi" : "Ditolak"}
          </Badge>
        </div>
      </div>

      {successMsg && (
        <Alert className="border-green-200 bg-green-50 text-green-700">
          <CheckCircle className="h-4 w-4" style={{ color: "var(--jobster-success, #22c55e)" }} />
          <AlertDescription className="text-xs font-semibold">{successMsg}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Main Split Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column - Preview Panel (Spans 8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border border-border shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-extrabold text-sm text-foreground">Pratinjau Berkas</CardTitle>
                <CardDescription className="text-[10px] truncate max-w-[400px]" title={doc.fileName}>
                  {doc.fileName}
                </CardDescription>
              </div>
              <a
                href={`/api/documents/download?path=${encodeURIComponent(doc.filePath)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted h-8 px-3 text-xs font-semibold text-foreground transition-colors gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Berkas
              </a>
            </CardHeader>
            <CardContent className="p-2 bg-muted">
              <div className="w-full border border-border rounded-lg overflow-hidden bg-card">
                {doc.fileName.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={`/api/documents/download?path=${encodeURIComponent(doc.filePath)}#toolbar=0`}
                    className="w-full h-[650px] rounded-lg border-0 bg-white"
                  />
                ) : doc.fileName.toLowerCase().match(/\.(png|jpg|jpeg)$/) ? (
                  <img
                    src={`/api/documents/download?path=${encodeURIComponent(doc.filePath)}`}
                    alt="Pratinjau"
                    className="w-full max-h-[650px] object-contain rounded-lg bg-white mx-auto block"
                  />
                ) : (
                  <div className="py-24 text-center">
                    <p className="text-xs text-muted-foreground font-semibold">
                      Pratinjau tidak didukung untuk tipe berkas ini. Silakan unduh dokumen untuk meninjau secara lokal.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Actions & Details (Spans 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata details */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <User className="w-4 h-4 text-muted-foreground" />
                Detail Pegawai
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Nama Lengkap</p>
                <p className="font-extrabold text-foreground">{doc.owner.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Nomor Induk Pegawai (NIP)</p>
                <p className="font-semibold text-foreground">{doc.owner.employeeId || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Email Utama</p>
                <p className="font-medium text-muted-foreground">{doc.owner.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Document metadata */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Spesifikasi Berkas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Jenis Dokumen</p>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-foreground">{doc.documentType.name}</span>
                  {doc.documentType.targetPositions && (
                    <Badge className="bg-[#6c63ff]/10 hover:bg-[#6c63ff]/10 text-[#6c63ff] text-[9px] font-bold px-1 py-0 border-0">
                      {doc.documentType.targetPositions}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Tanggal Terbit</p>
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {formatDate(doc.issueDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Tanggal Kedaluwarsa</p>
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {formatDate(doc.expiryDate)}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Diunggah Pada</p>
                <p className="font-medium text-muted-foreground">{formatTimestamp(doc.uploadedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action form Card */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="font-extrabold text-sm text-foreground">
                {doc.status === "PENDING" ? "Tindakan Verifikasi" : "Hasil Penilaian"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-4">
              {doc.status === "PENDING" ? (
                <div className="space-y-4">
                  {rejectMode ? (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="reviewNote" className="text-xs font-bold text-foreground">
                          Catatan Penolakan (Minimal 10 Karakter)
                        </Label>
                        <textarea
                          id="reviewNote"
                          rows={3}
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Tuliskan detail alasan mengapa berkas ditolak (misal: 'Resolusi scan KTP terlalu buram dan tidak terbaca')..."
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {reviewNote.trim().length > 0 && reviewNote.trim().length < 10 && (
                          <p className="text-[10px] text-destructive font-semibold">
                            Kekurangan {10 - reviewNote.trim().length} karakter lagi.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 w-full">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full text-xs font-bold"
                          onClick={() => handleAction("REJECTED")}
                          disabled={isRejectDisabled}
                        >
                          Kirim Penolakan
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setRejectMode(false);
                            setReviewNote("");
                          }}
                          disabled={submitLoading}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        style={{ backgroundColor: "var(--jobster-success, #22c55e)", color: "#fff" }}
                        size="sm"
                        className="w-full text-xs font-bold"
                        onClick={() => handleAction("APPROVED")}
                        disabled={submitLoading}
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Setujui Berkas
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive border-destructive hover:bg-destructive/10 text-xs font-bold"
                        onClick={() => setRejectMode(true)}
                        disabled={submitLoading}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Tolak Berkas
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-xl border border-border text-xs space-y-3">
                  <div className="flex items-center gap-2">
                    {doc.status === "APPROVED" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    )}
                    <span className="font-bold text-foreground">
                      Dokumen Telah {doc.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                    </span>
                  </div>

                  {doc.verificationHistory && doc.verificationHistory.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-border">
                      {doc.verificationHistory.filter(h => h.status !== "PENDING").map((hist) => (
                        <div key={hist.id} className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">
                            Dinilai oleh <span className="font-bold text-foreground">{hist.reviewedBy?.name || "HR System"}</span> ({hist.reviewerRole}) pada {formatTimestamp(hist.reviewedAt)}
                          </p>
                          {hist.reviewNote && (
                            <div className="bg-rose-500/10 text-rose-500 p-2.5 rounded-lg border border-rose-500/20 italic font-medium mt-1">
                              " {hist.reviewNote} "
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline verification log */}
          {doc.verificationHistory && doc.verificationHistory.length > 0 && (
            <Card className="border border-border shadow-xs">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  <History className="w-4 h-4 text-muted-foreground" />
                  Log Aktivitas Berkas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <div className="relative pl-4 border-l border-border space-y-4 text-xs">
                  {doc.verificationHistory.map((hist) => {
                    const isPending = hist.status === "PENDING";
                    const isApproved = hist.status === "APPROVED";
                    const isRejected = hist.status === "REJECTED";

                    let dotBg = "bg-muted";
                    let label = "Dokumen Diunggah";
                    let actor = hist.reviewedBy?.name || "Pegawai";

                    if (isApproved) {
                      dotBg = "bg-emerald-500";
                      label = "Disetujui oleh Reviewer";
                    } else if (isRejected) {
                      dotBg = "bg-rose-500";
                      label = "Ditolak oleh Reviewer";
                    } else if (isPending && hist.reviewedAt) {
                      label = "Masuk Antrian Peninjauan";
                    }

                    return (
                      <div key={hist.id} className="relative">
                        <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ${dotBg} border-2 border-white`} />
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">{label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {actor} • {formatTimestamp(hist.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
