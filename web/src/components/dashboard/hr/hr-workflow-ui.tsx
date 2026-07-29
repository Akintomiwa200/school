import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/shared";
import { Button } from "@/components/ui/button";
import { AdminBackLink } from "../admin/admin-workflow-ui";
import { ManagementPanel } from "../management/management-ui";
import { useHrLiveStore } from "./hr-live-store";

export const HR_AVATAR_TONES = {
  purple: "bg-brand-purple/15 text-brand-purple",
  blue: "bg-brand-blue/15 text-brand-blue",
  green: "bg-green/15 text-green",
  orange: "bg-brand-orange/15 text-brand-orange",
} as const;

export function getHrInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function HrListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="h-12 w-full max-w-sm animate-pulse rounded-xl bg-muted" />
      <div className="h-96 animate-pulse rounded-[20px] bg-muted" />
    </div>
  );
}

export function HrModal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <ManagementPanel className="w-full max-w-md border border-border shadow-xl">
        <h2 className="text-lg font-bold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        <div className="mt-5 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end">
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </ManagementPanel>
    </div>
  );
}

export function HrLiveBadge({
  isFetching,
  updatedAt,
}: {
  isFetching?: boolean;
  updatedAt?: string;
}) {
  const { connection, lastSyncedAt } = useHrLiveStore();
  const isLive = connection === "connected" || connection === "connecting";
  const timeLabel = (updatedAt ?? lastSyncedAt)
    ? new Date(updatedAt ?? lastSyncedAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          connection === "error" ? "bg-brand-orange" : "bg-green",
          (isFetching || connection === "connecting") && "animate-pulse",
          !isLive && connection !== "error" && "opacity-40",
        )}
      />
      {connection === "error" ? "Reconnecting" : "Live"}
      {timeLabel ? <span className="text-muted-foreground/70">· {timeLabel}</span> : null}
    </span>
  );
}

export function HrRoleLiveBadge({
  isFetching,
  updatedAt,
}: {
  isFetching?: boolean;
  updatedAt?: string;
}) {
  const { data: session } = useSession();
  if (session?.user?.role !== UserRole.HR) return null;
  return <HrLiveBadge isFetching={isFetching} updatedAt={updatedAt} />;
}

export function HrPageHeader({
  title,
  description,
  action,
  isFetching,
  updatedAt,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  isFetching?: boolean;
  updatedAt?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <HrLiveBadge isFetching={isFetching} updatedAt={updatedAt} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function hrInitialLoading(
  pageLoading: boolean,
  isFetching: boolean,
  isFetched: boolean,
) {
  return (pageLoading && isFetching) || (isFetching && !isFetched);
}

export function HrDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-6 w-40 rounded bg-muted" />
      <div className="h-32 rounded-[20px] bg-muted" />
      <div className="h-64 rounded-[20px] bg-muted" />
    </div>
  );
}

export function HrNotFound({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="space-y-6">
      <AdminBackLink href={backHref} label={backLabel} />
      <ManagementPanel className="border border-border">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Link href={backHref} className="mt-4 inline-block text-sm font-semibold text-brand-purple hover:underline">
          {backLabel}
        </Link>
      </ManagementPanel>
    </div>
  );
}
