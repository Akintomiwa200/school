"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Check, Link2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useReconciliationMutation,
  useReconciliationWorkspace,
  type ReconciliationWorkspace,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader } from "../management/management-ui";
import {
  PAYMENT_METHOD_LABELS,
  RECONCILIATION_ITEMS,
  RECONCILIATION_PERIOD,
  accountantHref,
  formatDisplayDate,
  getLedgerPayments,
  paymentHref,
  type ReconciliationItem,
} from "./accountant-data";
import { FinanceFilterSelect, FinancePanel, formatCurrency } from "./accountant-ui";
import { AuditBackLink, AuditPageShell } from "./accountant-audit-ui";

type StatusFilter = "all" | ReconciliationItem["status"];

const FALLBACK_WORKSPACE: ReconciliationWorkspace = {
  items: RECONCILIATION_ITEMS,
  summary: {
    period: RECONCILIATION_PERIOD,
    total: RECONCILIATION_ITEMS.length,
    unmatched: RECONCILIATION_ITEMS.filter((item) => item.status === "unmatched").length,
    matched: RECONCILIATION_ITEMS.filter((item) => item.status === "matched").length,
    flagged: RECONCILIATION_ITEMS.filter((item) => item.status === "flagged").length,
    needsReview: RECONCILIATION_ITEMS.filter(
      (item) => item.status === "unmatched" || item.status === "flagged",
    ).length,
  },
  availablePayments: getLedgerPayments().filter((payment) => payment.status === "completed"),
};

const STATUS_STYLES: Record<ReconciliationItem["status"], string> = {
  matched: "bg-green/15 text-green",
  unmatched: "bg-brand-orange/15 text-brand-orange",
  flagged: "bg-destructive/15 text-destructive",
};

