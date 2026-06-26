"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
      ← {label}
    </Link>
  );
}

export function AdminFormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export const adminInputClass =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const adminSelectClass =
  "h-10 w-full appearance-none rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
