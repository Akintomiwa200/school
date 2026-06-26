import Link from "next/link";
import { cn } from "@/lib/utils";
import { FeesPanel, formatCurrency } from "../fees/fee-ui";
import { accountantHref } from "./accountant-data";

export { formatCurrency };

export function FinancePanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <FeesPanel className={className} {...props} />;
}

export function FinanceSubNav({ activeSegment }: { activeSegment: string }) {
  const items = [
    { id: "dashboard", label: "Overview", href: accountantHref() },
    { id: "fees", label: "Fee structure", href: accountantHref("fees") },
    { id: "payments", label: "Payments", href: accountantHref("payments") },
    { id: "invoices", label: "Invoices", href: accountantHref("invoices") },
    { id: "expenses", label: "Expenses", href: accountantHref("expenses") },
    { id: "payroll", label: "Payroll", href: accountantHref("payroll") },
    { id: "audit", label: "Audit", href: accountantHref("audit") },
    { id: "reports", label: "Reports", href: accountantHref("reports") },
  ] as const;

  return (
    <nav aria-label="Finance sections" className="flex flex-wrap gap-2">
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
