"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useStudentLibraryBook, type LibraryBookDetail } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { bookReadHref, booksHref, libraryHref, formatLibraryPrice } from "./library-data";
import { LibraryBackLink, LibraryPanel } from "./library-ui";
import { LibraryDetailSkeleton } from "./library-skeleton";
import { getReadingProgress, isBookOwned, useLibraryShelf } from "./library-live-store";

const EMPTY_BOOK: LibraryBookDetail | null = null;

export function StudentLibraryBookDetail({ bookId }: { bookId: string }) {
  const isLoading = usePageLoading();
  const shelf = useLibraryShelf();
  const { data: book } = useStudentLibraryBook(bookId, EMPTY_BOOK);

  if (isLoading) return <LibraryDetailSkeleton />;
  if (!book) {
    return (
      <div className="space-y-5">
        <LibraryBackLink href={booksHref()}>← Back to catalog</LibraryBackLink>
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-[24px] border border-dashed border-border/60 bg-muted/20 px-12 py-20 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-muted/60">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h2 className="mt-8 text-2xl font-bold text-foreground">Book not found</h2>
          <p className="mx-auto mt-3 text-base leading-relaxed text-muted-foreground">
            This book may have been removed or the link is invalid.
          </p>
          <Button asChild variant="outline" className="mt-8 rounded-full">
            <Link href={booksHref()}>Browse catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const owned = isBookOwned(bookId) || shelf.ownedBookIds.includes(bookId);
  const readable = book.access === "free" || owned;
  const progress = getReadingProgress(bookId) ?? 0;

  return (
    <div className="space-y-5">
      <LibraryBackLink href={booksHref()}>← Back to catalog</LibraryBackLink>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <LibraryPanel className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div
              className={cn(
                "relative mx-auto aspect-[3/4] w-full max-w-[220px] shrink-0 overflow-hidden rounded-[24px] bg-gradient-to-br p-3 sm:mx-0",
                book.coverTone ?? "from-violet-200 via-purple-100 to-fuchsia-100",
              )}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[18px]">
                <Image
                  src={book.coverImage ?? "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80"}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase",
                  book.access === "free" ? "bg-green/15 text-green" : "bg-brand-purple/15 text-brand-purple",
                )}
              >
                {book.access === "free" ? "Free" : book.price ? `Paid · ${formatLibraryPrice(book.price)}` : "Paid"}
              </span>
              <h2 className="mt-3 text-2xl font-bold">{book.title}</h2>
              {book.description && <p className="mt-2 text-sm text-muted-foreground">{book.description}</p>}
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Author</dt>
                  <dd className="font-medium">{book.author}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Format</dt>
                  <dd className="font-medium">{book.format}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Pages</dt>
                  <dd className="font-medium">{book.pages}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Chapters</dt>
                  <dd className="font-medium">{book.chapters.length}</dd>
                </div>
              </dl>
              {progress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Reading progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {readable ? (
              <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                <Link href={bookReadHref(bookId)}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  {progress > 0 ? "Continue reading" : "Read now"}
                </Link>
              </Button>
            ) : (
              <Button disabled className="rounded-full" variant="outline">
                <Lock className="mr-2 h-4 w-4" />
                Locked
              </Button>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold">Chapters</h3>
            <ul className="mt-3 space-y-2">
              {book.chapters.map((chapter, index) => (
                <li key={chapter.id}>
                  {readable ? (
                    <Link
                      href={bookReadHref(bookId, chapter.id)}
                      className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                    >
                      <span>
                        {index + 1}. {chapter.title}
                      </span>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground">
                      <span>
                        {index + 1}. {chapter.title}
                      </span>
                      <Lock className="h-4 w-4" />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </LibraryPanel>

        <LibraryPanel>
          <h3 className="text-sm font-bold">Access</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {book.access === "free"
              ? "This title is free for all students. Read online anytime."
              : owned
                ? "You own this title. It is available in My shelf."
                : "Purchase digital access to unlock the reader and all chapters."}
          </p>
          {book.access === "paid" && book.price && !owned && (
            <p className="mt-3 text-lg font-bold text-brand-purple">{formatLibraryPrice(book.price)}</p>
          )}
        </LibraryPanel>
      </div>
    </div>
  );
}
