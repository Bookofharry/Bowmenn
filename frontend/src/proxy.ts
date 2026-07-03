import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/register"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.includes(pathname)) return NextResponse.next();

  // Allow static files and Next.js internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const role = request.cookies.get("bowmenn_role")?.value;

  // No role cookie → not logged in
  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Customer routes
  if (pathname.startsWith("/customer") && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Driver routes
  if (pathname.startsWith("/driver") && role !== "DRIVER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin routes
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
