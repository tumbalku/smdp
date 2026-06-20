import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
} from "lucide-react";
import { DocumentDetail } from "../types";

interface ReviewActionPanelProps {
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectMode: boolean;
  setRejectMode: (v: boolean) => void;
  reviewNote: string;
  setReviewNote: (v: string) => void;
  submitLoading: boolean;
  onAction: (status: "APPROVED" | "REJECTED") => void;
  verificationHistory: DocumentDetail["verificationHistory"];
}

export function ReviewActionPanel({
  status,
  rejectMode,
  setRejectMode,
  reviewNote,
  setReviewNote,
  submitLoading,
  onAction,
  verificationHistory,
}: ReviewActionPanelProps) {
  const isRejectDisabled = reviewNote.trim().length < 10 || submitLoading;

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
        <CardTitle className="font-extrabold text-sm text-foreground">
          {status === "PENDING" ? "Tindakan Verifikasi" : "Hasil Penilaian"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-4">
        {status === "PENDING" ? (
          <div className="space-y-4">
            {rejectMode ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reviewNote" className="text-xs font-bold text-foreground">
                    Catatan Penolakan (Minimal 10 Karakter)
                  </Label>
                  <textarea
                    id="reviewNote"
                    rows={3}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Tuliskan detail alasan mengapa berkas ditolak (misal: 'Resolusi scan KTP terlalu buram dan tidak terbaca')..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {reviewNote.trim().length > 0 && reviewNote.trim().length < 10 && (
                    <p className="text-[10px] text-destructive font-semibold">
                      Kekurangan {10 - reviewNote.trim().length} karakter lagi.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full text-xs font-bold"
                    onClick={() => onAction("REJECTED")}
                    disabled={isRejectDisabled}
                  >
                    Kirim Penolakan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setRejectMode(false);
                      setReviewNote("");
                    }}
                    disabled={submitLoading}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <Button
                  style={{ backgroundColor: "var(--jobster-success, #22c55e)", color: "#fff" }}
                  size="sm"
                  className="w-full text-xs font-bold"
                  onClick={() => onAction("APPROVED")}
                  disabled={submitLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Setujui Berkas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive border-destructive hover:bg-destructive/10 text-xs font-bold"
                  onClick={() => setRejectMode(true)}
                  disabled={submitLoading}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Tolak Berkas
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-muted p-4 rounded-xl border border-border text-xs space-y-3">
            <div className="flex items-center gap-2">
              {status === "APPROVED" ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              )}
              <span className="font-bold text-foreground">
                Dokumen Telah {status === "APPROVED" ? "Disetujui" : "Ditolak"}
              </span>
            </div>

            {verificationHistory && verificationHistory.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-border">
                {verificationHistory.filter(h => h.status !== "PENDING").map((hist) => (
                  <div key={hist.id} className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">
                      Dinilai oleh <span className="font-bold text-foreground">{hist.reviewedBy?.name || "HR System"}</span> ({hist.reviewerRole}) pada {formatTimestamp(hist.reviewedAt)}
                    </p>
                    {hist.reviewNote && (
                      <div className="bg-rose-500/10 text-rose-500 p-2.5 rounded-lg border border-rose-500/20 italic font-medium mt-1">
                        &ldquo; {hist.reviewNote} &rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
