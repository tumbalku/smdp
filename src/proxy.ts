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

  // Role-based route guard
  if (pathname.startsWith("/admin")) {
    const roles = token.roles || [token.role];
    const hasAdmin = roles.includes("HR_ADMIN");
    const hasStaff = roles.includes("STAFF");
    if (!hasAdmin && !hasStaff) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Staff specific restriction: Staff cannot visit users, doc types, categories, or logs
    if (hasStaff && !hasAdmin) {
      const adminOnlyPaths = ["/admin/users", "/admin/document-types", "/admin/security-logs", "/admin/categories"];
      if (adminOnlyPaths.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
