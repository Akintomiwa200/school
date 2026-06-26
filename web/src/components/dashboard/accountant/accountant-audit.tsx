"use client";

import { useMemo, useState } from "react";
import { Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAuditLog } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import { AUDIT_EVENTS, formatAuditAction } from "./accountant-data";
import { FinancePanel, formatCurrency } from "./accountant-ui";

type AuditFilter = "all" | AuditEventAction;

type AuditEventAction = (typeof AUDIT_EVENTS)[number]["action"];

export function AccountantAudit() {
  const { data: auditEvents = AUDIT_EVENTS, isFetching } = useAuditLog("finance", AUDIT_EVENTS);
  const isLoading = usePageLoading() || isFetching;
  const [filter, setFilter] = useState<AuditFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return auditEvents;
    return auditEvents.filter((event) => event.action === filter);
  }, [auditEvents, filter]);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  const actionTypes = [...new Set(auditEvents.map((e) => e.action))];

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Finance audit"
        description="Immutable transaction log, approvals, and reconciliation history."
        action={
          <Button variant="outline" className="h-10 rounded-full px-5">
            <Download className="mr-2 h-4 w-4" />
            Export audit log
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Events logged</p>
          <p className="mt-2 text-2xl font-bold">{AUDIT_EVENTS.length}</p>
        </FinancePanel>
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">This week</p>
          <p className="mt-2 text-2xl font-bold text-brand-purple">12</p>
        </FinancePanel>
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reconciliation flags</p>
          <p className="mt-2 text-2xl font-bold text-brand-orange">3</p>
        </FinancePanel>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            filter === "all"
              ? "bg-brand-purple text-white"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        {actionTypes.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => setFilter(action)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === action
                ? "bg-brand-purple text-white"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {formatAuditAction(action)}
          </button>
        ))}
      </div>

      <FinancePanel className="border border-border">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-purple" />
          <h2 className="text-base font-bold">Transaction log</h2>
        </div>
        <ul className="divide-y divide-border">
          {filtered.map((event) => (
            <li key={event.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold">{formatAuditAction(event.action)}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {event.reference}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{event.details}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {event.actor} · {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
              {event.amount != null ? (
                <p className="shrink-0 text-sm font-bold">{formatCurrency(event.amount)}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </FinancePanel>

      <FinancePanel className="border border-border">
        <h2 className="text-base font-bold">Reconciliation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Match bank deposits to recorded payments. March 2026 — 3 items need review.
        </p>
        <Button className="mt-4 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
          Open reconciliation workspace
        </Button>
      </FinancePanel>
    </div>
  );
}
