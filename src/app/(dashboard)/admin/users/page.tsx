import { Suspense } from "react";
import { UsersView } from "@/features/users/components/UsersView";
import { Loader2 } from "lucide-react";

export default function UsersManagementPage() {
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
