"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROLE_ROUTES, SHARED_ROUTES } from "@/shared/permissions";
import { UserRole } from "@/shared";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role as UserRole;
  const routes = role ? ROLE_ROUTES[role] ?? [] : [];

  return (
    <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-xl">
        <Link href="/" className="font-display type-link-lg font-bold text-sidebar-primary">
          School LMS
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className={cn(
              "flex items-center rounded-lg px-md py-sm type-link font-medium transition-colors",
              pathname === route.path || pathname.startsWith(route.path + "/")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            {route.label}
          </Link>
        ))}
        <div className="my-4 border-t border-sidebar-border pt-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Shared</p>
          {SHARED_ROUTES.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center rounded-lg px-md py-sm type-link font-medium transition-colors",
                pathname === route.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
