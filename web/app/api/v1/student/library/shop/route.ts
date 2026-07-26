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

    const items = await prisma.libraryShopItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const result = items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      rating: Number(item.rating),
      icon: item.icon,
      thumbTone: item.thumbTone,
      price: Number(item.price),
      format: item.format,
      bookId: item.bookId,
    }));

    return NextResponse.json(createApiResponse(result, "Shop items loaded"));
  } catch (error) {
    return NextResponse.json(
      createApiError("shop_error", error instanceof Error ? error.message : "Failed to load shop items"),
      { status: 500 },
    );
  }
}
