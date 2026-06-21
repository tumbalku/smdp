/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Upload,
  Download,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useUsers } from "../hooks/useUsers";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserFormModal } from "./UserFormModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { ImportUsersModal } from "./ImportUsersModal";
import { ManageCategoriesModal } from "./ManageCategoriesModal";

const PIE_COLORS = ["#3b82f6", "#f43f5e", "#10b981", "#f59e0b", "#6c63ff", "#06b6d4"];

export function UsersView() {
  const {
    users,
    total,
    totalPages,
    loading,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    stats,
    statsLoading,
    employmentStatuses,
    professionGroups,
    employeeRanks,
    workplaces,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    fetchUsers,
    fetchCategories,

    // Create states & actions
    createOpen,
    setCreateOpen,
    createLoading,
    handleCreateUser,

    // Edit states & actions
    editOpen,
    setEditOpen,
    editLoading,
    selectedUser,
    handleOpenEditRoles,
    handleUpdateUser,

    // Change password states & actions
    pwOpen,
    setPwOpen,
    pwLoading,
    pwTargetUser,
    pwError,
    handleOpenChangePw,
    handleChangePassword,
  } = useUsers();

  const [importOpen, setImportOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExportCSV = async () => {
    setExportLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await fetch("/api/admin/users/export");
      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error?.message || "Gagal mengekspor data pegawai.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `data_pegawai_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMsg("Seluruh data pegawai berhasil diekspor ke CSV.");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunduh CSV.";
      setErrorMsg(msg);
    } finally {
      setExportLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const renderChartSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="border border-border shadow-xs h-[340px] flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground mt-2 font-semibold">Memuat grafik jabatan...</p>
        </Card>
      </div>
      <div>
        <Card className="border border-border shadow-xs h-[340px] flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground mt-2 font-semibold">Memuat grafik status & gender...</p>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" id="users-management-page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Manajemen Pegawai</h1>
          <p className="text-xs font-bold text-muted-foreground mt-1">
            Daftarkan pegawai baru, tinjau informasi identitas diri, dan konfigurasikan peran otorisasi sistem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleExportCSV}
            disabled={exportLoading}
            variant="outline"
            className="font-bold text-xs flex items-center gap-1.5"
          >
            {exportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-muted-foreground" />
            )}
            Ekspor CSV
          </Button>
          <Button
            onClick={() => setImportOpen(true)}
            variant="outline"
            className="font-bold text-xs flex items-center gap-1.5 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Upload className="w-4 h-4" />
            Impor CSV
          </Button>
          <Button
            onClick={() => setManageCategoriesOpen(true)}
            variant="outline"
            className="font-bold text-xs flex items-center gap-1.5 border-[#6c63ff]/20 bg-[#6c63ff]/5 text-[#6c63ff] hover:bg-[#6c63ff]/10"
          >
            <Layers className="w-4 h-4" />
            Kelola Kategori
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="font-bold text-xs flex items-center gap-1.5 bg-[#6c63ff] hover:bg-[#6c63ff]/90 text-white"
          >
            <Plus className="w-4 h-4" />
            Tambah Pegawai Baru
          </Button>
        </div>
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


      {/* Charts Section */}
      {!mounted || statsLoading ? (
        renderChartSkeleton()
      ) : !stats || (stats.statusGenderStats.length === 0 && stats.positionStats.length === 0) ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border border-border shadow-xs h-[340px] flex items-center justify-center">
              <p className="text-xs font-semibold text-muted-foreground">Belum ada data jabatan untuk divisualisasikan.</p>
            </Card>
          </div>
          <div>
            <Card className="border border-border shadow-xs h-[340px] flex items-center justify-center">
              <p className="text-xs font-semibold text-muted-foreground">Belum ada data status & gender untuk divisualisasikan.</p>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart (Jabatan) */}
          <div className="lg:col-span-2">
            <Card className="border border-border shadow-xs flex flex-col h-[340px]">
              <CardHeader className="p-4 pb-2 shrink-0">
                <CardTitle className="font-bold text-sm text-foreground">Distribusi Jabatan Pegawai</CardTitle>
                <CardDescription className="text-[10px]">Statistik jumlah pegawai berdasarkan jabatan saat ini.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.positionStats} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(108, 99, 255, 0.05)" }}
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "12px",
                        fontSize: "11px",
                        color: "var(--foreground)",
                      }}
                      itemStyle={{ color: "var(--foreground)" }}
                    />
                    <Bar
                      dataKey="count"
                      name="Jumlah Pegawai"
                      fill="#6c63ff"
                      radius={[4, 4, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Pie Chart (Status & Gender) */}
          <div>
            <Card className="border border-border shadow-xs flex flex-col h-[340px]">
              <CardHeader className="p-4 pb-1 shrink-0">
                <CardTitle className="font-bold text-sm text-foreground">Status & Gender Pegawai</CardTitle>
                <CardDescription className="text-[10px]">Pembagian pegawai berdasarkan status kepegawaian dan jenis kelamin.</CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 flex-1 min-h-0 flex flex-col justify-between">
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.statusGenderStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {stats.statusGenderStats.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--border)",
                          borderRadius: "12px",
                          fontSize: "11px",
                          color: "var(--foreground)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="px-2 pb-2 shrink-0 grid grid-cols-2 gap-2 text-[10px]">
                  {stats.statusGenderStats.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="text-muted-foreground truncate" title={item.name}>
                        {item.name}: <span className="font-extrabold text-foreground">{item.value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filter Card */}
      <Card className="border border-border shadow-xs">
        <CardContent className="p-4">
          <UserFilters
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            onSubmit={handleSearchSubmit}
          />
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
            <UserTable
              users={users}
              onEdit={handleOpenEditRoles}
              onChangePassword={handleOpenChangePw}
            />
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
      {createOpen && (
        <UserFormModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          isEdit={false}
          loading={createLoading}
          onSubmit={handleCreateUser}
          employmentStatuses={employmentStatuses}
          professionGroups={professionGroups}
          employeeRanks={employeeRanks}
          workplaces={workplaces}
        />
      )}

      {/* Edit User Dialog */}
      {editOpen && (
        <UserFormModal
          open={editOpen}
          onOpenChange={(val) => !val && setEditOpen(false)}
          isEdit={true}
          loading={editLoading}
          onSubmit={handleUpdateUser}
          employmentStatuses={employmentStatuses}
          professionGroups={professionGroups}
          employeeRanks={employeeRanks}
          workplaces={workplaces}
          initialData={selectedUser}
        />
      )}

      {/* Change Password Dialog */}
      <ResetPasswordModal
        open={pwOpen}
        onOpenChange={(val) => {
          if (!val) {
            setPwOpen(false);
          }
        }}
        loading={pwLoading}
        targetUser={pwTargetUser}
        error={pwError}
        onSubmit={handleChangePassword}
      />

      {/* Import CSV Modal */}
      <ImportUsersModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportSuccess={() => {
          fetchUsers();
          setSuccessMsg("Proses impor data pegawai berhasil diselesaikan.");
        }}
      />

      {/* Manage Categories Dialog */}
      <ManageCategoriesModal
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
        employmentStatuses={employmentStatuses}
        professionGroups={professionGroups}
        employeeRanks={employeeRanks}
        workplaces={workplaces}
        onSuccess={() => {
          fetchCategories();
          setSuccessMsg("Kategori kepegawaian berhasil diperbarui.");
        }}
      />
    </div>
  );
}
