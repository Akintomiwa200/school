import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError, getPaginationParams, createPaginationMeta } from "@/shared";

export async function GET(request: NextRequest) {
  const { page, limit, search, skip } = getPaginationParams(request.nextUrl.searchParams);

  const where = search
    ? {
        isActive: true,
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { isActive: true };

  const [items, total] = await Promise.all([
    prisma.libraryShopItem.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.libraryShopItem.count({ where }),
  ]);

  const result = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    rating: item.rating,
    icon: item.icon,
    thumbTone: item.thumbTone,
    price: Number(item.price),
    format: item.format,
    bookId: item.bookId,
  }));

  return NextResponse.json(createApiResponse(result, "Shop items loaded", createPaginationMeta(total, page, limit)));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;

  if (!body.title || !body.icon || !body.price) {
    return NextResponse.json(createApiError("validation", "title, icon, and price are required"), { status: 400 });
  }

  const existing = await prisma.libraryShopItem.findFirst({
    where: { title: String(body.title) },
  });
  if (existing) {
    return NextResponse.json(createApiError("duplicate", "A shop item with this title already exists"), { status: 409 });
  }

  const item = await prisma.libraryShopItem.create({
    data: {
      title: String(body.title),
      description: body.description ? String(body.description) : null,
      rating: body.rating ? Number(body.rating) : 0,
      icon: String(body.icon),
      thumbTone: body.thumbTone ? String(body.thumbTone) : "from-muted/30 to-muted/50",
      price: Number(body.price),
      format: body.format ? String(body.format) : "digital",
      bookId: body.bookId ? String(body.bookId) : null,
    },
  });

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
    }, "Shop item created"),
    { status: 201 },
  );
}
