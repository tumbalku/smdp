import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, CheckCircle } from "lucide-react";
import { DocumentRecord } from "../types";

interface VerificationQueueProps {
  pendingDocs: DocumentRecord[];
}

export function VerificationQueue({ pendingDocs }: VerificationQueueProps) {
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">Antrian Persetujuan Berkas</h2>
        <Badge className="bg-[#6c63ff] text-white hover:bg-[#6c63ff] font-bold px-2 py-0.5 text-xs">
          {pendingDocs.length} Tertunda
        </Badge>
      </div>

      <Card className="border border-border shadow-xs">
        <CardContent className="p-0">
          {pendingDocs.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-xs text-muted-foreground font-extrabold">Semua berkas bersih!</p>
              <p className="text-[10px] text-muted-foreground">Tidak ada dokumen baru yang memerlukan persetujuan.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-xs">Pegawai</TableHead>
                  <TableHead className="font-bold text-xs">Jenis Dokumen</TableHead>
                  <TableHead className="font-bold text-xs">Diunggah Pada</TableHead>
                  <TableHead className="font-bold text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDocs.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/50">
                    <TableCell className="py-3">
                      <div>
                        <p className="font-extrabold text-xs text-foreground">{doc.owner.name}</p>
                        <p className="text-[10px] text-muted-foreground">NIP: {doc.owner.employeeId || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-foreground">{doc.documentType.name}</span>
                        {doc.documentType.targetPositions && (
                          <Badge className="bg-[#6c63ff]/10 hover:bg-[#6c63ff]/10 text-[#6c63ff] text-[9px] font-bold px-1 py-0 border-0">
                            {doc.documentType.targetPositions}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {formatDate(doc.uploadedAt)}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Link
                        href={`/admin/verification/${doc.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-[10px] font-bold text-white transition-all hover:opacity-95"
                        style={{ backgroundColor: "var(--jobster-accent, #6c63ff)" }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Tinjau
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
