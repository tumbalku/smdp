"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentType, DocumentRecord as EmployeeDocumentRecord } from "../../documents/types";

interface ComplianceOverviewBannerProps {
  docTypes: DocumentType[];
  userDocs: EmployeeDocumentRecord[];
}

/**
 * Reusable Component: Banner Skor Kepatuhan Berkas Mandatori.
 */
export function ComplianceOverviewBanner({
  docTypes,
  userDocs,
}: ComplianceOverviewBannerProps) {
  const mandatoryTypes = docTypes.filter((t) => t.isMandatory);
  const uploadedMandatory = mandatoryTypes.filter((t) =>
    userDocs.some((d) => d.documentTypeId === t.id && (d.status === "APPROVED" || d.status === "PENDING"))
  );
  const compliancePercentage = mandatoryTypes.length
    ? Math.round((uploadedMandatory.length / mandatoryTypes.length) * 100)
    : 100;

  return (
    <Card className="border-l-4 border-l-[#6c63ff] shadow-xs">
      <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-foreground">
            Skor Kepatuhan Berkas Mandatori ({uploadedMandatory.length}/{mandatoryTypes.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Anda telah melengkapi {uploadedMandatory.length} dari {mandatoryTypes.length} dokumen wajib.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-3xl font-extrabold text-foreground">{compliancePercentage}%</span>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground mt-0.5">
              TERPENUHI
            </p>
          </div>
          <div className="w-24 bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${compliancePercentage}%`,
                backgroundColor:
                  compliancePercentage === 100
                    ? "var(--jobster-success, #22c55e)"
                    : "var(--jobster-accent, #6c63ff)",
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
