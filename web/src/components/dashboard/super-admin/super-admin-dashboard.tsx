"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  ManagementActionLink,
  ManagementPageHeader,
  ManagementPanel,
  ManagementStatCard,
} from "../management/management-ui";
import {
  SUPER_ADMIN_AUDIT_LOG,
  SUPER_ADMIN_DASHBOARD_STATS,
  SUPER_ADMIN_QUICK_ACTIONS,
  SUPER_ADMIN_SCHOOLS,
} from "./super-admin-data";

function SuperAdminDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-10 w-72 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-96 rounded-[20px] bg-muted" />
        <div className="h-96 rounded-[20px] bg-muted" />
      </div>
    </div>
  );
}

export function SuperAdminDashboard() {
  const loading = usePageLoading(400);
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] ?? "Super Admin";

  if (loading) return <SuperAdminDashboardSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title={`Platform overview, ${name}`}
        description="Schools, users, audit activity, and system health across Pathway Academy."
        action={
          <Button asChild className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90">
            <Link href="/super-admin/schools">Manage schools</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUPER_ADMIN_DASHBOARD_STATS.map((stat) => (
          <ManagementStatCard key={stat.id} {...stat} />
        ))}
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <ManagementPanel className="border border-border">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-foreground">Connected schools</h2>
            <Link href="/super-admin/schools" className="text-xs font-semibold text-brand-purple hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-2">
            {SUPER_ADMIN_SCHOOLS.map((school) => (
              <li
                key={school.id}
                className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{school.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {school.location} · {school.students.toLocaleString()} students
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                    school.status === "Active"
                      ? "bg-green/15 text-green"
                      : "bg-brand-orange/15 text-brand-orange",
                  )}
                >
                  {school.status}
                </span>
              </li>
            ))}
          </ul>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-foreground">Recent audit events</h2>
            <Link href="/super-admin/audit" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline">
              Open logs
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {SUPER_ADMIN_AUDIT_LOG.map((item) => (
              <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-foreground">{item.action}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.actor} · {item.target}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
              </li>
            ))}
          </ul>
        </ManagementPanel>
      </div>

      <ManagementPanel className="border border-border">
        <h2 className="mb-4 text-base font-bold text-foreground">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SUPER_ADMIN_QUICK_ACTIONS.map((action) => (
            <ManagementActionLink key={action.href} {...action} />
          ))}
        </div>
      </ManagementPanel>
    </div>
  );
}
