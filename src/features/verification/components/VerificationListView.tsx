"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useVerificationList } from "../hooks/useVerificationList";
import { VerificationFilters } from "./VerificationFilters";
import { VerificationListTable } from "./VerificationListTable";

export function VerificationListView() {
  const {
    documents,
    loading,
    deletingId,
    errorMsg,
    filters,
    setFilters,
    handleSearchSubmit,
    handleDeleteDocument,
  } = useVerificationList();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" id="verification-list-page-container">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Verifikasi Berkas Pegawai</h1>
        <p className="text-xs font-bold text-muted-foreground mt-1">
          Tinjau, setujui, tolak, atau kelola berkas kualifikasi kepegawaian medis dan administratif.
        </p>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Filter Controls Card */}
      <VerificationFilters 
        filters={filters} 
        setFilters={setFilters} 
        onSubmit={handleSearchSubmit} 
      />

      {/* Main Table Card */}
      <VerificationListTable
        documents={documents}
        loading={loading}
        onDelete={handleDeleteDocument}
        deletingId={deletingId}
      />
    </div>
  );
}
