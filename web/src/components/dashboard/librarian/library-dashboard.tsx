"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertCircle, Book, BookMarked } from "lucide-react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useLibraryData } from "@/hooks/use-dashboard-data";
import {
  ManagementActionLink,
  ManagementPageHeader,
  ManagementPanel,
  ManagementStatCard,
} from "../management/management-ui";
import {
  LIBRARIAN_BOOKS,
  LIBRARIAN_DASHBOARD_STATS,
  LIBRARIAN_ISSUES,
  libraryPaths,
} from "./librarian-data";

const FALLBACK = {
  books: LIBRARIAN_BOOKS,
  issues: LIBRARIAN_ISSUES,
  stats: {
    totalBooks: 0,
    catalogTitles: LIBRARIAN_BOOKS.length,
    issued: 0,
    overdue: 0,
    available: 0,
  },
};

export function LibraryDashboard({ basePath }: { basePath: string }) {
  const paths = libraryPaths(basePath);
  const loading = usePageLoading(400);
  const { data = FALLBACK } = useLibraryData(FALLBACK);

  const stats = useMemo(() => {
    if (data.stats) {
      return [
        { ...LIBRARIAN_DASHBOARD_STATS[0], value: String(data.stats.catalogTitles) },
        { ...LIBRARIAN_DASHBOARD_STATS[1], value: String(data.stats.issued) },
        { ...LIBRARIAN_DASHBOARD_STATS[2], value: String(data.stats.overdue) },
      ];
    }
    const issued = data.issues.filter((i) => i.status !== "returned").length;
    const overdue = data.issues.filter((i) => i.status === "overdue").length;
    return [
      { ...LIBRARIAN_DASHBOARD_STATS[0], value: String(data.books.length) },
      { ...LIBRARIAN_DASHBOARD_STATS[1], value: String(issued) },
      { ...LIBRARIAN_DASHBOARD_STATS[2], value: String(overdue) },
    ];
  }, [data]);

  const recentIssues = useMemo(
    () => data.issues.filter((i) => i.status !== "returned").slice(0, 5),
    [data.issues],
  );

  if (loading) return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title={basePath.startsWith("/admin") ? "Library administration" : "Library"}
        description={
          basePath.startsWith("/admin")
            ? "Manage catalog, circulation, and overdue loans school-wide."
            : "Catalog, circulation, and overdue tracking."
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <ManagementStatCard key={s.id} {...s} />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ManagementActionLink href={paths.books} label="Books" description="Manage catalog" icon={Book} />
        <ManagementActionLink
          href={paths.issues}
          label="Issues & returns"
          description="Circulation desk"
          icon={BookMarked}
        />
      </div>
      <ManagementPanel className="border border-border">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold">Active loans</h2>
          <Link href={paths.issues} className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {recentIssues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No books currently issued.</p>
        ) : (
          <ul className="space-y-3">
            {recentIssues.map((issue) => (
              <li key={issue.id} className="flex items-center justify-between gap-3 text-sm">
                <Link href={paths.issue(issue.id)} className="min-w-0 hover:underline">
                  <p className="truncate font-semibold">{issue.bookTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {issue.borrower} · Due {issue.dueDate}
                  </p>
                </Link>
                {issue.status === "overdue" ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Overdue
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </ManagementPanel>
    </div>
  );
}
