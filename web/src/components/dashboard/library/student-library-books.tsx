"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useStudentLibraryBooks, type LibraryBookItem } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { LibraryBookCard } from "./library-book-card";
import { booksHref } from "./library-data";
import { LibraryListSkeleton } from "./library-skeleton";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
] as const;

const EMPTY_BOOKS: LibraryBookItem[] = [];

function LibraryBooksContent() {
  const searchParams = useSearchParams();
  const filter = (searchParams.get("access") ?? "all") as (typeof FILTERS)[number]["id"];
  const isLoading = usePageLoading();
  const { data } = useStudentLibraryBooks(EMPTY_BOOKS);
  const allBooks = data ?? EMPTY_BOOKS;

  const books = useMemo(() => {
    if (filter === "free") return allBooks.filter((b) => b.access === "free");
    if (filter === "paid") return allBooks.filter((b) => b.access === "paid");
    return allBooks;
  }, [allBooks, filter]);

  if (isLoading) return <LibraryListSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const href = item.id === "all" ? booksHref() : booksHref({ access: item.id });
          const isActive = filter === item.id;
          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {books.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-border/60 bg-muted/20 px-12 py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/60">
            <svg className="h-10 w-10 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="mt-6 text-2xl font-bold text-foreground">No {filter !== "all" ? filter : ""} books found</p>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
            {filter !== "all"
              ? `There are no ${filter} books in the catalog right now. Try a different filter.`
              : "The catalog is empty. Books will appear here once added to the library."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-4">
          {books.map((book) => (
            <LibraryBookCard
              key={book.id}
              book={{
                ...book,
                image: book.coverImage ?? "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
                coverTone: book.coverTone ?? "from-violet-200 via-purple-100 to-fuchsia-100",
              }}
              showProgress
            />
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
