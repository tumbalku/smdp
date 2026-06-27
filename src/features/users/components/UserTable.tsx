import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeyRound, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "../types";

interface UserTableProps {
  users: User[];
  onChangePassword: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserTable({ users, onChangePassword, onDelete }: UserTableProps) {
  const { data: session } = useSession();
  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case "HR_ADMIN":
        return (
          <Badge className="bg-[#6c63ff] text-white hover:bg-[#6c63ff]/90 font-semibold text-[10px]">
            HR Admin
          </Badge>
        );
      case "STAFF":
        return (
          <Badge className="bg-sky-500 text-white hover:bg-sky-600 font-semibold text-[10px]">
            Staff
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-400 text-white hover:bg-slate-500 font-semibold text-[10px]">
            Pegawai
          </Badge>
        );
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
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="font-bold text-xs">NIP</TableHead>
          <TableHead className="font-bold text-xs">Nama Pegawai</TableHead>
          <TableHead className="font-bold text-xs">Email</TableHead>
          <TableHead className="font-bold text-xs">Jenis Kelamin</TableHead>
          <TableHead className="font-bold text-xs">Tanggal Lahir</TableHead>
          <TableHead className="font-bold text-xs">Status Kepegawaian</TableHead>
          <TableHead className="font-bold text-xs">Peran Otorisasi</TableHead>
          <TableHead className="font-bold text-xs text-right pr-6">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="hover:bg-muted/50">
            <TableCell className="font-bold text-xs text-foreground">
              {user.employeeId || "-"}
            </TableCell>
            <TableCell className="align-middle">
              <div className="space-y-1">
                <p className="font-extrabold text-xs text-foreground">
                  {user.name} {user.gelarAkademik ? `, ${user.gelarAkademik}` : ""}
                </p>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {user.namaLahir && (
                    <span className="text-[9px] text-muted-foreground font-medium italic">
                      Lahir: {user.namaLahir}
                    </span>
                  )}
                  {user.agama && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-500/5 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-500/20 font-mono font-normal">
                      Agama: {user.agama}
                    </Badge>
                  )}
                  {user.pendidikanTerakhir && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-500/5 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-500/20 font-mono font-normal">
                      Pendidikan: {user.pendidikanTerakhir}
                    </Badge>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground font-medium">
              {user.email}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground font-semibold">
              {user.gender === "L" ? "Laki-laki" : user.gender === "P" ? "Perempuan" : "-"}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground font-medium">
              {formatDate(user.birthDate)}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground font-semibold">
              {user.employmentStatus ? (
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground">
                    {user.employmentStatus.name}
                    {user.employeeGroup && ` - ${user.employeeGroup.name}`}
                  </span>
                  {(user.professionGroup || user.employeePosition) && (
                    <span className="text-[10px] text-muted-foreground block font-medium">
                      {user.professionGroup?.name || "-"}
                      {user.employeePosition && ` - ${user.employeePosition.name}`}
                    </span>
                  )}
                  {user.employeeRank && (
                    <span className="text-[10px] text-primary block font-bold leading-normal">
                      Pangkat: {user.employeeRank.name}
                    </span>
                  )}
                  {user.workplace && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold leading-normal">
                      Tempat Tugas: {user.workplace.name}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground/50 italic font-medium">-</span>
              )}
            </TableCell>
            <TableCell className="align-middle">
              <div className="flex flex-wrap gap-1">
                {user.roles.map((r) => (
                  <React.Fragment key={r}>{getRoleBadge(r)}</React.Fragment>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right pr-4 align-middle">
              <div className="flex items-center justify-end gap-2">
                <Link href={`/users/edit/${user.id}`} passHref>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] font-bold h-8 px-3"
                  >
                    Edit Pegawai
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] font-bold h-8 px-3 text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                  onClick={() => onChangePassword(user)}
                  title="Ubah password pengguna ini"
                >
                  <KeyRound className="w-3 h-3 mr-1.5" />
                  Password
                </Button>
                {session?.user?.id !== user.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] font-bold h-8 px-3 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin menghapus pegawai "${user.name}"? Semua data dokumen dan riwayat terkait akan ikut dihapus.`)) {
                        onDelete(user);
                      }
                    }}
                    title="Hapus pegawai ini"
                  >
                    <Trash2 className="w-3 h-3 mr-1.5" />
                    Hapus
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
