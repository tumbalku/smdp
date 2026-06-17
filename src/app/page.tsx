import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function IndexPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "HR_ADMIN" || session.user.role === "STAFF") {
    redirect("/admin/dashboard");
  } else {
    redirect("/employee/dashboard");
  }
}
