"use client";

import React, { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface SecurityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  eventType: string;
  resource: string;
  ipAddress: string | null;
  status: "SUCCESS" | "FAILED" | "WARNING";
  metadata: string | null;
}

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [eventType, setEventType] = useState("ALL");
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) params.append("search", search);
      if (status !== "ALL") params.append("status", status);
      if (eventType !== "ALL") params.append("eventType", eventType);

      const res = await fetch(`/api/admin/security-logs?${params.toString()}`);
      const resData = await res.json();

      if (res.ok) {
        setLogs(resData.data || []);
        setMeta(resData.meta || null);
      } else {
        throw new Error(resData.error?.message || "Gagal memuat log keamanan.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, status, eventType]);

  // Reset page to 1 when filters change
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getStatusBadge = (logStatus: string) => {
    switch (logStatus) {
      case "SUCCESS":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">Sukses</Badge>;
      case "WARNING":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">Peringatan</Badge>;
      case "FAILED":
        return <Badge variant="destructive" className="font-semibold">Gagal</Badge>;
      default:
        return <Badge variant="secondary">{logStatus}</Badge>;
    }
  };

  const formatTimestamp = (isoStr: string) => {
    return new Date(isoStr).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatEventName = (evtType: string) => {
    return evtType
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" id="security-logs-page-container">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Audit Log Keamanan</h1>
        <p className="text-xs font-bold text-muted-foreground mt-1">
          Pantau aktivitas krusial, riwayat autentikasi, pengunggahan berkas, dan pelacakan hak akses sistem.
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
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5 w-full">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Pencarian Aktor / Dokumen</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama aktor, ID dokumen, atau IP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-xs h-9 py-0"
                />
              </div>
            </div>

            <div className="w-full md:w-[200px] space-y-1.5">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Status Aktivitas</span>
              <Select value={status} onValueChange={(val) => { setStatus(val || "ALL"); setPage(1); }}>
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="SUCCESS">Sukses</SelectItem>
                  <SelectItem value="WARNING">Peringatan</SelectItem>
                  <SelectItem value="FAILED">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[220px] space-y-1.5">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Tipe Kejadian</span>
              <Select value={eventType} onValueChange={(val) => { setEventType(val || "ALL"); setPage(1); }}>
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue placeholder="Pilih Kejadian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kejadian</SelectItem>
                  <SelectItem value="DOCUMENT_UPLOADED">Dokumen Diunggah</SelectItem>
                  <SelectItem value="DOCUMENT_APPROVED">Dokumen Disetujui</SelectItem>
                  <SelectItem value="DOCUMENT_REJECTED">Dokumen Ditolak</SelectItem>
                  <SelectItem value="DOCUMENT_DELETED">Dokumen Dihapus</SelectItem>
                  <SelectItem value="USER_CREATED">Pegawai Baru</SelectItem>
                  <SelectItem value="USER_DELETED">Pegawai Dihapus</SelectItem>
                  <SelectItem value="USER_UPDATED">Pegawai Diperbarui</SelectItem>
                  <SelectItem value="USER_ROLE_UPDATED">Peran Diperbarui</SelectItem>
                  <SelectItem value="UNAUTHORIZED_ACCESS">Akses Ilegal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 w-full md:w-auto">
              <span className="block text-[10px] uppercase font-bold text-transparent select-none">_</span>
              <Button type="submit" style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }} className="w-full md:w-auto font-bold text-xs h-9 px-4">
                Terapkan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main logs Table */}
      <Card className="border border-border shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-semibold">Mengambil logs keamanan...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 space-y-2">
              <ShieldAlert className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground font-extrabold">Tidak ada log kecocokan ditemukan.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-xs">Waktu</TableHead>
                  <TableHead className="font-bold text-xs">Aktor</TableHead>
                  <TableHead className="font-bold text-xs">Peran Aktor</TableHead>
                  <TableHead className="font-bold text-xs">Kejadian</TableHead>
                  <TableHead className="font-bold text-xs">Sumber Daya</TableHead>
                  <TableHead className="font-bold text-xs">Alamat IP</TableHead>
                  <TableHead className="font-bold text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-extrabold text-xs text-foreground">
                      {log.actorName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-semibold">
                      {log.actorRole}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-foreground">
                      {formatEventName(log.eventType)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium max-w-[150px] truncate" title={log.resource}>
                      {log.resource}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {log.ipAddress || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {getStatusBadge(log.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs font-bold text-muted-foreground">
            Menampilkan halaman {meta.page} dari {meta.totalPages} (Total {meta.total} log)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs font-bold"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.totalPages || loading}
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              className="text-xs font-bold"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
