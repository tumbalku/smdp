import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentRecord } from "../types";

interface DocumentTableProps {
  userDocs: DocumentRecord[];
  onGeneralUpload: () => void;
}

export function DocumentTable({ userDocs, onGeneralUpload }: DocumentTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">Disetujui</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">Menunggu Verifikasi</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="font-semibold">Ditolak</Badge>;
      default:
        return <Badge variant="secondary" className="font-semibold">Belum Diunggah</Badge>;
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

  if (userDocs.length === 0) {
    return (
      <div className="text-center py-10 space-y-2">
        <p className="text-xs text-muted-foreground font-semibold">Belum ada dokumen yang diunggah.</p>
        <Button
          size="sm"
          onClick={onGeneralUpload}
          style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
          className="font-bold text-xs"
        >
          Unggah Sekarang
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="font-bold text-xs">Jenis Dokumen</TableHead>
          <TableHead className="font-bold text-xs">Nama Berkas</TableHead>
          <TableHead className="font-bold text-xs">Tanggal Terbit</TableHead>
          <TableHead className="font-bold text-xs">Masa Berlaku</TableHead>
          <TableHead className="font-bold text-xs">Status</TableHead>
          <TableHead className="font-bold text-xs text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userDocs.map((doc) => (
          <TableRow key={doc.id} className="hover:bg-muted/50">
            <TableCell className="font-bold text-xs text-foreground">{doc.documentType.name}</TableCell>
            <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]" title={doc.fileName}>
              {doc.fileName}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{formatDate(doc.issueDate)}</TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {doc.documentType.requiresExpiryDate ? (
                <span className={new Date(doc.expiryDate!) < new Date() ? "text-rose-500 font-bold" : ""}>
                  {formatDate(doc.expiryDate)}
                </span>
              ) : (
                <span className="text-muted-foreground font-medium italic">Seumur Hidup</span>
              )}
            </TableCell>
            <TableCell className="text-xs">{getStatusBadge(doc.status)}</TableCell>
            <TableCell className="text-xs text-right">
              <a
                href={`/api/documents/download?path=${encodeURIComponent(doc.filePath)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Download className="w-4 h-4" />
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
