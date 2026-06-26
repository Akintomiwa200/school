"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateLibraryBook } from "@/hooks/use-dashboard-data";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminInputClass, adminSelectClass } from "../admin/admin-workflow-ui";
import { LIBRARY_CATEGORIES, libraryPaths } from "./librarian-data";

export function LibraryBookForm({ basePath }: { basePath: string }) {
  const paths = libraryPaths(basePath);
  const router = useRouter();
  const createBook = useCreateLibraryBook();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState<string>(LIBRARY_CATEGORIES[0]);
  const [copies, setCopies] = useState("5");
  const [shelfLocation, setShelfLocation] = useState("");
  const [publishedYear, setPublishedYear] = useState(String(new Date().getFullYear()));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const book = await createBook.mutateAsync({
      title,
      author,
      isbn,
      category,
      copies: Number(copies),
      shelfLocation: shelfLocation || "TBD",
      publishedYear: Number(publishedYear),
    });
    router.push(paths.book((book as { id: string }).id));
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href={paths.books} label="Back to catalog" />
      <ManagementPageHeader title="Add book" description="Add a new title to the library catalog." />
      <ManagementPanel className="mx-auto max-w-2xl border border-border">
        <form onSubmit={onSubmit} className="space-y-5">
          <AdminFormField label="Title" className="sm:col-span-2">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField label="Author">
              <input required value={author} onChange={(e) => setAuthor(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="ISBN">
              <input required value={isbn} onChange={(e) => setIsbn(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={adminSelectClass}>
                {LIBRARY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Copies">
              <input
                required
                type="number"
                min={1}
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                className={adminInputClass}
              />
            </AdminFormField>
            <AdminFormField label="Shelf location">
              <input value={shelfLocation} onChange={(e) => setShelfLocation(e.target.value)} className={adminInputClass} placeholder="e.g. LIT-C01" />
            </AdminFormField>
            <AdminFormField label="Published year">
              <input
                type="number"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                className={adminInputClass}
              />
            </AdminFormField>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={createBook.isPending} className="h-10 rounded-full bg-primary px-6 text-primary-foreground">
              {createBook.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add book
            </Button>
            <Button type="button" variant="outline" asChild className="h-10 rounded-full px-6">
              <Link href={paths.books}>Cancel</Link>
            </Button>
          </div>
        </form>
      </ManagementPanel>
    </div>
  );
}
