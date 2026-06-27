"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Upload,
  Calendar,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useUnifiedDashboard } from "../hooks/useUnifiedDashboard";
import { VerificationQueue } from "./VerificationQueue";
import { RetirementMonitor } from "./RetirementMonitor";
import { DocumentTable } from "../../documents/components/DocumentTable";
import { UploadModal } from "../../documents/components/UploadModal";
import { getDocumentIcon } from "../../document-types/utils/icons";

const CalendarSection = dynamic(
  () => import("@/components/CalendarSection").then((mod) => mod.CalendarSection),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    ),
  }
);

export function AdminDashboardView() {
  const { data: session } = useSession();
  const {
    loading,
    errorMsg,
    fetchData,
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
  } = useUnifiedDashboard();

  const [activeTab, setActiveTab] = useState<"admin" | "employee">("admin");

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
        <p className="text-xs font-bold text-muted-foreground">Memuat data dashboard...</p>
      </div>
    );
  }

  // Determine current active mode
  const currentMode = isAdmin && isEmployee ? activeTab : isAdmin ? "admin" : "employee";

  // Calculations for employee view compliance
  const mandatoryTypes = docTypes.filter((t) => t.isMandatory);
  const uploadedMandatory = mandatoryTypes.filter((t) =>
    userDocs.some((d) => d.documentTypeId === typeId(t.id) && (d.status === "APPROVED" || d.status === "PENDING"))
  );
  function typeId(id: string) {
    return id;
  }
  const compliancePercentage = mandatoryTypes.length
    ? Math.round((uploadedMandatory.length / mandatoryTypes.length) * 100)
    : 100;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8" id="unified-dashboard-container">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {currentMode === "admin" ? "Dashboard Administrasi Kepegawaian" : "Portal Kepatuhan Pegawai"}
          </h1>
          <p className="text-xs font-bold text-muted-foreground mt-1">
            Selamat datang kembali, <span className="text-primary">{session?.user?.name || "User"}</span>.
            {currentMode === "admin"
              ? " Pantau kelayakan berkas pegawai dan kepatuhan regulasi di bawah ini."
              : " Kelola dan pantau validitas sertifikasi Anda di sini."}
          </p>
        </div>

        {/* Tab switch button group for users with multi-role */}
        {isAdmin && isEmployee && (
          <div className="flex bg-muted p-1 rounded-xl w-fit border border-border shadow-xs">
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "admin"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Panel Administrasi
            </button>
            <button
              onClick={() => setActiveTab("employee")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "employee"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dokumen Pribadi
            </button>
          </div>
        )}

        {/* Upload Button for Employee Mode */}
        {currentMode === "employee" && (
          <Button
            onClick={handleGeneralUploadClick}
            style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
            className="font-bold flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Unggah Dokumen Baru
          </Button>
        )}
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Render ADMIN view */}
      {currentMode === "admin" && (
        <>
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Pegawai"
              value={stats?.totalEmployees || 0}
              subtext="Seluruh pegawai terdaftar aktif"
              icon={Users}
              variant="primary"
            />
            <StatsCard
              title="Total Dokumen"
              value={adminDocs.length}
              subtext="Semua berkas yang tersimpan"
              icon={FileText}
              variant="success"
            />
            <StatsCard
              title="Tinjauan Tertunda"
              value={pendingDocs.length}
              subtext="Menunggu persetujuan HRD"
              icon={Clock}
              variant="warning"
            />
            <StatsCard
              title="Berkas Bermasalah"
              value={criticalDocumentsCount}
              subtext={`Kedaluwarsa atau Mendekati`}
              icon={AlertTriangle}
              variant="danger"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <VerificationQueue pendingDocs={pendingDocs} />
            </div>
            <div className="space-y-4">
              <RetirementMonitor stats={stats} />
            </div>
          </div>
        </>
      )}

      {/* Render EMPLOYEE view */}
      {currentMode === "employee" && (
        <>
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

                const IconComp = getDocumentIcon(type.icon);

                return (
                  <Card key={type.id} className={`border ${statusColor} shadow-xs hover:shadow-md transition-shadow`}>
                    <CardHeader className="p-4 pb-2 flex flex-row items-start gap-3 space-y-0">
                      <div className="p-2.5 bg-[#6c63ff]/10 text-[#6c63ff] rounded-xl flex-shrink-0 flex items-center justify-center">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-foreground truncate">{type.name}</span>
                          {isMandatory && (
                            <Badge className="bg-rose-500/10 hover:bg-rose-500/10 text-rose-500 text-[10px] font-bold px-1.5 py-0 border-0">
                              Wajib
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{type.description || `Dokumen kualifikasi ${type.name}`}</p>
                      </div>
                      <div className="p-1 flex-shrink-0">{statusIcon}</div>
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
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
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
                          <p className="font-medium italic">&ldquo;{doc.latestVerification.reviewNote}&rdquo;</p>
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
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">Riwayat Dokumen Terunggah</h2>
              <Card className="border border-border shadow-xs">
                <CardContent className="p-0">
                  <DocumentTable userDocs={userDocs} onGeneralUpload={handleGeneralUploadClick} />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">Kalender & Hari Libur</h2>
              <CalendarSection isDashboard={true} />
            </div>
          </div>

          {/* Upload Modal integration */}
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
        </>
      )}
    </div>
  );
}
