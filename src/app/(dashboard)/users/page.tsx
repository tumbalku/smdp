import { Suspense } from "react";
import { requireRole } from "@/lib/auth-utils";
import { UsersView } from "@/features/users/components/UsersView";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Manajemen Pegawai - SMDP Portal",
  description: "Kelola data, akun, dan otorisasi seluruh pegawai.",
};

export default async function UsersManagementPage() {
  await requireRole(["HR_ADMIN"]);
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <UsersView />
    </Suspense>
  );
}
