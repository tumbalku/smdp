"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  AlertCircle,
  Search,
  CheckCircle,
  Eye,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface DocumentRecord {
  id: string;
  fileName: string;
  filePath: string;
  issueDate: string | null;
  expiryDate: string | null;
  uploadedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  expiryStatus: "AMAN" | "KEDALUWARSA" | "MENDEKATI_KEDALUWARSA";
  daysRemaining: number | null;
  documentType: {
    name: string;
    targetPositions: string | null;
  };
  owner: {
    name: string;
    employeeId: string | null;
    email: string;
  };
}

export default function VerificationListPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [expiryStatus, setExpiryStatus] = useState("ALL");

  const fetchDocuments = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status !== "ALL") params.append("status", status);
      if (expiryStatus !== "ALL") params.append("expiryStatus", expiryStatus);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const resData = await res.json();

      if (res.ok) {
        setDocuments(resData.data || []);
      } else {
        throw new Error(resData.error?.message || "Gagal memuat dokumen.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [status, expiryStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" id="verification-list-page-container">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Verifikasi Berkas Pegawai</h1>
        <p className="text-xs font-bold text-muted-foreground mt-1">
          Tinjau, setujui, atau tolak berkas kualifikasi kepegawaian medis dan administratif.
        </p>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Filter Controls Card */}
      <Card className="border border-border shadow-xs">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1.5 w-full">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Pencarian Pegawai</span>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama pegawai..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="w-full md:w-[200px] space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Status Verifikasi</span>
              <Select value={status} onValueChange={(val) => setStatus(val || "ALL")}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu Verifikasi</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[220px] space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Status Masa Berlaku</span>
              <Select value={expiryStatus} onValueChange={(val) => setExpiryStatus(val || "ALL")}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Masa Berlaku" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kondisi</SelectItem>
                  <SelectItem value="AMAN">Masa Berlaku Aman</SelectItem>
                  <SelectItem value="MENDEKATI_KEDALUWARSA">Mendekati Kedaluwarsa</SelectItem>
                  <SelectItem value="KEDALUWARSA">Sudah Kedaluwarsa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }} className="w-full md:w-auto font-bold text-xs">
              Terapkan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Main Table Card */}
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
    </div>
  );
}
