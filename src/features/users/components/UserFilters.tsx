import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  roleFilter: string;
  setRoleFilter: (roleFilter: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function UserFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  onSubmit,
}: UserFiltersProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 space-y-1.5 w-full">
        <span className="text-[10px] uppercase font-bold text-muted-foreground">Pencarian Pegawai</span>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama, email, atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      <div className="w-full md:w-[220px] space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-muted-foreground">Filter Peran Otorisasi</span>
        <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val || "ALL")}>
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="Pilih Peran" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Peran</SelectItem>
            <SelectItem value="EMPLOYEE">Pegawai (Employee)</SelectItem>
            <SelectItem value="STAFF">Staff</SelectItem>
            <SelectItem value="HR_ADMIN">HR Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }} className="w-full md:w-auto font-bold text-xs">
        Terapkan
      </Button>
    </form>
  );
}
