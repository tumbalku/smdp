"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatsCard } from "@/components/StatsCard";
import { AlertCircle, FileText, Clock, Loader2 } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { VerificationQueue } from "./VerificationQueue";

/**
 * Dashboard view untuk STAFF.
 * Menampilkan subset dari admin: pending verification & stats dokumen.
 */
export function StaffView() {
  const { data: session } = useSession();
  const {
    loading,
    errorMsg,
    adminDocs,
    pendingDocs,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat data dashboard staff...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8" id="staff-dashboard-container">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Dashboard Staff Kepegawaian
        </h1>
        <p className="text-xs font-bold text-muted-foreground mt-1">
          Selamat datang, <span className="text-primary">{session?.user?.name || "Staff"}</span>.
          Tinjau berkas pegawai yang memerlukan verifikasi.
        </p>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards — subset untuk staff */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          subtext="Menunggu persetujuan"
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        <VerificationQueue pendingDocs={pendingDocs} />
      </div>
    </div>
  );
}
