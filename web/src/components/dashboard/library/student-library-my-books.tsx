"use client";

import Link from "next/link";
import { BookMarked, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  bookHref,
  bookReadHref,
  canReadBook,
  getAllBooks,
} from "./library-data";
import { LibraryBookCard } from "./library-book-card";
import { LibraryPanel } from "./library-ui";
import { LibraryListSkeleton } from "./library-skeleton";
import { useLibraryShelf } from "./library-live-store";

export function StudentLibraryMyBooks() {
  const isLoading = usePageLoading();
  const shelf = useLibraryShelf();

  if (isLoading) return <LibraryListSkeleton />;

  const allBooks = getAllBooks();
  const owned = allBooks.filter(
    (book) => book.access === "free" || shelf.ownedBookIds.includes(book.id),
  );
  const bookmarked = allBooks.filter((book) => shelf.bookmarkedIds.includes(book.id));
  const inProgress = allBooks.filter(
    (book) => (shelf.readingProgress[book.id] ?? book.readingProgress ?? 0) > 0,
  );

  return (
    <div className="space-y-8">
      <LibraryPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">Your shelf at a glance</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {owned.length} accessible · {bookmarked.length} bookmarked · {inProgress.length} in progress
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/student/library/books">Browse catalog</Link>
          </Button>
        </div>
      </LibraryPanel>

      <section>
        <h2 className="mb-4 text-lg font-bold">Accessible titles</h2>
        {owned.length === 0 ? (
          <LibraryPanel className="text-sm text-muted-foreground">
            No owned titles yet. Free books are available immediately; paid titles unlock after purchase.
          </LibraryPanel>
        ) : (
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-4">
            {owned.map((book) => (
              <LibraryBookCard key={book.id} book={book} showProgress />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <BookMarked className="h-5 w-5 text-brand-blue" />
          Bookmarked
        </h2>
        {bookmarked.length === 0 ? (
          <LibraryPanel className="text-sm text-muted-foreground">No bookmarks yet.</LibraryPanel>
        ) : (
          <ul className="space-y-2">
            {bookmarked.map((book) => (
              <li key={book.id}>
                <Link
                  href={bookHref(book.id)}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                >
                  <span className="font-medium">{book.title}</span>
                  <span className="text-muted-foreground">{book.author}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <BookOpen className="h-5 w-5 text-primary" />
          Continue reading
        </h2>
        {inProgress.length === 0 ? (
          <LibraryPanel className="text-sm text-muted-foreground">Start a book to track progress here.</LibraryPanel>
        ) : (
          <ul className="space-y-2">
            {inProgress.map((book) => {
              const progress = shelf.readingProgress[book.id] ?? book.readingProgress ?? 0;
              const readable = canReadBook(book.id, shelf.ownedBookIds);
              return (
                <li key={book.id}>
                  <div className="rounded-xl border border-border px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{progress}% complete</p>
                      </div>
                      {readable ? (
                        <Button asChild size="sm" className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                          <Link href={bookReadHref(book.id)}>Continue</Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="outline" className="rounded-full">
                          <Link href={bookHref(book.id)}>Unlock</Link>
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
