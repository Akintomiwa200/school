"use client";

import Link from "next/link";
import { usePageLoading } from "@/hooks/use-page-loading";
import { formatLibraryPrice, orderHref } from "./library-data";
import { LibraryPanel } from "./library-ui";
import { LibraryListSkeleton } from "./library-skeleton";
import { useLiveLibraryOrders } from "./library-live-store";

export function StudentLibraryOrders() {
  const isLoading = usePageLoading();
  const orders = useLiveLibraryOrders();

  if (isLoading) return <LibraryListSkeleton />;

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <LibraryPanel className="text-center text-sm text-muted-foreground">
          No orders yet. Visit the shop to make your first purchase.
        </LibraryPanel>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={orderHref(order.id)}
                className="block rounded-[18px] border border-border bg-card p-4 shadow-float transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{order.lines.map((line) => line.title).join(", ")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.date} · {order.id} · {order.status}
                    </p>
                  </div>
                  <p className="font-bold text-brand-purple">{formatLibraryPrice(order.amount)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
