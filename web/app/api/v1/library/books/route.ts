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
          { author: { contains: search, mode: "insensitive" as const } },
          { isbn: { contains: search, mode: "insensitive" as const } },
          { category: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { isActive: true };

  const [books, total] = await Promise.all([
    prisma.book.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.book.count({ where }),
  ]);

  const result = books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    isbn: b.isbn ?? "",
    category: b.category ?? "",
    copies: b.quantity,
    available: b.available,
    shelfLocation: b.shelfLocation ?? "",
    publishedYear: b.createdAt.getFullYear(),
  }));

  return NextResponse.json(createApiResponse(result, "Books loaded", createPaginationMeta(total, page, limit)));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;

  if (!body.title || !body.author || !body.isbn || !body.category || !body.copies) {
    return NextResponse.json(createApiError("validation", "Missing required fields"), { status: 400 });
  }

  const book = await prisma.book.create({
    data: {
      title: String(body.title),
      author: String(body.author),
      isbn: String(body.isbn),
      category: String(body.category),
      description: body.description ? String(body.description) : null,
      coverImage: body.coverImage ? String(body.coverImage) : null,
      coverTone: body.coverTone ? String(body.coverTone) : null,
      bookAccess: body.bookAccess ? String(body.bookAccess) : "free",
      price: body.price ? Number(body.price) : null,
      format: body.format ? String(body.format) : "eBook",
      pages: body.pages ? Number(body.pages) : 0,
      quantity: Number(body.copies),
      available: Number(body.copies),
      shelfLocation: body.shelfLocation ? String(body.shelfLocation) : "TBD",
    },
  });

  return NextResponse.json(
    createApiResponse({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn ?? "",
      category: book.category ?? "",
      copies: book.quantity,
      available: book.available,
      shelfLocation: book.shelfLocation ?? "",
      publishedYear: book.createdAt.getFullYear(),
    }, "Book created"),
    { status: 201 },
  );
}
