"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { AdminStats } from "./AdminStats";
import { StaffView } from "./StaffView";

/**
 * Component router untuk halaman dedicated /dashboard/administrasi.
 * Menampilkan AdminStats jika user adalah HR_ADMIN, atau StaffView jika STAFF.
 */
export function AdminDashboardContent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat data dashboard administrasi...</p>
      </div>
    );
  }

  if (!session?.user) return null;

  const userRoles: string[] = session.user.roles?.length
    ? session.user.roles
    : session.user.role
      ? [session.user.role]
      : [];

  const isAdmin = userRoles.includes("HR_ADMIN");
  const isStaff = userRoles.includes("STAFF");

  if (!isAdmin && !isStaff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 p-8">
        <p className="text-sm font-bold text-muted-foreground">
          Anda tidak memiliki akses ke dashboard administrasi.
        </p>
      </div>
    );
  }

  if (isAdmin) return <AdminStats />;
  return <StaffView />;
}
