"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  downloadAuditExport,
  useAuditLog,
  useAuditStats,
  type AuditStats,
} from "@/hooks/use-dashboard-data";
import { ManagementPageHeader } from "../management/management-ui";
import { AuditPageShell, AuditTrailList } from "./accountant-audit-ui";
import {
  AUDIT_EVENTS,
  auditHref,
  getAuditStatsFromEvents,
  reconciliationHref,
  formatAuditAction,
} from "./accountant-data";
import {
  FinanceFilterSelect,
  FinanceListToolbar,
  FinancePanel,
  FinanceSearchBar,
} from "./accountant-ui";

type AuditFilter = "all" | (typeof AUDIT_EVENTS)[number]["action"];

const FALLBACK_STATS: AuditStats = getAuditStatsFromEvents(AUDIT_EVENTS);

export function AccountantAudit() {
  const { data: auditEvents = AUDIT_EVENTS, isFetching } = useAuditLog("finance", AUDIT_EVENTS);
  const { data: stats = FALLBACK_STATS } = useAuditStats(FALLBACK_STATS);
  const isLoading = usePageLoading() || isFetching;
  const [filter, setFilter] = useState<AuditFilter>("all");
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  const actionTypes = useMemo(() => [...new Set(auditEvents.map((e) => e.action))], [auditEvents]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return auditEvents.filter((event) => {
      if (filter !== "all" && event.action !== filter) return false;
      if (!normalized) return true;
      return (
        formatAuditAction(event.action).toLowerCase().includes(normalized) ||
        event.details.toLowerCase().includes(normalized) ||
        event.actor.toLowerCase().includes(normalized) ||
        event.reference.toLowerCase().includes(normalized)
      );
    });
  }, [auditEvents, filter, query]);

  function handleExport() {
    setExporting(true);
    downloadAuditExport("finance");
    window.setTimeout(() => setExporting(false), 800);
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  return (
    <AuditPageShell>
      <ManagementPageHeader
        title="Finance audit"
        description="Immutable transaction log, approvals, and reconciliation history."
        action={
          <Button
            variant="outline"
            className="h-10 rounded-full px-5"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting…" : "Export audit log"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Events logged</p>
          <p className="mt-2 text-2xl font-bold tabular-nums lg:text-3xl">{stats.totalEvents}</p>
        </FinancePanel>
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">This week</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-brand-purple lg:text-3xl">{stats.eventsThisWeek}</p>
        </FinancePanel>
        <FinancePanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reconciliation flags</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-brand-orange lg:text-3xl">
            {stats.flaggedReconciliation}
          </p>
        </FinancePanel>
        <FinancePanel className="border border-border sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current period</p>
          <p className="mt-2 text-2xl font-bold tabular-nums lg:text-3xl">{stats.reconciliationPeriod}</p>
        </FinancePanel>
      </div>

      <FinanceListToolbar eyebrow="Transaction log" title={`${filtered.length} events`}>
        <FinanceSearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search actor, reference, details…"
          className="sm:w-56"
        />
        <FinanceFilterSelect
          label="Action type"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "All actions" },
            ...actionTypes.map((action) => ({
              id: action,
              label: formatAuditAction(action),
            })),
          ]}
          className="min-w-[180px]"
        />
      </FinanceListToolbar>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <FinancePanel className="border border-border">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-purple/10">
                <Shield className="h-5 w-5 text-brand-purple" />
              </div>
              <div>
                <h2 className="text-base font-bold lg:text-lg">Audit trail</h2>
                <p className="text-xs text-muted-foreground">Click an event to view full details</p>
              </div>
            </div>
          </div>

          <AuditTrailList events={filtered} getHref={(event) => auditHref(event.id)} />
        </FinancePanel>

        <FinancePanel className="border border-border xl:sticky xl:top-6 xl:self-start">
          <h2 className="text-base font-bold">Reconciliation</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Match bank deposits to recorded payments for{" "}
            <span className="font-semibold text-foreground">{stats.reconciliationPeriod}</span>.
          </p>
          <div className="mt-4 rounded-2xl bg-brand-orange/10 px-4 py-3">
            <p className="text-3xl font-bold tabular-nums text-brand-orange">{stats.flaggedReconciliation}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">items need review</p>
          </div>
          <Button asChild className="mt-5 w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
            <Link href={reconciliationHref()}>Open reconciliation workspace</Link>
          </Button>
        </FinancePanel>
      </div>
    </AuditPageShell>
  );
}
