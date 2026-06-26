"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useIssueLibraryBook,
  useLibraryBooksList,
  useLibraryIssue,
  useLibraryIssuesList,
  useReturnLibraryBook,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import {
  ADMIN_PAGE_SIZE,
  AdminFilterPills,
  AdminTablePagination,
} from "../admin/admin-list-ui";
import { AdminBackLink, AdminFormField, adminInputClass, adminSelectClass } from "../admin/admin-workflow-ui";
import {
  LIBRARY_STATUS_STYLES,
  LIBRARIAN_BOOKS,
  LIBRARIAN_ISSUES,
  libraryPaths,
  type LibraryIssueRecord,
} from "./librarian-data";

export function LibraryIssueForm({ basePath }: { basePath: string }) {
  const paths = libraryPaths(basePath);
  const router = useRouter();
  const searchParams = useSearchParams();
  const issueBook = useIssueLibraryBook();
  const { data: books = LIBRARIAN_BOOKS } = useLibraryBooksList(LIBRARIAN_BOOKS);
  const availableBooks = useMemo(() => books.filter((b) => b.available > 0), [books]);

  const [bookId, setBookId] = useState("");
  const [borrower, setBorrower] = useState("");
  const [borrowerId, setBorrowerId] = useState("");
  const [borrowerType, setBorrowerType] = useState<"student" | "staff">("student");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const param = searchParams.get("bookId");
    if (param && books.some((b) => b.id === param && b.available > 0)) {
      setBookId(param);
    } else if (!bookId && availableBooks[0]) {
      setBookId(availableBooks[0].id);
    }
  }, [searchParams, books, availableBooks, bookId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const issue = await issueBook.mutateAsync({
      bookId,
      borrower,
      borrowerId,
      borrowerType,
      dueDate: dueDate || undefined,
    });
    router.push(paths.issue((issue as { id: string }).id));
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href={paths.issues} label="Back to issues" />
      <ManagementPageHeader title="Issue book" description="Check out a book to a student or staff member." />
      <ManagementPanel className="mx-auto max-w-2xl border border-border">
        <form onSubmit={onSubmit} className="space-y-5">
          <AdminFormField label="Book">
            <select required value={bookId} onChange={(e) => setBookId(e.target.value)} className={adminSelectClass}>
              {availableBooks.length === 0 ? (
                <option value="">No books available</option>
              ) : (
                availableBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} ({book.available} left)
                  </option>
                ))
              )}
            </select>
          </AdminFormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField label="Borrower name" className="sm:col-span-2">
              <input required value={borrower} onChange={(e) => setBorrower(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Borrower ID">
              <input
                required
                value={borrowerId}
                onChange={(e) => setBorrowerId(e.target.value)}
                className={adminInputClass}
                placeholder="STU-… or EMP-…"
              />
            </AdminFormField>
            <AdminFormField label="Borrower type">
              <select
                value={borrowerType}
                onChange={(e) => setBorrowerType(e.target.value as "student" | "staff")}
                className={adminSelectClass}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Due date" className="sm:col-span-2">
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={adminInputClass} />
            </AdminFormField>
          </div>
          <Button
            type="submit"
            disabled={issueBook.isPending || !bookId}
            className="h-10 rounded-full bg-primary px-6 text-primary-foreground"
          >
            {issueBook.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Issue book
          </Button>
        </form>
      </ManagementPanel>
    </div>
  );
}

export function LibraryIssuesList({ basePath }: { basePath: string }) {
  const paths = libraryPaths(basePath);
  const { data: issues = LIBRARIAN_ISSUES, isFetching } = useLibraryIssuesList(LIBRARIAN_ISSUES);
  const loading = usePageLoading(400) || isFetching;
  const [filter, setFilter] = useState<"all" | "active" | "overdue" | "returned">("all");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [filter]);

  const filtered = useMemo(() => {
    if (filter === "all") return issues;
    return issues.filter((i) => i.status === filter);
  }, [issues, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE);

  if (loading) return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Issues & returns"
        description="Lend and receive books from students and staff."
        action={
          <Button asChild className="h-10 shrink-0 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            <Link href={paths.issuesNew}>
              <Plus className="mr-2 h-4 w-4" />
              Issue book
            </Link>
          </Button>
        }
      />
      <ManagementPanel className="space-y-4 border border-border">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Circulation</p>
          <h2 className="mt-1 text-lg font-bold">{filtered.length} records</h2>
        </div>
        <AdminFilterPills
          options={[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "overdue", label: "Overdue" },
            { id: "returned", label: "Returned" },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </ManagementPanel>
      <div className="space-y-3">
        {paginated.length === 0 ? (
          <ManagementPanel className="border border-border text-center text-sm text-muted-foreground">
            No issues match this filter.
          </ManagementPanel>
        ) : (
          paginated.map((issue) => <IssueRow key={issue.id} issue={issue} paths={paths} />)
        )}
      </div>
      {filtered.length > 0 ? (
        <ManagementPanel className="border border-border p-0">
          <AdminTablePagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setPage}
          />
        </ManagementPanel>
      ) : null}
    </div>
  );
}

