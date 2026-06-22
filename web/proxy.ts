import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@/shared";
import {
  canRoleAccessDashboardPath,
  getLoginPathForProtectedRoute,
  getRoleDashboardPath,
  getUnauthorizedRedirect,
  isConsumerRole,
  isStaffRole,
} from "@/shared/permissions";

const CONSUMER_AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];
const STAFF_AUTH_PAGES = ["/staff/login"];
const AUTH_PAGES = [...CONSUMER_AUTH_PAGES, ...STAFF_AUTH_PAGES];

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

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`));
}

function isProtectedPath(pathname: string) {
  if (isAuthPage(pathname)) return false;

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

function isStaffAuthPage(pathname: string) {
  return STAFF_AUTH_PAGES.some((page) => pathname.startsWith(page));
}

function isConsumerAuthPage(pathname: string) {
  return CONSUMER_AUTH_PAGES.some((page) => pathname.startsWith(page));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

    const role = token?.role as UserRole | undefined;
    const isStaff = role ? isStaffRole(role) : false;
    const isConsumer = role ? isConsumerRole(role) : false;

    const isPostAuthPage =
      pathname.startsWith("/auth/success") || pathname.startsWith("/onboarding");

    if (isStaffAuthPage(pathname) && token) {
      if (isStaff) {
        return NextResponse.redirect(new URL(getRoleDashboardPath(role!), request.url));
      }
      if (isConsumer) {
        return NextResponse.redirect(new URL(getRoleDashboardPath(role!), request.url));
      }
    }

    if (isConsumerAuthPage(pathname) && token) {
      if (isStaff) {
        return NextResponse.redirect(new URL(getRoleDashboardPath(role!), request.url));
      }
      if (!token.onboardingCompleted) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      return NextResponse.redirect(new URL(getRoleDashboardPath(role!), request.url));
    }

    if (isPostAuthPage && !token) {
      const loginPath = pathname.startsWith("/onboarding") ? "/login" : "/login";
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    if (isProtectedApi(pathname) && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isAuthPage(pathname) && !token) {
      if (request.nextUrl.searchParams.has("callbackUrl")) {
        const clean = new URL(pathname, request.url);
        return NextResponse.redirect(clean);
      }
      return NextResponse.next();
    }

    if (isProtectedPath(pathname)) {
      if (!token) {
        const loginPath = getLoginPathForProtectedRoute(pathname);
        if (pathname === loginPath) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL(loginPath, request.url));
      }

      if (!isStaff && !token.onboardingCompleted && !pathname.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }

      if (role && !canRoleAccessDashboardPath(role, pathname)) {
        return NextResponse.redirect(new URL(getUnauthorizedRedirect(role), request.url));
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
