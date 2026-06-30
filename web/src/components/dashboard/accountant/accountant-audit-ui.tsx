"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Banknote,
  ChevronLeft,
  CreditCard,
  FileText,
  GitCompare,
  Lock,
  Receipt,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatAuditAction,
  formatDisplayDate,
  type AuditAction,
  type AuditEvent,
} from "./accountant-data";
import { formatCurrency } from "./accountant-ui";

type AuditActionConfig = {
  icon: LucideIcon;
  badgeClass: string;
  iconClass: string;
  accentClass: string;
};

export const AUDIT_ACTION_CONFIG: Record<AuditAction, AuditActionConfig> = {
  payment_recorded: {
    icon: CreditCard,
    badgeClass: "bg-brand-blue/15 text-brand-blue",
    iconClass: "bg-brand-blue/10 text-brand-blue",
    accentClass: "border-brand-blue",
  },
  expense_approved: {
    icon: Wallet,
    badgeClass: "bg-green/15 text-green",
    iconClass: "bg-green/10 text-green",
    accentClass: "border-green",
  },
  invoice_issued: {
    icon: FileText,
    badgeClass: "bg-brand-purple/15 text-brand-purple",
    iconClass: "bg-brand-purple/10 text-brand-purple",
    accentClass: "border-brand-purple",
  },
  reconciliation: {
    icon: GitCompare,
    badgeClass: "bg-brand-orange/15 text-brand-orange",
    iconClass: "bg-brand-orange/10 text-brand-orange",
    accentClass: "border-brand-orange",
  },
  payroll_run: {
    icon: Banknote,
    badgeClass: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    iconClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    accentClass: "border-indigo-500",
  },
  fee_updated: {
    icon: Receipt,
    badgeClass: "bg-muted text-muted-foreground",
    iconClass: "bg-muted text-muted-foreground",
    accentClass: "border-muted-foreground/40",
  },
};

export function formatAuditTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return {
    date: formatDisplayDate(timestamp.slice(0, 10)),
    time: date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    full: date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function formatAuditMetadataKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AuditPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-6", className)}>{children}</div>
  );
}

export function AuditActionBadge({
  action,
  className,
}: {
  action: AuditAction;
  className?: string;
}) {
  const config = AUDIT_ACTION_CONFIG[action];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        config.badgeClass,
        className,
      )}
    >
      {formatAuditAction(action)}
    </span>
  );
}

export function AuditActionIcon({
  action,
  size = "md",
}: {
  action: AuditAction;
  size?: "sm" | "md" | "lg";
}) {
  const config = AUDIT_ACTION_CONFIG[action];
  const Icon = config.icon;
  const sizeClass =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl",
        sizeClass,
        config.iconClass,
      )}
    >
      <Icon className={iconSize} />
    </div>
  );
}

export function AuditBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function AuditTrailList({
  events,
  getHref,
  compact = false,
}: {
  events: AuditEvent[];
  getHref: (event: AuditEvent) => string;
  compact?: boolean;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">No audit events found</p>
        <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-3">
      <span
        aria-hidden
        className="absolute bottom-3 left-[1.35rem] top-3 w-px bg-border sm:left-[1.6rem]"
      />
      {events.map((event) => (
        <AuditTrailItem key={event.id} event={event} href={getHref(event)} compact={compact} />
      ))}
    </ol>
  );
}

export function AuditTrailItem({
  event,
  href,
  compact = false,
}: {
  event: AuditEvent;
  href: string;
  compact?: boolean;
}) {
  const { date, time } = formatAuditTimestamp(event.timestamp);
  const config = AUDIT_ACTION_CONFIG[event.action];

  return (
    <li className="relative">
      <Link
        href={href}
        className={cn(
          "group relative flex gap-3 rounded-2xl border border-border bg-background transition-all hover:border-brand-purple/30 hover:bg-muted/25 hover:shadow-sm lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-5",
          compact ? "p-3" : "p-4 sm:gap-4 lg:p-5",
        )}
      >
        <div className="relative z-[1] flex shrink-0 items-center gap-3 lg:contents">
          <AuditActionIcon action={event.action} size={compact ? "sm" : "md"} />

          <div className="min-w-0 flex-1 lg:col-start-2">
            <div className="flex flex-wrap items-center gap-2">
              <AuditActionBadge action={event.action} />
              <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                {event.reference}
              </span>
            </div>

            <p
              className={cn(
                "mt-2 text-foreground",
                compact ? "line-clamp-2 text-xs" : "text-sm leading-relaxed lg:text-[15px]",
              )}
            >
              {event.details}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold uppercase">
                  {event.actor.charAt(0)}
                </span>
                {event.actor}
              </span>
              <span aria-hidden>·</span>
              <time dateTime={event.timestamp}>
                {date} at {time}
              </time>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center justify-end gap-3 lg:col-start-3 lg:flex-col lg:items-end lg:gap-2">
          {event.amount != null ? (
            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold tabular-nums lg:text-sm",
                config.badgeClass,
              )}
            >
              {formatCurrency(event.amount)}
            </span>
          ) : null}
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-purple" />
        </div>
      </Link>
    </li>
  );
}

export function AuditDetailHero({ event }: { event: AuditEvent }) {
  const config = AUDIT_ACTION_CONFIG[event.action];
  const { full } = formatAuditTimestamp(event.timestamp);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border border-border bg-background",
        "border-l-4",
        config.accentClass,
      )}
    >
      <div className="p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-4 lg:gap-5">
            <AuditActionIcon action={event.action} size="lg" />
            <div className="min-w-0 flex-1">
              <AuditActionBadge action={event.action} className="text-xs" />
              <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                {formatAuditAction(event.action)}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground lg:max-w-3xl lg:text-base">
                {event.details}
              </p>
              <p className="mt-4 text-xs text-muted-foreground lg:text-sm">
                <span className="font-medium text-foreground">{event.actor}</span>
                {event.actorEmail ? (
                  <>
                    {" "}
                    <span className="text-muted-foreground">({event.actorEmail})</span>
                  </>
                ) : null}
                {" · "}
                <time dateTime={event.timestamp}>{full}</time>
              </p>
            </div>
          </div>

          {event.amount != null ? (
            <div className="shrink-0 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-right lg:min-w-[180px]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Amount
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-brand-purple lg:text-3xl">
                {formatCurrency(event.amount)}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AuditDetailGrid({
  items,
}: {
  items: { label: string; value: string; mono?: boolean; span?: boolean }[];
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-2xl border border-border/60 bg-muted/30 px-4 py-3",
            item.span && "sm:col-span-2 lg:col-span-3",
          )}
        >
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd
            className={cn(
              "mt-1.5 text-sm font-semibold text-foreground",
              item.mono && "font-mono text-[13px]",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function AuditMetadataChips({ metadata }: { metadata: Record<string, string> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(metadata).map(([key, value]) => (
        <div
          key={key}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {formatAuditMetadataKey(key)}
          </span>
          <span className="text-xs font-semibold text-foreground">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function AuditImmutableFooter({ event }: { event: AuditEvent }) {
  const { date, time } = formatAuditTimestamp(event.timestamp);

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/25 px-4 py-3">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Immutable audit record</span> — logged on{" "}
        {date} at {time}. This entry cannot be edited or deleted.
      </p>
    </div>
  );
}

export function AuditSectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[20px] border border-border bg-background p-5 sm:p-6", className)}>
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
