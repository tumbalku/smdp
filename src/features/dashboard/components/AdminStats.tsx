"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatsCard } from "@/components/StatsCard";
import { AlertCircle, Users, FileText, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { VerificationQueue } from "./VerificationQueue";
import { RetirementMonitor } from "./RetirementMonitor";

/**
 * Dashboard view untuk HR_ADMIN.
 * Menampilkan stats lengkap: total pegawai, dokumen, pending, berkas bermasalah,
 * antrian verifikasi, dan monitor pensiun.
 */
export function AdminStats() {
  const { data: session } = useSession();
  const {
    loading,
    errorMsg,
    stats,
    adminDocs,
    pendingDocs,
    criticalDocumentsCount,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat data dashboard administrasi...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8" id="admin-dashboard-container">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Dashboard Administrasi Kepegawaian
        </h1>
        <p className="text-xs font-bold text-muted-foreground mt-1">
          Selamat datang kembali, <span className="text-primary">{session?.user?.name || "Admin"}</span>.
          Pantau kelayakan berkas pegawai dan kepatuhan regulasi di bawah ini.
        </p>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

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
          subtext="Kedaluwarsa atau Mendekati"
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <VerificationQueue pendingDocs={pendingDocs} />
        </div>
        <div className="space-y-4">
          <RetirementMonitor stats={stats} />
        </div>
      </div>
    </div>
  );
}
