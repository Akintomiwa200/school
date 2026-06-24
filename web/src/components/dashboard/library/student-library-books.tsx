"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { LibraryBookCard } from "./library-book-card";
import {
  booksHref,
  getAllBooks,
  getBooksByCategory,
  getFreeBooks,
  getPaidBooks,
  type BookCategory,
} from "./library-data";
import { LibraryListSkeleton } from "./library-skeleton";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular" },
  { id: "ongoing", label: "Ongoing" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
] as const;

function LibraryBooksContent() {
  const searchParams = useSearchParams();
  const filter = (searchParams.get("access") ?? searchParams.get("category") ?? "all") as
    | (typeof FILTERS)[number]["id"]
    | BookCategory;
  const isLoading = usePageLoading();

  const books = (() => {
    if (filter === "free") return getFreeBooks();
    if (filter === "paid") return getPaidBooks();
    if (filter === "popular" || filter === "ongoing") return getBooksByCategory(filter);
    return getAllBooks();
  })();

  if (isLoading) return <LibraryListSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const href =
            item.id === "free" || item.id === "paid"
              ? booksHref({ access: item.id })
              : item.id === "all"
                ? booksHref()
                : booksHref({ category: item.id });
          const isActive = filter === item.id;

          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-purple text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {books.length === 0 ? (
        <p className="text-sm text-muted-foreground">No books match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-4">
          {books.map((book) => (
            <LibraryBookCard key={book.id} book={book} showProgress />
          ))}
        </div>
      )}
    </div>
  );
}

export function StudentLibraryBooks() {
  return (
    <Suspense fallback={<LibraryListSkeleton />}>
      <LibraryBooksContent />
    </Suspense>
  );
}
