"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useStudentLibraryBook, type LibraryBookDetail } from "@/hooks/use-dashboard-data";
import { bookHref, bookReadHref } from "./library-data";
import { LibraryDetailSkeleton } from "./library-skeleton";
import { setReadingProgress, useLibraryShelf } from "./library-live-store";

const EMPTY_BOOK: LibraryBookDetail | null = null;

function ReaderContent({ bookId }: { bookId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shelf = useLibraryShelf();
  const isLoading = usePageLoading();
  const { data: book } = useStudentLibraryBook(bookId, EMPTY_BOOK);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chapterId = searchParams.get("chapter") ?? book?.chapters[0]?.id;
  const chapterIndex = useMemo(
    () => book?.chapters.findIndex((c) => c.id === chapterId) ?? -1,
    [book, chapterId],
  );
  const chapter = chapterIndex >= 0 ? book?.chapters[chapterIndex] : undefined;

  const previous = book && chapterIndex > 0 ? book.chapters[chapterIndex - 1] : null;
  const next = book && chapterIndex >= 0 && chapterIndex < book.chapters.length - 1 ? book.chapters[chapterIndex + 1] : null;
  const progress = book ? Math.round(((chapterIndex + 1) / book.chapters.length) * 100) : 0;

  useEffect(() => {
    if (chapter) {
      setReadingProgress(bookId, progress, chapter.id);
    }
  }, [bookId, progress, chapter]);

  if (isLoading) return <LibraryDetailSkeleton />;
  if (!book) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-muted/60">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Book not found</h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          This book may have been removed or the link is invalid.
        </p>
        <Button asChild variant="outline" className="mt-8 rounded-full">
          <Link href={bookHref(bookId)}>Back to book</Link>
        </Button>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-muted/60">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h2 className="mt-8 text-2xl font-bold text-foreground">No chapters available</h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          This book doesn&apos;t have any chapters yet. Content is being added.
        </p>
        <Button asChild variant="outline" className="mt-8 rounded-full">
          <Link href={bookHref(bookId)}>Back to book</Link>
        </Button>
      </div>
    );
  }

  function goToChapter(targetId: string) {
    router.push(bookReadHref(bookId, targetId), { scroll: false });
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl">
      <nav className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={bookHref(bookId)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{book.title}</p>
              <p className="truncate text-xs text-muted-foreground">{book.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Contents</span>
            </button>
          </div>
        </div>

        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-brand-purple transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </nav>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-bold">Table of Contents</h2>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {book.chapters.map((ch, index) => {
                const isActive = ch.id === chapterId;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => goToChapter(ch.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-brand-purple/10 font-semibold text-brand-purple"
                        : "text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isActive ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="min-w-0 truncate">{ch.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <article className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold text-brand-purple">
              <BookOpen className="h-3 w-3" />
              Chapter {chapterIndex + 1} of {book.chapters.length}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{chapter.title}</h1>
          </div>

          <div className="prose prose-lg prose-stone dark:prose-invert max-w-none">
            {chapter.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="leading-relaxed text-foreground/85">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-16 border-t border-border pt-8">
            <div className="flex items-center justify-between gap-4">
              {previous ? (
                <button
                  type="button"
                  onClick={() => goToChapter(previous.id)}
                  className="group flex items-center gap-3 rounded-2xl border border-border/60 px-5 py-3 text-left transition-all hover:border-brand-purple/40 hover:bg-brand-purple/5 hover:shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-x-0.5 group-hover:text-brand-purple" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Previous</p>
                    <p className="truncate text-sm font-semibold">{previous.title}</p>
                  </div>
                </button>
              ) : (
                <div />
              )}

              {next ? (
                <button
                  type="button"
                  onClick={() => goToChapter(next.id)}
                  className="group flex items-center gap-3 rounded-2xl border border-border/60 px-5 py-3 text-right transition-all hover:border-brand-purple/40 hover:bg-brand-purple/5 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Next</p>
                    <p className="truncate text-sm font-semibold">{next.title}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-purple" />
                </button>
              ) : (
                <Link
                  href={bookHref(bookId)}
                  className="group flex items-center gap-3 rounded-2xl border border-green/40 bg-green/5 px-5 py-3 transition-all hover:bg-green/10 hover:shadow-sm"
                >
                  <div className="min-w-0 text-right">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-green">Finished</p>
                    <p className="text-sm font-semibold">Back to book</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>
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
