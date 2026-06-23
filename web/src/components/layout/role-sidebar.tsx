"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { UserRole } from "@/shared";
import {
  ROLE_ROUTES,
  getLoginPathForRole,
  getSharedRoutesForRole,
} from "@/shared/permissions";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/utils";
import { getRouteIcon } from "./role-sidebar-icons";
import {
  ROLE_SIDEBAR_BRANDING,
  ROUTE_DESCRIPTIONS,
  getQuickActionsForRole,
  type QuickAction,
} from "./role-sidebar-config";

type NavItem = {
  name: string;
  path: string;
  description: string;
  icon: ReturnType<typeof getRouteIcon>;
};

function isNavActive(pathname: string, path: string, basePath: string) {
  if (path === basePath) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function buildNavItems(role: UserRole): NavItem[] {
  const roleRoutes = ROLE_ROUTES[role] ?? [];
  const sharedRoutes = getSharedRoutesForRole(role);
  const basePath = roleRoutes[0]?.path ?? "/";

  const primary: NavItem[] = roleRoutes.map((route) => ({
    name: route.label,
    path: route.path,
    description: ROUTE_DESCRIPTIONS[route.path] ?? route.label,
    icon: getRouteIcon(route.icon),
  }));

  const shared: NavItem[] = sharedRoutes.map((route) => ({
    name: route.label,
    path: route.path,
    description: ROUTE_DESCRIPTIONS[route.path] ?? route.label,
    icon: getRouteIcon(route.icon),
  }));

  return [...primary, ...shared];
}

export function RoleSidebar() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const branding = ROLE_SIDEBAR_BRANDING[role];
  const navItems = useMemo(() => buildNavItems(role), [role]);
  const basePath = ROLE_ROUTES[role]?.[0]?.path ?? "/";
  const navPaths = useMemo(() => new Set(navItems.map((item) => item.path)), [navItems]);

  const quickActions = useMemo(() => {
    const configured = getQuickActionsForRole(role);
    const extras: QuickAction[] = [
      { icon: MessageSquare, label: "Messages", href: "/shared/messages" },
      { icon: HelpCircle, label: "Help", href: "/shared/support" },
      { icon: LifeBuoy, label: "Support", href: "/shared/support" },
    ];
    const merged = [...configured, ...extras].filter(
      (action, index, list) =>
        navPaths.has(action.href) &&
        list.findIndex((item) => item.href === action.href) === index,
    );
    return merged.slice(0, 3);
  }, [role, navPaths]);

  const isCollapsed = !sidebarOpen;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setSidebarOpen]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully");
      router.push(getLoginPathForRole(role));
    } catch {
      toast.error("Error logging out");
    }
  };

  const handleNavClick = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <>
      {isMobile && sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-[280px] opacity-100" : isMobile ? "w-0 opacity-0 pointer-events-none" : "w-16 opacity-100",
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-brand-blue/5 blur-3xl" />
        </div>

        <div className="relative shrink-0 border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            {sidebarOpen ? (
              <>
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary shadow-lg">
                    <span className="text-lg font-bold text-sidebar-primary-foreground">{branding.initial}</span>
                  </div>
                  <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-brand-blue" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-lg font-bold leading-tight text-sidebar-foreground">{branding.title}</h1>
                  <p className="truncate text-xs text-muted-foreground">{branding.subtitle}</p>
                </div>
              </>
            ) : null}

            <button
              type="button"
              onClick={toggleSidebar}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-muted-foreground transition-colors hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
                !sidebarOpen && "mx-auto",
              )}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        <nav className="relative flex-1 overflow-x-hidden overflow-y-auto py-4">
          <div className="space-y-0.5 px-3">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.path, basePath);
              const Icon = item.icon;

              return (
                <div key={item.path} className="relative">
                  <Link
                    href={item.path}
                    onClick={handleNavClick}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "flex h-11 w-full items-center rounded-xl text-sm font-medium transition-all duration-200",
                      sidebarOpen ? "gap-3 px-3" : "justify-center",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon size={sidebarOpen ? 18 : 20} className="shrink-0" />
                    {sidebarOpen ? <span className="flex-1 truncate">{item.name}</span> : null}
                  </Link>

                  {!sidebarOpen && hoveredItem === item.path ? (
                    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2">
                      <div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-xl">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.description}</p>
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {sidebarOpen && quickActions.length > 0 ? (
            <>
              <div className="relative mx-4 my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sidebar-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-sidebar px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Quick Actions
                  </span>
                </div>
              </div>

              <div className="mt-2 space-y-0.5 px-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href + action.label}
                      href={action.href}
                      onClick={handleNavClick}
                      className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                    >
                      <Icon size={16} />
                      <span>{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : null}
        </nav>

        <div className="relative shrink-0 border-t border-sidebar-border px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "flex h-10 w-full items-center rounded-xl text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
              sidebarOpen ? "gap-3 px-3" : "justify-center",
            )}
          >
            <LogOut size={sidebarOpen ? 18 : 20} className="shrink-0" />
            {sidebarOpen ? <span>Logout</span> : null}
          </button>

          {sidebarOpen ? (
            <p className="mt-3 text-center text-[10px] text-muted-foreground">{branding.version}</p>
          ) : null}
        </div>
      </aside>

      {isMobile && isCollapsed ? (
        <button
          type="button"
          onClick={toggleSidebar}
          className="fixed bottom-6 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-lg lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      ) : null}
    </>
  );
}
