"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LibraryPaySteps } from "./library-pay-steps";
import {
  bookReadHref,
  formatLibraryPrice,
  getOrderById,
  libraryHref,
  orderHref,
  orderReceiptHref,
} from "./library-data";
import { LibraryPanel } from "./library-ui";
import { LibraryListSkeleton } from "./library-skeleton";
import { getOrderByIdLive } from "./library-live-store";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const isLoading = usePageLoading();
  const order = orderId ? getOrderByIdLive(orderId) ?? getOrderById(orderId) : undefined;
  const digitalLine = order?.lines.find((line) => line.bookId);

  if (isLoading) return <LibraryListSkeleton />;

  if (!order) {
    return (
      <LibraryPanel className="text-center">
        <h2 className="text-lg font-bold">Order not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This confirmation link may have expired.</p>
        <Button asChild className="mt-4 rounded-full" variant="outline">
          <Link href={libraryHref()}>Back to library</Link>
        </Button>
      </LibraryPanel>
    );
  }

  return (
    <div className="space-y-5">
      <LibraryPanel>
        <LibraryPaySteps currentStep={3} />
      </LibraryPanel>

      <LibraryPanel className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green" />
        <h2 className="mt-4 text-2xl font-bold">Payment successful</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Order {order.id} · {formatLibraryPrice(order.amount)} paid
        </p>
        {digitalLine?.bookId ? (
          <p className="mt-2 text-sm text-primary">Digital access is unlocked — start reading now.</p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">We will notify you when your order is ready for pickup.</p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {digitalLine?.bookId ? (
            <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
              <Link href={bookReadHref(digitalLine.bookId)}>Start reading</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-full">
            <Link href={orderHref(order.id)}>View order</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={orderReceiptHref(order.id)}>View receipt</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={libraryHref("my-books")}>My shelf</Link>
          </Button>
        </div>
      </LibraryPanel>
    </div>
  );
}

export function StudentLibraryPayConfirmation() {
  return (
    <Suspense fallback={<LibraryListSkeleton />}>
      <ConfirmationContent />
    </Suspense>
  );
}
