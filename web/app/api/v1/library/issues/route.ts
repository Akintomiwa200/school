import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError, getPaginationParams, createPaginationMeta } from "@/shared";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function GET(request: NextRequest) {
  const { page, limit, search, skip } = getPaginationParams(request.nextUrl.searchParams);

  const where = search
    ? {
        OR: [
          { book: { title: { contains: search, mode: "insensitive" as const } } },
          { borrower: { contains: search, mode: "insensitive" as const } },
          { borrowerId: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const now = new Date();
  const [issues, total] = await Promise.all([
    prisma.libraryIssue.findMany({
      where,
      include: {
        book: { select: { title: true } },
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { issuedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.libraryIssue.count({ where }),
  ]);

  const result = issues.map((i) => {
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

  return NextResponse.json(createApiResponse(result, "Issues loaded", createPaginationMeta(total, page, limit)));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  if (!body.bookId || !body.borrower || !body.borrowerId || !body.borrowerType) {
    return NextResponse.json(createApiError("validation", "Missing required fields"), { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: String(body.bookId) } });
  if (!book || book.available <= 0) {
    return NextResponse.json(createApiError("unavailable", "Book unavailable"), { status: 400 });
  }

  const dueDate = body.dueDate
    ? new Date(String(body.dueDate))
    : addDays(new Date(), 14);

  const [issue] = await prisma.$transaction([
    prisma.libraryIssue.create({
      data: {
        bookId: String(body.bookId),
        borrower: String(body.borrower),
        borrowerId: String(body.borrowerId),
        borrowerType: String(body.borrowerType),
        issuedAt: new Date(),
        dueDate,
      },
    }),
    prisma.book.update({
      where: { id: String(body.bookId) },
      data: { available: book.available - 1 },
    }),
  ]);

  return NextResponse.json(
    createApiResponse({
      id: issue.id,
      bookId: issue.bookId,
      bookTitle: book.title,
      borrower: issue.borrower,
      borrowerId: issue.borrowerId,
      borrowerType: issue.borrowerType,
      issuedDate: issue.issuedAt.toISOString().split("T")[0],
      dueDate: issue.dueDate.toISOString().split("T")[0],
      status: "active",
    }, "Book issued"),
    { status: 201 },
  );
}
