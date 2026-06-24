"use client";

import Image from "next/image";
import Link from "next/link";
import { BookMarked, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  bookHref,
  type LibraryBook,
} from "./library-data";
import {
  isBookmarked,
  isLiked,
  toggleBookmark,
  toggleLike,
  useLibraryShelf,
} from "./library-live-store";

export function LibraryBookCard({ book, showProgress }: { book: LibraryBook; showProgress?: boolean }) {
  const shelf = useLibraryShelf();
  const bookmarked = isBookmarked(book.id) || shelf.bookmarkedIds.includes(book.id);
  const liked = isLiked(book.id) || shelf.likedIds.includes(book.id);
  const progress = shelf.readingProgress[book.id] ?? book.readingProgress ?? 0;

  return (
    <article className="w-full min-w-0">
      <Link href={bookHref(book.id)} className="group block">
        <div
          className={cn(
            "relative aspect-square w-full overflow-hidden rounded-[24px] bg-gradient-to-br p-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-transform group-hover:scale-[1.01] sm:p-3.5",
            book.coverTone,
          )}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-white/25">
            <Image
              src={book.image}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
          </div>
          <div className="absolute left-3 top-3">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                book.access === "free" ? "bg-green/90 text-white" : "bg-brand-purple/90 text-white",
              )}
            >
              {book.access === "free" ? "Free" : "Paid"}
            </span>
          </div>
          {showProgress && progress > 0 ? (
            <div className="absolute inset-x-3 bottom-14">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/40">
                <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : null}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between sm:inset-x-3.5 sm:bottom-3.5">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                toggleBookmark(book.id);
              }}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/90 shadow-sm backdrop-blur-sm transition-colors",
                bookmarked ? "text-brand-blue" : "text-muted-foreground",
              )}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <BookMarked className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                toggleLike(book.id);
              }}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/90 shadow-sm backdrop-blur-sm transition-colors",
                liked ? "text-brand-pink" : "text-muted-foreground",
              )}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            </button>
          </div>
        </div>
        <h3 className="mt-4 text-[15px] font-bold leading-snug text-foreground group-hover:text-primary sm:text-base">
          {book.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{book.description}</p>
      </Link>
    </article>
  );
}
