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
import { Loader2, CheckCircle, Eye, Calendar } from "lucide-react";
import { DocumentRecord } from "../types";

interface VerificationListTableProps {
  documents: DocumentRecord[];
  loading: boolean;
}

export function VerificationListTable({ documents, loading }: VerificationListTableProps) {
  const getStatusBadge = (docStatus: string) => {
    switch (docStatus) {
      case "APPROVED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">Disetujui</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">Menunggu Verifikasi</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="font-semibold">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{docStatus}</Badge>;
    }
  };

  const getExpiryBadge = (expStatus: string, days: number | null) => {
    switch (expStatus) {
      case "KEDALUWARSA":
        return (
          <Badge variant="destructive" className="text-[10px] font-bold">
            Kedaluwarsa
          </Badge>
        );
      case "MENDEKATI_KEDALUWARSA":
        return (
          <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-[10px] font-bold">
            Siaga ({days} Hari)
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card className="border border-border shadow-xs">
      <CardContent className="p-0 overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-semibold">Memuat berkas pegawai...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs text-muted-foreground font-extrabold">Tidak ada dokumen terdaftar.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs">Pegawai</TableHead>
                <TableHead className="font-bold text-xs">Jenis Dokumen</TableHead>
                <TableHead className="font-bold text-xs">Nama Berkas</TableHead>
                <TableHead className="font-bold text-xs">Masa Berlaku</TableHead>
                <TableHead className="font-bold text-xs">Status</TableHead>
                <TableHead className="font-bold text-xs text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-muted/50">
                  <TableCell className="py-4">
                    <div>
                      <p className="font-extrabold text-xs text-foreground">{doc.owner.name}</p>
                      <p className="text-[10px] text-muted-foreground">NIP: {doc.owner.employeeId || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-foreground">{doc.documentType.name}</span>
                      {doc.documentType.targetPositions && (
                        <Badge className="bg-[#6c63ff]/10 hover:bg-[#6c63ff]/10 text-[#6c63ff] text-[9px] font-bold px-1 py-0 border-0">
                          {doc.documentType.targetPositions}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]" title={doc.fileName}>
                    {doc.fileName}
                  </TableCell>
                  <TableCell className="align-middle text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{formatDate(doc.expiryDate)}</span>
                      </div>
                      {getExpiryBadge(doc.expiryStatus, doc.daysRemaining)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs align-middle">
                    {getStatusBadge(doc.status)}
                  </TableCell>
                  <TableCell className="text-right pr-4 align-middle">
                    <Link
                      href={`/admin/verification/${doc.id}`}
                      className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted h-8 px-3 text-[10px] font-bold text-foreground transition-colors gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Tinjau Berkas
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
