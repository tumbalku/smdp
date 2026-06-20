"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  CheckCircle,
  User,
  FileText,
  Calendar,
} from "lucide-react";
import { useVerification } from "../hooks/useVerification";
import { DocumentPreview } from "./DocumentPreview";
import { ReviewActionPanel } from "./ReviewActionPanel";
import { VerificationTimeline } from "./VerificationTimeline";

interface VerificationDetailViewProps {
  documentId: string;
}

export function VerificationDetailView({ documentId }: VerificationDetailViewProps) {
  const {
    doc,
    loading,
    submitLoading,
    errorMsg,
    successMsg,
    rejectMode,
    setRejectMode,
    reviewNote,
    setReviewNote,
    handleAction,
  } = useVerification(documentId);

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
        {/* Left column - Preview Panel */}
        <div className="lg:col-span-8 space-y-4">
          <DocumentPreview fileName={doc.fileName} filePath={doc.filePath} />
        </div>

        {/* Right column - Actions & Details */}
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
          <ReviewActionPanel
            status={doc.status}
            rejectMode={rejectMode}
            setRejectMode={setRejectMode}
            reviewNote={reviewNote}
            setReviewNote={setReviewNote}
            submitLoading={submitLoading}
            onAction={handleAction}
            verificationHistory={doc.verificationHistory}
          />

          {/* Timeline verification log */}
          <VerificationTimeline verificationHistory={doc.verificationHistory} />
        </div>
      </div>
    </div>
  );
}
