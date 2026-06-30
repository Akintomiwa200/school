"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAuditEvent } from "@/hooks/use-dashboard-data";
import {
  auditHref,
  accountantHref,
  formatDisplayDate,
  getAuditEventById,
  reconciliationHref,
  resolveAuditEntityHref,
  type AuditEvent,
} from "./accountant-data";
import {
  AuditBackLink,
  AuditDetailGrid,
  AuditDetailHero,
  AuditImmutableFooter,
  AuditMetadataChips,
  AuditPageShell,
  AuditSectionCard,
  formatAuditTimestamp,
} from "./accountant-audit-ui";
import { FinancePanel } from "./accountant-ui";

export function AccountantAuditDetail({ auditId }: { auditId: string }) {
  const isLoading = usePageLoading();
  const fallback = getAuditEventById(auditId);
  const { data: event, isFetching } = useAuditEvent<AuditEvent>(auditId, fallback);
  const loading = isLoading || isFetching;

  if (loading) {
    return (
      <AuditPageShell>
        <div className="h-64 animate-pulse rounded-[20px] bg-muted" />
      </AuditPageShell>
    );
  }

  if (!event) {
    return (
      <AuditPageShell>
        <FinancePanel className="border border-border text-center">
          <h2 className="text-lg font-bold">Audit event not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">This log entry does not exist or was removed.</p>
          <Button asChild variant="outline" className="mt-4 rounded-full px-4">
            <Link href={accountantHref("audit")}>Back to audit log</Link>
          </Button>
        </FinancePanel>
      </AuditPageShell>
    );
  }

  const entityHref = resolveAuditEntityHref(event);
  const { full } = formatAuditTimestamp(event.timestamp);

  const detailItems = [
    { label: "Event ID", value: event.id, mono: true },
    { label: "Timestamp", value: full, span: true },
    { label: "Actor", value: event.actor },
    { label: "Actor email", value: event.actorEmail ?? "—" },
    { label: "Reference", value: event.reference, mono: true },
    {
      label: "Entity type",
      value: event.entityType.replace(/_/g, " "),
    },
    ...(event.ipAddress ? [{ label: "IP address", value: event.ipAddress, mono: true }] : []),
  ];

  const hasChanges = event.changes && event.changes.length > 0;
  const hasMetadata = event.metadata && Object.keys(event.metadata).length > 0;

  return (
    <AuditPageShell className="space-y-5">
      <AuditBackLink href={accountantHref("audit")} label="Back to audit log" />

      <AuditDetailHero event={event} />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="space-y-5">
          <AuditSectionCard title="Event details">
            <AuditDetailGrid items={detailItems} />

            {(entityHref || (event.action === "reconciliation" && event.entityType === "reconciliation")) && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {entityHref ? (
                  <Button asChild variant="outline" className="h-10 shrink-0 rounded-full px-5">
                    <Link href={entityHref} className="inline-flex items-center gap-2">
                      View related record
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </Button>
                ) : null}
                {event.action === "reconciliation" && event.entityType === "reconciliation" ? (
                  <Button
                    asChild
                    className="h-10 shrink-0 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
                  >
                    <Link href={reconciliationHref()}>Open reconciliation workspace</Link>
                  </Button>
                ) : null}
              </div>
            )}
          </AuditSectionCard>

          {hasChanges ? (
            <AuditSectionCard title="Field changes">
              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Field</th>
                      <th className="px-4 py-3 font-medium">Before</th>
                      <th className="px-4 py-3 font-medium">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.changes!.map((change) => (
                      <tr key={change.field} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium capitalize">{change.field}</td>
                        <td className="px-4 py-3 text-muted-foreground">{change.before}</td>
                        <td className="px-4 py-3 font-semibold text-green">{change.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AuditSectionCard>
          ) : null}
        </div>

        <div className="space-y-5 lg:sticky lg:top-6">
          {hasMetadata ? (
            <AuditSectionCard title="Metadata">
              <AuditMetadataChips metadata={event.metadata!} />
            </AuditSectionCard>
          ) : null}

          <AuditImmutableFooter event={event} />
        </div>
      </div>

      <Link href={auditHref(event.id)} className="sr-only">
        Permalink — {formatDisplayDate(event.timestamp.slice(0, 10))}
      </Link>
    </AuditPageShell>
  );
}
