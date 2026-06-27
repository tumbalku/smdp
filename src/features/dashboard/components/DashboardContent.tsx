"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { AdminStats } from "./AdminStats";
import { StaffView } from "./StaffView";
import { EmployeeView } from "./EmployeeView";

/**
 * Multi-role responsive dashboard router.
 *
 * Menampilkan view berdasarkan role user:
 * - HR_ADMIN → AdminStats (jika memiliki role EMPLOYEE, EmployeeView otomatis disisipkan di bawah stats cards)
 * - STAFF    → StaffView (jika memiliki role EMPLOYEE, EmployeeView otomatis disisipkan di bawah stats cards)
 * - EMPLOYEE → EmployeeView (standalone view untuk murni pegawai)
 */
export function DashboardContent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat sesi pengguna...</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userRoles: string[] = session.user.roles?.length
    ? session.user.roles
    : session.user.role
      ? [session.user.role]
      : [];

  const isAdmin = userRoles.includes("HR_ADMIN");
  const isStaff = userRoles.includes("STAFF");
  const isEmployee = userRoles.includes("EMPLOYEE");

  if (!isAdmin && !isStaff && !isEmployee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 p-8">
        <p className="text-sm font-bold text-muted-foreground">
          Role Anda tidak memiliki akses ke dashboard.
        </p>
        <p className="text-xs text-muted-foreground">Hubungi administrator sistem.</p>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminStats />;
  }

  if (isStaff) {
    return <StaffView />;
  }

  return <EmployeeView />;
}
