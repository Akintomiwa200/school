"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  formatLibraryPrice,
  getOrderById,
  orderHref,
} from "./library-data";
import { LibraryBackLink, LibraryPanel } from "./library-ui";
import { LibraryDetailSkeleton } from "./library-skeleton";
import { getOrderByIdLive } from "./library-live-store";

export function StudentLibraryReceipt({ orderId }: { orderId: string }) {
  const isLoading = usePageLoading();
  const order = getOrderByIdLive(orderId) ?? getOrderById(orderId);

  if (!order) return null;
  if (isLoading) return <LibraryDetailSkeleton />;

  return (
    <div className="space-y-5">
      <LibraryBackLink href={orderHref(orderId)}>← Back to order</LibraryBackLink>

      <LibraryPanel className="mx-auto max-w-lg space-y-6" id="library-receipt">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Schooli Library</p>
          <h2 className="mt-2 text-2xl font-bold">Payment receipt</h2>
          <p className="mt-1 text-sm text-muted-foreground">{order.receiptId}</p>
        </div>

        <div className="space-y-2 border-y border-border py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{order.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order</span>
            <span className="font-medium">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Method</span>
            <span className="font-medium capitalize">
              {order.method}
              {order.cardLast4 ? ` ···· ${order.cardLast4}` : ""}
            </span>
          </div>
        </div>

        <ul className="space-y-2 text-sm">
          {order.lines.map((line) => (
            <li key={line.itemId} className="flex justify-between gap-4">
              <span>
                {line.title}
                <span className="ml-1 text-muted-foreground">({line.format})</span>
              </span>
              <span className="font-medium">{formatLibraryPrice(line.amount)}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t border-border pt-4 text-base font-bold">
          <span>Total paid</span>
          <span className="text-brand-purple">{formatLibraryPrice(order.amount)}</span>
        </div>
      </LibraryPanel>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" className="rounded-full" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print receipt
        </Button>
        <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
          <Link href={orderHref()}>All orders</Link>
        </Button>
      </div>
    </div>
  );
}
