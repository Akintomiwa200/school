"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Globe,
  GraduationCap,
  Layers,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  UserCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useSuperAdminDashboard,
  type SuperAdminDashboardData,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  ManagementActionLink,
  ManagementPanel,
} from "../management/management-ui";
import { SUPER_ADMIN_QUICK_ACTIONS } from "./super-admin-data";
import {
  SuperAdminListSkeleton,
  SuperAdminPageHeader,
  superAdminInitialLoading,
} from "./super-admin-workflow-ui";

const FALLBACK: SuperAdminDashboardData = {
  stats: [
    {
      id: "schools",
      label: "Schools",
      value: "0",
      hint: "Connected institutions",
      tone: "purple",
    },
    {
      id: "users",
      label: "Users",
      value: "0",
      hint: "All platform accounts",
      tone: "blue",
    },
    {
      id: "audit",
      label: "Audit events",
      value: "0",
      hint: "Last 30 days",
      tone: "green",
    },
    {
      id: "health",
      label: "System health",
      value: "99.9%",
      hint: "Uptime this month",
      tone: "orange",
    },
  ],
  schools: [],
  auditLog: [],
};

const STAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  schools: Building2,
  users: Users,
  audit: Shield,
  health: Activity,
};

const STATUS_BADGES: Record<string, string> = {
  Active: "bg-green/10 text-green border-green/20",
  Inactive: "bg-muted text-muted-foreground border-muted",
  Suspended: "bg-brand-pink/10 text-brand-pink border-brand-pink/20",
  Pending: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
};

const AUDIT_ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  create: Sparkles,
  update: Settings,
  delete: AlertTriangle,
  login: UserCheck,
  logout: ArrowUpRight,
  error: ShieldAlert,
};

function getAuditIcon(action: string) {
  const key = action.toLowerCase();
  for (const [pattern, icon] of Object.entries(AUDIT_ACTION_ICONS)) {
    if (key.includes(pattern)) return icon;
  }
  return Activity;
}

