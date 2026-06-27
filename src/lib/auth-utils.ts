import { getServerSession, Session } from "next-auth";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/**
 * Untuk API Route Handlers.
 * Verifikasi session dan role, mengembalikan errorResponse jika tidak valid.
 */
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

/**
 * Untuk Server Component page.tsx.
 * Redirect ke "/" jika tidak login atau tidak punya role yang diperlukan.
 * Usage: const session = await requireRole(["HR_ADMIN"]);
 */
export async function requireRole(allowedRoles: string[]): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userRoles: string[] = session.user.roles?.length
    ? session.user.roles
    : [session.user.role];

  const hasAccess = userRoles.some((r) => allowedRoles.includes(r));

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Untuk Client Component conditional rendering.
 * Cek apakah user memiliki salah satu dari role yang diberikan.
 */
export function hasRole(
  userRole: string | undefined,
  userRoles: string[] | undefined,
  allowedRoles: string[]
): boolean {
  const roles = userRoles?.length ? userRoles : userRole ? [userRole] : [];
  return roles.some((r) => allowedRoles.includes(r));
}
