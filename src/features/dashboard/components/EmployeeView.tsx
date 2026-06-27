"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Upload } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { DocumentTable } from "../../documents/components/DocumentTable";
import { UploadModal } from "../../documents/components/UploadModal";
import { ComplianceOverviewBanner } from "./ComplianceOverviewBanner";
import { RequiredDocumentsGrid } from "./RequiredDocumentsGrid";

interface EmployeeViewProps {
  isEmbedded?: boolean;
}

/**
 * Dashboard view untuk EMPLOYEE.
 * Menampilkan banner skor kepatuhan, status dokumen wajib, riwayat upload, dan tombol upload baru.
 */
export function EmployeeView({ isEmbedded = false }: EmployeeViewProps) {
  const { data: session } = useSession();
  const {
    docTypes,
    userDocs,
    loading,
    errorMsg,
    uploadOpen,
    setUploadOpen,
    selectedType,
    setSelectedType,
    handleUploadClick,
    handleGeneralUploadClick,
    fetchData,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat data kepatuhan portal...</p>
      </div>
    );
  }

  const containerClasses = isEmbedded
    ? "space-y-8 my-4"
    : "p-4 md:p-8 max-w-7xl mx-auto space-y-8";

  return (
    <div className={containerClasses} id="employee-dashboard-container">
      {/* Title / Section Header */}
      {isEmbedded ? (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 border-t border-border">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Kepatuhan &amp; Dokumen Saya</h2>
            <p className="text-xs font-bold text-muted-foreground mt-0.5">
              Kelola dan pantau validitas berkas wajib perorangan Anda di sini.
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
      ) : (
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
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Compliance Overview Banner */}
      <ComplianceOverviewBanner docTypes={docTypes} userDocs={userDocs} />

      {/* Required Documents Grid */}
      <RequiredDocumentsGrid
        docTypes={docTypes}
        userDocs={userDocs}
        onUploadClick={handleUploadClick}
      />

      {/* Section for Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">Riwayat Dokumen Terunggah</h2>
        <Card className="border border-border shadow-xs">
          <CardContent className="p-0">
            <DocumentTable userDocs={userDocs} onGeneralUpload={handleGeneralUploadClick} />
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setSelectedType(null);
        }}
        onUploadSuccess={fetchData}
        preSelectedType={selectedType}
        docTypes={docTypes}
      />
    </div>
  );
}
