import Link from "next/link";
import { cn } from "@/lib/utils";

export function ManagementPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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

export function ManagementStatCard({
  label,
  value,
  hint,
  tone = "purple",
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "purple" | "blue" | "green" | "orange" | "pink";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const styles = {
    purple: { card: "border-brand-purple/15 bg-brand-purple/5", value: "text-brand-purple", icon: "bg-brand-purple/15 text-brand-purple" },
    blue: { card: "border-brand-blue/15 bg-brand-blue/5", value: "text-brand-blue", icon: "bg-brand-blue/15 text-brand-blue" },
    green: { card: "border-green/15 bg-green/5", value: "text-green", icon: "bg-green/15 text-green" },
    orange: { card: "border-brand-orange/15 bg-brand-orange/5", value: "text-brand-orange", icon: "bg-brand-orange/15 text-brand-orange" },
    pink: { card: "border-brand-pink/15 bg-brand-pink/5", value: "text-brand-pink", icon: "bg-brand-pink/15 text-brand-pink" },
  }[tone];

  return (
    <ManagementPanel className={cn("border p-4", styles.card)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={cn("mt-2 text-2xl font-bold", styles.value)}>{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", styles.icon)}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </ManagementPanel>
  );
}

export function ManagementActionLink({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-float transition-colors hover:bg-muted/30"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </Link>
  );
}

export function ManagementPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ManagementPlaceholder({
  title = "Module UI coming next",
  description = "This section is scaffolded and ready for the detailed screen design.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center sm:px-6">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
