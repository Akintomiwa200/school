"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { booksHref, READING_ACHIEVEMENTS } from "./library-data";
import { LibraryPanel } from "./library-ui";
import { LibraryListSkeleton } from "./library-skeleton";

function SegmentedProgress({ progress, segments = 3 }: { progress: number; segments?: number }) {
  const filled = Math.min(segments, Math.max(0, Math.round((progress / 100) * segments)));
  return (
    <div className="flex min-w-0 flex-1 gap-1.5">
      {Array.from({ length: segments }, (_, index) => (
        <div
          key={index}
          className={cn("h-2 flex-1 rounded-full", index < filled ? "bg-primary" : "bg-muted")}
        />
      ))}
    </div>
  );
}

export function StudentLibraryAchievements() {
  const isLoading = usePageLoading();
  const [enabled, setEnabled] = useState(true);

  if (isLoading) return <LibraryListSkeleton />;

  return (
    <div className="space-y-6">
      <LibraryPanel>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">Achievement tracking</h2>
            <p className="mt-1 text-sm text-muted-foreground">Goal achieved — success unlocked.</p>
          </div>
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
            <span
              className={cn(
                "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                enabled ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>
      </LibraryPanel>

      <div className={cn("space-y-4 transition-opacity", !enabled && "opacity-45")}>
        {READING_ACHIEVEMENTS.map((item) => (
          <LibraryPanel key={item.id}>
            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                <Image src={item.avatarUrl} alt="" fill className="object-cover" sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.goal}</p>
                <div className="mt-4 flex items-center gap-3">
                  <SegmentedProgress progress={item.progress} />
                  <p className="shrink-0 text-sm text-muted-foreground">{item.daysLeft} days left</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-primary">{item.progress}% achieved</p>
              </div>
            </div>
          </LibraryPanel>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Keep reading to unlock badges.{" "}
        <Link href={booksHref()} className="font-medium text-brand-purple hover:underline">
          Browse books
        </Link>
      </p>
    </div>
  );
}
