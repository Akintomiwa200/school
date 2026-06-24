"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Building2, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  clearLibraryCheckoutDraft,
  readLibraryCheckoutDraft,
  saveLibraryCheckoutDraft,
} from "./library-checkout-storage";
import { LibraryPaySteps } from "./library-pay-steps";
import { addLiveLibraryOrder } from "./library-live-store";
import {
  formatLibraryPrice,
  getSaleItemById,
  payConfirmationHref,
  payHref,
} from "./library-data";
import { LibraryBackLink, LibraryPanel } from "./library-ui";
import { LibraryListSkeleton } from "./library-skeleton";

type PayMethod = "card" | "bank";
type GatewayPhase = "idle" | "initiating" | "processing" | "confirming" | "error";

const PAY_METHODS = [
  { id: "card" as const, label: "Debit / Credit card", icon: CreditCard },
  { id: "bank" as const, label: "Bank transfer", icon: Building2 },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoading = usePageLoading();
  const itemIdsFromUrl = searchParams.get("items")?.split(",").filter(Boolean) ?? [];
  const [itemIds, setItemIds] = useState<string[]>(itemIdsFromUrl);
  const [method, setMethod] = useState<PayMethod>("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [phase, setPhase] = useState<GatewayPhase>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const draft = readLibraryCheckoutDraft();
    if (itemIdsFromUrl.length > 0) {
      setItemIds(itemIdsFromUrl);
      saveLibraryCheckoutDraft({ itemIds: itemIdsFromUrl, createdAt: Date.now() });
    } else if (draft) {
      setItemIds(draft.itemIds);
    }
  }, [itemIdsFromUrl.join(",")]);

  const selectedItems = useMemo(
    () => itemIds.map((id) => getSaleItemById(id)).filter((item) => item != null),
    [itemIds],
  );
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

  async function handleGatewayPay() {
    if (selectedItems.length === 0 || totalAmount <= 0) return;
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
      const initiateRes = await fetch("/api/v1/library/pay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds, amount: totalAmount, method, cardLast4 }),
      });
      const initiateJson = await initiateRes.json();
      if (!initiateRes.ok) {
        throw new Error(initiateJson.message ?? initiateJson.error ?? "Gateway connection failed.");
      }

      const checkoutSessionId = initiateJson.data.checkoutSessionId as string;
      setPhase("processing");
      setStatusMessage("Processing payment securely…");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setPhase("confirming");
      setStatusMessage("Confirming transaction…");
      const confirmRes = await fetch("/api/v1/library/pay/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutSessionId }),
      });
      const confirmJson = await confirmRes.json();
      if (!confirmRes.ok) {
        throw new Error(confirmJson.message ?? confirmJson.error ?? "Payment confirmation failed.");
      }

      const data = confirmJson.data as {
        itemIds: string[];
        amount: number;
        method: PayMethod;
        cardLast4?: string;
        gatewaySessionId: string;
        lines: Array<{
          itemId: string;
          title: string;
          amount: number;
          format: string;
          bookId?: string;
        }>;
      };

      const order = addLiveLibraryOrder({
        itemIds: data.itemIds,
        lines: data.lines.map((line) => ({
          itemId: line.itemId,
          title: line.title,
          amount: line.amount,
          format: line.format as "physical" | "digital" | "bundle",
          bookId: line.bookId,
        })),
        amount: data.amount,
        method: data.method,
        cardLast4: data.cardLast4,
        gatewaySessionId: data.gatewaySessionId,
      });

      clearLibraryCheckoutDraft();
      router.push(payConfirmationHref(order.id));
    } catch (error) {
      setPhase("error");
      setStatusMessage(null);
      setErrorMessage(error instanceof Error ? error.message : "Payment failed.");
    }
  }

  if (isLoading) return <LibraryListSkeleton />;

  if (selectedItems.length === 0) {
    return (
      <LibraryPanel className="text-center">
        <h2 className="text-lg font-bold">No items selected</h2>
        <p className="mt-2 text-sm text-muted-foreground">Return to checkout to select shop items.</p>
        <Button asChild className="mt-4 rounded-full">
          <Link href={payHref()}>Select items</Link>
        </Button>
      </LibraryPanel>
    );
  }

  const isBusy = phase !== "idle" && phase !== "error";

  return (
    <div className="space-y-5">
      <LibraryBackLink href={payHref()}>← Back to item selection</LibraryBackLink>

      <LibraryPanel>
        <LibraryPaySteps currentStep={2} />
      </LibraryPanel>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <LibraryPanel className="space-y-4 border border-brand-purple/20 bg-gradient-to-br from-brand-purple/5 to-brand-blue/5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Schooli Pay Gateway</h2>
              <p className="text-xs text-muted-foreground">256-bit SSL · Demo checkout</p>
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
              <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Cardholder name" className="rounded-full" disabled={isBusy} />
              <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="Card number" className="rounded-full" inputMode="numeric" disabled={isBusy} />
              <div className="grid grid-cols-2 gap-3">
                <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" className="rounded-full" disabled={isBusy} />
                <Input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="CVC" className="rounded-full" inputMode="numeric" disabled={isBusy} />
              </div>
            </div>
          ) : (
            <p className="rounded-2xl bg-card/80 p-4 text-sm text-muted-foreground">
              You will receive bank transfer instructions after confirming this order.
            </p>
          )}

          {statusMessage ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {statusMessage}
            </p>
          ) : null}
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <Button
            className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            disabled={isBusy}
            onClick={handleGatewayPay}
          >
            <Lock className="mr-2 h-4 w-4" />
            Pay {formatLibraryPrice(totalAmount)}
          </Button>
        </LibraryPanel>

        <LibraryPanel className="space-y-3">
          <h3 className="font-bold">Order summary</h3>
          <ul className="space-y-2 text-sm">
            {selectedItems.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span>{item.title}</span>
                <span>{formatLibraryPrice(item.price)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-border pt-3 font-bold">
            <span>Total</span>
            <span className="text-brand-purple">{formatLibraryPrice(totalAmount)}</span>
          </div>
        </LibraryPanel>
      </div>
    </div>
  );
}

export function StudentLibraryPayCheckout() {
  return (
    <Suspense fallback={<LibraryListSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}
