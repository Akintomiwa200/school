import { cn } from "@/lib/utils";

export function NotificationsPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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

export function ConnectionBadge({ status }: { status: string }) {
  const label =
    status === "connected"
      ? "Live"
      : status === "connecting" || status === "reconnecting"
        ? "Connecting…"
        : status === "error"
          ? "Offline"
          : "Idle";

  const tone =
    status === "connected"
      ? "bg-green/15 text-green"
      : status === "error"
        ? "bg-destructive/15 text-destructive"
        : "bg-muted text-muted-foreground";

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", tone)}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "connected" ? "bg-green animate-pulse" : "bg-current opacity-60",
        )}
      />
      {label}
    </span>
  );
}
