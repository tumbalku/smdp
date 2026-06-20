"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSecurityLogs } from "../hooks/useSecurityLogs";
import { SecurityLogsFilters } from "./SecurityLogsFilters";
import { SecurityLogsTable } from "./SecurityLogsTable";

export function SecurityLogsView() {
  const {
    logs,
    meta,
    loading,
    errorMsg,
    filters,
    setFilters,
    handleSearchSubmit,
  } = useSecurityLogs();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" id="security-logs-page-container">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Audit Log Keamanan</h1>
        <p className="text-xs font-bold text-muted-foreground mt-1">
          Pantau aktivitas krusial, riwayat autentikasi, pengunggahan berkas, dan pelacakan hak akses sistem.
        </p>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Filter Controls Card */}
      <SecurityLogsFilters 
        filters={filters} 
        setFilters={setFilters} 
        onSubmit={handleSearchSubmit} 
      />

      {/* Main logs Table */}
      <SecurityLogsTable logs={logs} loading={loading} />

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs font-bold text-muted-foreground">
            Menampilkan halaman {meta.page} dari {meta.totalPages} (Total {meta.total} log)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 1 || loading}
              onClick={() => setFilters.setPage(Math.max(1, filters.page - 1))}
              className="text-xs font-bold"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === meta.totalPages || loading}
              onClick={() => setFilters.setPage(Math.min(meta.totalPages, filters.page + 1))}
              className="text-xs font-bold"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
