"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus, Save, CheckCircle2, Info } from "lucide-react";
import { useDocumentTypes } from "../hooks/useDocumentTypes";
import { DocTypeTable } from "./DocTypeTable";
import { DocTypeFormModal } from "./DocTypeFormModal";

export function DocTypesView() {
  const {
    editedTypes,
    loading,
    saving,
    successMsg,
    errorMsg,
    isChanged,
    positions,

    // Create Modal triggers
    createOpen,
    setCreateOpen,
    createLoading,

    // Actions
    handleFieldChange,
    handleFormatToggle,
    handleSaveChanges,
    handleCreate,
    handleDelete,
  } = useDocumentTypes();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat data konfigurasi master...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" id="document-types-page-container">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Konfigurasi Jenis Dokumen</h1>
          <p className="text-xs font-bold text-muted-foreground mt-1">
            Kelola spesifikasi teknis, aturan kedaluwarsa, dan status mandatori berkas kepegawaian.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button
            onClick={() => setCreateOpen(true)}
            className="font-bold text-xs flex items-center gap-1.5"
            style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
          >
            <Plus className="w-4 h-4" />
            Tambah Jenis Dokumen
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!isChanged || saving}
            className="font-bold text-xs flex items-center gap-1.5"
            style={{
              backgroundColor: isChanged && !saving ? "var(--jobster-success, #22c55e)" : "var(--border)",
              color: isChanged && !saving ? "#fff" : "var(--muted-foreground)",
            }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert className="border-green-200 bg-green-50 text-green-700">
          <CheckCircle2 className="h-4 w-4" style={{ color: "var(--jobster-success, #22c55e)" }} />
          <AlertDescription className="text-xs font-semibold">{successMsg}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {isChanged && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <Info className="h-4 w-4" style={{ color: "var(--jobster-warning, #f59e0b)" }} />
          <AlertDescription className="text-xs font-semibold">
            Terdapat perubahan konfigurasi yang belum disimpan. Klik tombol <strong>Simpan Perubahan</strong> di atas untuk menerapkan.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Table Card */}
      <Card className="border border-border shadow-xs">
        <CardContent className="p-0 overflow-x-auto">
          {editedTypes.length === 0 ? (
            <div className="text-center py-10 font-semibold text-xs text-muted-foreground">
              Belum ada jenis dokumen terdaftar.
            </div>
          ) : (
            <DocTypeTable
              editedTypes={editedTypes}
              positions={positions}
              onFieldChange={handleFieldChange}
              onFormatToggle={handleFormatToggle}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Document Type Dialog */}
      <DocTypeFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        loading={createLoading}
        onSubmit={handleCreate}
        positions={positions}
      />
    </div>
  );
}
