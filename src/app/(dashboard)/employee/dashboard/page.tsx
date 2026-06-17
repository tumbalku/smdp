"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Upload,
  Download,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import dynamic from "next/dynamic";

const CalendarSection = dynamic(
  () => import("@/components/CalendarSection").then((mod) => mod.CalendarSection),
  {
    ssr: false,
    loading: () => (
      <Card className="border border-border shadow-xs">
        <CardContent className="p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </CardContent>
      </Card>
    ),
  }
);

interface DocumentType {
  id: string;
  name: string;
  requiresExpiryDate: boolean;
  isMandatory: boolean;
  maxSize: number;
  allowedFormats: string;
  description: string | null;
}

interface DocumentRecord {
  id: string;
  ownerId: string;
  documentTypeId: string;
  filePath: string;
  fileName: string;
  issueDate: string | null;
  expiryDate: string | null;
  uploadedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  latestVerification: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reviewNote: string | null;
  } | null;
  documentType: DocumentType;
}

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [userDocs, setUserDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Fetch document types
      const typesRes = await fetch("/api/document-types");
      const typesData = await typesRes.json();

      // Fetch user documents
      const docsRes = await fetch("/api/documents");
      const docsData = await docsRes.json();

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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadClick = (type: DocumentType) => {
    setSelectedType(type);
    setUploadOpen(true);
  };

  const handleGeneralUploadClick = () => {
    setSelectedType(null);
    setUploadOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">Disetujui</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">Menunggu Verifikasi</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="font-semibold">Ditolak</Badge>;
      default:
        return <Badge variant="secondary" className="font-semibold">Belum Diunggah</Badge>;
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat data kepatuhan portal...</p>
      </div>
    );
  }

  // Calculate compliance stats for cards
  const mandatoryTypes = docTypes.filter((t) => t.isMandatory);
  const uploadedMandatory = mandatoryTypes.filter((t) =>
    userDocs.some((d) => d.documentTypeId === t.id && (d.status === "APPROVED" || d.status === "PENDING"))
  );
  const compliancePercentage = mandatoryTypes.length
    ? Math.round((uploadedMandatory.length / mandatoryTypes.length) * 100)
    : 100;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8" id="employee-dashboard-container">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Portal Kepatuhan Pegawai</h1>
          <p className="text-xs font-bold text-muted-foreground mt-1">
            Selamat datang, <span className="text-primary">{session?.user?.name || "Pegawai"}</span>. Kelola dan pantau validitas sertifikasi Anda di sini.
          </p>
        </div>
        <Button
          onClick={handleGeneralUploadClick}
          style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
          className="font-bold flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Unggah Dokumen Baru
        </Button>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Compliance Overview Banner */}
      <Card className="border-l-4 border-l-[#6c63ff] shadow-xs">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-foreground">Skor Kepatuhan Berkas Mandatori</h3>
            <p className="text-xs text-muted-foreground">Anda telah melengkapi {uploadedMandatory.length} dari {mandatoryTypes.length} dokumen wajib.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-3xl font-extrabold text-foreground">{compliancePercentage}%</span>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground mt-0.5">TERPENUHI</p>
            </div>
            <div className="w-24 bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${compliancePercentage}%`,
                  backgroundColor: compliancePercentage === 100 ? "var(--jobster-success, #22c55e)" : "var(--jobster-accent, #6c63ff)",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Documents Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">Status Dokumen Wajib</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docTypes.map((type) => {
            const doc = userDocs.find((d) => d.documentTypeId === type.id);
            const status = doc ? doc.status : "MISSING";
            const isMandatory = type.isMandatory;

            // Determine border color, text, and icons based on status
            let statusText = "Belum Diunggah";
            let statusColor = "border-border bg-card";
            let statusIcon = <Upload className="w-5 h-5 text-muted-foreground" />;
            let actionBtn = (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUploadClick(type)}
                className="w-full text-xs font-bold"
              >
                Unggah Berkas
              </Button>
            );

            if (status === "APPROVED") {
              statusText = "Disetujui";
              statusColor = "border-emerald-500/20 bg-emerald-500/5";
              statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
              actionBtn = (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUploadClick(type)}
                  className="w-full text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Perbarui Dokumen
                </Button>
              );
            } else if (status === "PENDING") {
              statusText = "Menunggu Verifikasi";
              statusColor = "border-amber-500/20 bg-amber-500/5";
              statusIcon = <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
              actionBtn = (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled
                  className="w-full text-xs font-bold text-muted-foreground/50"
                >
                  Sedang Diverifikasi
                </Button>
              );
            } else if (status === "REJECTED") {
              statusText = "Ditolak";
              statusColor = "border-rose-500/20 bg-rose-500/5";
              statusIcon = <XCircle className="w-5 h-5 text-rose-500" />;
              actionBtn = (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleUploadClick(type)}
                  className="w-full text-xs font-bold"
                >
                  Unggah Ulang
                </Button>
              );
            }

            return (
              <Card key={type.id} className={`border ${statusColor} shadow-xs hover:shadow-md transition-shadow`}>
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-foreground">{type.name}</span>
                      {isMandatory && (
                        <Badge className="bg-rose-500/10 hover:bg-rose-500/10 text-rose-500 text-[10px] font-bold px-1.5 py-0 border-0">
                          Wajib
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{type.description || `Dokumen identifikasi/kualifikasi ${type.name}`}</p>
                  </div>
                  <div className="p-1">{statusIcon}</div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground font-bold uppercase">STATUS</span>
                    <span className="font-bold text-foreground">{statusText}</span>
                  </div>

                  {doc && doc.expiryDate && (
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-bold uppercase">MASA BERLAKU</span>
                      <span className="font-semibold text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {formatDate(doc.expiryDate)}
                      </span>
                    </div>
                  )}

                  {doc && doc.latestVerification?.reviewNote && status === "REJECTED" && (
                    <div className="bg-rose-500/10 text-[10px] text-rose-500 p-2 rounded-lg border border-rose-500/20 space-y-0.5">
                      <p className="font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        Alasan Penolakan:
                      </p>
                      <p className="font-medium italic">"{doc.latestVerification.reviewNote}"</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">{actionBtn}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid for Table and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Uploaded Documents Table (Colspan 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">Riwayat Dokumen Terunggah</h2>
          <Card className="border border-border shadow-xs">
            <CardContent className="p-0">
              {userDocs.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold">Belum ada dokumen yang diunggah.</p>
                  <Button
                    size="sm"
                    onClick={handleGeneralUploadClick}
                    style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
                    className="font-bold text-xs"
                  >
                    Unggah Sekarang
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-xs">Jenis Dokumen</TableHead>
                      <TableHead className="font-bold text-xs">Nama Berkas</TableHead>
                      <TableHead className="font-bold text-xs">Tanggal Terbit</TableHead>
                      <TableHead className="font-bold text-xs">Masa Berlaku</TableHead>
                      <TableHead className="font-bold text-xs">Status</TableHead>
                      <TableHead className="font-bold text-xs text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userDocs.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-muted/50">
                        <TableCell className="font-bold text-xs text-foreground">{doc.documentType.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]" title={doc.fileName}>
                          {doc.fileName}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(doc.issueDate)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {doc.documentType.requiresExpiryDate ? (
                            <span className={new Date(doc.expiryDate!) < new Date() ? "text-rose-500 font-bold" : ""}>
                              {formatDate(doc.expiryDate)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-medium italic">Seumur Hidup</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-xs text-right">
                          <a
                            href={`/api/documents/download?path=${encodeURIComponent(doc.filePath)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">Kalender & Hari Libur</h2>
          <CalendarSection isDashboard={true} />
        </div>
      </div>

      {/* Upload Modal integration */}
      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setSelectedType(null);
        }}
        onUploadSuccess={fetchData}
        preSelectedType={selectedType}
      />
    </div>
  );
}