function getRelativeTime(timeString: string): string {
  const date = new Date(timeString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SuperAdminDashboard() {
  const pageLoading = usePageLoading(400);
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] ?? "Super Admin";
  const { data: rawData, isFetching, isFetched } =
    useSuperAdminDashboard(FALLBACK);
  const data = rawData ?? FALLBACK;
  const loading = superAdminInitialLoading(pageLoading, isFetching, isFetched);
  const [searchQuery, setSearchQuery] = useState("");

  // Parse stats
  const statsMap = useMemo(() => {
    const map: Record<string, { value: string; hint: string; tone: string }> = {};
    data.stats.forEach((stat) => {
      map[stat.id] = { value: stat.value, hint: stat.hint, tone: stat.tone };
    });
    return map;
  }, [data.stats]);

  const schoolsCount = Number.parseInt(
    statsMap.schools?.value?.replace(/,/g, "") ?? "0",
    10
  );
  const usersCount = statsMap.users?.value ?? "0";
  const auditCount = statsMap.audit?.value ?? "0";
  const healthValue = statsMap.health?.value ?? "99.9%";

  // Calculate additional metrics
  const metrics = useMemo(() => {
    const activeSchools = data.schools.filter(
      (s) => s.status === "Active"
    ).length;
    const totalStudents = data.schools.reduce(
      (sum, s) => sum + (s.students || 0),
      0
    );
    const latestAuditEvents = data.auditLog.slice(0, 8);

    return {
      activeSchools,
      totalStudents,
      latestAuditEvents,
      schoolUtilization:
        schoolsCount > 0
          ? Math.round((activeSchools / schoolsCount) * 100)
          : 0,
    };
  }, [data.schools, data.auditLog, schoolsCount]);

  // Filter schools by search
  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return data.schools;
    const query = searchQuery.toLowerCase();
    return data.schools.filter(
      (school) =>
        school.name.toLowerCase().includes(query) ||
        school.location?.toLowerCase().includes(query)
    );
  }, [data.schools, searchQuery]);

  if (loading) return <SuperAdminListSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Platform Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {schoolsCount > 0
              ? `${schoolsCount} schools · ${usersCount} users · ${auditCount} events this month`
              : "Welcome to your admin dashboard"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button
            asChild
            className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
          >
            <Link href="/super-admin/schools">
              <Building2 className="mr-2 h-4 w-4" />
              Manage schools
            </Link>
          </Button>
        </div>
      </div>

      {/* Welcome Banner */}
      <ManagementPanel className="relative overflow-hidden border-0 bg-gradient-to-br from-brand-purple via-brand-purple/90 to-brand-blue p-0 text-white shadow-float">
        <div className="relative z-10 p-6 sm:p-8 sm:pr-40 lg:pr-48">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-white/80" />
              <p className="text-sm font-medium text-white/85">Super Admin Console</p>
            </div>
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              Welcome back, {name}
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/85">
              {schoolsCount > 0
                ? `${metrics.activeSchools} active schools · ${metrics.totalStudents.toLocaleString()} students · ${healthValue} uptime`
                : "Start by adding schools to the platform."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium">
              <span className="rounded-full bg-white/15 px-3 py-1.5">
                {metrics.activeSchools} Active
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">
                {metrics.schoolUtilization}% Utilization
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">
                {healthValue} Uptime
              </span>
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute right-6 top-1/2 hidden h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 sm:flex lg:right-10 lg:h-32 lg:w-32"
        >
          <Globe className="h-14 w-14 text-white/90 lg:h-16 lg:w-16" />
        </div>
      </ManagementPanel>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ManagementPanel className="border border-brand-purple/15 bg-brand-purple/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">{schoolsCount}</p>
              <p className="text-xs text-muted-foreground">
                Schools · {metrics.activeSchools} active
              </p>
            </div>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-brand-blue/15 bg-brand-blue/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">{usersCount}</p>
              <p className="text-xs text-muted-foreground">
                Users · {metrics.totalStudents.toLocaleString()} students
              </p>
            </div>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-green/15 bg-green/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green text-white">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">{auditCount}</p>
              <p className="text-xs text-muted-foreground">Audit events · 30 days</p>
            </div>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-brand-orange/15 bg-brand-orange/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange text-white">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">{healthValue}</p>
              <p className="text-xs text-muted-foreground">System health</p>
            </div>
          </div>
        </ManagementPanel>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SUPER_ADMIN_QUICK_ACTIONS.map((action) => (
            <ManagementActionLink key={action.href} {...action} />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        {/* Schools List */}
        <ManagementPanel className="overflow-hidden border border-border p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Connected Schools
              </h2>
              <p className="text-xs text-muted-foreground">
                {data.schools.length} tenant{data.schools.length !== 1 ? "s" : ""} ·{" "}
                {metrics.activeSchools} active
              </p>
            </div>
            <Link
              href="/super-admin/schools"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-purple hover:underline"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* School Search */}
          {data.schools.length > 5 && (
            <div className="border-b border-border px-5 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search schools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          )}

          <ul className="divide-y divide-border">
            {data.schools.length === 0 ? (
              <li className="px-5 py-14 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Building2 className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No schools found
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Add your first school to get started.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-4 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
                >
                  <Link href="/super-admin/schools/create">
                    Add school
                  </Link>
                </Button>
              </li>
            ) : filteredSchools.length === 0 ? (
              <li className="px-5 py-14 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Search className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No schools found
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  No results for "{searchQuery}". Try a different search.
                </p>
              </li>
            ) : (
              filteredSchools.slice(0, 8).map((school) => (
                <li
                  key={school.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/super-admin/schools/${school.id}`}
                      className="text-sm font-semibold text-foreground hover:text-brand-purple transition-colors truncate block"
                    >
                      {school.name}
                    </Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {school.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {school.students.toLocaleString()} students
                      </span>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase",
                      STATUS_BADGES[school.status] || STATUS_BADGES.Active
                    )}
                  >
                    {school.status}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                </li>
              ))
            )}
          </ul>

          {filteredSchools.length > 8 && (
            <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground text-center">
              Showing 8 of {filteredSchools.length} schools ·{" "}
              <Link
                href="/super-admin/schools"
                className="font-medium text-brand-purple hover:underline"
              >
                View all
              </Link>
            </div>
          )}
        </ManagementPanel>

        {/* Audit Log */}
        <ManagementPanel className="overflow-hidden border border-border p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Recent Audit Events
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest {metrics.latestAuditEvents.length} platform activities
              </p>
            </div>
            <Link
              href="/super-admin/audit"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-purple hover:underline"
            >
              Open logs
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {data.auditLog.length === 0 ? (
              <li className="px-5 py-14 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Activity className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No audit events
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Events will appear here as platform activity occurs.
                </p>
              </li>
            ) : (
              metrics.latestAuditEvents.map((event) => {
                const AuditIcon = getAuditIcon(event.action);
                const isWarning =
                  event.action.toLowerCase().includes("error") ||
                  event.action.toLowerCase().includes("delete");

                return (
                  <li
                    key={event.id}
                    className="px-5 py-3.5 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                          isWarning
                            ? "bg-brand-pink/10 text-brand-pink"
                            : "bg-brand-blue/10 text-brand-blue"
                        )}
                      >
                        <AuditIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {event.action}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {event.actor}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {event.target}
                          </span>
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </ManagementPanel>
      </div>

      {/* Footer Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ManagementPanel className="border border-border">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/10">
              <TrendingUp className="h-5 w-5 text-brand-purple" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">School Utilization</p>
              <p className="text-xs text-muted-foreground">
                {metrics.schoolUtilization}% of schools active
              </p>
            </div>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10">
              <CheckCircle2 className="h-5 w-5 text-brand-blue" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">System Status</p>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </div>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10">
              <Layers className="h-5 w-5 text-green" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Data Overview</p>
              <p className="text-xs text-muted-foreground">
                {data.schools.length} tenants · {usersCount} users
              </p>
            </div>
          </div>
        </ManagementPanel>
      </div>
    </div>
  );
}

// Add MapPin icon if not in your lucide-react version
function MapPin({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
