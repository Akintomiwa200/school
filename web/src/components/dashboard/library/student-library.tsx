"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Glasses, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { LibraryBookCard } from "./library-book-card";
import {
  BEST_SALES,
  booksHref,
  formatLibraryPrice,
  libraryHref,
  ONGOING_BOOKS,
  payHref,
  POPULAR_BOOKS,
  READING_ACHIEVEMENTS,
  shopHref,
} from "./library-data";
import { LibraryPanel } from "./library-ui";
import { LibrarySkeleton } from "./library-skeleton";
import Image from "next/image";

function LibraryHeroBooksLeft() {
  return (
    <div className="relative hidden h-[148px] w-[132px] shrink-0 lg:block" aria-hidden>
      <div className="absolute bottom-0 left-1/2 h-7 w-[104px] -translate-x-1/2 rounded-[5px] bg-gradient-to-b from-orange-300 to-orange-500 shadow-[0_8px_16px_rgba(0,0,0,0.15)]" />
      <div className="absolute bottom-[26px] left-1/2 h-7 w-[104px] -translate-x-1/2 rounded-[5px] bg-gradient-to-b from-violet-400 to-violet-600 shadow-[0_8px_16px_rgba(0,0,0,0.12)]" />
      <div className="absolute bottom-[52px] left-1/2 h-7 w-[104px] -translate-x-1/2 rounded-[5px] bg-gradient-to-b from-emerald-300 to-emerald-500 shadow-[0_8px_16px_rgba(0,0,0,0.12)]" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <Glasses className="h-11 w-11 text-amber-200 drop-shadow-md" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function LibraryHeroShelfRight() {
  return (
    <div className="relative hidden h-[148px] w-[132px] shrink-0 lg:block" aria-hidden>
      <div className="absolute bottom-0 left-1/2 h-3 w-[118px] -translate-x-1/2 rounded-sm bg-gradient-to-b from-amber-600 to-amber-800 shadow-md" />
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-end gap-1.5">
        <div className="h-14 w-5 rounded-sm bg-gradient-to-b from-violet-300 to-violet-500 shadow-sm" />
        <div className="h-[68px] w-6 rounded-sm bg-gradient-to-b from-orange-200 to-orange-400 shadow-sm" />
        <div className="h-12 w-5 rounded-sm bg-gradient-to-b from-sky-200 to-sky-400 shadow-sm" />
        <div className="h-16 w-5 rounded-sm bg-gradient-to-b from-fuchsia-300 to-fuchsia-500 shadow-sm" />
        <div className="h-10 w-4 rounded-sm bg-gradient-to-b from-white/90 to-slate-200 shadow-sm" />
      </div>
    </div>
  );
}

function LibraryHero({ name }: { name: string }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-purple via-primary to-brand-blue px-5 py-10 text-white shadow-[0_16px_40px_rgba(88,101,242,0.25)] sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      <div className="relative flex min-h-[180px] flex-col items-center justify-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6 xl:gap-10">
        <LibraryHeroBooksLeft />
        <div className="w-full min-w-[min(100%,36rem)] max-w-3xl shrink-0 px-2 text-center text-white lg:mx-auto">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight sm:text-[34px] lg:text-[36px]">
            Hi, {name}
          </h1>
          <p className="mx-auto mt-4 max-w-[34rem] text-pretty text-[18px] font-normal leading-[1.7] sm:text-[20px]">
            The library serves as a welcoming home for knowledge seekers and avid readers alike
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-7 h-11 shrink-0 rounded-full border-white/70 bg-transparent px-8 text-base font-medium text-white hover:bg-white/15 hover:text-white"
          >
            <Link href={booksHref()}>Browse catalog</Link>
          </Button>
        </div>
        <LibraryHeroShelfRight />
      </div>
    </section>
  );
}

function BookSection({ title, books, viewAllHref }: { title: string; books: typeof POPULAR_BOOKS; viewAllHref: string }) {
  return (
    <section className="min-w-0">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <Link
          href={viewAllHref}
          className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {books.map((book) => (
          <LibraryBookCard key={book.id} book={book} showProgress />
        ))}
      </div>
    </section>
  );
}

function SegmentedProgress({ progress }: { progress: number }) {
  const filled = Math.min(3, Math.max(0, Math.round((progress / 100) * 3)));
  return (
    <div className="flex min-w-0 flex-1 gap-1.5">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className={cn("h-2 flex-1 rounded-full", index < filled ? "bg-primary" : "bg-muted")} />
      ))}
    </div>
  );
}

function AchievementWidget() {
  const [enabled, setEnabled] = useState(true);
  return (
    <LibraryPanel>
      <div className="flex items-center justify-between gap-3">
        <Link href={libraryHref("achievements")} className="text-base font-bold text-foreground hover:text-primary">
          Unlocks achievement
        </Link>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((value) => !value)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
            enabled ? "bg-primary" : "bg-muted",
          )}
        >
          <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", enabled ? "translate-x-5" : "translate-x-0")} />
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Goal achieved success unlocked.</p>
      <div className={cn("mt-6 space-y-6 transition-opacity", !enabled && "opacity-45")}>
        {READING_ACHIEVEMENTS.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
              <Image src={item.avatarUrl} alt="" fill className="object-cover" sizes="44px" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <SegmentedProgress progress={item.progress} />
                <p className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">{item.daysLeft} Days left</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-primary">{item.progress}% Achieved</p>
            </div>
          </div>
        ))}
      </div>
    </LibraryPanel>
  );
}

function BestSalesWidget() {
  return (
    <LibraryPanel>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">Best sales</h2>
        <Link href={shopHref()} className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>
      <ul className="space-y-3">
        {BEST_SALES.slice(0, 5).map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-[18px] bg-card p-3 shadow-float ring-1 ring-border">
            <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-[26px]", item.thumbTone)}>
              <span aria-hidden>{item.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">{item.title}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {item.rating.toFixed(1)}
              </p>
            </div>
            <Link
              href={payHref(item.id)}
              className="shrink-0 rounded-xl bg-brand-purple px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-purple/90"
            >
              Order
            </Link>
          </li>
        ))}
      </ul>
    </LibraryPanel>
  );
}

export function StudentLibrary() {
  const isLoading = usePageLoading();
  const { data: session } = useSession();
  const displayName = session?.user?.name ?? "Student";

  if (isLoading) return <LibrarySkeleton />;

  return (
    <div className="space-y-6">
      <LibraryHero name={displayName} />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <BookSection title="Popular" books={POPULAR_BOOKS} viewAllHref={booksHref({ category: "popular" })} />
          <BookSection title="Ongoing" books={ONGOING_BOOKS} viewAllHref={booksHref({ category: "ongoing" })} />
        </div>
        <aside className="space-y-6">
          <AchievementWidget />
          <BestSalesWidget />
        </aside>
      </div>
    </div>
  );
}
