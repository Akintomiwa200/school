"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Base field styles — full width inside forms. */
export const dashboardFieldClass =
  "box-border block h-10 w-full max-w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export const dashboardInputClass = dashboardFieldClass;

/** Select inside labeled forms (grids, modals). */
export const dashboardFormSelectClass = cn(
  dashboardFieldClass,
  "appearance-none bg-background pr-9",
);

/** Select in filter/toolbars — width controlled by grid + global CSS. */
export const dashboardFilterSelectClass =
  "dashboard-filter-select box-border block h-10 w-full appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const dashboardSearchInputClass = cn(
  dashboardFieldClass,
  "bg-card pl-9",
);

/** Multi-line fields in dashboard settings forms. */
export const dashboardTextareaClass = cn(
  dashboardFieldClass,
  "h-auto min-h-[5.5rem] resize-y py-2.5 leading-relaxed",
);

/** Monospace list editors (programs, rules). */
export const dashboardMonoTextareaClass = cn(
  dashboardTextareaClass,
  "min-h-[8rem] font-mono text-xs leading-6",
);

export function dashboardFilterBarClass(className?: string) {
  return cn("dashboard-filter-bar", className);
}

export function dashboardSearchWrapClass(className?: string) {
  return cn("relative w-full min-w-0", className);
}

export function DashboardSearchField({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  type = "search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  type?: "search" | "text";
}) {
  return (
    <div className={dashboardSearchWrapClass(className)} data-search-field="true">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(dashboardSearchInputClass, inputClassName)}
      />
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function DashboardFilterSelect<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  label?: string;
  className?: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(dashboardFilterSelectClass, className)}
    >
      {options.map((option) => (
        <option key={option.value || "__empty"} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function DashboardEmptyCopy({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("dashboard-empty-copy text-sm text-muted-foreground", className)}>{children}</p>;
}
