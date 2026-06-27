import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function verifyApiSession(allowedRoles?: string[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Belum login." } },
        { status: 401 }
      ),
    };
  }

  const roles = session.user.roles || [session.user.role];
  const hasAccess = allowedRoles ? roles.some((r) => allowedRoles.includes(r)) : true;

  if (allowedRoles && !hasAccess) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { data: null, error: { code: "FORBIDDEN", message: "Akses ditolak: Peran tidak sah." } },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}
