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

interface VerificationFiltersProps {
  filters: {
    search: string;
    status: string;
    expiryStatus: string;
  };
  setFilters: {
    setSearch: (val: string) => void;
    setStatus: (val: string) => void;
    setExpiryStatus: (val: string) => void;
  };
  onSubmit: (e: React.FormEvent) => void;
}

export function VerificationFilters({ filters, setFilters, onSubmit }: VerificationFiltersProps) {
  const { search, status, expiryStatus } = filters;
  const { setSearch, setStatus, setExpiryStatus } = setFilters;

  return (
    <Card className="border border-border shadow-xs">
      <CardContent className="p-4">
        <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4 items-end">
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
  );
}
