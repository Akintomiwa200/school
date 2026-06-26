import { AlertCircle, Book, BookMarked } from "lucide-react";

export type LibraryBookRecord = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copies: number;
  available: number;
  shelfLocation: string;
  publishedYear: number;
};

export type LibraryIssueRecord = {
  id: string;
  bookId: string;
  bookTitle: string;
  borrower: string;
  borrowerId: string;
  borrowerType: "student" | "staff";
  issuedDate: string;
  dueDate: string;
  returnedDate?: string;
  status: "active" | "overdue" | "returned";
};

export const LIBRARY_CATEGORIES = [
  "Literature",
  "Mathematics",
  "English",
  "Science",
  "History",
  "Computer Science",
  "Reference",
] as const;

export const LIBRARIAN_DASHBOARD_STATS = [
  { id: "books", label: "Books", value: "—", hint: "In catalog", tone: "purple" as const, icon: Book },
  { id: "issued", label: "Issued", value: "—", hint: "Currently borrowed", tone: "blue" as const, icon: BookMarked },
  { id: "overdue", label: "Overdue", value: "—", hint: "Needs follow-up", tone: "orange" as const, icon: AlertCircle },
];

export const LIBRARIAN_BOOKS: LibraryBookRecord[] = [
  { id: "b1", title: "Introduction to Algorithms", author: "Cormen et al.", isbn: "978-0262033848", copies: 5, available: 2, category: "Computer Science", shelfLocation: "CS-A12", publishedYear: 2009 },
  { id: "b2", title: "Physics for Scientists", author: "Serway", isbn: "978-1337094160", copies: 8, available: 5, category: "Science", shelfLocation: "SCI-B04", publishedYear: 2018 },
  { id: "b3", title: "Things Fall Apart", author: "Chinua Achebe", isbn: "978-0385474542", copies: 12, available: 0, category: "Literature", shelfLocation: "LIT-C01", publishedYear: 1958 },
  { id: "b4", title: "A Brief History of Time", author: "Stephen Hawking", isbn: "978-0553380163", copies: 4, available: 3, category: "Science", shelfLocation: "SCI-B08", publishedYear: 1988 },
  { id: "b5", title: "Algebra II Workbook", author: "McGraw-Hill", isbn: "978-0076639908", copies: 20, available: 14, category: "Mathematics", shelfLocation: "MATH-D02", publishedYear: 2015 },
  { id: "b6", title: "English Literature Anthology", author: "Norton", isbn: "978-0393913009", copies: 15, available: 9, category: "English", shelfLocation: "ENG-A03", publishedYear: 2012 },
  { id: "b7", title: "World History: Patterns", author: "Beck et al.", isbn: "978-0133720489", copies: 10, available: 7, category: "History", shelfLocation: "HIS-E11", publishedYear: 2016 },
  { id: "b8", title: "Clean Code", author: "Robert Martin", isbn: "978-0132350884", copies: 6, available: 4, category: "Computer Science", shelfLocation: "CS-A18", publishedYear: 2008 },
  { id: "b9", title: "Calculus: Early Transcendentals", author: "Stewart", isbn: "978-1285741550", copies: 9, available: 6, category: "Mathematics", shelfLocation: "MATH-D09", publishedYear: 2015 },
  { id: "b10", title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", copies: 18, available: 11, category: "Literature", shelfLocation: "LIT-C14", publishedYear: 1925 },
  { id: "b11", title: "Oxford English Dictionary", author: "Oxford Press", isbn: "978-0198611868", copies: 3, available: 2, category: "Reference", shelfLocation: "REF-F01", publishedYear: 2020 },
  { id: "b12", title: "Biology: Life on Earth", author: "Audesirk", isbn: "978-0134160768", copies: 11, available: 8, category: "Science", shelfLocation: "SCI-B15", publishedYear: 2017 },
  { id: "b13", title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0141439518", copies: 14, available: 10, category: "Literature", shelfLocation: "LIT-C22", publishedYear: 1813 },
  { id: "b14", title: "Data Structures in Java", author: "Goodrich", isbn: "978-1118771334", copies: 7, available: 5, category: "Computer Science", shelfLocation: "CS-A25", publishedYear: 2014 },
  { id: "b15", title: "Geometry Essentials", author: "Larson", isbn: "978-0547315171", copies: 16, available: 12, category: "Mathematics", shelfLocation: "MATH-D14", publishedYear: 2011 },
  { id: "b16", title: "African Civilizations", author: "Davidson", isbn: "978-0852551388", copies: 5, available: 4, category: "History", shelfLocation: "HIS-E05", publishedYear: 1991 },
  { id: "b17", title: "Technical Writing Guide", author: "Anderson", isbn: "978-1133607379", copies: 8, available: 6, category: "English", shelfLocation: "ENG-A19", publishedYear: 2013 },
  { id: "b18", title: "Encyclopedia Britannica", author: "Britannica", isbn: "978-1593392925", copies: 2, available: 1, category: "Reference", shelfLocation: "REF-F04", publishedYear: 2019 },
  { id: "b19", title: "Organic Chemistry", author: "Wade", isbn: "978-0321971371", copies: 6, available: 3, category: "Science", shelfLocation: "SCI-B22", publishedYear: 2016 },
  { id: "b20", title: "Hamlet", author: "William Shakespeare", isbn: "978-0743477123", copies: 22, available: 16, category: "English", shelfLocation: "ENG-A28", publishedYear: 1603 },
  { id: "b21", title: "Linear Algebra Done Right", author: "Axler", isbn: "978-3319110790", copies: 4, available: 2, category: "Mathematics", shelfLocation: "MATH-D21", publishedYear: 2015 },
  { id: "b22", title: "The Republic", author: "Plato", isbn: "978-0140455113", copies: 9, available: 7, category: "History", shelfLocation: "HIS-E18", publishedYear: -380 },
];

export const LIBRARIAN_ISSUES: LibraryIssueRecord[] = [
  { id: "is1", bookId: "b1", bookTitle: "Introduction to Algorithms", borrower: "Alex Johnson", borrowerId: "STU-2024-118", borrowerType: "student", issuedDate: "2026-02-20", dueDate: "2026-03-06", status: "overdue" },
  { id: "is2", bookId: "b2", bookTitle: "Physics for Scientists", borrower: "Maya Chen", borrowerId: "STU-2024-042", borrowerType: "student", issuedDate: "2026-02-28", dueDate: "2026-03-14", status: "active" },
  { id: "is3", bookId: "b3", bookTitle: "Things Fall Apart", borrower: "Mr. Adeyemi", borrowerId: "EMP-1042", borrowerType: "staff", issuedDate: "2026-03-01", dueDate: "2026-03-15", status: "active" },
  { id: "is4", bookId: "b5", bookTitle: "Algebra II Workbook", borrower: "Priya Patel", borrowerId: "STU-2024-089", borrowerType: "student", issuedDate: "2026-03-10", dueDate: "2026-03-24", status: "active" },
  { id: "is5", bookId: "b10", bookTitle: "The Great Gatsby", borrower: "Jordan Smith", borrowerId: "STU-2023-201", borrowerType: "student", issuedDate: "2026-01-15", dueDate: "2026-01-29", returnedDate: "2026-01-28", status: "returned" },
  { id: "is6", bookId: "b8", bookTitle: "Clean Code", borrower: "Dr. Mensah", borrowerId: "EMP-0912", borrowerType: "staff", issuedDate: "2026-02-05", dueDate: "2026-02-19", status: "overdue" },
];

export const LIBRARY_STATUS_STYLES = {
  active: "bg-brand-blue/15 text-brand-blue",
  overdue: "bg-destructive/15 text-destructive",
  returned: "bg-green/15 text-green",
} as const;

export function libraryPaths(basePath: string) {
  const root = basePath.replace(/\/$/, "");
  return {
    root,
    books: `${root}/books`,
    booksNew: `${root}/books/new`,
    book: (id: string) => `${root}/books/${id}`,
    issues: `${root}/issues`,
    issuesNew: `${root}/issues/new`,
    issue: (id: string) => `${root}/issues/${id}`,
  };
}
