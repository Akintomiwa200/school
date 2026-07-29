import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/shared";
import { AdminBackLink } from "../admin/admin-workflow-ui";
import { ManagementPanel } from "../management/management-ui";
import { useTeacherLiveStore } from "./teacher-live-store";

export function TeacherLiveBadge({
  isFetching,
  updatedAt,
}: {
  isFetching?: boolean;
  updatedAt?: string;
}) {
  const { connection, lastSyncedAt } = useTeacherLiveStore();
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

export function TeacherRoleLiveBadge({
  isFetching,
  updatedAt,
}: {
  isFetching?: boolean;
  updatedAt?: string;
}) {
  const { data: session } = useSession();
  if (session?.user?.role !== UserRole.TEACHER) return null;
  return <TeacherLiveBadge isFetching={isFetching} updatedAt={updatedAt} />;
}

export function TeacherDetailHeader({
  title,
  description,
  isFetching,
  updatedAt,
  action,
}: {
  title: string;
  description?: string;
  isFetching?: boolean;
  updatedAt?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl truncate">
            {title}
          </h1>
          <TeacherLiveBadge isFetching={isFetching} updatedAt={updatedAt} />
        </div>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function TeacherPageHeader({
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
          <TeacherLiveBadge isFetching={isFetching} updatedAt={updatedAt} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function teacherInitialLoading(
  pageLoading: boolean,
  isFetching: boolean,
  isFetched: boolean,
) {
  return (pageLoading && isFetching) || (isFetching && !isFetched);
}

export function TeacherDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-6 w-40 rounded bg-muted" />
      <div className="h-32 rounded-[20px] bg-muted" />
      <div className="h-64 rounded-[20px] bg-muted" />
    </div>
  );
}

export function TeacherNotFound({
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
