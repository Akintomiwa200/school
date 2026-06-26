import {
  LIBRARIAN_BOOKS,
  LIBRARIAN_ISSUES,
  type LibraryBookRecord,
  type LibraryIssueRecord,
} from "@/components/dashboard/librarian/librarian-data";

let books: LibraryBookRecord[] = [...LIBRARIAN_BOOKS];
let issues: LibraryIssueRecord[] = [...LIBRARIAN_ISSUES];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(from: string, days: number) {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function syncIssueStatuses() {
  const now = today();
  issues = issues.map((issue) => {
    if (issue.status === "returned") return issue;
    if (issue.dueDate < now) return { ...issue, status: "overdue" as const };
    return { ...issue, status: "active" as const };
  });
}

export function getMutableBooks() {
  syncIssueStatuses();
  return books;
}

export function getBookById(id: string) {
  return books.find((b) => b.id === id);
}

export function addBook(input: Omit<LibraryBookRecord, "id" | "available"> & { available?: number }) {
  const book: LibraryBookRecord = {
    ...input,
    id: `b${Date.now()}`,
    available: input.available ?? input.copies,
  };
  books = [book, ...books];
  return book;
}

export function updateBook(id: string, patch: Partial<LibraryBookRecord>) {
  if (!books.some((b) => b.id === id)) return null;
  books = books.map((b) => (b.id === id ? { ...b, ...patch } : b));
  return books.find((b) => b.id === id) ?? null;
}

export function getMutableIssues() {
  syncIssueStatuses();
  return issues;
}

export function getIssueById(id: string) {
  syncIssueStatuses();
  return issues.find((i) => i.id === id);
}

export function getIssuesForBook(bookId: string) {
  return getMutableIssues().filter((i) => i.bookId === bookId && i.status !== "returned");
}

export function issueBook(input: {
  bookId: string;
  borrower: string;
  borrowerId: string;
  borrowerType: "student" | "staff";
  dueDate?: string;
}): LibraryIssueRecord | null {
  const book = getBookById(input.bookId);
  if (!book || book.available <= 0) return null;

  const issuedDate = today();
  const issue: LibraryIssueRecord = {
    id: `is${Date.now()}`,
    bookId: book.id,
    bookTitle: book.title,
    borrower: input.borrower,
    borrowerId: input.borrowerId,
    borrowerType: input.borrowerType,
    issuedDate,
    dueDate: input.dueDate ?? addDays(issuedDate, 14),
    status: "active",
  };

  issues = [issue, ...issues];
  updateBook(book.id, { available: book.available - 1 });
  return issue;
}

export function returnIssue(id: string): LibraryIssueRecord | null {
  const issue = getIssueById(id);
  if (!issue || issue.status === "returned") return null;

  const book = getBookById(issue.bookId);
  if (book) {
    updateBook(book.id, { available: Math.min(book.copies, book.available + 1) });
  }

  const returned: LibraryIssueRecord = {
    ...issue,
    status: "returned",
    returnedDate: today(),
  };
  issues = issues.map((i) => (i.id === id ? returned : i));
  return returned;
}

export function getLibraryStats() {
  syncIssueStatuses();
  const activeIssues = issues.filter((i) => i.status !== "returned");
  return {
    totalBooks: books.reduce((sum, b) => sum + b.copies, 0),
    catalogTitles: books.length,
    issued: activeIssues.length,
    overdue: issues.filter((i) => i.status === "overdue").length,
    available: books.reduce((sum, b) => sum + b.available, 0),
  };
}
