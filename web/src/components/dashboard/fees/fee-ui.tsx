import Link from "next/link";
import { cn } from "@/lib/utils";

export function FeesPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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

export function feesHref(segment?: string) {
  const base = "/student/fees";
  return segment ? `${base}/${segment}` : base;
}

export function FeesSubNav({ activeSegment }: { activeSegment: string }) {
  const items = [
    { id: "overview", label: "Overview", href: feesHref() },
    { id: "payments", label: "Payments", href: feesHref("payments") },
    { id: "invoices", label: "Invoices", href: feesHref("invoices") },
    { id: "statement", label: "Statement", href: feesHref("statement") },
  ] as const;

  return (
    <nav aria-label="Fees sections" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = item.id === activeSegment;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
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
    </nav>
  );
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
