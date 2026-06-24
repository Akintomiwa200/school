import Link from "next/link";
import { cn } from "@/lib/utils";

export function LibraryPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] bg-card p-5 text-card-foreground shadow-float sm:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function LibraryBackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
      {children}
    </Link>
  );
}

export { formatLibraryPrice } from "./library-data";
