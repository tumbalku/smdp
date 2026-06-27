import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Fallback for production HTTPS if NEXTAUTH_URL has HTTP scheme in environment variables
  if (!token) {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: false,
    });
  }

  const { pathname } = req.nextUrl;

  // Allow next-auth API routes to bypass redirect checks
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Handle Login page redirect if already authenticated
  if (pathname.startsWith("/login")) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Allow public access to the root page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based route guard untuk path yang memerlukan akses terbatas.
  // Authorization detail (per-role) dilakukan di page.tsx masing-masing via requireRole().
  // Middleware ini hanya melakukan pengecekan kasar untuk meringankan beban server.
  const roles = (token?.roles as string[]) || (token?.role ? [token.role] : []);
  const hasAdmin = roles.includes("HR_ADMIN");
  const hasStaff = roles.includes("STAFF");

  // Path yang hanya boleh diakses oleh HR_ADMIN atau STAFF
  const adminStaffPaths = ["/verification"];
  if (adminStaffPaths.some((p) => pathname.startsWith(p))) {
    if (!hasAdmin && !hasStaff) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Path yang hanya boleh diakses oleh HR_ADMIN
  const adminOnlyPaths = ["/users", "/document-types", "/security-logs", "/categories"];
  if (adminOnlyPaths.some((p) => pathname.startsWith(p))) {
    if (!hasAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();

}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
