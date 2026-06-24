"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { saveLibraryCheckoutDraft } from "./library-checkout-storage";
import { LibraryPaySteps } from "./library-pay-steps";
import {
  BEST_SALES,
  formatLibraryPrice,
  getSaleItemById,
  libraryHref,
  payCheckoutHref,
} from "./library-data";
import { LibraryBackLink, LibraryPanel } from "./library-ui";
import { LibraryListSkeleton } from "./library-skeleton";

function LibraryPayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselect = searchParams.get("item");
  const isLoading = usePageLoading();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (preselect && getSaleItemById(preselect)) {
      setSelectedIds(new Set([preselect]));
    }
  }, [preselect]);

  const selectedItems = useMemo(
    () => BEST_SALES.filter((item) => selectedIds.has(item.id)),
    [selectedIds],
  );
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0);

  function toggleItem(itemId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function handleContinue() {
    if (selectedItems.length === 0) return;
    const itemIds = selectedItems.map((item) => item.id);
    saveLibraryCheckoutDraft({ itemIds, createdAt: Date.now() });
    router.push(payCheckoutHref(itemIds));
  }

  if (isLoading) return <LibraryListSkeleton />;

  return (
    <div className="space-y-5">
      <LibraryBackLink href={libraryHref("shop")}>← Back to shop</LibraryBackLink>

      <LibraryPanel>
        <LibraryPaySteps currentStep={1} />
      </LibraryPanel>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <LibraryPanel className="space-y-4">
          <div>
            <h2 className="text-base font-bold">Select items to purchase</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose shop items. Digital editions unlock reader access after payment.
            </p>
          </div>
          <div className="space-y-2">
            {BEST_SALES.map((item) => {
              const checked = selectedIds.has(item.id);
              return (
                <label
                  key={item.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors",
                    checked ? "border-brand-purple bg-brand-purple/5" : "border-border hover:bg-muted/40",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item.id)}
                    className="mt-1 h-4 w-4 rounded border-border accent-brand-purple"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">{item.format}</p>
                  </div>
                  <p className="shrink-0 font-semibold">{formatLibraryPrice(item.price)}</p>
                </label>
              );
            })}
          </div>
        </LibraryPanel>

        <LibraryPanel className="space-y-4">
          <h3 className="text-base font-bold">Order summary</h3>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Select at least one item to continue.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {selectedItems.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span>{item.title}</span>
                  <span className="font-medium">{formatLibraryPrice(item.price)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between border-t border-border pt-3 font-bold">
            <span>Total</span>
            <span className="text-brand-purple">{formatLibraryPrice(total)}</span>
          </div>
          <Button
            className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            disabled={selectedItems.length === 0}
            onClick={handleContinue}
          >
            Continue to gateway
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </LibraryPanel>
      </div>
    </div>
  );
}

export function StudentLibraryPay() {
  return (
    <Suspense fallback={<LibraryListSkeleton />}>
      <LibraryPayContent />
    </Suspense>
  );
}
