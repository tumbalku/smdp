import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Dashboard - SMDP Portal",
  description: "Dashboard Sistem Manajemen Dokumen Pegawai.",
};

export default async function DashboardRootPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const roles: string[] = session.user.roles?.length
    ? session.user.roles
    : session.user.role
      ? [session.user.role]
      : [];

  if (roles.includes("HR_ADMIN") || roles.includes("STAFF")) {
    redirect("/dashboard/administrasi");
  } else if (roles.includes("EMPLOYEE")) {
    redirect("/dashboard/pegawai");
  }

  redirect("/login");
}
