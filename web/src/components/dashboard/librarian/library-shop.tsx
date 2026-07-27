"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useCreateLibrarianShopItem,
  useDeleteLibrarianShopItem,
  useLibrarianShopItem,
  useLibrarianShopItems,
  useUpdateLibrarianShopItem,
  type LibrarianShopItem,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { ADMIN_PAGE_SIZE, AdminSearchBar, AdminTablePagination } from "../admin/admin-list-ui";
import { AdminBackLink, AdminFormField, adminInputClass, adminSelectClass } from "../admin/admin-workflow-ui";
import { libraryPaths } from "./librarian-data";

const FALLBACK: LibrarianShopItem[] = [];

const SHOP_ITEM_ICONS = ["BookOpen", "Headphones", "Palette", "Music", "PenTool", "Layers", "Bookmark", "GraduationCap", "Lightbulb", "Camera"] as const;
const SHOP_ITEM_TONES = [
  "from-violet-200 via-purple-100 to-fuchsia-100",
  "from-amber-100 via-orange-50 to-rose-100",
  "from-emerald-100 via-teal-50 to-cyan-100",
  "from-blue-100 via-indigo-50 to-purple-100",
  "from-pink-100 via-rose-50 to-red-100",
  "from-yellow-100 via-lime-50 to-green-100",
  "from-sky-100 via-blue-50 to-indigo-100",
  "from-teal-100 via-cyan-50 to-sky-100",
  "from-fuchsia-100 via-pink-50 to-rose-100",
  "from-red-100 via-orange-50 to-amber-100",
] as const;

