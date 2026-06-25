import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CalendarEntryType } from "./calendar-data";

export function CalendarPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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

export function CalendarActionLink({
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

export const CALENDAR_TYPE_STYLES: Record<
  CalendarEntryType,
  { badge: string; dot: string; label: string }
> = {
  class: {
    badge: "bg-brand-blue/15 text-brand-blue",
    dot: "bg-brand-blue",
    label: "Class",
  },
  exam: {
    badge: "bg-destructive/15 text-destructive",
    dot: "bg-destructive",
    label: "Exam",
  },
  holiday: {
    badge: "bg-green/15 text-green",
    dot: "bg-green",
    label: "Holiday",
  },
  event: {
    badge: "bg-brand-purple/15 text-brand-purple",
    dot: "bg-brand-purple",
    label: "Event",
  },
};

export function CalendarTypeBadge({ type }: { type: CalendarEntryType }) {
  const style = CALENDAR_TYPE_STYLES[type];
  return (
    <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase", style.badge)}>
      {style.label}
    </span>
  );
}
