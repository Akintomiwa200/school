import { cn } from "@/lib/utils";
import type { OnlineClassStatus } from "./online-classes-data";

export function OnlineClassesPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-card p-4 text-card-foreground shadow-float sm:p-5",
        className,
      )}
      {...props}
    />
  );
}

export function ClassStatusBadge({ status }: { status: OnlineClassStatus }) {
  const styles =
    status === "live"
      ? "bg-green/15 text-green"
      : status === "scheduled"
        ? "bg-brand-blue/15 text-brand-blue"
        : "bg-muted text-muted-foreground";

  const label = status === "live" ? "Live" : status === "scheduled" ? "Scheduled" : "Ended";

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase", styles)}>
      {status === "live" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" /> : null}
      {label}
    </span>
  );
}

export function LiveConnectionBadge({ status }: { status: string }) {
  const label =
    status === "connected" ? "Live sync" : status === "connecting" || status === "reconnecting" ? "Connecting…" : "Offline";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "connected" ? "bg-green/15 text-green" : "bg-muted text-muted-foreground",
      )}
    >
      {status === "connected" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" /> : null}
      {label}
    </span>
  );
}
