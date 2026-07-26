import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== UserRole.STUDENT) {
      return NextResponse.json(createApiError("forbidden", "Student access required"), { status: 403 });
    }

    const { bookId } = await params;

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: { orderBy: { position: "asc" } },
        _count: { select: { issues: true } },
      },
    });

    if (!book) {
      return NextResponse.json(createApiError("not_found", "Book not found"), { status: 404 });
    }

    const result = {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      description: book.description,
      coverImage: book.coverImage,
      coverTone: book.coverTone,
      access: book.bookAccess,
      price: book.price ? Number(book.price) : null,
      format: book.format,
      pages: book.pages,
      shelfLocation: book.shelfLocation,
      chapters: book.chapters.map((c) => ({
        id: c.id,
        title: c.title,
        content: c.content,
        position: c.position,
      })),
    };

    return NextResponse.json(createApiResponse(result, "Book loaded"));
  } catch (error) {
    return NextResponse.json(
      createApiError("library_error", error instanceof Error ? error.message : "Failed to load book"),
      { status: 500 },
    );
  }
}
