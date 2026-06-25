import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProfileMetric } from "./profile-data";

export function ProfilePanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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

export function ProfileActionLink({
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

export function getProfileInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatRoleLabel(role: string) {
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const METRIC_TONES: Record<ProfileMetric["tone"], { card: string; icon: string; value: string }> = {
  red: { card: "bg-[#fff5f5]", icon: "bg-red-500/15 text-red-500", value: "text-red-500" },
  green: { card: "bg-[#f0fdf6]", icon: "bg-green/15 text-green", value: "text-green" },
  purple: { card: "bg-brand-purple/5", icon: "bg-brand-purple/15 text-brand-purple", value: "text-brand-purple" },
  orange: { card: "bg-[#fff8f0]", icon: "bg-brand-orange/15 text-brand-orange", value: "text-brand-orange" },
  pink: { card: "bg-[#fdf2f8]", icon: "bg-pink-500/15 text-pink-500", value: "text-pink-500" },
};

export function ProfileMetricCard({
  metric,
  icon: Icon,
}: {
  metric: ProfileMetric;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const tone = METRIC_TONES[metric.tone];

  return (
    <ProfilePanel className={cn("flex min-w-[140px] flex-1 flex-col items-center border border-border px-3 py-4 text-center sm:min-w-0", tone.card)}>
      <div className={cn("mb-3 flex h-11 w-11 items-center justify-center rounded-2xl", tone.icon)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className={cn("text-2xl font-bold leading-none", tone.value)}>{metric.value}</p>
      <p className="mt-2 text-xs leading-snug text-muted-foreground">{metric.label}</p>
    </ProfilePanel>
  );
}

export function ProfileSectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="text-base font-bold">{title}</h2>
      {action}
    </div>
  );
}
