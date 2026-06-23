"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  checkoutHref,
  clearCheckoutDraft,
  payConfirmationHref,
  readCheckoutDraft,
  saveCheckoutDraft,
} from "./fees-checkout-storage";
import { FeesPaySteps } from "./fees-pay-steps";
import { addLiveFeePayment, useLiveFeePayments } from "./fees-live-store";
import { FeesPanel, formatCurrency, feesHref } from "./fee-ui";
import {
  formatDisplayDate,
  getFeeBalance,
  getFeeItemById,
  payHref,
  type PaymentRecord,
} from "./student-fees-data";
import { StudentFeesSkeleton } from "./student-fees-skeleton";

type PayMethod = PaymentRecord["method"];
type GatewayPhase = "idle" | "initiating" | "processing" | "confirming" | "error";

const PAY_METHODS: { id: PayMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "card", label: "Debit / Credit card", icon: CreditCard },
  { id: "bank", label: "Bank transfer", icon: Building2 },
];

export function StudentFeesPayCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoading = usePageLoading();
  const livePayments = useLiveFeePayments();

  const feeIdsFromUrl = searchParams.get("fees")?.split(",").filter(Boolean) ?? [];
  const [feeIds, setFeeIds] = useState<string[]>(feeIdsFromUrl);
  const [method, setMethod] = useState<PayMethod>("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [phase, setPhase] = useState<GatewayPhase>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const draft = readCheckoutDraft();
    if (feeIdsFromUrl.length > 0) {
      setFeeIds(feeIdsFromUrl);
      saveCheckoutDraft({ feeIds: feeIdsFromUrl, createdAt: Date.now() });
    } else if (draft) {
      setFeeIds(draft.feeIds);
    }
  }, [feeIdsFromUrl.join(",")]);

  const selectedFees = useMemo(
    () => feeIds.map((id) => getFeeItemById(id)).filter((fee) => fee != null),
    [feeIds, livePayments],
  );

  const payableFees = selectedFees.filter((fee) => getFeeBalance(fee) > 0);
  const totalAmount = payableFees.reduce((sum, fee) => sum + getFeeBalance(fee), 0);

  async function handleGatewayPay() {
    if (payableFees.length === 0 || totalAmount <= 0) return;

    if (method === "card") {
      const digits = cardNumber.replace(/\s/g, "");
      if (!cardName.trim() || digits.length < 12 || !expiry.trim() || cvc.length < 3) {
        setErrorMessage("Complete all card fields to proceed.");
        return;
      }
    }

    setErrorMessage(null);
    setPhase("initiating");
    setStatusMessage("Connecting to Schooli Pay Gateway…");

    try {
      const cardLast4 = method === "card" ? cardNumber.replace(/\s/g, "").slice(-4) : undefined;

      const initiateRes = await fetch("/api/v1/fees/pay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeIds: payableFees.map((fee) => fee.id),
          amount: totalAmount,
          method,
          cardLast4,
        }),
      });

      const initiateJson = await initiateRes.json();
      if (!initiateRes.ok) {
        throw new Error(initiateJson.message ?? initiateJson.error ?? "Gateway connection failed.");
      }

      const checkoutSessionId = initiateJson.data.checkoutSessionId as string;

      setPhase("processing");
      setStatusMessage("Processing payment securely…");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setPhase("confirming");
      setStatusMessage("Confirming transaction and generating receipt…");

      const confirmRes = await fetch("/api/v1/fees/pay/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutSessionId }),
      });

      const confirmJson = await confirmRes.json();
      if (!confirmRes.ok) {
        throw new Error(confirmJson.message ?? confirmJson.error ?? "Payment confirmation failed.");
      }

      const data = confirmJson.data as {
        paymentId: string;
        receiptId: string;
        feeIds: string[];
        amount: number;
        method: PayMethod;
        date: string;
        description: string;
        gatewaySessionId: string;
        cardLast4?: string;
        feeLines: Array<{ label: string; amount: number }>;
      };

      const payment = addLiveFeePayment({
        id: data.paymentId,
        feeIds: data.feeIds,
        amount: data.amount,
        method: data.method,
        description: data.description,
        receiptId: data.receiptId,
        gatewaySessionId: data.gatewaySessionId,
        cardLast4: data.cardLast4,
        receiptGeneratedAt: new Date().toISOString(),
        feeSnapshots: payableFees.map((fee) => ({
          id: fee.id,
          amount: fee.amount,
          paidAmount: fee.paidAmount,
          label: fee.label,
        })),
      });

      await fetch(`/api/v1/fees/receipt/${payment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptId: data.receiptId,
          studentName: "Alex Johnson",
          studentId: "STU-2024-118",
          date: data.date,
          amount: data.amount,
          method: data.method,
          description: data.description,
          feeLines: data.feeLines,
        }),
      });

      clearCheckoutDraft();
      router.push(payConfirmationHref(payment.id));
    } catch (error) {
      setPhase("error");
      setStatusMessage(null);
      setErrorMessage(error instanceof Error ? error.message : "Payment failed.");
    }
  }

  if (isLoading) {
    return <StudentFeesSkeleton />;
  }

  if (payableFees.length === 0) {
    return (
      <FeesPanel className="text-center">
        <h2 className="text-lg font-bold">No fees selected</h2>
        <p className="mt-2 text-sm text-muted-foreground">Return to fee selection to continue checkout.</p>
        <Button asChild className="mt-4 rounded-full px-4">
          <Link href={payHref()}>Select fees</Link>
        </Button>
      </FeesPanel>
    );
  }

  const isBusy = phase !== "idle" && phase !== "error";

  return (
    <div className="space-y-5">
      <Link
        href={payHref()}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to fee selection
      </Link>

      <FeesPanel>
        <FeesPaySteps currentStep={2} />
      </FeesPanel>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <FeesPanel className="space-y-4 border border-brand-purple/20 bg-gradient-to-br from-brand-purple/5 to-brand-blue/5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Schooli Pay Gateway</h2>
              <p className="text-xs text-muted-foreground">256-bit SSL · PCI compliant demo</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PAY_METHODS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isBusy}
                  onClick={() => setMethod(item.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    method === item.id
                      ? "bg-brand-purple text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {method === "card" ? (
            <div className="space-y-3 rounded-2xl bg-card/80 p-4">
              <Input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Cardholder name"
                className="rounded-full"
                disabled={isBusy}
              />
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Card number"
                className="rounded-full"
                inputMode="numeric"
                disabled={isBusy}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="rounded-full"
                  disabled={isBusy}
                />
                <Input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="CVC"
                  className="rounded-full"
                  inputMode="numeric"
                  disabled={isBusy}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-card/80 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Bank transfer</p>
              <p className="mt-2">Account: Schooli Education Trust</p>
              <p>IBAN: GB00 SCHO 0000 1234 5678 90</p>
              <p className="mt-2">Reference: STU-2024-118</p>
            </div>
          )}

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Demo gateway — no real charge is made.
          </p>

          {statusMessage ? (
            <div className="flex items-center gap-2 rounded-2xl bg-brand-blue/10 px-4 py-3 text-sm text-brand-blue">
              <Loader2 className="h-4 w-4 animate-spin" />
              {statusMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <Button
            type="button"
            disabled={isBusy}
            onClick={() => void handleGatewayPay()}
            className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              `Pay ${formatCurrency(totalAmount)} securely`
            )}
          </Button>
        </FeesPanel>

        <FeesPanel className="space-y-4">
          <h2 className="text-base font-bold">Order review</h2>
          <div className="space-y-3">
            {payableFees.map((fee) => (
              <div
                key={fee.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted/40 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{fee.label}</p>
                  <p className="text-xs text-muted-foreground">Due {formatDisplayDate(fee.dueDate)}</p>
                </div>
                <p className="font-bold">{formatCurrency(getFeeBalance(fee))}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="font-medium">Total due</span>
              <span className="text-xl font-bold text-brand-purple">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </FeesPanel>
      </div>
    </div>
  );
}
