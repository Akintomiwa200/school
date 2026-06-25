import Link from "next/link";
import { cn } from "@/lib/utils";
import type { OnlineClassStatus } from "./online-classes-data";
import { studentOnlineClassesHref } from "./online-classes-data";

export function OnlineClassesPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[20px] bg-card p-4 text-card-foreground shadow-float sm:p-5",
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
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase",
        styles,
      )}
    >
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
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "connected" ? "bg-green/15 text-green" : "bg-muted text-muted-foreground",
      )}
    >
      {status === "connected" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" /> : null}
      {label}
    </span>
  );
}

export function OnlineClassesSubNav({ activeSegment }: { activeSegment: string }) {
  const items = [
    { id: "overview", label: "Overview", href: studentOnlineClassesHref() },
    { id: "live", label: "Live now", href: studentOnlineClassesHref("live") },
    { id: "upcoming", label: "Upcoming", href: studentOnlineClassesHref("upcoming") },
    { id: "recordings", label: "Recordings", href: studentOnlineClassesHref("recordings") },
  ] as const;

  return (
    <nav
      aria-label="Online classes sections"
      className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max min-w-full gap-2 sm:w-auto sm:min-w-0 sm:flex-wrap">
        {items.map((item) => {
          const isActive = item.id === activeSegment;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-purple text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden /> : null}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Consistent full-width action button inside session cards */
export function ClassActionLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
        variant === "primary"
          ? "bg-brand-purple text-white hover:bg-brand-purple/90"
          : "border border-border bg-background text-foreground hover:bg-muted/60",
        className,
      )}
    >
      {children}
    </Link>
  );
}
