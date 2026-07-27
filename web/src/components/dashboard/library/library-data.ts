export type BookAccess = "free" | "paid";
export type BookCategory = "popular" | "ongoing";

export type LibraryChapter = {
  id: string;
  title: string;
  content: string;
};

export type LibraryBook = {
  id: string;
  title: string;
  description: string;
  image: string;
  coverTone: string;
  category: BookCategory;
  access: BookAccess;
  price?: number;
  author: string;
  format: string;
  pages: number;
  chapters: LibraryChapter[];
  bookmarked?: boolean;
  liked?: boolean;
  readingProgress?: number;
};

export type ReadingAchievement = {
  id: string;
  title: string;
  avatarUrl: string;
  progress: number;
  daysLeft: number;
  goal: string;
};

export type LibrarySaleItem = {
  id: string;
  title: string;
  description: string;
  rating: number;
  icon: string;
  thumbTone: string;
  price: number;
  format: "physical" | "digital" | "bundle";
  bookId?: string;
};

export type LibraryOrderStatus = "completed" | "processing" | "cancelled";

export type LibraryOrderLine = {
  itemId: string;
  title: string;
  amount: number;
  format: LibrarySaleItem["format"];
  bookId?: string;
};

export type LibraryOrder = {
  id: string;
  lines: LibraryOrderLine[];
  amount: number;
  method: "card" | "bank";
  status: LibraryOrderStatus;
  date: string;
  receiptId: string;
  cardLast4?: string;
};

export function libraryHref(segment?: string) {
  const base = "/student/library";
  return segment ? `${base}/${segment}` : base;
}

export function booksHref(query?: { category?: string; access?: string }) {
  const base = libraryHref("books");
  const params = new URLSearchParams();
  if (query?.category) params.set("category", query.category);
  if (query?.access) params.set("access", query.access);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function bookHref(bookId: string) {
  return libraryHref(`books/${bookId}`);
}

export function bookReadHref(bookId: string, chapterId?: string) {
  const base = libraryHref(`books/${bookId}/read`);
  return chapterId ? `${base}?chapter=${chapterId}` : base;
}

export function shopHref(itemId?: string) {
  return itemId ? libraryHref(`shop/${itemId}`) : libraryHref("shop");
}

export function payHref(itemId?: string) {
  const base = libraryHref("pay");
  return itemId ? `${base}?item=${itemId}` : base;
}

export function orderHref(orderId?: string) {
  return orderId ? libraryHref(`orders/${orderId}`) : libraryHref("orders");
}

export function orderReceiptHref(orderId: string) {
  return libraryHref(`orders/${orderId}/receipt`);
}

export function payCheckoutHref(itemIds?: string[]) {
  const base = libraryHref("pay/checkout");
  if (!itemIds?.length) return base;
  return `${base}?items=${itemIds.join(",")}`;
}

export function payConfirmationHref(orderId: string) {
  return `${libraryHref("pay/confirmation")}?orderId=${orderId}`;
}

export function formatLibraryPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
