import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getSuperAdminContext } from "@/lib/api/super-admin-helpers";
import { requireAuth } from "@/lib/auth";
import { UserRole } from "@/shared";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json(createApiError("unauthorized", "Unauthorized"), { status: 401 });
  }

  const settings = await prisma.schoolSettings.findMany();

  const result: Record<string, unknown> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }

  return NextResponse.json(createApiResponse(result, "Settings loaded"));
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN) {
      return NextResponse.json(createApiError("forbidden", "Forbidden"), { status: 403 });
    }
  } catch {
    return NextResponse.json(createApiError("unauthorized", "Unauthorized"), { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  const updates = Object.entries(body).map(async ([key, value]) => {
    return prisma.schoolSettings.upsert({
      where: { key },
      create: { key, value: value as never },
      update: { value: value as never },
    });
  });

  await Promise.all(updates);

  return NextResponse.json(createApiResponse(body, "Settings saved"));
}
