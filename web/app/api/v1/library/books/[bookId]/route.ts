import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getBookById, getIssuesForBook, updateBook } from "@/lib/api/library-entity-store";
import type { LibraryBookRecord } from "@/components/dashboard/librarian/librarian-data";

type RouteContext = { params: Promise<{ bookId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { bookId } = await context.params;
  const book = getBookById(bookId);
  if (!book) {
    return NextResponse.json(createApiError("not_found", "Book not found"), { status: 404 });
  }
  const includeIssues = request.nextUrl.searchParams.get("issues") === "1";
  return NextResponse.json(
    createApiResponse(
      includeIssues ? { ...book, activeIssues: getIssuesForBook(bookId) } : book,
      "Book loaded",
    ),
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { bookId } = await context.params;
  const body = (await request.json()) as Partial<LibraryBookRecord>;
  const updated = updateBook(bookId, body);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Book not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(updated, "Book updated"));
}
