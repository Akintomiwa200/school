import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== UserRole.STUDENT) {
      return NextResponse.json(createApiError("forbidden", "Student access required"), { status: 403 });
    }

    const { itemId } = await params;

    const item = await prisma.libraryShopItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(createApiError("not_found", "Shop item not found"), { status: 404 });
    }

    let linkedBook = null;
    if (item.bookId) {
      const book = await prisma.book.findUnique({
        where: { id: item.bookId },
        select: { id: true, title: true, coverImage: true, coverTone: true },
      });
      if (book) {
        linkedBook = { id: book.id, title: book.title, coverImage: book.coverImage, coverTone: book.coverTone };
      }
    }

    const result = {
      id: item.id,
      title: item.title,
      description: item.description,
      rating: Number(item.rating),
      icon: item.icon,
      thumbTone: item.thumbTone,
      price: Number(item.price),
      format: item.format,
      bookId: item.bookId,
      linkedBook,
    };

    return NextResponse.json(createApiResponse(result, "Shop item loaded"));
  } catch (error) {
    return NextResponse.json(
      createApiError("shop_error", error instanceof Error ? error.message : "Failed to load shop item"),
      { status: 500 },
    );
  }
}
