"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  bookHref,
  formatLibraryPrice,
  getBookById,
  getSaleItemById,
  payHref,
  shopHref,
} from "./library-data";
import { LibraryBackLink, LibraryPanel } from "./library-ui";
import { LibraryDetailSkeleton } from "./library-skeleton";

export function StudentLibraryShopItem({ itemId }: { itemId: string }) {
  const isLoading = usePageLoading();
  const item = getSaleItemById(itemId);
  const linkedBook = item?.bookId ? getBookById(item.bookId) : undefined;

  if (!item) return null;
  if (isLoading) return <LibraryDetailSkeleton />;

  return (
    <div className="space-y-5">
      <LibraryBackLink href={shopHref()}>← Back to shop</LibraryBackLink>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <LibraryPanel className="space-y-5">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div
              className={cn(
                "flex h-32 w-32 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br text-5xl shadow-inner",
                item.thumbTone,
              )}
            >
              <span aria-hidden>{item.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{item.format}</p>
              <h2 className="mt-1 text-2xl font-bold">{item.title}</h2>
              <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {item.rating.toFixed(1)} rating
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          </div>

          {linkedBook ? (
            <div className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="relative h-16 w-12 overflow-hidden rounded-lg">
                <Image src={linkedBook.image} alt="" fill className="object-cover" sizes="48px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Includes digital book</p>
                <p className="font-medium">{linkedBook.title}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href={bookHref(linkedBook.id)}>
                  <BookOpen className="mr-1 h-4 w-4" />
                  Preview
                </Link>
              </Button>
            </div>
          ) : null}

          <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
            <Link href={payHref(item.id)}>Order · {formatLibraryPrice(item.price)}</Link>
          </Button>
        </LibraryPanel>

        <LibraryPanel>
          <h3 className="text-sm font-bold">What you get</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {item.format === "digital" ? (
              <>
                <li>Instant reader access after payment</li>
                <li>All chapters unlocked</li>
                <li>Added to My shelf</li>
              </>
            ) : item.format === "physical" ? (
              <>
                <li>Shipped to school pickup desk</li>
                <li>Order tracking in Orders</li>
                <li>Receipt available after payment</li>
              </>
            ) : (
              <>
                <li>Physical kit + digital companion</li>
                <li>Digital access unlocks immediately</li>
                <li>Pickup notification when ready</li>
              </>
            )}
          </ul>
          <p className="mt-4 text-xl font-bold text-brand-purple">{formatLibraryPrice(item.price)}</p>
        </LibraryPanel>
      </div>
    </div>
  );
}