function IssueRow({
  issue,
  paths,
}: {
  issue: LibraryIssueRecord;
  paths: ReturnType<typeof libraryPaths>;
}) {
  const returnBook = useReturnLibraryBook(issue.id);

  return (
    <ManagementPanel className="flex flex-col gap-3 border border-border sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link href={paths.issue(issue.id)} className="font-bold hover:text-primary">
          {issue.bookTitle}
        </Link>
        <p className="text-sm text-muted-foreground">
          {issue.borrower} ({issue.borrowerId}) · Issued {issue.issuedDate} · Due {issue.dueDate}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
            LIBRARY_STATUS_STYLES[issue.status],
          )}
        >
          {issue.status}
        </span>
        {issue.status !== "returned" ? (
          <Button
            variant="outline"
            size="sm"
            disabled={returnBook.isPending}
            className="h-8 shrink-0 whitespace-nowrap rounded-xl px-3"
            onClick={() => returnBook.mutate()}
          >
            {returnBook.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Return"}
          </Button>
        ) : null}
      </div>
    </ManagementPanel>
  );
}

export function LibraryIssueDetail({ basePath, issueId }: { basePath: string; issueId: string }) {
  const paths = libraryPaths(basePath);
  const router = useRouter();
  const loading = usePageLoading(300);
  const fallback = LIBRARIAN_ISSUES.find((i) => i.id === issueId);
  const { data: issue, isFetching } = useLibraryIssue(issueId, fallback);
  const returnBook = useReturnLibraryBook(issueId);

  const active = issue ?? fallback;

  if (loading || isFetching) return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

  if (!active) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Issue not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={paths.issues}>Back to issues</Link>
        </Button>
      </ManagementPanel>
    );
  }

  const onReturn = async () => {
    await returnBook.mutateAsync();
    router.push(paths.issues);
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href={paths.issues} label="Back to issues" />
      <ManagementPanel className="border border-border">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{active.bookTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {active.borrower} · {active.borrowerId} ({active.borrowerType})
            </p>
            <span
              className={cn(
                "mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                LIBRARY_STATUS_STYLES[active.status],
              )}
            >
              {active.status}
            </span>
          </div>
          {active.status !== "returned" ? (
            <Button
              onClick={onReturn}
              disabled={returnBook.isPending}
              className="h-10 shrink-0 rounded-full bg-primary px-5 text-primary-foreground"
            >
              {returnBook.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Mark returned
            </Button>
          ) : null}
        </div>
      </ManagementPanel>
      <ManagementPanel className="border border-border">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Issued</dt>
            <dd className="font-medium">{active.issuedDate}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Due</dt>
            <dd className="font-medium">{active.dueDate}</dd>
          </div>
          {active.returnedDate ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Returned</dt>
              <dd className="font-medium">{active.returnedDate}</dd>
            </div>
          ) : null}
        </dl>
        <Button asChild variant="outline" className="mt-4 h-9 rounded-xl">
          <Link href={paths.book(active.bookId)}>View book</Link>
        </Button>
      </ManagementPanel>
    </div>
  );
}