export function AccountantReconciliation() {
  const isLoading = usePageLoading();
  const { data: workspace = FALLBACK_WORKSPACE, isFetching } = useReconciliationWorkspace(FALLBACK_WORKSPACE);
  const mutation = useReconciliationMutation();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");

  const loading = isLoading || isFetching;

  const filteredItems = useMemo(() => {
    if (filter === "all") return workspace.items;
    return workspace.items.filter((item) => item.status === filter);
  }, [workspace.items, filter]);

  const selectedItem = workspace.items.find((item) => item.id === selectedItemId) ?? filteredItems[0] ?? null;

  const suggestedPayments = useMemo(() => {
    if (!selectedItem) return workspace.availablePayments;
    return [...workspace.availablePayments].sort((a, b) => {
      const aScore = Math.abs(a.amount - selectedItem.bankAmount);
      const bScore = Math.abs(b.amount - selectedItem.bankAmount);
      return aScore - bScore;
    });
  }, [selectedItem, workspace.availablePayments]);

  async function handleMatch() {
    if (!selectedItem || !selectedPaymentId) return;
    await mutation.mutateAsync({ itemId: selectedItem.id, action: "match", paymentId: selectedPaymentId });
    setSelectedPaymentId("");
  }

  async function handleUnmatch(itemId: string) {
    await mutation.mutateAsync({ itemId, action: "unmatch" });
  }

  if (loading) {
    return (
      <AuditPageShell>
        <div className="h-64 animate-pulse rounded-[20px] bg-muted" />
      </AuditPageShell>
    );
  }

  return (
    <AuditPageShell>
      <ManagementPageHeader
        title="Bank reconciliation"
        description={`Match bank deposits to recorded payments for ${workspace.summary.period}.`}
      />

      <AuditBackLink href={accountantHref("audit")} label="Back to audit log" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total lines" value={workspace.summary.total} />
        <StatCard label="Matched" value={workspace.summary.matched} tone="green" />
        <StatCard label="Unmatched" value={workspace.summary.unmatched} tone="orange" />
        <StatCard label="Flagged" value={workspace.summary.flagged} tone="red" />
      </div>

      <FinancePanel className="border border-border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Period</p>
            <h2 className="text-lg font-bold">{workspace.summary.period}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {workspace.summary.needsReview} item{workspace.summary.needsReview === 1 ? "" : "s"} need review
            </p>
          </div>
          <FinanceFilterSelect
            label="Status"
            value={filter}
            onChange={setFilter}
            options={[
              { id: "all", label: "All status" },
              { id: "unmatched", label: "Unmatched" },
              { id: "flagged", label: "Flagged" },
              { id: "matched", label: "Matched" },
            ]}
            className="sm:w-44"
          />
        </div>
      </FinancePanel>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <FinancePanel className="border border-border">
          <h2 className="text-base font-bold">Bank statement lines</h2>
          <ul className="mt-4 divide-y divide-border">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setSelectedPaymentId(item.matchedPaymentId ?? "");
                  }}
                  className={cn(
                    "w-full rounded-2xl px-3 py-3 text-left transition-colors",
                    selectedItem?.id === item.id ? "bg-brand-purple/10 ring-1 ring-brand-purple/30" : "hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">{item.bankReference}</span>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                            STATUS_STYLES[item.status],
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold">{item.bankDescription}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDisplayDate(item.bankDate)}</p>
                      {item.flagReason ? (
                        <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {item.flagReason}
                        </p>
                      ) : null}
                      {item.matchedReceiptId ? (
                        <p className="mt-1 text-xs text-green">Matched to {item.matchedReceiptId}</p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-sm font-bold">{formatCurrency(item.bankAmount)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </FinancePanel>

        <FinancePanel className="border border-border">
          <h2 className="text-base font-bold">Match to payment</h2>
          {!selectedItem ? (
            <p className="mt-4 text-sm text-muted-foreground">Select a bank line to begin matching.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-muted/45 px-4 py-3">
                <p className="text-xs text-muted-foreground">Selected bank line</p>
                <p className="mt-1 font-semibold">{selectedItem.bankDescription}</p>
                <p className="mt-1 text-sm font-bold text-brand-purple">{formatCurrency(selectedItem.bankAmount)}</p>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Recorded payment</span>
                <select
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a payment…</option>
                  {suggestedPayments.map((payment) => (
                    <option key={payment.id} value={payment.id}>
                      {payment.receiptId} — {payment.studentName} — {formatCurrency(payment.amount)} (
                      {PAYMENT_METHOD_LABELS[payment.method]})
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
                  disabled={!selectedPaymentId || mutation.isPending}
                  onClick={handleMatch}
                >
                  <Link2 className="h-4 w-4 shrink-0" />
                  {mutation.isPending ? "Saving…" : "Match payment"}
                </Button>
                {selectedItem.status === "matched" || selectedItem.matchedPaymentId ? (
                  <Button
                    variant="outline"
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-5"
                    disabled={mutation.isPending}
                    onClick={() => handleUnmatch(selectedItem.id)}
                  >
                    <Unlink className="h-4 w-4 shrink-0" />
                    Unmatch
                  </Button>
                ) : null}
              </div>

              {selectedPaymentId ? (
                <Link
                  href={paymentHref(selectedPaymentId)}
                  className="inline-flex w-fit shrink-0 items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
                >
                  View payment details
                  <span aria-hidden>→</span>
                </Link>
              ) : null}

              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Suggested matches</p>
                <ul className="mt-3 space-y-2">
                  {suggestedPayments.slice(0, 4).map((payment) => (
                    <li
                      key={payment.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-muted/35 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{payment.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.receiptId} · {formatDisplayDate(payment.date)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="shrink-0 font-semibold tabular-nums">{formatCurrency(payment.amount)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 rounded-full p-0"
                          onClick={() => setSelectedPaymentId(payment.id)}
                          aria-label={`Select payment ${payment.receiptId}`}
                        >
                          <Check className="h-4 w-4 shrink-0" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </FinancePanel>
      </div>
    </AuditPageShell>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "green" | "orange" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "text-green"
      : tone === "orange"
        ? "text-brand-orange"
        : tone === "red"
          ? "text-destructive"
          : "text-foreground";

  return (
    <FinancePanel className="border border-border">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-2xl font-bold tabular-nums lg:text-3xl", toneClass)}>{value}</p>
    </FinancePanel>
  );
}
