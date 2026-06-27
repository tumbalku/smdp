"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  Plus,
  Save,
  CheckCircle2,
  Info,
  FolderOpen,
  Clock,
  HardDrive,
  Layers,
} from "lucide-react";
import { useDocumentTypes } from "../hooks/useDocumentTypes";
import { DocTypeTable } from "./DocTypeTable";
import Link from "next/link";

export function DocTypesView() {
  const {
    editedTypes,
    loading,
    saving,
    successMsg,
    errorMsg,
    isChanged,
    positions,

    // Actions
    handleFieldChange,
    handleFormatToggle,
    handleSaveChanges,
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

  const maxLimit = editedTypes.length > 0 ? Math.max(...editedTypes.map(t => t.maxSize)) : 0;

  return (
    <div className="page-container animate-fadeIn" id="document-types-page-container">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Layers className="w-9 h-9 text-[#6c63ff] animate-pulse" />
            Konfigurasi Jenis Dokumen
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Kelola spesifikasi teknis, aturan kedaluwarsa, dan status mandatori berkas kepegawaian.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/document-types/create" passHref>
            <Button
              className="font-bold text-xs flex items-center gap-1.5 bg-[#6c63ff] hover:bg-[#6c63ff]/90 text-white"
            >
              <Plus className="w-4 h-4" />
              Tambah Jenis Dokumen
            </Button>
          </Link>
          <Button
            onClick={handleSaveChanges}
            disabled={!isChanged || saving}
            className="font-bold text-xs flex items-center gap-1.5 transition-all duration-150"
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

      {/* KPI Detail Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-sm hover:border-border/80 border-t-4 border-t-[#6c63ff]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Jenis Dokumen</span>
              <span className="text-2xl font-black text-foreground font-mono">{editedTypes.length}</span>
              <span className="text-[10px] text-muted-foreground block font-medium">Jenis berkas terdaftar</span>
            </div>
            <div className="p-3 bg-[#6c63ff]/10 text-[#6c63ff] rounded-xl">
              <FolderOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-sm hover:border-border/80 border-t-4 border-t-rose-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Dokumen Mandatori</span>
              <span className="text-2xl font-black text-foreground font-mono">{editedTypes.filter(t => t.isMandatory).length}</span>
              <span className="text-[10px] text-muted-foreground block font-medium">Wajib diunggah pegawai</span>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-sm hover:border-border/80 border-t-4 border-t-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Masa Berlaku Aktif</span>
              <span className="text-2xl font-black text-foreground font-mono">{editedTypes.filter(t => t.requiresExpiryDate).length}</span>
              <span className="text-[10px] text-muted-foreground block font-medium">Butuh masa tenggat</span>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-sm hover:border-border/80 border-t-4 border-t-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Batas Ukuran Terbesar</span>
              <span className="text-2xl font-black text-foreground font-mono">{maxLimit} MB</span>
              <span className="text-[10px] text-muted-foreground block font-medium">Ukuran unggah terbesar</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <HardDrive className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border bg-card shadow-sm">
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
    </div>
  );
}
