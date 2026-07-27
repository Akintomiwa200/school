import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse } from "@/shared";

type RouteContext = { params: Promise<{ itemId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { itemId } = await context.params;
  const item = await prisma.libraryShopItem.findUnique({ where: { id: itemId } });

  if (!item) {
    return NextResponse.json(createApiError("not_found", "Shop item not found"), { status: 404 });
  }

  let linkedBook = null;
  if (item.bookId) {
    const book = await prisma.book.findUnique({
      where: { id: item.bookId },
      select: { id: true, title: true, coverImage: true, coverTone: true },
    });
    linkedBook = book;
  }

  return NextResponse.json(
    createApiResponse({
      id: item.id,
      title: item.title,
      description: item.description,
      rating: item.rating,
      icon: item.icon,
      thumbTone: item.thumbTone,
      price: Number(item.price),
      format: item.format,
      bookId: item.bookId,
      linkedBook,
    }, "Shop item loaded"),
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { itemId } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;

  const existing = await prisma.libraryShopItem.findUnique({ where: { id: itemId } });
  if (!existing) {
    return NextResponse.json(createApiError("not_found", "Shop item not found"), { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = String(body.title);
  if (body.description !== undefined) data.description = body.description ? String(body.description) : null;
  if (body.rating !== undefined) data.rating = Number(body.rating);
  if (body.icon !== undefined) data.icon = String(body.icon);
  if (body.thumbTone !== undefined) data.thumbTone = String(body.thumbTone);
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.format !== undefined) data.format = String(body.format);
  if (body.bookId !== undefined) data.bookId = body.bookId ? String(body.bookId) : null;
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  const updated = await prisma.libraryShopItem.update({ where: { id: itemId }, data });

  return NextResponse.json(
    createApiResponse({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      rating: updated.rating,
      icon: updated.icon,
      thumbTone: updated.thumbTone,
      price: Number(updated.price),
      format: updated.format,
      bookId: updated.bookId,
    }, "Shop item updated"),
  );
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { itemId } = await context.params;
  const existing = await prisma.libraryShopItem.findUnique({ where: { id: itemId } });
  if (!existing) {
    return NextResponse.json(createApiError("not_found", "Shop item not found"), { status: 404 });
  }

  await prisma.libraryShopItem.update({ where: { id: itemId }, data: { isActive: false } });
  return NextResponse.json(createApiResponse({ id: itemId }, "Shop item deactivated"));
}
