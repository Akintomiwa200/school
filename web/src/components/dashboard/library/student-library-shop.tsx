"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useLibraryShopItems } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { formatLibraryPrice, payHref, shopHref } from "./library-data";
import { LibraryPanel } from "./library-ui";
import { LibraryListSkeleton } from "./library-skeleton";

export function StudentLibraryShop() {
  const isLoading = usePageLoading();
  const { data: items } = useLibraryShopItems([]);

  if (isLoading) return <LibraryListSkeleton />;

  return (
    <div className="space-y-4">
      <LibraryPanel>
        <p className="text-sm text-muted-foreground">
          Order physical kits, digital editions, and bundles. Digital purchases unlock reader access instantly.
        </p>
      </LibraryPanel>
      {items.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-border/60 bg-muted/20 px-12 py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/60">
            <span className="text-4xl">🛒</span>
          </div>
          <p className="mt-6 text-2xl font-bold text-foreground">No shop items available</p>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
            New items will be added to the shop soon. Check back later.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={shopHref(item.id)}
                className="flex items-center gap-3 rounded-[18px] bg-card p-3 shadow-float ring-1 ring-border transition-colors hover:bg-muted/30"
              >
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-[26px] shadow-inner",
                    item.thumbTone,
                  )}
                >
                  <span aria-hidden>{item.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                    {item.rating.toFixed(1)}
                    <span className="capitalize">· {item.format}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-brand-purple">{formatLibraryPrice(item.price)}</p>
                  <span className="text-xs font-semibold text-primary">View</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="text-center text-sm text-muted-foreground">
        Ready to buy?{" "}
        <Link href={payHref()} className="font-medium text-brand-purple hover:underline">
          Go to checkout
        </Link>
      </p>
    </div>
  );
}
