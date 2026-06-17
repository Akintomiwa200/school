import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@/shared";
import { getRoleDashboardPath } from "@/shared/permissions";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
const apiPublicRoutes = ["/api/auth", "/api/v1/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isApiRoute = pathname.startsWith("/api");
  const isApiPublic = apiPublicRoutes.some((route) => pathname.startsWith(route));

  if (isApiRoute && !isApiPublic && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isAuthRoute && token) {
    const role = token.role as UserRole;
    return NextResponse.redirect(new URL(getRoleDashboardPath(role), request.url));
  }

  if (!isPublicRoute && !isApiRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons).*)"],
};
