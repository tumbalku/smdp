"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

interface EmployeePositionOption {
  id: string;
  name: string;
}

interface EmployeeGroupOption {
  id: string;
  name: string;
  positions: EmployeePositionOption[];
}

interface EmploymentStatusOption {
  id: string;
  name: string;
  groups: EmployeeGroupOption[];
}

interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  role: string;
  roles: string[];
  createdAt: string;
  namaLahir: string | null;
  alamatLengkap: string | null;
  nomorTelepon: string | null;
  gelarAkademik: string | null;
  gender: string | null;
  birthDate: string | null;
  employmentStatusId: string | null;
  employeeGroupId: string | null;
  employeePositionId: string | null;
  employmentStatus: { name: string } | null;
  employeeGroup: { name: string } | null;
  employeePosition: { name: string } | null;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Master Kepegawaian states
  const [categories, setCategories] = useState<EmploymentStatusOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  // Create Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createEmployeeId, setCreateEmployeeId] = useState("");
  const [createGender, setCreateGender] = useState("L");
  const [createBirthDate, setCreateBirthDate] = useState("");
  const [createRoles, setCreateRoles] = useState<string[]>(["EMPLOYEE"]);
  const [createEmploymentStatusId, setCreateEmploymentStatusId] = useState("");
  const [createEmployeeGroupId, setCreateEmployeeGroupId] = useState("");
  const [createEmployeePositionId, setCreateEmployeePositionId] = useState("");

  // Edit Modal states
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editGender, setEditGender] = useState("L");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editEmploymentStatusId, setEditEmploymentStatusId] = useState("");
  const [editEmployeeGroupId, setEditEmployeeGroupId] = useState("");
  const [editEmployeePositionId, setEditEmployeePositionId] = useState("");

  // Change Password Modal states
  const [pwOpen, setPwOpen] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwTargetUser, setPwTargetUser] = useState<User | null>(null);
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwShowNew, setPwShowNew] = useState(false);
  const [pwShowConfirm, setPwShowConfirm] = useState(false);
  const [pwError, setPwError] = useState("");

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch("/api/admin/employment-categories");
      const resData = await res.json();
      if (res.ok && resData.success) {
        setCategories(resData.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat kategori kepegawaian:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("pageSize", "10");
      if (search) params.append("search", search);
      if (roleFilter !== "ALL") params.append("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const resData = await res.json();

      if (res.ok) {
        setUsers(resData.users || []);
        setTotal(resData.total || 0);
        setTotalPages(resData.totalPages || 1);
      } else {
        throw new Error(resData.error?.message || "Gagal mengambil data pegawai.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!createName || !createEmail || !createPassword || !createEmployeeId) {
      setErrorMsg("Harap isi semua kolom wajib.");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          email: createEmail,
          password: createPassword,
          roles: createRoles,
          employeeId: createEmployeeId,
          gender: createGender,
          birthDate: createBirthDate || null,
          employmentStatusId: createEmploymentStatusId || null,
          employeeGroupId: createEmployeeGroupId || null,
          employeePositionId: createEmployeePositionId || null,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal menambahkan pegawai.");
      }

      setSuccessMsg(`Pegawai "${createName}" berhasil didaftarkan.`);
      setCreateOpen(false);

      // Reset Create Form
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateEmployeeId("");
      setCreateGender("L");
      setCreateBirthDate("");
      setCreateRoles(["EMPLOYEE"]);
      setCreateEmploymentStatusId("");
      setCreateEmployeeGroupId("");
      setCreateEmployeePositionId("");

      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mendaftarkan pegawai.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenEditRoles = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditEmployeeId(user.employeeId || "");
    setEditGender(user.gender || "L");
    setEditBirthDate(user.birthDate ? user.birthDate.split("T")[0] : "");
    setEditRoles(user.roles);
    setEditEmploymentStatusId(user.employmentStatusId || "");
    setEditEmployeeGroupId(user.employeeGroupId || "");
    setEditEmployeePositionId(user.employeePositionId || "");
    setEditOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg("");
    setSuccessMsg("");

    setEditLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          name: editName,
          email: editEmail,
          employeeId: editEmployeeId || null,
          gender: editGender,
          birthDate: editBirthDate || null,
          roles: editRoles,
          employmentStatusId: editEmploymentStatusId || null,
          employeeGroupId: editEmployeeGroupId || null,
          employeePositionId: editEmployeePositionId || null,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal memperbarui pegawai.");
      }

      setSuccessMsg(`Informasi pegawai "${editName}" berhasil diperbarui.`);
      setEditOpen(false);
      setSelectedUser(null);
      setEditName("");
      setEditEmail("");
      setEditEmployeeId("");
      setEditGender("L");
      setEditBirthDate("");
      setEditRoles([]);
      setEditEmploymentStatusId("");
      setEditEmployeeGroupId("");
      setEditEmployeePositionId("");

      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui data pegawai.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleRoleCheckboxChange = (role: string, isCreate: boolean) => {
    const list = isCreate ? createRoles : editRoles;
    const setter = isCreate ? setCreateRoles : setEditRoles;

    if (list.includes(role)) {
      if (list.length === 1) return; // Prevent empty roles
      setter(list.filter((r) => r !== role));
    } else {
      setter([...list, role]);
    }
  };

  const handleOpenChangePw = (user: User) => {
    setPwTargetUser(user);
    setPwNew("");
    setPwConfirm("");
    setPwShowNew(false);
    setPwShowConfirm(false);
    setPwError("");
    setPwOpen(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwTargetUser) return;
    setPwError("");

    if (pwNew.length < 6) {
      setPwError("Password baru minimal 6 karakter.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError("Konfirmasi password tidak cocok.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${pwTargetUser.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: pwNew }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error?.message || "Gagal mengubah password.");

      const successMessage = resData.data?.message || `Password berhasil diubah.`;
      // Close dialog first, then show success message after dialog animation completes.
      // Doing both simultaneously causes React's insertBefore to fail because Radix UI's
      // portal DOM nodes are being removed while React tries to reconcile the Alert insertion.
      setPwOpen(false);
      setPwTargetUser(null);
      setTimeout(() => setSuccessMsg(successMessage), 300);
    } catch (err: any) {
      setPwError(err.message || "Gagal mengubah password.");
    } finally {
      setPwLoading(false);
    }
  };


  const getRoleBadge = (roleName: string) => {

    switch (roleName) {
      case "HR_ADMIN":
        return <Badge className="bg-[#6c63ff] text-white hover:bg-[#6c63ff]/90 font-semibold text-[10px]">HR Admin</Badge>;
      case "STAFF":
        return <Badge className="bg-sky-500 text-white hover:bg-sky-600 font-semibold text-[10px]">Staff</Badge>;
      default:
        return <Badge className="bg-slate-400 text-white hover:bg-slate-500 font-semibold text-[10px]">Pegawai</Badge>;
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" id="users-management-page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Manajemen Pegawai</h1>
          <p className="text-xs font-bold text-muted-foreground mt-1">
            Daftarkan pegawai baru, tinjau informasi identitas diri, dan konfigurasikan peran otorisasi sistem.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="font-bold text-xs flex items-center gap-1.5"
          style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
        >
          <Plus className="w-4 h-4" />
          Tambah Pegawai Baru
        </Button>
      </div>

      {successMsg && (
        <Alert className="border-green-200 bg-green-50 text-green-700">
          <CheckCircle2 className="h-4 w-4" style={{ color: "var(--jobster-success, #22c55e)" }} />
          <AlertDescription className="text-xs font-semibold">{successMsg}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Filter Card */}
      <Card className="border border-border shadow-xs">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-end">
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
              <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val || "ALL"); setPage(1); }}>
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
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border border-border shadow-xs">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-semibold">Memuat database pegawai...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-xs font-semibold text-muted-foreground">
              Tidak ada data pegawai yang cocok.
            </div>
          ) : (
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
                    <TableCell className="font-bold text-xs text-foreground">{user.employeeId || "-"}</TableCell>
                    <TableCell className="align-middle">
                      <div>
                        <p className="font-extrabold text-xs text-foreground">
                          {user.name} {user.gelarAkademik ? `, ${user.gelarAkademik}` : ""}
                        </p>
                        {user.namaLahir && (
                          <p className="text-[9px] text-muted-foreground italic">Lahir: {user.namaLahir}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">{user.email}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-semibold">
                      {user.gender === "L" ? "Laki-laki" : user.gender === "P" ? "Perempuan" : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">{formatDate(user.birthDate)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-semibold">
                      {user.employmentStatus ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground">
                            {user.employmentStatus.name}
                          </span>
                          {user.employeeGroup && (
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              {user.employeeGroup.name}
                              {user.employeePosition && ` - ${user.employeePosition.name}`}
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] font-bold h-8 px-3"
                          onClick={() => handleOpenEditRoles(user)}
                        >
                          Edit Pegawai
                        </Button>
                        {/* Only HR_ADMIN can reset passwords - checked server-side too */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] font-bold h-8 px-3 text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                          onClick={() => handleOpenChangePw(user)}
                          title="Ubah password pengguna ini"
                        >
                          <KeyRound className="w-3 h-3 mr-1.5" />
                          Password
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs font-bold text-muted-foreground">
            Menampilkan halaman {page} dari {totalPages} (Total {total} pegawai)
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
              disabled={page === totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-xs font-bold"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-foreground tracking-tight">Daftarkan Pegawai Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cName" className="text-xs font-bold text-muted-foreground">Nama Lengkap *</Label>
                  <Input
                    id="cName"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Contoh: dr. John Doe"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cEmployeeId" className="text-xs font-bold text-muted-foreground">NIP (Nomor Induk Pegawai) *</Label>
                  <Input
                    id="cEmployeeId"
                    value={createEmployeeId}
                    onChange={(e) => setCreateEmployeeId(e.target.value)}
                    placeholder="Contoh: 198804122015031002"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cEmail" className="text-xs font-bold text-muted-foreground">Email Utama *</Label>
                  <Input
                    id="cEmail"
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="Contoh: john.doe@smdp.local"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cPassword" className="text-xs font-bold text-muted-foreground">Kata Sandi Awal *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cPassword"
                      type="password"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Min 6 Karakter"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cGender" className="text-xs font-bold text-muted-foreground">Jenis Kelamin</Label>
                  <Select value={createGender} onValueChange={(val) => setCreateGender(val || "L")}>
                    <SelectTrigger id="cGender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki (L)</SelectItem>
                      <SelectItem value="P">Perempuan (P)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cBirthDate" className="text-xs font-bold text-muted-foreground">Tanggal Lahir</Label>
                  <Input
                    id="cBirthDate"
                    type="date"
                    value={createBirthDate}
                    onChange={(e) => setCreateBirthDate(e.target.value)}
                  />
                </div>

                {/* Status Kepegawaian */}
                <div className="space-y-1.5">
                  <Label htmlFor="cStatus" className="text-xs font-bold text-muted-foreground">Status Kepegawaian</Label>
                  <Select
                    value={createEmploymentStatusId}
                    onValueChange={(val) => {
                      setCreateEmploymentStatusId(val || "");
                      setCreateEmployeeGroupId("");
                      setCreateEmployeePositionId("");
                    }}
                  >
                    <SelectTrigger id="cStatus" className="text-xs">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Kelompok Pegawai */}
                <div className="space-y-1.5">
                  <Label htmlFor="cGroup" className="text-xs font-bold text-muted-foreground">Kelompok Pegawai</Label>
                  <Select
                    value={createEmployeeGroupId}
                    onValueChange={(val) => {
                      setCreateEmployeeGroupId(val || "");
                      setCreateEmployeePositionId("");
                    }}
                    disabled={!createEmploymentStatusId}
                  >
                    <SelectTrigger id="cGroup" className="text-xs">
                      <SelectValue placeholder={createEmploymentStatusId ? "Pilih Kelompok" : "Pilih Status Kepegawaian dahulu"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories.find((c) => c.id === createEmploymentStatusId)?.groups || []).map((g) => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Profesi / Jabatan */}
                {createEmploymentStatusId && 
                 createEmployeeGroupId && 
                 (categories.find((c) => c.id === createEmploymentStatusId)?.groups || [])
                   .find((g) => g.id === createEmployeeGroupId)?.positions.length ? (
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="cPosition" className="text-xs font-bold text-muted-foreground">Profesi / Jabatan</Label>
                    <Select
                      value={createEmployeePositionId}
                      onValueChange={(val) => setCreateEmployeePositionId(val || "")}
                    >
                      <SelectTrigger id="cPosition" className="text-xs">
                        <SelectValue placeholder="Pilih Profesi / Jabatan" />
                      </SelectTrigger>
                      <SelectContent>
                        {((categories.find((c) => c.id === createEmploymentStatusId)?.groups || [])
                          .find((g) => g.id === createEmployeeGroupId)?.positions || []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>

              {/* Roles Selector */}
              <div className="space-y-2 bg-muted p-4 rounded-xl border border-border">
                <Label className="text-xs font-bold text-foreground block mb-1">Peran Otorisasi (Pilih minimal satu)</Label>
                <div className="flex gap-4">
                  {["EMPLOYEE", "STAFF", "HR_ADMIN"].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                      <input
                        type="checkbox"
                        checked={createRoles.includes(r)}
                        onChange={() => handleRoleCheckboxChange(r, true)}
                        className="h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary"
                      />
                      {r === "EMPLOYEE" ? "Pegawai" : r === "STAFF" ? "Staff" : "HR Admin"}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
                style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  "Daftarkan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={(val) => !val && setEditOpen(false)}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-foreground tracking-tight">Edit Profil & Otorisasi Pegawai</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="eName" className="text-xs font-bold text-muted-foreground">Nama Lengkap *</Label>
                    <Input
                      id="eName"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Contoh: dr. John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="eEmployeeId" className="text-xs font-bold text-muted-foreground">NIP (Nomor Induk Pegawai) *</Label>
                    <Input
                      id="eEmployeeId"
                      value={editEmployeeId}
                      onChange={(e) => setEditEmployeeId(e.target.value)}
                      placeholder="Contoh: 198804122015031002"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="eEmail" className="text-xs font-bold text-muted-foreground">Email Utama *</Label>
                    <Input
                      id="eEmail"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Contoh: john.doe@smdp.local"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="eGender" className="text-xs font-bold text-muted-foreground">Jenis Kelamin</Label>
                    <Select value={editGender} onValueChange={(val) => setEditGender(val || "L")}>
                      <SelectTrigger id="eGender">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki (L)</SelectItem>
                        <SelectItem value="P">Perempuan (P)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="eBirthDate" className="text-xs font-bold text-muted-foreground">Tanggal Lahir</Label>
                    <Input
                      id="eBirthDate"
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                    />
                  </div>

                  {/* Status Kepegawaian */}
                  <div className="space-y-1.5">
                    <Label htmlFor="eStatus" className="text-xs font-bold text-muted-foreground">Status Kepegawaian</Label>
                    <Select
                      value={editEmploymentStatusId}
                      onValueChange={(val) => {
                        setEditEmploymentStatusId(val || "");
                        setEditEmployeeGroupId("");
                        setEditEmployeePositionId("");
                      }}
                    >
                      <SelectTrigger id="eStatus" className="text-xs">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Kelompok Pegawai */}
                  <div className="space-y-1.5">
                    <Label htmlFor="eGroup" className="text-xs font-bold text-muted-foreground">Kelompok Pegawai</Label>
                    <Select
                      value={editEmployeeGroupId}
                      onValueChange={(val) => {
                        setEditEmployeeGroupId(val || "");
                        setEditEmployeePositionId("");
                      }}
                      disabled={!editEmploymentStatusId}
                    >
                      <SelectTrigger id="eGroup" className="text-xs">
                        <SelectValue placeholder={editEmploymentStatusId ? "Pilih Kelompok" : "Pilih Status Kepegawaian dahulu"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories.find((c) => c.id === editEmploymentStatusId)?.groups || []).map((g) => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Profesi / Jabatan */}
                  {editEmploymentStatusId && 
                   editEmployeeGroupId && 
                   (categories.find((c) => c.id === editEmploymentStatusId)?.groups || [])
                     .find((g) => g.id === editEmployeeGroupId)?.positions.length ? (
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="ePosition" className="text-xs font-bold text-muted-foreground">Profesi / Jabatan</Label>
                      <Select
                        value={editEmployeePositionId}
                        onValueChange={(val) => setEditEmployeePositionId(val || "")}
                      >
                        <SelectTrigger id="ePosition" className="text-xs">
                          <SelectValue placeholder="Pilih Profesi / Jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          {((categories.find((c) => c.id === editEmploymentStatusId)?.groups || [])
                            .find((g) => g.id === editEmployeeGroupId)?.positions || []).map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold text-foreground block mb-1">Pilih Peran Akses</Label>
                  <div className="space-y-2">
                    {["EMPLOYEE", "STAFF", "HR_ADMIN"].map((r) => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground p-2 hover:bg-muted rounded-lg border border-transparent hover:border-border">
                        <input
                          type="checkbox"
                          checked={editRoles.includes(r)}
                          onChange={() => handleRoleCheckboxChange(r, false)}
                          className="h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary"
                        />
                        <div className="flex flex-col">
                          <span>{r === "EMPLOYEE" ? "Pegawai" : r === "STAFF" ? "Staff" : "HR Admin"}</span>
                          <span className="text-[10px] text-muted-foreground font-medium normal-case leading-none mt-0.5">
                            {r === "EMPLOYEE" && "Akses Portal Pegawai untuk unggah & kelola berkas pribadi"}
                            {r === "STAFF" && "Akses Administratif untuk tinjau berkas & audit log"}
                            {r === "HR_ADMIN" && "Akses HR penuh termasuk konfigurasi master & kelola peran"}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setEditOpen(false); setSelectedUser(null); }}
                  disabled={editLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  style={{ backgroundColor: "var(--jobster-accent, #6c63ff)", color: "#fff" }}
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={pwOpen} onOpenChange={(val) => { if (!val) { setPwOpen(false); setPwTargetUser(null); } }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              Ubah Kata Sandi Pegawai
            </DialogTitle>
          </DialogHeader>

          {pwTargetUser && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Target user info */}
              <div className="bg-muted rounded-xl p-3 border border-border">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Pegawai yang ditargetkan</p>
                <p className="text-sm font-extrabold text-foreground mt-0.5">{pwTargetUser.name}</p>
                <p className="text-xs text-muted-foreground">{pwTargetUser.email}</p>
                {pwTargetUser.employeeId && (
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">NIP: {pwTargetUser.employeeId}</p>
                )}
              </div>

              {/* Warning note */}
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Tindakan ini akan langsung mengganti password pegawai. Pegawai perlu diberitahu password barunya secara manual.
                </p>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="pwNew" className="text-xs font-bold text-muted-foreground">Password Baru *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pwNew"
                    type={pwShowNew ? "text" : "password"}
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setPwShowNew((v) => !v)}
                    tabIndex={-1}
                  >
                    {pwShowNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="pwConfirm" className="text-xs font-bold text-muted-foreground">Konfirmasi Password Baru *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pwConfirm"
                    type={pwShowConfirm ? "text" : "password"}
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setPwShowConfirm((v) => !v)}
                    tabIndex={-1}
                  >
                    {pwShowConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password strength hint */}
              {pwNew.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 flex-1 rounded-full transition-all ${
                    pwNew.length < 6 ? "bg-red-400" :
                    pwNew.length < 8 ? "bg-amber-400" :
                    pwNew.length < 12 ? "bg-yellow-400" : "bg-green-500"
                  }`} />
                  <span className={`text-[10px] font-bold ${
                    pwNew.length < 6 ? "text-red-500" :
                    pwNew.length < 8 ? "text-amber-500" :
                    pwNew.length < 12 ? "text-yellow-600" : "text-green-600"
                  }`}>
                    {pwNew.length < 6 ? "Terlalu pendek" :
                     pwNew.length < 8 ? "Lemah" :
                     pwNew.length < 12 ? "Cukup" : "Kuat"}
                  </span>
                </div>
              )}

              {/* Match indicator */}
              {pwConfirm.length > 0 && (
                <p className={`text-[11px] font-semibold ${
                  pwNew === pwConfirm ? "text-green-600" : "text-red-500"
                }`}>
                  {pwNew === pwConfirm ? "✓ Password cocok" : "✗ Password tidak cocok"}
                </p>
              )}

              {/* Error */}
              {pwError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-semibold">{pwError}</AlertDescription>
                </Alert>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setPwOpen(false); setPwTargetUser(null); }}
                  disabled={pwLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={pwLoading || pwNew !== pwConfirm || pwNew.length < 6}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  {pwLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Ubah Password
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
