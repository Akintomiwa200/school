import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@/shared";
import { getRoleDashboardPath } from "@/shared/permissions";

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

const PROTECTED_PREFIXES = [
  "/super-admin",
  "/admin",
  "/accountant",
  "/teacher",
  "/staff",
  "/librarian",
  "/hr",
  "/receptionist",
  "/student",
  "/parent",
  "/shared",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isProtectedApi(pathname: string) {
  return (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/api/v1/auth") &&
    !pathname.startsWith("/api/webhooks")
  );
}

function needsAuthCheck(pathname: string) {
  if (AUTH_PAGES.some((page) => pathname.startsWith(page))) return true;
  if (pathname.startsWith("/auth/success") || pathname.startsWith("/onboarding")) return true;
  if (isProtectedPath(pathname)) return true;
  if (isProtectedApi(pathname)) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through Next.js internals and public static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/v1/auth") ||
    pathname.startsWith("/api/webhooks") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Marketing, verify-code, etc. — skip JWT entirely (fast path)
  if (!needsAuthCheck(pathname)) {
    return NextResponse.next();
  }

  if (!process.env.NEXTAUTH_SECRET) {
    console.warn("NEXTAUTH_SECRET is missing — auth checks skipped in proxy");
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
    const isPostAuthPage =
      pathname.startsWith("/auth/success") || pathname.startsWith("/onboarding");

    if (isAuthPage && token) {
      if (!token.onboardingCompleted) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      const role = token.role as UserRole;
      return NextResponse.redirect(new URL(getRoleDashboardPath(role), request.url));
    }

    if (isPostAuthPage && !token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isProtectedApi(pathname) && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isProtectedPath(pathname)) {
      if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (!token.onboardingCompleted && !pathname.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Proxy auth error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|images/|icons/).*)"],
};
