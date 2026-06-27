"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { DocumentType, DocumentRecord as EmployeeDocumentRecord } from "../../documents/types";
import { getDocumentIcon } from "../../document-types/utils/icons";

interface RequiredDocumentsGridProps {
  docTypes: DocumentType[];
  userDocs: EmployeeDocumentRecord[];
  onUploadClick: (type: DocumentType) => void;
}

/**
 * Reusable Component: Grid Status Dokumen Wajib.
 */
export function RequiredDocumentsGrid({
  docTypes,
  userDocs,
  onUploadClick,
}: RequiredDocumentsGridProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
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
              onClick={() => onUploadClick(type)}
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
                onClick={() => onUploadClick(type)}
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
                onClick={() => onUploadClick(type)}
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
                  <p className="text-[10px] text-muted-foreground line-clamp-2">
                    {type.description || `Dokumen identifikasi/kualifikasi ${type.name}`}
                  </p>
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
  );
}
