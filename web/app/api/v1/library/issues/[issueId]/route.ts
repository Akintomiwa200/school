import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse } from "@/shared";

type RouteContext = { params: Promise<{ issueId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { issueId } = await context.params;
  const issue = await prisma.libraryIssue.findUnique({
    where: { id: issueId },
    include: {
      book: { select: { title: true } },
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  if (!issue) {
    return NextResponse.json(createApiError("not_found", "Issue not found"), { status: 404 });
  }

  const now = new Date();
  let status: "active" | "overdue" | "returned" = "active";
  if (issue.returnedAt) status = "returned";
  else if (issue.dueDate < now) status = "overdue";

  return NextResponse.json(
    createApiResponse({
      id: issue.id,
      bookId: issue.bookId,
      bookTitle: issue.book?.title ?? issue.bookId,
      borrower: issue.borrower ?? (issue.student ? `${issue.student.user.firstName} ${issue.student.user.lastName}` : "Unknown"),
      borrowerId: issue.borrowerId ?? issue.studentId ?? "",
      borrowerType: issue.borrowerType ?? "student",
      issuedDate: issue.issuedAt.toISOString().split("T")[0],
      dueDate: issue.dueDate.toISOString().split("T")[0],
      returnedDate: issue.returnedAt?.toISOString().split("T")[0],
      status,
    }, "Issue loaded"),
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { issueId } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;

  if (body.action !== "return") {
    return NextResponse.json(createApiError("bad_request", "Unsupported action"), { status: 400 });
  }

  const issue = await prisma.libraryIssue.findUnique({ where: { id: issueId } });
  if (!issue || issue.returnedAt) {
    return NextResponse.json(createApiError("not_found", "Issue not found or already returned"), { status: 404 });
  }

  const book = await prisma.book.findUnique({ where: { id: issue.bookId } });

  const [updated] = await prisma.$transaction([
    prisma.libraryIssue.update({
      where: { id: issueId },
      data: { returnedAt: new Date() },
    }),
    ...(book
      ? [
          prisma.book.update({
            where: { id: issue.bookId },
            data: { available: Math.min(book.quantity, book.available + 1) },
          }),
        ]
      : []),
  ]);

  return NextResponse.json(
    createApiResponse({
      id: updated.id,
      bookId: updated.bookId,
      returnedDate: updated.returnedAt?.toISOString().split("T")[0],
      status: "returned",
    }, "Book returned"),
  );
}
