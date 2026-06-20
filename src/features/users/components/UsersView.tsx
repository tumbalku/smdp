"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserFormModal } from "./UserFormModal";
import { ResetPasswordModal } from "./ResetPasswordModal";

export function UsersView() {
  const {
    users,
    total,
    totalPages,
    loading,
    errorMsg,
    successMsg,
    categories,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    fetchUsers,

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
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
          className="font-bold text-xs flex items-center gap-1.5 bg-[#6c63ff] hover:bg-[#6c63ff]/90 text-white"
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
          categories={categories}
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
          categories={categories}
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
    </div>
  );
}
