"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  bookReadHref,
  formatLibraryPrice,
  libraryHref,
  orderHref,
  orderReceiptHref,
} from "./library-data";
import { LibraryBackLink, LibraryPanel } from "./library-ui";
import { LibraryDetailSkeleton } from "./library-skeleton";
import { getOrderByIdLive } from "./library-live-store";
import { getOrderById } from "./library-data";

export function StudentLibraryOrderDetail({ orderId }: { orderId: string }) {
  const isLoading = usePageLoading();
  const order = getOrderByIdLive(orderId) ?? getOrderById(orderId);

  if (!order) return null;
  if (isLoading) return <LibraryDetailSkeleton />;

  const digitalLine = order.lines.find((line) => line.bookId);

  return (
    <div className="space-y-5">
      <LibraryBackLink href={orderHref()}>← Back to orders</LibraryBackLink>

      <LibraryPanel className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Order {order.id}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {order.date} · {order.status}
            </p>
          </div>
          <p className="text-xl font-bold text-brand-purple">{formatLibraryPrice(order.amount)}</p>
        </div>

        <div className="rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">Item</th>
                <th className="px-4 py-2 font-medium">Format</th>
                <th className="px-4 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line) => (
                <tr key={line.itemId} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{line.title}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{line.format}</td>
                  <td className="px-4 py-3 text-right">{formatLibraryPrice(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Payment method</dt>
            <dd className="font-medium capitalize">
              {order.method}
              {order.cardLast4 ? ` ···· ${order.cardLast4}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Receipt</dt>
            <dd className="font-medium">{order.receiptId}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={orderReceiptHref(order.id)}>
              <Download className="mr-2 h-4 w-4" />
              View receipt
            </Link>
          </Button>
          {digitalLine?.bookId ? (
            <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
              <Link href={bookReadHref(digitalLine.bookId)}>Start reading</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={libraryHref("shop")}>Continue shopping</Link>
            </Button>
          )}
        </div>
      </LibraryPanel>
    </div>
  );
}
