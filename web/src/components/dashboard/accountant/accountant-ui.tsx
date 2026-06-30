import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeesPanel, formatCurrency } from "../fees/fee-ui";
import { accountantHref } from "./accountant-data";

export { formatCurrency };

export function FinancePanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <FeesPanel className={className} {...props} />;
}

export function FinanceSearchBar({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

export function FinanceFilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { id: T; label: string }[];
  className?: string;
}) {
  return (
    <label className={cn("block min-w-[148px]", className)}>
      <span className="sr-only">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          aria-label={label}
          className="h-9 w-full appearance-none rounded-xl border border-border bg-background pl-3 pr-8 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  );
}

export function FinanceListToolbar({
  eyebrow,
  title,
  hint,
  children,
}: {
  eyebrow: string;
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <FinancePanel className="border border-border">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">{title}</h2>
          {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {children}
        </div>
      </div>
    </FinancePanel>
  );
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
