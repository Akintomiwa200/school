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

    const books = await prisma.book.findMany({
      where: { isActive: true },
      include: { _count: { select: { chapters: true } } },
      orderBy: { createdAt: "desc" },
    });

    const result = books.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      category: b.category,
      description: b.description,
      coverImage: b.coverImage,
      coverTone: b.coverTone,
      access: b.bookAccess,
      price: b.price ? Number(b.price) : null,
      format: b.format,
      pages: b.pages,
      chapterCount: b._count.chapters,
      quantity: b.quantity,
      available: b.available,
    }));

    return NextResponse.json(createApiResponse(result, "Library books loaded"));
  } catch (error) {
    return NextResponse.json(
      createApiError("library_error", error instanceof Error ? error.message : "Failed to load books"),
      { status: 500 },
    );
  }
}
