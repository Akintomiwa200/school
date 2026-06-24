"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  bookHref,
  bookReadHref,
  canReadBook,
  getBookById,
  payHref,
  getSaleItemForBook,
} from "./library-data";
import { LibraryBackLink, LibraryPanel } from "./library-ui";
import { LibraryDetailSkeleton } from "./library-skeleton";
import { setReadingProgress, useLibraryShelf } from "./library-live-store";

function ReaderContent({ bookId }: { bookId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shelf = useLibraryShelf();
  const isLoading = usePageLoading();
  const book = getBookById(bookId);

  const chapterId = searchParams.get("chapter") ?? book?.chapters[0]?.id;
  const chapterIndex = useMemo(
    () => book?.chapters.findIndex((chapter) => chapter.id === chapterId) ?? -1,
    [book, chapterId],
  );
  const chapter = chapterIndex >= 0 ? book?.chapters[chapterIndex] : undefined;

  if (!book) return null;
  if (isLoading) return <LibraryDetailSkeleton />;

  const readable = canReadBook(bookId, shelf.ownedBookIds);
  if (!readable) {
    const sale = getSaleItemForBook(bookId);
    return (
      <LibraryPanel className="text-center">
        <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-bold">This book requires purchase</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Buy digital access to unlock the reader for &ldquo;{book.title}&rdquo;.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
            <Link href={payHref(sale?.id)}>Buy access</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={bookHref(bookId)}>Back to book</Link>
          </Button>
        </div>
      </LibraryPanel>
    );
  }

  if (!chapter) {
    return (
      <LibraryPanel className="text-center">
        <h2 className="text-lg font-bold">Chapter not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={bookHref(bookId)}>Back to book</Link>
        </Button>
      </LibraryPanel>
    );
  }

  const previous = chapterIndex > 0 ? book.chapters[chapterIndex - 1] : null;
  const next = chapterIndex < book.chapters.length - 1 ? book.chapters[chapterIndex + 1] : null;
  const progress = Math.round(((chapterIndex + 1) / book.chapters.length) * 100);

  function goToChapter(targetId: string) {
    if (!book) return;
    const targetIndex = book.chapters.findIndex((item) => item.id === targetId);
    const targetProgress = Math.round(((targetIndex + 1) / book.chapters.length) * 100);
    setReadingProgress(bookId, targetProgress, targetId);
    router.push(bookReadHref(bookId, targetId));
  }

  useEffect(() => {
    setReadingProgress(bookId, progress, chapter.id);
  }, [bookId, progress, chapter.id]);

  return (
    <div className="space-y-5">
      <LibraryBackLink href={bookHref(bookId)}>← Back to {book.title}</LibraryBackLink>

      <LibraryPanel className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Chapter {chapterIndex + 1} of {book.chapters.length}
          </p>
          <h2 className="mt-1 text-2xl font-bold">{chapter.title}</h2>
        </div>
        <article className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
          {chapter.content}
        </article>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          {previous ? (
            <Button variant="outline" className="rounded-full" onClick={() => goToChapter(previous.id)}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" onClick={() => goToChapter(next.id)}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={bookHref(bookId)}>Finish</Link>
            </Button>
          )}
        </div>
      </LibraryPanel>
    </div>
  );
}

export function StudentLibraryReader({ bookId }: { bookId: string }) {
  return (
    <Suspense fallback={<LibraryDetailSkeleton />}>
      <ReaderContent bookId={bookId} />
    </Suspense>
  );
}
