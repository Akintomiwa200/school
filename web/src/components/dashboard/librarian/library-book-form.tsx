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

const BOOK_ACCESS_OPTIONS = ["free", "paid"] as const;
const BOOK_FORMATS = ["eBook", "Workbook", "Anthology", "Textbook", "Interactive eBook", "Course book", "eBook + maps"] as const;

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
  const [description, setDescription] = useState("");
  const [bookAccess, setBookAccess] = useState<string>("free");
  const [price, setPrice] = useState("");
  const [format, setFormat] = useState<string>("eBook");
  const [pages, setPages] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverTone, setCoverTone] = useState("from-violet-200 via-purple-100 to-fuchsia-100");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const book = await createBook.mutateAsync({
      title,
      author,
      isbn,
      category,
      copies: Number(copies),
      shelfLocation: shelfLocation || "TBD",
      description: description || undefined,
      bookAccess,
      price: bookAccess === "paid" && price ? Number(price) : undefined,
      format,
      pages: pages ? Number(pages) : undefined,
      coverImage: coverImage || undefined,
      coverTone: coverTone || undefined,
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
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Format">
              <select value={format} onChange={(e) => setFormat(e.target.value)} className={adminSelectClass}>
                {BOOK_FORMATS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Copies">
              <input required type="number" min={1} value={copies} onChange={(e) => setCopies(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Pages">
              <input type="number" min={0} value={pages} onChange={(e) => setPages(e.target.value)} className={adminInputClass} placeholder="0" />
            </AdminFormField>
            <AdminFormField label="Shelf location">
              <input value={shelfLocation} onChange={(e) => setShelfLocation(e.target.value)} className={adminInputClass} placeholder="e.g. LIT-C01" />
            </AdminFormField>
            <AdminFormField label="Access">
              <select value={bookAccess} onChange={(e) => setBookAccess(e.target.value)} className={adminSelectClass}>
                {BOOK_ACCESS_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a === "free" ? "Free" : "Paid"}</option>
                ))}
              </select>
            </AdminFormField>
            {bookAccess === "paid" && (
              <AdminFormField label="Price (USD)">
                <input type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} className={adminInputClass} placeholder="0" />
              </AdminFormField>
            )}
          </div>
          <AdminFormField label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={adminInputClass + " min-h-[80px]"} placeholder="Brief description of the book..." />
          </AdminFormField>
          <AdminFormField label="Cover image URL">
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className={adminInputClass} placeholder="https://..." />
          </AdminFormField>
          <AdminFormField label="Cover tone (Tailwind gradient)">
            <input value={coverTone} onChange={(e) => setCoverTone(e.target.value)} className={adminInputClass} placeholder="from-violet-200 via-purple-100 to-fuchsia-100" />
          </AdminFormField>
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
