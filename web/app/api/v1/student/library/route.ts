import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== UserRole.STUDENT) {
      return NextResponse.json(createApiError("forbidden", "Student access required"), { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(createApiError("not_found", "Student profile not found"), { status: 404 });
    }

    const [issues, availableBooks] = await Promise.all([
      prisma.libraryIssue.findMany({
        where: { studentId: student.id },
        include: { book: true },
        orderBy: { issuedAt: "desc" },
      }),
      prisma.book.findMany({
        where: { available: { gt: 0 } },
        orderBy: { title: "asc" },
        take: 50,
      }),
    ]);

    const myBooks = issues.map((issue) => ({
      id: issue.id,
      bookTitle: issue.book.title,
      author: issue.book.author,
      isbn: issue.book.isbn,
      issuedAt: issue.issuedAt,
      dueDate: issue.dueDate,
      returnedAt: issue.returnedAt,
      fine: issue.fine ? Number(issue.fine) : null,
      isReturned: !!issue.returnedAt,
      isOverdue: !issue.returnedAt && new Date(issue.dueDate) < new Date(),
    }));

    const books = availableBooks.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      category: b.category,
      available: b.available,
      quantity: b.quantity,
      shelfLocation: b.shelfLocation,
    }));

    return NextResponse.json(
      createApiResponse({ myBooks, availableBooks: books }, "Student library loaded"),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("library_error", error instanceof Error ? error.message : "Failed to load library"),
      { status: 500 },
    );
  }
}
