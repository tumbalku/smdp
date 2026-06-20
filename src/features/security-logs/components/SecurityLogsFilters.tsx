import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface SecurityLogsFiltersProps {
  filters: {
    search: string;
    status: string;
    eventType: string;
  };
  setFilters: {
    setSearch: (val: string) => void;
    setStatus: (val: string) => void;
    setEventType: (val: string) => void;
    setPage: (val: number) => void;
  };
  onSubmit: (e: React.FormEvent) => void;
}

export function SecurityLogsFilters({ filters, setFilters, onSubmit }: SecurityLogsFiltersProps) {
  const { search, status, eventType } = filters;
  const { setSearch, setStatus, setEventType, setPage } = setFilters;

  return (
    <Card className="border border-border shadow-xs">
      <CardContent className="p-4">
        <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-3 items-end">
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
  );
}
