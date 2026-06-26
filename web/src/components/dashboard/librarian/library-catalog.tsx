"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useLibraryBooksList } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import {
  ADMIN_PAGE_SIZE,
  AdminFilterPills,
  AdminSearchBar,
  AdminTablePagination,
} from "../admin/admin-list-ui";
import {
  LIBRARY_CATEGORIES,
  LIBRARIAN_BOOKS,
  libraryPaths,
  type LibraryBookRecord,
} from "./librarian-data";

export function LibraryCatalog({ basePath }: { basePath: string }) {
  const paths = libraryPaths(basePath);
  const searchParams = useSearchParams();
  const { data: books = LIBRARIAN_BOOKS, isFetching } = useLibraryBooksList(LIBRARIAN_BOOKS);
  const loading = usePageLoading(400) || isFetching;
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | (typeof LIBRARY_CATEGORIES)[number]>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "out">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category && LIBRARY_CATEGORIES.includes(category as (typeof LIBRARY_CATEGORIES)[number])) {
      setCategoryFilter(category as (typeof LIBRARY_CATEGORIES)[number]);
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [query, categoryFilter, availabilityFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((b) => {
      if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
      if (availabilityFilter === "available" && b.available <= 0) return false;
      if (availabilityFilter === "out" && b.available > 0) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    });
  }, [books, query, categoryFilter, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE);

  if (loading) return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Books"
        description="Manage the library catalog, copies, and shelf locations."
        action={
          <Button asChild className="h-10 shrink-0 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            <Link href={paths.booksNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add book
            </Link>
          </Button>
        }
      />

      <ManagementPanel className="border border-border">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Catalog</p>
            <h2 className="mt-1 text-lg font-bold">{filtered.length} titles</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
            <AdminSearchBar value={query} onChange={setQuery} placeholder="Search title, author, ISBN…" />
            <div className="relative w-full shrink-0 sm:w-[160px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                className="h-9 w-full appearance-none rounded-xl border border-border bg-background pl-3 pr-8 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All categories</option>
                {LIBRARY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button variant="outline" size="sm" className="h-9 w-full shrink-0 whitespace-nowrap rounded-xl px-4 sm:w-auto">
              <Download className="mr-1.5 h-4 w-4 shrink-0" />
              Export
            </Button>
          </div>
          <AdminFilterPills
            options={[
              { id: "all", label: "All" },
              { id: "available", label: "Available" },
              { id: "out", label: "All out" },
            ]}
            value={availabilityFilter}
            onChange={setAvailabilityFilter}
          />
        </div>
      </ManagementPanel>

      <ManagementPanel className="border border-border p-0">
        <div className="overflow-x-auto">
          <BookTable books={paginated} paths={paths} />
        </div>
        {filtered.length > 0 ? (
          <AdminTablePagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setPage}
          />
        ) : null}
      </ManagementPanel>
    </div>
  );
}

function BookTable({
  books,
  paths,
}: {
  books: LibraryBookRecord[];
  paths: ReturnType<typeof libraryPaths>;
}) {
  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead>
        <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <th className="px-4 py-3 font-medium">Title</th>
          <th className="px-4 py-3 font-medium">Author</th>
          <th className="px-4 py-3 font-medium">Category</th>
          <th className="px-4 py-3 font-medium">Shelf</th>
          <th className="px-4 py-3 font-medium">Available</th>
          <th className="px-4 py-3 font-medium">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {books.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
              No books match your filters.
            </td>
          </tr>
        ) : (
          books.map((book) => (
            <tr key={book.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3">
                <Link href={paths.book(book.id)} className="block hover:underline">
                  <p className="font-semibold">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.isbn}</p>
                </Link>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{book.author}</td>
              <td className="px-4 py-3">{book.category}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{book.shelfLocation}</td>
              <td className="px-4 py-3">
                <span className={cn("font-semibold tabular-nums", book.available === 0 ? "text-destructive" : "text-green")}>
                  {book.available}/{book.copies}
                </span>
              </td>
              <td className="px-4 py-3">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Link href={paths.book(book.id)} aria-label={`View ${book.title}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
