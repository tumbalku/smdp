import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow next-auth API routes to bypass redirect checks
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Handle Login page redirect if already authenticated
  if (pathname.startsWith("/login")) {
    if (token) {
      if (token.role === "HR_ADMIN" || token.role === "STAFF") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/employee/dashboard", req.url));
      }
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based route guard
  if (pathname.startsWith("/admin")) {
    if (token.role === "EMPLOYEE") {
      return NextResponse.redirect(new URL("/employee/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/employee")) {
    if (token.role === "HR_ADMIN" || token.role === "STAFF") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
