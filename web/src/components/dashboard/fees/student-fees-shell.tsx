"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeesPanel, FeesSubNav, feesHref } from "./fee-ui";
import { payHref } from "./student-fees-data";

type StudentFeesShellProps = {
  children: React.ReactNode;
  showActions?: boolean;
  /** Standalone pages (pay, detail views) hide the tab bar and use a slimmer header. */
  standalone?: boolean;
};

const DEFAULT_STUDENT = {
  name: "Alex Johnson",
  studentId: "STU-2024-118",
};

export function StudentFeesShell({
  children,
  showActions = true,
  standalone = false,
}: StudentFeesShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const studentName = session?.user?.name ?? DEFAULT_STUDENT.name;

  const activeSegment = (() => {
    if (pathname === "/student/fees") return "overview";
    if (pathname.startsWith("/student/fees/payments")) return "payments";
    if (pathname.startsWith("/student/fees/invoices")) return "invoices";
    if (pathname.startsWith("/student/fees/statement")) return "statement";
    return "overview";
  })();

  const isStandalonePage =
    standalone ||
    pathname.startsWith("/student/fees/pay") ||
    pathname.startsWith("/student/fees/items/") ||
    pathname.startsWith("/student/fees/payments/") ||
    pathname.startsWith("/student/fees/invoices/");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {pathname.startsWith("/student/fees/pay/confirmation")
              ? "Payment confirmed"
              : pathname.startsWith("/student/fees/pay/checkout")
                ? "Payment gateway"
                : pathname.startsWith("/student/fees/pay")
                  ? "Pay fees"
                  : pathname.includes("/receipt")
                    ? "Receipt"
                    : "Fees"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pathname.startsWith("/student/fees/pay/confirmation")
              ? "Your payment was successful. Receipt is ready."
              : pathname.startsWith("/student/fees/pay/checkout")
                ? "Complete your payment through the secure gateway."
                : pathname.startsWith("/student/fees/pay")
                  ? "Select fees and continue to checkout."
                  : pathname.includes("/receipt")
                    ? "Official payment receipt for your records."
                    : "Your fee balance, due dates, and payment history."}
          </p>
        </div>
        {showActions && !isStandalonePage ? (
          <div className="flex items-center gap-2">
            <Button
              asChild
              className="h-9 shrink-0 rounded-full bg-brand-purple px-4 text-sm font-semibold text-white hover:bg-brand-purple/90"
            >
              <Link href={payHref()}>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay now
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-9 shrink-0 rounded-full px-4"
            >
              <Link href={feesHref("payments")}>
                <Download className="mr-2 h-4 w-4" />
                Receipts
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      {!isStandalonePage ? (
        <FeesPanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Student account
            </p>
            <h2 className="mt-1 text-lg font-bold">{studentName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">ID: {DEFAULT_STUDENT.studentId}</p>
          </div>
          <p className="text-sm text-muted-foreground">Spring 2026 · Term billing</p>
        </FeesPanel>
      ) : null}

      {!isStandalonePage ? <FeesSubNav activeSegment={activeSegment} /> : null}

      {children}
    </div>
  );
}
