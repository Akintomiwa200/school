"use client";

import { useMemo, useState } from "react";
import { Building2, Download, Plus, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAuditLog, useSchoolsList, useUsersList } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import {
  AUDIT_SEVERITY_STYLES,
  PLATFORM_AUDIT,
  PLATFORM_SCHOOLS,
  PLATFORM_USERS,
  SCHOOL_STATUS_STYLES,
  USER_STATUS_STYLES,
} from "./super-admin-entities-data";

function SectionSkeleton() {
  return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
}

export function SuperAdminSchools() {
  const { data: schools = PLATFORM_SCHOOLS, isFetching } = useSchoolsList(PLATFORM_SCHOOLS);
  const loading = usePageLoading() || isFetching;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((s) => s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q));
  }, [schools, query]);

  if (loading) return <SectionSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Schools"
        description="Manage schools connected to the platform."
        action={
          <Button className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90">
            <Plus className="mr-2 h-4 w-4" />
            Provision school
          </Button>
        }
      />
      <ManagementPanel className="flex flex-col gap-4 border border-border sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">{filtered.length} schools</h2>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schools"
            className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </ManagementPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((school) => (
          <ManagementPanel key={school.id} className="border border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold">{school.name}</h3>
                  <p className="text-sm text-muted-foreground">{school.location}</p>
                </div>
              </div>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", SCHOOL_STATUS_STYLES[school.status])}>
                {school.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-muted/40 px-2 py-2">
                <p className="font-bold">{school.students}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="rounded-xl bg-muted/40 px-2 py-2">
                <p className="font-bold">{school.admins}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
              <div className="rounded-xl bg-muted/40 px-2 py-2">
                <p className="text-xs font-bold">{school.createdAt}</p>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full rounded-full">Manage school</Button>
          </ManagementPanel>
        ))}
      </div>
    </div>
  );
}

export function SuperAdminUsers() {
  const { data: users = PLATFORM_USERS, isFetching } = useUsersList(PLATFORM_USERS);
  const loading = usePageLoading() || isFetching;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "suspended">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (filter !== "all" && u.status !== filter) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.school.toLowerCase().includes(q);
    });
  }, [users, query, filter]);

  if (loading) return <SectionSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Users" description="Global user accounts across all schools and roles." />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "suspended"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
                filter === f ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users"
            className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">School</th>
              <th className="px-4 py-3 font-medium">Last login</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.school}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.lastLogin}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", USER_STATUS_STYLES[u.status])}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.status === "active" ? (
                    <Button size="sm" variant="outline" className="h-8 rounded-full">Suspend</Button>
                  ) : u.status === "suspended" ? (
                    <Button size="sm" className="h-8 rounded-full bg-green text-white hover:bg-green/90">Restore</Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}

export function SuperAdminAudit() {
  const { data: audit = PLATFORM_AUDIT, isFetching } = useAuditLog("platform", PLATFORM_AUDIT);
  const loading = usePageLoading() || isFetching;
  const [filter, setFilter] = useState<"all" | "info" | "warning" | "critical">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return audit;
    return audit.filter((e) => e.severity === filter);
  }, [audit, filter]);

  if (loading) return <SectionSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Audit logs"
        description="Security and activity trail for platform-wide actions."
        action={
          <Button variant="outline" className="h-10 rounded-full px-5">
            <Download className="mr-2 h-4 w-4" />
            Export audit log
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2">
        {(["all", "info", "warning", "critical"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
              filter === f ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <ManagementPanel className="border border-border">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-purple" />
          <h2 className="text-base font-bold">Event log</h2>
        </div>
        <ul className="divide-y divide-border">
          {filtered.map((event) => (
            <li key={event.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold">{event.action}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", AUDIT_SEVERITY_STYLES[event.severity])}>
                    {event.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.actor} → {event.target}
                  {event.school ? ` · ${event.school}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      </ManagementPanel>
    </div>
  );
}
