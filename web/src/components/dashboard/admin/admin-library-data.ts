import type { LibraryBookRecord, LibraryIssueRecord } from "../librarian/librarian-data";

export const LIBRARY_USES_WEEKLY = [
  { day: "Mon", members: 18, issued: 12 },
  { day: "Tue", members: 22, issued: 15 },
  { day: "Wed", members: 14, issued: 9 },
  { day: "Thu", members: 26, issued: 18 },
  { day: "Fri", members: 20, issued: 14 },
  { day: "Sat", members: 11, issued: 7 },
  { day: "Sun", members: 8, issued: 5 },
] as const;

export const LIBRARY_REVENUE_MONTHLY = [
  { month: "Jan", revenue: 2840 },
  { month: "Feb", revenue: 3120 },
  { month: "Mar", revenue: 2980 },
  { month: "Apr", revenue: 3560 },
  { month: "May", revenue: 3890 },
  { month: "Jun", revenue: 4245 },
] as const;

export const BOOK_COVER_TONES = {
  purple: "bg-gradient-to-br from-brand-purple/30 to-brand-purple/10 text-brand-purple",
  blue: "bg-gradient-to-br from-brand-blue/30 to-brand-blue/10 text-brand-blue",
  green: "bg-gradient-to-br from-green/30 to-green/10 text-green",
  orange: "bg-gradient-to-br from-brand-orange/30 to-brand-orange/10 text-brand-orange",
  pink: "bg-gradient-to-br from-brand-pink/30 to-brand-pink/10 text-brand-pink",
} as const;

export type BookCoverTone = keyof typeof BOOK_COVER_TONES;

const COVER_TONE_CYCLE: BookCoverTone[] = ["purple", "blue", "green", "orange", "pink"];

export function bookCoverTone(index: number): BookCoverTone {
  return COVER_TONE_CYCLE[index % COVER_TONE_CYCLE.length]!;
}

export function formatLibraryDate(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function buildPopularIssuedBooks(
  books: LibraryBookRecord[],
  issues: LibraryIssueRecord[],
  limit = 5,
) {
  const counts = new Map<string, number>();
  for (const issue of issues) {
    counts.set(issue.bookId, (counts.get(issue.bookId) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([bookId, timesIssued], index) => {
      const book = books.find((b) => b.id === bookId);
      return {
        id: bookId,
        title: book?.title ?? "Unknown title",
        bookId: book?.isbn.slice(-5) ?? bookId,
        timesIssued,
        coverTone: bookCoverTone(index),
      };
    });
}

export function buildTopAuthors(
  books: LibraryBookRecord[],
  issues: LibraryIssueRecord[],
  limit = 5,
) {
  const map = new Map<string, { books: number; issues: number }>();
  for (const book of books) {
    const entry = map.get(book.author) ?? { books: 0, issues: 0 };
    entry.books += 1;
    map.set(book.author, entry);
  }
  for (const issue of issues) {
    const book = books.find((b) => b.id === issue.bookId);
    if (!book) continue;
    const entry = map.get(book.author)!;
    entry.issues += 1;
  }

  return [...map.entries()]
    .sort((a, b) => b[1].issues - a[1].issues || b[1].books - a[1].books)
    .slice(0, limit)
    .map(([name, stats], index) => ({
      id: name,
      name,
      books: stats.books,
      issues: stats.issues,
      avatarTone: (["purple", "blue", "green", "orange", "pink"] as const)[index % 5]!,
    }));
}

export function buildLibraryActivity(
  books: LibraryBookRecord[],
  issues: LibraryIssueRecord[],
  limit = 8,
) {
  return [...issues]
    .sort((a, b) => b.issuedDate.localeCompare(a.issuedDate))
    .slice(0, limit)
    .map((issue, index) => {
      const book = books.find((b) => b.id === issue.bookId);
      return {
        id: issue.id,
        title: issue.bookTitle,
        author: book?.author ?? "—",
        borrower: issue.borrower,
        borrowerId: issue.borrowerId,
        issuedDate: issue.issuedDate,
        dueDate: issue.dueDate,
        returnedDate: issue.returnedDate,
        status: issue.status,
        coverTone: bookCoverTone(index),
        avatarTone: (["purple", "blue", "green", "orange"] as const)[index % 4]!,
      };
    });
}

export const LIBRARY_RESERVED_COUNT = 13;
export const LIBRARY_MEMBER_BASELINE = 44;
