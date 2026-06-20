import React from "react";
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
import { Loader2, ShieldAlert } from "lucide-react";
import { SecurityLog } from "../types";

interface SecurityLogsTableProps {
  logs: SecurityLog[];
  loading: boolean;
}

export function SecurityLogsTable({ logs, loading }: SecurityLogsTableProps) {
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
  );
}
