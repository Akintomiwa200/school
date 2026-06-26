"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookMarked,
  BookOpen,
  Layers,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useLibraryBook,
  useLibraryIssuesList,
  useUpdateLibraryBook,
  type LibraryBookWithIssues,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { AVATAR_TONES } from "./admin-data";
import {
  BOOK_COVER_TONES,
  bookCoverTone,
  formatLibraryDate,
} from "./admin-library-data";
import { AdminBackLink, AdminFormField, adminInputClass } from "./admin-workflow-ui";
import {
  LIBRARY_STATUS_STYLES,
  LIBRARIAN_BOOKS,
  LIBRARIAN_ISSUES,
  libraryPaths,
} from "../librarian/librarian-data";

const BASE = "/admin/library";

function buildFallback(bookId: string): LibraryBookWithIssues | undefined {
  const book = LIBRARIAN_BOOKS.find((b) => b.id === bookId);
  if (!book) return undefined;
  const activeIssues = LIBRARIAN_ISSUES.filter((i) => i.bookId === bookId && i.status !== "returned");
  return { ...book, activeIssues };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function BookCover({ title }: { title: string }) {
  const tone = bookCoverTone(title.length % 5);
  return (
    <span
      className={cn(
        "flex h-20 w-16 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
        BOOK_COVER_TONES[tone],
      )}
    >
      {title
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "purple" | "green" | "blue" | "red";
}) {
  const styles = {
    purple: "border-b-brand-purple",
    green: "border-b-green",
    blue: "border-b-brand-blue",
    red: "border-b-destructive",
  }[tone];

  return (
    <ManagementPanel className={cn("border border-border border-b-[3px] bg-card p-4", styles)}>
      <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </ManagementPanel>
  );
}

function statusLabel(status: "active" | "overdue" | "returned") {
  if (status === "returned") return "Returned";
  if (status === "overdue") return "Due";
  return "Issued";
}

export function AdminLibraryBookDetail({ bookId }: { bookId: string }) {
  const paths = libraryPaths(BASE);
  const router = useRouter();
  const loading = usePageLoading(300);
  const fallback = buildFallback(bookId);
  const { data: book, isFetching } = useLibraryBook(bookId, true, fallback);
  const { data: allIssues = LIBRARIAN_ISSUES } = useLibraryIssuesList(LIBRARIAN_ISSUES);
  const updateBook = useUpdateLibraryBook(bookId);

  const [copies, setCopies] = useState("");
  const [shelfLocation, setShelfLocation] = useState("");

  const active = book ?? fallback;

  const bookIssues = useMemo(
    () => allIssues.filter((issue) => issue.bookId === bookId),
    [allIssues, bookId],
  );

  const issueStats = useMemo(() => {
    const onLoan = bookIssues.filter((i) => i.status !== "returned").length;
    const overdue = bookIssues.filter((i) => i.status === "overdue").length;
    return { onLoan, overdue, totalIssued: bookIssues.length };
  }, [bookIssues]);

  if (loading || isFetching) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

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

  const currentCopies = copies || String(active.copies);
  const currentShelf = shelfLocation || active.shelfLocation;
  const minCopies = active.copies - active.available;

  const onSave = async () => {
    const nextCopies = Number(currentCopies);
    const delta = nextCopies - active.copies;
    await updateBook.mutateAsync({
      copies: nextCopies,
      shelfLocation: currentShelf,
      available: Math.max(0, active.available + delta),
    });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href={paths.books} label="Back to catalog" />

      <ManagementPanel className="border border-border">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <BookCover title={active.title} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{active.category}</p>
              <h1 className="mt-1 text-2xl font-bold text-foreground">{active.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{active.author}</p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">{active.isbn}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full px-5"
            >
              <Link href={`${paths.books}?category=${encodeURIComponent(active.category)}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Same category
              </Link>
            </Button>
            <Button
              asChild
              disabled={active.available <= 0}
              className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Link href={`${paths.issuesNew}?bookId=${active.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Issue book
              </Link>
            </Button>
          </div>
        </div>
      </ManagementPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatChip label="Total copies" value={String(active.copies)} tone="purple" />
        <StatChip label="Available" value={String(active.available)} tone="green" />
        <StatChip label="On loan" value={String(issueStats.onLoan)} tone="blue" />
        <StatChip
          label="Overdue"
          value={String(issueStats.overdue)}
          tone={issueStats.overdue > 0 ? "red" : "blue"}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Catalog details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted-foreground">Published</dt>
              <dd className="font-medium">{active.publishedYear}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted-foreground">Total times issued</dt>
              <dd className="font-semibold tabular-nums">{issueStats.totalIssued}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shelf location</dt>
              <dd className="font-mono font-medium">{currentShelf}</dd>
            </div>
          </dl>

          <form
            className="mt-5 space-y-4 border-t border-border pt-5"
            onSubmit={(e) => {
              e.preventDefault();
              void onSave();
            }}
          >
            <AdminFormField label="Shelf location">
              <input
                value={currentShelf}
                onChange={(e) => setShelfLocation(e.target.value)}
                className={adminInputClass}
                placeholder="e.g. CS-A12"
              />
            </AdminFormField>
            <AdminFormField label="Total copies">
              <input
                type="number"
                min={minCopies}
                value={currentCopies}
                onChange={(e) => setCopies(e.target.value)}
                className={adminInputClass}
              />
            </AdminFormField>
            <Button
              type="submit"
              disabled={updateBook.isPending}
              className="h-10 rounded-xl bg-primary px-6 text-primary-foreground"
            >
              {updateBook.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </form>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">Active loans</h2>
            <Link href={paths.issues} className="text-xs font-semibold text-primary hover:underline">
              All issues
            </Link>
          </div>
          {!active.activeIssues?.length ? (
            <p className="text-sm text-muted-foreground">No books currently on loan for this title.</p>
          ) : (
            <ul className="space-y-3">
              {active.activeIssues.map((issue, index) => (
                <li key={issue.id}>
                  <Link
                    href={paths.issue(issue.id)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          AVATAR_TONES[["purple", "blue", "green", "orange"][index % 4] as keyof typeof AVATAR_TONES],
                        )}
                      >
                        {getInitials(issue.borrower)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{issue.borrower}</p>
                        <p className="text-xs text-muted-foreground">
                          {issue.borrowerId} · Due {formatLibraryDate(issue.dueDate)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        LIBRARY_STATUS_STYLES[issue.status],
                      )}
                    >
                      {issue.status === "overdue" ? <AlertCircle className="h-3 w-3" /> : null}
                      {statusLabel(issue.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ManagementPanel>
      </div>

      <ManagementPanel className="border border-border p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-base font-bold">Circulation history</h2>
            <p className="text-xs text-muted-foreground">{bookIssues.length} records for this title</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            <BookMarked className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Borrower</th>
                <th className="px-4 py-3 font-medium">Issued</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Returned</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No circulation records yet.
                  </td>
                </tr>
              ) : (
                bookIssues.map((issue) => (
                  <tr key={issue.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link href={paths.issue(issue.id)} className="block hover:text-primary">
                        <span className="font-semibold">{issue.borrower}</span>
                        <span className="block text-xs text-muted-foreground">{issue.borrowerId}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatLibraryDate(issue.issuedDate)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatLibraryDate(issue.dueDate)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {issue.returnedDate ? formatLibraryDate(issue.returnedDate) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          LIBRARY_STATUS_STYLES[issue.status],
                        )}
                      >
                        {statusLabel(issue.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ManagementPanel>
    </div>
  );
}
