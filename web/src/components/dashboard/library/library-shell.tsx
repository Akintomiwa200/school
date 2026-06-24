"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryPanel } from "./library-ui";
import { libraryHref, payHref } from "./library-data";

type StudentLibraryShellProps = {
  children: React.ReactNode;
  showActions?: boolean;
  standalone?: boolean;
};

export function StudentLibraryShell({
  children,
  showActions = true,
  standalone = false,
}: StudentLibraryShellProps) {
  const pathname = usePathname();

  const isStandalonePage =
    standalone ||
    pathname.startsWith("/student/library/pay") ||
    pathname.match(/\/student\/library\/books\/[^/]+$/) != null ||
    pathname.includes("/read") ||
    pathname.match(/\/student\/library\/orders\/[^/]+/) != null;

  const isHome = pathname === "/student/library";

  const pageTitle = (() => {
    if (pathname.startsWith("/student/library/pay/confirmation")) return "Order confirmed";
    if (pathname.startsWith("/student/library/pay/checkout")) return "Payment gateway";
    if (pathname.startsWith("/student/library/pay")) return "Checkout";
    if (pathname.includes("/receipt")) return "Receipt";
    if (pathname.includes("/read")) return "Reader";
    if (pathname.match(/\/student\/library\/books\/[^/]+$/)) return "Book details";
    if (pathname.startsWith("/student/library/books")) return "Browse catalog";
    if (pathname.startsWith("/student/library/my-books")) return "My shelf";
    if (pathname.match(/\/student\/library\/shop\/[^/]+$/)) return "Shop item";
    if (pathname.startsWith("/student/library/shop")) return "Shop";
    if (pathname.match(/\/student\/library\/orders\/[^/]+$/)) return "Order details";
    if (pathname.startsWith("/student/library/orders")) return "Orders";
    if (pathname.startsWith("/student/library/achievements")) return "Achievements";
    return "Library";
  })();

  const pageDescription = (() => {
    if (pathname.startsWith("/student/library/pay/confirmation")) {
      return "Your purchase was successful. Start reading or view your receipt.";
    }
    if (pathname.startsWith("/student/library/pay/checkout")) {
      return "Complete your payment through the secure gateway.";
    }
    if (pathname.startsWith("/student/library/pay")) return "Review items and continue to checkout.";
    if (pathname.includes("/receipt")) return "Official receipt for your library purchase.";
    if (pathname.includes("/read")) return "Continue reading where you left off.";
    if (pathname.match(/\/student\/library\/books\/[^/]+$/)) {
      return "Preview, purchase, or start reading this title.";
    }
    if (pathname.startsWith("/student/library/books")) {
      return "Discover free and paid titles across popular and ongoing collections.";
    }
    if (pathname.startsWith("/student/library/my-books")) {
      return "Owned titles, bookmarks, and books in progress.";
    }
    if (pathname.startsWith("/student/library/shop")) return "Physical kits, bundles, and digital editions.";
    if (pathname.startsWith("/student/library/orders")) return "Your library purchase history.";
    if (pathname.startsWith("/student/library/achievements")) return "Reading goals and progress badges.";
    return "Digital books, shop items, and reading achievements.";
  })();

  return (
    <div className="space-y-6">
      {!isHome || isStandalonePage ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {pageTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{pageDescription}</p>
          </div>
          {showActions && !isStandalonePage ? (
            <div className="flex items-center gap-2">
              <Button
                asChild
                className="h-9 shrink-0 rounded-full bg-brand-purple px-4 text-sm font-semibold text-white hover:bg-brand-purple/90"
              >
                <Link href={libraryHref("shop")}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-9 shrink-0 rounded-full px-4">
                <Link href={payHref()}>Checkout</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!isStandalonePage ? (
        <>
          {!isHome ? (
            <LibraryPanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Digital library
                </p>
                <h2 className="mt-1 text-lg font-bold">Spring 2026 collection</h2>
                <p className="mt-1 text-sm text-muted-foreground">Free access and paid editions</p>
              </div>
              <p className="text-sm text-muted-foreground">Read online · Order print & bundles</p>
            </LibraryPanel>
          ) : null}
        </>
      ) : null}

      {children}
    </div>
  );
}
