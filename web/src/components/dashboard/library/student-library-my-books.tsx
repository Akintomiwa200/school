"use client";

import Link from "next/link";
import { BookMarked, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useStudentLibrary, useStudentLibraryBooks, type StudentLibraryData, type LibraryBookItem } from "@/hooks/use-dashboard-data";
import { bookHref, bookReadHref } from "./library-data";
import { LibraryBookCard } from "./library-book-card";
import { LibraryPanel } from "./library-ui";
import { LibraryListSkeleton } from "./library-skeleton";
import { useLibraryShelf } from "./library-live-store";

const EMPTY_LIBRARY: StudentLibraryData = { myBooks: [], availableBooks: [] };
const EMPTY_BOOKS: LibraryBookItem[] = [];

export function StudentLibraryMyBooks() {
  const isLoading = usePageLoading();
  const shelf = useLibraryShelf();
  const { data: libraryData } = useStudentLibrary(EMPTY_LIBRARY);
  const { data: booksData } = useStudentLibraryBooks(EMPTY_BOOKS);
  const apiData = libraryData ?? EMPTY_LIBRARY;
  const allBooks = booksData ?? EMPTY_BOOKS;

  if (isLoading) return <LibraryListSkeleton />;

  const ownedFromApi = apiData.myBooks.filter((b) => !b.isReturned);
  const ownedBookIds = new Set([...shelf.ownedBookIds, ...ownedFromApi.map((b) => b.id)]);

  const owned = allBooks.filter(
    (book) => book.access === "free" || ownedBookIds.has(book.id),
  );
  const bookmarked = allBooks.filter((book) => shelf.bookmarkedIds.includes(book.id));
  const inProgress = allBooks.filter(
    (book) => (shelf.readingProgress[book.id] ?? 0) > 0,
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

      {apiData.myBooks.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Borrowed from library</h2>
          <div className="space-y-2">
            {apiData.myBooks.map((book) => (
              <div
                key={book.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium">{book.bookTitle}</p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {book.isReturned ? (
                    <span className="rounded-full bg-green/15 px-2.5 py-1 font-semibold text-green">Returned</span>
                  ) : book.isOverdue ? (
                    <span className="rounded-full bg-destructive/15 px-2.5 py-1 font-semibold text-destructive">Overdue{book.fine ? ` — $${book.fine}` : ""}</span>
                  ) : (
                    <span className="rounded-full bg-brand-blue/15 px-2.5 py-1 font-semibold text-brand-blue">Due {new Date(book.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold">Accessible titles</h2>
        {owned.length === 0 ? (
          <LibraryPanel className="border-dashed py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
              <BookOpen className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="mt-5 text-lg font-semibold text-foreground">No accessible titles</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Free books are available immediately; paid titles unlock after purchase.
            </p>
            <Button asChild variant="outline" className="mt-5 rounded-full">
              <Link href="/student/library/books">Browse catalog</Link>
            </Button>
          </LibraryPanel>
        ) : (
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-4">
            {owned.map((book) => (
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
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <BookMarked className="h-5 w-5 text-brand-blue" />
          Bookmarked
        </h2>
        {bookmarked.length === 0 ? (
          <LibraryPanel className="border-dashed py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
              <BookMarked className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="mt-5 text-lg font-semibold text-foreground">No bookmarks yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Bookmark books from the catalog to find them quickly later.
            </p>
          </LibraryPanel>
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
          <LibraryPanel className="border-dashed py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
              <BookOpen className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="mt-5 text-lg font-semibold text-foreground">No books in progress</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Start reading a book to track your progress here.
            </p>
          </LibraryPanel>
        ) : (
          <ul className="space-y-2">
            {inProgress.map((book) => {
              const progress = shelf.readingProgress[book.id] ?? 0;
              return (
                <li key={book.id}>
                  <div className="rounded-xl border border-border px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{progress}% complete</p>
                      </div>
                      <Button asChild size="sm" className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                        <Link href={bookReadHref(book.id)}>Continue</Link>
                      </Button>
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
