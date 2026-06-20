import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { DocumentDetail } from "../types";

interface VerificationTimelineProps {
  verificationHistory: DocumentDetail["verificationHistory"];
}

export function VerificationTimeline({ verificationHistory }: VerificationTimelineProps) {
  const formatTimestamp = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
          <History className="w-4 h-4 text-muted-foreground" />
          Log Aktivitas Berkas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="relative pl-4 border-l border-border space-y-4 text-xs">
          {verificationHistory.map((hist) => {
            const isPending = hist.status === "PENDING";
            const isApproved = hist.status === "APPROVED";
            const isRejected = hist.status === "REJECTED";

            let dotBg = "bg-muted";
            let label = "Dokumen Diunggah";
            const actor = hist.reviewedBy?.name || "Pegawai";

            if (isApproved) {
              dotBg = "bg-emerald-500";
              label = "Disetujui oleh Reviewer";
            } else if (isRejected) {
              dotBg = "bg-rose-500";
              label = "Ditolak oleh Reviewer";
            } else if (isPending && hist.reviewedAt) {
              label = "Masuk Antrian Peninjauan";
            }

            return (
              <div key={hist.id} className="relative">
                <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ${dotBg} border-2 border-white`} />
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {actor} • {formatTimestamp(hist.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
