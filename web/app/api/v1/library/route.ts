import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse } from "@/shared";

export async function GET() {
  const [books, issues] = await Promise.all([
    prisma.book.findMany({ where: { isActive: true } }),
    prisma.libraryIssue.findMany({
      include: { book: { select: { title: true } }, student: { include: { user: { select: { firstName: true, lastName: true } } } } },
    }),
  ]);

  const now = new Date();
  const enrichedIssues = issues.map((i) => {
    let status: "active" | "overdue" | "returned" = "active";
    if (i.returnedAt) status = "returned";
    else if (i.dueDate < now) status = "overdue";
    return {
      id: i.id,
      bookId: i.bookId,
      bookTitle: i.book?.title ?? i.bookId,
      borrower: i.borrower ?? (i.student ? `${i.student.user.firstName} ${i.student.user.lastName}` : "Unknown"),
      borrowerId: i.borrowerId ?? i.studentId ?? "",
      borrowerType: (i.borrowerType as "student" | "staff") ?? "student",
      issuedDate: i.issuedAt.toISOString().split("T")[0],
      dueDate: i.dueDate.toISOString().split("T")[0],
      returnedDate: i.returnedAt?.toISOString().split("T")[0],
      status,
    };
  });

  const activeIssues = enrichedIssues.filter((i) => i.status !== "returned");

  return NextResponse.json(
    createApiResponse(
      {
        books: books.map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          isbn: b.isbn ?? "",
          category: b.category ?? "",
          copies: b.quantity,
          available: b.available,
          shelfLocation: b.shelfLocation ?? "",
          publishedYear: b.createdAt.getFullYear(),
        })),
        issues: enrichedIssues,
        stats: {
          totalBooks: books.reduce((sum, b) => sum + b.quantity, 0),
          catalogTitles: books.length,
          issued: activeIssues.length,
          overdue: enrichedIssues.filter((i) => i.status === "overdue").length,
          available: books.reduce((sum, b) => sum + b.available, 0),
        },
      },
      "Library data loaded",
    ),
  );
}
