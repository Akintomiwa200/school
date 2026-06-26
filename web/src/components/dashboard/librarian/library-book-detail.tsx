"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useLibraryBook, useUpdateLibraryBook, type LibraryBookWithIssues } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminInputClass } from "../admin/admin-workflow-ui";
import { LIBRARY_STATUS_STYLES, LIBRARIAN_BOOKS, LIBRARIAN_ISSUES, libraryPaths } from "./librarian-data";

function buildFallback(bookId: string): LibraryBookWithIssues | undefined {
  const book = LIBRARIAN_BOOKS.find((b) => b.id === bookId);
  if (!book) return undefined;
  const activeIssues = LIBRARIAN_ISSUES.filter((i) => i.bookId === bookId && i.status !== "returned");
  return { ...book, activeIssues };
}

export function LibraryBookDetail({ basePath, bookId }: { basePath: string; bookId: string }) {
  const paths = libraryPaths(basePath);
  const router = useRouter();
  const loading = usePageLoading(300);
  const fallback = buildFallback(bookId);
  const { data: book, isFetching } = useLibraryBook(bookId, true, fallback);
  const updateBook = useUpdateLibraryBook(bookId);
  const [copies, setCopies] = useState("");

  const active = book ?? fallback;
  const currentCopies = copies || String(active?.copies ?? "");

  if (loading || isFetching) return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

  if (!active) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Book not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={paths.books}>Back to catalog</Link>
        </Button>
      </ManagementPanel>
    );
  }

  const onSave = async () => {
    const nextCopies = Number(currentCopies);
    const delta = nextCopies - active.copies;
    await updateBook.mutateAsync({
      copies: nextCopies,
      available: Math.max(0, active.available + delta),
    });
    router.push(paths.books);
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href={paths.books} label="Back to catalog" />

      <ManagementPanel className="border border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">{active.title}</h1>
              <p className="text-sm text-muted-foreground">{active.author}</p>
              <p className="mt-1 text-xs text-muted-foreground">{active.isbn} · {active.category}</p>
            </div>
          </div>
          <Button
            asChild
            disabled={active.available <= 0}
            className="h-10 shrink-0 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Link href={`${paths.issuesNew}?bookId=${active.id}`}>Issue book</Link>
          </Button>
        </div>
      </ManagementPanel>

      <div className="grid gap-5 lg:grid-cols-2">
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Catalog details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shelf</dt>
              <dd className="font-mono font-medium">{active.shelfLocation}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Published</dt>
              <dd className="font-medium">{active.publishedYear}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Available</dt>
              <dd className={cn("font-bold tabular-nums", active.available === 0 ? "text-destructive" : "text-green")}>
                {active.available} / {active.copies}
              </dd>
            </div>
          </dl>
          <div className="mt-5 space-y-3">
            <AdminFormField label="Total copies">
              <input
                type="number"
                min={active.copies - active.available}
                value={currentCopies}
                onChange={(e) => setCopies(e.target.value)}
                className={adminInputClass}
              />
            </AdminFormField>
            <Button onClick={onSave} disabled={updateBook.isPending} className="h-10 rounded-xl bg-primary px-6 text-primary-foreground">
              {updateBook.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save copies
            </Button>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Active loans</h2>
          {!active.activeIssues?.length ? (
            <p className="mt-4 text-sm text-muted-foreground">No active loans for this title.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {active.activeIssues.map((issue) => (
                <li key={issue.id} className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-semibold">{issue.borrower}</p>
                    <p className="text-xs text-muted-foreground">Due {issue.dueDate}</p>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", LIBRARY_STATUS_STYLES[issue.status])}>
                    {issue.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ManagementPanel>
      </div>
    </div>
  );
}