export function LibraryShopList({ basePath }: { basePath: string }) {
  const paths = libraryPaths(basePath);
  const { data: items = FALLBACK, isFetching } = useLibrarianShopItems(FALLBACK);
  const loading = usePageLoading(400) || isFetching;
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.title.toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE);

  if (loading) return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Shop items"
        description="Manage the library shop catalogue."
        action={
          <Button asChild className="h-10 shrink-0 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            <Link href={`${paths.shop}/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add item
            </Link>
          </Button>
        }
      />
      <ManagementPanel className="border border-border">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Shop</p>
            <h2 className="mt-1 text-lg font-bold">{filtered.length} items</h2>
          </div>
          <AdminSearchBar value={query} onChange={setQuery} placeholder="Search items..." />
        </div>
      </ManagementPanel>
      <ManagementPanel className="border border-border p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Format</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No shop items yet.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{item.title}</p>
                      {item.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.format}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.rating.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <Link href={paths.shopItem(item.id)} aria-label={`Edit ${item.title}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export function LibraryShopForm({ basePath }: { basePath: string }) {
  const paths = libraryPaths(basePath);
  const createItem = useCreateLibrarianShopItem();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>("BookOpen");
  const [thumbTone, setThumbTone] = useState<string>(SHOP_ITEM_TONES[0]);
  const [price, setPrice] = useState("9.99");
  const [format, setFormat] = useState("eBook");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createItem.mutateAsync({ title, description: description || undefined, icon, thumbTone, price: Number(price), format });
    window.location.href = paths.shop;
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href={paths.shop} label="Back to shop" />
      <ManagementPageHeader title="Add shop item" description="Add a new item to the library shop." />
      <ManagementPanel className="mx-auto max-w-2xl border border-border">
        <form onSubmit={onSubmit} className="space-y-5">
          <AdminFormField label="Title" className="sm:col-span-2">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={adminInputClass + " min-h-[80px]"} placeholder="Optional description..." />
          </AdminFormField>
          <div className="grid gap-5 sm:grid-cols-3">
            <AdminFormField label="Price (USD)">
              <input required type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Format">
              <select value={format} onChange={(e) => setFormat(e.target.value)} className={adminSelectClass}>
                <option>eBook</option>
                <option>Audiobook</option>
                <option>Workbook</option>
                <option>Bundle</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Icon">
              <select value={icon} onChange={(e) => setIcon(e.target.value)} className={adminSelectClass}>
                {SHOP_ITEM_ICONS.map((ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
            </AdminFormField>
          </div>
          <AdminFormField label="Thumbnail tone">
            <div className="flex flex-wrap gap-2">
              {SHOP_ITEM_TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setThumbTone(tone)}
                  className={cn(
                    "h-8 w-8 rounded-full bg-gradient-to-br transition",
                    tone,
                    thumbTone === tone ? "ring-2 ring-primary ring-offset-2" : "",
                  )}
                />
              ))}
            </div>
          </AdminFormField>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={createItem.isPending} className="h-10 rounded-full bg-primary px-6 text-primary-foreground">
              {createItem.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add item
            </Button>
            <Button type="button" variant="outline" asChild className="h-10 rounded-full px-6">
              <Link href={paths.shop}>Cancel</Link>
            </Button>
          </div>
        </form>
      </ManagementPanel>
    </div>
  );
}

export function LibraryShopItemEdit({ basePath, itemId }: { basePath: string; itemId: string }) {
  const paths = libraryPaths(basePath);
  const { data: item, isFetching } = useLibrarianShopItem(itemId);
  const updateItem = useUpdateLibrarianShopItem(itemId);
  const deleteItem = useDeleteLibrarianShopItem(itemId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>("BookOpen");
  const [thumbTone, setThumbTone] = useState<string>(SHOP_ITEM_TONES[0]);
  const [price, setPrice] = useState("0");
  const [format, setFormat] = useState("eBook");
  const loaded = useState(false);

  if (isFetching) return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

  if (!item) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Item not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={paths.shop}>Back to shop</Link>
        </Button>
      </ManagementPanel>
    );
  }

  if (!loaded[0]) {
    loaded[1](true);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setIcon(item.icon);
    setThumbTone(item.thumbTone);
    setPrice(String(item.price));
    setFormat(item.format);
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateItem.mutateAsync({ title, description: description || undefined, icon, thumbTone, price: Number(price), format });
    window.location.href = paths.shop;
  };

  const onDelete = async () => {
    if (!confirm("Deactivate this shop item?")) return;
    await deleteItem.mutateAsync();
    window.location.href = paths.shop;
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href={paths.shop} label="Back to shop" />
      <ManagementPageHeader title="Edit shop item" description="Update item details." />
      <ManagementPanel className="mx-auto max-w-2xl border border-border">
        <form onSubmit={onSave} className="space-y-5">
          <AdminFormField label="Title" className="sm:col-span-2">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={adminInputClass + " min-h-[80px]"} />
          </AdminFormField>
          <div className="grid gap-5 sm:grid-cols-3">
            <AdminFormField label="Price (USD)">
              <input required type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Format">
              <select value={format} onChange={(e) => setFormat(e.target.value)} className={adminSelectClass}>
                <option>eBook</option>
                <option>Audiobook</option>
                <option>Workbook</option>
                <option>Bundle</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Icon">
              <select value={icon} onChange={(e) => setIcon(e.target.value)} className={adminSelectClass}>
                {SHOP_ITEM_ICONS.map((ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
            </AdminFormField>
          </div>
          <AdminFormField label="Thumbnail tone">
            <div className="flex flex-wrap gap-2">
              {SHOP_ITEM_TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setThumbTone(tone)}
                  className={cn(
                    "h-8 w-8 rounded-full bg-gradient-to-br transition",
                    tone,
                    thumbTone === tone ? "ring-2 ring-primary ring-offset-2" : "",
                  )}
                />
              ))}
            </div>
          </AdminFormField>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={updateItem.isPending} className="h-10 rounded-full bg-primary px-6 text-primary-foreground">
              {updateItem.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
            <Button type="button" variant="outline" asChild className="h-10 rounded-full px-6">
              <Link href={paths.shop}>Cancel</Link>
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteItem.isPending}
              onClick={onDelete}
              className="ml-auto h-10 rounded-full px-6"
            >
              {deleteItem.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              <Trash2 className="mr-2 h-4 w-4" />
              Deactivate
            </Button>
          </div>
        </form>
      </ManagementPanel>
    </div>
  );
}
