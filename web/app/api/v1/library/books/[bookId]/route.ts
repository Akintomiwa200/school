import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse } from "@/shared";

type RouteContext = { params: Promise<{ bookId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { bookId } = await context.params;
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { _count: { select: { issues: true } } },
  });

  if (!book) {
    return NextResponse.json(createApiError("not_found", "Book not found"), { status: 404 });
  }

  const includeIssues = request.nextUrl.searchParams.get("issues") === "1";

  let activeIssues: {
    id: string;
    bookId: string;
    bookTitle: string;
    borrower: string;
    borrowerId: string;
    borrowerType: string;
    issuedDate: string;
    dueDate: string;
    returnedDate?: string;
    status: string;
  }[] = [];

  if (includeIssues) {
    const now = new Date();
    const issues = await prisma.libraryIssue.findMany({
      where: { bookId },
      include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { issuedAt: "desc" },
    });

    activeIssues = issues.map((i) => {
      let status: "active" | "overdue" | "returned" = "active";
      if (i.returnedAt) status = "returned";
      else if (i.dueDate < now) status = "overdue";
      return {
        id: i.id,
        bookId: i.bookId,
        bookTitle: book.title,
        borrower: i.borrower ?? (i.student ? `${i.student.user.firstName} ${i.student.user.lastName}` : "Unknown"),
        borrowerId: i.borrowerId ?? i.studentId ?? "",
        borrowerType: i.borrowerType ?? "student",
        issuedDate: i.issuedAt.toISOString().split("T")[0],
        dueDate: i.dueDate.toISOString().split("T")[0],
        returnedDate: i.returnedAt?.toISOString().split("T")[0],
        status,
      };
    }).filter((i) => i.status !== "returned");
  }

  return NextResponse.json(
    createApiResponse(
      {
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn ?? "",
        category: book.category ?? "",
        copies: book.quantity,
        available: book.available,
        shelfLocation: book.shelfLocation ?? "",
        publishedYear: book.createdAt.getFullYear(),
        ...(includeIssues ? { activeIssues } : {}),
      },
      "Book loaded",
    ),
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { bookId } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;

  const existing = await prisma.book.findUnique({ where: { id: bookId } });
  if (!existing) {
    return NextResponse.json(createApiError("not_found", "Book not found"), { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = String(body.title);
  if (body.author !== undefined) data.author = String(body.author);
  if (body.isbn !== undefined) data.isbn = String(body.isbn);
  if (body.category !== undefined) data.category = String(body.category);
  if (body.description !== undefined) data.description = body.description ? String(body.description) : null;
  if (body.coverImage !== undefined) data.coverImage = body.coverImage ? String(body.coverImage) : null;
  if (body.coverTone !== undefined) data.coverTone = body.coverTone ? String(body.coverTone) : null;
  if (body.bookAccess !== undefined) data.bookAccess = String(body.bookAccess);
  if (body.price !== undefined) data.price = body.price ? Number(body.price) : null;
  if (body.format !== undefined) data.format = String(body.format);
  if (body.pages !== undefined) data.pages = Number(body.pages);
  if (body.shelfLocation !== undefined) data.shelfLocation = String(body.shelfLocation);

  if (body.copies !== undefined) {
    const newCopies = Number(body.copies);
    const delta = newCopies - existing.quantity;
    data.quantity = newCopies;
    data.available = Math.max(0, existing.available + delta);
  }

  const updated = await prisma.book.update({ where: { id: bookId }, data });

  return NextResponse.json(
    createApiResponse({
      id: updated.id,
      title: updated.title,
      author: updated.author,
      isbn: updated.isbn ?? "",
      category: updated.category ?? "",
      copies: updated.quantity,
      available: updated.available,
      shelfLocation: updated.shelfLocation ?? "",
      publishedYear: updated.createdAt.getFullYear(),
    }, "Book updated"),
  );
}
